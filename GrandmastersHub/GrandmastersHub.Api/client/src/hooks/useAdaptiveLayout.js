import { useSyncExternalStore } from 'react';

export const LayoutMode = Object.freeze({
  COMPACT: 'compact',
  MEDIUM: 'medium',
  EXPANDED: 'expanded',
});

export const adaptiveBreakpoints = Object.freeze({
  compactMax: 768,
  mediumMax: 1024,
});

const getViewportWidth = () => {
  if (typeof window === 'undefined') return Number.POSITIVE_INFINITY;
  return window.visualViewport?.width ?? window.innerWidth;
};

const resolveLayout = () => {
  const width = getViewportWidth();
  if (width <= adaptiveBreakpoints.compactMax) return LayoutMode.COMPACT;
  if (width <= adaptiveBreakpoints.mediumMax) return LayoutMode.MEDIUM;
  return LayoutMode.EXPANDED;
};

const subscribe = (onStoreChange) => {
  if (typeof window === 'undefined') return () => {};

  window.addEventListener('resize', onStoreChange);
  window.visualViewport?.addEventListener('resize', onStoreChange);

  return () => {
    window.removeEventListener('resize', onStoreChange);
    window.visualViewport?.removeEventListener('resize', onStoreChange);
  };
};

export default function useAdaptiveLayout() {
  return useSyncExternalStore(subscribe, resolveLayout, () => LayoutMode.EXPANDED);
}
