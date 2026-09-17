export default function AdaptiveView({ compact, medium, expanded }) {
  const mediumView = medium ?? compact;
  const expandedView = expanded ?? mediumView;

  return (
    <>
      <div className="adaptive-view-compact">{compact}</div>
      <div className="adaptive-view-medium">{mediumView}</div>
      <div className="adaptive-view-expanded">{expandedView}</div>
    </>
  );
}
