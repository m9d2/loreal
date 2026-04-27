import { useEffect, useState } from 'react';
import {IconCart, IconSoldOut} from './Icons.jsx';
import { formatPrice } from '../utils/format.js';

export default function ProductCard({ item, onSelect, onAdd, viewMode = 'grid' }) {
  const imageUrl = item.pics?.[0] || item.image || item.item_pics?.[0];
  const [currentImageUrl, setCurrentImageUrl] = useState(imageUrl || '');
  const stockValue = item.total_store;
  const stockNumber = Number(stockValue);
  const isSoldOut = Number.isFinite(stockNumber) && stockNumber <= 0;

  useEffect(() => {
    setCurrentImageUrl(imageUrl || '');
  }, [imageUrl]);

  return (
    <article
      className={`group overflow-hidden rounded-[24px] border border-stone-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg ${
        viewMode === 'list' ? 'grid gap-4 p-4 md:grid-cols-[180px_1fr]' : 'h-[320px]'
      }`}
      onClick={() => onSelect?.(item)}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          onSelect?.(item);
        }
      }}
      role="button"
      tabIndex={0}
    >
      <div
        className={`relative overflow-hidden bg-stone-100 ${
          viewMode === 'list'
            ? 'aspect-square rounded-2xl'
            : 'h-[176px] rounded-t-[24px]'
        }`}
      >
        <img
            src={currentImageUrl}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
            onError={() => setCurrentImageUrl('')}
          />
        {item.tags && (
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-stone-700 shadow-sm backdrop-blur">
            {item.tags}
          </span>
        )}
      </div>
      <div
        className={
          viewMode === 'list'
            ? 'flex min-w-0 flex-col justify-between'
            : 'flex h-[144px] flex-col p-4'
        }
      >
        <div className={viewMode === 'list' ? 'space-y-3' : 'h-12'}>
          <h3
            className="overflow-hidden text-sm font-semibold leading-6 text-stone-900"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
            title={item.item_name || ''}
          >
            {item.item_name || '--'}
          </h3>
          {viewMode === 'list' && item.item_spec && (
            <p className="text-sm text-stone-500">{item.item_spec}</p>
          )}
        </div>
        <div className="mt-auto flex items-center justify-between gap-3 pt-3">
          <div className="flex min-w-0 items-end gap-2">
            <span className="text-base font-semibold text-stone-900">
              {formatPrice(item.price)}
            </span>
            <span className="truncate text-xs text-stone-400 line-through">
              {formatPrice(item.market_price)}
            </span>
          </div>
          <button
            className={`inline-flex h-11 min-w-11 items-center justify-center rounded-full px-4 text-sm font-medium transition ${
              isSoldOut
                ? 'cursor-not-allowed bg-stone-200 text-stone-500'
                : 'bg-stone-900 text-white hover:bg-stone-700'
            }`}
            type="button"
            title={isSoldOut ? '已售罄' : '加入购物车'}
            disabled={isSoldOut}
            onClick={(event) => {
              event.stopPropagation();
              if (isSoldOut) return;
              onAdd?.(item);
            }}
          >
            {isSoldOut ? (
              <IconSoldOut className="h-4 w-4" />
            ) : (
              <IconCart className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
