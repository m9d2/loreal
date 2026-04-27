import {formatPrice} from '../../utils/format.js';

export default function ProductDetailModal({
                                               detailOpen,
                                               detail,
                                               detailItem,
                                               detailLoading,
                                               detailError,
                                               activeImages,
                                               isOutOfStock,
                                               detailBrand,
                                               activePrice,
                                               activeMarketPrice,
                                               displayStock,
                                               detailSpecList,
                                               selectedSpecId,
                                               setSelectedSpecId,
                                               quantity,
                                               setQuantity,
                                               canSelectSpec,
                                               actionItem,
                                               onClose,
                                               onAddToCart,
                                               onBuyNow,
                                           }) {
    if (!detailOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <button className="absolute inset-0 bg-stone-950/40" onClick={onClose} type="button"/>
            <div
                className="relative z-10 flex h-[780px] w-[min(1100px,92vw)] flex-col overflow-hidden rounded-[20px] bg-white shadow-[0_30px_80px_rgba(0,0,0,0.25)]">
                <header
                    className="grid grid-cols-[auto_1fr_auto] items-center border-b border-stone-200 bg-white px-5 py-3.5">
                    <button
                        className="justify-self-start rounded-full bg-stone-100 px-4 py-2 text-sm font-medium text-stone-700"
                        type="button"
                        onClick={onClose}
                    >
                        返回
                    </button>
                    <h2 className="px-4 text-center text-base font-semibold text-stone-900">
                        {detail.item_name || '商品详情'}
                    </h2>
                    <button
                        className="justify-self-end rounded-full bg-stone-100 px-3 py-1 text-sm text-stone-700"
                        type="button"
                        onClick={onClose}
                    >
                        ✕
                    </button>
                </header>

                <div className="flex-1 overflow-auto">
                    <div className="grid min-h-[420px] lg:grid-cols-[1.1fr_0.9fr]">
                        <div className="relative flex items-center justify-center bg-[#f5f6f8]">
                            {detailLoading ? (
                                <div
                                    className="h-full min-h-[420px] w-full animate-pulse bg-gradient-to-r from-stone-100 via-stone-50 to-stone-100"/>
                            ) : activeImages?.[0] ? (
                                <img
                                    src={activeImages[0]}
                                    alt={detail.item_name}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div
                                    className="flex h-full min-h-[420px] w-full items-center justify-center text-sm text-stone-500">
                                    暂无图片
                                </div>
                            )}
                            {isOutOfStock && (
                                <span
                                    className="absolute right-4 top-4 rounded-full bg-stone-900/90 px-3 py-1.5 text-xs font-medium text-white">
                  售罄
                </span>
                            )}
                        </div>

                        <div className="flex flex-col gap-4 p-[22px]">
                            <div className="space-y-4">
                                {detailBrand && (
                                    <div
                                        className="inline-flex self-start rounded-full bg-stone-900 px-3 py-1 text-xs text-white">
                                        {detailBrand}
                                    </div>
                                )}
                                <h3 className="text-[20px] font-semibold leading-[1.4] text-stone-900">
                                    {detail.item_name || detailItem?.item_name || '商品详情'}
                                </h3>
                                <div className="flex items-end gap-3">
                  <span className="text-[26px] font-semibold text-stone-900">
                    {formatPrice(activePrice)}
                  </span>
                                    <span className="text-sm text-stone-400 line-through">
                    {formatPrice(activeMarketPrice)}
                  </span>
                                </div>
                                <div className="text-sm text-stone-500">库存：{displayStock}</div>
                            </div>

                            <div className="space-y-2">
                                <div className="text-sm text-stone-500">规格</div>
                                <div className="grid gap-3">
                                    {detailSpecList.length ? (
                                        detailSpecList.map((spec, index) => {
                                            const stockNumber = Number(spec.stock);
                                            const isSoldOut = Number.isFinite(stockNumber) && stockNumber <= 0;
                                            return (
                                                <button
                                                    type="button"
                                                    key={`${spec.label}-${index}`}
                                                    className={`flex items-center justify-between gap-3 rounded-[14px] px-3.5 py-2.5 text-left text-[13px] leading-[1.4] transition ${
                                                        spec.id === selectedSpecId
                                                            ? 'bg-stone-900 text-white'
                                                            : isSoldOut
                                                                ? 'cursor-not-allowed bg-stone-100 text-stone-400'
                                                                : 'bg-[#e6e8ee] text-stone-700 hover:bg-stone-200'
                                                    }`}
                                                    onClick={() => {
                                                        if (isSoldOut) return;
                                                        setSelectedSpecId(spec.id);
                                                    }}
                                                >
                          <span className={`flex-1 ${isSoldOut ? 'line-through' : ''}`}>
                            {spec.label}
                          </span>
                                                    <span className="whitespace-nowrap text-xs opacity-80">
                            库存 {Number.isFinite(stockNumber) ? spec.stock : '--'}
                          </span>
                                                </button>
                                            );
                                        })
                                    ) : (
                                        <div
                                            className="rounded-[14px] bg-stone-100 px-3.5 py-2.5 text-sm text-stone-500">
                                            暂无规格
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-sm text-stone-500">
                                <span>购买数量</span>
                                <div
                                    className="inline-flex items-center gap-3 rounded-full border border-stone-200 bg-white px-3 py-2">
                                    <button
                                        type="button"
                                        className="text-lg leading-none text-stone-700"
                                        onClick={() => setQuantity((qty) => Math.max(1, qty - 1))}
                                    >
                                        -
                                    </button>
                                    <span className="text-sm text-stone-700">{quantity}</span>
                                    <button
                                        type="button"
                                        className="text-lg leading-none text-stone-700"
                                        onClick={() => setQuantity((qty) => qty + 1)}
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            {detailError && (
                                <div
                                    className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                    {detailError}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <footer className="shrink-0 border-t border-stone-200 bg-white px-5 py-4">
                    <div className="flex justify-end gap-3">
                        <button
                            className="
                              rounded-full border border-stone-900 bg-white px-5 py-2.5 text-sm font-semibold text-stone-900
                              transition-all duration-200
                              hover:bg-stone-900 hover:text-white hover:shadow-md
                              active:scale-95 active:shadow-sm
                              disabled:cursor-not-allowed disabled:opacity-50
                              disabled:hover:bg-white disabled:hover:text-stone-900 disabled:hover:shadow-none
                              disabled:active:scale-100"
                            type="button"
                            disabled={!canSelectSpec}
                            onClick={() => onAddToCart(actionItem, quantity)}
                        >
                            加入购物车
                        </button>
                        <button
                            className="rounded-full border border-stone-900 bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                            type="button"
                            disabled={isOutOfStock || !canSelectSpec}
                            onClick={() => onBuyNow(actionItem, quantity)}
                        >
                            立即购买
                        </button>
                    </div>
                </footer>
            </div>
        </div>
    );
}
