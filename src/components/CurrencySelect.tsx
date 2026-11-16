import { useState, useRef, useEffect } from "react";
import { ArrowLeftRight, ChevronDown } from "lucide-react";
import "./CurrencySelect.css";

interface DropdownProps {
  label: string;
  currencies: Record<string, string>;
  value: string;
  onChange: (code: string) => void;
  loading?: boolean;
}

function DropdownSkeleton({ label }: { label: string }) {
  return (
    <div className="dropdown-wrapper">
      <span className="dropdown-label">{label}</span>
      <div className="dropdown-skeleton">
        <div className="skeleton-line skeleton-code" />
        <div className="skeleton-line skeleton-name" />
      </div>
    </div>
  );
}

function Dropdown({
  label,
  currencies,
  value,
  onChange,
  loading,
}: DropdownProps) {
  const [open, setOpen] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (loading) return <DropdownSkeleton label={label} />;

  const options = Object.entries(currencies);
  const filtered = options.filter(
    ([code, name]) =>
      code.toLowerCase().includes(search.toLowerCase()) ||
      name.toLowerCase().includes(search.toLowerCase()),
  );
  const selectedName = currencies[value] || "";

  const handleSelect = (code: string): void => {
    onChange(code);
    setOpen(false);
    setSearch("");
  };

  return (
    <div className="dropdown-wrapper" ref={ref}>
      <span className="dropdown-label">{label}</span>
      <button className="dropdown-trigger" onClick={() => setOpen(!open)}>
        <span className="dropdown-value">
          {value} — {selectedName}
        </span>
        <ChevronDown
          size={14}
          className={`dropdown-arrow ${open ? "open" : ""}`}
        />
      </button>

      {open && (
        <div className="dropdown-menu">
          <div className="dropdown-search-wrapper">
            <input
              className="dropdown-search"
              type="text"
              placeholder="Buscar moeda..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>
          <ul className="dropdown-list">
            {filtered.length > 0 ? (
              filtered.map(([code, name]) => (
                <li
                  key={code}
                  className={`dropdown-item ${code === value ? "selected" : ""}`}
                  onClick={() => handleSelect(code)}
                >
                  <span className="item-code">{code}</span>
                  <span className="item-name">{name}</span>
                </li>
              ))
            ) : (
              <li className="dropdown-empty">Nenhuma moeda encontrada</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

interface CurrencySelectProps {
  currencies: Record<string, string>;
  from: string;
  to: string;
  onFromChange: (code: string) => void;
  onToChange: (code: string) => void;
}

function CurrencySelect({
  currencies,
  from,
  to,
  onFromChange,
  onToChange,
}: CurrencySelectProps) {
  const isLoading = Object.keys(currencies).length === 0;

  const handleSwap = (): void => {
    onFromChange(to);
    onToChange(from);
  };

  return (
    <div className="currency-row">
      <Dropdown
        label="De"
        currencies={currencies}
        value={from}
        onChange={onFromChange}
        loading={isLoading}
      />
      <button
        className="swap-btn"
        onClick={handleSwap}
        title="Inverter moedas"
        disabled={isLoading}
      >
        <ArrowLeftRight size={16} />
      </button>
      <Dropdown
        label="Para"
        currencies={currencies}
        value={to}
        onChange={onToChange}
        loading={isLoading}
      />
    </div>
  );
}

export default CurrencySelect;
