import { useState, useRef, useEffect, useCallback } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Crosshair } from 'lucide-react';
import type { ThemePalette } from '@/types/calculator';
import { evaluateForGraphing } from '@/lib/mathEngine';

interface GraphPanelProps {
  theme: ThemePalette;
  angleMode: 'deg' | 'rad';
}

export function GraphPanel({ theme, angleMode }: GraphPanelProps) {
  const [expression, setExpression] = useState('sin(x)');
  const [xMin, setXMin] = useState(-10);
  const [xMax, setXMax] = useState(10);
  const [yMin, setYMin] = useState(-5);
  const [yMax, setYMax] = useState(5);
  const [hoverCoord, setHoverCoord] = useState<{ x: number; y: number } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isPanning = useRef(false);
  const panStart = useRef<{ x: number; y: number; xMin: number; xMax: number; yMin: number; yMax: number } | null>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const dpr = window.devicePixelRatio || 1;
    const width = container.clientWidth;
    const height = 360;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    // Background
    ctx.fillStyle = theme.displayBg;
    ctx.fillRect(0, 0, width, height);

    const xRange = xMax - xMin;
    const yRange = yMax - yMin;
    const xScale = width / xRange;
    const yScale = height / yRange;

    const toScreenX = (x: number) => (x - xMin) * xScale;
    const toScreenY = (y: number) => height - (y - yMin) * yScale;
    const toGraphX = (sx: number) => xMin + sx / xScale;
    const toGraphY = (sy: number) => yMin + (height - sy) / yScale;

    // Grid lines
    ctx.strokeStyle = theme.border;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.4;

    const xStep = xRange > 50 ? 10 : xRange > 20 ? 5 : xRange > 10 ? 2 : xRange > 5 ? 1 : 0.5;
    const yStep = yRange > 50 ? 10 : yRange > 20 ? 5 : yRange > 10 ? 2 : yRange > 5 ? 1 : 0.5;

    for (let x = Math.ceil(xMin / xStep) * xStep; x <= xMax; x += xStep) {
      const sx = toScreenX(x);
      ctx.beginPath();
      ctx.moveTo(sx, 0);
      ctx.lineTo(sx, height);
      ctx.stroke();
    }

    for (let y = Math.ceil(yMin / yStep) * yStep; y <= yMax; y += yStep) {
      const sy = toScreenY(y);
      ctx.beginPath();
      ctx.moveTo(0, sy);
      ctx.lineTo(width, sy);
      ctx.stroke();
    }

    // Axes
    ctx.globalAlpha = 1;
    ctx.strokeStyle = theme.textMuted;
    ctx.lineWidth = 1.5;

    if (xMin < 0 && xMax > 0) {
      const sx = toScreenX(0);
      ctx.beginPath();
      ctx.moveTo(sx, 0);
      ctx.lineTo(sx, height);
      ctx.stroke();
    }

    if (yMin < 0 && yMax > 0) {
      const sy = toScreenY(0);
      ctx.beginPath();
      ctx.moveTo(0, sy);
      ctx.lineTo(width, sy);
      ctx.stroke();
    }

    // Axis labels
    ctx.fillStyle = theme.textMuted;
    ctx.font = "11px 'JetBrains Mono', monospace";
    ctx.textAlign = 'center';
    for (let x = Math.ceil(xMin / xStep) * xStep; x <= xMax; x += xStep) {
      if (x === 0) continue;
      const sx = toScreenX(x);
      const sy = yMin < 0 && yMax > 0 ? toScreenY(0) + 14 : height - 6;
      const label = xStep < 1 ? x.toFixed(1) : String(Math.round(x));
      ctx.fillText(label, sx, sy);
    }
    ctx.textAlign = 'right';
    for (let y = Math.ceil(yMin / yStep) * yStep; y <= yMax; y += yStep) {
      if (y === 0) continue;
      const sy = toScreenY(y);
      const sx = xMin < 0 && xMax > 0 ? toScreenX(0) - 6 : 24;
      const label = yStep < 1 ? y.toFixed(1) : String(Math.round(y));
      ctx.fillText(label, sx, sy + 4);
    }

    // Plot function
    const points = evaluateForGraphing(expression, xMin, xMax, width, angleMode);

    ctx.strokeStyle = theme.accent;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    let started = false;
    let prevY: number | null = null;

    for (const pt of points) {
      if (pt.y === null || !isFinite(pt.y)) {
        started = false;
        prevY = null;
        continue;
      }

      if (prevY !== null && Math.abs(pt.y - prevY) > yRange * 0.5) {
        started = false;
      }

      const sx = toScreenX(pt.x);
      const sy = toScreenY(pt.y);

      if (sy < -100 || sy > height + 100) {
        started = false;
        prevY = pt.y;
        continue;
      }

      if (!started) {
        ctx.moveTo(sx, sy);
        started = true;
      } else {
        ctx.lineTo(sx, sy);
      }
      prevY = pt.y;
    }
    ctx.stroke();

    // Origin label
    if (xMin < 0 && xMax > 0 && yMin < 0 && yMax > 0) {
      ctx.fillStyle = theme.textMuted;
      ctx.textAlign = 'right';
      ctx.fillText('0', toScreenX(0) - 4, toScreenY(0) + 14);
    }

    // Hover crosshair and coordinate label
    if (hoverCoord) {
      const sx = toScreenX(hoverCoord.x);
      const sy = toScreenY(hoverCoord.y);

      ctx.strokeStyle = theme.textMuted;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(sx, 0);
      ctx.lineTo(sx, height);
      ctx.moveTo(0, sy);
      ctx.lineTo(width, sy);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;

      // Coordinate label
      const label = `(${hoverCoord.x.toFixed(2)}, ${hoverCoord.y.toFixed(2)})`;
      ctx.font = "12px 'JetBrains Mono', monospace";
      ctx.textAlign = 'left';
      const labelWidth = ctx.measureText(label).width + 12;
      const labelX = Math.min(sx + 8, width - labelWidth - 4);
      const labelY = Math.max(sy - 28, 4);
      ctx.fillStyle = theme.surface;
      ctx.fillRect(labelX, labelY, labelWidth, 22);
      ctx.fillStyle = theme.textPrimary;
      ctx.fillText(label, labelX + 6, labelY + 15);
    }
  }, [expression, xMin, xMax, yMin, yMax, theme, angleMode, hoverCoord]);

  useEffect(() => {
    draw();
    const handleResize = () => draw();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [draw]);

  // ---------- Zoom ----------
  const zoom = useCallback((factor: number) => {
    const xCenter = (xMin + xMax) / 2;
    const yCenter = (yMin + yMax) / 2;
    const newXRange = (xMax - xMin) * factor;
    const newYRange = (yMax - yMin) * factor;

    if (newXRange < 0.1 || newYRange < 0.1) return;
    if (newXRange > 10000 || newYRange > 10000) return;

    setXMin(xCenter - newXRange / 2);
    setXMax(xCenter + newXRange / 2);
    setYMin(yCenter - newYRange / 2);
    setYMax(yCenter + newYRange / 2);
  }, [xMin, xMax, yMin, yMax]);

  const resetView = useCallback(() => {
    setXMin(-10);
    setXMax(10);
    setYMin(-5);
    setYMax(5);
  }, []);

  // ---------- Pan ----------
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    isPanning.current = true;
    panStart.current = {
      x: e.clientX,
      y: e.clientY,
      xMin,
      xMax,
      yMin,
      yMax,
    };
  }, [xMin, xMax, yMin, yMax]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    const width = rect.width;
    const height = 360;

    if (isPanning.current && panStart.current) {
      const dx = e.clientX - panStart.current.x;
      const dy = e.clientY - panStart.current.y;
      const xRange = panStart.current.xMax - panStart.current.xMin;
      const yRange = panStart.current.yMax - panStart.current.yMin;
      const xDelta = -(dx / width) * xRange;
      const yDelta = (dy / height) * yRange;
      setXMin(panStart.current.xMin + xDelta);
      setXMax(panStart.current.xMax + xDelta);
      setYMin(panStart.current.yMin + yDelta);
      setYMax(panStart.current.yMax + yDelta);
    } else {
      // Coordinate tracking
      const xScale = width / (xMax - xMin);
      const yScale = height / (yMax - yMin);
      const graphX = xMin + sx / xScale;
      const graphY = yMin + (height - sy) / yScale;
      setHoverCoord({ x: graphX, y: graphY });
    }
  }, [xMin, xMax, yMin, yMax]);

  const handleMouseUp = useCallback(() => {
    isPanning.current = false;
    panStart.current = null;
  }, []);

  const handleMouseLeave = useCallback(() => {
    isPanning.current = false;
    panStart.current = null;
    setHoverCoord(null);
  }, []);

  // Wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    const factor = e.deltaY > 0 ? 1.15 : 0.85;
    zoom(factor);
  }, [zoom]);

  // ---------- Touch gestures (pinch zoom + pan) ----------
  const touchState = useRef<{ mode: 'none' | 'pan' | 'pinch'; startDist: number; startValues: { xMin: number; xMax: number; yMin: number; yMax: number } | null; lastTouch: { x: number; y: number } | null }>({
    mode: 'none',
    startDist: 0,
    startValues: null,
    lastTouch: null,
  });

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();

    if (e.touches.length === 1) {
      touchState.current.mode = 'pan';
      touchState.current.lastTouch = {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
      touchState.current.startValues = { xMin, xMax, yMin, yMax };
    } else if (e.touches.length === 2) {
      touchState.current.mode = 'pinch';
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      touchState.current.startDist = Math.sqrt(dx * dx + dy * dy);
      touchState.current.startValues = { xMin, xMax, yMin, yMax };
    }
  }, [xMin, xMax, yMin, yMax]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = 360;

    if (touchState.current.mode === 'pan' && e.touches.length === 1 && touchState.current.startValues && touchState.current.lastTouch) {
      e.preventDefault();
      const currentX = e.touches[0].clientX - rect.left;
      const currentY = e.touches[0].clientY - rect.top;
      const dx = currentX - touchState.current.lastTouch.x;
      const dy = currentY - touchState.current.lastTouch.y;
      const sv = touchState.current.startValues;
      const xRange = sv.xMax - sv.xMin;
      const yRange = sv.yMax - sv.yMin;
      const xDelta = -(dx / width) * xRange;
      const yDelta = (dy / height) * yRange;
      setXMin(sv.xMin + xDelta);
      setXMax(sv.xMax + xDelta);
      setYMin(sv.yMin + yDelta);
      setYMax(sv.yMax + yDelta);
    } else if (touchState.current.mode === 'pinch' && e.touches.length === 2 && touchState.current.startValues) {
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (touchState.current.startDist > 0 && dist > 0) {
        const ratio = touchState.current.startDist / dist;
        const sv = touchState.current.startValues;
        const xCenter = (sv.xMin + sv.xMax) / 2;
        const yCenter = (sv.yMin + sv.yMax) / 2;
        const newXRange = (sv.xMax - sv.xMin) * ratio;
        const newYRange = (sv.yMax - sv.yMin) * ratio;
        if (newXRange >= 0.1 && newYRange >= 0.1 && newXRange <= 10000 && newYRange <= 10000) {
          setXMin(xCenter - newXRange / 2);
          setXMax(xCenter + newXRange / 2);
          setYMin(yCenter - newYRange / 2);
          setYMax(yCenter + newYRange / 2);
        }
      }
    }
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 0) {
      touchState.current.mode = 'none';
      touchState.current.startValues = null;
      touchState.current.lastTouch = null;
    } else if (e.touches.length === 1) {
      touchState.current.mode = 'pan';
      const canvas = canvasRef.current;
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        touchState.current.lastTouch = {
          x: e.touches[0].clientX - rect.left,
          y: e.touches[0].clientY - rect.top,
        };
      }
    }
  }, []);

  const inputStyle: React.CSSProperties = {
    background: theme.surface,
    color: theme.textPrimary,
    border: `1px solid ${theme.border}`,
    borderRadius: '8px',
    padding: '8px 12px',
    fontSize: '15px',
    fontFamily: "'JetBrains Mono', monospace",
    outline: 'none',
    width: '100%',
  };

  const rangeStyle: React.CSSProperties = {
    ...inputStyle,
    width: '64px',
    textAlign: 'center',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.08em',
    color: theme.textSecondary,
  };

  const zoomBtnStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    background: theme.surface,
    border: `1px solid ${theme.border}`,
    color: theme.textSecondary,
    cursor: 'pointer',
    transition: 'background 120ms ease',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Expression input */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <span style={labelStyle}>f(x) =</span>
        <input
          type="text"
          value={expression}
          onChange={(e) => setExpression(e.target.value)}
          placeholder="e.g. sin(x), x^2, ln(x)"
          style={inputStyle}
          onFocus={(e) => { e.target.style.border = `2px solid ${theme.accent}`; }}
          onBlur={(e) => { e.target.style.border = `1px solid ${theme.border}`; }}
        />
      </div>

      {/* Range controls + zoom buttons */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={labelStyle}>X MIN</span>
            <input type="number" value={xMin} onChange={(e) => setXMin(parseFloat(e.target.value) || -10)} style={rangeStyle} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={labelStyle}>X MAX</span>
            <input type="number" value={xMax} onChange={(e) => setXMax(parseFloat(e.target.value) || 10)} style={rangeStyle} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={labelStyle}>Y MIN</span>
            <input type="number" value={yMin} onChange={(e) => setYMin(parseFloat(e.target.value) || -5)} style={rangeStyle} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={labelStyle}>Y MAX</span>
            <input type="number" value={yMax} onChange={(e) => setYMax(parseFloat(e.target.value) || 5)} style={rangeStyle} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button onClick={() => zoom(0.7)} style={zoomBtnStyle} title="Zoom In">
            <ZoomIn size={18} color={theme.textSecondary} />
          </button>
          <button onClick={() => zoom(1.4)} style={zoomBtnStyle} title="Zoom Out">
            <ZoomOut size={18} color={theme.textSecondary} />
          </button>
          <button onClick={resetView} style={zoomBtnStyle} title="Reset View">
            <RotateCcw size={18} color={theme.textSecondary} />
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={containerRef}
        style={{
          borderRadius: '12px',
          overflow: 'hidden',
          border: `1px solid ${theme.border}`,
          position: 'relative',
        }}
      >
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onWheel={handleWheel}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ cursor: isPanning.current ? 'grabbing' : 'crosshair', display: 'block', touchAction: 'none' }}
        />
        {/* Coordinate readout badge */}
        {hoverCoord && (
          <div
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              background: theme.surface,
              borderRadius: '8px',
              border: `1px solid ${theme.border}`,
              fontSize: '11px',
              fontFamily: "'JetBrains Mono', monospace",
              color: theme.textSecondary,
              pointerEvents: 'none',
            }}
          >
            <Crosshair size={12} color={theme.textMuted} />
            {hoverCoord.x.toFixed(2)}, {hoverCoord.y.toFixed(2)}
          </div>
        )}
      </div>

      {/* Hint text */}
      <div
        style={{
          fontSize: '12px',
          color: theme.textMuted,
          fontFamily: "'Inter', sans-serif",
          textAlign: 'center',
        }}
      >
        Pinch to zoom — drag to pan — use buttons to scale — hover for coordinates
      </div>

      {/* Preset functions */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {['sin(x)', 'cos(x)', 'tan(x)', 'x^2', 'x^3', 'sqrt(x)', 'ln(x)', '1/x', 'e^x', 'abs(x)'].map((preset) => (
          <button
            key={preset}
            onClick={() => setExpression(preset)}
            style={{
              padding: '6px 12px',
              background: expression === preset ? theme.accent : theme.surface,
              color: expression === preset ? theme.accentText : theme.textSecondary,
              border: `1px solid ${theme.border}`,
              borderRadius: '8px',
              fontSize: '13px',
              fontFamily: "'JetBrains Mono', monospace",
              cursor: 'pointer',
              transition: 'background 120ms ease',
            }}
          >
            {preset}
          </button>
        ))}
      </div>
    </div>
  );
}
