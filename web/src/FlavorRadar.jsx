const SIZE = 220;
const CENTER = SIZE / 2;
const MAX_RADIUS = 80;

function pointFor(index, total, value) {
  const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
  const r = value * MAX_RADIUS;
  return [CENTER + r * Math.cos(angle), CENTER + r * Math.sin(angle)];
}

function polygonPoints(values, total) {
  return values.map((v, i) => pointFor(i, total, v).join(",")).join(" ");
}

export default function FlavorRadar({ profile }) {
  if (!profile) return null;
  const { clusters, fridgeVector, cravingVector, sharedClusters } = profile;
  const total = clusters.length;
  // normalize each axis against the max value across both vectors so the shape uses the full chart
  const maxVal = Math.max(...clusters.map((c) => Math.max(fridgeVector[c], cravingVector[c])), 0.001);

  const fridgeValues = clusters.map((c) => fridgeVector[c] / maxVal);
  const cravingValues = clusters.map((c) => cravingVector[c] / maxVal);

  const rings = [0.25, 0.5, 0.75, 1];

  return (
    <div className="section-card flavor-radar">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="radar-svg" role="img" aria-label="Flavor cluster radar chart">
        {rings.map((r) => (
          <polygon key={r} points={polygonPoints(clusters.map(() => r), total)} className="radar-ring" />
        ))}
        {clusters.map((c, i) => {
          const [x, y] = pointFor(i, total, 1.18);
          return (
            <text key={c} x={x} y={y} className={`radar-label ${sharedClusters.includes(c) ? "shared" : ""}`} textAnchor="middle" dominantBaseline="middle">
              {c}
            </text>
          );
        })}
        <polygon points={polygonPoints(fridgeValues, total)} className="radar-fridge" />
        <polygon points={polygonPoints(cravingValues, total)} className="radar-craving" />
      </svg>

      <div className="flavor-radar-aside">
        <h3>Flavor-science profile</h3>
        <p className="flavor-radar-copy">
          Computed overlap between the fridge and the craving across eight flavor clusters — this grounds
          the recipe instead of leaving it to the model's guesswork.
        </p>
        <div className="radar-legend">
          <span><i className="swatch swatch-fridge" /> fridge</span>
          <span><i className="swatch swatch-craving" /> craving</span>
        </div>
        {sharedClusters.length > 0 && (
          <p className="radar-note">Shared flavor DNA: <strong>{sharedClusters.join(", ")}</strong></p>
        )}
      </div>
    </div>
  );
}
