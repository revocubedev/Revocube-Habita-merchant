type StoredEstate = { estateCode?: string };

export const estatePath = (code: string, path = '/') =>
  `/${encodeURIComponent(code)}${path === '/' ? '' : path}`;

export const getStoredEstateCodes = (): string[] => {
  try {
    const estates = JSON.parse(localStorage.getItem('estates') || '[]');
    if (!Array.isArray(estates)) return [];
    return estates
      .map((estate: StoredEstate) => estate?.estateCode)
      .filter((code): code is string => typeof code === 'string' && code.length > 0);
  } catch {
    return [];
  }
};

export const getDefaultEstateCode = (): string | null => {
  const saved = localStorage.getItem('code');
  const codes = getStoredEstateCodes();
  if (saved && (codes.length === 0 || codes.includes(saved))) return saved;
  return codes[0] || null;
};
