import { createRequire } from "module";

const require = createRequire(import.meta.url);
const PptxGenJS = require("pptxgenjs");

/* ============================================================
   COTEXAI — PREMIUM PRESENTATION ENGINE
   UI/UX Architecture:
   - 12-column grid
   - Editorial typography
   - Dark/light visual modes
   - Hero layouts
   - Metric cards
   - Insight cards
   - Comparison tables
   - Timeline layouts
   - Quote slides
   - Closing CTA
   - Automatic density management
============================================================ */

const COLORS = {
  ink: "0B0F19",
  inkSoft: "151B29",
  navy: "101828",

  blue: "2563EB",
  blueDeep: "1D4ED8",
  electric: "3B82F6",
  cyan: "06B6D4",

  white: "FFFFFF",
  paper: "F9FAFB",
  fog: "F3F5F8",
  line: "E5E7EB",

  slate900: "111827",
  slate700: "374151",
  slate500: "6B7280",
  slate400: "9CA3AF",
  slate300: "D1D5DB",

  green: "10B981",
  amber: "F59E0B",
  red: "EF4444",
  purple: "7C3AED",

  blueTint: "EFF6FF",
  cyanTint: "ECFEFF",
  greenTint: "ECFDF5",
  amberTint: "FFFBEB",
  purpleTint: "F5F3FF",
};

const FONT = {
  heading: "Aptos Display",
  body: "Aptos",
  mono: "Aptos Mono",
};

const PPT = {
  width: 13.333,
  height: 7.5,
  marginX: 0.72,
  marginTop: 0.58,
  marginBottom: 0.52,
};

/* ============================================================
   GENERATOR
============================================================ */

export const generatePpt = async (data = {}) => {
  try {
    const ppt = new PptxGenJS();

    configurePresentation(ppt);

    addCover(ppt, data);

    const slides = Array.isArray(data.slides) ? data.slides : [];

    slides.forEach((slideData, index) => {
      renderSlide(ppt, slideData || {}, index, slides.length);
    });

    addClosing(ppt, data);

    return ppt;
  } catch (error) {
    throw new Error(`Unable to generate presentation: ${error.message}`, {
      cause: error,
    });
  }
};

/* ============================================================
   PRESENTATION CONFIG
============================================================ */

const configurePresentation = (ppt) => {
  ppt.layout = "LAYOUT_WIDE";

  ppt.author = "CotexAI";
  ppt.company = "CotexAI";
  ppt.subject = "AI Generated Presentation";
  ppt.lang = "en-US";

  ppt.theme = {
    headFontFace: FONT.heading,
    bodyFontFace: FONT.body,
    lang: "en-US",
  };

  ppt.defineSlideMaster({
    title: "COTEX_LIGHT",
    background: {
      color: COLORS.white,
    },
    objects: [
      {
        line: {
          x: 0.72,
          y: 0.11,
          w: 11.9,
          h: 0,
          line: {
            color: COLORS.line,
            width: 0.8,
          },
        },
      },
    ],
  });

  ppt.defineSlideMaster({
    title: "COTEX_DARK",
    background: {
      color: COLORS.ink,
    },
    objects: [
      {
        line: {
          x: 0,
          y: 0.08,
          w: 13.333,
          h: 0,
          line: {
            color: COLORS.blue,
            width: 3,
          },
        },
      },
    ],
  });
};

/* ============================================================
   SLIDE ROUTER
============================================================ */

const renderSlide = (ppt, data, index, total) => {
  const type = data.type || autoDetectType(data);

  switch (type) {
    case "hero":
      addHeroSlide(ppt, data, index, total);
      break;

    case "section":
      addSectionSlide(ppt, data, index);
      break;

    case "stats":
      addMetricsSlide(ppt, data, index, total);
      break;

    case "comparison":
      addComparisonSlide(ppt, data, index, total);
      break;

    case "timeline":
      addTimelineSlide(ppt, data, index, total);
      break;

    case "quote":
      addQuoteSlide(ppt, data, index);
      break;

    case "cards":
      addCardsSlide(ppt, data, index, total);
      break;

    default:
      addEditorialSlide(ppt, data, index, total);
  }
};

/* ============================================================
   SMART LAYOUT DETECTION
============================================================ */

const autoDetectType = (data) => {
  if (data.quote) return "quote";
  if (Array.isArray(data.stats)) return "stats";
  if (Array.isArray(data.comparison)) return "comparison";
  if (Array.isArray(data.timeline)) return "timeline";
  if (data.section === true) return "section";

  const points = Array.isArray(data.points) ? data.points : [];

  if (points.length <= 3) {
    return "editorial";
  }

  return "editorial";
};

