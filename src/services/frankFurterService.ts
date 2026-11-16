const BASE_URL = 'https://api.frankfurter.dev/v1';

export interface ConvertResponse {
  rates: { [code: string]: number };
}

export interface HistoryResponse {
  rates: { [date: string]: { [code: string]: number } };
}

// Cancela requisição anterior se uma nova for feita
let currenciesController: AbortController | null = null;
let convertController: AbortController | null = null;
let historyController: AbortController | null = null;

export const getCurrencies = async (): Promise<Record<string, string>> => {
  if (currenciesController) currenciesController.abort();
  currenciesController = new AbortController();

  const res = await fetch(`${BASE_URL}/currencies`, {
    signal: currenciesController.signal,
  });

  if (!res.ok) throw new Error('Erro ao buscar moedas.');
  return res.json();
};

export const convert = async (
  amount: number | string,
  from: string,
  to: string
): Promise<ConvertResponse> => {
  if (convertController) convertController.abort();
  convertController = new AbortController();

  const res = await fetch(
    `${BASE_URL}/latest?amount=${amount}&from=${from}&to=${to}`,
    { signal: convertController.signal }
  );

  if (!res.ok) throw new Error(`Conversão não suportada para ${from}. Tente outra moeda base.`);
  return res.json();
};

export const getHistory = async (
  from: string,
  to: string,
  days: number
): Promise<HistoryResponse> => {
  if (historyController) historyController.abort();
  historyController = new AbortController();

  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - days);
  const format = (d: Date): string => d.toISOString().split('T')[0];

  const res = await fetch(
    `${BASE_URL}/${format(startDate)}..${format(endDate)}?from=${from}&to=${to}`,
    { signal: historyController.signal }
  );

  if (!res.ok) throw new Error(`Histórico não disponível para ${from}. Tente outra moeda.`);
  return res.json();
};
