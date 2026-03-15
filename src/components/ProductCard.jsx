import { IconCart } from './Icons.jsx';
import { clampText, formatPrice } from '../utils/format.js';

export default function ProductCard({ item, onSelect, onAdd }) {
  const imageUrl = item.pics?.[0] || item.image || item.item_pics?.[0];
  const stockValue = item.total_store;
  const stockNumber = Number(stockValue);
  const isSoldOut = Number.isFinite(stockNumber) && stockNumber <= 0;
  return (
    <article
      className="card"
      onClick={() => onSelect?.(item)}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          onSelect?.(item);
        }
      }}
      role="button"
      tabIndex={0}
    >
      <div className="card__media">
        {imageUrl ? (
          <img src={imageUrl} alt="" loading="lazy" />
        ) : (
          <div className="card__media--empty" />
        )}
        {item.tags && <span className="card__tag">{item.tags}</span>}
      </div>
      <div className="card__body">
        <h3>{clampText(item.item_name, 24)}</h3>
        <div className="card__price">
          <span className="price">{formatPrice(item.price)}</span>
          <span className="price--old">{formatPrice(item.market_price)}</span>
        </div>
        <button
          className={`card__cart ${isSoldOut ? 'card__cart--soldout' : ''}`}
          type="button"
          title={isSoldOut ? '已售罄' : '加入购物车'}
          disabled={isSoldOut}
          onClick={(event) => {
            event.stopPropagation();
            if (isSoldOut) return;
            onAdd?.(item);
          }}
        >
          {isSoldOut ? <span className="card__soldout">售罄</span> : <IconCart />}
        </button>
      </div>
    </article>
  );
}