/* ============================================================
   COVER
============================================================ */

const addCover = (ppt, data) => {
  const slide = ppt.addSlide();

  slide.background = {
    color: COLORS.ink,
  };

  /* ------------------------------------------
     Ambient background geometry
  ------------------------------------------ */

  addGlow(slide, ppt, 9.3, -1.7, 6.2, 6.2, COLORS.blue, 83);

  addGlow(slide, ppt, -2.1, 5.0, 5.5, 5.5, COLORS.cyan, 92);

  /* ------------------------------------------
     Brand
  ------------------------------------------ */

  addBrand(slide, {
    dark: true,
    x: 0.72,
    y: 0.55,
  });

  /* ------------------------------------------
     Eyebrow
  ------------------------------------------ */

  slide.addText(data.eyebrow || "STRATEGY • INSIGHTS • ACTION", {
    x: 0.75,
    y: 1.65,
    w: 5.8,
    h: 0.25,
    fontFace: FONT.body,
    fontSize: 9,
    bold: true,
    color: COLORS.cyan,
    charSpacing: 2.2,
    margin: 0,
  });

  /* ------------------------------------------
     Hero title
  ------------------------------------------ */

  slide.addText(data.title || "A Better Way\nTo Present Ideas", {
    x: 0.72,
    y: 2.02,
    w: 8.5,
    h: 1.75,
    fontFace: FONT.heading,
    fontSize: 38,
    bold: true,
    color: COLORS.white,
    breakLine: false,
    fit: "shrink",
    margin: 0,
    valign: "mid",
  });

  /* ------------------------------------------
     Accent
  ------------------------------------------ */

  slide.addShape(ppt.ShapeType.line, {
    x: 0.76,
    y: 4.08,
    w: 1.05,
    h: 0,
    line: {
      color: COLORS.cyan,
      width: 3.5,
    },
  });

  /* ------------------------------------------
     Subtitle
  ------------------------------------------ */

  slide.addText(
    data.subtitle ||
      "Transform complex information into a clear, memorable story.",
    {
      x: 0.72,
      y: 4.42,
      w: 7.25,
      h: 0.75,
      fontFace: FONT.body,
      fontSize: 16,
      color: "CBD5E1",
      fit: "shrink",
      margin: 0,
    },
  );

  /* ------------------------------------------
     Floating visual
  ------------------------------------------ */

  addCoverVisual(slide, ppt);

  /* ------------------------------------------
     Footer
  ------------------------------------------ */

  slide.addText("COTEXAI", {
    x: 0.72,
    y: 6.85,
    w: 1.4,
    h: 0.18,
    fontSize: 8,
    bold: true,
    charSpacing: 2,
    color: "64748B",
    margin: 0,
  });

  slide.addText(data.date || new Date().getFullYear().toString(), {
    x: 11.55,
    y: 6.85,
    w: 1.05,
    h: 0.18,
    fontSize: 8,
    color: "64748B",
    align: "right",
    margin: 0,
  });
};

/* ============================================================
   COVER VISUAL
============================================================ */

const addCoverVisual = (slide, ppt) => {
  const x = 9.05;
  const y = 1.3;

  /* Main glass panel */

  slide.addShape(ppt.ShapeType.roundRect, {
    x,
    y,
    w: 3.35,
    h: 4.55,
    rectRadius: 0.08,
    fill: {
      color: "16233A",
      transparency: 12,
    },
    line: {
      color: "334155",
      transparency: 30,
      width: 1,
    },
  });

  /* Top indicator */

  slide.addShape(ppt.ShapeType.ellipse, {
    x: x + 0.35,
    y: y + 0.35,
    w: 0.12,
    h: 0.12,
    fill: {
      color: COLORS.cyan,
    },
    line: {
      color: COLORS.cyan,
    },
  });

  slide.addText("SYSTEM OVERVIEW", {
    x: x + 0.58,
    y: y + 0.3,
    w: 1.9,
    h: 0.2,
    fontSize: 8,
    bold: true,
    color: "94A3B8",
    charSpacing: 1.4,
    margin: 0,
  });

  /* Big number */

  slide.addText("3.4×", {
    x: x + 0.35,
    y: y + 0.93,
    w: 2.3,
    h: 0.65,
    fontFace: FONT.heading,
    fontSize: 34,
    bold: true,
    color: COLORS.white,
    margin: 0,
  });

  slide.addText("Impact multiplier", {
    x: x + 0.37,
    y: y + 1.63,
    w: 2,
    h: 0.25,
    fontSize: 11,
    color: "94A3B8",
    margin: 0,
  });

  /* Mini visualization */

  const bars = [0.9, 1.45, 2.05, 2.75];

  bars.forEach((bar, i) => {
    slide.addShape(ppt.ShapeType.roundRect, {
      x: x + 0.38 + i * 0.65,
      y: y + 3.35 - bar,
      w: 0.42,
      h: bar,
      rectRadius: 0.04,
      fill: {
        color: i === bars.length - 1 ? COLORS.cyan : COLORS.blue,
        transparency: i === bars.length - 1 ? 0 : 28,
      },
      line: {
        color: i === bars.length - 1 ? COLORS.cyan : COLORS.blue,
        transparency: 100,
      },
    });
  });

  /* Status */

  slide.addText("↑ 24.8%", {
    x: x + 0.35,
    y: y + 3.75,
    w: 1.2,
    h: 0.25,
    fontSize: 10,
    bold: true,
    color: COLORS.green,
    margin: 0,
  });

  slide.addText("Momentum", {
    x: x + 1.6,
    y: y + 3.76,
    w: 1,
    h: 0.2,
    fontSize: 9,
    color: "64748B",
    margin: 0,
  });
};

