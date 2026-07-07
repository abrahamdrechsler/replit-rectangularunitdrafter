import React, { useRef, useCallback, useEffect } from 'react';
import { Unit, Gridline, UnitType } from '@/types/drafting';
import {
  drawGrid,
  drawAxes,
  drawUnits,
  drawGridlines,
  getCanvasCoordinates,
  hexToRgb,
  findItemAtPosition,
  getUnitSideAtPosition,
  calculateAlignmentPosition
} from '@/lib/canvas-utils';
import { snapToGrid, pixelsToFeet } from '@/lib/grid-system';

interface CanvasWorkspaceProps {
  units: Unit[];
  gridlines: Gridline[];
  currentTool: 'select' | 'align' | 'gridline-vertical' | 'gridline-horizontal';
  alignmentStep: number;
  gridSize: number;
  canvasWidth: number;
  canvasHeight: number;
  panX: number;
  panY: number;
  zoom: number;
  statusMessage: string;
  onCanvasClick: (x: number, y: number, item: Unit | Gridline | null, shiftKey?: boolean) => void;
  onCanvasDrop: (x: number, y: number, unitTypeData: string) => void;
  onItemDrag: (item: Unit | Gridline | any, newX: number, newY: number) => void;
  onZoom: (newZoom: number, newPanX: number, newPanY: number) => void;
}

