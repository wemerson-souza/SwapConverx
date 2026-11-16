import { memo } from "react";
import { History, X, Trash2 } from "lucide-react";
import { HistoryEntry } from "../hooks/useCurrencyConverter";
import "./ConversionHistory.css";

interface ConversionHistoryProps {
  history: HistoryEntry[];
  onClear: () => void;
  onRemove: (id: number) => void;
}

function ConversionHistory({ history, onClear, onRemove }: ConversionHistoryProps) {
  return (
    <div className="history-list">
      {history.length === 0 ? (
        <p className="history-empty">Nenhuma conversão ainda.</p>
      ) : (
        <>
          {history.map((entry) => (
            <div key={entry.id} className="history-item">
              <div className="history-item-content">
                <div className="history-pair">
                  <span className="history-from">{entry.from}</span>
                  <span className="history-arrow">→</span>
                  <span className="history-to">{entry.to}</span>
                </div>
                <div className="history-values">
                  <span className="history-amount">
                    {entry.amount.toLocaleString("pt-BR")} {entry.from}
                  </span>
                  <span className="history-equals">=</span>
                  <span className="history-result">
                    {entry.result.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{" "}
                    {entry.to}
                  </span>
                </div>
                <span className="history-date">{entry.date}</span>
              </div>
              <button
                className="history-item-remove"
                onClick={() => onRemove(entry.id)}
                title="Remover esta conversão"
              >
                <X size={14} />
              </button>
            </div>
          ))}
          <button className="history-clear" onClick={onClear}>
            <Trash2 size={13} /> Limpar histórico
          </button>
        </>
      )}
    </div>
  );
}

interface HistoryModalProps {
  history: HistoryEntry[];
  onClear: () => void;
  onRemove: (id: number) => void;
  onClose: () => void;
}

export function HistoryModal({ history, onClear, onRemove, onClose }: HistoryModalProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <History size={18} />
            Histórico de Conversões
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <ConversionHistory history={history} onClear={onClear} onRemove={onRemove} />
      </div>
    </div>
  );
}

interface HistoryButtonProps {
  count: number;
  onClick: () => void;
}

export const HistoryButton = memo(function HistoryButton({ count, onClick }: HistoryButtonProps) {
  return (
    <button className="history-btn" onClick={onClick} title="Ver histórico">
      <History size={16} />
      Histórico
      {count > 0 && <span className="history-badge">{count}</span>}
    </button>
  );
});