/* ============================================================
   HERO SLIDE
============================================================ */

const addHeroSlide = (ppt, data, index, total) => {
  const slide = ppt.addSlide("COTEX_DARK");

  addPageMeta(slide, index, true);

  slide.addText(data.kicker || "KEY IDEA", {
    x: 0.72,
    y: 1.25,
    w: 2,
    h: 0.2,
    fontSize: 10,
    bold: true,
    color: COLORS.cyan,
    charSpacing: 2,
    margin: 0,
  });

  slide.addText(data.title || "The big idea", {
    x: 0.72,
    y: 1.75,
    w: 9.0,
    h: 1.45,
    fontFace: FONT.heading,
    fontSize: 34,
    bold: true,
    color: COLORS.white,
    fit: "shrink",
    margin: 0,
  });

  slide.addShape(ppt.ShapeType.line, {
    x: 0.74,
    y: 3.55,
    w: 1,
    h: 0,
    line: {
      color: COLORS.cyan,
      width: 4,
    },
  });

  slide.addText(
    data.description ||
      data.subtitle ||
      "One clear idea. One memorable takeaway.",
    {
      x: 0.72,
      y: 3.9,
      w: 7.8,
      h: 0.9,
      fontSize: 16,
      color: "CBD5E1",
      fit: "shrink",
      margin: 0,
    },
  );

  if (data.metric) {
    slide.addText(data.metric, {
      x: 9.35,
      y: 2.1,
      w: 2.8,
      h: 0.85,
      fontFace: FONT.heading,
      fontSize: 44,
      bold: true,
      color: COLORS.cyan,
      align: "center",
      margin: 0,
    });

    slide.addText(data.metricLabel || "KEY METRIC", {
      x: 9.35,
      y: 3.02,
      w: 2.8,
      h: 0.25,
      fontSize: 9,
      bold: true,
      color: COLORS.slate400,
      align: "center",
      charSpacing: 1.6,
      margin: 0,
    });
  }

  addFooter(slide, index, total, true);
};

/* ============================================================
   SECTION / CHAPTER
============================================================ */

const addSectionSlide = (ppt, data, index) => {
  const slide = ppt.addSlide("COTEX_DARK");

  /* Number */

  slide.addText(String(index + 1).padStart(2, "0"), {
    x: 0.75,
    y: 1.0,
    w: 1.3,
    h: 0.8,
    fontFace: FONT.heading,
    fontSize: 42,
    bold: true,
    color: COLORS.blue,
    margin: 0,
  });

  /* Vertical line */

  slide.addShape(ppt.ShapeType.line, {
    x: 2.18,
    y: 1.02,
    w: 0,
    h: 4.1,
    line: {
      color: "334155",
      width: 1.5,
    },
  });

  /* Title */

  slide.addText(data.title || "A new chapter", {
    x: 2.75,
    y: 1.2,
    w: 8.5,
    h: 1.5,
    fontFace: FONT.heading,
    fontSize: 39,
    bold: true,
    color: COLORS.white,
    fit: "shrink",
    margin: 0,
  });

  /* Subtitle */

  slide.addText(
    data.subtitle || "This chapter introduces the next part of the story.",
    {
      x: 2.78,
      y: 3.05,
      w: 7.5,
      h: 0.65,
      fontSize: 16,
      color: "94A3B8",
      fit: "shrink",
      margin: 0,
    },
  );

  /* Accent block */

  slide.addShape(ppt.ShapeType.roundRect, {
    x: 10.65,
    y: 4.45,
    w: 1.8,
    h: 0.54,
    rectRadius: 0.08,
    fill: {
      color: COLORS.blue,
    },
    line: {
      color: COLORS.blue,
    },
  });

  slide.addText("LET'S GO →", {
    x: 10.65,
    y: 4.62,
    w: 1.8,
    h: 0.15,
    align: "center",
    fontSize: 8.5,
    bold: true,
    color: COLORS.white,
    charSpacing: 1.2,
    margin: 0,
  });

  addBrand(slide, {
    dark: true,
    x: 0.75,
    y: 6.75,
  });
};

