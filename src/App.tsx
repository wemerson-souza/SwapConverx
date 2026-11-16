import { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { AlertCircle, Sun, Moon } from 'lucide-react';
import './App.css';
import { useCurrencyConverter } from './hooks/useCurrencyConverter';
import AmountInput from './components/AmountInput';
import CurrencySelect from './components/CurrencySelect';
import ResultDisplay from './components/ResultDisplay';
import { HistoryButton } from './components/ConversionHistory';
import { FavoritesButton, StarButton } from './components/Favorites';
import { ChartButton } from './components/Chart';

// Lazy loading — só carrega quando abrir o modal
const HistoryModal   = lazy(() => import('./components/ConversionHistory').then(m => ({ default: m.HistoryModal })));
const FavoritesModal = lazy(() => import('./components/Favorites').then(m => ({ default: m.FavoritesModal })));
const ChartModal     = lazy(() => import('./components/Chart').then(m => ({ default: m.ChartModal })));

function App() {
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [showFavorites, setShowFavorites] = useState<boolean>(false);
  const [showChart, setShowChart] = useState<boolean>(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
  }, []);

  const toggleTheme = (): void => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    document.documentElement.setAttribute('data-theme', newMode ? 'dark' : 'light');
  };

  const {
    currencies, amount, setAmount,
    from, setFrom, to, setTo,
    result, loading, error,
    history, clearHistory, removeHistory,
    favorites, isFavorite, toggleFavorite, applyFavorite, removeFavorite, clearFavorites,
    handleConvert,
  } = useCurrencyConverter();

  const historyCount  = useMemo(() => history.length, [history]);
  const favoritesCount = useMemo(() => favorites.length, [favorites]);

  return (
    <>
      <div className="app-wrapper">

        <button className="theme-toggle" onClick={toggleTheme} title="Alternar tema">
          <Sun size={14} className="theme-toggle-icon sun" />
          <div className={`theme-toggle-track ${darkMode ? 'dark' : ''}`}>
            <div className="theme-toggle-thumb" />
          </div>
          <Moon size={14} className="theme-toggle-icon moon" />
        </button>

        <div className="app-left">
          <div className="app-brand">
            <img src="/logo.svg" alt="SwapConverx" className="brand-logo" />
            <div>
              <div className="brand-name">SwapConverx</div>
              <div className="brand-tagline">Taxas de câmbio em tempo real</div>
            </div>
          </div>

          <AmountInput value={amount} onChange={setAmount} />

          <CurrencySelect
            currencies={currencies}
            from={from}
            to={to}
            onFromChange={setFrom}
            onToChange={setTo}
          />

          {error && (
            <div className="error-msg">
              <AlertCircle size={14} /> {error}
            </div>
          )}

          <button className="btn-convert" onClick={handleConvert} disabled={loading}>
            {loading ? 'Convertendo...' : 'Converter'}
          </button>

          <div className="action-buttons">
            <HistoryButton count={historyCount} onClick={() => setShowHistory(true)} />
            <FavoritesButton count={favoritesCount} onClick={() => setShowFavorites(true)} />
          </div>

          <ChartButton onClick={() => setShowChart(true)} />
        </div>

        <div className="app-right">
          <StarButton visible={!!result} isFavorite={isFavorite} onClick={toggleFavorite} />
          <h2>Resultado</h2>
          <p>Veja abaixo o valor convertido com a taxa atual</p>

          {result !== null ? (
            <ResultDisplay amount={amount} from={from} to={to} result={result} />
          ) : (
            <p style={{ marginTop: 16, fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
              Preencha os campos ao lado e clique em Converter
            </p>
          )}
        </div>

      </div>

      <Suspense fallback={null}>
        {showHistory && (
          <HistoryModal history={history} onClear={clearHistory} onRemove={removeHistory} onClose={() => setShowHistory(false)} />
        )}
        {showFavorites && (
          <FavoritesModal favorites={favorites} onApply={applyFavorite} onRemove={removeFavorite} onClear={clearFavorites} onClose={() => setShowFavorites(false)} />
        )}
        {showChart && (
          <ChartModal from={from} to={to} onClose={() => setShowChart(false)} />
        )}
      </Suspense>
    </>
  );
}

export default App;
