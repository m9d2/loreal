import ProductCard from './ProductCard.jsx';
import { IconArrow, IconGrid, IconList } from './Icons.jsx';

function FilterChip({ active, children, onClick, disabled = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-full border px-4 py-2 text-sm transition ${
        active
          ? 'border-stone-900 bg-stone-900 text-white'
          : 'border-stone-200 bg-white text-stone-700 hover:border-stone-400'
      } ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
    >
      {children}
    </button>
  );
}

export function Pagination({
  page,
  totalPages,
  pageNumbers,
  loading,
  onPageChange,
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
      <button
        type="button"
        className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm text-stone-700 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={page === 1 || loading}
        onClick={() => onPageChange(page - 1)}
      >
        上一页
      </button>
      {pageNumbers.map((pageNum) => (
        <button
          key={pageNum}
          type="button"
          className={`rounded-full px-4 py-2 text-sm transition ${
            pageNum === page
              ? 'bg-stone-900 text-white'
              : 'border border-stone-200 bg-white text-stone-700 hover:border-stone-400'
          }`}
          disabled={loading}
          onClick={() => onPageChange(pageNum)}
        >
          {pageNum}
        </button>
      ))}
      <button
        type="button"
        className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm text-stone-700 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={page === totalPages || loading}
        onClick={() => onPageChange(page + 1)}
      >
        下一页
      </button>
      <span className="ml-2 text-sm text-stone-500">共 {totalPages} 页</span>
    </div>
  );
}

export default function CatalogPage({
  tags,
  loadingTags,
  selectedTag,
  onSelectTag,
  sortState,
  onDefaultSort,
  onPriceSort,
  totalCount,
  viewMode,
  onToggleView,
  error,
  loadingList,
  products,
  onSelectProduct,
  onAddToCart,
  page,
  totalPages,
  pageNumbers,
  onPageChange,
  emptyText = '暂无匹配商品',
  loadingTagText = '加载标签...',
}) {
  return (
    <section className="space-y-6">
      <div className="rounded-[28px] border border-stone-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap gap-3">
          {loadingTags ? (
            <span className="rounded-full border border-dashed border-stone-300 px-4 py-2 text-sm text-stone-500">
              {loadingTagText}
            </span>
          ) : (
            tags.map((tag) => (
              <FilterChip
                key={tag}
                active={selectedTag === tag}
                onClick={() => onSelectTag(tag)}
              >
                {tag}
              </FilterChip>
            ))
          )}
        </div>
      </div>

      <div className="rounded-[28px] border border-stone-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-3">
            <FilterChip active={sortState.key === 'default'} onClick={onDefaultSort}>
              综合
            </FilterChip>
            <FilterChip active={sortState.key === 'price'} onClick={onPriceSort}>
              <span className="inline-flex items-center gap-1">
                价格
                <IconArrow
                  direction={sortState.direction === 'asc' ? 'up' : 'down'}
                  className="h-3.5 w-3.5"
                />
              </span>
            </FilterChip>
          </div>
          <div className="flex items-center justify-between gap-4 text-sm text-stone-500 md:justify-end">
            <span>共 {totalCount || '--'} 件</span>
            <button
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-stone-200 bg-stone-50 text-stone-700 transition hover:bg-stone-100"
              type="button"
              aria-label="切换布局"
              onClick={onToggleView}
            >
              {viewMode === 'grid' ? (
                <IconList className="h-5 w-5" />
              ) : (
                <IconGrid className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
        {error && (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
      </div>

      <div
        className={
          viewMode === 'grid'
            ? 'grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5'
            : 'grid grid-cols-1 gap-4'
        }
      >
        {loadingList && products.length === 0
          ? Array.from({ length: 8 }).map((_, index) => (
              <div
                className="h-[320px] animate-pulse rounded-[24px] border border-stone-200 bg-white"
                key={`skeleton-${index}`}
              />
            ))
          : products.map((item) => (
              <ProductCard
                key={item.item_id}
                item={item}
                viewMode={viewMode}
                onSelect={onSelectProduct}
                onAdd={onAddToCart}
              />
            ))}
      </div>

      {!loadingList && products.length === 0 && (
        <div className="rounded-[28px] border border-dashed border-stone-300 bg-stone-50 px-6 py-16 text-center text-sm text-stone-500">
          {emptyText}
        </div>
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        pageNumbers={pageNumbers}
        loading={loadingList}
        onPageChange={onPageChange}
      />
    </section>
  );
}