/* ============================================================
   EDITORIAL CONTENT
============================================================ */

const addEditorialSlide = (ppt, data, index, total) => {
  const slide = ppt.addSlide("COTEX_LIGHT");

  addPageHeader(slide, data, index, "INSIGHT");

  const points = Array.isArray(data.points) ? data.points.slice(0, 6) : [];

  /* Large lead statement */

  if (data.lead) {
    slide.addText(data.lead, {
      x: 0.72,
      y: 1.65,
      w: 11.3,
      h: 0.72,
      fontFace: FONT.heading,
      fontSize: 23,
      bold: true,
      color: COLORS.ink,
      fit: "shrink",
      margin: 0,
    });
  }

  const startY = data.lead ? 2.65 : 1.72;

  if (points.length <= 3) {
    points.forEach((point, i) => {
      addEditorialRow(
        slide,
        ppt,
        point,
        i,
        0.72,
        startY + i * 1.22,
        11.65,
        0.92,
      );
    });
  } else {
    const left = points.slice(0, 3);
    const right = points.slice(3, 6);

    left.forEach((point, i) => {
      addCompactCard(slide, ppt, point, i, 0.72, startY + i * 1.28, 5.68, 1.02);
    });

    right.forEach((point, i) => {
      addCompactCard(
        slide,
        ppt,
        point,
        i + 3,
        6.72,
        startY + i * 1.28,
        5.68,
        1.02,
      );
    });
  }

  if (data.callout) {
    addCallout(slide, ppt, data.callout, 0.72, 6.1, 11.7, 0.45);
  }

  addFooter(slide, index, total, false);
};

/* ============================================================
   EDITORIAL ROW
============================================================ */

const addEditorialRow = (slide, ppt, point, index, x, y, w, h) => {
  slide.addText(String(index + 1).padStart(2, "0"), {
    x,
    y: y + 0.08,
    w: 0.6,
    h: 0.3,
    fontSize: 11,
    bold: true,
    color: COLORS.blue,
    margin: 0,
  });

  slide.addShape(ppt.ShapeType.line, {
    x: x + 0.75,
    y: y + 0.08,
    w: 0,
    h: 0.63,
    line: {
      color: COLORS.line,
      width: 1,
    },
  });

  slide.addText(String(point), {
    x: x + 1.02,
    y,
    w: w - 1.05,
    h,
    fontSize: 15,
    color: COLORS.slate900,
    valign: "mid",
    fit: "shrink",
    margin: 0,
  });

  slide.addShape(ppt.ShapeType.line, {
    x: x + 1.02,
    y: y + h + 0.12,
    w: w - 1.02,
    h: 0,
    line: {
      color: COLORS.line,
      width: 0.7,
    },
  });
};

/* ============================================================
   COMPACT CARDS
============================================================ */

const addCompactCard = (slide, ppt, point, index, x, y, w, h) => {
  slide.addShape(ppt.ShapeType.roundRect, {
    x,
    y,
    w,
    h,
    rectRadius: 0.06,
    fill: {
      color: COLORS.paper,
    },
    line: {
      color: COLORS.line,
      width: 0.8,
    },
  });

  slide.addShape(ppt.ShapeType.ellipse, {
    x: x + 0.25,
    y: y + 0.27,
    w: 0.38,
    h: 0.38,
    fill: {
      color: index % 2 ? COLORS.cyan : COLORS.blue,
    },
    line: {
      color: index % 2 ? COLORS.cyan : COLORS.blue,
    },
  });

  slide.addText(String(index + 1).padStart(2, "0"), {
    x: x + 0.25,
    y: y + 0.375,
    w: 0.38,
    h: 0.1,
    align: "center",
    fontSize: 7,
    bold: true,
    color: COLORS.white,
    margin: 0,
  });

  slide.addText(String(point), {
    x: x + 0.84,
    y: y + 0.18,
    w: w - 1.05,
    h: h - 0.35,
    fontSize: 12.5,
    color: COLORS.slate900,
    valign: "mid",
    fit: "shrink",
    margin: 0,
  });
};

