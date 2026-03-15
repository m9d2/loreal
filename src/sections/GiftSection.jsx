import ProductCard from '../components/ProductCard.jsx';
import { IconArrow, IconGrid, IconList } from '../components/Icons.jsx';

export function GiftHeader({
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
}) {
  return (
    <>
      <section className="tabs">
        {loadingTags ? (
          <span className="tag tag--loading">加载品牌...</span>
        ) : (
          tags.map((tag) => (
            <button
              key={tag}
              className={`tag ${selectedTag === tag ? 'tag--active' : ''}`}
              onClick={() => onSelectTag(tag)}
              type="button"
            >
              {tag}
            </button>
          ))
        )}
      </section>

      <section className="toolbar">
        <div className="toolbar__sort">
          <button
            className={`sort ${sortState.key === 'default' ? 'sort--active' : ''}`}
            onClick={onDefaultSort}
            type="button"
          >
            综合
          </button>
          <button
            className={`sort ${sortState.key === 'price' ? 'sort--active' : ''}`}
            onClick={onPriceSort}
            type="button"
          >
            价格
            <IconArrow direction={sortState.direction === 'asc' ? 'up' : 'down'} />
          </button>
        </div>
        <div className="toolbar__meta">
          <span>共 {totalCount || '--'} 件</span>
          <button
            className="view"
            type="button"
            aria-label="切换布局"
            onClick={onToggleView}
          >
            {viewMode === 'grid' ? <IconList /> : <IconGrid />}
          </button>
        </div>
      </section>

      {error && <div className="error">{error}</div>}
    </>
  );
}

export function GiftBody({
  loadingList,
  products,
  viewMode,
  onSelectProduct,
  onAddToCart,
  page,
  totalPages,
  pageNumbers,
  onPageChange,
}) {
  return (
    <>
      <main className={`grid ${viewMode === 'list' ? 'grid--list' : ''}`}>
        {loadingList && products.length === 0
          ? Array.from({ length: 8 }).map((_, index) => (
              <div className="card card--skeleton" key={`gift-skeleton-${index}`} />
            ))
          : products.map((item) => (
              <ProductCard
                key={item.item_id}
                item={item}
                onSelect={onSelectProduct}
                onAdd={onAddToCart}
              />
            ))}
      </main>

      {!loadingList && products.length === 0 && <div className="empty">暂无匹配商品</div>}

      {totalPages > 1 && (
        <div className="pagination">
          <button
            type="button"
            className="page-btn"
            disabled={page === 1 || loadingList}
            onClick={() => onPageChange(page - 1)}
          >
            上一页
          </button>
          {pageNumbers.map((pageNum) => (
            <button
              key={pageNum}
              type="button"
              className={`page-btn ${pageNum === page ? 'page-btn--active' : ''}`}
              disabled={loadingList}
              onClick={() => onPageChange(pageNum)}
            >
              {pageNum}
            </button>
          ))}
          <button
            type="button"
            className="page-btn"
            disabled={page === totalPages || loadingList}
            onClick={() => onPageChange(page + 1)}
          >
            下一页
          </button>
          <span className="page-meta">共 {totalPages} 页</span>
        </div>
      )}
    </>
  );
}
