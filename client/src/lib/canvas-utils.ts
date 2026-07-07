import { Unit, Gridline } from '@/types/drafting';

export const drawGrid = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  gridSize: number,
  panX: number,
  panY: number,
  zoom: number = 1
) => {
  ctx.save();
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  ctx.setLineDash([]);
  
  // Calculate the grid size with zoom
  const zoomedGridSize = gridSize * zoom;
  
  // Calculate the starting positions based on pan offset
  const startX = (panX % zoomedGridSize) - zoomedGridSize;
  const startY = (panY % zoomedGridSize) - zoomedGridSize;
  
  // Vertical lines - offset by pan and scaled by zoom
  for (let x = startX; x <= width + zoomedGridSize; x += zoomedGridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  
  // Horizontal lines - offset by pan and scaled by zoom
  for (let y = startY; y <= height + zoomedGridSize; y += zoomedGridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  
  ctx.restore();
};

export const drawAxes = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  gridSize: number,
  panX: number,
  panY: number,
  zoom: number = 1
) => {
  ctx.save();
  
  // X-axis (horizontal at 0') - red, thin, dashed, transparent
  ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)'; // red with transparency
  ctx.lineWidth = 1;
  ctx.setLineDash([5, 5]);
  
  const yAxisPosition = 0 * gridSize * zoom + panY; // 0 feet position
  if (yAxisPosition >= 0 && yAxisPosition <= height) {
    ctx.beginPath();
    ctx.moveTo(0, yAxisPosition);
    ctx.lineTo(width, yAxisPosition);
    ctx.stroke();
  }
  
  // Y-axis (vertical at 0') - green, thin, dashed, transparent
  ctx.strokeStyle = 'rgba(34, 197, 94, 0.6)'; // green with transparency
  ctx.lineWidth = 1;
  ctx.setLineDash([5, 5]);
  
  const xAxisPosition = 0 * gridSize * zoom + panX; // 0 feet position
  if (xAxisPosition >= 0 && xAxisPosition <= width) {
    ctx.beginPath();
    ctx.moveTo(xAxisPosition, 0);
    ctx.lineTo(xAxisPosition, height);
    ctx.stroke();
  }
  
  ctx.restore();
};

export const drawGridlines = (
  ctx: CanvasRenderingContext2D,
  gridlines: Gridline[],
  gridSize: number,
  canvasWidth: number,
  canvasHeight: number,
  panX: number,
  panY: number,
  zoom: number = 1,
  hoveredItem: Unit | Gridline | null = null,
  currentTool: string = 'select',
  alignmentStep: number = 0
) => {
  ctx.save();
  
  gridlines.forEach(gridline => {
    const isHovered = hoveredItem?.id === gridline.id;
    const canBeHovered = currentTool === 'align' && alignmentStep === 0 && 'orientation' in gridline;
    
    if (gridline.isSelected) {
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 3;
    } else if (isHovered && canBeHovered) {
      // Hover preview for align tool
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 3;
    } else {
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2;
    }
    
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    
    if (gridline.orientation === 'vertical') {
      const x = gridline.position * gridSize * zoom + panX;
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvasHeight);
    } else {
      const y = gridline.position * gridSize * zoom + panY;
      ctx.moveTo(0, y);
      ctx.lineTo(canvasWidth, y);
    }
    
    ctx.stroke();
  });
  
  ctx.restore();
};

export const drawUnits = (
  ctx: CanvasRenderingContext2D,
  units: Unit[],
  gridSize: number,
  panX: number,
  panY: number,
  zoom: number = 1,
  hoveredItem: Unit | Gridline | null = null,
  currentTool: string = 'select',
  alignmentStep: number = 0,
  alignmentPreview: { unit: Unit; newX: number; newY: number } | null = null
) => {
  ctx.save();
  
  units.forEach(unit => {
    let x = unit.x * gridSize * zoom + panX;
    let y = unit.y * gridSize * zoom + panY;
    const width = unit.width * gridSize * zoom;
    const height = unit.height * gridSize * zoom;
    
    // Check if this unit has an alignment preview
    const isPreviewUnit = alignmentPreview && alignmentPreview.unit.id === unit.id;
    if (isPreviewUnit) {
      x = alignmentPreview.newX * gridSize * zoom + panX;
      y = alignmentPreview.newY * gridSize * zoom + panY;
    }
    
    // Check if unit is hovered during alignment step 2
    const isHovered = hoveredItem?.id === unit.id;
    const canBeHovered = currentTool === 'align' && alignmentStep === 1 && 'width' in unit;
    
    // Fill
    const color = hexToRgb(unit.color);
    if (color) {
      let alpha = isPreviewUnit ? 0.3 : 0.2;
      ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
      ctx.fillRect(x, y, width, height);
    }
    
    // Border
    let strokeColor = unit.color;
    let lineWidth = unit.isSelected ? 3 : 2;
    ctx.setLineDash([]);
    
    if (isHovered && canBeHovered) {
      strokeColor = '#3b82f6';
      lineWidth = 3;
    } else if (isPreviewUnit) {
      strokeColor = '#3b82f6';
      lineWidth = 2;
      ctx.setLineDash([5, 5]);
    }
    
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = lineWidth;
    ctx.strokeRect(x, y, width, height);
    
    // Selection indicators
    if (unit.isSelected) {
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      ctx.setLineDash([3, 3]);
      ctx.strokeRect(x - 2, y - 2, width + 4, height + 4);
    }
  });
  
  ctx.restore();
};

