import { renderHook, act, waitFor } from '@testing-library/react';
import { useCurrencyConverter } from '../hooks/useCurrencyConverter';

beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => { });
});

afterAll(() => {
    (console.error as jest.Mock).mockRestore();
});

jest.mock('../services/frankFurterService', () => ({
    getCurrencies: jest.fn(),
    convert: jest.fn(),
}));

import { getCurrencies, convert } from '../services/frankFurterService';

const mockGetCurrencies = getCurrencies as jest.Mock;
const mockConvert = convert as jest.Mock;

const mockCurrencies = {
    USD: 'United States Dollar',
    BRL: 'Brazilian Real',
    EUR: 'Euro',
};

beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    jest.useFakeTimers();
    mockGetCurrencies.mockResolvedValue(mockCurrencies);
    mockConvert.mockResolvedValue({ rates: { BRL: 5.87 } });
});

afterEach(() => {
    jest.useRealTimers();
});

// Helper para aguardar moedas carregarem e limpar debounces pendentes
async function setupHook() {
    const hook = renderHook(() => useCurrencyConverter());
    await waitFor(() => expect(hook.result.current.currencies).toEqual(mockCurrencies));
    // Avança timers para limpar debounces pendentes da inicialização
    await act(async () => { jest.runAllTimers(); });
    jest.clearAllMocks();
    return hook;
}

describe('useCurrencyConverter — inicialização', () => {
    test('deve carregar as moedas ao inicializar', async () => {
        const { result } = renderHook(() => useCurrencyConverter());
        await waitFor(() => expect(result.current.currencies).toEqual(mockCurrencies));
    });

    test('deve iniciar com USD como moeda de origem e BRL como destino', () => {
        const { result } = renderHook(() => useCurrencyConverter());
        expect(result.current.from).toBe('USD');
        expect(result.current.to).toBe('BRL');
    });

    test('deve iniciar com amount igual a 1', () => {
        const { result } = renderHook(() => useCurrencyConverter());
        expect(result.current.amount).toBe(1);
    });

    test('deve iniciar sem resultado', () => {
        const { result } = renderHook(() => useCurrencyConverter());
        expect(result.current.result).toBeNull();
    });
});

describe('useCurrencyConverter — conversão', () => {
    test('deve converter e retornar o resultado correto', async () => {
        const { result } = await setupHook();

        await act(async () => { await result.current.handleConvert(); });

        expect(result.current.result).toBe(5.87);
        expect(result.current.error).toBeNull();
    });

    test('deve mostrar erro ao converter com valor vazio', async () => {
        const { result } = await setupHook();

        await act(async () => {
            result.current.setAmount('');
        });
        await act(async () => {
            await result.current.handleConvert();
        });

        expect(result.current.error).toBe('Digite um valor.');
    });

    test('deve mostrar erro ao converter com valor negativo', async () => {
        const { result } = await setupHook();

        await act(async () => { result.current.setAmount(-1); });
        await act(async () => { await result.current.handleConvert(); });

        expect(result.current.error).toBe('O valor deve ser maior que zero.');
    });

    test('deve mostrar erro ao converter com valor acima do limite', async () => {
        const { result } = await setupHook();

        await act(async () => { result.current.setAmount(2_000_000_000); });
        await act(async () => { await result.current.handleConvert(); });

        expect(result.current.error).toBe('O valor não pode ultrapassar 1.000.000.000.');
    });

    test('deve mostrar erro quando a API falhar', async () => {
        mockConvert.mockRejectedValue(new Error('Conversão não suportada.'));
        const { result } = await setupHook();

        await act(async () => { await result.current.handleConvert(); });

        expect(result.current.error).toBe('Conversão não suportada.');
    });
});

describe('useCurrencyConverter — cache', () => {
    test('não deve fazer nova requisição se o resultado estiver em cache', async () => {
        const { result } = await setupHook();

        await act(async () => { await result.current.handleConvert(); });
        await act(async () => { await result.current.handleConvert(); });

        expect(mockConvert).toHaveBeenCalledTimes(1);
    });
});

describe('useCurrencyConverter — histórico', () => {
    test('deve salvar conversão no histórico', async () => {
        const { result } = await setupHook();

        await act(async () => { await result.current.handleConvert(); });

        expect(result.current.history).toHaveLength(1);
        expect(result.current.history[0].result).toBe(5.87);
    });

    test('deve remover item individual do histórico', async () => {
        const { result } = await setupHook();

        await act(async () => { await result.current.handleConvert(); });
        act(() => { result.current.removeHistory(result.current.history[0].id); });

        expect(result.current.history).toHaveLength(0);
    });

    test('deve limpar todo o histórico', async () => {
        const { result } = await setupHook();

        await act(async () => { await result.current.handleConvert(); });
        act(() => { result.current.clearHistory(); });

        expect(result.current.history).toHaveLength(0);
    });

    test('deve persistir histórico no localStorage', async () => {
        jest.useRealTimers();
        const { result } = renderHook(() => useCurrencyConverter());
        await waitFor(() => expect(result.current.currencies).toEqual(mockCurrencies));

        await act(async () => { await result.current.handleConvert(); });
        await waitFor(() => {
            const saved = JSON.parse(localStorage.getItem('currency_history') || '[]');
            expect(saved).toHaveLength(1);
        });
    });
});

describe('useCurrencyConverter — favoritos', () => {
    test('deve adicionar par aos favoritos', async () => {
        const { result } = await setupHook();

        act(() => { result.current.toggleFavorite(); });

        expect(result.current.favorites).toHaveLength(1);
        expect(result.current.favorites[0].from).toBe('USD');
        expect(result.current.favorites[0].to).toBe('BRL');
        expect(result.current.isFavorite).toBe(true);
    });

    test('deve remover par dos favoritos ao togglear novamente', async () => {
        const { result } = await setupHook();

        act(() => { result.current.toggleFavorite(); });
        act(() => { result.current.toggleFavorite(); });

        expect(result.current.favorites).toHaveLength(0);
        expect(result.current.isFavorite).toBe(false);
    });

    test('deve remover favorito por id', async () => {
        const { result } = await setupHook();

        act(() => { result.current.toggleFavorite(); });
        act(() => { result.current.removeFavorite(result.current.favorites[0].id); });

        expect(result.current.favorites).toHaveLength(0);
    });

    test('deve limpar todos os favoritos', async () => {
        const { result } = await setupHook();

        act(() => { result.current.toggleFavorite(); });
        act(() => { result.current.clearFavorites(); });

        expect(result.current.favorites).toHaveLength(0);
    });

    test('deve aplicar favorito trocando as moedas', async () => {
        const { result } = await setupHook();

        act(() => {
            result.current.applyFavorite({ id: 1, from: 'EUR', to: 'BRL' });
        });

        expect(result.current.from).toBe('EUR');
        expect(result.current.to).toBe('BRL');
    });
});
