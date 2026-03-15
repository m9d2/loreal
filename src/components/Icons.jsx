export const IconSearch = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M11 3a8 8 0 0 1 6.32 12.9l3.39 3.4a1 1 0 0 1-1.42 1.4l-3.4-3.38A8 8 0 1 1 11 3Zm0 2a6 6 0 1 0 0 12 6 6 0 0 0 0-12Z" />
  </svg>
);

export const IconHome = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 3 3 10v11h6v-7h6v7h6V10l-9-7Zm0 2.4 6 4.7V19h-2v-7H8v7H6V10.1l6-4.7Z" />
  </svg>
);

export const IconBag = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M7 7V6a5 5 0 0 1 10 0v1h4v14H3V7h4Zm2 0h6V6a3 3 0 0 0-6 0v1Zm-4 2v10h14V9H5Z" />
  </svg>
);

export const IconCategory = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Zm9 0h7v7h-7v-7Z" />
  </svg>
);

export const IconOrder = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M6 2h12a2 2 0 0 1 2 2v18l-3-2-3 2-3-2-3 2V4a2 2 0 0 1 2-2Zm0 2v14.6l1-0.7 3 2 3-2 3 2 1-0.7V4H6Zm2 5h8v2H8V9Zm0 4h8v2H8v-2Z" />
  </svg>
);

export const IconCart = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M7 6h14l-2 9H8L6 3H3v2h2l2.4 10.5a2 2 0 0 0 2 1.5h9.6a2 2 0 0 0 2-1.6L23 4H7Zm2 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm9 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z" />
  </svg>
);

export const IconLogin = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M10 5a3 3 0 0 1 3-3h6v20h-6a3 3 0 0 1-3-3v-2h2v2a1 1 0 0 0 1 1h4V4h-4a1 1 0 0 0-1 1v2h-2V5Zm-7 7 5-5v3h8v4H8v3l-5-5Z" />
  </svg>
);

export const IconList = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M4 5h16v2H4V5Zm0 6h16v2H4v-2Zm0 6h16v2H4v-2Z" />
  </svg>
);

export const IconGrid = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm10 0h6v6h-6v-6Z" />
  </svg>
);

export const IconArrow = ({ direction = 'up' }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={`arrow arrow--${direction}`}>
    <path d="M12 5 5 12h4v7h6v-7h4L12 5Z" />
  </svg>
);
