import { useState, useEffect, useRef, useCallback } from 'react';
import { getCurrencies, convert } from '../services/frankFurterService';

const MAX_AMOUNT = 1_000_000_000;
const MAX_HISTORY = 20;
const MAX_FAVORITES = 20;
const CACHE_TTL = 60000;

const AMOUNT_DEBOUNCE = 1000;
const CURRENCY_DEBOUNCE = 500;

const STORAGE_KEYS = {
  history: 'currency_history',
  favorites: 'currency_favorites',
};

export interface HistoryEntry {
  id: number;
  amount: number;
  from: string;
  to: string;
  result: number;
  date: string;
}

export interface FavoriteEntry {
  id: number;
  from: string;
  to: string;
}

interface CacheEntry {
  result: number;
  timestamp: number;
}

// ─── VALIDAÇÃO ───────────────────────────────────────────────────

function validateAmount(amount: number | string): string | null {
  if (amount === '' || amount === null || amount === undefined)
    return 'Digite um valor.';
  if (isNaN(Number(amount)))
    return 'O valor deve ser um número válido.';
  if (Number(amount) <= 0)
    return 'O valor deve ser maior que zero.';
  if (Number(amount) > MAX_AMOUNT)
    return 'O valor não pode ultrapassar 1.000.000.000.';
  return null;
}

// Valida se uma entrada do localStorage é um HistoryEntry legítimo
function isValidHistoryEntry(entry: unknown): entry is HistoryEntry {
  if (typeof entry !== 'object' || entry === null) return false;
  const e = entry as Record<string, unknown>;
  return (
    typeof e.id === 'number' &&
    typeof e.amount === 'number' && e.amount > 0 && e.amount <= MAX_AMOUNT &&
    typeof e.from === 'string' && /^[A-Z]{3}$/.test(e.from) &&
    typeof e.to === 'string' && /^[A-Z]{3}$/.test(e.to) &&
    typeof e.result === 'number' && e.result > 0 &&
    typeof e.date === 'string' && e.date.length <= 30
  );
}

// Valida se uma entrada do localStorage é um FavoriteEntry legítimo
function isValidFavoriteEntry(entry: unknown): entry is FavoriteEntry {
  if (typeof entry !== 'object' || entry === null) return false;
  const e = entry as Record<string, unknown>;
  return (
    typeof e.id === 'number' &&
    typeof e.from === 'string' && /^[A-Z]{3}$/.test(e.from) &&
    typeof e.to === 'string' && /^[A-Z]{3}$/.test(e.to)
  );
}

// ─── LOCALSTORAGE ────────────────────────────────────────────────

function loadFromStorage<T>(
  key: string,
  fallback: T,
  validator?: (item: unknown) => item is T extends Array<infer U> ? U : never
): T {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return fallback;

    const parsed = JSON.parse(stored);

    // Valida arrays com o validator fornecido
    if (validator && Array.isArray(parsed)) {
      return parsed.filter(validator).slice(0, 20) as T;
    }

    return parsed;
  } catch {
    // Remove entrada corrompida do localStorage
    localStorage.removeItem(key);
    return fallback;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    const serialized = JSON.stringify(value);
    // Evita salvar strings muito grandes (proteção contra data injection)
    if (serialized.length > 50000) {
      console.warn('Dados muito grandes para salvar no localStorage.');
      return;
    }
    localStorage.setItem(key, serialized);
  } catch {
    console.warn('Erro ao salvar no localStorage.');
  }
}

function addToHistory(
  prev: HistoryEntry[],
  entry: Omit<HistoryEntry, 'id' | 'date'>
): HistoryEntry[] {
  const newEntry: HistoryEntry = {
    ...entry,
    id: Date.now(),
    date: new Date().toLocaleString('pt-BR'),
  };
  return [newEntry, ...prev].slice(0, MAX_HISTORY);
}

// ─── HOOK ────────────────────────────────────────────────────────

