const iconClass = 'h-5 w-5';

export const IconSearch = ({ className = iconClass }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
    <path d="M11 3a8 8 0 0 1 6.32 12.9l3.39 3.4a1 1 0 0 1-1.42 1.4l-3.4-3.38A8 8 0 1 1 11 3Zm0 2a6 6 0 1 0 0 12 6 6 0 0 0 0-12Z" />
  </svg>
);

export const IconHome = ({ className = iconClass }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
    <path d="M12 3 3 10v11h6v-7h6v7h6V10l-9-7Zm0 2.4 6 4.7V19h-2v-7H8v7H6V10.1l6-4.7Z" />
  </svg>
);

export const IconBag = ({ className = iconClass }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
    <path d="M7 7V6a5 5 0 0 1 10 0v1h4v14H3V7h4Zm2 0h6V6a3 3 0 0 0-6 0v1Zm-4 2v10h14V9H5Z" />
  </svg>
);

export const IconCategory = ({ className = iconClass }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
    <path d="M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Zm9 0h7v7h-7v-7Z" />
  </svg>
);

export const IconOrder = ({ className = iconClass }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
    <path d="M6 2h12a2 2 0 0 1 2 2v18l-3-2-3 2-3-2-3 2V4a2 2 0 0 1 2-2Zm0 2v14.6l1-0.7 3 2 3-2 3 2 1-0.7V4H6Zm2 5h8v2H8V9Zm0 4h8v2H8v-2Z" />
  </svg>
);

export const IconCart = ({ className = iconClass }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
    <path d="M7 6h14l-2 9H8L6 3H3v2h2l2.4 10.5a2 2 0 0 0 2 1.5h9.6a2 2 0 0 0 2-1.6L23 4H7Zm2 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm9 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z" />
  </svg>
);

export const IconSoldOut = ({ className = iconClass }) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
        <path d="M7 7V6a5 5 0 0 1 10 0v1h3v13a2 2 0 0 1-2 2H6.8L3 18.2V7h4Zm2 0h6V6a3 3 0 0 0-6 0v1Zm-4 2v8.4L7.6 20H18V9H5Zm-1.3-5.3 16.6 16.6-1.4 1.4L2.3 5.1l1.4-1.4Z" />
    </svg>
);

export const IconTrash = ({ className = iconClass }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
    <path d="M10 3h4a2 2 0 0 1 2 2v1h4v2h-1l-1 11a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 8H4V6h4V5a2 2 0 0 1 2-2Zm4 3V5h-4v1h4Zm-6.99 2 .99 11h8l1-11H7.01ZM10 10h2v6h-2v-6Zm4 0h-2v6h2v-6Z" />
  </svg>
);

export const IconLogin = ({ className = iconClass }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
    <path d="M10 5a3 3 0 0 1 3-3h6v20h-6a3 3 0 0 1-3-3v-2h2v2a1 1 0 0 0 1 1h4V4h-4a1 1 0 0 0-1 1v2h-2V5Zm-7 7 5-5v3h8v4H8v3l-5-5Z" />
  </svg>
);

export const IconList = ({ className = iconClass }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
    <path d="M4 5h16v2H4V5Zm0 6h16v2H4v-2Zm0 6h16v2H4v-2Z" />
  </svg>
);

export const IconGrid = ({ className = iconClass }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
    <path d="M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm10 0h6v6h-6v-6Z" />
  </svg>
);

export const IconArrow = ({ direction = 'up', className = iconClass }) => (
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
    className={`${className} ${direction === 'down' ? 'rotate-180' : ''}`}
  >
    <path d="M12 5 5 12h4v7h6v-7h4L12 5Z" />
  </svg>
);
