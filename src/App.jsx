import { useEffect, useMemo, useRef, useState } from 'react';
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
import {
  IconBag,
  IconCart,
  IconCategory,
  IconHome,
  IconLogin,
  IconOrder,
  IconSearch,
} from './components/Icons.jsx';
import { GiftBody, GiftHeader } from './sections/GiftSection.jsx';
import CategorySection from './sections/CategorySection.jsx';
import { formatPrice } from './utils/format.js';

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


export default function App() {
  const [activeSection, setActiveSection] = useState('gift');
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
  const searchPrevSectionRef = useRef('gift');
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

  const [cartItems, setCartItems] = useState([]);
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
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
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
    if (activeSection !== 'gift') return;
    loadProducts(1);
  }, [selectedTag, sortState, activeSection]);

  useEffect(() => {
    if (activeSection !== 'category') return;
    const nextGroup =
      CATEGORY_GROUPS.find((group) => group.id === categoryGroupId) ||
      CATEGORY_GROUPS[0];
    const nextBrand = nextGroup?.brands?.[0] || null;
    setCategoryBrand(nextBrand);
    setCategoryTags([]);
    setSelectedCategoryTag('全部');
    setCategoryProducts([]);
    setCategoryPage(1);
  }, [activeSection, categoryGroupId]);

  useEffect(() => {
    if (activeSection !== 'category' || !categoryBrand) return;
    loadCategoryTags(categoryBrand.id);
  }, [activeSection, categoryBrand]);

  useEffect(() => {
    if (activeSection !== 'category' || !categoryBrand) return;
    const timer = setTimeout(() => {
      loadCategoryProducts(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [activeSection, categoryBrand, selectedCategoryTag, search, sortState]);

  useEffect(() => {
    if (activeSection !== 'search') return;
    loadSearchTags();
  }, [activeSection, search]);

  useEffect(() => {
    if (activeSection !== 'search') return;
    const timer = setTimeout(() => {
      loadSearchProducts(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [activeSection, search, selectedSearchTag, sortState]);

  useEffect(() => {
    if (activeSection !== 'orders') return;
    if (orderList.length) return;
    loadOrders(1, orderStatus);
  }, [activeSection]);

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
    if (activeSection !== 'search') {
      searchPrevSectionRef.current = activeSection;
    }
    setSelectedSearchTag('全部');
    setSearchTags([]);
    setSearchProducts([]);
    setSearchPage(1);
    setSearchTotalCount(0);
    setSearchError('');
    setActiveSection('search');
  };

  const clearSearchInput = () => {
    setSearch('');
    if (activeSection === 'search') {
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
    setActiveSection(searchPrevSectionRef.current || 'gift');
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

  const addToCart = (item, qty = 1) => {
    if (!item?.item_id) return;
    if (cartAnimTimerRef.current) {
      clearTimeout(cartAnimTimerRef.current);
    }
    setCartAnimating(false);
    setCartItems((prev) => {
      const existing = prev.find((entry) => entry.item_id === item.item_id);
      if (existing) {
        return prev.map((entry) =>
          entry.item_id === item.item_id
            ? { ...entry, quantity: entry.quantity + qty }
            : entry
        );
      }
      return [...prev, buildCartItem(item, qty)];
    });
    requestAnimationFrame(() => setCartAnimating(true));
    cartAnimTimerRef.current = setTimeout(() => {
      setCartAnimating(false);
    }, 450);
  };

  const updateCartQty = (itemId, nextQty) => {
    setCartItems((prev) =>
      nextQty <= 0
        ? prev.filter((entry) => entry.item_id !== itemId)
        : prev.map((entry) =>
            entry.item_id === itemId ? { ...entry, quantity: nextQty } : entry
          )
    );
  };

  const removeCartItem = (itemId) => {
    setCartItems((prev) => prev.filter((entry) => entry.item_id !== itemId));
  };

  const handleCheckout = async (itemsOverride) => {
    const itemsToCheckout = itemsOverride || cartItems;
    const normalizedItems = itemsToCheckout.filter(
      (item) => item?.item_id && Number(item.quantity) > 0
    );
    if (!normalizedItems.length) {
      setCheckoutError('请选择要结算的商品');
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
      if (!itemsOverride) {
        setCartItems([]);
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
      setCheckoutError(err.message || '结算失败');
      setCheckoutOpen(true);
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
    setActiveSection('orders');
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

  const cartTotal = cartItems.reduce(
    (sum, item) => sum + (item.price || 0) * item.quantity,
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
    if (orderDetailOpen) return;
    if (activeSection !== 'orders') return;
    if (orderLoading) return;
    if (!shouldRestoreOrderScroll.current) return;
    const listEl = orderListScrollRef.current;
    if (!listEl) return;
    const handle = requestAnimationFrame(() => {
      listEl.scrollTop = orderListScrollTopRef.current || 0;
      shouldRestoreOrderScroll.current = false;
    });
    return () => cancelAnimationFrame(handle);
  }, [orderDetailOpen, activeSection, orderLoading, orderList.length]);

  return (
    <div className="page">
      <div className="page__top">
        <div className="container">
          <header className="topbar">
            <div className="brand">
              {activeSection === 'search' && (
                <button className="topbar__back" type="button" onClick={exitSearch}>
                  ←
                </button>
              )}
              <h1>
                {activeSection === 'category'
                  ? '商品分类'
                  : activeSection === 'search'
                    ? '搜索列表'
                    : activeSection === 'orders'
                      ? '订单列表'
                      : '礼包'}
              </h1>
            </div>
            <div className="topbar__search">
              <IconSearch />
              <input
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
                <button className="topbar__clear" type="button" onClick={clearSearchInput}>
                  ✕
                </button>
              )}
            </div>
            <div className="topbar__actions">
              <nav className="nav">
                <button className="nav__item" type="button">
                  <IconHome />
                  首页
                </button>
                <button
                  className={`nav__item ${
                    activeSection === 'gift' ? 'nav__item--active' : ''
                  }`}
                  type="button"
                  onClick={() => setActiveSection('gift')}
                >
                  <IconBag />
                  礼包
                </button>
                <button
                  className={`nav__item ${
                    activeSection === 'category' ? 'nav__item--active' : ''
                  }`}
                  type="button"
                  onClick={() => setActiveSection('category')}
                >
                  <IconCategory />
                  分类
                </button>
                <button
                  className={`nav__item ${
                    activeSection === 'orders' ? 'nav__item--active' : ''
                  }`}
                  type="button"
                  onClick={openOrders}
                >
                  <IconOrder />
                  订单
                </button>
                <button
                  className={`nav__item nav__item--cart ${
                    cartAnimating ? 'nav__item--bump' : ''
                  }`}
                  type="button"
                  onClick={() => setCartOpen(true)}
                >
                  <IconCart />
                  购物车
                  {cartCount > 0 && <span className="nav__badge">{cartCount}</span>}
                </button>
              </nav>
              <button className="login" onClick={openLogin} type="button">
                <IconLogin />
                登录
                <span className={`status ${isAuthed ? 'status--on' : ''}`} />
              </button>
            </div>
          </header>

          {activeSection === 'gift' && (
            <GiftHeader
              tags={tags}
              loadingTags={loadingTags}
              selectedTag={selectedTag}
              onSelectTag={setSelectedTag}
              sortState={sortState}
              onDefaultSort={handleDefaultSort}
              onPriceSort={handlePriceSort}
              totalCount={totalCount}
              viewMode={viewMode}
              onToggleView={() =>
                setViewMode((prev) => (prev === 'grid' ? 'list' : 'grid'))
              }
              error={error}
            />
          )}
          {activeSection === 'search' && (
            <GiftHeader
              tags={searchTags}
              loadingTags={searchTagLoading}
              selectedTag={selectedSearchTag}
              onSelectTag={setSelectedSearchTag}
              sortState={sortState}
              onDefaultSort={handleDefaultSort}
              onPriceSort={handlePriceSort}
              totalCount={searchTotalCount}
              viewMode={viewMode}
              onToggleView={() =>
                setViewMode((prev) => (prev === 'grid' ? 'list' : 'grid'))
              }
              error={searchError}
            />
          )}
        </div>
      </div>

      <div className="page__body">
        <div className="container">
          {activeSection === 'gift' ? (
            <GiftBody
              loadingList={loadingList}
              products={visibleProducts}
              viewMode={viewMode}
              onSelectProduct={openDetail}
              onAddToCart={addToCart}
              page={page}
              totalPages={totalPages}
              pageNumbers={pageNumbers}
              onPageChange={loadProducts}
            />
          ) : activeSection === 'category' ? (
            <CategorySection
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
              categoryTags={categoryTags}
              selectedCategoryTag={selectedCategoryTag}
              onSelectCategoryTag={setSelectedCategoryTag}
              sortState={sortState}
              onDefaultSort={handleDefaultSort}
              onPriceSort={handlePriceSort}
              categoryTotalCount={categoryTotalCount}
              viewMode={viewMode}
              onToggleView={() =>
                setViewMode((prev) => (prev === 'grid' ? 'list' : 'grid'))
              }
              categoryError={categoryError}
              categoryLoading={categoryLoading}
              products={visibleCategoryProducts}
              onSelectProduct={openDetail}
              onAddToCart={addToCart}
              categoryPage={categoryPage}
              categoryTotalPages={categoryTotalPages}
              categoryPageNumbers={categoryPageNumbers}
              onPageChange={loadCategoryProducts}
            />
          ) : activeSection === 'search' ? (
            <GiftBody
              loadingList={searchLoading}
              products={visibleSearchProducts}
              viewMode={viewMode}
              onSelectProduct={openDetail}
              onAddToCart={addToCart}
              page={searchPage}
              totalPages={searchTotalPages}
              pageNumbers={searchPageNumbers}
              onPageChange={loadSearchProducts}
            />
          ) : (
            <section className="orders-page">
              <header className="orders-page__header">
                <h2>订单列表</h2>
              </header>
              <div className="orders__tabs">
                {ORDER_STATUS.map((status) => (
                  <button
                    key={status.value}
                    type="button"
                    className={`orders__tab ${
                      orderStatus === status.value ? 'orders__tab--active' : ''
                    }`}
                    onClick={() => loadOrders(1, status.value)}
                  >
                    {status.label}
                  </button>
                ))}
              </div>
              {orderError && <div className="orders__error">{orderError}</div>}
              <div className="orders__list" ref={orderListScrollRef}>
                {orderLoading ? (
                  <div className="orders__loading">加载中...</div>
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
                    const statusLabel =
                      order.order_status_msg || orderStatusLabel(order.status);
                    return (
                      <div
                        className="orders__card"
                        key={order.order_id}
                        role="button"
                        tabIndex={0}
                        onClick={() => openOrderDetail(order.order_id)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            openOrderDetail(order.order_id);
                          }
                        }}
                      >
                        <div className="orders__meta">
                          <span>订单号 {order.order_id}</span>
                          <span className="orders__status">{statusLabel}</span>
                        </div>
                        <div className="orders__time">
                          {formatDateTime(order.create_time)}
                        </div>
                        <div className="orders__items">
                          {items.slice(0, 2).map((item) => {
                            const imageUrl = item.item_pics?.[0] || item.image;
                            const quantity = item.num ?? item.quantity ?? 0;
                            return (
                              <div
                                className="orders__item"
                                key={`${item.item_id}-${item.id}`}
                              >
                                {imageUrl ? (
                                  <img src={imageUrl} alt="" />
                                ) : (
                                  <div className="orders__item-empty" />
                                )}
                                <div>
                                  <p>{item.item_name}</p>
                                  <div className="orders__item-meta">
                                    <span className="orders__item-price">
                                      {formatPrice(item.price)}
                                    </span>
                                    <span className="orders__item-qty">
                                      x {quantity}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        {items.length > 2 && (
                          <div className="orders__more">
                            还有 {items.length - 2} 件商品
                          </div>
                        )}
                        <div className="orders__summary">
                          <span>共 {totalQty} 件</span>
                          <span>
                            合计 {formatPrice(order.total_price ?? order.actual_price)}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="orders__empty">暂无订单</div>
                )}
              </div>
              {orderTotalPages > 1 && (
                <div className="orders__pagination">
                  <button
                    type="button"
                    className="page-btn"
                    disabled={orderPage === 1 || orderLoading}
                    onClick={() => loadOrders(orderPage - 1)}
                  >
                    上一页
                  </button>
                  {orderPageNumbers.map((pageNum) => (
                    <button
                      key={pageNum}
                      type="button"
                      className={`page-btn ${
                        pageNum === orderPage ? 'page-btn--active' : ''
                      }`}
                      disabled={orderLoading}
                      onClick={() => loadOrders(pageNum)}
                    >
                      {pageNum}
                    </button>
                  ))}
                  <button
                    type="button"
                    className="page-btn"
                    disabled={orderPage === orderTotalPages || orderLoading}
                    onClick={() => loadOrders(orderPage + 1)}
                  >
                    下一页
                  </button>
                  <span className="page-meta">共 {orderTotalPages} 页</span>
                </div>
              )}
            </section>
          )}
        </div>
      </div>

      {showLogin && (
        <div className="modal" role="dialog" aria-modal="true">
          <button
            className="modal__backdrop"
            onClick={() => setShowLogin(false)}
            type="button"
          />
          <div className="modal__card">
            <div className="modal__header">
              <h2>登录配置</h2>
              <p>填写 token 与 appid，保存到 localStorage 后用于接口请求。</p>
            </div>
            <form className="modal__form" onSubmit={handleLoginSubmit}>
              <label>
                Token
                <textarea
                  value={tokenInput}
                  onChange={(event) => setTokenInput(event.target.value)}
                  placeholder="Bearer token"
                  rows={3}
                />
              </label>
              <label>
                AppID
                <input
                  value={appidInput}
                  onChange={(event) => setAppidInput(event.target.value)}
                  placeholder="authorizer-appid"
                />
              </label>
              <div className="modal__actions">
                <button type="button" className="ghost" onClick={handleClearAuth}>
                  清空
                </button>
                <button type="button" className="ghost" onClick={() => setShowLogin(false)}>
                  取消
                </button>
                <button type="submit" className="primary">
                  保存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {cartOpen && (
        <div className="cart" role="dialog" aria-modal="true">
          <button className="cart__backdrop" onClick={() => setCartOpen(false)} type="button" />
          <div className="cart__panel">
            <header className="cart__header">
              <h2>购物车</h2>
              <button className="cart__close" type="button" onClick={() => setCartOpen(false)}>
                ✕
              </button>
            </header>
            {cartItems.length === 0 ? (
              <div className="cart__empty">购物车为空</div>
            ) : (
              <div className="cart__list">
                {cartItems.map((item) => (
                  <div className="cart__item" key={item.item_id}>
                    <img src={item.image} alt={item.item_name} />
                    <div className="cart__info">
                      <h4>{item.item_name}</h4>
                      {item.spec && <p className="cart__spec">{item.spec}</p>}
                      <div className="cart__price">
                        <span className="price">{formatPrice(item.price)}</span>
                        <span className="price--old">
                          {formatPrice(item.market_price)}
                        </span>
                      </div>
                      <div className="cart__qty">
                        <button
                          type="button"
                          onClick={() => updateCartQty(item.item_id, item.quantity - 1)}
                        >
                          -
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateCartQty(item.item_id, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <button
                      className="cart__remove"
                      type="button"
                      onClick={() => removeCartItem(item.item_id)}
                    >
                      移除
                    </button>
                  </div>
                ))}
              </div>
            )}
            <footer className="cart__footer">
              <div className="cart__total">
                <span>合计</span>
                <strong>{formatPrice(cartTotal)}</strong>
              </div>
              <button
                className="cart__checkout"
                type="button"
                disabled={!cartItems.length || checkoutLoading}
                onClick={() => handleCheckout()}
              >
                {checkoutLoading ? '结算中...' : '去结算'}
              </button>
            </footer>
          </div>
        </div>
      )}

      {orderDetailOpen && (
        <div className="order-detail" role="dialog" aria-modal="true">
          <button
            className="order-detail__backdrop"
            onClick={closeOrderDetail}
            type="button"
          />
          <div className="order-detail__panel">
            <header className="order-detail__header">
              <button className="order-detail__back" type="button" onClick={closeOrderDetail}>
                返回
              </button>
              <h2>订单详情</h2>
              <button
                className="order-detail__close"
                type="button"
                onClick={closeOrderDetail}
              >
                ✕
              </button>
            </header>
            <div className="order-detail__content">
              {orderDetailLoading && <div className="order-detail__loading">加载中...</div>}
              {orderDetailError && !orderDetailLoading && (
                <div className="order-detail__error">{orderDetailError}</div>
              )}
              {!orderDetailLoading && !orderDetailError && !orderDetail && (
                <div className="order-detail__empty">暂无订单详情</div>
              )}
              {!orderDetailLoading && !orderDetailError && orderDetail && (
                <>
                  <section className="order-detail__status">
                    <div className="order-detail__status-icon">{orderDetailSymbol}</div>
                    <div className="order-detail__status-text">{orderDetailStatusText}</div>
                  </section>

                  <section className="order-detail__address">
                    <h3>收货地址</h3>
                    <p>{orderDetailNameLine || '--'}</p>
                    <p>{orderDetailAddressLine || '--'}</p>
                  </section>

                  <section className="order-detail__items">
                    <h3>商品清单 ({orderDetailItems.length})</h3>
                    <div className="order-detail__list">
                      {orderDetailItems.map((item) => {
                        const imageUrl = item.item_pics?.[0] || item.image;
                        const quantity = item.num ?? item.quantity ?? 0;
                        return (
                          <div className="order-detail__item" key={item.id || item.item_id}>
                            {imageUrl ? (
                              <img src={imageUrl} alt="" />
                            ) : (
                              <div className="order-detail__item-empty" />
                            )}
                            <div className="order-detail__item-info">
                              <h4>{item.item_name}</h4>
                              <div className="order-detail__chips">
                                {item.package_desc && (
                                  <span className="order-detail__chip">
                                    {item.package_desc}
                                  </span>
                                )}
                                {item.expiry_desc && (
                                  <span className="order-detail__chip">
                                    {item.expiry_desc}
                                  </span>
                                )}
                              </div>
                              {item.item_spec && (
                                <p className="order-detail__spec">{item.item_spec}</p>
                              )}
                              <div className="order-detail__price">
                                <span className="price">{formatPrice(item.price)}</span>
                                <span className="order-detail__qty">x {quantity}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>

                  {orderDetailGifts.length ? (
                    <section className="order-detail__gifts">
                      <h3>赠品</h3>
                      <div className="order-detail__gift-list">
                        {orderDetailGifts.map((gift, index) => (
                          <div className="order-detail__gift" key={`${gift.rule_name}-${index}`}>
                            <p>{gift.rule_name}</p>
                            <span>
                              应赠 x {gift.theoretical_quantity} · 实赠 x{' '}
                              {gift.actual_quantity}
                            </span>
                          </div>
                        ))}
                      </div>
                    </section>
                  ) : null}

                  <section className="order-detail__pay">
                    <h3>支付信息</h3>
                    <div className="order-detail__row">
                      <span>原价</span>
                      <span>{formatPrice(orderDetailMarketPrice)}</span>
                    </div>
                    <div className="order-detail__row">
                      <span>总价</span>
                      <span>{formatPrice(orderDetailActualPrice)}</span>
                    </div>
                    <div className="order-detail__row">
                      <span>运费</span>
                      <span>{formatPrice(orderDetail?.shipping_fee)}</span>
                    </div>
                    <div className="order-detail__row order-detail__row--total">
                      <span>合计</span>
                      <span>{formatPrice(orderDetailTotalPrice)}</span>
                    </div>
                    <div className="order-detail__row">
                      <span>支付方式</span>
                      <span>微信支付</span>
                    </div>
                  </section>

                  <section className="order-detail__info">
                    <h3>订单信息</h3>
                    <div className="order-detail__info-row">
                      <span>订单编号</span>
                      <div className="order-detail__info-meta">
                        <span>{orderDetail.order_id}</span>
                        <button
                          type="button"
                          className="order-detail__copy"
                          onClick={() => copyOrderId(orderDetail.order_id)}
                        >
                          复制
                        </button>
                      </div>
                    </div>
                    <div className="order-detail__info-row">
                      <span>下单时间</span>
                      <span>{formatDateTime(orderDetail.create_time)}</span>
                    </div>
                  </section>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {detailOpen && (
        <div className="detail" role="dialog" aria-modal="true">
          <button className="detail__backdrop" onClick={closeDetail} type="button" />
          <div className="detail__panel">
            <header className="detail__header">
              <button className="detail__back" type="button" onClick={closeDetail}>
                返回
              </button>
              <h2>{detail.item_name || '商品详情'}</h2>
              <button className="detail__close" type="button" onClick={closeDetail}>
                ✕
              </button>
            </header>
            <div className="detail__content">
              <div className="detail__media">
                {detailLoading ? (
                  <div className="detail__media--loading" />
                ) : activeImages?.[0] ? (
                  <img src={activeImages[0]} alt={detail.item_name} />
                ) : (
                  <div className="detail__media--empty">暂无图片</div>
                )}
                {isOutOfStock && <span className="detail__soldout">售罄</span>}
              </div>
              <div className="detail__info">
                {detailBrand && <div className="detail__brand">{detailBrand}</div>}
                <h3>{detail.item_name || detailItem?.item_name || '商品详情'}</h3>
                <div className="detail__price">
                  <span className="price">{formatPrice(activePrice)}</span>
                  <span className="price--old">
                    {formatPrice(activeMarketPrice)}
                  </span>
                </div>
                <div className="detail__meta">库存：{displayStock}</div>
                <div className="detail__spec">
                  <span>规格</span>
                  <div className="spec__list">
                    {detailSpecList.length ? (
                      detailSpecList.map((spec, index) => {
                        const stockNumber = Number(spec.stock);
                        const isSoldOut = Number.isFinite(stockNumber) && stockNumber <= 0;
                        return (
                          <button
                            type="button"
                            key={`${spec.label}-${index}`}
                            className={`spec__pill ${
                              spec.id === selectedSpecId ? 'spec__pill--active' : ''
                            } ${isSoldOut ? 'spec__pill--disabled' : ''}`}
                            onClick={() => {
                              if (isSoldOut) return;
                              setSelectedSpecId(spec.id);
                            }}
                          >
                            <span className={`spec__name ${isSoldOut ? 'spec__name--soldout' : ''}`}>
                              {spec.label}
                            </span>
                            <span className="spec__stock">
                              库存 {Number.isFinite(stockNumber) ? spec.stock : '--'}
                            </span>
                          </button>
                        );
                      })
                    ) : (
                      <div className="spec__pill spec__pill--disabled">
                        <span className="spec__name">暂无规格</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="detail__qty">
                  <span>购买数量</span>
                  <div className="qty__control">
                    <button
                      type="button"
                      onClick={() => setQuantity((qty) => Math.max(1, qty - 1))}
                    >
                      -
                    </button>
                    <span>{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity((qty) => qty + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
                {detailError && <div className="detail__error">{detailError}</div>}
              </div>
            </div>
            <footer className="detail__actions">
              <button
                className="action action--cart"
                type="button"
                disabled={!canSelectSpec}
                onClick={() => addToCart(actionItem, quantity)}
              >
                加入购物车
              </button>
              <button
                className="action buy"
                type="button"
                disabled={isOutOfStock || !canSelectSpec}
                onClick={() =>
                  handleCheckout([
                    {
                      item_id: actionItem.item_id,
                      quantity,
                    },
                  ])
                }
              >
                立即购买
              </button>
            </footer>
          </div>
        </div>
      )}

      {checkoutOpen && (
        <div className="checkout" role="dialog" aria-modal="true">
          <button
            className="checkout__backdrop"
            onClick={() => setCheckoutOpen(false)}
            type="button"
          />
          <div className="checkout__panel">
            <header className="checkout__header">
              <button
                className="checkout__back"
                type="button"
                onClick={() => setCheckoutOpen(false)}
              >
                返回
              </button>
              <h2>订单结算</h2>
              <button
                className="checkout__close"
                type="button"
                onClick={() => setCheckoutOpen(false)}
              >
                ✕
              </button>
            </header>
            {checkoutError && <div className="checkout__error">{checkoutError}</div>}
            {checkoutInvalidItems.length ? (
              <section className="checkout__invalid">
                <h3>不可购买商品</h3>
                <div className="checkout__invalid-list">
                  {checkoutInvalidItems.map((item) => {
                    const name =
                      checkoutItemNameById.get(item.item_id) ||
                      `商品ID ${item.item_id}`;
                    return (
                      <div className="checkout__invalid-item" key={item.item_id}>
                        <div>
                          <p className="checkout__invalid-name">{name}</p>
                          <p className="checkout__invalid-msg">
                            {item.message || '当前商品不可购买'}
                          </p>
                        </div>
                        <div className="checkout__invalid-meta">
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
            {checkoutData ? (
              <div className="checkout__content">
                <section className="checkout__address">
                  <h3>收货地址</h3>
                  {checkoutData.address ? (
                    <>
                      <p>
                        {checkoutData.address.name} {checkoutData.address.mobile}
                      </p>
                      <p>
                        {checkoutData.address.province}
                        {checkoutData.address.city}
                        {checkoutData.address.district}
                        {checkoutData.address.address}
                      </p>
                    </>
                  ) : (
                    <p>暂无地址信息</p>
                  )}
                </section>

                <section className="checkout__items">
                  <h3>商品清单</h3>
                  <div className="checkout__list">
                    {checkoutData.items?.map((item) => (
                      <div className="checkout__item" key={item.item_id}>
                        <img src={item.image} alt={item.item_name} />
                        <div className="checkout__info">
                          <h4>{item.item_name}</h4>
                          <p>{item.spec}</p>
                          <div className="checkout__price">
                            <span>{formatPrice(item.price)}</span>
                            <span className="checkout__qty">x {item.quantity}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {checkoutData.gift_items?.length ? (
                  <section className="checkout__gifts">
                    <h3>赠品</h3>
                    <div className="checkout__gift-list">
                      {checkoutData.gift_items.map((gift, index) => (
                        <div className="checkout__gift" key={`${gift.rule_name}-${index}`}>
                          <p>{gift.rule_name}</p>
                          <span>
                            应赠 x {gift.theoretical_quantity} · 实赠 x{' '}
                            {gift.actual_quantity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </section>
                ) : null}

                <section className="checkout__pay">
                  <h3>支付信息</h3>
                  <div className="checkout__row">
                    <span>原价</span>
                    <span>{formatPrice(checkoutData.market_price)}</span>
                  </div>
                  <div className="checkout__row">
                    <span>总价</span>
                    <span>{formatPrice(checkoutData.actual_price)}</span>
                  </div>
                  <div className="checkout__row">
                    <span>运费</span>
                    <span>{formatPrice(checkoutData.shipping_fee)}</span>
                  </div>
                  <div className="checkout__row checkout__row--total">
                    <span>合计</span>
                    <span>{formatPrice(checkoutData.total_price)}</span>
                  </div>
                  <div className="checkout__row">
                    <span>支付方式</span>
                    <span>微信支付</span>
                  </div>
                </section>
              </div>
            ) : (
              !checkoutError && <div className="checkout__empty">暂无订单数据</div>
            )}
            <footer className="checkout__footer">
              <div>
                共 {checkoutData?.total_items_quantity ?? cartCount} 件 合计{' '}
                {formatPrice(checkoutData?.total_price ?? cartTotal)}
              </div>
              <button
                className="checkout__paybtn"
                type="button"
                onClick={() => setCheckoutOpen(false)}
              >
                去小程序支付
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}
