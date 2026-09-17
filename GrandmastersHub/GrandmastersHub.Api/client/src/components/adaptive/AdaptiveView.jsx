import useAdaptiveLayout, { LayoutMode } from '../../hooks/useAdaptiveLayout';

export default function AdaptiveView({ compact, medium, expanded }) {
  const layout = useAdaptiveLayout();

  if (layout === LayoutMode.COMPACT) return compact;
  if (layout === LayoutMode.MEDIUM) return medium ?? compact;
  return expanded ?? medium ?? compact;
}
