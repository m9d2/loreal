import { Pagination } from '../components/CatalogPage.jsx';
import { formatPrice } from '../utils/format.js';

export default function OrdersPage({
  orderStatus,
  orderStatuses,
  onChangeStatus,
  orderError,
  orderLoading,
  orderList,
  onOpenOrderDetail,
  formatDateTime,
  orderStatusLabel,
  orderPage,
  orderTotalPages,
  orderPageNumbers,
  onPageChange,
  orderListRef,
}) {
  return (
    <section className="space-y-6 rounded-[28px] border border-stone-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap gap-3">
        {orderStatuses.map((status) => (
          <button
            key={status.value}
            type="button"
            className={`rounded-full px-4 py-2 text-sm transition ${
              orderStatus === status.value
                ? 'bg-stone-900 text-white'
                : 'border border-stone-200 bg-white text-stone-700 hover:border-stone-400'
            }`}
            onClick={() => onChangeStatus(status.value)}
          >
            {status.label}
          </button>
        ))}
      </div>

      {orderError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {orderError}
        </div>
      )}

      <div className="grid gap-4" ref={orderListRef}>
        {orderLoading ? (
          <div className="rounded-[24px] border border-dashed border-stone-300 bg-stone-50 px-6 py-16 text-center text-sm text-stone-500">
            加载中...
          </div>
        ) : orderList.length ? (
          orderList.map((order) => {
            const items = Array.isArray(order.items)
              ? order.items
              : Array.isArray(order.item_list)
                ? order.item_list
                : Array.isArray(order.goods_items)
                  ? order.goods_items
                  : [];
            const totalQty =
              order.total_items_quantity ??
              items.reduce(
                (sum, item) => sum + Number(item.num || item.quantity || 0),
                0
              );
            const statusLabel = order.order_status_msg || orderStatusLabel(order.status);

            return (
              <div
                key={order.order_id}
                role="button"
                tabIndex={0}
                onClick={() => onOpenOrderDetail(order.order_id)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    onOpenOrderDetail(order.order_id);
                  }
                }}
                className="cursor-pointer rounded-[24px] border border-stone-200 p-5 transition hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-md"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-stone-500">
                  <span>订单号 {order.order_id}</span>
                  <span className="font-semibold text-stone-900">{statusLabel}</span>
                </div>
                <div className="mt-2 text-sm text-stone-500">
                  {formatDateTime(order.create_time)}
                </div>
                <div className="mt-4 grid gap-3">
                  {items.slice(0, 2).map((item) => {
                    const imageUrl = item.item_pics?.[0] || item.image;
                    const quantity = item.num ?? item.quantity ?? 0;
                    return (
                      <div
                        className="grid grid-cols-[56px_1fr] items-center gap-3"
                        key={`${item.item_id}-${item.id}`}
                      >
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt=""
                            className="h-14 w-14 rounded-xl object-cover"
                          />
                        ) : (
                          <div className="h-14 w-14 rounded-xl bg-stone-100" />
                        )}
                        <div>
                          <p className="text-sm font-medium text-stone-900">{item.item_name}</p>
                          <div className="mt-1 flex items-center gap-3 text-sm text-stone-500">
                            <span className="font-semibold text-stone-900">
                              {formatPrice(item.price)}
                            </span>
                            <span>x {quantity}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {items.length > 2 && (
                  <div className="mt-3 text-sm text-stone-500">
                    还有 {items.length - 2} 件商品
                  </div>
                )}
                <div className="mt-4 flex items-center justify-between text-sm font-semibold text-stone-900">
                  <span>共 {totalQty} 件</span>
                  <span>合计 {formatPrice(order.total_price ?? order.actual_price)}</span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="rounded-[24px] border border-dashed border-stone-300 bg-stone-50 px-6 py-16 text-center text-sm text-stone-500">
            暂无订单
          </div>
        )}
      </div>

      <Pagination
        page={orderPage}
        totalPages={orderTotalPages}
        pageNumbers={orderPageNumbers}
        loading={orderLoading}
        onPageChange={onPageChange}
      />
    </section>
  );
}
