"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { withLocale } from "@/lib/locale";

const COLOR_PRESETS = [
  "#181512",
  "#65431f",
  "#8d653d",
  "#b87036",
  "#d79b72",
  "#315d58",
  "#4f9189",
  "#4267d9",
  "#8f47c7",
  "#c6517a",
  "#f4d545",
  "#fffaf1",
];

function copy(locale, et, en) {
  return locale === "en" ? en : et;
}

function hslToHex(hue, saturation, lightness) {
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const huePrime = hue / 60;
  const secondary = chroma * (1 - Math.abs((huePrime % 2) - 1));
  const match = lightness - chroma / 2;
  const channels = [
    [chroma, secondary, 0],
    [secondary, chroma, 0],
    [0, chroma, secondary],
    [0, secondary, chroma],
    [secondary, 0, chroma],
    [chroma, 0, secondary],
  ][Math.floor(huePrime) % 6];

  return `#${channels
    .map((channel) =>
      Math.round((channel + match) * 255)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function hexToRgb(hex) {
  const value = hex.replace("#", "");
  const normalized =
    value.length === 3
      ? value
          .split("")
          .map((character) => character + character)
          .join("")
      : value;
  const number = Number.parseInt(normalized, 16);

  return {
    b: number & 255,
    g: (number >> 8) & 255,
    r: (number >> 16) & 255,
  };
}

function getPoint(event, canvas) {
  const rect = canvas.getBoundingClientRect();

  return {
    pressure: event.pressure > 0 ? event.pressure : 0.62,
    x: (event.clientX - rect.left) / rect.width,
    y: (event.clientY - rect.top) / rect.height,
  };
}

function getPointDistance(first, second) {
  return Math.hypot(first.x - second.x, first.y - second.y);
}

function smoothPoints(points) {
  if (points.length < 4) {
    return points;
  }

  return points.map((point, index) => {
    if (index === 0 || index === points.length - 1) {
      return point;
    }

    const previous = points[index - 1];
    const next = points[index + 1];

    return {
      pressure: point.pressure,
      x: previous.x * 0.22 + point.x * 0.56 + next.x * 0.22,
      y: previous.y * 0.22 + point.y * 0.56 + next.y * 0.22,
    };
  });
}

function drawTextItem(context, item, width, height) {
  const fontSize = Math.max(18, item.size * 2.15);
  const lineHeight = fontSize * 1.16;
  const lines = item.value.split("\n");
  const x = item.x * width;
  const y = item.y * height;

  context.save();
  context.fillStyle = item.color;
  context.font = `500 ${fontSize}px Georgia, "Times New Roman", serif`;
  context.textBaseline = "top";
  lines.forEach((line, index) => {
    context.fillText(line, x, y + index * lineHeight);
  });
  context.restore();
}

function drawStroke(context, stroke, width, height) {
  const points = smoothPoints(stroke.points);

  if (!points.length) {
    return;
  }

  context.save();
  context.globalCompositeOperation =
    stroke.tool === "eraser" ? "destination-out" : "source-over";
  context.lineCap = "round";
  context.lineJoin = "round";

  const first = points[0];
  const firstX = first.x * width;
  const firstY = first.y * height;
  const pressure =
    points.reduce((total, point) => total + (point.pressure || 0.62), 0) /
    points.length;
  const lineWidth = stroke.size * (0.78 + pressure * 0.28);

  if (points.length === 1) {
    context.fillStyle = stroke.color;
    context.globalAlpha = 1;
    context.beginPath();
    context.arc(firstX, firstY, lineWidth * 0.5, 0, Math.PI * 2);
    context.fill();
    context.restore();
    return;
  }

  const drawPath = (offsetX = 0, offsetY = 0) => {
    context.beginPath();
    context.moveTo(firstX + offsetX, firstY + offsetY);

    for (let index = 0; index < points.length - 1; index += 1) {
      const previous = points[Math.max(0, index - 1)];
      const current = points[index];
      const next = points[index + 1];
      const after = points[Math.min(points.length - 1, index + 2)];
      const currentX = current.x * width + offsetX;
      const currentY = current.y * height + offsetY;
      const nextX = next.x * width + offsetX;
      const nextY = next.y * height + offsetY;

      context.bezierCurveTo(
        currentX + ((next.x - previous.x) * width) / 6,
        currentY + ((next.y - previous.y) * height) / 6,
        nextX - ((after.x - current.x) * width) / 6,
        nextY - ((after.y - current.y) * height) / 6,
        nextX,
        nextY,
      );
    }
    context.stroke();
  };

  if (stroke.tool === "eraser") {
    context.lineWidth = stroke.size;
    context.strokeStyle = stroke.color;
    drawPath();
    context.restore();
    return;
  }

  context.strokeStyle = stroke.color;
  context.globalAlpha = 1;
  context.lineWidth = lineWidth;
  drawPath();
  context.restore();
}

function drawBucketFill(context, item) {
  const width = context.canvas.width;
  const height = context.canvas.height;
  const startX = Math.floor(clamp(item.x, 0, 0.9999) * width);
  const startY = Math.floor(clamp(item.y, 0, 0.9999) * height);
  const image = context.getImageData(0, 0, width, height);
  const { data } = image;
  const startIndex = startY * width + startX;
  const startOffset = startIndex * 4;
  const target = {
    a: data[startOffset + 3],
    b: data[startOffset + 2],
    g: data[startOffset + 1],
    r: data[startOffset],
  };
  const fill = hexToRgb(item.color);
  const targetIsTransparent = target.a < 32;
  const tolerance = targetIsTransparent ? 150 : 58;
  const isSameColor =
    Math.abs(target.r - fill.r) +
      Math.abs(target.g - fill.g) +
      Math.abs(target.b - fill.b) <
      8 && target.a > 248;

  if (isSameColor) {
    return;
  }

  const visited = new Uint8Array(width * height);
  const stack = [startIndex];
  let frontier = [];

  const pushNeighbors = (index, collection) => {
    const x = index % width;

    if (x > 0) {
      collection.push(index - 1);
    }

    if (x < width - 1) {
      collection.push(index + 1);
    }

    if (index >= width) {
      collection.push(index - width);
    }

    if (index < width * (height - 1)) {
      collection.push(index + width);
    }
  };

  const matchesTarget = (index) => {
    const offset = index * 4;
    const alpha = data[offset + 3];

    if (targetIsTransparent) {
      return alpha < tolerance;
    }

    const distance =
      Math.abs(data[offset] - target.r) +
      Math.abs(data[offset + 1] - target.g) +
      Math.abs(data[offset + 2] - target.b) +
      Math.abs(alpha - target.a) * 0.35;

    return distance <= tolerance;
  };

  while (stack.length) {
    const index = stack.pop();

    if (visited[index] || !matchesTarget(index)) {
      continue;
    }

    visited[index] = 1;

    const offset = index * 4;
    data[offset] = fill.r;
    data[offset + 1] = fill.g;
    data[offset + 2] = fill.b;
    data[offset + 3] = 255;
    frontier.push(index);

    pushNeighbors(index, stack);
  }

  const canAbsorbEdge = (index) => {
    const offset = index * 4;
    return data[offset + 3] < 248;
  };

  for (let pass = 0; pass < 3; pass += 1) {
    const nextFrontier = [];

    frontier.forEach((index) => {
      const candidates = [];
      pushNeighbors(index, candidates);

      candidates.forEach((candidate) => {
        if (visited[candidate] || !canAbsorbEdge(candidate)) {
          return;
        }

        visited[candidate] = 1;
        const offset = candidate * 4;
        data[offset] = fill.r;
        data[offset + 1] = fill.g;
        data[offset + 2] = fill.b;
        data[offset + 3] = 255;
        nextFrontier.push(candidate);
      });
    });

    frontier = nextFrontier;
  }

  context.putImageData(image, 0, 0);
}

function drawCanvasItem(context, item, width, height) {
  if (item.type === "fill") {
    context.save();
    context.fillStyle = item.color;
    context.fillRect(0, 0, width, height);
    context.restore();
    return;
  }

  if (item.type === "bucketFill") {
    drawBucketFill(context, item);
    return;
  }

  if (item.type === "text") {
    drawTextItem(context, item, width, height);
    return;
  }

  drawStroke(context, item, width, height);
}

export default function StudioCanvas({ locale = "et" }) {
  const canvasRef = useRef(null);
  const colorControlRef = useRef(null);
  const currentStrokeRef = useRef(null);
  const frameRef = useRef(null);
  const strokesRef = useRef([]);
  const textInputRef = useRef(null);
  const [strokes, setStrokes] = useState([]);
  const [tool, setTool] = useState("brush");
  const [color, setColor] = useState("#181512");
  const [colorPanelOpen, setColorPanelOpen] = useState(false);
  const [size, setSize] = useState(12);
  const [textDraft, setTextDraft] = useState(null);
  const sizePercent = ((size - 2) / (38 - 2)) * 100;

  const setBrushColor = (nextColor) => {
    setColor(nextColor);
  };

  const handleColorWheelPointerDown = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const radius = rect.width / 2;
    const x = event.clientX - rect.left - radius;
    const y = event.clientY - rect.top - radius;
    const distance = Math.min(Math.hypot(x, y), radius);
    const hue = (Math.atan2(y, x) * 180) / Math.PI + 360;
    const saturation = Math.max(0.18, distance / radius);
    const lightness = 0.62 - saturation * 0.2;

    setBrushColor(hslToHex(hue % 360, saturation, lightness));
    setColorPanelOpen(true);
  };

  const handleColorFieldPointerDown = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = clamp((event.clientX - rect.left) / rect.width, 0, 1);
    const y = clamp((event.clientY - rect.top) / rect.height, 0, 1);
    const hue = x * 360;
    const saturation = 0.38 + (1 - y) * 0.54;
    const lightness = 0.84 - y * 0.58;

    setBrushColor(hslToHex(hue, saturation, lightness));
  };

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const pixelRatio = window.devicePixelRatio || 1;

    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    context.clearRect(0, 0, rect.width, rect.height);

    strokesRef.current.forEach((item) => {
      drawCanvasItem(context, item, rect.width, rect.height);
    });

    if (currentStrokeRef.current) {
      drawStroke(context, currentStrokeRef.current, rect.width, rect.height);
    }
  }, []);

  const scheduleRedraw = useCallback(() => {
    if (frameRef.current) {
      return;
    }

    frameRef.current = window.requestAnimationFrame(() => {
      frameRef.current = null;
      redraw();
    });
  }, [redraw]);

  useEffect(() => {
    strokesRef.current = strokes;
    redraw();
  }, [redraw, strokes]);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return undefined;
    }

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const pixelRatio = window.devicePixelRatio || 1;

      canvas.width = Math.max(1, Math.round(rect.width * pixelRatio));
      canvas.height = Math.max(1, Math.round(rect.height * pixelRatio));
      redraw();
    };

    resizeCanvas();

    const resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(canvas);
    window.addEventListener("resize", resizeCanvas);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", resizeCanvas);
      if (frameRef.current) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, [redraw]);

  useEffect(() => {
    if (!colorPanelOpen) {
      return undefined;
    }

    const onPointerDown = (event) => {
      if (!colorControlRef.current?.contains(event.target)) {
        setColorPanelOpen(false);
      }
    };

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setColorPanelOpen(false);
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [colorPanelOpen]);

  useEffect(() => {
    if (textDraft) {
      const focusTimer = window.setTimeout(() => {
        textInputRef.current?.focus({ preventScroll: true });
      }, 0);

      return () => window.clearTimeout(focusTimer);
    }

    return undefined;
  }, [textDraft]);

  const commitTextDraft = useCallback(() => {
    setTextDraft((draft) => {
      const value = draft?.value.trim();

      if (value) {
        setStrokes((current) => [
          ...current,
          {
            color: draft.color,
            size: draft.size,
            type: "text",
            value,
            x: draft.x,
            y: draft.y,
          },
        ]);
      }

      return null;
    });
  }, []);

  const startStroke = (event) => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const point = getPoint(event, canvas);

    if (tool === "fill") {
      setTextDraft(null);
      setStrokes((current) => [
        ...current,
        {
          color,
          type: "bucketFill",
          x: point.x,
          y: point.y,
        },
      ]);
      return;
    }

    if (tool === "text") {
      setTextDraft({
        color,
        size,
        value: "",
        x: point.x,
        y: point.y,
      });
      return;
    }

    setTextDraft(null);
    canvas.setPointerCapture(event.pointerId);
    currentStrokeRef.current = {
      color,
      points: [point],
      size,
      tool,
    };
    scheduleRedraw();
  };

  const continueStroke = (event) => {
    const canvas = canvasRef.current;
    const stroke = currentStrokeRef.current;

    if (!canvas || !stroke) {
      return;
    }

    const point = getPoint(event, canvas);
    const last = stroke.points[stroke.points.length - 1];

    if (getPointDistance(point, last) < 0.0012) {
      return;
    }

    stroke.points.push({
      pressure: point.pressure,
      x: last.x + (point.x - last.x) * 0.46,
      y: last.y + (point.y - last.y) * 0.46,
    });
    scheduleRedraw();
  };

  const finishStroke = (event) => {
    const canvas = canvasRef.current;
    const stroke = currentStrokeRef.current;

    if (!canvas || !stroke) {
      return;
    }

    if (canvas.hasPointerCapture(event.pointerId)) {
      canvas.releasePointerCapture(event.pointerId);
    }

    currentStrokeRef.current = null;
    setStrokes((current) => [...current, stroke]);
  };

  const clearCanvas = () => {
    currentStrokeRef.current = null;
    setTextDraft(null);
    setStrokes([]);
  };

  const undoStroke = () => {
    currentStrokeRef.current = null;
    setTextDraft(null);
    setStrokes((current) => current.slice(0, -1));
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const exportCanvas = document.createElement("canvas");
    const rect = canvas.getBoundingClientRect();
    const width = Math.round(rect.width * 2);
    const height = Math.round(rect.height * 2);
    const context = exportCanvas.getContext("2d");

    exportCanvas.width = width;
    exportCanvas.height = height;
    context.fillStyle = "#fffaf4";
    context.fillRect(0, 0, width, height);
    strokesRef.current.forEach((item) => {
      if (item.type) {
        drawCanvasItem(
          context,
          item.type === "text" ? { ...item, size: item.size * 2 } : item,
          width,
          height,
        );
        return;
      }

      drawStroke(
        context,
        {
          ...item,
          color: item.tool === "eraser" ? "#fffaf4" : item.color,
          size: item.size * 2,
          tool: "brush",
        },
        width,
        height,
      );
    });

    const link = document.createElement("a");
    link.download = "beyondframes-stuudio.png";
    link.href = exportCanvas.toDataURL("image/png");
    link.click();
  };

  return (
    <section className="studio-workspace" aria-labelledby="studio-title">
      <div className="studio-workspace__intro">
        <h1 id="studio-title">{copy(locale, "Stuudio", "Studio")}</h1>
        <Link className="studio-close-link" href={withLocale("/", locale)}>
          {copy(locale, "Sulge", "Close")}
        </Link>
      </div>

      <div className="studio-board">
        <div className="studio-toolbar" aria-label={copy(locale, "Stuudio tööriistad", "Studio tools")}>
          <div
            className="studio-toolbar__group"
            aria-label={copy(locale, "Tööriist", "Tool")}
          >
            <div className="studio-segmented">
              <button
                aria-pressed={tool === "brush"}
                className={`studio-tool ${tool === "brush" ? "studio-tool--active" : ""}`}
                onClick={() => setTool("brush")}
                type="button"
              >
                {copy(locale, "Pintsel", "Brush")}
              </button>
              <button
                aria-pressed={tool === "fill"}
                className={`studio-tool ${tool === "fill" ? "studio-tool--active" : ""}`}
                onClick={() => setTool("fill")}
                type="button"
              >
                {copy(locale, "Täida", "Fill")}
              </button>
              <button
                aria-pressed={tool === "text"}
                className={`studio-tool ${tool === "text" ? "studio-tool--active" : ""}`}
                onClick={() => setTool("text")}
                type="button"
              >
                {copy(locale, "Tekst", "Text")}
              </button>
              <button
                aria-pressed={tool === "eraser"}
                className={`studio-tool ${tool === "eraser" ? "studio-tool--active" : ""}`}
                onClick={() => setTool("eraser")}
                type="button"
              >
                {copy(locale, "Kustukumm", "Eraser")}
              </button>
            </div>
          </div>

          <div
            className="studio-toolbar__group studio-color-control"
            aria-label={copy(locale, "Värv", "Color")}
            ref={colorControlRef}
          >
            <button
              aria-expanded={colorPanelOpen}
              aria-label={copy(locale, "Vali värv", "Choose color")}
              className="studio-color-wheel"
              onPointerDown={handleColorWheelPointerDown}
              style={{ "--studio-current-color": color }}
              type="button"
            >
              <span className="studio-color-wheel__preview" aria-hidden="true" />
            </button>

            {colorPanelOpen ? (
              <div
                className="studio-color-popover"
                role="dialog"
                aria-label={copy(locale, "Värvi seaded", "Color settings")}
              >
                <div className="studio-color-popover__preview">
                  <span
                    className="studio-color-popover__swatch"
                    style={{ "--studio-current-color": color }}
                    aria-hidden="true"
                  />
                  <span className="studio-color-popover__value">{color.toUpperCase()}</span>
                </div>
                <button
                  aria-label={copy(locale, "Vali toon", "Choose shade")}
                  className="studio-color-field"
                  onPointerDown={handleColorFieldPointerDown}
                  type="button"
                />
                <div className="studio-color-presets">
                  {COLOR_PRESETS.map((preset) => (
                    <button
                      aria-label={copy(locale, `Vali ${preset}`, `Choose ${preset}`)}
                      aria-pressed={color.toLowerCase() === preset}
                      className="studio-color-preset"
                      key={preset}
                      onClick={() => setBrushColor(preset)}
                      style={{ "--studio-preset-color": preset }}
                      type="button"
                    />
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <label className="studio-toolbar__group studio-size-control">
            <input
              aria-label={copy(locale, "Suurus", "Size")}
              max="38"
              min="2"
              onChange={(event) => setSize(Number(event.target.value))}
              style={{ "--studio-size-percent": `${sizePercent}%` }}
              suppressHydrationWarning
              type="range"
              value={size}
            />
          </label>

          <div className="studio-toolbar__actions">
            <button className="studio-action" disabled={!strokes.length} onClick={undoStroke} type="button">
              {copy(locale, "Tagasi", "Undo")}
            </button>
            <button className="studio-action" disabled={!strokes.length} onClick={clearCanvas} type="button">
              {copy(locale, "Tühjenda", "Clear")}
            </button>
            <button className="studio-action studio-action--primary" onClick={downloadCanvas} type="button">
              {copy(locale, "Salvesta", "Save")}
            </button>
          </div>
        </div>

        <div className="studio-paper">
          <div className="studio-paper__surface">
          <canvas
            aria-label={copy(locale, "Joonistamise lõuend", "Drawing canvas")}
            className="studio-canvas"
            onPointerCancel={finishStroke}
            onPointerDown={startStroke}
            onPointerLeave={finishStroke}
            onPointerMove={continueStroke}
            onPointerUp={finishStroke}
            ref={canvasRef}
            role="img"
          />
            {textDraft ? (
              <textarea
                aria-label={copy(locale, "Tekst lõuendil", "Text on canvas")}
                className="studio-text-input"
                onBlur={() => {
                  if (textDraft.value.trim()) {
                    commitTextDraft();
                  }
                }}
                onChange={(event) =>
                  setTextDraft((draft) =>
                    draft ? { ...draft, value: event.target.value } : draft,
                  )
                }
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    event.preventDefault();
                    setTextDraft(null);
                  }

                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    commitTextDraft();
                  }
                }}
                placeholder={copy(locale, "Kirjuta...", "Type...")}
                ref={textInputRef}
                style={{
                  "--studio-text-color": textDraft.color,
                  "--studio-text-size": `${Math.max(18, textDraft.size * 2.15)}px`,
                  left: `${textDraft.x * 100}%`,
                  top: `${textDraft.y * 100}%`,
                }}
                value={textDraft.value}
              />
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
