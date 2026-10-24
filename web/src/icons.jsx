// A tiny hand-drawn icon set (stroke-based, currentColor) so functional UI chrome
// doesn't lean on emoji glyphs. Emoji stay in generated recipe copy, where they belong.
const base = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round"
};

export function IconUpload(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 15V4" />
      <path d="M7.5 8.5 12 4l4.5 4.5" />
      <path d="M4.5 14v4a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-4" />
    </svg>
  );
}

export function IconPlus(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

export function IconSpark(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3.5c.5 3 2 4.5 5 5-3 .5-4.5 2-5 5-.5-3-2-4.5-5-5 3-.5 4.5-2 5-5Z" />
      <path d="M18.5 16c.25 1.2.9 1.85 2.1 2.1-1.2.25-1.85.9-2.1 2.1-.25-1.2-.9-1.85-2.1-2.1 1.2-.25 1.85-.9 2.1-2.1Z" />
    </svg>
  );
}

export function IconCheck(props) {
  return (
    <svg {...base} {...props}>
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
  );
}

export function IconDot(props) {
  return (
    <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor" {...props}>
      <circle cx="4" cy="4" r="4" />
    </svg>
  );
}

export function IconCpu(props) {
  return (
    <svg {...base} {...props}>
      <rect x="5" y="5" width="14" height="14" rx="4" />
      <path d="M9.5 12h5M12 9.5v5" />
    </svg>
  );
}

export function IconMark(props) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" {...props}>
      <circle cx="9.5" cy="12" r="6.5" fill="white" fillOpacity="0.92" />
      <circle cx="14.5" cy="12" r="6.5" fill="white" fillOpacity="0.55" />
    </svg>
  );
}

export function IconBookmark(props) {
  return (
    <svg {...base} {...props}>
      <path d="M6.5 4.5a1.5 1.5 0 0 1 1.5-1.5h8a1.5 1.5 0 0 1 1.5 1.5v16l-5.5-3.5-5.5 3.5Z" />
    </svg>
  );
}

export function IconMic(props) {
  return (
    <svg {...base} {...props}>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5.5 11a6.5 6.5 0 0 0 13 0" />
      <path d="M12 17.5v3.5M9 21h6" />
    </svg>
  );
}

export function IconGhost(props) {
  return (
    <svg {...base} {...props}>
      <path d="M5.5 19V11a6.5 6.5 0 0 1 13 0v8l-2.2-1.6L14 19l-2-1.6L10 19l-2.3-1.6L5.5 19Z" />
      <path d="M9.5 11h.01M14.5 11h.01" strokeWidth={2.2} />
    </svg>
  );
}

export function IconRefresh(props) {
  return (
    <svg {...base} {...props}>
      <path d="M3.5 12a8.5 8.5 0 0 1 14.6-5.9L20.5 8.5" />
      <path d="M20.5 4.5v4h-4" />
      <path d="M20.5 12a8.5 8.5 0 0 1-14.6 5.9L3.5 15.5" />
      <path d="M3.5 19.5v-4h4" />
    </svg>
  );
}
