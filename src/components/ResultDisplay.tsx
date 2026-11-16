import { useState } from "react";
import { Copy, Check } from "lucide-react";
import "./ResultDisplay.css";

interface ResultDisplayProps {
  amount: number | string;
  from: string;
  to: string;
  result: number;
  fromCache?: boolean;
}

function ResultDisplay({
  amount,
  from,
  to,
  result,
  fromCache,
}: ResultDisplayProps) {
  const [copied, setCopied] = useState(false);

  const formattedResult = Number(result).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedResult).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="result-wrapper">
      <div className="result-from">
        {amount} {from} equivale a
      </div>

      <div className="result-value-row">
        <div className="result-value">{formattedResult}</div>
        <button
          className={`copy-btn ${copied ? "copied" : ""}`}
          onClick={handleCopy}
          title="Copiar resultado"
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
        </button>
      </div>

      <div className="result-currency">{to}</div>
      <div className="result-divider" />
      <div className="result-rate">
        1 {from} = {(result / Number(amount)).toFixed(4)} {to}
      </div>
    </div>
  );
}

export default ResultDisplay;
