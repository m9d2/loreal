import CatalogPage from '../components/CatalogPage.jsx';

export default function CategoryPage({
  groups,
  activeGroupId,
  onGroupChange,
  activeGroup,
  categoryBrand,
  onBrandSelect,
  ...catalogProps
}) {
  return (
    <section className="grid gap-6 xl:grid-cols-[240px_1fr]">
      <aside className="rounded-[28px] border border-stone-200 bg-white p-4 shadow-sm">
        <div className="space-y-2">
          {groups.map((group) => (
            <button
              key={group.id}
              type="button"
              className={`w-full rounded-2xl px-4 py-3 text-left text-sm transition ${
                activeGroupId === group.id
                  ? 'bg-stone-900 text-white'
                  : 'bg-stone-50 text-stone-700 hover:bg-stone-100'
              }`}
              onClick={() => onGroupChange(group.id)}
            >
              {group.name}
            </button>
          ))}
        </div>
      </aside>

      <div className="space-y-6">
        <div className="rounded-[28px] border border-stone-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap gap-3">
            {activeGroup?.brands?.map((brand) => (
              <button
                key={brand.id}
                type="button"
                className={`rounded-full border px-4 py-2 text-sm transition ${
                  categoryBrand?.id === brand.id
                    ? 'border-stone-900 bg-stone-900 text-white'
                    : 'border-stone-200 bg-white text-stone-700 hover:border-stone-400'
                }`}
                onClick={() => onBrandSelect(brand)}
              >
                {brand.name}
              </button>
            ))}
          </div>
        </div>

        {categoryBrand ? (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-stone-900">{categoryBrand.name}</h2>
            </div>
            <CatalogPage {...catalogProps} loadingTagText="加载标签..." />
          </div>
        ) : (
          <div className="rounded-[28px] border border-dashed border-stone-300 bg-stone-50 px-6 py-16 text-center text-sm text-stone-500">
            请选择品牌查看商品
          </div>
        )}
      </div>
    </section>
  );
}