/* ============================================================
   METRICS
============================================================ */

const addMetricsSlide = (ppt, data, index, total) => {
  const slide = ppt.addSlide("COTEX_LIGHT");

  addPageHeader(slide, data, index, "PERFORMANCE");

  if (data.lead) {
    slide.addText(data.lead, {
      x: 0.72,
      y: 1.58,
      w: 10.5,
      h: 0.5,
      fontFace: FONT.heading,
      fontSize: 21,
      bold: true,
      color: COLORS.ink,
      margin: 0,
    });
  }

  const metrics = Array.isArray(data.stats) ? data.stats.slice(0, 4) : [];

  const width = 2.72;
  const gap = 0.28;

  metrics.forEach((metric, i) => {
    const x = 0.72 + i * (width + gap);

    addMetricCard(slide, ppt, metric, x, 2.25, width, 3.15, i);
  });

  addFooter(slide, index, total, false);
};

/* ============================================================
   METRIC CARD
============================================================ */

const addMetricCard = (slide, ppt, metric, x, y, w, h, index) => {
  const accent =
    [COLORS.blue, COLORS.cyan, COLORS.green, COLORS.purple][index] ||
    COLORS.blue;

  slide.addShape(ppt.ShapeType.roundRect, {
    x,
    y,
    w,
    h,
    rectRadius: 0.08,
    fill: {
      color: COLORS.white,
    },
    line: {
      color: COLORS.line,
      width: 1,
    },
    shadow: {
      type: "outer",
      color: "64748B",
      opacity: 0.12,
      blur: 2,
      angle: 45,
      distance: 1,
    },
  });

  slide.addShape(ppt.ShapeType.rect, {
    x,
    y,
    w,
    h: 0.06,
    fill: {
      color: accent,
    },
    line: {
      color: accent,
    },
  });

  slide.addText(metric?.value ?? "--", {
    x: x + 0.28,
    y: y + 0.65,
    w: w - 0.56,
    h: 0.75,
    fontFace: FONT.heading,
    fontSize: 30,
    bold: true,
    color: COLORS.ink,
    fit: "shrink",
    margin: 0,
  });

  slide.addText(metric?.label || "Metric", {
    x: x + 0.28,
    y: y + 1.48,
    w: w - 0.56,
    h: 0.42,
    fontSize: 13,
    bold: true,
    color: COLORS.slate900,
    margin: 0,
    fit: "shrink",
  });

  slide.addShape(ppt.ShapeType.line, {
    x: x + 0.28,
    y: y + 2.08,
    w: 0.55,
    h: 0,
    line: {
      color: accent,
      width: 2.5,
    },
  });

  slide.addText(metric?.description || "Performance indicator", {
    x: x + 0.28,
    y: y + 2.28,
    w: w - 0.55,
    h: 0.52,
    fontSize: 10.5,
    color: COLORS.slate500,
    fit: "shrink",
    margin: 0,
  });
};

/* ============================================================
   COMPARISON
============================================================ */

const addComparisonSlide = (ppt, data, index, total) => {
  const slide = ppt.addSlide("COTEX_LIGHT");

  addPageHeader(slide, data, index, "COMPARISON");

  const items = Array.isArray(data.comparison)
    ? data.comparison.slice(0, 3)
    : [];

  items.forEach((item, i) => {
    const x = 0.72 + i * 4.0;

    addComparisonColumn(slide, ppt, item, x, 1.85, 3.7, 4.45, i);
  });

  addFooter(slide, index, total, false);
};

/* ============================================================
   COMPARISON COLUMN
============================================================ */

