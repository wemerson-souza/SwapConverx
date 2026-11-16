import { getCurrencies, convert } from '../services/frankFurterService';

global.fetch = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
});

test('getCurrencies deve retornar um objeto de moedas', async () => {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: true,
    json: async () => ({ USD: 'United States Dollar', BRL: 'Brazilian Real' }),
  });

  const result = await getCurrencies();
  expect(result).toHaveProperty('USD');
  expect(result).toHaveProperty('BRL');
});

test('getCurrencies deve lançar erro se a API falhar', async () => {
  (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false });

  await expect(getCurrencies()).rejects.toThrow('Erro ao buscar moedas.');
});

test('convert deve retornar rates com o valor convertido', async () => {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: true,
    json: async () => ({ rates: { BRL: 5.87 } }),
  });

  const result = await convert(1, 'USD', 'BRL');
  expect(result.rates).toHaveProperty('BRL');
  expect(result.rates['BRL']).toBe(5.87);
});

test('convert deve lançar erro se a conversão não for suportada', async () => {
  (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false });

  await expect(convert(1, 'USD', 'BRL')).rejects.toThrow();
});


// ─── getHistory ───────────────────────────────────────────────────

describe('getHistory', () => {
  const { getHistory } = require('../services/frankFurterService');

  test('deve retornar histórico de taxas formatado', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        rates: {
          '2024-01-01': { BRL: 4.97 },
          '2024-01-02': { BRL: 5.01 },
        },
      }),
    });

    const result = await getHistory('USD', 'BRL', 7);
    expect(result.rates).toHaveProperty('2024-01-01');
    expect(result.rates['2024-01-01']).toHaveProperty('BRL');
  });

  test('deve lançar erro se o histórico não estiver disponível', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false });

    await expect(getHistory('USD', 'BRL', 7)).rejects.toThrow();
  });

  test('deve ignorar erro de AbortController', async () => {
    const abortError = new Error('AbortError');
    abortError.name = 'AbortError';
    (global.fetch as jest.Mock).mockRejectedValueOnce(abortError);

    await expect(getHistory('USD', 'BRL', 7)).rejects.toMatchObject({
      name: 'AbortError',
    });
  });
});
