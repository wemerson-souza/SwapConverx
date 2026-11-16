import { memo } from "react";
import { Star, X, Trash2 } from "lucide-react";
import { FavoriteEntry } from "../hooks/useCurrencyConverter";
import "./Favorites.css";

interface StarButtonProps {
  isFavorite: boolean;
  onClick: () => void;
  visible: boolean;
}

export const StarButton = memo(function StarButton({ isFavorite, onClick, visible }: StarButtonProps) {
  if (!visible) return null;
  return (
    <button
      className={`star-btn ${isFavorite ? "active" : ""}`}
      onClick={onClick}
      title={isFavorite ? "Remover dos favoritos" : "Salvar como favorito"}
    >
      <Star size={18} fill={isFavorite ? "currentColor" : "none"} />
    </button>
  );
});

interface FavoritesModalProps {
  favorites: FavoriteEntry[];
  onApply: (fav: FavoriteEntry) => void;
  onRemove: (id: number) => void;
  onClear: () => void;
  onClose: () => void;
}

export function FavoritesModal({
  favorites,
  onApply,
  onRemove,
  onClear,
  onClose,
}: FavoritesModalProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <Star size={18} />
            Seus Favoritos
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="favorites-list">
          {favorites.length === 0 ? (
            <p className="favorites-empty">
              Nenhum favorito ainda. Faça uma conversão e clique na estrela para
              salvar.
            </p>
          ) : (
            <>
              {favorites.map((fav) => (
                <div key={fav.id} className="favorite-item">
                  <button
                    className="favorite-apply"
                    onClick={() => { onApply(fav); onClose(); }}
                  >
                    <span className="fav-from">{fav.from}</span>
                    <span className="fav-arrow">→</span>
                    <span className="fav-to">{fav.to}</span>
                  </button>
                  <button
                    className="favorite-remove"
                    onClick={() => onRemove(fav.id)}
                    title="Remover"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              <button className="favorites-clear" onClick={onClear}>
                <Trash2 size={13} /> Limpar favoritos
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

interface FavoritesButtonProps {
  count: number;
  onClick: () => void;
}

export const FavoritesButton = memo(function FavoritesButton({ count, onClick }: FavoritesButtonProps) {
  return (
    <button className="favorites-btn" onClick={onClick} title="Ver favoritos">
      <Star size={16} />
      Favoritos
      {count > 0 && <span className="favorites-badge">{count}</span>}
    </button>
  );
});
