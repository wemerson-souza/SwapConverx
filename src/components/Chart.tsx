import { useState, useEffect } from "react";
import { X, TrendingUp, TrendingDown } from "lucide-react";
import { ResponsiveContainer, AreaChart,  Area, XAxis, YAxis, CartesianGrid,Tooltip, } from "recharts";
import { getHistory } from "../services/frankFurterService";
import "./Chart.css";

interface Period {
  label: string;
  days: number;
}

const PERIODS: Period[] = [
  { label: "7 dias", days: 7 },
  { label: "30 dias", days: 30 },
];

const CACHE_TTL = 5 * 60 * 1000;

interface ChartDataPoint {
  date: string;
  rate: number;
}

interface CacheEntry {
  data: ChartDataPoint[];
  timestamp: number;
}

const chartCache: Record<string, CacheEntry> = {};

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip">
        <div className="tooltip-date">{label}</div>
        <div className="tooltip-value">
          {Number(payload[0].value).toFixed(4)}
        </div>
      </div>
    );
  }
  return null;
}

interface ChartModalProps {
  from: string;
  to: string;
  onClose: () => void;
}

export function ChartModal({ from, to, onClose }: ChartModalProps) {
  const [period, setPeriod] = useState<number>(7);
  const [data, setData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [fromCache, setFromCache] = useState<boolean>(false);

  useEffect(() => {
    // Garante que from e to são válidos antes de buscar
    if (!from || !to || from === to) return;

    const cacheKey = `${from}-${to}-${period}`;
    const cached = chartCache[cacheKey];
    const now = Date.now();

    if (cached && now - cached.timestamp < CACHE_TTL) {
      setData(cached.data);
      setFromCache(true);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setFromCache(false);

    // Pequeno delay para garantir que o modal está montado
    const timer = setTimeout(() => {
      getHistory(from, to, period)
        .then((res) => {
          const formatted: ChartDataPoint[] = Object.entries(res.rates).map(
            ([date, rates]) => ({
              date: new Date(date).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
              }),
              rate: (rates as Record<string, number>)[to],
            }),
          );

          chartCache[cacheKey] = { data: formatted, timestamp: now };
          setData(formatted);
          setError(null);
        })
        .catch((err: Error) => {
          if (err.name !== "AbortError") {
            setError(err.message);
          }
        })
        .finally(() => setLoading(false));
    }, 100);

    return () => clearTimeout(timer);
  }, [from, to, period]);

  const rates = data.map((d) => d.rate);
  const min = rates.length ? Math.min(...rates) : 0;
  const max = rates.length ? Math.max(...rates) : 0;
  const first = rates[0];
  const last = rates[rates.length - 1];
  const trend = last >= first;
  const diff = rates.length ? (((last - first) / first) * 100).toFixed(2) : "0";

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="chart-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            {trend ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
            {from} → {to}
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="chart-period-toggle">
          {PERIODS.map((p) => (
            <button
              key={p.days}
              className={`period-btn ${period === p.days ? "active" : ""}`}
              onClick={() => setPeriod(p.days)}
            >
              {p.label}
            </button>
          ))}
        </div>

        {!loading && !error && (
          <div className="chart-stats">
            <div className="chart-stat">
              <span className="stat-label">Mínima</span>
              <span className="stat-value">{min.toFixed(4)}</span>
            </div>
            <div className="chart-stat">
              <span className="stat-label">Máxima</span>
              <span className="stat-value">{max.toFixed(4)}</span>
            </div>
            <div className="chart-stat">
              <span className="stat-label">Variação</span>
              <span className={`stat-value ${trend ? "positive" : "negative"}`}>
                {trend ? "+" : ""}
                {diff}%
              </span>
            </div>
          </div>
        )}

        <div className="chart-area">
          {loading && (
            <div className="chart-loading">
              <div className="chart-skeleton" />
              <div className="chart-skeleton short" />
            </div>
          )}
          {error && (
            <div className="chart-error">
              <p>Não foi possível carregar o gráfico.</p>
              <p style={{ fontSize: 11, marginTop: 6, opacity: 0.6 }}>
                A API pode estar temporariamente indisponível. Tente novamente
                em alguns minutos.
              </p>
            </div>
          )}
          {!loading && !error && (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart
                data={data}
                margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="rateGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6c63ff" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6c63ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.05)"
                />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "#7a7a9a" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  domain={["auto", "auto"]}
                  tick={{ fontSize: 11, fill: "#7a7a9a" }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="rate"
                  stroke="#6c63ff"
                  strokeWidth={2}
                  fill="url(#rateGradient)"
                  dot={false}
                  activeDot={{ r: 5, fill: "#6c63ff" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}

interface ChartButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export function ChartButton({ onClick, disabled }: ChartButtonProps) {
  return (
    <button
      className="chart-btn"
      onClick={onClick}
      disabled={disabled}
      title="Ver gráfico de variação"
    >
      <TrendingUp size={16} />
      Gráfico
    </button>
  );
}
