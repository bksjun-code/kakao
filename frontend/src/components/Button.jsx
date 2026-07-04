// Ported from ios-ipados-26-design-system/components/buttons/Button.jsx
// Capsule control with iOS button styles: filled, tinted, gray, bordered, plain.

const HEIGHTS = { mini: 28, small: 34, medium: 40, large: 50 };
const FONTS = { mini: 15, small: 15, medium: 17, large: 17 };
const PADS = { mini: 12, small: 14, medium: 18, large: 22 };

export function Button({
  children,
  variant = "filled",
  size = "medium",
  tint = "var(--tint)",
  disabled = false,
  block = false,
  destructive = false,
  style,
  className,
  ...rest
}) {
  const accent = destructive ? "var(--accents-red)" : tint;
  const variants = {
    filled: { background: accent, color: "#fff" },
    tinted: { background: `color-mix(in srgb, ${accent} 15%, transparent)`, color: accent },
    gray: { background: "var(--fills-tertiary)", color: accent },
    bordered: {
      background: "transparent",
      color: accent,
      boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${accent} 45%, transparent)`,
    },
    plain: { background: "transparent", color: accent, padding: `0 ${Math.round(PADS[size] / 2)}px` },
  };
  return (
    <button
      type="button"
      className={className}
      disabled={disabled}
      style={{
        display: block ? "flex" : "inline-flex",
        width: block ? "100%" : undefined,
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        height: HEIGHTS[size],
        padding: `0 ${PADS[size]}px`,
        borderRadius: 999,
        border: "none",
        font: `600 ${FONTS[size]}px/1 var(--font-system)`,
        letterSpacing: "-0.2px",
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.4 : 1,
        transition: "filter .12s ease",
        WebkitTapHighlightColor: "transparent",
        userSelect: "none",
        whiteSpace: "nowrap",
        ...variants[variant],
        ...style,
      }}
      onPointerDown={(e) => {
        if (!disabled) e.currentTarget.style.filter = "brightness(0.92)";
      }}
      onPointerUp={(e) => {
        e.currentTarget.style.filter = "";
      }}
      onPointerLeave={(e) => {
        e.currentTarget.style.filter = "";
      }}
      {...rest}
    >
      {children}
    </button>
  );
}
