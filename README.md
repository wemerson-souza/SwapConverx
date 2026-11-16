<div align="center">

  <img src="public/logo.svg" alt="SwapConverx Logo" width="84" height="84" />

  <h1>SwapConverx</h1>

  <p>
    <strong>Aplicação moderna de conversão de moedas e análise cambial em tempo real.</strong><br />
    Desenvolvida com React 19, TypeScript, Recharts e integração à Frankfurter API.
  </p>

  <p>
    <a href="#-funcionalidades">Funcionalidades</a> •
    <a href="#-tecnologias">Tecnologias</a> •
    <a href="#-arquitetura">Arquitetura</a> •
    <a href="#-estrutura-do-projeto">Estrutura</a> •
    <a href="#-como-executar">Como Executar</a> •
    <a href="#-testes">Testes</a> •
    <a href="#-licença">Licença</a>
  </p>

  <p>
    <img src="https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19" />
    <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript 5" />
    <img src="https://img.shields.io/badge/Tests-58%20Passed-2ea44f?style=for-the-badge&logo=jest&logoColor=white" alt="58 Tests Passed" />
    <img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" alt="MIT License" />
  </p>

</div>

---

## Sobre o Projeto

O **SwapConverx** é uma aplicação web frontend de alta performance para consulta e conversão de taxas de câmbio entre mais de 30 moedas globais. 

