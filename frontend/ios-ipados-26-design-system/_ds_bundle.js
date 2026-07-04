/* @ds-bundle: {"format":3,"namespace":"IOSIPadOS26DesignSystem_9abca8","components":[{"name":"Button","sourcePath":"components/buttons/Button.jsx"},{"name":"IconButton","sourcePath":"components/buttons/IconButton.jsx"},{"name":"SegmentedControl","sourcePath":"components/controls/SegmentedControl.jsx"},{"name":"Slider","sourcePath":"components/controls/Slider.jsx"},{"name":"Stepper","sourcePath":"components/controls/Stepper.jsx"},{"name":"Switch","sourcePath":"components/controls/Switch.jsx"},{"name":"Card","sourcePath":"components/data/Card.jsx"},{"name":"Widget","sourcePath":"components/data/Widget.jsx"},{"name":"ActivityIndicator","sourcePath":"components/feedback/ActivityIndicator.jsx"},{"name":"Avatar","sourcePath":"components/feedback/Avatar.jsx"},{"name":"Badge","sourcePath":"components/feedback/Badge.jsx"},{"name":"PageControl","sourcePath":"components/feedback/PageControl.jsx"},{"name":"ProgressBar","sourcePath":"components/feedback/ProgressBar.jsx"},{"name":"SearchField","sourcePath":"components/forms/SearchField.jsx"},{"name":"TextField","sourcePath":"components/forms/TextField.jsx"},{"name":"Icon","sourcePath":"components/icon/Icon.jsx"},{"name":"ICON_NAMES","sourcePath":"components/icon/Icon.jsx"},{"name":"List","sourcePath":"components/lists/List.jsx"},{"name":"ListRow","sourcePath":"components/lists/ListRow.jsx"},{"name":"NavigationBar","sourcePath":"components/navigation/NavigationBar.jsx"},{"name":"StatusBar","sourcePath":"components/navigation/StatusBar.jsx"},{"name":"TabBar","sourcePath":"components/navigation/TabBar.jsx"},{"name":"Toolbar","sourcePath":"components/navigation/Toolbar.jsx"},{"name":"ActionSheet","sourcePath":"components/overlays/ActionSheet.jsx"},{"name":"Alert","sourcePath":"components/overlays/Alert.jsx"},{"name":"Menu","sourcePath":"components/overlays/Menu.jsx"},{"name":"NotificationBanner","sourcePath":"components/overlays/NotificationBanner.jsx"},{"name":"Sheet","sourcePath":"components/overlays/Sheet.jsx"}],"sourceHashes":{"components/buttons/Button.jsx":"743091151f7b","components/buttons/IconButton.jsx":"c7b346b6e051","components/controls/SegmentedControl.jsx":"76e693db6c1c","components/controls/Slider.jsx":"bd95ddcea288","components/controls/Stepper.jsx":"02f13e2b77fc","components/controls/Switch.jsx":"786c3b9237e2","components/data/Card.jsx":"05f065f3e95b","components/data/Widget.jsx":"76c5df4b3057","components/feedback/ActivityIndicator.jsx":"25b727564d70","components/feedback/Avatar.jsx":"8d776c9f8a4c","components/feedback/Badge.jsx":"22a886d43e52","components/feedback/PageControl.jsx":"f715cf2556ec","components/feedback/ProgressBar.jsx":"8e6a03ff2356","components/forms/SearchField.jsx":"7139940df29b","components/forms/TextField.jsx":"df32bd37869e","components/icon/Icon.jsx":"5b06f95708af","components/lists/List.jsx":"c1e1e043666a","components/lists/ListRow.jsx":"706e7b029407","components/navigation/NavigationBar.jsx":"9fea51a49e4e","components/navigation/StatusBar.jsx":"b7d99cdca76d","components/navigation/TabBar.jsx":"82aad844ee4c","components/navigation/Toolbar.jsx":"b4acaded0bc3","components/overlays/ActionSheet.jsx":"307e7fc35012","components/overlays/Alert.jsx":"f641d851ac92","components/overlays/Menu.jsx":"2b07f06dcaa3","components/overlays/NotificationBanner.jsx":"9926040c1cf7","components/overlays/Sheet.jsx":"5ff8743fc04a"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.IOSIPadOS26DesignSystem_9abca8 = window.IOSIPadOS26DesignSystem_9abca8 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/controls/SegmentedControl.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* iOS / iPadOS 26 — SegmentedControl
   Pill track with a sliding white selection capsule, hairline dividers
   between unselected segments. */

function SegmentedControl({
  segments = [],
  value,
  defaultValue,
  onChange,
  disabled = false,
  style,
  ...rest
}) {
  const initial = value ?? defaultValue ?? (segments[0] && (segments[0].value ?? segments[0]));
  const [sel, setSel] = React.useState(initial);
  React.useEffect(() => {
    if (value !== undefined) setSel(value);
  }, [value]);
  const items = segments.map(s => typeof s === "string" ? {
    label: s,
    value: s
  } : s);
  const idx = Math.max(0, items.findIndex(s => s.value === sel));
  const n = items.length;
  const select = v => {
    if (disabled) return;
    setSel(v);
    onChange && onChange(v);
  };
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      position: "relative",
      display: "grid",
      gridTemplateColumns: `repeat(${n}, 1fr)`,
      height: 32,
      padding: 2,
      borderRadius: 9,
      background: "var(--fills-tertiary)",
      opacity: disabled ? 0.5 : 1,
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      top: 2,
      left: 2,
      bottom: 2,
      width: `calc((100% - 4px) / ${n})`,
      transform: `translateX(${idx * 100}%)`,
      borderRadius: 7,
      background: "var(--miscellaneous-segmented-control-selected-fill)",
      boxShadow: "0 3px 8px rgba(0,0,0,0.12), 0 1px 1px rgba(0,0,0,0.04)",
      transition: "transform .22s cubic-bezier(.4,.0,.2,1)"
    }
  }), items.map((s, i) => {
    const active = i === idx;
    const showDivider = i > 0 && i !== idx && i - 1 !== idx;
    return /*#__PURE__*/React.createElement("button", {
      key: s.value,
      type: "button",
      onClick: () => select(s.value),
      style: {
        position: "relative",
        zIndex: 1,
        border: "none",
        background: "transparent",
        font: `${active ? 600 : 500} 13px/1 var(--font-system)`,
        color: "var(--labels-primary)",
        cursor: disabled ? "default" : "pointer",
        WebkitTapHighlightColor: "transparent"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        position: "absolute",
        left: 0,
        top: "50%",
        transform: "translateY(-50%)",
        width: 1,
        height: 16,
        background: showDivider ? "var(--separators-non-opaque)" : "transparent"
      }
    }), s.label);
  }));
}
Object.assign(__ds_scope, { SegmentedControl });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/controls/SegmentedControl.jsx", error: String((e && e.message) || e) }); }

// components/controls/Slider.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* iOS / iPadOS 26 — Slider
   Track with filled minimum side, 28px knob. Optional leading/trailing glyphs. */

