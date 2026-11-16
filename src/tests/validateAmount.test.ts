function validateAmount(amount: number | string | null | undefined): string | null {
  if (amount === '' || amount === null || amount === undefined)
    return 'Digite um valor.';
  if (isNaN(Number(amount)))
    return 'O valor deve ser um número válido.';
  if (Number(amount) <= 0)
    return 'O valor deve ser maior que zero.';
  if (Number(amount) > 1_000_000_000)
    return 'O valor não pode ultrapassar 1.000.000.000.';
  return null;
}

describe('validateAmount', () => {

  // ✅ Casos válidos
  test('deve retornar null para valor válido', () => {
    expect(validateAmount(100)).toBeNull();
  });

  test('deve retornar null para valor decimal', () => {
    expect(validateAmount(0.5)).toBeNull();
  });

  test('deve retornar null para valor string numérico', () => {
    expect(validateAmount('50')).toBeNull();
  });

  // ❌ Casos inválidos
  test('deve retornar erro para valor vazio', () => {
    expect(validateAmount('')).toBe('Digite um valor.');
  });

  test('deve retornar erro para valor null', () => {
    expect(validateAmount(null)).toBe('Digite um valor.');
  });

  test('deve retornar erro para valor undefined', () => {
    expect(validateAmount(undefined)).toBe('Digite um valor.');
  });

  test('deve retornar erro para valor não numérico', () => {
    expect(validateAmount('abc')).toBe('O valor deve ser um número válido.');
  });

  test('deve retornar erro para valor zero', () => {
    expect(validateAmount(0)).toBe('O valor deve ser maior que zero.');
  });

  test('deve retornar erro para valor negativo', () => {
    expect(validateAmount(-1)).toBe('O valor deve ser maior que zero.');
  });

  test('deve retornar erro para valor acima do limite', () => {
    expect(validateAmount(1_000_000_001)).toBe('O valor não pode ultrapassar 1.000.000.000.');
  });

  test('deve retornar null para valor exatamente no limite', () => {
    expect(validateAmount(1_000_000_000)).toBeNull();
  });
});
