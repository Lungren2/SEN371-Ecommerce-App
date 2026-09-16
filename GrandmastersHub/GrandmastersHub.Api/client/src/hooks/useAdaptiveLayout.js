import { useEffect, useState } from 'react';

export const LayoutMode = Object.freeze({
  COMPACT: 'compact',
  MEDIUM: 'medium',
  EXPANDED: 'expanded',
});

const COMPACT_QUERY = '(max-width: 48rem)';
const MEDIUM_QUERY = '(max-width: 64rem)';

const resolveLayout = () => {
  if (typeof window === 'undefined') return LayoutMode.EXPANDED;
  if (window.matchMedia(COMPACT_QUERY).matches) return LayoutMode.COMPACT;
  if (window.matchMedia(MEDIUM_QUERY).matches) return LayoutMode.MEDIUM;
  return LayoutMode.EXPANDED;
};

export default function useAdaptiveLayout() {
  const [layout, setLayout] = useState(resolveLayout);

  useEffect(() => {
    const compactQuery = window.matchMedia(COMPACT_QUERY);
    const mediumQuery = window.matchMedia(MEDIUM_QUERY);
    const updateLayout = () => setLayout(resolveLayout());

    compactQuery.addEventListener('change', updateLayout);
    mediumQuery.addEventListener('change', updateLayout);

    return () => {
      compactQuery.removeEventListener('change', updateLayout);
      mediumQuery.removeEventListener('change', updateLayout);
    };
  }, []);

  return layout;
}
