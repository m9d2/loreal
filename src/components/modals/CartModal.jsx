import { useEffect, useRef, useState } from 'react';
import CartContent from '../cart/CartContent.jsx';

export default function CartModal({
  carts,
  activeCartId,
  editingCartId,
  cartNameDraft,
  cartCount,
  allCartTotal,
  checkoutLoading,
  nonEmptyCartIds,
  onClose,
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
}) {
  const [visible, setVisible] = useState(false);
  const closeTimerRef = useRef(null);
  const isClosingRef = useRef(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setVisible(true);
    });
    return () => {
      cancelAnimationFrame(frame);
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  const handleClose = () => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;
    setVisible(false);
    closeTimerRef.current = setTimeout(() => {
      onClose();
    }, 260);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-end">
      <button
        className={`absolute inset-0 bg-stone-950/40 transition-opacity duration-300 ${
          visible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
        type="button"
      />
      <div
        className={`relative z-10 flex h-full w-full max-w-[760px] flex-col overflow-hidden bg-white shadow-2xl transition-transform duration-300 ease-out ${
          visible ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <CartContent
          carts={carts}
          activeCartId={activeCartId}
          editingCartId={editingCartId}
          cartNameDraft={cartNameDraft}
          cartCount={cartCount}
          allCartTotal={allCartTotal}
          checkoutLoading={checkoutLoading}
          nonEmptyCartIds={nonEmptyCartIds}
          onClose={handleClose}
          onCreateCart={onCreateCart}
          onSetActiveCart={onSetActiveCart}
          onCartNameDraftChange={onCartNameDraftChange}
          onFinishCartRename={onFinishCartRename}
          onCancelCartRename={onCancelCartRename}
          onStartCartRename={onStartCartRename}
          onDeleteCart={onDeleteCart}
          onUpdateCartQty={onUpdateCartQty}
          onRemoveCartItem={onRemoveCartItem}
          onCheckoutCart={onCheckoutCart}
          onCheckoutAll={onCheckoutAll}
        />
      </div>
    </div>
  );
}
