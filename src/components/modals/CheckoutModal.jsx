import { formatPrice } from '../../utils/format.js';

export default function CheckoutModal({
  checkoutData,
  checkoutError,
  checkoutInvalidItems,
  checkoutItemNameById,
  checkoutSnapshotCount,
  checkoutSnapshotTotal,
  onClose,
}) {
  const orders = Array.isArray(checkoutData)
    ? checkoutData
    : checkoutData
      ? [checkoutData]
      : [];
  const isMultiOrder = orders.length > 1;
  const displayCount = isMultiOrder
    ? orders.reduce(
        (sum, order) => sum + Number(order?.total_items_quantity || order?.items?.length || 0),
        0
      )
    : checkoutData?.total_items_quantity ?? checkoutSnapshotCount;
  const displayTotal = isMultiOrder
    ? orders.reduce((sum, order) => sum + Number(order?.total_price || 0), 0)
    : checkoutData?.total_price ?? checkoutSnapshotTotal;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button className="absolute inset-0 bg-stone-950/40" onClick={onClose} type="button" />
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-[30px] border border-stone-200 bg-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-stone-200 px-6 py-4">
          <button
            className="rounded-full border border-stone-200 px-4 py-2 text-sm text-stone-600"
            type="button"
            onClick={onClose}
          >
            返回
          </button>
          <h2 className="text-lg font-semibold text-stone-900">订单提交</h2>
          <button
            className="rounded-full border border-stone-200 px-3 py-1 text-sm text-stone-600"
            type="button"
            onClick={onClose}
          >
            ✕
          </button>
        </header>

        {checkoutError && (
          <div className="mx-6 mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {checkoutError}
          </div>
        )}

        {checkoutInvalidItems.length ? (
          <section className="mx-6 mt-4 rounded-[24px] border border-stone-200 bg-white p-5">
            <h3 className="mb-3 text-sm font-semibold text-stone-900">不可购买商品</h3>
            <div className="grid gap-3">
              {checkoutInvalidItems.map((item) => {
                const name =
                  checkoutItemNameById.get(item.item_id) || `商品ID ${item.item_id}`;
                return (
                  <div
                    key={item.item_id}
                    className="flex flex-col gap-3 rounded-2xl border border-dashed border-stone-300 px-4 py-3 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      {item.cartName ? (
                        <p className="mb-1 text-xs font-medium text-stone-500">
                          {item.cartName}
                        </p>
                      ) : null}
                      <p className="text-sm font-semibold text-stone-900">{name}</p>
                      <p className="mt-1 text-sm text-red-700">
                        {item.message || '当前商品不可购买'}
                      </p>
                    </div>
                    <div className="grid gap-1 text-xs text-stone-500 md:text-right">
                      <span>请求 {item.requested_quantity ?? '-'}</span>
                      <span>可用 {item.available_quantity ?? '-'}</span>
                      <span>调整 {item.adjusted_quantity ?? '-'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ) : null}

        <div className="grid gap-5 overflow-auto p-6">
          {orders.length ? (
            <>
              {orders.map((order, orderIndex) => (
                <section
                  key={order.cartId || order.order_id || orderIndex}
                  className="rounded-[24px] border border-stone-200 p-5"
                >
                  {isMultiOrder ? (
                    <div className="mb-4 flex items-center justify-between gap-3 border-b border-stone-200 pb-4">
                      <div>
                        <h3 className="text-sm font-semibold text-stone-900">
                          {order.cartName || `订单 ${orderIndex + 1}`}
                        </h3>
                        <p className="mt-1 text-xs text-stone-500">
                          共 {order.total_items_quantity ?? order.items?.length ?? 0} 件
                        </p>
                      </div>
                      <div className="text-right text-sm text-stone-500">
                        <div>合计</div>
                        <div className="font-semibold text-stone-900">
                          {formatPrice(order.total_price)}
                        </div>
                      </div>
                    </div>
                  ) : null}

                  <div className="grid gap-5">
                    <section className="rounded-[20px] border border-stone-200 p-5">
                      <h3 className="mb-3 text-sm font-semibold text-stone-900">收货地址</h3>
                      {order.address ? (
                        <div className="space-y-1 text-sm text-stone-500">
                          <p>
                            {order.address.name} {order.address.mobile}
                          </p>
                          <p>
                            {order.address.province}
                            {order.address.city}
                            {order.address.district}
                            {order.address.address}
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-stone-500">暂无地址信息</p>
                      )}
                    </section>

                    <section className="rounded-[20px] border border-stone-200 p-5">
                      <h3 className="mb-3 text-sm font-semibold text-stone-900">商品清单</h3>
                      <div className="grid gap-3">
                        {order.items?.map((item) => (
                          <div
                            className="grid grid-cols-[70px_1fr] items-center gap-4"
                            key={`${order.cartId || orderIndex}-${item.item_id}`}
                          >
                            <img
                              src={item.image}
                              alt={item.item_name}
                              className="h-[70px] w-[70px] rounded-2xl object-cover"
                            />
                            <div>
                              <h4 className="text-sm font-semibold text-stone-900">
                                {item.item_name}
                              </h4>
                              <p className="mt-1 text-sm text-stone-500">{item.spec}</p>
                              <div className="mt-1 flex items-center justify-between text-sm">
                                <span className="font-semibold text-amber-700">
                                  {formatPrice(item.price)}
                                </span>
                                <span className="text-stone-500">x {item.quantity}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>

                    {order.gift_items?.length ? (
                      <section className="rounded-[20px] border border-stone-200 p-5">
                        <h3 className="mb-3 text-sm font-semibold text-stone-900">赠品</h3>
                        <div className="grid gap-3">
                          {order.gift_items.map((gift, index) => (
                            <div
                              key={`${order.cartId || orderIndex}-${gift.rule_name}-${index}`}
                              className="flex flex-col gap-1 rounded-2xl bg-stone-50 px-4 py-3 text-sm text-stone-500 md:flex-row md:items-center md:justify-between"
                            >
                              <p>{gift.rule_name}</p>
                              <span>
                                应赠 x {gift.theoretical_quantity} · 实赠 x {gift.actual_quantity}
                              </span>
                            </div>
                          ))}
                        </div>
                      </section>
                    ) : null}

                    <section className="rounded-[20px] border border-stone-200 p-5">
                      <h3 className="mb-3 text-sm font-semibold text-stone-900">支付信息</h3>
                      <div className="grid gap-2 text-sm text-stone-500">
                        <div className="flex justify-between">
                          <span>原价</span>
                          <span>{formatPrice(order.market_price)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>总价</span>
                          <span>{formatPrice(order.actual_price)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>运费</span>
                          <span>{formatPrice(order.shipping_fee)}</span>
                        </div>
                        <div className="flex justify-between text-base font-semibold text-stone-900">
                          <span>合计</span>
                          <span>{formatPrice(order.total_price)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>支付方式</span>
                          <span>微信支付</span>
                        </div>
                      </div>
                    </section>
                  </div>
                </section>
              ))}
            </>
          ) : (
            !checkoutError && (
              <div className="rounded-[24px] border border-dashed border-stone-300 bg-stone-50 px-6 py-16 text-center text-sm text-stone-500">
                暂无订单数据
              </div>
            )
          )}
        </div>

        <footer className="flex flex-col gap-4 border-t border-stone-200 px-6 py-4 md:flex-row md:items-center md:justify-between">
          <div className="text-sm text-stone-500">
            共 {displayCount} 件 合计{' '}
            <span className="font-semibold text-stone-900">
              {formatPrice(displayTotal)}
            </span>
          </div>
          <button
            className="rounded-full bg-stone-900 px-5 py-2.5 text-sm font-medium text-white"
            type="button"
            onClick={onClose}
          >
            完成
          </button>
        </footer>
      </div>
    </div>
  );
}
