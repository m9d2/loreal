import { IconTrash } from '../Icons.jsx';
import { formatPrice } from '../../utils/format.js';

export default function CartContent({
  carts,
  activeCartId,
  editingCartId,
  cartNameDraft,
  cartCount,
  allCartTotal,
  checkoutLoading,
  nonEmptyCartIds,
  onCreateCart,
  onSetActiveCart,
  onCartNameDraftChange,
  onFinishCartRename,
  onCancelCartRename,
  onStartCartRename,
  onDeleteCart,
  onUpdateCartQty,
  onRemoveCartItem,
  onCheckoutCart,
  onCheckoutAll,
  onClose,
  className = 'flex h-full flex-col overflow-hidden',
  bodyClassName = 'flex-1 overflow-y-auto',
}) {
  return (
    <div className={className}>
      <header className="flex items-center justify-between border-b border-stone-200 px-6 py-5">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-stone-900">购物车</h2>
          <button
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 bg-stone-50 text-lg text-stone-700"
            type="button"
            onClick={onCreateCart}
            title="新建购物车"
          >
            +
          </button>
        </div>
        {onClose ? (
          <button
            className="rounded-full border border-stone-200 px-3 py-1 text-sm text-stone-600"
            type="button"
            onClick={onClose}
          >
            ✕
          </button>
        ) : null}
      </header>

      <div className={bodyClassName}>
        <div className="grid gap-4 p-6">
          {carts.map((cart) => {
            const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
            const cartTotal = cart.items.reduce(
              (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
              0
            );
            const isEditing = cart.id === editingCartId;

            return (
              <section
                key={cart.id}
                className="flex min-h-[160px] cursor-pointer flex-col overflow-hidden rounded-[24px] border border-stone-200 bg-white transition hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-md"
                onClick={() => onSetActiveCart(cart.id)}
              >
                <div className="relative border-b border-stone-200 bg-stone-50 px-5 py-4">
                  <div className="flex items-center gap-3 pr-12">
                    {isEditing ? (
                      <input
                        autoFocus
                        className="min-w-[180px] rounded-xl border border-stone-300 bg-white px-2 py-1 text-base font-semibold text-stone-900 outline-none transition focus:border-stone-900"
                        value={cartNameDraft}
                        onChange={(event) => onCartNameDraftChange(event.target.value)}
                        onBlur={() => onFinishCartRename(cart.id)}
                        onClick={(event) => event.stopPropagation()}
                        onKeyDown={(event) => {
                          event.stopPropagation();
                          if (event.key === 'Enter') onFinishCartRename(cart.id);
                          if (event.key === 'Escape') onCancelCartRename();
                        }}
                      />
                    ) : (
                      <button
                        type="button"
                        className="rounded-xl border border-transparent px-2 py-1 text-left text-base font-semibold text-stone-900 transition hover:border-stone-300 hover:bg-white"
                        onClick={(event) => {
                          event.stopPropagation();
                          onStartCartRename(cart);
                        }}
                      >
                        {cart.name || '购物车'}
                      </button>
                    )}
                    <span className="rounded-full bg-white px-3 py-1 text-xs text-stone-500">
                      {itemCount} 件
                    </span>
                  </div>

                  <button
                    className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-xl border border-transparent px-2.5 py-1.5 text-xs font-medium text-stone-500 transition hover:border-stone-200 hover:bg-white hover:text-stone-900"
                    type="button"
                    title="删除购物车"
                    onClick={(event) => {
                      event.stopPropagation();
                      onDeleteCart(cart.id);
                    }}
                  >
                    <IconTrash className="h-4 w-4" />
                    <span>删除</span>
                  </button>
                </div>

                {cart.items.length ? (
                  <div className="grid gap-4 p-4">
                    {cart.items.map((item) => (
                      <div
                        key={`${cart.id}-${item.item_id}`}
                        className="grid min-h-[160px] gap-4 rounded-2xl p-4 md:grid-cols-[88px_1fr_auto]"
                      >
                        <img
                          src={item.image}
                          alt={item.item_name}
                          className="h-24 w-full rounded-xl object-cover md:w-24"
                        />
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold text-stone-900">
                            {item.item_name}
                          </h4>
                          {item.spec ? (
                            <p className="text-sm text-stone-500">{item.spec}</p>
                          ) : null}
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-amber-700">
                              {formatPrice(item.price)}
                            </span>
                            <span className="text-xs text-stone-400 line-through">
                              {formatPrice(item.market_price)}
                            </span>
                          </div>
                          <div className="inline-flex items-center gap-3 rounded-full border border-stone-200 px-3 py-2">
                            <button
                              type="button"
                              className="text-lg leading-none text-stone-700"
                              onClick={(event) => {
                                event.stopPropagation();
                                onUpdateCartQty(cart.id, item.item_id, item.quantity - 1);
                              }}
                            >
                              -
                            </button>
                            <span className="text-sm text-stone-700">{item.quantity}</span>
                            <button
                              type="button"
                              className="text-lg leading-none text-stone-700"
                              onClick={(event) => {
                                event.stopPropagation();
                                onUpdateCartQty(cart.id, item.item_id, item.quantity + 1);
                              }}
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <div className="flex items-start justify-end">
                          <button
                            className="text-sm text-stone-500 hover:text-stone-900"
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              onRemoveCartItem(cart.id, item.item_id);
                            }}
                          >
                            移除
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-1 items-center px-5 py-10 text-center text-sm text-stone-500">
                    <div className="w-full">{cart.name || '购物车'}为空</div>
                  </div>
                )}

                <div className="mt-auto flex flex-col gap-4 border-t border-stone-200 px-5 py-4 md:flex-row md:items-end md:justify-between">
                  <div className="text-sm text-stone-500">
                    合计
                    <span className="ml-2 font-semibold text-stone-900">
                      {formatPrice(cartTotal)}
                    </span>
                  </div>
                  <button
                    className="rounded-full bg-stone-900 px-5 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
                    type="button"
                    disabled={!cart.items.length || checkoutLoading}
                    onClick={(event) => {
                      event.stopPropagation();
                      onCheckoutCart(cart);
                    }}
                  >
                    {checkoutLoading ? '提交中...' : '提交'}
                  </button>
                </div>
              </section>
            );
          })}

          <footer className="flex flex-col gap-4 border-t border-stone-200 px-1 pt-2 md:flex-row md:items-center md:justify-between">
            <div className="text-sm text-stone-500">
              全部购物车
              <span className="ml-2 font-semibold text-stone-900">
                {cartCount} 件 / {formatPrice(allCartTotal)}
              </span>
            </div>
            <button
              className="rounded-full bg-stone-900 px-5 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
              type="button"
              disabled={!nonEmptyCartIds.length || checkoutLoading}
              onClick={onCheckoutAll}
            >
              {checkoutLoading ? '提交中...' : '全部提交'}
            </button>
          </footer>
        </div>
      </div>
    </div>
  );
}
