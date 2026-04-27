export default function CartPickerModal({
  pendingItem,
  carts,
  activeCartId,
  onClose,
  onPick,
}) {
  return (
    <div className="fixed inset-0 z-999 flex items-center justify-center">
      <button className="absolute inset-0 bg-stone-950/40" type="button" onClick={onClose} />
      <div className="relative z-10 grid w-full max-w-md gap-4 rounded-[28px] border border-stone-200 bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-lg font-semibold text-stone-900">选择购物车</h3>
          <button
            type="button"
            className="rounded-full border border-stone-200 px-3 py-1 text-sm text-stone-600"
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        <p className="text-sm text-stone-500">
          {pendingItem?.item?.item_name || '当前商品'} 要加入哪个购物车？
        </p>
        <div className="grid gap-3">
          {carts.map((cart) => (
            <button
              key={cart.id}
              type="button"
              className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-sm transition ${
                cart.id === activeCartId
                  ? 'border-amber-700 bg-amber-50 text-stone-900'
                  : 'border-stone-200 bg-white text-stone-700 hover:border-stone-400'
              }`}
              onClick={() => onPick(cart.id)}
            >
              <span>{cart.name || '购物车'}</span>
              <span className="text-stone-500">
                {cart.items.reduce((sum, item) => sum + item.quantity, 0)} 件
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
