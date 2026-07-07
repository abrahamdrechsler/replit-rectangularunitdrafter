import { Unit, Gridline } from '@/types/drafting';

export const snapToGrid = (value: number, gridSize: number): number => {
  return Math.round(value / gridSize) * gridSize;
};

export const feetToPixels = (feet: number, gridSize: number): number => {
  return feet * gridSize;
};

export const pixelsToFeet = (pixels: number, gridSize: number): number => {
  return pixels / gridSize;
};

export const generateGridlineLabel = (index: number): string => {
  return String.fromCharCode(65 + index); // A, B, C, etc.
};

export const getNextVerticalGridlineLabel = (gridlines: Gridline[]): string => {
  const verticalGridlines = gridlines.filter(g => g.orientation === 'vertical');
  return generateGridlineLabel(verticalGridlines.length);
};

export const updateUnitConstraints = (
  unit: Unit,
  gridlines: Gridline[]
): Unit => {
  const tolerance = 0.1; // feet
  const updatedConstraints: any = {};
  
  // Check for gridline alignment
  gridlines.forEach(gridline => {
    if (gridline.orientation === 'vertical') {
      // Check left edge
      if (Math.abs(unit.x - gridline.position) < tolerance) {
        updatedConstraints.left = gridline.id;
      }
      // Check right edge  
      if (Math.abs((unit.x + unit.width) - gridline.position) < tolerance) {
        updatedConstraints.right = gridline.id;
      }
    } else {
      // Check top edge
      if (Math.abs(unit.y - gridline.position) < tolerance) {
        updatedConstraints.top = gridline.id;
      }
      // Check bottom edge
      if (Math.abs((unit.y + unit.height) - gridline.position) < tolerance) {
        updatedConstraints.bottom = gridline.id;
      }
    }
  });
  
  return { ...unit, constraints: updatedConstraints };
};

export const moveConstrainedUnits = (
  movedGridline: Gridline,
  oldPosition: number,
  units: Unit[]
): Unit[] => {
  const delta = movedGridline.position - oldPosition;
  
  return units.map(unit => {
    const constraints = unit.constraints;
    let newX = unit.x;
    let newY = unit.y;
    let newWidth = unit.width;
    let newHeight = unit.height;
    
    if (movedGridline.orientation === 'vertical') {
      // Handle left edge constraint
      if (constraints.left === movedGridline.id) {
        if (constraints.right) {
          // Double-locked: stretch width but don't move position
          newWidth = unit.width - delta;
        } else {
          // Single-locked: move unit's left edge to stay aligned with gridline
          newX = movedGridline.position;
        }
      }
      // Handle right edge constraint
      else if (constraints.right === movedGridline.id) {
        if (constraints.left) {
          // Double-locked: stretch width but don't move left edge
          newWidth = unit.width + delta;
        } else {
          // Single-locked: move unit so right edge stays aligned with gridline
          newX = movedGridline.position - unit.width;
        }
      }
    } else {
      // Handle top edge constraint
      if (constraints.top === movedGridline.id) {
        if (constraints.bottom) {
          // Double-locked: stretch height but don't move position
          newHeight = unit.height - delta;
        } else {
          // Single-locked: move unit's top edge to stay aligned with gridline
          newY = movedGridline.position;
        }
      }
      // Handle bottom edge constraint
      else if (constraints.bottom === movedGridline.id) {
        if (constraints.top) {
          // Double-locked: stretch height but don't move top edge
          newHeight = unit.height + delta;
        } else {
          // Single-locked: move unit so bottom edge stays aligned with gridline
          newY = movedGridline.position - unit.height;
        }
      }
    }
    
    return {
      ...unit,
      x: newX,
      y: newY,
      width: Math.max(1, newWidth), // Minimum 1 foot
      height: Math.max(1, newHeight)
    };
  });
};