export function CanvasWorkspace({
  units,
  gridlines,
  currentTool,
  alignmentStep,
  gridSize,
  canvasWidth,
  canvasHeight,
  panX,
  panY,
  zoom,
  statusMessage,
  onCanvasClick,
  onCanvasDrop,
  onItemDrag,
  onZoom
}: CanvasWorkspaceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDragging = useRef(false);
  const isPanning = useRef(false);
  const dragItem = useRef<Unit | Gridline | null>(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const lastPanPosition = useRef({ x: 0, y: 0 });
  const [dragPreview, setDragPreview] = React.useState<{
    x: number;
    y: number;
  } | null>(null);
  const dragUnitType = useRef<any>(null);
  const [hoveredItem, setHoveredItem] = React.useState<Unit | Gridline | null>(null);
  const [alignmentPreview, setAlignmentPreview] = React.useState<{
    unit: Unit;
    newX: number;
    newY: number;
    side: 'left' | 'right' | 'top' | 'bottom' | 'center';
  } | null>(null);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvasWidth || 800;
    const height = canvasHeight || 600;

    // Clear canvas with white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    
    // Draw grid with pan offset and zoom
    drawGrid(ctx, width, height, gridSize, panX, panY, zoom);
    
    // Draw coordinate axes (X and Y at 0')
    drawAxes(ctx, width, height, gridSize, panX, panY, zoom);
    
    // Draw gridlines with pan offset and zoom and hover state
    drawGridlines(ctx, gridlines, gridSize, width, height, panX, panY, zoom, hoveredItem, currentTool, alignmentStep);
    
    // Draw units with pan offset and zoom and alignment preview
    drawUnits(ctx, units, gridSize, panX, panY, zoom, hoveredItem, currentTool, alignmentStep, alignmentPreview);
  }, [units, gridlines, gridSize, canvasWidth, canvasHeight, panX, panY, zoom, hoveredItem, currentTool, alignmentStep, alignmentPreview]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Set canvas size
    canvas.width = canvasWidth || 800;
    canvas.height = canvasHeight || 600;
    
    // Render the content
    render();
  }, [canvasWidth, canvasHeight, render]);

  // Add event listener for drag start from unit library
  useEffect(() => {
    const handleUnitDragStart = (e: CustomEvent) => {
      dragUnitType.current = e.detail;
    };

    const handleUnitDragEnd = () => {
      dragUnitType.current = null;
      setDragPreview(null);
    };

    window.addEventListener('unitDragStart', handleUnitDragStart as EventListener);
    window.addEventListener('dragend', handleUnitDragEnd);

    return () => {
      window.removeEventListener('unitDragStart', handleUnitDragStart as EventListener);
      window.removeEventListener('dragend', handleUnitDragEnd);
    };
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const coords = getCanvasCoordinates(e.nativeEvent, canvas, gridSize, panX, panY, zoom);
    const item = findItemAtPosition(coords.x, coords.y, units, gridlines, gridSize, panX, panY, zoom);
    
    if (item && currentTool === 'select') {
      isDragging.current = true;
      dragItem.current = item;
      
      if ('width' in item) {
        // Unit
        dragOffset.current = {
          x: coords.feetX - item.x,
          y: coords.feetY - item.y
        };
      } else {
        // Gridline
        dragOffset.current = {
          x: item.orientation === 'vertical' ? coords.feetX - item.position : 0,
          y: item.orientation === 'horizontal' ? coords.feetY - item.position : 0
        };
      }
    } else if (!item && currentTool === 'select') {
      // Start panning if no item is clicked
      isPanning.current = true;
      lastPanPosition.current = { x: e.clientX, y: e.clientY };
      canvas.style.cursor = 'grabbing';
    }
    
    onCanvasClick(coords.feetX, coords.feetY, item, e.shiftKey);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    if (isPanning.current) {
      // Handle panning
      const deltaX = e.clientX - lastPanPosition.current.x;
      const deltaY = e.clientY - lastPanPosition.current.y;
      
      onItemDrag({ type: 'pan', deltaX, deltaY } as any, 0, 0);
      
      lastPanPosition.current = { x: e.clientX, y: e.clientY };
      return;
    }
    
    // Handle hover detection for align tool
    if (currentTool === 'align') {
      const coords = getCanvasCoordinates(e.nativeEvent, canvas, gridSize, panX, panY, zoom);
      const item = findItemAtPosition(coords.x, coords.y, units, gridlines, gridSize, panX, panY, zoom);
      
      if (alignmentStep === 0) {
        // Step 1: Hover on gridlines to select reference
        if (item && 'orientation' in item) {
          setHoveredItem(item);
          canvas.style.cursor = 'pointer';
        } else {
          setHoveredItem(null);
          canvas.style.cursor = 'default';
        }
        // Clear any alignment preview
        setAlignmentPreview(null);
      } else if (alignmentStep === 1) {
        // Step 2: Hover on units to preview alignment
        if (item && 'width' in item) {
          setHoveredItem(item);
          canvas.style.cursor = 'pointer';
          
          // Find the selected gridline
          const selectedGridline = gridlines.find(g => g.isSelected);
          if (selectedGridline) {
            // Detect which side of the unit was hovered
            const side = getUnitSideAtPosition(coords.x, coords.y, item, gridSize, panX, panY, zoom);
            const newPosition = calculateAlignmentPosition(item, selectedGridline, side);
            
            setAlignmentPreview({
              unit: item,
              newX: newPosition.x,
              newY: newPosition.y,
              side: side
            });
          }
        } else {
          setHoveredItem(null);
          setAlignmentPreview(null);
          canvas.style.cursor = 'default';
        }
      }
    } else {
      // Clear hover state when not in align mode
      if (hoveredItem) {
        setHoveredItem(null);
      }
      if (alignmentPreview) {
        setAlignmentPreview(null);
      }
    }
    
    if (isDragging.current && dragItem.current) {
      const coords = getCanvasCoordinates(e.nativeEvent, canvas, gridSize, panX, panY, zoom);
    
      if ('width' in dragItem.current) {
        // Dragging unit
        const newX = snapToGrid((coords.feetX - dragOffset.current.x) * gridSize, gridSize) / gridSize;
        const newY = snapToGrid((coords.feetY - dragOffset.current.y) * gridSize, gridSize) / gridSize;
        onItemDrag(dragItem.current, newX, newY);
      } else {
        // Dragging gridline
        if (dragItem.current.orientation === 'vertical') {
          const newX = snapToGrid((coords.feetX - dragOffset.current.x) * gridSize, gridSize) / gridSize;
          onItemDrag(dragItem.current, newX, dragItem.current.position);
        } else {
          const newY = snapToGrid((coords.feetY - dragOffset.current.y) * gridSize, gridSize) / gridSize;
          onItemDrag(dragItem.current, dragItem.current.position, newY);
        }
      }
    }
  };

  const handleMouseUp = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.style.cursor = 'crosshair';
    }
    
    isDragging.current = false;
    isPanning.current = false;
    dragItem.current = null;
    dragOffset.current = { x: 0, y: 0 };
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Calculate zoom factor based on wheel direction
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.2, Math.min(3, zoom * zoomFactor));
    
    if (newZoom !== zoom) {
      // Calculate the world position of the mouse before zoom
      const worldX = (mouseX - panX) / (gridSize * zoom);
      const worldY = (mouseY - panY) / (gridSize * zoom);
      
      // Calculate new pan to keep mouse position stable
      const newPanX = mouseX - worldX * gridSize * newZoom;
      const newPanY = mouseY - worldY * gridSize * newZoom;
      
      onZoom(newZoom, newPanX, newPanY);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    
    // Update preview position
    if (dragUnitType.current) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const rect = canvas.getBoundingClientRect();
      setDragPreview({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    // Start showing preview when entering canvas
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    try {
      const unitTypeData = e.dataTransfer.getData('application/json');
      if (unitTypeData) {
        dragUnitType.current = JSON.parse(unitTypeData);
        const rect = canvas.getBoundingClientRect();
        setDragPreview({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
    } catch (error) {
      console.error('Error parsing drag data:', error);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    // Only clear preview if we're actually leaving the canvas area
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check if we've left the canvas bounds
    if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
      setDragPreview(null);
      dragUnitType.current = null;
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Convert to world coordinates
    const worldX = (x - panX) / (gridSize * zoom);
    const worldY = (y - panY) / (gridSize * zoom);
    
    const unitTypeData = e.dataTransfer.getData('application/json');
    if (unitTypeData) {
      onCanvasDrop(worldX, worldY, unitTypeData);
    }
    
    // Clear drag preview
    setDragPreview(null);
    dragUnitType.current = null;
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-white">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onWheel={handleWheel}
      />
      
      <div className="absolute inset-0 pointer-events-none">
        {/* Status message */}
        {statusMessage && (
          <div className="absolute top-4 left-4 bg-blue-500 text-white px-3 py-1 rounded-md text-sm font-medium">
            {statusMessage}
          </div>
        )}
        
        {/* Gridline labels */}
        {gridlines.map(gridline => (
          <div
            key={`label-${gridline.id}`}
            className="absolute text-xs font-medium text-gray-600 bg-white px-1 rounded border border-gray-200"
            style={{
              left: gridline.orientation === 'vertical' 
                ? `${gridline.position * gridSize * zoom + panX}px`
                : '20px',
              top: gridline.orientation === 'horizontal'
                ? `${gridline.position * gridSize * zoom + panY}px`
                : '20px',
              transform: gridline.orientation === 'vertical' ? 'translateX(-50%)' : 'translateY(-50%)'
            }}
          >
            {gridline.label}
          </div>
        ))}

        {/* Drag Preview Overlay */}
        {dragPreview && dragUnitType.current && (
          <div
            className="absolute border-2 border-gray-800 pointer-events-none"
            style={{
              left: `${dragPreview.x - (dragUnitType.current.width * gridSize * zoom) / 2}px`,
              top: `${dragPreview.y - (dragUnitType.current.height * gridSize * zoom) / 2}px`,
              width: `${dragUnitType.current.width * gridSize * zoom}px`,
              height: `${dragUnitType.current.height * gridSize * zoom}px`,
              backgroundColor: `${dragUnitType.current.color}40`, // Add transparency
              borderStyle: 'solid',
              borderRadius: '2px',
              zIndex: 1000
            }}
          >
            <div 
              className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-800"
              style={{ fontSize: `${Math.max(8, Math.min(12, (dragUnitType.current.width * gridSize * zoom) / 10))}px` }}
            >
              {dragUnitType.current.name}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}