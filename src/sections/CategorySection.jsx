import ProductCard from '../components/ProductCard.jsx';
import { IconArrow, IconGrid, IconList } from '../components/Icons.jsx';

export default function CategorySection({
  groups,
  activeGroupId,
  onGroupChange,
  activeGroup,
  categoryBrand,
  onBrandSelect,
  categoryTags,
  selectedCategoryTag,
  onSelectCategoryTag,
  sortState,
  onDefaultSort,
  onPriceSort,
  categoryTotalCount,
  viewMode,
  onToggleView,
  categoryError,
  categoryLoading,
  products,
  onSelectProduct,
  onAddToCart,
  categoryPage,
  categoryTotalPages,
  categoryPageNumbers,
  onPageChange,
}) {
  return (
    <div className="category">
      <aside className="category__menu">
        {groups.map((group) => (
          <button
            key={group.id}
            type="button"
            className={`category__menu-item ${
              activeGroupId === group.id ? 'category__menu-item--active' : ''
            }`}
            onClick={() => onGroupChange(group.id)}
          >
            {group.name}
          </button>
        ))}
      </aside>
      <section className="category__panel">
        <div className="category__brands">
          {activeGroup?.brands?.map((brand) => (
            <button
              key={brand.id}
              type="button"
              className={`category__brand ${
                categoryBrand?.id === brand.id ? 'category__brand--active' : ''
              }`}
              onClick={() => onBrandSelect(brand)}
            >
              {brand.name}
            </button>
          ))}
        </div>

        {categoryBrand ? (
          <div className="category__list">
            <div className="category__list-header">
              <h3>{categoryBrand.name}</h3>
            </div>
            <section className="tabs">
              {categoryTags.length === 0 && categoryLoading ? (
                <span className="tag tag--loading">加载标签...</span>
              ) : (
                categoryTags.map((tag) => (
                  <button
                    key={tag}
                    className={`tag ${
                      selectedCategoryTag === tag ? 'tag--active' : ''
                    }`}
                    onClick={() => onSelectCategoryTag(tag)}
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
                  className={`sort ${
                    sortState.key === 'default' ? 'sort--active' : ''
                  }`}
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
                <span>共 {categoryTotalCount || '--'} 件</span>
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

            {categoryError && <div className="error">{categoryError}</div>}

            <main className={`grid ${viewMode === 'list' ? 'grid--list' : ''}`}>
              {categoryLoading && products.length === 0
                ? Array.from({ length: 8 }).map((_, index) => (
                    <div className="card card--skeleton" key={`cat-${index}`} />
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

            {!categoryLoading && products.length === 0 && (
              <div className="empty">暂无匹配商品</div>
            )}

            {categoryTotalPages > 1 && (
              <div className="pagination">
                <button
                  type="button"
                  className="page-btn"
                  disabled={categoryPage === 1 || categoryLoading}
                  onClick={() => onPageChange(categoryPage - 1)}
                >
                  上一页
                </button>
                {categoryPageNumbers.map((pageNum) => (
                  <button
                    key={pageNum}
                    type="button"
                    className={`page-btn ${
                      pageNum === categoryPage ? 'page-btn--active' : ''
                    }`}
                    disabled={categoryLoading}
                    onClick={() => onPageChange(pageNum)}
                  >
                    {pageNum}
                  </button>
                ))}
                <button
                  type="button"
                  className="page-btn"
                  disabled={categoryPage === categoryTotalPages || categoryLoading}
                  onClick={() => onPageChange(categoryPage + 1)}
                >
                  下一页
                </button>
                <span className="page-meta">共 {categoryTotalPages} 页</span>
              </div>
            )}
          </div>
        ) : (
          <div className="category__empty">请选择品牌查看商品</div>
        )}
      </section>
    </div>
  );
}
