import { useState } from 'react';
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
  onExportOrders,
  exportLoading,
  exportProgress,
}) {
  const [exportMenuOpen, setExportMenuOpen] = useState(false);

  return (
    <section className="space-y-6 rounded-[28px] border border-stone-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center gap-3">
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
        <div className="relative ml-auto">
          <button
            type="button"
            disabled={exportLoading}
            className="flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2 text-sm text-stone-700 transition hover:border-stone-400 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => setExportMenuOpen((v) => !v)}
          >
            {exportLoading ? (
              <>
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-stone-300 border-t-stone-900" />
                {exportProgress || '导出中...'}
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                  <path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z" />
                  <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
                </svg>
                导出Excel
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                  <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 011.06 0L10 11.94l3.72-3.72a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.22 9.28a.75.75 0 010-1.06z" clipRule="evenodd" />
                </svg>
              </>
            )}
          </button>
          {exportMenuOpen && !exportLoading && (
            <div className="absolute right-0 z-20 mt-2 w-48 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-lg">
              <button
                type="button"
                className="flex w-full flex-col gap-0.5 px-4 py-3 text-left text-sm text-stone-700 hover:bg-stone-50"
                onClick={() => { setExportMenuOpen(false); onExportOrders('compact'); }}
              >
                <span className="font-medium">一行显示</span>
                <span className="text-xs text-stone-400">每个订单一行，商品换行展示</span>
              </button>
              <button
                type="button"
                className="flex w-full flex-col gap-0.5 border-t border-stone-100 px-4 py-3 text-left text-sm text-stone-700 hover:bg-stone-50"
                onClick={() => { setExportMenuOpen(false); onExportOrders('split'); }}
              >
                <span className="font-medium">拆分单元格</span>
                <span className="text-xs text-stone-400">每个商品/赠品各一行</span>
              </button>
            </div>
          )}
          {exportMenuOpen && (
            <button
              type="button"
              className="fixed inset-0 z-10"
              onClick={() => setExportMenuOpen(false)}
              aria-label="关闭"
            />
          )}
        </div>
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
