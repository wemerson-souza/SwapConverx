import { memo } from "react";
import "./AmountInput.css";

interface AmountInputProps {
  value: number | string;
  onChange: (value: string) => void;
}

function AmountInput({ value, onChange }: AmountInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;

    // Remove qualquer caractere que não seja número ou ponto decimal
    const sanitized = raw.replace(/[^0-9.]/g, '');

    // Garante apenas um ponto decimal
    const parts = sanitized.split('.');
    const cleaned = parts.length > 2
      ? parts[0] + '.' + parts.slice(1).join('')
      : sanitized;

    onChange(cleaned);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Permite: números, ponto, vírgula e teclas de controle
    const allowedKeys = [
      'Backspace', 'Delete', 'Tab', 'Enter',
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
      'Home', 'End', '.'
    ];

    const isNumber = /^[0-9]$/.test(e.key);
    const isAllowed = allowedKeys.includes(e.key);
    const isCtrl = e.ctrlKey || e.metaKey; // permite Ctrl+A, Ctrl+C, Ctrl+V

    if (!isNumber && !isAllowed && !isCtrl) {
      e.preventDefault();
    }
  };

  return (
    <div className="amount-input-wrapper">
      <label htmlFor="amount-input">Valor</label>
      <input
        id="amount-input"
        type="number"
        value={value}
        min="0"
        placeholder="Digite o valor..."
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
}

export default memo(AmountInput);