function Slider({
  value = 50,
  min = 0,
  max = 100,
  onChange,
  tint = "var(--tint)",
  disabled = false,
  style,
  ...rest
}) {
  const [val, setVal] = React.useState(value);
  React.useEffect(() => setVal(value), [value]);
  const pct = (val - min) / (max - min) * 100;
  const trackRef = React.useRef(null);
  const setFromClientX = clientX => {
    const el = trackRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
    const next = Math.round(min + p * (max - min));
    setVal(next);
    onChange && onChange(next);
  };
  const onDown = e => {
    if (disabled) return;
    setFromClientX(e.clientX);
    const move = ev => setFromClientX(ev.clientX);
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: "flex",
      alignItems: "center",
      height: 28,
      opacity: disabled ? 0.5 : 1,
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    ref: trackRef,
    onPointerDown: onDown,
    style: {
      position: "relative",
      flex: 1,
      height: 4,
      borderRadius: 2,
      background: "var(--fills-secondary)",
      cursor: disabled ? "default" : "pointer",
      touchAction: "none"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 0,
      top: 0,
      bottom: 0,
      width: pct + "%",
      borderRadius: 2,
      background: tint
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      top: "50%",
      left: pct + "%",
      width: 28,
      height: 28,
      marginLeft: -14,
      transform: "translateY(-50%)",
      borderRadius: "50%",
      background: "#fff",
      boxShadow: "0 3px 8px rgba(0,0,0,0.15), 0 1px 1px rgba(0,0,0,0.16)"
    }
  })));
}
Object.assign(__ds_scope, { Slider });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/controls/Slider.jsx", error: String((e && e.message) || e) }); }

// components/controls/Switch.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* iOS / iPadOS 26 — Switch (toggle)
   51×31 capsule, knob slides with a spring. On = system green by default. */

function Switch({
  checked = false,
  onChange,
  disabled = false,
  tint = "var(--accents-green)",
  style,
  ...rest
}) {
  const [on, setOn] = React.useState(checked);
  React.useEffect(() => setOn(checked), [checked]);
  const toggle = () => {
    if (disabled) return;
    const next = !on;
    setOn(next);
    onChange && onChange(next);
  };
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    role: "switch",
    "aria-checked": on,
    disabled: disabled,
    onClick: toggle,
    style: {
      position: "relative",
      width: 51,
      height: 31,
      flex: "none",
      borderRadius: 999,
      border: "none",
      padding: 0,
      cursor: disabled ? "default" : "pointer",
      background: on ? tint : "var(--fills-secondary)",
      opacity: disabled ? 0.5 : 1,
      transition: "background .22s cubic-bezier(.4,.0,.2,1)",
      WebkitTapHighlightColor: "transparent",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      top: 2,
      left: on ? 22 : 2,
      width: 27,
      height: 27,
      borderRadius: "50%",
      background: "#fff",
      boxShadow: "0 3px 8px rgba(0,0,0,0.15), 0 1px 1px rgba(0,0,0,0.16)",
      transition: "left .22s cubic-bezier(.4,.0,.2,1)"
    }
  }));
}
Object.assign(__ds_scope, { Switch });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/controls/Switch.jsx", error: String((e && e.message) || e) }); }

// components/data/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* iOS / iPadOS 26 — Card
   A rounded content container on the grouped-secondary surface with a soft
   ambient shadow. Used for widgets, summaries and grouped content blocks. */

function Card({
  children,
  padding = 16,
  radius = 18,
  elevated = true,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      background: "var(--backgrounds-grouped-secondary)",
      borderRadius: radius,
      padding,
      boxShadow: elevated ? "0 1px 2px rgba(0,0,0,0.04), 0 4px 14px rgba(0,0,0,0.06)" : "none",
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/Card.jsx", error: String((e && e.message) || e) }); }

// components/data/Widget.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* iOS / iPadOS 26 — Widget
   Home-screen widget tile. Fixed square/rectangular sizes (small/medium/large)
   with the standard 22px continuous corner radius and ambient shadow. */

const SIZES = {
  small: {
    w: 158,
    h: 158
  },
  medium: {
    w: 338,
    h: 158
  },
  large: {
    w: 338,
    h: 338
  }
};
function Widget({
  size = "small",
  children,
  background = "var(--backgrounds-grouped-secondary)",
  padding = 16,
  style,
  ...rest
}) {
  const dim = SIZES[size] || SIZES.small;
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      width: dim.w,
      height: dim.h,
      borderRadius: 22,
      padding,
      background,
      boxShadow: "0 2px 6px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.10)",
      overflow: "hidden",
      boxSizing: "border-box",
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Widget });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/Widget.jsx", error: String((e && e.message) || e) }); }

// components/feedback/ActivityIndicator.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* iOS / iPadOS 26 — ActivityIndicator
   The classic spinner: 12 tapering spokes fading around the circle. */

function ActivityIndicator({
  size = 20,
  color = "var(--labels-secondary)",
  style,
  ...rest
}) {
  const spokes = 12;
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: "inline-block",
      width: size,
      height: size,
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    style: {
      animation: "ios-spin 1s steps(12) infinite"
    }
  }, Array.from({
    length: spokes
  }).map((_, i) => /*#__PURE__*/React.createElement("rect", {
    key: i,
    x: "11",
    y: "2",
    width: "2",
    height: "6",
    rx: "1",
    fill: color,
    opacity: (i + 1) / spokes,
    transform: `rotate(${i * (360 / spokes)} 12 12)`
  }))), /*#__PURE__*/React.createElement("style", null, "@keyframes ios-spin{to{transform:rotate(360deg)}}"));
}
Object.assign(__ds_scope, { ActivityIndicator });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/ActivityIndicator.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Avatar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* iOS / iPadOS 26 — Avatar
   Circular contact image or monogram on a gray fill. */

function Avatar({
  src,
  initials,
  size = 40,
  color = "var(--grays-gray)",
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: size,
      height: size,
      borderRadius: "50%",
      overflow: "hidden",
      flex: "none",
      background: src ? "transparent" : color,
      color: "#fff",
      font: `600 ${Math.round(size * 0.4)}px/1 var(--font-system)`,
      ...style
    }
  }, rest), src ? /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: "",
    style: {
      width: "100%",
      height: "100%",
      objectFit: "cover"
    }
  }) : initials);
}
Object.assign(__ds_scope, { Avatar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Avatar.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* iOS / iPadOS 26 — Badge
   Red notification count pill, or a small colored status dot. */

function Badge({
  count,
  dot = false,
  color = "var(--accents-red)",
  max = 99,
  style,
  ...rest
}) {
  if (dot) {
    return /*#__PURE__*/React.createElement("span", _extends({
      style: {
        display: "inline-block",
        width: 10,
        height: 10,
        borderRadius: "50%",
        background: color,
        ...style
      }
    }, rest));
  }
  const text = typeof count === "number" && count > max ? `${max}+` : count;
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      minWidth: 20,
      height: 20,
      padding: "0 6px",
      borderRadius: 999,
      background: color,
      color: "#fff",
      font: "600 13px/1 var(--font-system)",
      ...style
    }
  }, rest), text);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Badge.jsx", error: String((e && e.message) || e) }); }

// components/feedback/PageControl.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* iOS / iPadOS 26 — PageControl
   Row of dots indicating page position; the current page dot is opaque. */

function PageControl({
  count = 3,
  index = 0,
  tint = "var(--labels-primary)",
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: "flex",
      gap: 7,
      alignItems: "center",
      ...style
    }
  }, rest), Array.from({
    length: count
  }).map((_, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      width: 7,
      height: 7,
      borderRadius: "50%",
      background: tint,
      opacity: i === index ? 1 : 0.3,
      transition: "opacity .2s ease"
    }
  })));
}
Object.assign(__ds_scope, { PageControl });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/PageControl.jsx", error: String((e && e.message) || e) }); }