const addComparisonColumn = (slide, ppt, item, x, y, w, h, index) => {
  const featured = item?.featured === true;

  slide.addShape(ppt.ShapeType.roundRect, {
    x,
    y,
    w,
    h,
    rectRadius: 0.08,
    fill: {
      color: featured ? COLORS.ink : COLORS.paper,
    },
    line: {
      color: featured ? COLORS.ink : COLORS.line,
      width: 1,
    },
  });

  if (featured) {
    slide.addShape(ppt.ShapeType.roundRect, {
      x: x + 0.22,
      y: y - 0.27,
      w: 1.22,
      h: 0.37,
      rectRadius: 0.06,
      fill: {
        color: COLORS.blue,
      },
      line: {
        color: COLORS.blue,
      },
    });

    slide.addText("RECOMMENDED", {
      x: x + 0.22,
      y: y - 0.155,
      w: 1.22,
      h: 0.1,
      fontSize: 6.8,
      bold: true,
      color: COLORS.white,
      align: "center",
      charSpacing: 0.8,
      margin: 0,
    });
  }

  slide.addText(item?.title || `Option ${index + 1}`, {
    x: x + 0.3,
    y: y + 0.35,
    w: w - 0.6,
    h: 0.35,
    fontFace: FONT.heading,
    fontSize: 17,
    bold: true,
    color: featured ? COLORS.white : COLORS.ink,
    margin: 0,
  });

  slide.addText(item?.headline || "", {
    x: x + 0.3,
    y: y + 0.95,
    w: w - 0.6,
    h: 0.62,
    fontSize: 12.5,
    bold: true,
    color: featured ? "CBD5E1" : COLORS.slate700,
    fit: "shrink",
    margin: 0,
  });

  const bullets = Array.isArray(item?.points) ? item.points.slice(0, 4) : [];

  bullets.forEach((bullet, j) => {
    const yy = y + 1.8 + j * 0.62;

    slide.addShape(ppt.ShapeType.ellipse, {
      x: x + 0.32,
      y: yy + 0.06,
      w: 0.1,
      h: 0.1,
      fill: {
        color: featured ? COLORS.cyan : COLORS.blue,
      },
      line: {
        color: featured ? COLORS.cyan : COLORS.blue,
      },
    });

    slide.addText(String(bullet), {
      x: x + 0.58,
      y: yy,
      w: w - 0.88,
      h: 0.34,
      fontSize: 10.5,
      color: featured ? "E2E8F0" : COLORS.slate600 || COLORS.slate700,
      fit: "shrink",
      margin: 0,
    });
  });
};

/* ============================================================
   TIMELINE
============================================================ */

const addTimelineSlide = (ppt, data, index, total) => {
  const slide = ppt.addSlide("COTEX_LIGHT");

  addPageHeader(slide, data, index, "ROADMAP");

  const items = Array.isArray(data.timeline) ? data.timeline.slice(0, 5) : [];

  const lineY = 3.45;

  slide.addShape(ppt.ShapeType.line, {
    x: 1.0,
    y: lineY,
    w: 10.9,
    h: 0,
    line: {
      color: COLORS.line,
      width: 2,
    },
  });

  items.forEach((item, i) => {
    const x = 1.0 + i * (10.9 / Math.max(items.length - 1, 1));

    slide.addShape(ppt.ShapeType.ellipse, {
      x: x - 0.13,
      y: lineY - 0.13,
      w: 0.26,
      h: 0.26,
      fill: {
        color: i === 0 ? COLORS.blue : COLORS.white,
      },
      line: {
        color: COLORS.blue,
        width: 2,
      },
    });

    slide.addText(item?.date || item?.period || `PHASE ${i + 1}`, {
      x: x - 0.65,
      y: 2.55,
      w: 1.3,
      h: 0.24,
      fontSize: 8.5,
      bold: true,
      color: COLORS.blue,
      align: "center",
      charSpacing: 1.1,
      margin: 0,
    });

    slide.addText(item?.title || "Milestone", {
      x: x - 0.9,
      y: 3.95,
      w: 1.8,
      h: 0.38,
      fontSize: 12,
      bold: true,
      color: COLORS.ink,
      align: "center",
      fit: "shrink",
      margin: 0,
    });

    slide.addText(item?.description || "", {
      x: x - 1.0,
      y: 4.45,
      w: 2.0,
      h: 0.72,
      fontSize: 9.5,
      color: COLORS.slate500,
      align: "center",
      fit: "shrink",
      margin: 0,
    });
  });

  addFooter(slide, index, total, false);
};

/* ============================================================
   QUOTE SLIDE
============================================================ */

