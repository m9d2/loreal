import CartContent from '../components/cart/CartContent.jsx';

export default function CartPage(props) {
  return (
    <section className="space-y-6">
      {/* <div className="rounded-[32px] border border-stone-200 bg-gradient-to-br from-white via-stone-50 to-stone-100 p-8 shadow-sm">
        <div className="max-w-3xl space-y-4">
          <span className="inline-flex rounded-full bg-stone-900 px-3 py-1 text-xs font-medium text-white">
            Cart Workspace
          </span>
          <h2 className="text-3xl font-semibold tracking-tight text-stone-900">购物车</h2>
          <p className="text-sm leading-7 text-stone-600">
            页面版购物车与右侧抽屉共用同一套数据和操作，两个入口保持同步。
          </p>
        </div>
      </div> */}

      <div className="overflow-hidden rounded-[32px] border border-stone-200 bg-white shadow-sm">
        <CartContent
          {...props}
          className="flex min-h-[520px] flex-col overflow-hidden"
          bodyClassName="flex-1 overflow-y-auto"
        />
      </div>
    </section>
  );
}
