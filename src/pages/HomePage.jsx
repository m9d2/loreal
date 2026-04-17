import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard.jsx';
import { IconBag, IconCategory, IconOrder } from '../components/Icons.jsx';

const shortcuts = [
  {
    to: '/gift',
    title: '礼包专区',
    desc: '查看活动礼包和热门组合',
    icon: IconBag,
  },
  {
    to: '/category',
    title: '商品分类',
    desc: '按品牌和事业部筛选商品',
    icon: IconCategory,
  },
  {
    to: '/orders',
    title: '订单列表',
    desc: '查看订单状态和详情',
    icon: IconOrder,
  },
];

export default function HomePage({
  featuredProducts,
  loading,
  onSelectProduct,
  onAddToCart,
  cartCount,
}) {
  return (
    <section className="space-y-6">
      <div className="rounded-[32px] border border-stone-200 bg-gradient-to-br from-white via-amber-50 to-stone-100 p-8 shadow-sm">
        <div className="max-w-3xl space-y-4">
          <span className="inline-flex rounded-full bg-stone-900 px-3 py-1 text-xs font-medium text-white">
            L'Oreal Boutique Workspace
          </span>
          <h2 className="text-3xl font-semibold tracking-tight text-stone-900">
            工作台
          </h2>
          <p className="text-sm leading-7 text-stone-600">
            当前购物车共
            <span className="mx-1 font-semibold text-stone-900">{cartCount}</span>
            件商品。
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {shortcuts.map(({ to, title, desc, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="rounded-[24px] border border-stone-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-800">
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold text-stone-900">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-stone-500">{desc}</p>
          </Link>
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-stone-900">推荐商品</h3>
          <Link to="/gift" className="text-sm font-medium text-amber-700">
            查看全部
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {loading && featuredProducts.length === 0
            ? Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={`home-skeleton-${index}`}
                  className="h-[320px] animate-pulse rounded-[24px] border border-stone-200 bg-white"
                />
              ))
            : featuredProducts.map((item) => (
                <ProductCard
                  key={item.item_id}
                  item={item}
                  onSelect={onSelectProduct}
                  onAdd={onAddToCart}
                />
              ))}
        </div>
      </div>
    </section>
  );
}
