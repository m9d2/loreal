import { useEffect, useMemo, useRef, useState } from 'react';
import {
  NavLink,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import {
  clearAuth,
  createDirectOrder,
  fetchBrandTags,
  fetchOrderDetail,
  fetchOrderList,
  fetchProducts,
  fetchProductDetail,
  fetchSearchTags,
  fetchTags,
  getStoredAuth,
  saveAuth,
} from './api.js';
import { exportOrdersToExcel } from './utils/exportOrders.js';
import {
  IconBag,
  IconCart,
  IconCategory,
  IconHome,
  IconLogin,
  IconOrder,
  IconSearch,
} from './components/Icons.jsx';
import GiftPage from './pages/GiftPage.jsx';
import CategoryPage from './pages/CategoryPage.jsx';
import OrdersPage from './pages/OrdersPage.jsx';
import HomePage from './pages/HomePage.jsx';
import SearchPage from './pages/SearchPage.jsx';
import CartPage from './pages/CartPage.jsx';
import LoginModal from './components/modals/LoginModal.jsx';
import CartModal from './components/modals/CartModal.jsx';
import CartPickerModal from './components/modals/CartPickerModal.jsx';
import OrderDetailModal from './components/modals/OrderDetailModal.jsx';
import ProductDetailModal from './components/modals/ProductDetailModal.jsx';
import CheckoutModal from './components/modals/CheckoutModal.jsx';

const PAGE_SIZE = 10;
const CATEGORY_PAGE_SIZE = 10;

const CATEGORY_GROUPS = [
  {
    id: 'mass',
    name: '大众化妆品部',
    brands: [
      { id: 6, name: '巴黎欧莱雅' },
      { id: 7, name: '美宝莲' },
      { id: 8, name: '三熹玉' },
    ],
  },
  {
    id: 'professional',
    name: '专业美发部',
    brands: [
      { id: 9, name: '巴黎欧莱雅沙龙专属' },
      { id: 10, name: '卡诗' },
    ],
  },
  {
    id: 'derm',
    name: '皮肤科学美容事业部',
    brands: [
      { id: 12, name: '薇姿' },
      { id: 13, name: '理肤泉' },
      { id: 14, name: '适乐肤' },
      { id: 15, name: '修丽可' },
    ],
  },
  {
    id: 'luxury',
    name: '高端化妆品部',
    brands: [
      { id: 17, name: '圣罗兰' },
      { id: 18, name: '赫莲娜' },
      { id: 19, name: '植村秀' },
      { id: 20, name: '普拉达' },
      { id: 21, name: '阿玛尼' },
      { id: 22, name: '华伦天奴美妆' },
      { id: 23, name: '科颜氏' },
      { id: 24, name: '碧欧泉' },
      { id: 25, name: 'TAKAMI' },
      { id: 26, name: '兰蔻' },
      { id: 27, name: '伊索' },
      { id: 28, name: 'URBAN DECAY' },
    ],
  },
];

let cartSeed = 0;
const CARTS_STORAGE_KEY = 'loreal-carts';
const ACTIVE_CART_STORAGE_KEY = 'loreal-active-cart-id';

const createCartId = () => `cart-${Date.now()}-${++cartSeed}`;

const createDefaultCart = () => ({
  id: createCartId(),
  name: '购物车',
  items: [],
});

const normalizeStoredCart = (cart) => {
  if (!cart || typeof cart !== 'object') return null;
  const id = typeof cart.id === 'string' && cart.id ? cart.id : createCartId();
  const name = typeof cart.name === 'string' && cart.name.trim() ? cart.name : '购物车';
  const items = Array.isArray(cart.items)
    ? cart.items.filter((item) => item && typeof item === 'object' && item.item_id)
    : [];
  return { id, name, items };
};

const getStoredCarts = (fallbackCartId) => {
  if (typeof window === 'undefined') {
    return [{ id: fallbackCartId, name: '购物车', items: [] }];
  }
  try {
    const raw = window.localStorage.getItem(CARTS_STORAGE_KEY);
    const parsed = JSON.parse(raw || '[]');
    const carts = Array.isArray(parsed)
      ? parsed.map(normalizeStoredCart).filter(Boolean)
      : [];
    return carts.length
      ? carts
      : [{ id: fallbackCartId, name: '购物车', items: [] }];
  } catch {
    return [{ id: fallbackCartId, name: '购物车', items: [] }];
  }
};

const getStoredActiveCartId = (carts, fallbackCartId) => {
  if (typeof window === 'undefined') return fallbackCartId;
  try {
    const storedId = window.localStorage.getItem(ACTIVE_CART_STORAGE_KEY);
    return carts.some((cart) => cart.id === storedId) ? storedId : carts[0]?.id || fallbackCartId;
  } catch {
    return carts[0]?.id || fallbackCartId;
  }
};

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;
  const isHomeRoute = pathname === '/';
  const isGiftRoute = pathname === '/gift';
  const isCategoryRoute = pathname === '/category';
  const isOrdersRoute = pathname === '/orders';
  const isSearchRoute = pathname === '/search';
  const isCartRoute = pathname === '/cart';
  const [tags, setTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState('全部');
  const [search, setSearch] = useState('');
  const [sortState, setSortState] = useState({ key: 'default', direction: 'asc' });
  const [viewMode, setViewMode] = useState('grid');

  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [loadingTags, setLoadingTags] = useState(false);
  const [loadingList, setLoadingList] = useState(false);
  const [error, setError] = useState('');
  const searchPrevPathRef = useRef('/gift');
  const [searchTags, setSearchTags] = useState([]);
  const [selectedSearchTag, setSelectedSearchTag] = useState('全部');
  const [searchProducts, setSearchProducts] = useState([]);
  const [searchPage, setSearchPage] = useState(1);
  const [searchTotalCount, setSearchTotalCount] = useState(0);
  const [searchTagLoading, setSearchTagLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');

  const [auth, setAuth] = useState(() => getStoredAuth());
  const [showLogin, setShowLogin] = useState(false);
  const [tokenInput, setTokenInput] = useState(auth.token);
  const [appidInput, setAppidInput] = useState(auth.appid);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailItem, setDetailItem] = useState(null);
  const [detailData, setDetailData] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedSpecId, setSelectedSpecId] = useState(null);

  const defaultCartIdRef = useRef(null);
  if (!defaultCartIdRef.current) {
    defaultCartIdRef.current = createCartId();
  }
  const [carts, setCarts] = useState(() => getStoredCarts(defaultCartIdRef.current));
  const [activeCartId, setActiveCartId] = useState(() =>
    getStoredActiveCartId(getStoredCarts(defaultCartIdRef.current), defaultCartIdRef.current)
  );
  const [editingCartId, setEditingCartId] = useState(null);
  const [cartNameDraft, setCartNameDraft] = useState('');
  const [pendingCartItem, setPendingCartItem] = useState(null);
  const [cartAnimating, setCartAnimating] = useState(false);
  const cartAnimTimerRef = useRef(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutData, setCheckoutData] = useState(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [checkoutInvalidItems, setCheckoutInvalidItems] = useState([]);
  const [checkoutItemsSnapshot, setCheckoutItemsSnapshot] = useState([]);
  const [orderStatus, setOrderStatus] = useState('all');
  const [orderList, setOrderList] = useState([]);
  const [orderPage, setOrderPage] = useState(1);
  const [orderTotal, setOrderTotal] = useState(0);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [orderDetailOpen, setOrderDetailOpen] = useState(false);
  const [orderDetailLoading, setOrderDetailLoading] = useState(false);
  const [orderDetailError, setOrderDetailError] = useState('');
  const [orderDetail, setOrderDetail] = useState(null);
  const orderListScrollRef = useRef(null);
  const orderListScrollTopRef = useRef(0);
  const shouldRestoreOrderScroll = useRef(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportProgress, setExportProgress] = useState('');

  const [categoryGroupId, setCategoryGroupId] = useState(CATEGORY_GROUPS[0].id);
  const [categoryBrand, setCategoryBrand] = useState(
    CATEGORY_GROUPS[0]?.brands?.[0] || null
  );
  const [categoryTags, setCategoryTags] = useState([]);
  const [selectedCategoryTag, setSelectedCategoryTag] = useState('全部');
  const [categoryProducts, setCategoryProducts] = useState([]);
  const [categoryPage, setCategoryPage] = useState(1);
  const [categoryTotalCount, setCategoryTotalCount] = useState(0);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [categoryError, setCategoryError] = useState('');

  const isAuthed = Boolean(auth.token && auth.appid);
  const cartCount = carts.reduce(
    (sum, cart) =>
      sum + cart.items.reduce((cartSum, item) => cartSum + item.quantity, 0),
    0
  );
  const goodsSortValue =
    sortState.key === 'default' ? 3 : sortState.direction === 'asc' ? 2 : 1;

  const hasAuth = () => {
    const stored = getStoredAuth();
    return Boolean(stored.token && stored.appid);
  };

  const loadTags = async () => {
    setLoadingTags(true);
    setError('');
    if (!hasAuth()) {
      setLoadingTags(false);
      setError('请先点击右上角登录配置 token 与 appid');
      return;
    }
    try {
      const data = await fetchTags();
      const list = Array.isArray(data) ? data : [];
      setTags(['全部', ...list]);
    } catch (err) {
      setError(err.message || '获取标签失败');
    } finally {
      setLoadingTags(false);
    }
  };

  const loadProducts = async (nextPage) => {
    setLoadingList(true);
    setError('');
    if (!hasAuth()) {
      setLoadingList(false);
      setError('请先点击右上角登录配置 token 与 appid');
      return;
    }
    try {
      const tagParam = selectedTag === '全部' ? '' : selectedTag;
      const data = await fetchProducts({
        page: nextPage,
        pageSize: PAGE_SIZE,
        tags: tagParam,
        goodsSort: goodsSortValue,
        isCombo: true,
      });
      const list = Array.isArray(data?.list) ? data.list : [];
      setTotalCount(Number(data?.total_count || 0));
      setProducts(list);
      setPage(nextPage);
    } catch (err) {
      setError(err.message || '获取商品失败');
    } finally {
      setLoadingList(false);
    }
  };

  const loadSearchTags = async () => {
    setSearchTagLoading(true);
    setSearchError('');
    if (!hasAuth()) {
      setSearchTagLoading(false);
      setSearchError('请先点击右上角登录配置 token 与 appid');
      return;
    }
    const keyword = search.trim();
    if (!keyword) {
      setSearchTagLoading(false);
      setSearchTags([]);
      return;
    }
    setSelectedSearchTag('全部');
    try {
      const data = await fetchSearchTags(keyword);
      const list = Array.isArray(data) ? data : [];
      setSearchTags(['全部', ...list]);
    } catch (err) {
      setSearchError(err.message || '获取标签失败');
    } finally {
      setSearchTagLoading(false);
    }
  };

  const loadSearchProducts = async (nextPage) => {
    setSearchLoading(true);
    setSearchError('');
    if (!hasAuth()) {
      setSearchLoading(false);
      setSearchError('请先点击右上角登录配置 token 与 appid');
      return;
    }
    const keyword = search.trim();
    if (!keyword) {
      setSearchLoading(false);
      setSearchProducts([]);
      setSearchTotalCount(0);
      setSearchPage(1);
      return;
    }
    try {
      const tagParam = selectedSearchTag === '全部' ? '' : selectedSearchTag;
      const data = await fetchProducts({
        page: nextPage,
        pageSize: PAGE_SIZE,
        tags: tagParam,
        keywords: keyword,
        goodsSort: goodsSortValue,
        isCombo: false,
      });
      const list = Array.isArray(data?.list) ? data.list : [];
      setSearchProducts(list);
      setSearchTotalCount(Number(data?.total_count || 0));
      setSearchPage(nextPage);
    } catch (err) {
      setSearchError(err.message || '获取商品失败');
    } finally {
      setSearchLoading(false);
    }
  };

  const loadCategoryTags = async (brandId) => {
    setCategoryTags([]);
    setCategoryError('');
    if (!hasAuth()) {
      setCategoryError('请先点击右上角登录配置 token 与 appid');
      return;
    }
    try {
      const data = await fetchBrandTags(brandId);
      const list = Array.isArray(data) ? data : [];
      setCategoryTags(['全部', ...list]);
    } catch (err) {
      setCategoryError(err.message || '获取标签失败');
    }
  };

  const loadCategoryProducts = async (nextPage, brand = categoryBrand) => {
    if (!brand) return;
    setCategoryLoading(true);
    setCategoryError('');
    if (!hasAuth()) {
      setCategoryLoading(false);
      setCategoryError('请先点击右上角登录配置 token 与 appid');
      return;
    }
    try {
      const tagParam = selectedCategoryTag === '全部' ? '' : selectedCategoryTag;
      const data = await fetchProducts({
        page: nextPage,
        pageSize: CATEGORY_PAGE_SIZE,
        tags: tagParam,
        brandId: brand.id,
        keywords: search,
        goodsSort: goodsSortValue,
        isCombo: false,
      });
      const list = Array.isArray(data?.list) ? data.list : [];
      setCategoryProducts(list);
      setCategoryTotalCount(Number(data?.total_count || 0));
      setCategoryPage(nextPage);
    } catch (err) {
      setCategoryError(err.message || '获取商品失败');
    } finally {
      setCategoryLoading(false);
    }
  };

  useEffect(() => {
    loadTags();
  }, []);

  useEffect(() => {
    if (!isGiftRoute && !isHomeRoute) return;
    loadProducts(1);
  }, [selectedTag, sortState, isGiftRoute, isHomeRoute]);

  useEffect(() => {
    if (!isCategoryRoute) return;
    const nextGroup =
      CATEGORY_GROUPS.find((group) => group.id === categoryGroupId) ||
      CATEGORY_GROUPS[0];
    const nextBrand = nextGroup?.brands?.[0] || null;
    setCategoryBrand(nextBrand);
    setCategoryTags([]);
    setSelectedCategoryTag('全部');
    setCategoryProducts([]);
    setCategoryPage(1);
  }, [isCategoryRoute, categoryGroupId]);

  useEffect(() => {
    if (!isCategoryRoute || !categoryBrand) return;
    loadCategoryTags(categoryBrand.id);
  }, [isCategoryRoute, categoryBrand]);

  useEffect(() => {
    if (!isCategoryRoute || !categoryBrand) return;
    const timer = setTimeout(() => {
      loadCategoryProducts(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [isCategoryRoute, categoryBrand, selectedCategoryTag, search, sortState]);

  useEffect(() => {
    if (!isSearchRoute) return;
    loadSearchTags();
  }, [isSearchRoute, search]);

  useEffect(() => {
    if (!isSearchRoute) return;
    const timer = setTimeout(() => {
      loadSearchProducts(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [isSearchRoute, search, selectedSearchTag, sortState]);

  useEffect(() => {
    if (!isOrdersRoute) return;
    if (orderList.length) return;
    loadOrders(1, orderStatus);
  }, [isOrdersRoute]);

  const visibleProducts = useMemo(() => {
    let filtered = products;
    if (selectedTag !== '全部') {
      filtered = filtered.filter((item) => item.tags === selectedTag);
    }
    if (search.trim()) {
      const keyword = search.trim();
      filtered = filtered.filter(
        (item) =>
          item.item_name?.includes(keyword) ||
          item.brief?.includes(keyword) ||
          item.item_spec?.includes(keyword)
      );
    }
    return filtered;
  }, [products, selectedTag, search]);

  const visibleCategoryProducts = useMemo(() => {
    return categoryProducts;
  }, [categoryProducts]);

  const visibleSearchProducts = useMemo(() => {
    return searchProducts;
  }, [searchProducts]);

  const handleDefaultSort = () => {
    setSortState({ key: 'default', direction: 'asc' });
  };

  const handlePriceSort = () => {
    setSortState((prev) => {
      if (prev.key !== 'price') {
        return { key: 'price', direction: 'asc' };
      }
      return { key: 'price', direction: prev.direction === 'asc' ? 'desc' : 'asc' };
    });
  };

  const openLogin = () => {
    setTokenInput(auth.token || '');
    setAppidInput(auth.appid || '');
    setShowLogin(true);
  };

  const startSearch = () => {
    const keyword = search.trim();
    if (!keyword) return;
    if (!isSearchRoute) {
      searchPrevPathRef.current = pathname;
    }
    setSelectedSearchTag('全部');
    setSearchTags([]);
    setSearchProducts([]);
    setSearchPage(1);
    setSearchTotalCount(0);
    setSearchError('');
    navigate('/search');
  };

  const clearSearchInput = () => {
    setSearch('');
    if (isSearchRoute) {
      setSearchTags([]);
      setSelectedSearchTag('全部');
      setSearchProducts([]);
      setSearchPage(1);
      setSearchTotalCount(0);
      setSearchError('');
    }
  };

  const exitSearch = () => {
    setSearch('');
    setSearchTags([]);
    setSelectedSearchTag('全部');
    setSearchProducts([]);
    setSearchPage(1);
    setSearchTotalCount(0);
    setSearchError('');
    navigate(searchPrevPathRef.current || '/gift');
  };

  const handleLoginSubmit = (event) => {
    event.preventDefault();
    const next = {
      token: tokenInput.trim(),
      appid: appidInput.trim(),
    };
    saveAuth(next);
    setAuth(next);
    setShowLogin(false);
    loadTags();
    loadProducts(1);
  };

  const handleClearAuth = () => {
    clearAuth();
    setAuth({ token: '', appid: '' });
    setTokenInput('');
    setAppidInput('');
  };

  const buildCartItem = (item, qty) => ({
    item_id: item.item_id,
    item_name: item.item_name,
    price: item.price,
    market_price: item.market_price,
    quantity: qty,
    image: item.pics?.[0] || item.image || item.item_pics?.[0] || '',
    spec: item.item_spec || item.spec || '',
    tags: item.tags || '',
  });

  const triggerCartAnimation = () => {
    if (cartAnimTimerRef.current) {
      clearTimeout(cartAnimTimerRef.current);
    }
    setCartAnimating(false);
    requestAnimationFrame(() => setCartAnimating(true));
    cartAnimTimerRef.current = setTimeout(() => {
      setCartAnimating(false);
    }, 450);
  };

  const addItemToCart = (cartId, item, qty = 1) => {
    if (!cartId || !item?.item_id) return;
    setActiveCartId(cartId);
    setCarts((prev) =>
      prev.map((cart) => {
        if (cart.id !== cartId) return cart;
        const existing = cart.items.find((entry) => entry.item_id === item.item_id);
        const items = existing
          ? cart.items.map((entry) =>
              entry.item_id === item.item_id
                ? { ...entry, quantity: entry.quantity + qty }
                : entry
            )
          : [...cart.items, buildCartItem(item, qty)];
        return { ...cart, items };
      })
    );
    triggerCartAnimation();
  };

  const addToCart = (item, qty = 1) => {
    if (!item?.item_id) return;
    if (carts.length > 1) {
      setPendingCartItem({ item, qty });
      return;
    }
    addItemToCart(activeCartId, item, qty);
  };

  const updateCartQty = (cartId, itemId, nextQty) => {
    setActiveCartId(cartId);
    setCarts((prev) =>
      prev.map((cart) => {
        if (cart.id !== cartId) return cart;
        const items =
          nextQty <= 0
            ? cart.items.filter((entry) => entry.item_id !== itemId)
            : cart.items.map((entry) =>
                entry.item_id === itemId ? { ...entry, quantity: nextQty } : entry
              );
        return { ...cart, items };
      })
    );
  };

  const removeCartItem = (cartId, itemId) => {
    setActiveCartId(cartId);
    setCarts((prev) =>
      prev.map((cart) =>
        cart.id === cartId
          ? {
              ...cart,
              items: cart.items.filter((entry) => entry.item_id !== itemId),
            }
          : cart
      )
    );
  };

  const createCart = () => {
    const nextCart = createDefaultCart();
    setCarts((prev) => [...prev, nextCart]);
    setActiveCartId(nextCart.id);
    setEditingCartId(nextCart.id);
    setCartNameDraft(nextCart.name);
  };

  const deleteCart = (cartId) => {
    if (!cartId) return;
    setCarts((prev) => {
      const next = prev.filter((cart) => cart.id !== cartId);
      return next.length ? next : [createDefaultCart()];
    });
    if (editingCartId === cartId) {
      setEditingCartId(null);
      setCartNameDraft('');
    }
  };

  const startCartRename = (cart) => {
    setActiveCartId(cart.id);
    setEditingCartId(cart.id);
    setCartNameDraft(cart.name || '购物车');
  };

  const finishCartRename = (cartId) => {
    const nextName = cartNameDraft.trim() || '购物车';
    setCarts((prev) =>
      prev.map((cart) => (cart.id === cartId ? { ...cart, name: nextName } : cart))
    );
    setEditingCartId(null);
    setCartNameDraft('');
  };

  const cancelCartRename = () => {
    setEditingCartId(null);
    setCartNameDraft('');
  };

  const handlePendingCartPick = (cartId) => {
    if (!pendingCartItem) return;
    addItemToCart(cartId, pendingCartItem.item, pendingCartItem.qty);
    setPendingCartItem(null);
  };

  const handleCheckout = async (itemsOverride, options = {}) => {
    const itemsToCheckout =
      itemsOverride || carts.flatMap((cart) => cart.items);
    const normalizedItems = itemsToCheckout.filter(
      (item) => item?.item_id && Number(item.quantity) > 0
    );
    if (!normalizedItems.length) {
      setCheckoutError('请选择要提交的商品');
      setCheckoutOpen(true);
      return;
    }
    if (!hasAuth()) {
      setCheckoutError('请先点击右上角登录配置 token 与 appid');
      setCheckoutOpen(true);
      return;
    }
    setCheckoutLoading(true);
    setCheckoutError('');
    setCheckoutData(null);
    setCheckoutInvalidItems([]);
    setCheckoutItemsSnapshot(normalizedItems);
    try {
      const data = await createDirectOrder(normalizedItems);
      setCheckoutData(data);
      setCheckoutOpen(true);
      if (options.cartIdsToClear?.length) {
        setCarts((prev) =>
          prev.map((cart) =>
            options.cartIdsToClear.includes(cart.id) ? { ...cart, items: [] } : cart
          )
        );
      } else if (!itemsOverride) {
        setCarts((prev) => prev.map((cart) => ({ ...cart, items: [] })));
      }
      if (options.closeCartOnSuccess) {
        setCartOpen(false);
      }
    } catch (err) {
      const payload = err?.payload;
      const invalidItems = Array.isArray(payload?.data?.item_status)
        ? payload.data.item_status
        : [];
      if (payload?.code === 400 && invalidItems.length) {
        setCheckoutInvalidItems(invalidItems);
      }
      setCheckoutError(err.message || '提交失败');
      setCheckoutOpen(true);
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleCheckoutAll = async (options = {}) => {
    const cartsToCheckout = carts
      .map((cart) => ({
        ...cart,
        items: cart.items.filter((item) => item?.item_id && Number(item.quantity) > 0),
      }))
      .filter((cart) => cart.items.length);
    const allItems = cartsToCheckout.flatMap((cart) => cart.items);

    if (!allItems.length) {
      setCheckoutError('请选择要提交的商品');
      setCheckoutOpen(true);
      return;
    }
    if (!hasAuth()) {
      setCheckoutError('请先点击右上角登录配置 token 与 appid');
      setCheckoutOpen(true);
      return;
    }

    setCheckoutLoading(true);
    setCheckoutError('');
    setCheckoutData(null);
    setCheckoutInvalidItems([]);
    setCheckoutItemsSnapshot(allItems);

    const successOrders = [];
    const successCartIds = [];
    const invalidItems = [];
    const errorMessages = [];

    try {
      for (const cart of cartsToCheckout) {
        try {
          const data = await createDirectOrder(cart.items);
          successOrders.push({
            ...data,
            cartId: cart.id,
            cartName: cart.name || '购物车',
          });
          successCartIds.push(cart.id);
        } catch (err) {
          const payload = err?.payload;
          const cartInvalidItems = Array.isArray(payload?.data?.item_status)
            ? payload.data.item_status.map((item) => ({
                ...item,
                cartId: cart.id,
                cartName: cart.name || '购物车',
              }))
            : [];
          if (cartInvalidItems.length) {
            invalidItems.push(...cartInvalidItems);
          }
          errorMessages.push(`${cart.name || '购物车'}：${err.message || '提交失败'}`);
        }
      }

      if (successOrders.length) {
        setCheckoutData(successOrders.length === 1 ? successOrders[0] : successOrders);
        setCarts((prev) =>
          prev.map((cart) =>
            successCartIds.includes(cart.id) ? { ...cart, items: [] } : cart
          )
        );
      }
      if (invalidItems.length) {
        setCheckoutInvalidItems(invalidItems);
      }
      if (errorMessages.length) {
        setCheckoutError(errorMessages.join('；'));
      }
      setCheckoutOpen(true);
      if (options.closeCartOnSuccess && successOrders.length) {
        setCartOpen(false);
      }
    } finally {
      setCheckoutLoading(false);
    }
  };

  const ORDER_STATUS = [
    { label: '全部', value: 'all' },
    { label: '待支付', value: '0' },
    { label: '待发货', value: '1' },
    { label: '已发货', value: '2' },
    { label: '已取消', value: '3' },
    { label: '已完成', value: '4' },
  ];

  const orderStatusLabel = (status) => {
    const mapping = {
      0: '待支付',
      1: '待发货',
      2: '已发货',
      3: '已取消',
      4: '已完成',
    };
    const key = Number(status);
    return mapping[key] || '未知状态';
  };

  const formatDateTime = (timestamp) => {
    if (!timestamp) return '--';
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const loadOrders = async (nextPage, nextStatus = orderStatus) => {
    setOrderLoading(true);
    setOrderError('');
    setOrderStatus(nextStatus);
    if (!hasAuth()) {
      setOrderLoading(false);
      setOrderError('请先点击右上角登录配置 token 与 appid');
      return;
    }
    try {
      const data = await fetchOrderList({
        page: nextPage,
        pageSize: 10,
        status: nextStatus,
      });
      const list = Array.isArray(data?.list)
        ? data.list
        : Array.isArray(data?.orders)
          ? data.orders
          : Array.isArray(data)
            ? data
            : [];
      const pagerCount = Number(data?.pager?.count || 0);
      const pagerPage = Number(data?.pager?.page || nextPage);
      setOrderList(list);
      setOrderTotal(
        pagerCount || Number(data?.total_count || data?.total || list.length || 0)
      );
      setOrderPage(pagerPage);
    } catch (err) {
      setOrderError(err.message || '获取订单失败');
    } finally {
      setOrderLoading(false);
    }
  };

  const openOrders = () => {
    navigate('/orders');
    loadOrders(1, orderStatus);
  };

  const openOrderDetail = async (orderId) => {
    if (orderListScrollRef.current) {
      orderListScrollTopRef.current = orderListScrollRef.current.scrollTop;
      shouldRestoreOrderScroll.current = true;
    }
    setOrderDetailOpen(true);
    setOrderDetailLoading(true);
    setOrderDetailError('');
    setOrderDetail(null);
    if (!hasAuth()) {
      setOrderDetailError('请先点击右上角登录配置 token 与 appid');
      setOrderDetailLoading(false);
      return;
    }
    try {
      const data = await fetchOrderDetail(orderId);
      setOrderDetail(data?.orderInfo || data);
    } catch (err) {
      setOrderDetailError(err.message || '获取订单详情失败');
    } finally {
      setOrderDetailLoading(false);
    }
  };

  const closeOrderDetail = () => {
    setOrderDetailOpen(false);
  };

  const copyOrderId = async (orderId) => {
    if (!orderId) return;
    try {
      await navigator.clipboard.writeText(orderId);
    } catch {
      // ignore
    }
  };

  const handleExportOrders = async (mode) => {
    if (exportLoading) return;
    if (!hasAuth()) {
      alert('请先登录');
      return;
    }
    setExportLoading(true);
    setExportProgress('');
    try {
      const statusLabel =
        orderStatus === 'all'
          ? '全部'
          : orderStatusLabel(orderStatus);
      const result = await exportOrdersToExcel(orderStatus, statusLabel, mode, (current, total, phase) => {
        if (phase === 'fetching_list') {
          setExportProgress(`获取订单 ${current}/${total || '...'}`);
        } else if (phase === 'fetching_details') {
          setExportProgress(`获取详情 ${current}/${total}`);
        } else if (phase === 'generating') {
          setExportProgress('生成Excel...');
        }
      });
      alert(`导出成功！共 ${result.count} 个订单`);
    } catch (err) {
      alert(err.message || '导出失败');
    } finally {
      setExportLoading(false);
      setExportProgress('');
    }
  };

  const openDetail = async (item) => {
    setDetailItem(item);
    setDetailData(null);
    setDetailError('');
    setDetailLoading(true);
    setDetailOpen(true);
    setQuantity(1);
    setSelectedSpecId(null);
    if (!hasAuth()) {
      setDetailError('请先点击右上角登录配置 token 与 appid');
      setDetailLoading(false);
      return;
    }
    try {
      const data = await fetchProductDetail(item.item_id);
      setDetailData(data);
    } catch (err) {
      setDetailError(err.message || '获取详情失败');
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setDetailOpen(false);
  };

  const isNonEmptyObject = (value) =>
    value && typeof value === 'object' && Object.keys(value).length > 0;
  const pickFirst = (...values) =>
    values.find((value) => value !== undefined && value !== null && value !== '');
  const detailPayload = isNonEmptyObject(detailData) ? detailData : null;
  const detailBase =
    detailPayload?.main_item ||
    detailPayload?.item ||
    detailPayload?.goods ||
    detailPayload?.detail ||
    detailPayload ||
    {};
  const detail = { ...(detailItem || {}), ...detailBase };
  const detailImages = (() => {
    const candidates = [
      detail.pics,
      detail.item_pics,
      detail.images,
      detail.imgs,
    ]
      .flat()
      .filter(Boolean);
    if (detail.image) {
      candidates.unshift(detail.image);
    }
    if (candidates.length) return candidates;
    return detailItem?.pics || [];
  })();
  const detailPrice = pickFirst(
    detail.price,
    detail.sale_price,
    detail.goods_price,
    detailItem?.price
  );
  const detailMarketPrice = pickFirst(
    detail.market_price,
    detailItem?.market_price
  );
  const detailBrand = pickFirst(
    detail.tags,
    detail.brand_name,
    detail.brand,
    detailItem?.tags
  );
  const detailSpec = pickFirst(
    detail.item_spec,
    detail.spec,
    detail.item_spec_en,
    detailItem?.item_spec,
    detailItem?.spec,
    detailItem?.brief
  );
  const stockValue = pickFirst(
    detail.store,
    detail.total_store,
    detail.relstore,
    detail.available_stock,
    detailItem?.store
  );
  const detailSpecList = (() => {
    const specMap = detailPayload?.specs || detail.specs;
    const candidates = [
      detailPayload?.skus,
      detail.skus,
      detail.spec_list,
      detail.sku_list,
      detail.item_list,
      detail.items,
      detail.product_list,
      detail.products,
      detail.goods_list,
    ];
    for (const list of candidates) {
      if (!Array.isArray(list)) continue;
      const normalized = list
        .map((entry) => {
          const itemId = entry.item_id ?? entry.id ?? entry.sku_id;
          const label = pickFirst(
            entry.item_spec,
            entry.spec,
            entry.spec_desc,
            entry.spec_name,
            entry.name,
            entry.item_name,
            itemId ? specMap?.[itemId] : undefined
          );
          if (!label) return null;
          const stock = pickFirst(
            entry.store,
            entry.stock,
            entry.total_store,
            entry.relstore,
            entry.available_stock
          );
          const specId = itemId ?? label;
          return {
            id: specId,
            item_id: itemId,
            label,
            stock,
            price: entry.price,
            market_price: entry.market_price,
            pics: entry.pics,
          };
        })
        .filter(Boolean);
      if (normalized.length) {
        return normalized;
      }
    }
    return detailSpec
      ? [
          {
            id: detail.item_id || detailItem?.item_id || detailSpec,
            item_id: detail.item_id || detailItem?.item_id,
            label: detailSpec,
            stock: stockValue,
            price: detailPrice,
            market_price: detailMarketPrice,
            pics: detailImages,
          },
        ]
      : [];
  })();
  const activeSpec = detailSpecList.find((spec) => spec.id === selectedSpecId) || null;
  const activePrice = pickFirst(activeSpec?.price, detailPrice);
  const activeMarketPrice = pickFirst(activeSpec?.market_price, detailMarketPrice);
  const activeStockValue = pickFirst(activeSpec?.stock, stockValue);
  const activeStockNumber = Number(activeStockValue);
  const isOutOfStock =
    Number.isFinite(activeStockNumber) && activeStockNumber <= 0;
  const displayStock = Number.isFinite(activeStockNumber)
    ? activeStockNumber > 999
      ? '999+'
      : String(activeStockNumber)
    : activeStockValue ?? '--';
  const activeImages =
    activeSpec?.pics?.length ? activeSpec.pics : detailImages;
  const canSelectSpec = detailSpecList.length === 0 || Boolean(selectedSpecId);
  const actionItem = {
    ...detail,
    item_id: activeSpec?.item_id ?? detail.item_id,
    price: activePrice ?? detail.price,
    market_price: activeMarketPrice ?? detail.market_price,
    pics: activeImages,
  };

  const allCartTotal = carts.reduce(
    (sum, cart) =>
      sum +
      cart.items.reduce(
        (cartSum, item) => cartSum + (item.price || 0) * item.quantity,
        0
      ),
    0
  );
  const nonEmptyCartIds = carts.filter((cart) => cart.items.length).map((cart) => cart.id);
  const checkoutSnapshotCount = checkoutItemsSnapshot.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0
  );
  const checkoutSnapshotTotal = checkoutItemsSnapshot.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
    0
  );

  const checkoutItemNameById = useMemo(() => {
    const map = new Map();
    checkoutItemsSnapshot.forEach((item) => {
      if (item?.item_id && item?.item_name) {
        map.set(item.item_id, item.item_name);
      }
    });
    return map;
  }, [checkoutItemsSnapshot]);

  const totalPages = totalCount ? Math.ceil(totalCount / PAGE_SIZE) : 0;
  const pageNumbers = (() => {
    if (totalPages <= 1) return [1];
    const max = 5;
    if (totalPages <= max) {
      return Array.from({ length: totalPages }, (_, idx) => idx + 1);
    }
    const half = Math.floor(max / 2);
    let start = Math.max(1, page - half);
    let end = start + max - 1;
    if (end > totalPages) {
      end = totalPages;
      start = end - max + 1;
    }
    return Array.from({ length: max }, (_, idx) => start + idx);
  })();

  const orderTotalPages = orderTotal ? Math.ceil(orderTotal / 10) : 0;
  const orderPageNumbers = (() => {
    if (orderTotalPages <= 1) return [1];
    const max = 5;
    if (orderTotalPages <= max) {
      return Array.from({ length: orderTotalPages }, (_, idx) => idx + 1);
    }
    const half = Math.floor(max / 2);
    let start = Math.max(1, orderPage - half);
    let end = start + max - 1;
    if (end > orderTotalPages) {
      end = orderTotalPages;
      start = end - max + 1;
    }
    return Array.from({ length: max }, (_, idx) => start + idx);
  })();

  const categoryTotalPages = categoryTotalCount
    ? Math.ceil(categoryTotalCount / CATEGORY_PAGE_SIZE)
    : 0;
  const categoryPageNumbers = (() => {
    if (categoryTotalPages <= 1) return [1];
    const max = 5;
    if (categoryTotalPages <= max) {
      return Array.from({ length: categoryTotalPages }, (_, idx) => idx + 1);
    }
    const half = Math.floor(max / 2);
    let start = Math.max(1, categoryPage - half);
    let end = start + max - 1;
    if (end > categoryTotalPages) {
      end = categoryTotalPages;
      start = end - max + 1;
    }
    return Array.from({ length: max }, (_, idx) => start + idx);
  })();

  const activeCategoryGroup =
    CATEGORY_GROUPS.find((group) => group.id === categoryGroupId) ||
    CATEGORY_GROUPS[0];

  const searchTotalPages = searchTotalCount
    ? Math.ceil(searchTotalCount / PAGE_SIZE)
    : 0;
  const searchPageNumbers = (() => {
    if (searchTotalPages <= 1) return [1];
    const max = 5;
    if (searchTotalPages <= max) {
      return Array.from({ length: searchTotalPages }, (_, idx) => idx + 1);
    }
    const half = Math.floor(max / 2);
    let start = Math.max(1, searchPage - half);
    let end = start + max - 1;
    if (end > searchTotalPages) {
      end = searchTotalPages;
      start = end - max + 1;
    }
    return Array.from({ length: max }, (_, idx) => start + idx);
  })();

  const orderDetailStatusText =
    orderDetail?.order_status_msg || orderStatusLabel(orderDetail?.status);
  const orderDetailSymbol = (() => {
    switch (orderDetailStatusText) {
      case '已取消':
        return '×';
      case '已完成':
        return '✓';
      case '待支付':
        return '¥';
      case '待发货':
        return '…';
      case '已发货':
        return '→';
      default:
        return '•';
    }
  })();
  const orderDetailItems = Array.isArray(orderDetail?.items) ? orderDetail.items : [];
  const orderDetailGifts = Array.isArray(orderDetail?.gift_items)
    ? orderDetail.gift_items
    : [];
  const orderDetailAddressLine = orderDetail
    ? `${orderDetail.province || ''}${orderDetail.city || ''}${
        orderDetail.district || ''
      }${orderDetail.address || ''}`.trim()
    : '';
  const orderDetailNameLine = orderDetail
    ? `${orderDetail.consignee || ''} ${orderDetail.mobile || ''}`.trim()
    : '';
  const orderDetailMarketPrice =
    orderDetail?.total_market_price ?? orderDetail?.market_price;
  const orderDetailActualPrice =
    orderDetail?.actual_price ?? orderDetail?.total_price;
  const orderDetailTotalPrice =
    orderDetail?.total_price ?? orderDetail?.actual_price;

  useEffect(() => {
    if (!detailOpen) return;
    if (!detailSpecList.length) {
      if (selectedSpecId !== null) {
        setSelectedSpecId(null);
      }
      return;
    }
    const hasSelected = detailSpecList.some((spec) => spec.id === selectedSpecId);
    if (hasSelected) return;
    const firstInStock = detailSpecList.find((spec) => {
      const stock = Number(spec.stock);
      return !Number.isFinite(stock) || stock > 0;
    });
    if (!firstInStock) {
      setSelectedSpecId(null);
      return;
    }
    setSelectedSpecId(firstInStock.id ?? null);
  }, [detailOpen, detailSpecList, selectedSpecId]);

  useEffect(() => {
    return () => {
      if (cartAnimTimerRef.current) {
        clearTimeout(cartAnimTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const nextActiveCartId = carts.some((cart) => cart.id === activeCartId)
      ? activeCartId
      : carts[0]?.id || defaultCartIdRef.current;
    if (nextActiveCartId !== activeCartId) {
      setActiveCartId(nextActiveCartId);
      return;
    }
    window.localStorage.setItem(CARTS_STORAGE_KEY, JSON.stringify(carts));
    window.localStorage.setItem(ACTIVE_CART_STORAGE_KEY, nextActiveCartId);
  }, [carts, activeCartId]);

  useEffect(() => {
    if (orderDetailOpen) return;
    if (!isOrdersRoute) return;
    if (orderLoading) return;
    if (!shouldRestoreOrderScroll.current) return;
    const listEl = orderListScrollRef.current;
    if (!listEl) return;
    const handle = requestAnimationFrame(() => {
      listEl.scrollTop = orderListScrollTopRef.current || 0;
      shouldRestoreOrderScroll.current = false;
    });
    return () => cancelAnimationFrame(handle);
  }, [orderDetailOpen, isOrdersRoute, orderLoading, orderList.length]);

  useEffect(() => {
    if (!isSearchRoute) {
      searchPrevPathRef.current = pathname;
    }
  }, [pathname, isSearchRoute]);

  const currentTitle = isCategoryRoute
    ? '商品分类'
    : isSearchRoute
      ? '搜索列表'
      : isOrdersRoute
        ? '订单列表'
        : isCartRoute
          ? '购物车'
        : isHomeRoute
          ? '首页'
          : '礼包';

  const handleToggleView = () => {
    setViewMode((prev) => (prev === 'grid' ? 'list' : 'grid'));
  };

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900">
      <div className="border-b border-stone-200 bg-white/90 backdrop-blur">
        <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8">
          <header className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-4">
              {isSearchRoute && (
                <button
                  className="rounded-full border border-stone-200 px-4 py-2 text-sm text-stone-600"
                  type="button"
                  onClick={exitSearch}
                >
                  ←
                </button>
              )}
              <div>
                <div className="text-xs uppercase tracking-[0.24em] text-stone-400">
                  L'Oreal
                </div>
                <h1 className="text-2xl font-semibold tracking-tight">{currentTitle}</h1>
              </div>
            </div>

            <div className="flex flex-1 flex-col gap-4 xl:items-end">
              <div className="flex w-full flex-col gap-3 xl:flex-row xl:items-center xl:justify-end">
                <div className="flex w-full max-w-xl items-center gap-3 rounded-full border border-stone-200 bg-stone-50 px-4 py-3">
                  <IconSearch className="h-5 w-5 text-stone-400" />
                  <input
                    className="flex-1 bg-transparent text-sm outline-none placeholder:text-stone-400 box-border"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="搜索商品"
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        startSearch();
                      }
                    }}
                  />
                  {search && (
                    <button
                      className="rounded-full px-2 py-1 text-sm text-stone-500"
                      type="button"
                      onClick={clearSearchInput}
                    >
                      ✕
                    </button>
                  )}
                </div>

                <nav className="flex flex-wrap items-center gap-2">
                  <NavLink
                    to="/"
                    className={({ isActive }) =>
                      `inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition ${
                        isActive
                          ? 'bg-stone-900 text-white'
                          : 'border border-stone-200 bg-white text-stone-700 hover:border-stone-400'
                      }`
                    }
                  >
                    <IconHome className="h-4 w-4" />
                    首页
                  </NavLink>
                  <NavLink
                    to="/gift"
                    className={({ isActive }) =>
                      `inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition ${
                        isActive
                          ? 'bg-stone-900 text-white'
                          : 'border border-stone-200 bg-white text-stone-700 hover:border-stone-400'
                      }`
                    }
                  >
                    <IconBag className="h-4 w-4" />
                    礼包
                  </NavLink>
                  <NavLink
                    to="/category"
                    className={({ isActive }) =>
                      `inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition ${
                        isActive
                          ? 'bg-stone-900 text-white'
                          : 'border border-stone-200 bg-white text-stone-700 hover:border-stone-400'
                      }`
                    }
                  >
                    <IconCategory className="h-4 w-4" />
                    分类
                  </NavLink>
                  <button
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition ${
                      isOrdersRoute
                        ? 'bg-stone-900 text-white'
                        : 'border border-stone-200 bg-white text-stone-700 hover:border-stone-400'
                    }`}
                    type="button"
                    onClick={openOrders}
                  >
                    <IconOrder className="h-4 w-4" />
                    订单
                  </button>
                  <NavLink
                    to="/cart"
                    className={({ isActive }) =>
                      `inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition ${
                        isActive
                          ? 'bg-stone-900 text-white'
                          : 'border border-stone-200 bg-white text-stone-700 hover:border-stone-400'
                      }`
                    }
                  >
                    <IconCart className="h-4 w-4" />
                    购物车
                  </NavLink>
                </nav>

                <button
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-stone-900 px-4 py-2 text-sm text-white"
                  onClick={openLogin}
                  type="button"
                >
                  <IconLogin className="h-4 w-4" />
                  登录
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      isAuthed ? 'bg-emerald-400' : 'bg-stone-500'
                    }`}
                  />
                </button>
              </div>
            </div>
          </header>
        </div>
      </div>

      <main className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8 overflow-auto">
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                featuredProducts={visibleProducts.slice(0, 4)}
                loading={loadingList}
                onSelectProduct={openDetail}
                onAddToCart={addToCart}
                cartCount={cartCount}
              />
            }
          />
          <Route
            path="/gift"
            element={
              <GiftPage
                tags={tags}
                loadingTags={loadingTags}
                selectedTag={selectedTag}
                onSelectTag={setSelectedTag}
                sortState={sortState}
                onDefaultSort={handleDefaultSort}
                onPriceSort={handlePriceSort}
                totalCount={totalCount}
                viewMode={viewMode}
                onToggleView={handleToggleView}
                error={error}
                loadingList={loadingList}
                products={visibleProducts}
                onSelectProduct={openDetail}
                onAddToCart={addToCart}
                page={page}
                totalPages={totalPages}
                pageNumbers={pageNumbers}
                onPageChange={loadProducts}
              />
            }
          />
          <Route
            path="/category"
            element={
              <CategoryPage
                groups={CATEGORY_GROUPS}
                activeGroupId={categoryGroupId}
                onGroupChange={setCategoryGroupId}
                activeGroup={activeCategoryGroup}
                categoryBrand={categoryBrand}
                onBrandSelect={(brand) => {
                  setCategoryBrand(brand);
                  setSelectedCategoryTag('全部');
                  setCategoryTags([]);
                  setCategoryProducts([]);
                  setCategoryPage(1);
                }}
                tags={categoryTags}
                loadingTags={categoryTags.length === 0 && categoryLoading}
                selectedTag={selectedCategoryTag}
                onSelectTag={setSelectedCategoryTag}
                sortState={sortState}
                onDefaultSort={handleDefaultSort}
                onPriceSort={handlePriceSort}
                totalCount={categoryTotalCount}
                viewMode={viewMode}
                onToggleView={handleToggleView}
                error={categoryError}
                loadingList={categoryLoading}
                products={visibleCategoryProducts}
                onSelectProduct={openDetail}
                onAddToCart={addToCart}
                page={categoryPage}
                totalPages={categoryTotalPages}
                pageNumbers={categoryPageNumbers}
                onPageChange={loadCategoryProducts}
              />
            }
          />
          <Route
            path="/orders"
            element={
              <OrdersPage
                orderStatus={orderStatus}
                orderStatuses={ORDER_STATUS}
                onChangeStatus={(status) => loadOrders(1, status)}
                orderError={orderError}
                orderLoading={orderLoading}
                orderList={orderList}
                onOpenOrderDetail={openOrderDetail}
                formatDateTime={formatDateTime}
                orderStatusLabel={orderStatusLabel}
                orderPage={orderPage}
                orderTotalPages={orderTotalPages}
                orderPageNumbers={orderPageNumbers}
                onPageChange={loadOrders}
                orderListRef={orderListScrollRef}
                onExportOrders={handleExportOrders}
                exportLoading={exportLoading}
                exportProgress={exportProgress}
              />
            }
          />
          <Route
            path="/cart"
            element={
              <CartPage
                carts={carts}
                activeCartId={activeCartId}
                editingCartId={editingCartId}
                cartNameDraft={cartNameDraft}
                cartCount={cartCount}
                allCartTotal={allCartTotal}
                checkoutLoading={checkoutLoading}
                nonEmptyCartIds={nonEmptyCartIds}
                onCreateCart={createCart}
                onSetActiveCart={setActiveCartId}
                onCartNameDraftChange={setCartNameDraft}
                onFinishCartRename={finishCartRename}
                onCancelCartRename={cancelCartRename}
                onStartCartRename={startCartRename}
                onDeleteCart={deleteCart}
                onUpdateCartQty={updateCartQty}
                onRemoveCartItem={removeCartItem}
                onCheckoutCart={(cart) =>
                  handleCheckout(cart.items, {
                    cartIdsToClear: [cart.id],
                  })
                }
                onCheckoutAll={() =>
                  handleCheckoutAll()
                }
              />
            }
          />
          <Route
            path="/search"
            element={
              <SearchPage
                tags={searchTags}
                loadingTags={searchTagLoading}
                selectedTag={selectedSearchTag}
                onSelectTag={setSelectedSearchTag}
                sortState={sortState}
                onDefaultSort={handleDefaultSort}
                onPriceSort={handlePriceSort}
                totalCount={searchTotalCount}
                viewMode={viewMode}
                onToggleView={handleToggleView}
                error={searchError}
                loadingList={searchLoading}
                products={visibleSearchProducts}
                onSelectProduct={openDetail}
                onAddToCart={addToCart}
                page={searchPage}
                totalPages={searchTotalPages}
                pageNumbers={searchPageNumbers}
                onPageChange={loadSearchProducts}
              />
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <button
        className={`fixed bottom-6 right-6 z-40 inline-flex items-center gap-3 rounded-full bg-stone-900 px-5 py-3 text-sm font-medium text-white shadow-[0_18px_40px_rgba(28,25,23,0.22)] transition duration-200 hover:bg-stone-800 ${
          cartAnimating ? 'scale-105' : ''
        }`}
        type="button"
        onClick={() => setCartOpen(true)}
      >
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/12">
          <IconCart className="h-5 w-5" />
        </span>
        <span>购物车</span>
        {cartCount > 0 && (
          <span className="rounded-full bg-amber-700 px-2 py-0.5 text-xs text-white">
            {cartCount}
          </span>
        )}
      </button>

      {showLogin && (
        <LoginModal
          tokenInput={tokenInput}
          appidInput={appidInput}
          onTokenChange={setTokenInput}
          onAppidChange={setAppidInput}
          onClear={handleClearAuth}
          onClose={() => setShowLogin(false)}
          onSubmit={handleLoginSubmit}
        />
      )}

      {cartOpen && (
        <CartModal
          carts={carts}
          activeCartId={activeCartId}
          editingCartId={editingCartId}
          cartNameDraft={cartNameDraft}
          cartCount={cartCount}
          allCartTotal={allCartTotal}
          checkoutLoading={checkoutLoading}
          nonEmptyCartIds={nonEmptyCartIds}
          onClose={() => setCartOpen(false)}
          onCreateCart={createCart}
          onSetActiveCart={setActiveCartId}
          onCartNameDraftChange={setCartNameDraft}
          onFinishCartRename={finishCartRename}
          onCancelCartRename={cancelCartRename}
          onStartCartRename={startCartRename}
          onDeleteCart={deleteCart}
          onUpdateCartQty={updateCartQty}
          onRemoveCartItem={removeCartItem}
          onCheckoutCart={(cart) =>
            handleCheckout(cart.items, {
              cartIdsToClear: [cart.id],
              closeCartOnSuccess: true,
            })
          }
          onCheckoutAll={() =>
            handleCheckoutAll({
              closeCartOnSuccess: true,
            })
          }
        />
      )}

      {pendingCartItem && (
        <CartPickerModal
          pendingItem={pendingCartItem}
          carts={carts}
          activeCartId={activeCartId}
          onClose={() => setPendingCartItem(null)}
          onPick={handlePendingCartPick}
        />
      )}

      <OrderDetailModal
        orderDetailOpen={orderDetailOpen}
        orderDetailLoading={orderDetailLoading}
        orderDetailError={orderDetailError}
        orderDetail={orderDetail}
        orderDetailSymbol={orderDetailSymbol}
        orderDetailStatusText={orderDetailStatusText}
        orderDetailNameLine={orderDetailNameLine}
        orderDetailAddressLine={orderDetailAddressLine}
        orderDetailItems={orderDetailItems}
        orderDetailGifts={orderDetailGifts}
        orderDetailMarketPrice={orderDetailMarketPrice}
        orderDetailActualPrice={orderDetailActualPrice}
        orderDetailTotalPrice={orderDetailTotalPrice}
        formatDateTime={formatDateTime}
        onCopyOrderId={copyOrderId}
        onClose={closeOrderDetail}
      />

      <ProductDetailModal
        detailOpen={detailOpen}
        detail={detail}
        detailItem={detailItem}
        detailLoading={detailLoading}
        detailError={detailError}
        activeImages={activeImages}
        isOutOfStock={isOutOfStock}
        detailBrand={detailBrand}
        activePrice={activePrice}
        activeMarketPrice={activeMarketPrice}
        displayStock={displayStock}
        detailSpecList={detailSpecList}
        selectedSpecId={selectedSpecId}
        setSelectedSpecId={setSelectedSpecId}
        quantity={quantity}
        setQuantity={setQuantity}
        canSelectSpec={canSelectSpec}
        actionItem={actionItem}
        onClose={closeDetail}
        onAddToCart={addToCart}
        onBuyNow={(item, qty) => handleCheckout([buildCartItem(item, qty)])}
      />

      {checkoutOpen && (
        <CheckoutModal
          checkoutData={checkoutData}
          checkoutError={checkoutError}
          checkoutInvalidItems={checkoutInvalidItems}
          checkoutItemNameById={checkoutItemNameById}
          checkoutSnapshotCount={checkoutSnapshotCount}
          checkoutSnapshotTotal={checkoutSnapshotTotal}
          onClose={() => setCheckoutOpen(false)}
        />
      )}
    </div>
  );
}