Projetada com foco em excelência de experiência do usuário (UX), performance e boas práticas de engenharia de software, a aplicação consome a **[Frankfurter API](https://frankfurter.dev/)** (mantida com dados do Banco Central Europeu) sem a necessidade de um backend intermediário, implementando camadas robustas de cache, cancelamento de requisições, resiliência a dados corrompidos no cliente e lazy loading.

---

## Funcionalidades

- **💱 Conversão em Tempo Real**: Taxas atualizadas diretamente pela Frankfurter API.
- **🌍 Mais de 30 Moedas Suportadas**: USD, EUR, BRL, GBP, JPY, CAD, AUD, CHF e muitas outras.
- **⚡ Conversão Automática e Reativa**: Atualização automática ao digitar o valor ou alterar as moedas selecionadas.
- **⏱️ Debounce Inteligente**:
  - `500ms` de espera na troca de moedas.
  - `1000ms` de espera na digitação do valor monetário, economizando chamadas desnecessárias de rede.
- **📈 Gráficos Históricos Interativos**: Modal com visualização da oscilação cambial em 7 ou 30 dias via **Recharts**, com exibição de menor taxa, maior taxa, variação percentual e tooltip customizado.
- **🔄 Inversão Rápida de Moedas (Swap)**: Troca instantânea entre moeda de origem e destino com um clique.
- **⭐ Pares Favoritos**: Salve seus pares de moedas mais utilizados com limite de até 20 itens, persistidos no `localStorage`.
- **📜 Histórico de Conversões**: Registro automático das conversões recentes (até 20 registros) com timestamp formatado, opção de remoção individual e limpeza completa.
- **📋 Copiar com 1 Clique**: Botão para copiar o resultado formatado diretamente para a área de transferência (`Clipboard API`) com feedback visual imediato.
- **🌓 Dark Mode & Light Mode**: Alternância suave de tema visual com controle por variáveis CSS e persistência via atributo `data-theme`.
- **🔍 Dropdowns Pesquisáveis**: Seleção intuitiva de moedas com busca por código ou nome e suporte a estados de carregamento com *skeleton screen*.
- **🛡️ Tratamento e Validação Estrita**:
  - Bloqueio de valores negativos, vazios ou acima de R$ 1 bilhão (`1.000.000.000`).
  - *Type Guards* em tempo de execução para validar a integridade dos dados recuperados do `localStorage`.

---

## Tecnologias

### Core
- **[React 19](https://react.dev/)**: Biblioteca component-based com hooks modernos (`useCallback`, `useMemo`, `useRef`, `lazy`, `Suspense`).
- **[TypeScript 5](https://www.typescriptlang.org/)**: Tipagem estática rigorosa para dados, componentes e contratos da API.
- **CSS3 Moderno**: Variáveis CSS (Custom Properties) para theming dinâmico, animações fluidas e layouts responsivos (Flexbox/Grid).

### Bibliotecas Auxiliares
- **[Lucide React](https://lucide.dev/)**: Pacote moderno e consistente de ícones vetoriais.
- **[Recharts](https://recharts.org/)**: Gráficos responsivos compostos por componentes declarativos (`AreaChart`, `Tooltip`, `ResponsiveContainer`).

### Integração & Otimização
- **[Frankfurter API](https://frankfurter.dev/)**: API pública REST com taxas do BCE.
- **Fetch API & AbortController**: Cancelamento automático de requisições pendentes ao disparar novas ações.
- **Cache em Memória**:
  - Cache de conversões com TTL de 60 segundos.
  - Cache de dados históricos de gráficos com TTL de 5 minutos.

### Testes & Qualidade
- **[Jest](https://jestjs.io/)**: Runner de testes unitários e de integração.
- **[React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)**: Testes focados no comportamento do usuário.
- **`@testing-library/user-event`**: Simulação fidedigna de interações reais do usuário.

---

## Arquitetura e Fluxo de Dados

A aplicação segue uma arquitetura desacoplada e orientada a componentes, mantendo a regra de negócios isolada em um Custom Hook e a comunicação de rede isolada em uma camada de serviço dedicada.

```
┌────────────────────────────────────────────────────────┐
│                   Camada de UI / App                   │
│   (App.tsx, AmountInput, CurrencySelect, ResultDisplay)│
│       Modais com Lazy Loading: History, Favs, Chart    │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│             Hook: useCurrencyConverter                 │
│                                                        │
│  - Gerenciamento de Estado (amount, from, to, result)  │
│  - Debounce de entrada (1000ms valor / 500ms moedas)   │
│  - Cache em Memória com TTL (60s)                      │
│  - Validação de entrada e Type Guards de integridade   │
│  - Sincronização e persistência no LocalStorage        │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│             Serviço: frankFurterService                │
│                                                        │
│  - getCurrencies()                                     │
│  - convert(amount, from, to)                           │
│  - getHistory(from, to, days)                          │
│  - Cancelamento de chamadas via AbortController        │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│             Frankfurter API (REST Endpoint)            │
│                 https://api.frankfurter.dev            │
└────────────────────────────────────────────────────────┘
```

---

## Estrutura do Projeto

```text
currency-convertor-app/
├── public/
│   ├── index.html               # Documento HTML base
│   ├── logo.svg                 # Logotipo do SwapConverx
│   ├── manifest.json            # Manifesto da aplicação
│   └── robots.txt               # Diretivas para indexadores
├── src/
│   ├── components/              # Componentes de interface e estilos modulares
│   │   ├── AmountInput.tsx      # Campo de entrada de valor com validação
│   │   ├── AmountInput.css
│   │   ├── Chart.tsx            # Modal e botão do gráfico Recharts
│   │   ├── Chart.css
│   │   ├── ConversionHistory.tsx# Modal e botão do histórico de conversões
│   │   ├── ConversionHistory.css
│   │   ├── CurrencySelect.tsx   # Dropdown pesquisável de moedas e botão de inversão
│   │   ├── CurrencySelect.css
│   │   ├── Favorites.tsx        # Modal de favoritos e botão de estrela rápida
│   │   ├── Favorites.css
│   │   ├── ResultDisplay.tsx    # Exibição do valor final com botão de cópia
│   │   └── ResultDisplay.css
│   ├── hooks/
│   │   └── useCurrencyConverter.ts # Lógica central, debounce, cache e storage
│   ├── services/
│   │   └── frankFurterService.ts   # Chamadas à API com controle de cancelamento
│   ├── tests/                   # Suítes de testes unitários e de integração
│   │   ├── AmountInput.test.tsx
│   │   ├── frankFurterService.test.ts
│   │   ├── useCurrencyConverter.test.ts
│   │   └── validateAmount.test.ts
│   ├── App.tsx                  # Layout principal, controle de temas e modais
│   ├── App.css                  # Estilos globais e variáveis de tema (dark/light)
│   ├── App.test.tsx             # Testes de integração e interação da UI
│   ├── index.tsx                # Ponto de entrada React 19
│   ├── index.css                # Reset de estilos globais
│   └── setupTests.js            # Configuração do Jest DOM
├── package.json                 # Dependências e scripts do projeto
├── tsconfig.json                # Configurações do compilador TypeScript
└── README.md                    # Documentação do projeto
```

---

## Decisões de Engenharia e Boas Práticas

1. **Prevenção de Race Conditions (`AbortController`)**: Cada nova requisição cancela a anterior automaticamente caso ela ainda esteja pendente, evitando atualizações fora de ordem decorrentes de latência de rede.
2. **Eficiência de Rede (Debounce Duplo + Cache)**:
   - Evita requisições a cada tecla digitada via `useRef` e `setTimeout`.
   - Conversões idênticas dentro da janela de 60 segundos são servidas imediatamente da memória sem tráfego de rede.
3. **Resiliência e Proteção do LocalStorage**:
   - As funções de leitura utilizam *Type Guards* (`isValidHistoryEntry` e `isValidFavoriteEntry`) para descartar dados corrompidos ou adulterados.
   - Limite de caracteres serializados para prevenir injeção excessiva de dados no armazenamento local.
4. **Code Splitting & Lazy Loading**: Modais de visualização intensiva (`HistoryModal`, `FavoritesModal`, `ChartModal`) são carregados dinamicamente via `React.lazy` e `Suspense`, mantendo o bundle inicial enxuto.
5. **Acessibilidade e Feedback de Usuário**:
   - Estados de carregamento informativos (*skeleton loaders* e botões desabilitados).
   - Tooltips, feedbacks de cópia ("Copiado!") e alternância de contraste para acessibilidade visual.

---

## Como Executar

### Pré-requisitos

Certifique-se de ter instalado em sua máquina:
- [Node.js](https://nodejs.org/) (versão 18 ou superior recomendada)
- Gerenciador de pacotes `npm`, `yarn` ou `pnpm`

### Instalação

1. Clone este repositório:
   ```bash
   git clone https://github.com/wemerson-souza/SwapConverx.git
   ```

2. Acesse a pasta do projeto:
   ```bash
   cd currency-convertor-app
   ```

3. Instale as dependências:
   ```bash
   npm install
   ```

### Executando em Modo de Desenvolvimento

Inicie o servidor de desenvolvimento local:
```bash
npm start
```

A aplicação estará acessível em [http://localhost:3000](http://localhost:3000).

### Gerando Build de Produção

Para gerar a versão otimizada para publicação:
```bash
npm run build
```

Os arquivos estáticos prontos para deploy serão criados no diretório `build/`.

---

## Testes

O projeto conta com ampla cobertura de testes cobrindo validações, serviços de integração, hooks e componentes de interface.

Para executar todos os testes em modo único:
```bash
npm test -- --watchAll=false
```

Para executar em modo interativo (assistindo alterações):
```bash
npm test
```

### Resultados da Suíte de Testes:
```text
PASS src/tests/validateAmount.test.ts
PASS src/tests/frankFurterService.test.ts
PASS src/tests/useCurrencyConverter.test.ts
PASS src/tests/AmountInput.test.tsx
PASS src/App.test.tsx

Test Suites: 5 passed, 5 total
Tests:       58 passed, 58 total
```

---

## Licença

Este projeto é distribuído sob a licença **MIT**. Consulte o arquivo de licença para mais informações.
