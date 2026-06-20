import * as XLSX from 'xlsx';
import { fetchOrderList, fetchOrderDetail } from '../api.js';

const formatPriceYuan = (cents) => {
  const amount = Number(cents || 0) / 100;
  return `¥${amount.toFixed(2)}`;
};

const getTotalPayment = (orders) =>
  orders.reduce(
    (total, order) => total + Number(order.total_price ?? order.actual_price ?? 0),
    0
  );

const formatItems = (items) => {
  if (!Array.isArray(items) || !items.length) return '';
  return items
    .map((item) => {
      const name = item.item_name || '';
      const qty = item.num ?? item.quantity ?? 0;
      const price = formatPriceYuan(item.price);
      return `${name} x${qty} ${price}`;
    })
    .join('\n');
};

const formatGifts = (gifts) => {
  if (!Array.isArray(gifts) || !gifts.length) return '';
  return gifts
    .map(
      (g) =>
        `${g.rule_name || ''} (应赠x${g.theoretical_quantity ?? 0} 实赠x${g.actual_quantity ?? 0})`
    )
    .join('\n');
};

const formatDateTime = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(Number(timestamp) * 1000);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getItems = (order) =>
  Array.isArray(order.items)
    ? order.items
    : Array.isArray(order.item_list)
      ? order.item_list
      : Array.isArray(order.goods_items)
        ? order.goods_items
        : [];

const getGifts = (order) =>
  Array.isArray(order.gift_items) ? order.gift_items : [];

const COMPACT_COLS = [
  { wch: 22 }, // 订单号
  { wch: 20 }, // 下单时间
  { wch: 10 }, // 订单状态
  { wch: 12 }, // 收货人
  { wch: 15 }, // 收货电话
  { wch: 40 }, // 收货地址
  { wch: 10 }, // 商品数量
  { wch: 60 }, // 商品清单
  { wch: 14 }, // 支付金额
  { wch: 40 }, // 赠品
];

const SPLIT_COLS = [
  { wch: 22 }, // 订单号
  { wch: 20 }, // 下单时间
  { wch: 10 }, // 订单状态
  { wch: 12 }, // 收货人
  { wch: 15 }, // 收货电话
  { wch: 40 }, // 收货地址
  { wch: 10 }, // 商品数量
  { wch: 40 }, // 商品名称
  { wch: 14 }, // 商品单价
  { wch: 14 }, // 订单金额
  { wch: 40 }, // 赠品
];

// Order-level columns to merge in split mode: 订单号~收货地址(0-5), 订单金额(9)
const MERGE_COLS = [0, 1, 2, 3, 4, 5, 9];

function extractOrderRow(order) {
  const items = getItems(order);
  const gifts = getGifts(order);
  const totalQty =
    order.total_items_quantity ??
    items.reduce((s, i) => s + Number(i.num || i.quantity || 0), 0);

  return {
    订单号: String(order.order_id || ''),
    下单时间: formatDateTime(order.create_time),
    订单状态: order.order_status_msg || '',
    收货人: order.consignee || '',
    收货电话: order.mobile || '',
    收货地址: `${order.province || ''}${order.city || ''}${order.district || ''}${order.address || ''}`.trim(),
    商品数量: totalQty,
    商品清单: formatItems(items),
    支付金额: formatPriceYuan(order.total_price ?? order.actual_price),
    赠品: formatGifts(gifts),
  };
}

// 一行显示：每个订单一行，商品/赠品用换行拼在单元格内
function buildCompactSheet(detailedOrders) {
  const rows = detailedOrders.map(extractOrderRow);
  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = COMPACT_COLS;
  // wrap 商品清单(7) & 赠品(9)
  for (let r = 1; r <= rows.length; r++) {
    for (const c of [7, 9]) {
      const cell = XLSX.utils.encode_cell({ r, c });
      if (ws[cell]) ws[cell].s = { alignment: { wrapText: true, vertical: 'top' } };
    }
  }

  const summaryRow = rows.length + 1;
  XLSX.utils.sheet_add_aoa(
    ws,
    [[
      '总支付金额', '', '', '', '', '', '', '',
      formatPriceYuan(getTotalPayment(detailedOrders)),
      '',
    ]],
    { origin: { r: summaryRow, c: 0 } }
  );
  ws['!merges'] = [
    ...(ws['!merges'] || []),
    { s: { r: summaryRow, c: 0 }, e: { r: summaryRow, c: 7 } },
  ];

  return ws;
}

