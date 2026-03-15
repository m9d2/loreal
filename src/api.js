const AUTH_STORAGE_KEY = 'loreal_auth';
const BASE_URL = '/api/hf/h5app/wxapp';

export const getStoredAuth = () => {
  if (typeof window === 'undefined') {
    return { token: '', appid: '' };
  }
  const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) {
    return { token: '', appid: '' };
  }
  try {
    const parsed = JSON.parse(raw);
    return {
      token: parsed?.token || '',
      appid: parsed?.appid || '',
    };
  } catch {
    return { token: '', appid: '' };
  }
};

export const saveAuth = ({ token, appid }) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(
    AUTH_STORAGE_KEY,
    JSON.stringify({ token: token || '', appid: appid || '' })
  );
};

export const clearAuth = () => {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
};

const buildHeaders = (contentType = 'application/json') => {
  const { token, appid } = getStoredAuth();
  const headers = {
    'content-type': contentType,
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  if (appid) {
    headers['authorizer-appid'] = appid;
  }
  return headers;
};

async function handleResponse(response) {
  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  if (!response.ok) {
    let payload = null;
    if (isJson) {
      try {
        payload = await response.json();
      } catch {
        payload = null;
      }
    }
    const error = new Error(payload?.message || `请求失败: ${response.status}`);
    error.payload = payload;
    throw error;
  }
  const payload = isJson ? await response.json() : null;
  if (payload?.code !== 200) {
    const error = new Error(payload?.message || '接口异常');
    error.payload = payload;
    throw error;
  }
  return payload?.data;
}

export async function fetchTags() {
  const params = new URLSearchParams({
    item_type: 'combo',
    company_id: '1',
    country_code: 'zh',
  });
  const response = await fetch(`${BASE_URL}/goods/tags?${params.toString()}`, {
    headers: buildHeaders(),
  });
  return handleResponse(response);
}

export async function fetchSearchTags(keywords) {
  const params = new URLSearchParams({
    keywords: keywords || '',
    company_id: '1',
    country_code: 'zh',
  });
  const response = await fetch(`${BASE_URL}/goods/tags?${params.toString()}`, {
    headers: buildHeaders(),
  });
  return handleResponse(response);
}

export async function fetchBrandTags(brandId) {
  const params = new URLSearchParams({
    brand_id: String(brandId),
    company_id: '1',
    country_code: 'zh',
  });
  const response = await fetch(`${BASE_URL}/goods/tags?${params.toString()}`, {
    headers: buildHeaders(),
  });
  return handleResponse(response);
}

export async function fetchProducts({
  page,
  pageSize,
  tags,
  brandId,
  keywords,
  goodsSort = 3,
  isCombo = true,
}) {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
    goodsSort: String(goodsSort ?? 3),
    company_id: '1',
    country_code: 'zh',
  });
  if (isCombo) {
    params.set('is_combo', '1');
  }
  if (brandId) {
    params.set('brand_id', String(brandId));
  }
  if (keywords !== undefined) {
    params.set('keywords', keywords);
  }
  if (tags) {
    params.set('tags', tags);
  }
  const response = await fetch(`${BASE_URL}/goods/list/es?${params.toString()}`, {
    headers: buildHeaders(),
  });
  return handleResponse(response);
}

export async function fetchProductDetail(itemId) {
  const params = new URLSearchParams({
    showError: 'false',
    company_id: '1',
    country_code: 'zh',
  });
  const response = await fetch(
    `${BASE_URL}/goods/detail/${itemId}?${params.toString()}`,
    {
      headers: buildHeaders(),
    }
  );
  return handleResponse(response);
}

export async function createDirectOrder(items) {
  const params = new URLSearchParams({
    showError: 'false',
    company_id: '1',
    country_code: 'zh',
  });
  items.forEach((item, index) => {
    params.set(`items[${index}][item_id]`, String(item.item_id));
    params.set(`items[${index}][quantity]`, String(item.quantity));
  });
  const response = await fetch(`${BASE_URL}/order/direct-create`, {
    method: 'POST',
    headers: buildHeaders('application/x-www-form-urlencoded'),
    body: params.toString(),
  });
  return handleResponse(response);
}

export async function fetchOrderList({ page, pageSize, status }) {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
    order_type: 'normal',
    status: status ?? 'all',
    company_id: '1',
    country_code: 'zh',
  });
  const response = await fetch(`${BASE_URL}/order/list?${params.toString()}`, {
    headers: buildHeaders(),
  });
  return handleResponse(response);
}

export async function fetchOrderDetail(orderId) {
  const params = new URLSearchParams({
    company_id: '1',
    country_code: 'zh',
  });
  const response = await fetch(
    `${BASE_URL}/order/detail/${orderId}?${params.toString()}`,
    {
      headers: buildHeaders(),
    }
  );
  return handleResponse(response);
}
