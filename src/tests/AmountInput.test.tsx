import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AmountInput from '../components/AmountInput';

function renderAmountInput(value: number | string = 1, onChange = jest.fn()) {
  render(<AmountInput value={value} onChange={onChange} />);
  return { input: screen.getByPlaceholderText(/digite o valor/i), onChange };
}

describe('AmountInput — renderização', () => {
  test('deve renderizar o campo de valor', () => {
    const { input } = renderAmountInput();
    expect(input).toBeInTheDocument();
  });

  test('deve renderizar o label corretamente', () => {
    renderAmountInput();
    expect(screen.getByLabelText(/valor/i)).toBeInTheDocument();
  });

  test('deve exibir o valor inicial', () => {
    renderAmountInput(100);
    expect(screen.getByPlaceholderText(/digite o valor/i)).toHaveValue(100);
  });
});

describe('AmountInput — sanitização de input', () => {
  test('deve chamar onChange ao digitar um número', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<AmountInput value="" onChange={onChange} />);
    const input = screen.getByPlaceholderText(/digite o valor/i);

    await user.type(input, '5');
    expect(onChange).toHaveBeenCalled();
  });

  test('deve bloquear letras no campo de valor', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<AmountInput value="" onChange={onChange} />);
    const input = screen.getByPlaceholderText(/digite o valor/i);

    await user.type(input, 'abc');
    // onChange não deve ser chamado com letras pois são bloqueadas no keyDown
    const calls = onChange.mock.calls.map(([v]) => v);
    expect(calls.every((v: string) => !/[a-zA-Z]/.test(v))).toBe(true);
  });

  test('deve bloquear o caractere "e" que input type=number aceita por padrão', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<AmountInput value="" onChange={onChange} />);
    const input = screen.getByPlaceholderText(/digite o valor/i);

    await user.type(input, 'e');
    const calls = onChange.mock.calls.map(([v]) => v);
    expect(calls.every((v: string) => !v.includes('e'))).toBe(true);
  });

  test('deve bloquear sinal negativo', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<AmountInput value="" onChange={onChange} />);
    const input = screen.getByPlaceholderText(/digite o valor/i);

    await user.type(input, '-');
    const calls = onChange.mock.calls.map(([v]) => v);
    expect(calls.every((v: string) => !v.includes('-'))).toBe(true);
  });

  test('deve aceitar ponto decimal', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<AmountInput value="" onChange={onChange} />);
    const input = screen.getByPlaceholderText(/digite o valor/i);

    await user.type(input, '1.5');
    expect(onChange).toHaveBeenCalled();
  });
});
