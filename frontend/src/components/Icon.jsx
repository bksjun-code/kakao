// Ported from ios-ipados-26-design-system/components/icon/Icon.jsx
// Near-match recreations of common SF Symbols glyphs (not the proprietary
// SF Symbols set itself). Paths drawn in a 0 0 24 24 box, inherit currentColor.

const P = (d, opts = {}) => ({ d, ...opts });

const GLYPHS = {
  "chevron.right": [P("M9 6l6 6-6 6", { stroke: true, sw: 2 })],
  "chevron.left": [P("M15 6l-6 6 6 6", { stroke: true, sw: 2 })],
  "chevron.down": [P("M6 9l6 6 6-6", { stroke: true, sw: 2 })],
  "chevron.up": [P("M6 15l6-6 6 6", { stroke: true, sw: 2 })],
  "chevron.right.small": [P("M10 7l5 5-5 5", { stroke: true, sw: 1.8 })],
  plus: [P("M12 5v14M5 12h14", { stroke: true, sw: 2 })],
  xmark: [P("M6 6l12 12M18 6L6 18", { stroke: true, sw: 2 })],
  checkmark: [P("M5 13l4 4 10-11", { stroke: true, sw: 2.2 })],
  magnifyingglass: [P("M11 4a7 7 0 105.2 11.7L21 21", { stroke: true, sw: 2 })],
  trash: [P("M5 7h14M9 7V5h6v2M7 7l1 13h8l1-13", { stroke: true, sw: 1.8 })],
  paperclip: [P("M8 12.5l6.5-6.5a3 3 0 114.2 4.2L11 18a5 5 0 11-7-7l7.5-7.5", { stroke: true, sw: 1.8 })],
  "xmark.circle.fill": [
    P("M12 2a10 10 0 110 20 10 10 0 010-20z", { fill: true }),
    P("M8.5 8.5l7 7M15.5 8.5l-7 7", { stroke: true, sw: 1.8, strokeColor: "#fff" }),
  ],
  "checkmark.circle.fill": [
    P("M12 2a10 10 0 110 20 10 10 0 010-20z", { fill: true }),
    P("M7.5 12.5l3 3 6-6.5", { stroke: true, sw: 1.8, strokeColor: "#fff" }),
  ],
  "wallet.pass": [
    P("M4 6h16v13H4z", { stroke: true, sw: 1.6 }),
    P("M4 11h16", { stroke: true, sw: 1.6 }),
  ],
  "person.crop.circle": [
    P("M12 3a9 9 0 110 18 9 9 0 010-18z", { stroke: true, sw: 1.6 }),
    P("M12 8.5a2.6 2.6 0 110 5.2 2.6 2.6 0 010-5.2z", { fill: true }),
    P("M6.5 18.5c1-2.4 3-3.4 5.5-3.4s4.5 1 5.5 3.4", { stroke: true, sw: 1.6 }),
  ],
  gear: [
    P("M12 9.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5z", { stroke: true, sw: 1.6 }),
    P("M12 3l1 2.2 2.4-.6.6 2.4 2.2 1-1 2.2 1 2.2-2.2 1-.6 2.4-2.4-.6L12 21l-1-2.2-2.4.6-.6-2.4-2.2-1 1-2.2-1-2.2 2.2-1 .6-2.4 2.4.6z", { stroke: true, sw: 1.4 }),
  ],
  photo: [
    P("M4 5h16v14H4z", { stroke: true, sw: 1.6 }),
    P("M4 16l4-4 3 3 4-5 5 6", { stroke: true, sw: 1.6 }),
    P("M9 9a1.4 1.4 0 100 2.8A1.4 1.4 0 009 9z", { fill: true }),
  ],
};

export function Icon({ name, size = 22, weight = "regular", color, style, className, ...rest }) {
  const paths = GLYPHS[name];
  const swScale = weight === "bold" ? 1.3 : weight === "semibold" ? 1.15 : weight === "light" ? 0.8 : 1;
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      style={{ display: "inline-block", flex: "none", color, verticalAlign: "middle", ...style }}
      aria-hidden={rest["aria-label"] ? undefined : true}
      {...rest}
    >
      {paths?.map((p, i) => (
        <path
          key={i}
          d={p.d}
          fill={p.fill ? "currentColor" : "none"}
          stroke={p.stroke ? p.strokeColor || "currentColor" : "none"}
          strokeWidth={p.stroke ? (p.sw || 1.6) * swScale : undefined}
          strokeLinecap={p.cap || "round"}
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
}