export function useCurrencyConverter() {
  const [currencies, setCurrencies] = useState<Record<string, string>>({});
  const [amount, setAmount] = useState<number | string>(1);
  const [from, setFrom] = useState<string>('USD');
  const [to, setTo] = useState<string>('BRL');
  const [result, setResult] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [history, setHistory] = useState<HistoryEntry[]>(() =>
    loadFromStorage<HistoryEntry[]>(STORAGE_KEYS.history, [], isValidHistoryEntry)
  );
  const [favorites, setFavorites] = useState<FavoriteEntry[]>(() =>
    loadFromStorage<FavoriteEntry[]>(STORAGE_KEYS.favorites, [], isValidFavoriteEntry)
  );

  const cacheRef = useRef<Record<string, CacheEntry>>({});
  const amountDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currencyDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Carrega moedas
  useEffect(() => {
    getCurrencies()
      .then(setCurrencies)
      .catch((err: Error) => {
        if (err.name !== 'AbortError') {
          setError(err?.message || 'Erro ao buscar moedas.');
        }
      });
  }, []);

  // Persiste no localStorage
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.history, history);
  }, [history]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.favorites, favorites);
  }, [favorites]);

  // Auto-conversão ao trocar MOEDA — debounce 500ms
  useEffect(() => {
    if (Object.keys(currencies).length === 0) return;
    if (currencyDebounceRef.current) clearTimeout(currencyDebounceRef.current);

    currencyDebounceRef.current = setTimeout(() => {
      if (!validateAmount(amount)) {
        performConvert(Number(amount), from, to, true);
      }
    }, CURRENCY_DEBOUNCE);

    return () => {
      if (currencyDebounceRef.current) clearTimeout(currencyDebounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, to]);

  // Auto-conversão ao digitar VALOR — debounce 1000ms
  useEffect(() => {
    if (Object.keys(currencies).length === 0) return;
    if (amountDebounceRef.current) clearTimeout(amountDebounceRef.current);

    amountDebounceRef.current = setTimeout(() => {
      if (!validateAmount(amount)) {
        performConvert(Number(amount), from, to, false);
      }
    }, AMOUNT_DEBOUNCE);

    return () => {
      if (amountDebounceRef.current) clearTimeout(amountDebounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amount]);

  const performConvert = useCallback(async (
    amt: number,
    fromCurrency: string,
    toCurrency: string,
    saveToHistory: boolean = true
  ): Promise<void> => {
    setError(null);

    const cacheKey = `${amt}-${fromCurrency}-${toCurrency}`;
    const cached = cacheRef.current[cacheKey];
    const now = Date.now();

    if (cached && now - cached.timestamp < CACHE_TTL) {
      setResult(cached.result);
      if (saveToHistory) {
        setHistory(prev => addToHistory(prev, {
          amount: amt, from: fromCurrency, to: toCurrency, result: cached.result
        }));
      }
      return;
    }

    setLoading(true);

    try {
      const data = await convert(amt, fromCurrency, toCurrency);
      const convertedValue = data.rates[toCurrency];

      cacheRef.current[cacheKey] = { result: convertedValue, timestamp: now };
      setResult(convertedValue);

      if (saveToHistory) {
        setHistory(prev => addToHistory(prev, {
          amount: amt, from: fromCurrency, to: toCurrency, result: convertedValue
        }));
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return;
      if (err instanceof Error) {
        setError(err.message || 'Erro ao converter.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const handleConvert = async (): Promise<void> => {
    const validationError = validateAmount(amount);
    if (validationError) {
      setError(validationError);
      return;
    }
    await performConvert(Number(amount), from, to, true);
  };

  const isFavorite = favorites.some(f => f.from === from && f.to === to);

  const toggleFavorite = (): void => {
    if (isFavorite) {
      setFavorites(prev => prev.filter(f => !(f.from === from && f.to === to)));
    } else {
      if (favorites.length >= MAX_FAVORITES) {
        setError(`Limite de ${MAX_FAVORITES} favoritos atingido.`);
        return;
      }
      setFavorites(prev => [...prev, { id: Date.now(), from, to }]);
    }
  };

  const applyFavorite = (fav: FavoriteEntry): void => {
    setFrom(fav.from);
    setTo(fav.to);
    setResult(null);
  };

  const removeFavorite = (id: number): void => {
    setFavorites(prev => prev.filter(f => f.id !== id));
  };

  const clearFavorites = (): void => {
    setFavorites([]);
    localStorage.removeItem(STORAGE_KEYS.favorites);
  };

  const clearHistory = (): void => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEYS.history);
  };

  const removeHistory = (id: number): void => {
    setHistory(prev => prev.filter(h => h.id !== id));
  };

  return {
    currencies, amount, setAmount,
    from, setFrom, to, setTo,
    result, loading, error,
    history, clearHistory, removeHistory,
    favorites, isFavorite, toggleFavorite, applyFavorite,
    removeFavorite, clearFavorites, handleConvert,
  };
}