export const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

export const getCanvasCoordinates = (
  e: MouseEvent,
  canvas: HTMLCanvasElement,
  gridSize: number,
  panX: number,
  panY: number,
  zoom: number = 1
): { x: number; y: number; feetX: number; feetY: number } => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  return {
    x,
    y,
    feetX: (x - panX) / (gridSize * zoom),
    feetY: (y - panY) / (gridSize * zoom)
  };
};

export const findItemAtPosition = (
  x: number,
  y: number,
  units: Unit[],
  gridlines: Gridline[],
  gridSize: number,
  panX: number,
  panY: number,
  zoom: number = 1
): Unit | Gridline | null => {
  const tolerance = 5; // pixels
  
  // Check units first (higher priority)
  for (const unit of units) {
    const unitX = unit.x * gridSize * zoom + panX;
    const unitY = unit.y * gridSize * zoom + panY;
    const unitWidth = unit.width * gridSize * zoom;
    const unitHeight = unit.height * gridSize * zoom;
    
    if (x >= unitX && x <= unitX + unitWidth && y >= unitY && y <= unitY + unitHeight) {
      return unit;
    }
  }
  
  // Check gridlines
  for (const gridline of gridlines) {
    if (gridline.orientation === 'vertical') {
      const lineX = gridline.position * gridSize * zoom + panX;
      if (Math.abs(x - lineX) <= tolerance) {
        return gridline;
      }
    } else {
      const lineY = gridline.position * gridSize * zoom + panY;
      if (Math.abs(y - lineY) <= tolerance) {
        return gridline;
      }
    }
  }
  
  return null;
};

export const getUnitSideAtPosition = (
  x: number,
  y: number,
  unit: Unit,
  gridSize: number,
  panX: number,
  panY: number,
  zoom: number = 1
): 'left' | 'right' | 'top' | 'bottom' | 'center' => {
  const unitLeft = unit.x * gridSize * zoom + panX;
  const unitTop = unit.y * gridSize * zoom + panY;
  const unitWidth = unit.width * gridSize * zoom;
  const unitHeight = unit.height * gridSize * zoom;
  
  // Calculate distances to each edge
  const distToLeft = Math.abs(x - unitLeft);
  const distToRight = Math.abs(x - (unitLeft + unitWidth));
  const distToTop = Math.abs(y - unitTop);
  const distToBottom = Math.abs(y - (unitTop + unitHeight));
  
  // Find minimum distance with threshold for edge detection
  const edgeThreshold = Math.min(unitWidth, unitHeight) * 0.2;
  
  if (distToLeft < edgeThreshold && distToLeft <= distToRight) return 'left';
  if (distToRight < edgeThreshold && distToRight <= distToLeft) return 'right';
  if (distToTop < edgeThreshold && distToTop <= distToBottom) return 'top';
  if (distToBottom < edgeThreshold && distToBottom <= distToTop) return 'bottom';
  
  return 'center';
};

export const calculateAlignmentPosition = (
  unit: Unit,
  gridline: Gridline,
  side: 'left' | 'right' | 'top' | 'bottom' | 'center'
): { x: number; y: number } => {
  let newX = unit.x;
  let newY = unit.y;
  
  if (gridline.orientation === 'vertical') {
    switch (side) {
      case 'left':
        // Align left edge to gridline
        newX = gridline.position;
        break;
      case 'right':
        // Align right edge to gridline
        newX = gridline.position - unit.width;
        break;
      case 'center':
        // Align center to gridline
        newX = gridline.position - (unit.width / 2);
        break;
    }
  } else if (gridline.orientation === 'horizontal') {
    switch (side) {
      case 'top':
        // Align top edge to gridline
        newY = gridline.position;
        break;
      case 'bottom':
        // Align bottom edge to gridline
        newY = gridline.position - unit.height;
        break;
      case 'center':
        // Align center to gridline
        newY = gridline.position - (unit.height / 2);
        break;
    }
  }
  
  return { x: newX, y: newY };
};
