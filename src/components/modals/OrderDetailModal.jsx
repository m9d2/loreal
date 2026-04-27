import { formatPrice } from '../../utils/format.js';

export default function OrderDetailModal({
  orderDetailOpen,
  orderDetailLoading,
  orderDetailError,
  orderDetail,
  orderDetailSymbol,
  orderDetailStatusText,
  orderDetailNameLine,
  orderDetailAddressLine,
  orderDetailItems,
  orderDetailGifts,
  orderDetailMarketPrice,
  orderDetailActualPrice,
  orderDetailTotalPrice,
  formatDateTime,
  onCopyOrderId,
  onClose,
}) {
  if (!orderDetailOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button className="absolute inset-0 bg-stone-950/40" onClick={onClose} type="button" />
      <div className="relative z-10 flex h-[780px] w-[min(1100px,92vw)] max-w-4xl flex-col overflow-hidden rounded-[30px] border border-stone-200 bg-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-stone-200 px-6 py-4">
          <button
            className="rounded-full border border-stone-200 px-4 py-2 text-sm text-stone-600"
            type="button"
            onClick={onClose}
          >
            返回
          </button>
          <h2 className="text-lg font-semibold text-stone-900">订单详情</h2>
          <button
            className="rounded-full border border-stone-200 px-3 py-1 text-sm text-stone-600"
            type="button"
            onClick={onClose}
          >
            ✕
          </button>
        </header>

        <div className="grid gap-5 overflow-auto p-6">
          {orderDetailLoading && (
            <div className="rounded-[24px] border border-dashed border-stone-300 bg-stone-50 px-6 py-16 text-center text-sm text-stone-500">
              加载中...
            </div>
          )}

          {orderDetailError && !orderDetailLoading && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {orderDetailError}
            </div>
          )}

          {!orderDetailLoading && !orderDetailError && !orderDetail && (
            <div className="rounded-[24px] border border-dashed border-stone-300 bg-stone-50 px-6 py-16 text-center text-sm text-stone-500">
              暂无订单详情
            </div>
          )}

          {!orderDetailLoading && !orderDetailError && orderDetail && (
            <>
              <section className="grid justify-items-center gap-2 rounded-[24px] border border-stone-200 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-stone-900 text-xl font-semibold text-stone-900">
                  {orderDetailSymbol}
                </div>
                <div className="text-sm font-semibold text-stone-900">
                  {orderDetailStatusText}
                </div>
              </section>

              <section className="rounded-[24px] border border-stone-200 p-5">
                <h3 className="mb-3 text-sm font-semibold text-stone-900">收货地址</h3>
                <div className="space-y-1 text-sm text-stone-500">
                  <p>{orderDetailNameLine || '--'}</p>
                  <p>{orderDetailAddressLine || '--'}</p>
                </div>
              </section>

              <section className="rounded-[24px] border border-stone-200 p-5">
                <h3 className="mb-3 text-sm font-semibold text-stone-900">
                  商品清单 ({orderDetailItems.length})
                </h3>
                <div className="grid gap-3">
                  {orderDetailItems.map((item) => {
                    const imageUrl = item.item_pics?.[0] || item.image;
                    const quantity = item.num ?? item.quantity ?? 0;
                    return (
                      <div
                        className="grid grid-cols-[70px_1fr] items-center gap-4"
                        key={item.id || item.item_id}
                      >
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt=""
                            className="h-[70px] w-[70px] rounded-2xl object-cover"
                          />
                        ) : (
                          <div className="h-[70px] w-[70px] rounded-2xl bg-stone-100" />
                        )}
                        <div>
                          <h4 className="text-sm font-semibold text-stone-900">{item.item_name}</h4>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {item.package_desc && (
                              <span className="rounded-full border border-stone-900 px-2 py-1 text-xs text-stone-900">
                                {item.package_desc}
                              </span>
                            )}
                            {item.expiry_desc && (
                              <span className="rounded-full border border-stone-900 px-2 py-1 text-xs text-stone-900">
                                {item.expiry_desc}
                              </span>
                            )}
                          </div>
                          {item.item_spec && (
                            <p className="mt-2 text-sm text-stone-500">{item.item_spec}</p>
                          )}
                          <div className="mt-2 flex items-center justify-between text-sm">
                            <span className="font-semibold text-amber-700">
                              {formatPrice(item.price)}
                            </span>
                            <span className="text-stone-500">x {quantity}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {orderDetailGifts.length ? (
                <section className="rounded-[24px] border border-stone-200 p-5">
                  <h3 className="mb-3 text-sm font-semibold text-stone-900">赠品</h3>
                  <div className="grid gap-3">
                    {orderDetailGifts.map((gift, index) => (
                      <div
                        key={`${gift.rule_name}-${index}`}
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

              <section className="rounded-[24px] border border-stone-200 p-5">
                <h3 className="mb-3 text-sm font-semibold text-stone-900">支付信息</h3>
                <div className="grid gap-2 text-sm text-stone-500">
                  <div className="flex justify-between">
                    <span>原价</span>
                    <span>{formatPrice(orderDetailMarketPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>总价</span>
                    <span>{formatPrice(orderDetailActualPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>运费</span>
                    <span>{formatPrice(orderDetail?.shipping_fee)}</span>
                  </div>
                  <div className="flex justify-between text-base font-semibold text-stone-900">
                    <span>合计</span>
                    <span>{formatPrice(orderDetailTotalPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>支付方式</span>
                    <span>微信支付</span>
                  </div>
                </div>
              </section>

              <section className="rounded-[24px] border border-stone-200 p-5">
                <h3 className="mb-3 text-sm font-semibold text-stone-900">订单信息</h3>
                <div className="grid gap-3 text-sm text-stone-500">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <span>订单编号</span>
                    <div className="flex items-center gap-3">
                      <span className="text-stone-900">{orderDetail.order_id}</span>
                      <button
                        type="button"
                        className="rounded-full border border-stone-200 px-3 py-1 text-xs text-stone-700"
                        onClick={() => onCopyOrderId(orderDetail.order_id)}
                      >
                        复制
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <span>下单时间</span>
                    <span>{formatDateTime(orderDetail.create_time)}</span>
                  </div>
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