// components/feedback/ProgressBar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* iOS / iPadOS 26 — ProgressBar
   Thin track with a tinted fill. value 0–1. */

function ProgressBar({
  value = 0.5,
  tint = "var(--tint)",
  track = "var(--fills-secondary)",
  style,
  ...rest
}) {
  const pct = Math.min(1, Math.max(0, value)) * 100;
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      height: 4,
      borderRadius: 2,
      background: track,
      overflow: "hidden",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      width: pct + "%",
      height: "100%",
      borderRadius: 2,
      background: tint,
      transition: "width .3s ease"
    }
  }));
}
Object.assign(__ds_scope, { ProgressBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/ProgressBar.jsx", error: String((e && e.message) || e) }); }

// components/icon/Icon.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* iOS / iPadOS 26 — Icon
   A curated set of common SF Symbols–style glyphs drawn as stroked/filled
   vectors in Apple's geometric style. SF Symbols is Apple's proprietary,
   licensed symbol set and cannot be redistributed here, so these are
   near-match recreations of the most-used glyphs. Swap in real SF Symbols
   (or an exported SVG) for production. Glyphs inherit `currentColor`. */

const P = (d, opts = {}) => ({
  d,
  ...opts
}); // path + per-glyph options

// Each glyph: array of { d, fill?, stroke?, sw? } drawn in a 0 0 24 24 box.
const GLYPHS = {
  // navigation / chevrons
  "chevron.right": [P("M9 6l6 6-6 6", {
    stroke: true,
    sw: 2
  })],
  "chevron.left": [P("M15 6l-6 6 6 6", {
    stroke: true,
    sw: 2
  })],
  "chevron.down": [P("M6 9l6 6 6-6", {
    stroke: true,
    sw: 2
  })],
  "chevron.up": [P("M6 15l6-6 6 6", {
    stroke: true,
    sw: 2
  })],
  "chevron.right.small": [P("M10 7l5 5-5 5", {
    stroke: true,
    sw: 1.8
  })],
  "arrow.left": [P("M11 5l-7 7 7 7M4 12h16", {
    stroke: true,
    sw: 2
  })],
  "arrow.up": [P("M5 11l7-7 7 7M12 4v16", {
    stroke: true,
    sw: 2
  })],
  // actions
  plus: [P("M12 5v14M5 12h14", {
    stroke: true,
    sw: 2
  })],
  minus: [P("M5 12h14", {
    stroke: true,
    sw: 2
  })],
  xmark: [P("M6 6l12 12M18 6L6 18", {
    stroke: true,
    sw: 2
  })],
  checkmark: [P("M5 13l4 4 10-11", {
    stroke: true,
    sw: 2.2
  })],
  ellipsis: [P("M5 12h.01M12 12h.01M19 12h.01", {
    stroke: true,
    sw: 3,
    cap: "round"
  })],
  magnifyingglass: [P("M11 4a7 7 0 105.2 11.7L21 21", {
    stroke: true,
    sw: 2
  })],
  trash: [P("M5 7h14M9 7V5h6v2M7 7l1 13h8l1-13", {
    stroke: true,
    sw: 1.8
  })],
  pencil: [P("M4 20l1-4L16 5l3 3L8 19l-4 1z", {
    stroke: true,
    sw: 1.8
  })],
  "square.and.arrow.up": [P("M12 3l4 4M12 3L8 7M12 3v12", {
    stroke: true,
    sw: 1.8
  }), P("M6 11H5v9h14v-9h-1", {
    stroke: true,
    sw: 1.8
  })],
  "plus.circle.fill": [P("M12 2a10 10 0 110 20 10 10 0 010-20z", {
    fill: true
  }), P("M12 7v10M7 12h10", {
    stroke: true,
    sw: 2,
    strokeColor: "#fff"
  })],
  "xmark.circle.fill": [P("M12 2a10 10 0 110 20 10 10 0 010-20z", {
    fill: true
  }), P("M8.5 8.5l7 7M15.5 8.5l-7 7", {
    stroke: true,
    sw: 1.8,
    strokeColor: "#fff"
  })],
  "checkmark.circle.fill": [P("M12 2a10 10 0 110 20 10 10 0 010-20z", {
    fill: true
  }), P("M7.5 12.5l3 3 6-6.5", {
    stroke: true,
    sw: 1.8,
    strokeColor: "#fff"
  })],
  "info.circle": [P("M12 3a9 9 0 110 18 9 9 0 010-18z", {
    stroke: true,
    sw: 1.7
  }), P("M12 11v6", {
    stroke: true,
    sw: 1.8
  }), P("M12 7.6h.01", {
    stroke: true,
    sw: 2
  })],
  // symbols
  star: [P("M12 3l2.6 5.6 6 .7-4.5 4 1.3 6L12 16l-5.4 3.3 1.3-6-4.5-4 6-.7z", {
    stroke: true,
    sw: 1.6
  })],
  "star.fill": [P("M12 3l2.6 5.6 6 .7-4.5 4 1.3 6L12 16l-5.4 3.3 1.3-6-4.5-4 6-.7z", {
    fill: true
  })],
  heart: [P("M12 20s-7-4.6-7-9.3A3.7 3.7 0 0112 8a3.7 3.7 0 017 2.7C19 15.4 12 20 12 20z", {
    stroke: true,
    sw: 1.6
  })],
  "heart.fill": [P("M12 20s-7-4.6-7-9.3A3.7 3.7 0 0112 8a3.7 3.7 0 017 2.7C19 15.4 12 20 12 20z", {
    fill: true
  })],
  bell: [P("M6 16l-1 2h14l-1-2V11a6 6 0 10-12 0v5z", {
    stroke: true,
    sw: 1.6
  }), P("M10 20a2 2 0 004 0", {
    stroke: true,
    sw: 1.6
  })],
  gear: [P("M12 9.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5z", {
    stroke: true,
    sw: 1.6
  }), P("M12 3l1 2.2 2.4-.6.6 2.4 2.2 1-1 2.2 1 2.2-2.2 1-.6 2.4-2.4-.6L12 21l-1-2.2-2.4.6-.6-2.4-2.2-1 1-2.2-1-2.2 2.2-1 .6-2.4 2.4.6z", {
    stroke: true,
    sw: 1.4
  })],
  "person.fill": [P("M12 4a3.6 3.6 0 110 7.2A3.6 3.6 0 0112 4z", {
    fill: true
  }), P("M4.5 20c0-4.2 3.4-6.5 7.5-6.5s7.5 2.3 7.5 6.5z", {
    fill: true
  })],
  "person.crop.circle": [P("M12 3a9 9 0 110 18 9 9 0 010-18z", {
    stroke: true,
    sw: 1.6
  }), P("M12 8.5a2.6 2.6 0 110 5.2 2.6 2.6 0 010-5.2z", {
    fill: true
  }), P("M6.5 18.5c1-2.4 3-3.4 5.5-3.4s4.5 1 5.5 3.4", {
    stroke: true,
    sw: 1.6
  })],
  house: [P("M4 11l8-6 8 6", {
    stroke: true,
    sw: 1.7
  }), P("M6 10v9h12v-9", {
    stroke: true,
    sw: 1.7
  })],
  "house.fill": [P("M3 11.5L12 4l9 7.5V20a1 1 0 01-1 1h-4v-6h-8v6H4a1 1 0 01-1-1z", {
    fill: true
  })],
  paperplane: [P("M21 4L3 11l7 2 2 7z", {
    stroke: true,
    sw: 1.6
  })],
  bookmark: [P("M7 4h10v16l-5-4-5 4z", {
    stroke: true,
    sw: 1.6
  })],
  bolt: [P("M13 3L5 14h5l-1 7 8-11h-5z", {
    stroke: true,
    sw: 1.5
  })],
  "bolt.fill": [P("M13 3L5 14h5l-1 7 8-11h-5z", {
    fill: true
  })],
  camera: [P("M4 8h3l1.5-2h7L17 8h3v11H4z", {
    stroke: true,
    sw: 1.6
  }), P("M12 10.5a3 3 0 100 6 3 3 0 000-6z", {
    stroke: true,
    sw: 1.6
  })],
  photo: [P("M4 5h16v14H4z", {
    stroke: true,
    sw: 1.6
  }), P("M4 16l4-4 3 3 4-5 5 6", {
    stroke: true,
    sw: 1.6
  }), P("M9 9a1.4 1.4 0 100 2.8A1.4 1.4 0 009 9z", {
    fill: true
  })],
  clock: [P("M12 3a9 9 0 110 18 9 9 0 010-18z", {
    stroke: true,
    sw: 1.6
  }), P("M12 7v5l3.5 2", {
    stroke: true,
    sw: 1.6
  })],
  calendar: [P("M4 6h16v15H4z", {
    stroke: true,
    sw: 1.6
  }), P("M4 10h16M8 4v4M16 4v4", {
    stroke: true,
    sw: 1.6
  })],
  envelope: [P("M3 6h18v12H3z", {
    stroke: true,
    sw: 1.6
  }), P("M3 7l9 6 9-6", {
    stroke: true,
    sw: 1.6
  })],
  phone: [P("M6 3c1 0 2 4 2 5s-2 1-2 2 3 5 4 5 1-2 2-2 5 1 5 2-1 4-3 4C9 21 3 15 3 8c0-2 1-5 3-5z", {
    fill: true
  })],
  message: [P("M4 5h16v11H9l-4 4v-4H4z", {
    stroke: true,
    sw: 1.6
  })],
  "slider.horizontal.3": [P("M4 8h10M18 8h2M4 16h2M10 16h10", {
    stroke: true,
    sw: 1.8
  }), P("M16 8a2 2 0 11-4 0 2 2 0 014 0zM10 16a2 2 0 11-4 0 2 2 0 014 0z", {
    fill: true
  })],
  "arrow.clockwise": [P("M19 5v4h-4M19 9a7 7 0 10.5 5", {
    stroke: true,
    sw: 1.8
  })],
  "line.3.horizontal": [P("M4 7h16M4 12h16M4 17h16", {
    stroke: true,
    sw: 1.8
  })],
  "square.grid.2x2": [P("M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", {
    stroke: true,
    sw: 1.5
  })],
  play: [P("M7 4l13 8-13 8z", {
    fill: true
  })],
  pause: [P("M7 4h4v16H7zM13 4h4v16h-4z", {
    fill: true
  })],
  mic: [P("M12 3a3 3 0 013 3v6a3 3 0 01-6 0V6a3 3 0 013-3z", {
    stroke: true,
    sw: 1.6
  }), P("M5 11a7 7 0 0014 0M12 18v3", {
    stroke: true,
    sw: 1.6
  })],
  lock: [P("M6 11h12v9H6z", {
    stroke: true,
    sw: 1.6
  }), P("M8 11V8a4 4 0 018 0v3", {
    stroke: true,
    sw: 1.6
  })],
  wifi: [P("M12 18a1.4 1.4 0 100 2.8A1.4 1.4 0 0012 18z", {
    fill: true
  }), P("M7.5 13.5a6 6 0 019 0M4.5 10a10 10 0 0115 0", {
    stroke: true,
    sw: 1.7
  })]
};
function Icon({
  name,
  size = 22,
  weight = "regular",
  color,
  style,
  className,
  ...rest
}) {
  const paths = GLYPHS[name];
  const swScale = weight === "bold" ? 1.3 : weight === "semibold" ? 1.15 : weight === "light" ? 0.8 : 1;
  return /*#__PURE__*/React.createElement("svg", _extends({
    viewBox: "0 0 24 24",
    width: size,
    height: size,
    className: className,
    style: {
      display: "inline-block",
      flex: "none",
      color,
      verticalAlign: "middle",
      ...style
    },
    "aria-hidden": rest["aria-label"] ? undefined : true
  }, rest), paths ? paths.map((p, i) => /*#__PURE__*/React.createElement("path", {
    key: i,
    d: p.d,
    fill: p.fill ? "currentColor" : "none",
    stroke: p.stroke ? p.strokeColor || "currentColor" : "none",
    strokeWidth: p.stroke ? (p.sw || 1.6) * swScale : undefined,
    strokeLinecap: p.cap || "round",
    strokeLinejoin: "round"
  })) : null);
}
const ICON_NAMES = Object.keys(GLYPHS);
Object.assign(__ds_scope, { Icon, ICON_NAMES });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/icon/Icon.jsx", error: String((e && e.message) || e) }); }

// components/buttons/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* iOS / iPadOS 26 — Button
   Capsule control with iOS button styles: filled (prominent), tinted, gray,
   plain, and bordered. Optional leading SF Symbol. Sizes mini→large. */

const HEIGHTS = {
  mini: 28,
  small: 34,
  medium: 40,
  large: 50
};
const FONTS = {
  mini: 15,
  small: 15,
  medium: 17,
  large: 17
};
const PADS = {
  mini: 12,
  small: 14,
  medium: 18,
  large: 22
};
function Button({
  children,
  variant = "filled",
  size = "medium",
  tint = "var(--tint)",
  icon,
  iconTrailing,
  disabled = false,
  block = false,
  destructive = false,
  style,
  ...rest
}) {
  const accent = destructive ? "var(--accents-red)" : tint;
  const h = HEIGHTS[size];
  const base = {
    display: block ? "flex" : "inline-flex",
    width: block ? "100%" : undefined,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: h,
    padding: `0 ${PADS[size]}px`,
    borderRadius: 999,
    border: "none",
    font: `600 ${FONTS[size]}px/1 var(--font-system)`,
    letterSpacing: "-0.2px",
    cursor: disabled ? "default" : "pointer",
    opacity: disabled ? 0.4 : 1,
    transition: "filter .12s ease, transform .06s ease, background .12s ease",
    WebkitTapHighlightColor: "transparent",
    userSelect: "none",
    whiteSpace: "nowrap"
  };
  const variants = {
    filled: {
      background: accent,
      color: "#fff"
    },
    tinted: {
      background: "color-mix(in srgb, " + accent + " 15%, transparent)",
      color: accent
    },
    gray: {
      background: "var(--fills-tertiary)",
      color: accent
    },
    bordered: {
      background: "transparent",
      color: accent,
      boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${accent} 45%, transparent)`
    },
    plain: {
      background: "transparent",
      color: accent,
      padding: `0 ${Math.round(PADS[size] / 2)}px`
    }
  };
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    disabled: disabled,
    style: {
      ...base,
      ...variants[variant],
      ...style
    },
    onPointerDown: e => {
      if (!disabled) e.currentTarget.style.filter = "brightness(0.92)";
    },
    onPointerUp: e => {
      e.currentTarget.style.filter = "";
    },
    onPointerLeave: e => {
      e.currentTarget.style.filter = "";
    }
  }, rest), icon && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: FONTS[size] + 2,
    weight: "semibold"
  }), children, iconTrailing && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: iconTrailing,
    size: FONTS[size] + 2,
    weight: "semibold"
  }));
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/buttons/Button.jsx", error: String((e && e.message) || e) }); }

// components/buttons/IconButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* iOS / iPadOS 26 — IconButton
   A symbol-only tappable control. Used in toolbars, nav bars and Liquid Glass
   button clusters. Plain (bare glyph), glass (frosted capsule/circle), or
   filled (prominent circle). */

const SIZES = {
  small: 30,
  medium: 38,
  large: 44
};
function IconButton({
  icon,
  variant = "plain",
  size = "medium",
  tint = "var(--tint)",
  shape = "circle",
  disabled = false,
  style,
  ...rest
}) {
  const d = SIZES[size];
  const radius = shape === "circle" ? "50%" : 10;
  const variants = {
    plain: {
      background: "transparent",
      color: tint
    },
    glass: {
      background: "var(--fills-tertiary)",
      color: tint,
      backdropFilter: "blur(12px) saturate(1.5)",
      WebkitBackdropFilter: "blur(12px) saturate(1.5)"
    },
    filled: {
      background: tint,
      color: "#fff"
    }
  };
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    disabled: disabled,
    style: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: d,
      height: d,
      borderRadius: radius,
      border: "none",
      cursor: disabled ? "default" : "pointer",
      opacity: disabled ? 0.35 : 1,
      transition: "filter .12s ease, background .12s ease",
      WebkitTapHighlightColor: "transparent",
      ...variants[variant],
      ...style
    },
    onPointerDown: e => {
      if (!disabled) e.currentTarget.style.filter = "brightness(0.9)";
    },
    onPointerUp: e => {
      e.currentTarget.style.filter = "";
    },
    onPointerLeave: e => {
      e.currentTarget.style.filter = "";
    }
  }, rest), /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: Math.round(d * 0.55),
    weight: "regular"
  }));
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/buttons/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/controls/Stepper.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* iOS / iPadOS 26 — Stepper
   Segmented −/+ control on a tertiary fill, hairline divider between halves. */

function Stepper({
  value = 0,
  min = -Infinity,
  max = Infinity,
  step = 1,
  onChange,
  disabled = false,
  style,
  ...rest
}) {
  const [val, setVal] = React.useState(value);
  React.useEffect(() => setVal(value), [value]);
  const change = dir => {
    if (disabled) return;
    const next = Math.min(max, Math.max(min, val + dir * step));
    setVal(next);
    onChange && onChange(next);
  };
  const half = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 47,
    height: 32,
    border: "none",
    background: "transparent",
    color: "var(--labels-primary)",
    cursor: disabled ? "default" : "pointer",
    WebkitTapHighlightColor: "transparent"
  };
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: "inline-flex",
      height: 32,
      borderRadius: 9,
      background: "var(--fills-tertiary)",
      opacity: disabled ? 0.5 : 1,
      overflow: "hidden",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("button", {
    type: "button",
    style: half,
    onClick: () => change(-1),
    "aria-label": "Decrement"
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "minus",
    size: 18,
    weight: "semibold"
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 1,
      alignSelf: "center",
      height: 18,
      background: "var(--separators-non-opaque)"
    }
  }), /*#__PURE__*/React.createElement("button", {
    type: "button",
    style: half,
    onClick: () => change(1),
    "aria-label": "Increment"
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "plus",
    size: 18,
    weight: "semibold"
  })));
}
Object.assign(__ds_scope, { Stepper });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/controls/Stepper.jsx", error: String((e && e.message) || e) }); }

// components/forms/SearchField.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* iOS / iPadOS 26 — SearchField
   The standard rounded search bar: tertiary fill, leading magnifyingglass,
   centered placeholder until focus, clear button when filled. */

function SearchField({
  value,
  defaultValue,
  placeholder = "Search",
  onChange,
  style,
  ...rest
}) {
  const [val, setVal] = React.useState(defaultValue ?? value ?? "");
  const [focused, setFocused] = React.useState(false);
  React.useEffect(() => {
    if (value !== undefined) setVal(value);
  }, [value]);
  const active = focused || val;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 6,
      height: 36,
      padding: "0 8px",
      borderRadius: 10,
      background: "var(--fills-tertiary)",
      justifyContent: active ? "flex-start" : "center",
      ...style
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "magnifyingglass",
    size: 17,
    color: "var(--labels-secondary)",
    weight: "semibold"
  }), /*#__PURE__*/React.createElement("input", _extends({
    value: val,
    placeholder: placeholder,
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
    onChange: e => {
      setVal(e.target.value);
      onChange && onChange(e.target.value);
    },
    style: {
      flex: active ? 1 : "none",
      minWidth: 0,
      width: active ? undefined : "auto",
      border: "none",
      outline: "none",
      background: "transparent",
      font: "400 17px/1 var(--font-system)",
      color: "var(--labels-primary)"
    }
  }, rest)), val && /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => {
      setVal("");
      onChange && onChange("");
    },
    "aria-label": "Clear",
    style: {
      border: "none",
      background: "transparent",
      padding: 0,
      cursor: "pointer",
      color: "var(--labels-tertiary)",
      display: "flex"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "xmark.circle.fill",
    size: 17
  })));
}
Object.assign(__ds_scope, { SearchField });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/SearchField.jsx", error: String((e && e.message) || e) }); }

// components/forms/TextField.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* iOS / iPadOS 26 — TextField
   Rounded filled or bordered text input. Optional leading symbol & clear. */

function TextField({
  value,
  defaultValue,
  placeholder = "",
  variant = "filled",
  icon,
  clearable = false,
  disabled = false,
  type = "text",
  onChange,
  style,
  ...rest
}) {
  const [val, setVal] = React.useState(defaultValue ?? value ?? "");
  React.useEffect(() => {
    if (value !== undefined) setVal(value);
  }, [value]);
  const wrap = {
    display: "flex",
    alignItems: "center",
    gap: 7,
    height: 44,
    padding: "0 12px",
    borderRadius: 12,
    background: variant === "filled" ? "var(--fills-tertiary)" : "var(--backgrounds-primary)",
    boxShadow: variant === "bordered" ? "inset 0 0 0 1px var(--separators-opaque)" : "none",
    opacity: disabled ? 0.5 : 1,
    ...style
  };
  return /*#__PURE__*/React.createElement("div", {
    style: wrap
  }, icon && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 18,
    color: "var(--labels-secondary)"
  }), /*#__PURE__*/React.createElement("input", _extends({
    type: type,
    value: val,
    placeholder: placeholder,
    disabled: disabled,
    onChange: e => {
      setVal(e.target.value);
      onChange && onChange(e.target.value);
    },
    style: {
      flex: 1,
      minWidth: 0,
      border: "none",
      outline: "none",
      background: "transparent",
      font: "400 17px/1 var(--font-system)",
      color: "var(--labels-primary)"
    }
  }, rest)), clearable && val && /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => {
      setVal("");
      onChange && onChange("");
    },
    "aria-label": "Clear",
    style: {
      border: "none",
      background: "transparent",
      padding: 0,
      cursor: "pointer",
      color: "var(--labels-tertiary)",
      display: "flex"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "xmark.circle.fill",
    size: 18
  })));
}
Object.assign(__ds_scope, { TextField });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/TextField.jsx", error: String((e && e.message) || e) }); }

// components/lists/List.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* iOS / iPadOS 26 — List (inset grouped)
   A grouped table section: optional uppercase header and footer, with a
   rounded card containing the rows. Automatically flags the last child row
   so it hides its separator. */

function List({
  header,
  footer,
  children,
  inset = true,
  style,
  ...rest
}) {
  const items = React.Children.toArray(children);
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      padding: inset ? "0 16px" : 0,
      ...style
    }
  }, rest), header && /*#__PURE__*/React.createElement("div", {
    style: {
      font: "400 13px/16px var(--font-system)",
      color: "var(--labels-secondary)",
      textTransform: "uppercase",
      letterSpacing: "-0.05px",
      padding: "0 16px 7px",
      margin: inset ? 0 : "0"
    }
  }, header), /*#__PURE__*/React.createElement("div", {
    style: {
      borderRadius: inset ? 12 : 0,
      overflow: "hidden",
      background: "var(--backgrounds-grouped-secondary)"
    }
  }, items.map((child, i) => React.isValidElement(child) ? React.cloneElement(child, {
    last: i === items.length - 1
  }) : child)), footer && /*#__PURE__*/React.createElement("div", {
    style: {
      font: "400 13px/18px var(--font-system)",
      color: "var(--labels-secondary)",
      padding: "7px 16px 0"
    }
  }, footer));
}
Object.assign(__ds_scope, { List });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/lists/List.jsx", error: String((e && e.message) || e) }); }

// components/lists/ListRow.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* iOS / iPadOS 26 — ListRow
   A single inset-grouped table row. Optional leading icon (in a rounded
   colored tile or bare), title + optional subtitle, and a trailing accessory:
   chevron disclosure, detail value text, switch, checkmark, or custom node.
   Rows draw their own leading-inset hairline separator (hidden on last row). */

function ListRow({
  title,
  subtitle,
  icon,
  iconColor = "var(--tint)",
  iconTile = true,
  value,
  accessory,
  // "chevron" | "checkmark" | "switch" | React node
  selected = false,
  last = false,
  onClick,
  trailing,
  style,
  ...rest
}) {
  const interactive = !!onClick || accessory === "chevron";
  return /*#__PURE__*/React.createElement("div", _extends({
    onClick: onClick,
    style: {
      position: "relative",
      display: "flex",
      alignItems: "center",
      gap: 12,
      minHeight: 44,
      padding: "11px 16px",
      background: "transparent",
      cursor: interactive ? "pointer" : "default",
      WebkitTapHighlightColor: "transparent",
      ...style
    }
  }, rest), icon && (iconTile ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: 29,
      height: 29,
      borderRadius: 7,
      background: iconColor,
      flex: "none"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 18,
    color: "#fff",
    weight: "semibold"
  })) : /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 22,
    color: iconColor
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0,
      display: "flex",
      flexDirection: "column",
      gap: 1
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: "400 17px/22px var(--font-system)",
      color: "var(--labels-primary)",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap"
    }
  }, title), subtitle && /*#__PURE__*/React.createElement("span", {
    style: {
      font: "400 15px/20px var(--font-system)",
      color: "var(--labels-secondary)"
    }
  }, subtitle)), value != null && /*#__PURE__*/React.createElement("span", {
    style: {
      font: "400 17px/22px var(--font-system)",
      color: "var(--labels-secondary)"
    }
  }, value), trailing, accessory === "chevron" && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "chevron.right.small",
    size: 18,
    color: "var(--labels-tertiary)",
    weight: "semibold"
  }), accessory === "checkmark" && selected && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "checkmark",
    size: 18,
    color: "var(--tint)",
    weight: "semibold"
  }), accessory && accessory !== "chevron" && accessory !== "checkmark" && accessory !== "switch" && accessory, !last && /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      left: icon ? 57 : 16,
      right: 0,
      bottom: 0,
      height: "0.5px",
      background: "var(--separators-non-opaque)"
    }
  }));
}
Object.assign(__ds_scope, { ListRow });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/lists/ListRow.jsx", error: String((e && e.message) || e) }); }

// components/navigation/NavigationBar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* iOS / iPadOS 26 — NavigationBar
   Top bar over a translucent material. Supports large-title and inline modes,
   a back button, and leading/trailing accessory clusters. */

function NavigationBar({
  title,
  largeTitle = false,
  back,
  // string label or true
  onBack,
  leading,
  trailing,
  translucent = true,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      background: translucent ? "rgba(249,249,249,0.82)" : "var(--backgrounds-primary)",
      backdropFilter: translucent ? "blur(18px) saturate(1.6)" : undefined,
      WebkitBackdropFilter: translucent ? "blur(18px) saturate(1.6)" : undefined,
      borderBottom: "0.5px solid var(--separators-non-opaque)",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: 44,
      padding: "0 8px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 8,
      display: "flex",
      alignItems: "center",
      gap: 4
    }
  }, back != null && /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onBack,
    style: {
      display: "flex",
      alignItems: "center",
      gap: 1,
      border: "none",
      background: "transparent",
      color: "var(--tint)",
      font: "400 17px/1 var(--font-system)",
      cursor: "pointer",
      padding: 0
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "chevron.left",
    size: 22,
    weight: "semibold"
  }), typeof back === "string" && /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: -2
    }
  }, back)), leading), !largeTitle && /*#__PURE__*/React.createElement("span", {
    style: {
      font: "600 17px/1 var(--font-system)",
      color: "var(--labels-primary)"
    }
  }, title), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      right: 8,
      display: "flex",
      alignItems: "center",
      gap: 14,
      color: "var(--tint)"
    }
  }, trailing)), largeTitle && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "0 16px 8px"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: "700 34px/41px var(--font-system)",
      letterSpacing: "-0.8px",
      color: "var(--labels-primary)"
    }
  }, title)));
}
Object.assign(__ds_scope, { NavigationBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/NavigationBar.jsx", error: String((e && e.message) || e) }); }

// components/navigation/StatusBar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* iOS / iPadOS 26 — StatusBar (iPhone)
   The 54px top status region: time on the left; cellular, wifi and battery
   glyphs on the right. Pure presentation. Dark prop flips glyph color. */

function StatusBar({
  time = "9:41",
  dark = false,
  battery = 100,
  style,
  ...rest
}) {
  const fg = dark ? "#fff" : "#000";
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      height: 54,
      padding: "0 22px 0 30px",
      color: fg,
      font: "600 17px/1 var(--font-system)",
      letterSpacing: "-0.2px",
      userSelect: "none",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    style: {
      minWidth: 54,
      fontVariantNumeric: "tabular-nums"
    }
  }, time), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 7
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "18",
    height: "12",
    viewBox: "0 0 18 12",
    "aria-hidden": "true"
  }, [0, 1, 2, 3].map(i => /*#__PURE__*/React.createElement("rect", {
    key: i,
    x: i * 4.6,
    y: 8 - i * 2.4,
    width: "3",
    height: 4 + i * 2.4,
    rx: "0.8",
    fill: fg
  }))), /*#__PURE__*/React.createElement("svg", {
    width: "17",
    height: "12",
    viewBox: "0 0 17 12",
    fill: "none",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M8.5 9.6a1.3 1.3 0 100 2.6 1.3 1.3 0 000-2.6z",
    fill: fg
  }), /*#__PURE__*/React.createElement("path", {
    d: "M4.6 6.2a5.6 5.6 0 017.8 0M1.8 3.2a9.6 9.6 0 0113.4 0",
    stroke: fg,
    strokeWidth: "1.6",
    strokeLinecap: "round"
  })), /*#__PURE__*/React.createElement("svg", {
    width: "28",
    height: "13",
    viewBox: "0 0 28 13",
    fill: "none",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "0.5",
    y: "0.5",
    width: "23",
    height: "12",
    rx: "3.2",
    stroke: fg,
    strokeOpacity: "0.4"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "2",
    y: "2",
    width: Math.max(2, battery / 100 * 20),
    height: "9",
    rx: "1.8",
    fill: fg
  }), /*#__PURE__*/React.createElement("path", {
    d: "M25 4.2v4.6c1.1-.2 1.5-1 1.5-2.3s-.4-2.1-1.5-2.3z",
    fill: fg,
    fillOpacity: "0.5"
  }))));
}
Object.assign(__ds_scope, { StatusBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/StatusBar.jsx", error: String((e && e.message) || e) }); }

// components/navigation/TabBar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* iOS / iPadOS 26 — TabBar
   Bottom tab bar over a translucent material. Each tab: SF Symbol + label,
   selected tab uses the system tint. Filled glyph variant when selected. */

function TabBar({
  tabs = [],
  value,
  defaultValue,
  onChange,
  translucent = true,
  style,
  ...rest
}) {
  const initial = value ?? defaultValue ?? (tabs[0] && tabs[0].value);
  const [sel, setSel] = React.useState(initial);
  React.useEffect(() => {
    if (value !== undefined) setSel(value);
  }, [value]);
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-around",
      paddingTop: 8,
      height: 83,
      background: translucent ? "rgba(249,249,249,0.9)" : "var(--backgrounds-primary)",
      backdropFilter: translucent ? "blur(18px) saturate(1.6)" : undefined,
      WebkitBackdropFilter: translucent ? "blur(18px) saturate(1.6)" : undefined,
      borderTop: "0.5px solid var(--separators-non-opaque)",
      ...style
    }
  }, rest), tabs.map(t => {
    const active = t.value === sel;
    const glyph = active && t.iconSelected ? t.iconSelected : t.icon;
    return /*#__PURE__*/React.createElement("button", {
      key: t.value,
      type: "button",
      onClick: () => {
        setSel(t.value);
        onChange && onChange(t.value);
      },
      style: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 3,
        border: "none",
        background: "transparent",
        cursor: "pointer",
        padding: "0 6px",
        color: active ? "var(--tint)" : "var(--miscellaneous-tab-unselected)",
        WebkitTapHighlightColor: "transparent"
      }
    }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: glyph,
      size: 26,
      weight: active ? "semibold" : "regular"
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        font: "500 10px/1 var(--font-system)"
      }
    }, t.label));
  }));
}
Object.assign(__ds_scope, { TabBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/TabBar.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Toolbar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* iOS / iPadOS 26 — Toolbar
   A bottom (or top) bar of actions over a translucent material. Children are
   typically IconButtons / Buttons, distributed with flexible gaps. */

function Toolbar({
  children,
  position = "bottom",
  translucent = true,
  justify = "space-between",
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: justify,
      gap: 8,
      height: 49,
      padding: "0 16px",
      background: translucent ? "rgba(249,249,249,0.82)" : "var(--backgrounds-primary)",
      backdropFilter: translucent ? "blur(18px) saturate(1.6)" : undefined,
      WebkitBackdropFilter: translucent ? "blur(18px) saturate(1.6)" : undefined,
      borderTop: position === "bottom" ? "0.5px solid var(--separators-non-opaque)" : "none",
      borderBottom: position === "top" ? "0.5px solid var(--separators-non-opaque)" : "none",
      color: "var(--tint)",
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Toolbar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Toolbar.jsx", error: String((e && e.message) || e) }); }

// components/overlays/ActionSheet.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* iOS / iPadOS 26 — ActionSheet
   Bottom-anchored set of actions in a grouped material card, plus a separate
   Cancel button below. Optional title/message header. */

function ActionSheet({
  title,
  message,
  actions = [],
  cancelLabel = "Cancel",
  onAction,
  onCancel,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      position: "absolute",
      inset: 0,
      display: "flex",
      flexDirection: "column",
      justifyContent: "flex-end",
      padding: 8,
      background: "var(--overlays-default)",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      borderRadius: 14,
      overflow: "hidden",
      marginBottom: 8,
      background: "rgba(248,248,248,0.7)",
      backdropFilter: "blur(20px) saturate(1.8)",
      WebkitBackdropFilter: "blur(20px) saturate(1.8)"
    }
  }, (title || message) && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "16px 16px 14px",
      textAlign: "center",
      borderBottom: "0.5px solid var(--separators-non-opaque)"
    }
  }, title && /*#__PURE__*/React.createElement("div", {
    style: {
      font: "600 13px/18px var(--font-system)",
      color: "var(--labels-secondary)"
    }
  }, title), message && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 2,
      font: "400 13px/18px var(--font-system)",
      color: "var(--labels-secondary)"
    }
  }, message)), actions.map((a, i) => /*#__PURE__*/React.createElement("button", {
    key: i,
    type: "button",
    onClick: () => onAction && onAction(a.value ?? a.label),
    style: {
      display: "block",
      width: "100%",
      height: 57,
      border: "none",
      borderTop: i > 0 ? "0.5px solid var(--separators-non-opaque)" : "none",
      background: "transparent",
      cursor: "pointer",
      color: a.destructive ? "var(--accents-red)" : "var(--tint)",
      font: "400 20px/1 var(--font-system)",
      WebkitTapHighlightColor: "transparent"
    }
  }, a.label))), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onCancel,
    style: {
      height: 57,
      borderRadius: 14,
      border: "none",
      background: "rgba(255,255,255,0.92)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      cursor: "pointer",
      color: "var(--tint)",
      font: "600 20px/1 var(--font-system)"
    }
  }, cancelLabel));
}
Object.assign(__ds_scope, { ActionSheet });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/overlays/ActionSheet.jsx", error: String((e && e.message) || e) }); }

// components/overlays/Alert.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* iOS / iPadOS 26 — Alert
   Centered modal alert over a dimmed scrim. Title + message, then a stack of
   buttons separated by hairlines. One action can be `cancel` (bold) and one
   `destructive` (red). Two actions lay out side-by-side. */

function Alert({
  title,
  message,
  actions = [],
  onAction,
  style,
  ...rest
}) {
  const horizontal = actions.length === 2;
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      position: "absolute",
      inset: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--overlays-default)",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 270,
      borderRadius: 14,
      overflow: "hidden",
      background: "rgba(250,250,250,0.82)",
      backdropFilter: "blur(20px) saturate(1.8)",
      WebkitBackdropFilter: "blur(20px) saturate(1.8)",
      boxShadow: "0 10px 40px rgba(0,0,0,0.25)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "19px 16px 16px",
      textAlign: "center"
    }
  }, title && /*#__PURE__*/React.createElement("div", {
    style: {
      font: "600 17px/22px var(--font-system)",
      color: "var(--labels-primary)"
    }
  }, title), message && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 3,
      font: "400 13px/18px var(--font-system)",
      color: "var(--labels-primary)"
    }
  }, message)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: horizontal ? "row" : "column",
      borderTop: "0.5px solid var(--separators-non-opaque)"
    }
  }, actions.map((a, i) => /*#__PURE__*/React.createElement("button", {
    key: i,
    type: "button",
    onClick: () => onAction && onAction(a.value ?? a.label),
    style: {
      flex: 1,
      height: 44,
      border: "none",
      borderLeft: horizontal && i > 0 ? "0.5px solid var(--separators-non-opaque)" : "none",
      borderTop: !horizontal && i > 0 ? "0.5px solid var(--separators-non-opaque)" : "none",
      background: "transparent",
      cursor: "pointer",
      color: a.destructive ? "var(--accents-red)" : "var(--tint)",
      font: `${a.cancel ? 600 : 400} 17px/1 var(--font-system)`,
      WebkitTapHighlightColor: "transparent"
    }
  }, a.label)))));
}
Object.assign(__ds_scope, { Alert });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/overlays/Alert.jsx", error: String((e && e.message) || e) }); }

// components/overlays/Menu.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* iOS / iPadOS 26 — Menu (contextual)
   Rounded translucent menu card. Items have a leading label and trailing
   SF Symbol; destructive items are red; hairline separators group sections. */

function Menu({
  items = [],
  width = 250,
  onSelect,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      width,
      borderRadius: 14,
      overflow: "hidden",
      background: "rgba(250,250,250,0.78)",
      backdropFilter: "blur(24px) saturate(1.8)",
      WebkitBackdropFilter: "blur(24px) saturate(1.8)",
      boxShadow: "0 10px 40px rgba(0,0,0,0.22)",
      ...style
    }
  }, rest), items.map((it, i) => {
    if (it.separator) return /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        height: 8,
        background: "var(--miscellaneous-menu-inset-section-title)"
      }
    });
    const color = it.destructive ? "var(--accents-red)" : "var(--labels-primary)";
    return /*#__PURE__*/React.createElement("button", {
      key: i,
      type: "button",
      onClick: () => onSelect && onSelect(it.value ?? it.label),
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        minHeight: 44,
        padding: "0 16px",
        border: "none",
        borderTop: i > 0 && !items[i - 1].separator ? "0.5px solid var(--separators-non-opaque)" : "none",
        background: "transparent",
        cursor: "pointer",
        color,
        font: "400 17px/1 var(--font-system)",
        WebkitTapHighlightColor: "transparent"
      }
    }, /*#__PURE__*/React.createElement("span", null, it.label), it.icon && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: it.icon,
      size: 20,
      color: color
    }));
  }));
}
Object.assign(__ds_scope, { Menu });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/overlays/Menu.jsx", error: String((e && e.message) || e) }); }

// components/overlays/NotificationBanner.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* iOS / iPadOS 26 — NotificationBanner
   A Liquid-Glass notification capsule: rounded app-icon tile, app name + time,
   title and body. Used on the Lock Screen and as a banner drop-down. */

function NotificationBanner({
  appIcon,
  appName = "App",
  time = "now",
  title,
  body,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: "flex",
      gap: 11,
      padding: 14,
      borderRadius: 22,
      background: "rgba(245,245,245,0.62)",
      backdropFilter: "blur(28px) saturate(1.7)",
      WebkitBackdropFilter: "blur(28px) saturate(1.7)",
      boxShadow: "0 6px 30px rgba(0,0,0,0.12)",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 38,
      height: 38,
      borderRadius: 9,
      flex: "none",
      overflow: "hidden",
      background: "var(--grays-gray-4)"
    }
  }, appIcon && /*#__PURE__*/React.createElement("img", {
    src: appIcon,
    alt: "",
    style: {
      width: "100%",
      height: "100%",
      objectFit: "cover"
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "baseline"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: "500 13px/16px var(--font-system)",
      color: "var(--labels-secondary)",
      textTransform: "uppercase",
      letterSpacing: "0.2px"
    }
  }, appName), /*#__PURE__*/React.createElement("span", {
    style: {
      font: "400 13px/16px var(--font-system)",
      color: "var(--labels-tertiary)"
    }
  }, time)), title && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 1,
      font: "600 15px/20px var(--font-system)",
      color: "var(--labels-primary)"
    }
  }, title), body && /*#__PURE__*/React.createElement("div", {
    style: {
      font: "400 15px/20px var(--font-system)",
      color: "var(--labels-primary)"
    }
  }, body)));
}
Object.assign(__ds_scope, { NotificationBanner });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/overlays/NotificationBanner.jsx", error: String((e && e.message) || e) }); }

// components/overlays/Sheet.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* iOS / iPadOS 26 — Sheet
   A card that rises from the bottom with a grabber handle and large top
   corner radii, presented over a dimmed, slightly scaled backdrop. */

function Sheet({
  children,
  grabber = true,
  detent = "large",
  radius = 10,
  style,
  ...rest
}) {
  const heights = {
    medium: "50%",
    large: "92%",
    small: "34%"
  };
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      position: "absolute",
      inset: 0,
      display: "flex",
      flexDirection: "column",
      justifyContent: "flex-end",
      background: "var(--overlays-default)"
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      height: heights[detent] || detent,
      background: "var(--backgrounds-grouped-primary)",
      borderTopLeftRadius: radius,
      borderTopRightRadius: radius,
      boxShadow: "0 -2px 30px rgba(0,0,0,0.18)",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      ...style
    }
  }, grabber && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "center",
      padding: "6px 0 0"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 36,
      height: 5,
      borderRadius: 3,
      background: "var(--labels-tertiary)"
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflow: "auto"
    }
  }, children)));
}
Object.assign(__ds_scope, { Sheet });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/overlays/Sheet.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Button = __ds_scope.Button;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.SegmentedControl = __ds_scope.SegmentedControl;

__ds_ns.Slider = __ds_scope.Slider;

__ds_ns.Stepper = __ds_scope.Stepper;

__ds_ns.Switch = __ds_scope.Switch;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.Widget = __ds_scope.Widget;

__ds_ns.ActivityIndicator = __ds_scope.ActivityIndicator;

__ds_ns.Avatar = __ds_scope.Avatar;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.PageControl = __ds_scope.PageControl;

__ds_ns.ProgressBar = __ds_scope.ProgressBar;

__ds_ns.SearchField = __ds_scope.SearchField;

__ds_ns.TextField = __ds_scope.TextField;

__ds_ns.Icon = __ds_scope.Icon;

__ds_ns.ICON_NAMES = __ds_scope.ICON_NAMES;

__ds_ns.List = __ds_scope.List;

__ds_ns.ListRow = __ds_scope.ListRow;

__ds_ns.NavigationBar = __ds_scope.NavigationBar;

__ds_ns.StatusBar = __ds_scope.StatusBar;

__ds_ns.TabBar = __ds_scope.TabBar;

__ds_ns.Toolbar = __ds_scope.Toolbar;

__ds_ns.ActionSheet = __ds_scope.ActionSheet;

__ds_ns.Alert = __ds_scope.Alert;

__ds_ns.Menu = __ds_scope.Menu;

__ds_ns.NotificationBanner = __ds_scope.NotificationBanner;

__ds_ns.Sheet = __ds_scope.Sheet;

})();
