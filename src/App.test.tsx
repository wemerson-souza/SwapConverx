import { render, screen } from "@testing-library/react";
import App from "./App";

test("deve renderizar o nome da aplicação", () => {
  render(<App />);
  expect(screen.getByText("SwapConverx")).toBeInTheDocument();
});

test("deve renderizar a tagline da aplicação", () => {
  render(<App />);
  expect(screen.getByText("Taxas de câmbio em tempo real")).toBeInTheDocument();
});

test("deve renderizar o botão de converter", () => {
  render(<App />);
  expect(screen.getByText("Converter")).toBeInTheDocument();
});

test("deve renderizar o botão de histórico", () => {
  render(<App />);
  expect(screen.getByText("Histórico")).toBeInTheDocument();
});

test("deve renderizar o botão de favoritos", () => {
  render(<App />);
  expect(screen.getByText("Favoritos")).toBeInTheDocument();
});

test("deve renderizar o botão de gráfico", () => {
  render(<App />);
  expect(screen.getByText("Gráfico")).toBeInTheDocument();
});

test("deve renderizar o campo de valor", () => {
  render(<App />);
  expect(screen.getByPlaceholderText(/digite o valor/i)).toBeInTheDocument();
});

test("deve renderizar o texto de resultado inicial", () => {
  render(<App />);
  expect(
    screen.getByText(/preencha os campos ao lado e clique em converter/i)
  ).toBeInTheDocument();
});


// ─── userEvent — interações ───────────────────────────────────────

import userEvent from '@testing-library/user-event';

describe('App — interações do usuário', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('deve mostrar erro ao clicar em Converter com campo vazio', async () => {
    const user = userEvent.setup();
    render(<App />);

    const input = screen.getByPlaceholderText(/digite o valor/i);
    await user.clear(input);

    const btn = screen.getByText('Converter');
    await user.click(btn);

    expect(await screen.findByText(/digite um valor/i)).toBeInTheDocument();
  });

  test('deve abrir modal de histórico ao clicar no botão', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByText('Histórico'));
    expect(await screen.findByText('Histórico de Conversões')).toBeInTheDocument();
  });

  test('deve fechar modal de histórico ao clicar no overlay', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByText('Histórico'));
    await screen.findByText('Histórico de Conversões');

    const overlay = document.querySelector('.modal-overlay') as HTMLElement;
    await user.click(overlay);

    expect(screen.queryByText('Histórico de Conversões')).not.toBeInTheDocument();
  });

  test('deve abrir modal de favoritos ao clicar no botão', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByText('Favoritos'));
    expect(await screen.findByText('Seus Favoritos')).toBeInTheDocument();
  });

  test('deve alternar entre modo claro e escuro', async () => {
    const user = userEvent.setup();
    render(<App />);

    const toggle = screen.getByTitle('Alternar tema');
    await user.click(toggle);

    expect(document.documentElement.getAttribute('data-theme')).toBe('light');

    await user.click(toggle);
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });
});
