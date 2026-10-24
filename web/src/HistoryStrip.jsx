export default function HistoryStrip({ items, onSelect }) {
  if (!items.length) return null;
  return (
    <div className="history-strip">
      <h3>Recent fusions</h3>
      <div className="history-row">
        {items.map((item, i) => (
          <button key={i} className="chip chip-button" onClick={() => onSelect(item)}>
            {item.recipe.title}
          </button>
        ))}
      </div>
    </div>
  );
}