const addQuoteSlide = (ppt, data, index) => {
  const slide = ppt.addSlide("COTEX_DARK");

  slide.addText("“", {
    x: 0.75,
    y: 0.85,
    w: 1.2,
    h: 1.2,
    fontFace: "Georgia",
    fontSize: 80,
    color: COLORS.blue,
    margin: 0,
  });

  slide.addText(
    data.quote || "A powerful idea becomes valuable when people can act on it.",
    {
      x: 1.0,
      y: 1.95,
      w: 10.6,
      h: 1.8,
      fontFace: FONT.heading,
      fontSize: 29,
      bold: true,
      color: COLORS.white,
      align: "center",
      valign: "mid",
      fit: "shrink",
      margin: 0,
    },
  );

  slide.addShape(ppt.ShapeType.line, {
    x: 6.05,
    y: 4.35,
    w: 1.1,
    h: 0,
    line: {
      color: COLORS.cyan,
      width: 3,
    },
  });

  slide.addText(data.author || "CotexAI", {
    x: 3.5,
    y: 4.72,
    w: 6.3,
    h: 0.3,
    fontSize: 11,
    bold: true,
    color: "CBD5E1",
    align: "center",
    margin: 0,
  });

  if (data.role) {
    slide.addText(data.role, {
      x: 3.5,
      y: 5.1,
      w: 6.3,
      h: 0.22,
      fontSize: 9,
      color: COLORS.slate400,
      align: "center",
      margin: 0,
    });
  }

  addBrand(slide, {
    dark: true,
    x: 0.75,
    y: 6.75,
  });
};

/* ============================================================
   CARDS SLIDE
============================================================ */

const addCardsSlide = (ppt, data, index, total) => {
  const slide = ppt.addSlide("COTEX_LIGHT");

  addPageHeader(slide, data, index, data.kicker || "FRAMEWORK");

  const cards = Array.isArray(data.cards) ? data.cards.slice(0, 4) : [];

  cards.forEach((card, i) => {
    const isLeft = i % 2 === 0;

    const x = isLeft ? 0.72 : 6.72;

    const y = 1.75 + Math.floor(i / 2) * 2.28;

    addFrameworkCard(slide, ppt, card, x, y, 5.6, 1.95, i);
  });

  addFooter(slide, index, total, false);
};

/* ============================================================
   FRAMEWORK CARD
============================================================ */

const addFrameworkCard = (slide, ppt, card, x, y, w, h, index) => {
  const accents = [COLORS.blue, COLORS.cyan, COLORS.purple, COLORS.green];

  const accent = accents[index] || COLORS.blue;

  slide.addShape(ppt.ShapeType.roundRect, {
    x,
    y,
    w,
    h,
    rectRadius: 0.08,
    fill: {
      color: COLORS.white,
    },
    line: {
      color: COLORS.line,
      width: 1,
    },
  });

  slide.addShape(ppt.ShapeType.rect, {
    x,
    y,
    w: 0.06,
    h,
    fill: {
      color: accent,
    },
    line: {
      color: accent,
    },
  });

  slide.addText(String(index + 1).padStart(2, "0"), {
    x: x + 0.28,
    y: y + 0.25,
    w: 0.5,
    h: 0.25,
    fontSize: 9,
    bold: true,
    color: accent,
    margin: 0,
  });

  slide.addText(card?.title || "Framework", {
    x: x + 0.28,
    y: y + 0.65,
    w: w - 0.55,
    h: 0.35,
    fontFace: FONT.heading,
    fontSize: 16,
    bold: true,
    color: COLORS.ink,
    margin: 0,
  });

  slide.addText(card?.description || "", {
    x: x + 0.28,
    y: y + 1.12,
    w: w - 0.55,
    h: 0.5,
    fontSize: 10.5,
    color: COLORS.slate500,
    fit: "shrink",
    margin: 0,
  });
};

/* ============================================================
   PAGE HEADER
============================================================ */

const addPageHeader = (slide, data, index, kicker) => {
  slide.addText(`${kicker}  /  ${String(index + 1).padStart(2, "0")}`, {
    x: 0.72,
    y: 0.42,
    w: 3,
    h: 0.2,
    fontSize: 8.5,
    bold: true,
    color: COLORS.blue,
    charSpacing: 1.6,
    margin: 0,
  });

  slide.addText(data.title || "Untitled slide", {
    x: 0.72,
    y: 0.76,
    w: 10.9,
    h: 0.6,
    fontFace: FONT.heading,
    fontSize: 27,
    bold: true,
    color: COLORS.ink,
    fit: "shrink",
    margin: 0,
  });

  slide.addShape(pptShapeLine(), {
    x: 0.72,
    y: 1.46,
    w: 11.88,
    h: 0,
  });
};

const pptShapeLine = () => {
  return "line";
};

/* ============================================================
   CALLOUT
============================================================ */