// 拆分单元格：商品和赠品分别逐行拆分并从首行对齐，订单级信息合并单元格
function buildSplitSheet(detailedOrders) {
  // 11 columns: order-level(0-5) + item-level(6-8) + order-level(9) + gift(10)
  const HEADER = [
    '订单号', '下单时间', '订单状态',
    '收货人', '收货电话', '收货地址',
    '商品数量', '商品名称', '商品单价',
    '订单金额', '赠品',
  ];

  const data = [];
  const merges = [];
  let rowIdx = 0;

  for (const order of detailedOrders) {
    const items = getItems(order);
    const gifts = getGifts(order);
    const baseRow = rowIdx;
    const orderAddr = `${order.province || ''}${order.city || ''}${order.district || ''}${order.address || ''}`.trim();
    const payAmount = formatPriceYuan(order.total_price ?? order.actual_price);

    // Order-level values (shared across all rows of this order)
    const orderBase = [
      String(order.order_id || ''),
      formatDateTime(order.create_time),
      order.order_status_msg || '',
      order.consignee || '',
      order.mobile || '',
      orderAddr,
    ];

    // 商品与赠品都从订单首行开始逐行对齐；较多的一侧继续向下展示。
    const rowCount = Math.max(items.length, gifts.length, 1);
    for (let detailIndex = 0; detailIndex < rowCount; detailIndex++) {
      const item = items[detailIndex];
      const gift = gifts[detailIndex];
      const giftText = gift
        ? `${gift.rule_name || ''} (应赠x${gift.theoretical_quantity ?? 0} 实赠x${gift.actual_quantity ?? 0})`
        : '';

      data.push([
        ...orderBase,
        item ? (item.num ?? item.quantity ?? 0) : '',
        item?.item_name || '',
        item ? formatPriceYuan(item.price) : '',
        payAmount,
        giftText,
      ]);
      rowIdx++;
    }

    const endRow = rowIdx - 1;
    if (endRow > baseRow) {
      // Merge order-level columns: 订单号~收货地址(0-5) + 订单金额(9)
      for (const c of MERGE_COLS) {
        // Row 0 is the header in the worksheet, while baseRow/endRow are
        // indexes into the data array. Offset both ends so headers are never
        // included in an order-level merge.
        merges.push({ s: { r: baseRow + 1, c }, e: { r: endRow + 1, c } });
      }
    }
  }

  const summaryRow = data.length + 1;
  data.push([
    '总支付金额', '', '', '', '', '', '', '', '',
    formatPriceYuan(getTotalPayment(detailedOrders)),
    '',
  ]);
  merges.push({ s: { r: summaryRow, c: 0 }, e: { r: summaryRow, c: 8 } });

  const ws = XLSX.utils.aoa_to_sheet([HEADER, ...data]);
  ws['!cols'] = SPLIT_COLS;
  ws['!merges'] = merges;

  return ws;
}

/**
 * Fetch all orders for a given status, paginating through all pages.
 */
async function fetchAllOrders(status, onProgress) {
  const PAGE_SIZE = 10;
  let allOrders = [];

  const firstPage = await fetchOrderList({ page: 1, pageSize: PAGE_SIZE, status });
  const list = Array.isArray(firstPage?.list)
    ? firstPage.list
    : Array.isArray(firstPage?.orders)
      ? firstPage.orders
      : Array.isArray(firstPage)
        ? firstPage
        : [];
  const totalCount =
    Number(firstPage?.pager?.count || 0) ||
    Number(firstPage?.total_count || firstPage?.total || 0);
  allOrders = list;
  if (onProgress) onProgress(allOrders.length, totalCount);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE) || 1;
  const remainingPages = [];
  for (let p = 2; p <= totalPages; p++) remainingPages.push(p);

  for (let i = 0; i < remainingPages.length; i += 3) {
    const batch = remainingPages.slice(i, i + 3);
    const results = await Promise.all(
      batch.map((p) => fetchOrderList({ page: p, pageSize: PAGE_SIZE, status }))
    );
    for (const data of results) {
      const pageList = Array.isArray(data?.list)
        ? data.list
        : Array.isArray(data?.orders)
          ? data.orders
          : Array.isArray(data)
            ? data
            : [];
      allOrders = allOrders.concat(pageList);
    }
    if (onProgress) onProgress(allOrders.length, totalCount);
  }

  return allOrders;
}

/**
 * Fetch order details in batches.
 */
async function fetchOrderDetails(orders, onProgress) {
  const BATCH_SIZE = 5;
  const detailed = [];

  for (let i = 0; i < orders.length; i += BATCH_SIZE) {
    const batch = orders.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(
      batch.map(async (order) => {
        try {
          const data = await fetchOrderDetail(order.order_id);
          return data?.orderInfo || data || order;
        } catch {
          return order;
        }
      })
    );
    detailed.push(...results);
    if (onProgress) onProgress(detailed.length, orders.length);
  }

  return detailed;
}

/**
 * Export orders to an Excel file and trigger download.
 * @param {string} status - Order status filter
 * @param {string} statusLabel - Human-readable status label for filename
 * @param {'compact'|'split'} mode - 'compact' = one row per order, 'split' = one row per item
 * @param {function} onProgress - (current, total, phase)
 */
export async function exportOrdersToExcel(status, statusLabel, mode, onProgress) {
  if (onProgress) onProgress(0, 0, 'fetching_list');

  const orders = await fetchAllOrders(status, (current, total) => {
    if (onProgress) onProgress(current, total, 'fetching_list');
  });

  if (!orders.length) throw new Error('没有可导出的订单');

  if (onProgress) onProgress(0, orders.length, 'fetching_details');

  const detailedOrders = await fetchOrderDetails(orders, (current, total) => {
    if (onProgress) onProgress(current, total, 'fetching_details');
  });

  if (onProgress) onProgress(0, detailedOrders.length, 'generating');

  const ws = mode === 'split'
    ? buildSplitSheet(detailedOrders)
    : buildCompactSheet(detailedOrders);

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '订单');

  const now = new Date();
  const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const filename = `${statusLabel}订单_${dateStr}.xlsx`;
  XLSX.writeFile(wb, filename);

  return { count: detailedOrders.length, filename };
}