const addCallout = (slide, ppt, text, x, y, w, h) => {
  slide.addShape(ppt.ShapeType.roundRect, {
    x,
    y,
    w,
    h,
    rectRadius: 0.04,
    fill: {
      color: COLORS.blueTint,
    },
    line: {
      color: "BFDBFE",
      width: 0.8,
    },
  });

  slide.addText(text, {
    x: x + 0.18,
    y: y + 0.1,
    w: w - 0.36,
    h: h - 0.15,
    fontSize: 10,
    bold: true,
    color: COLORS.blueDeep,
    valign: "mid",
    fit: "shrink",
    margin: 0,
  });
};

/* ============================================================
   FOOTER
============================================================ */

const addFooter = (slide, page, total, dark = false) => {
  const color = dark ? "64748B" : COLORS.slate400;

  slide.addShape("line", {
    x: 0.72,
    y: 6.72,
    w: 11.88,
    h: 0,
    line: {
      color: dark ? "243247" : COLORS.line,
      width: 0.7,
    },
  });

  slide.addText("COTEXAI", {
    x: 0.72,
    y: 6.83,
    w: 1.3,
    h: 0.15,
    fontSize: 7.5,
    bold: true,
    color,
    charSpacing: 1.5,
    margin: 0,
  });

  slide.addText(
    `${String(page + 1).padStart(2, "0")} / ${String(total + 1).padStart(
      2,
      "0",
    )}`,
    {
      x: 11.35,
      y: 6.83,
      w: 1.25,
      h: 0.15,
      fontSize: 7.5,
      bold: true,
      color,
      align: "right",
      margin: 0,
    },
  );
};

/* ============================================================
   PAGE META
============================================================ */

const addPageMeta = (slide, index, dark = false) => {
  slide.addText(String(index + 1).padStart(2, "0"), {
    x: 11.95,
    y: 0.46,
    w: 0.5,
    h: 0.2,
    fontSize: 8,
    bold: true,
    color: dark ? "64748B" : COLORS.slate400,
    align: "right",
    margin: 0,
  });
};

/* ============================================================
   BRAND
============================================================ */

const addBrand = (slide, options = {}) => {
  const color = options.dark ? "CBD5E1" : COLORS.ink;

  slide.addText("COTEXAI", {
    x: options.x || 0.72,
    y: options.y || 0.5,
    w: 1.6,
    h: 0.22,
    fontFace: FONT.body,
    fontSize: 9,
    bold: true,
    color,
    charSpacing: 2.2,
    margin: 0,
  });
};

/* ============================================================
   GLOW
============================================================ */

const addGlow = (slide, ppt, x, y, w, h, color, transparency) => {
  slide.addShape(ppt.ShapeType.ellipse, {
    x,
    y,
    w,
    h,
    fill: {
      color,
      transparency,
    },
    line: {
      color,
      transparency: 100,
    },
  });
};

/* ============================================================
   CLOSING SLIDE
============================================================ */

const addClosing = (ppt, data) => {
  const slide = ppt.addSlide("COTEX_DARK");

  addGlow(slide, ppt, 8.4, -1.3, 6.5, 6.5, COLORS.blue, 84);

  slide.addText("NEXT", {
    x: 0.75,
    y: 1.1,
    w: 1.5,
    h: 0.25,
    fontSize: 10,
    bold: true,
    color: COLORS.cyan,
    charSpacing: 2.8,
    margin: 0,
  });

  slide.addText(data.closingTitle || "Now turn the insight into action.", {
    x: 0.72,
    y: 1.65,
    w: 8.7,
    h: 1.45,
    fontFace: FONT.heading,
    fontSize: 36,
    bold: true,
    color: COLORS.white,
    fit: "shrink",
    margin: 0,
  });

  slide.addText(
    data.closingSubtitle ||
      "The strongest presentation does not end with information. It ends with a decision.",
    {
      x: 0.72,
      y: 3.45,
      w: 7.0,
      h: 0.75,
      fontSize: 15,
      color: "CBD5E1",
      fit: "shrink",
      margin: 0,
    },
  );

  /* CTA */

  slide.addShape(ppt.ShapeType.roundRect, {
    x: 0.72,
    y: 4.65,
    w: 2.45,
    h: 0.58,
    rectRadius: 0.08,
    fill: {
      color: COLORS.blue,
    },
    line: {
      color: COLORS.blue,
    },
  });

  slide.addText(data.cta || "DEFINE THE NEXT MOVE  →", {
    x: 0.72,
    y: 4.85,
    w: 2.45,
    h: 0.14,
    fontSize: 8,
    bold: true,
    color: COLORS.white,
    align: "center",
    charSpacing: 1.0,
    margin: 0,
  });
};
