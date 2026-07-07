import React, { useState, useEffect, useCallback } from 'react';
import { TopToolbar } from '@/components/top-toolbar';
import { UnitLibrary } from '@/components/unit-library';
import { CanvasWorkspace } from '@/components/canvas-workspace';
import { InspectorPanel } from '@/components/inspector-panel';
import { UnitTypeInspector } from '@/components/unit-type-inspector';
import { Unit, Gridline, UnitType, AppState } from '@/types/drafting';
import { 
  saveToLocalStorage, 
  loadFromLocalStorage, 
  exportToJSON, 
  importFromJSON 
} from '@/lib/storage';
import {
  getNextVerticalGridlineLabel,
  updateUnitConstraints,
  moveConstrainedUnits
} from '@/lib/grid-system';
import { useToast } from '@/hooks/use-toast';

const DEFAULT_UNIT_TYPES: UnitType[] = [
  { id: 'unit-a', name: 'Unit A', color: '#2563eb', width: 12, height: 8 },
  { id: 'unit-b', name: 'Unit B', color: '#10b981', width: 16, height: 12 },
  { id: 'unit-c', name: 'Unit C', color: '#f59e0b', width: 8, height: 6 },
  { id: 'unit-d', name: 'Unit D', color: '#8b5cf6', width: 6, height: 8 }
];

export default function DraftingTool() {
  const { toast } = useToast();
  const [state, setState] = useState<AppState>({
    units: [],
    unitTypes: DEFAULT_UNIT_TYPES,
    gridlines: [],
    selectedItem: null,
    currentTool: 'select',
    alignmentStep: 0,
    alignmentReference: null,
    canvasWidth: 800,
    canvasHeight: 600,
    gridSize: 40, // pixels per foot
    zoom: 1,
    panX: 100,
    panY: 100
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [libraryCollapsed, setLibraryCollapsed] = useState(false);
  const [inspectorCollapsed, setInspectorCollapsed] = useState(false);
  const [selectedUnitType, setSelectedUnitType] = useState<UnitType | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const savedState = loadFromLocalStorage();
    if (savedState && savedState.units && savedState.units.length > 0) {
      setState(prev => ({ ...prev, ...savedState }));
      toast({
        title: "Loaded",
        description: "Previous session restored from local storage"
      });
    }
  }, [toast]);

  // Auto-save to localStorage
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      saveToLocalStorage(state);
    }, 1000);
    
    return () => clearTimeout(timeoutId);
  }, [state.units, state.unitTypes, state.gridlines]);

  // Handle window resize and initial size
  useEffect(() => {
    const updateCanvasSize = () => {
      const workspace = document.querySelector('.canvas-workspace');
      if (workspace) {
        const rect = workspace.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          setState(prev => ({
            ...prev,
            canvasWidth: rect.width,
            canvasHeight: rect.height
          }));
        }
      }
    };

    // Initial size calculation
    setTimeout(updateCanvasSize, 100);
    
    // Update on panel changes
    setTimeout(updateCanvasSize, 200);

    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, [libraryCollapsed, inspectorCollapsed]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'a':
          setCurrentTool('align');
          e.preventDefault();
          break;
        case 'v':
          setCurrentTool('select');
          e.preventDefault();
          break;
        case 'g':
          setCurrentTool('gridline-vertical');
          e.preventDefault();
          break;
        case 'h':
          setCurrentTool('gridline-horizontal');
          e.preventDefault();
          break;
        case 'delete':
        case 'backspace':
          if (state.selectedItem) {
            handleDeleteItem(state.selectedItem);
            e.preventDefault();
          }
          break;
        case 'c':
          if (e.ctrlKey || e.metaKey) {
            // Copy functionality would go here
            e.preventDefault();
          }
          break;
        case 'p':
          if (e.ctrlKey || e.metaKey) {
            // Paste functionality would go here
            e.preventDefault();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [state.selectedItem]);

  const setCurrentTool = useCallback((tool: 'select' | 'align' | 'gridline-vertical' | 'gridline-horizontal') => {
    setState(prev => ({
      ...prev,
      currentTool: tool,
      alignmentStep: 0,
      alignmentReference: null,
      selectedItem: tool === 'select' ? prev.selectedItem : null,
      // Clear all selections when switching away from align mode
      units: tool !== 'align' ? prev.units.map(u => ({ ...u, isSelected: false })) : prev.units,
      gridlines: tool !== 'align' ? prev.gridlines.map(g => ({ ...g, isSelected: false })) : prev.gridlines
    }));
  }, []);

  const getStatusMessage = useCallback(() => {
    switch (state.currentTool) {
      case 'select':
        return "Click to select units and gridlines, or drag from library to add";
      case 'align':
        return state.alignmentStep === 0 
          ? "Step 1: Click a reference gridline (will highlight in blue)" 
          : `Step 2: Click target to align to "${state.alignmentReference?.label}"`;
      case 'gridline-vertical':
        return "Click on canvas to place a vertical gridline";
      case 'gridline-horizontal':
        return "Click on canvas to place a horizontal gridline";
      default:
        return "Ready";
    }
  }, [state.currentTool, state.alignmentStep, state.alignmentReference]);

  const handleCanvasClick = useCallback((x: number, y: number, item: Unit | Gridline | null, shiftKey?: boolean) => {
    if (state.currentTool === 'select') {
      // Clear all selections first
      setState(prev => ({
        ...prev,
        units: prev.units.map(unit => ({ ...unit, isSelected: false })),
        gridlines: prev.gridlines.map(gridline => ({ ...gridline, isSelected: false })),
        selectedItem: null
      }));

      // Select clicked item
      if (item) {
        setState(prev => {
          if ('width' in item) {
            // Unit selected
            return {
              ...prev,
              units: prev.units.map(unit => 
                unit.id === item.id ? { ...unit, isSelected: true } : unit
              ),
              selectedItem: { ...item, isSelected: true }
            };
          } else {
            // Gridline selected
            return {
              ...prev,
              gridlines: prev.gridlines.map(gridline =>
                gridline.id === item.id ? { ...gridline, isSelected: true } : gridline
              ),
              selectedItem: { ...item, isSelected: true }
            };
          }
        });
      }
    } else if (state.currentTool === 'align') {
      if (state.alignmentStep === 0 && item && 'orientation' in item) {
        // First step: select reference gridline and highlight it
        setState(prev => ({
          ...prev,
          alignmentStep: 1,
          alignmentReference: item,
          gridlines: prev.gridlines.map(gridline => ({
            ...gridline,
            isSelected: gridline.id === item.id
          })),
          units: prev.units.map(unit => ({ ...unit, isSelected: false })),
          selectedItem: null
        }));
      } else if (state.alignmentStep === 1 && item) {
        // Second step: align target to reference
        handleAlignment(state.alignmentReference!, item, x, y);
      }
    } else if (state.currentTool === 'gridline-vertical' || state.currentTool === 'gridline-horizontal') {
      // Add new gridline
      const gridlineId = `gridline-${Date.now()}`;
      
      // Determine orientation based on current tool
      const orientation = state.currentTool === 'gridline-vertical' ? 'vertical' : 'horizontal';
      const label = orientation === 'vertical' 
        ? getNextVerticalGridlineLabel(state.gridlines)
        : `H${state.gridlines.filter(g => g.orientation === 'horizontal').length + 1}`;
      
      const newGridline: Gridline = {
        id: gridlineId,
        label,
        orientation,
        position: Math.round(orientation === 'vertical' ? x : y),
        isSelected: false
      };

      setState(prev => ({
        ...prev,
        gridlines: [...prev.gridlines, newGridline]
      }));

      toast({
        title: "Gridline Added",
        description: `${orientation} gridline "${label}" created`
      });
    }
  }, [state.currentTool, state.alignmentStep, state.alignmentReference, state.gridlines, toast]);

  const handleAlignment = useCallback((reference: Gridline, target: Unit | Gridline, clickX?: number, clickY?: number) => {
    if ('orientation' in target) {
      // Gridline to gridline alignment (merge)
      if (reference.orientation === target.orientation) {
        setState(prev => ({
          ...prev,
          gridlines: prev.gridlines.filter(g => g.id !== target.id).map(g => ({ ...g, isSelected: false })),
          units: moveConstrainedUnits(
            { ...reference, position: target.position },
            reference.position,
            prev.units
          ).map(u => ({ ...u, isSelected: false })),
          currentTool: 'select',
          alignmentStep: 0,
          alignmentReference: null,
          selectedItem: null
        }));

        toast({
          title: "Gridlines Merged",
          description: `Gridlines aligned and merged`
        });
      }
    } else {
      // Unit to gridline alignment with side detection
      // If click coordinates are provided, detect which side was clicked
      let side: 'left' | 'right' | 'top' | 'bottom' | 'center' = 'center';
      if (clickX !== undefined && clickY !== undefined) {
        // Convert world coordinates to canvas coordinates
        const canvasX = clickX * state.gridSize * state.zoom + state.panX;
        const canvasY = clickY * state.gridSize * state.zoom + state.panY;
        
        // Calculate distances to each edge
        const unitLeft = target.x * state.gridSize * state.zoom + state.panX;
        const unitTop = target.y * state.gridSize * state.zoom + state.panY;
        const unitWidth = target.width * state.gridSize * state.zoom;
        const unitHeight = target.height * state.gridSize * state.zoom;
        
        const distToLeft = Math.abs(canvasX - unitLeft);
        const distToRight = Math.abs(canvasX - (unitLeft + unitWidth));
        const distToTop = Math.abs(canvasY - unitTop);
        const distToBottom = Math.abs(canvasY - (unitTop + unitHeight));
        
        const edgeThreshold = Math.min(unitWidth, unitHeight) * 0.2;
        
        if (distToLeft < edgeThreshold && distToLeft <= distToRight) side = 'left';
        else if (distToRight < edgeThreshold && distToRight <= distToLeft) side = 'right';
        else if (distToTop < edgeThreshold && distToTop <= distToBottom) side = 'top';
        else if (distToBottom < edgeThreshold && distToBottom <= distToTop) side = 'bottom';
      }
      
      setState(prev => {
        const updatedUnit = { ...target };
        
        if (reference.orientation === 'vertical') {
          switch (side) {
            case 'left':
              updatedUnit.x = reference.position;
              break;
            case 'right':
              updatedUnit.x = reference.position - target.width;
              break;
            default: // center
              updatedUnit.x = reference.position - (target.width / 2);
              break;
          }
        } else {
          switch (side) {
            case 'top':
              updatedUnit.y = reference.position;
              break;
            case 'bottom':
              updatedUnit.y = reference.position - target.height;
              break;
            default: // center
              updatedUnit.y = reference.position - (target.height / 2);
              break;
          }
        }

        return {
          ...prev,
          units: prev.units.map(unit => 
            unit.id === target.id ? updateUnitConstraints(updatedUnit, prev.gridlines) : { ...unit, isSelected: false }
          ),
          gridlines: prev.gridlines.map(g => ({ ...g, isSelected: false })),
          currentTool: 'select',
          alignmentStep: 0,
          alignmentReference: null,
          selectedItem: null
        };
      });

      const sideText = side === 'center' ? 'center' : `${side} edge`;
      toast({
        title: "Unit Aligned",
        description: `Unit ${sideText} aligned to gridline ${reference.label}`
      });
    }
  }, [state.gridSize, state.zoom, state.panX, state.panY, toast]);

  const handleCanvasDrop = useCallback((x: number, y: number, unitTypeData: string) => {
    try {
      const unitType: UnitType = JSON.parse(unitTypeData);
      const unitId = `unit-${Date.now()}`;
      
      const newUnit: Unit = {
        id: unitId,
        name: unitType.name,
        color: unitType.color,
        width: unitType.width,
        height: unitType.height,
        x: Math.round(x),
        y: Math.round(y),
        isSelected: false,
        constraints: {}
      };

      setState(prev => ({
        ...prev,
        units: [...prev.units, updateUnitConstraints(newUnit, prev.gridlines)]
      }));

      toast({
        title: "Unit Added",
        description: `${unitType.name} placed on canvas`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add unit to canvas",
        variant: "destructive"
      });
    }
  }, [state.gridlines, toast]);

  const handleItemDrag = useCallback((item: Unit | Gridline | any, newX: number, newY: number) => {
    setState(prev => {
      // Handle panning
      if (item.type === 'pan') {
        return {
          ...prev,
          panX: prev.panX + item.deltaX,
          panY: prev.panY + item.deltaY
        };
      }
      
      if ('width' in item) {
        // Dragging unit
        const updatedUnit = { ...item, x: newX, y: newY };
        return {
          ...prev,
          units: prev.units.map(unit =>
            unit.id === item.id ? updateUnitConstraints(updatedUnit, prev.gridlines) : unit
          ),
          selectedItem: prev.selectedItem?.id === item.id ? updatedUnit : prev.selectedItem
        };
      } else {
        // Dragging gridline
        const oldPosition = item.position;
        const newPosition = item.orientation === 'vertical' ? newX : newY;
        const updatedGridline = { ...item, position: newPosition };
        
        return {
          ...prev,
          gridlines: prev.gridlines.map(gridline =>
            gridline.id === item.id ? updatedGridline : gridline
          ),
          units: moveConstrainedUnits(updatedGridline, oldPosition, prev.units),
          selectedItem: prev.selectedItem?.id === item.id ? updatedGridline : prev.selectedItem
        };
      }
    });
  }, []);

  const handleUpdateUnit = useCallback((updatedUnit: Unit) => {
    setState(prev => ({
      ...prev,
      units: prev.units.map(unit =>
        unit.id === updatedUnit.id ? updateUnitConstraints(updatedUnit, prev.gridlines) : unit
      ),
      selectedItem: updatedUnit
    }));
  }, []);

  const handleUpdateGridline = useCallback((updatedGridline: Gridline) => {
    setState(prev => ({
      ...prev,
      gridlines: prev.gridlines.map(gridline =>
        gridline.id === updatedGridline.id ? updatedGridline : gridline
      ),
      selectedItem: updatedGridline
    }));
  }, []);

  const handleDuplicateUnit = useCallback((unit: Unit) => {
    const newUnit: Unit = {
      ...unit,
      id: `unit-${Date.now()}`,
      x: unit.x + 2,
      y: unit.y + 2,
      isSelected: false,
      constraints: {}
    };

    setState(prev => ({
      ...prev,
      units: [...prev.units, updateUnitConstraints(newUnit, prev.gridlines)]
    }));

    toast({
      title: "Unit Duplicated",
      description: `${unit.name} copied`
    });
  }, [toast]);

  const handleDeleteItem = useCallback((item: Unit | Gridline) => {
    setState(prev => {
      if ('width' in item) {
        // Delete unit
        return {
          ...prev,
          units: prev.units.filter(unit => unit.id !== item.id),
          selectedItem: prev.selectedItem?.id === item.id ? null : prev.selectedItem
        };
      } else {
        // Delete gridline
        return {
          ...prev,
          gridlines: prev.gridlines.filter(gridline => gridline.id !== item.id),
          selectedItem: prev.selectedItem?.id === item.id ? null : prev.selectedItem
        };
      }
    });

    toast({
      title: "Deleted",
      description: `${'width' in item ? 'Unit' : 'Gridline'} deleted`
    });
  }, [toast]);

  const handleCreateUnit = useCallback((unitType: UnitType) => {
    // Create unit at center of canvas
    const centerX = Math.round((state.canvasWidth / 2 - state.panX) / state.gridSize);
    const centerY = Math.round((state.canvasHeight / 2 - state.panY) / state.gridSize);
    
    handleCanvasDrop(centerX, centerY, JSON.stringify(unitType));
  }, [state.canvasWidth, state.canvasHeight, state.panX, state.panY, state.gridSize, handleCanvasDrop]);

  const handleAddNewUnitType = useCallback(() => {
    const newUnitType: UnitType = {
      id: `unittype-${Date.now()}`,
      name: 'New Unit',
      color: '#6366f1',
      width: 10,
      height: 8
    };

    setState(prev => ({
      ...prev,
      unitTypes: [...prev.unitTypes, newUnitType]
    }));

    setSelectedUnitType(newUnitType);

    toast({
      title: "Unit Type Created",
      description: "New unit type added to library"
    });
  }, [toast]);

  const handleEditUnitType = useCallback((unitType: UnitType) => {
    setState(prev => ({
      ...prev,
      unitTypes: prev.unitTypes.map(ut => ut.id === unitType.id ? unitType : ut)
    }));

    toast({
      title: "Unit Type Updated",
      description: `${unitType.name} updated successfully`
    });
  }, [toast]);

  const handleDeleteUnitType = useCallback((unitTypeId: string) => {
    const unitType = state.unitTypes.find(ut => ut.id === unitTypeId);
    
    setState(prev => {
      // Remove all units that were created from this unit type
      const updatedUnits = prev.units.filter(unit => {
        // Check if this unit matches the unit type being deleted
        return !(unit.name === unitType?.name && 
                unit.color === unitType?.color && 
                unit.width === unitType?.width && 
                unit.height === unitType?.height);
      });

      return {
        ...prev,
        unitTypes: prev.unitTypes.filter(ut => ut.id !== unitTypeId),
        units: updatedUnits,
        selectedItem: prev.selectedItem && updatedUnits.find(u => u.id === prev.selectedItem?.id) ? prev.selectedItem : null
      };
    });
    
    setSelectedUnitType(null);

    const deletedUnitsCount = state.units.filter(unit => 
      unit.name === unitType?.name && 
      unit.color === unitType?.color && 
      unit.width === unitType?.width && 
      unit.height === unitType?.height
    ).length;

    toast({
      title: "Unit Type Deleted",
      description: `${unitType?.name || 'Unit type'} and ${deletedUnitsCount} instance(s) removed`
    });
  }, [state.unitTypes, state.units, toast]);

  const handleImport = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          const importedState = await importFromJSON(file);
          setState(prev => ({ ...prev, ...importedState }));
          toast({
            title: "Import Successful",
            description: "Design imported successfully"
          });
        } catch (error) {
          toast({
            title: "Import Failed",
            description: error instanceof Error ? error.message : "Invalid file format",
            variant: "destructive"
          });
        }
      }
    };
    input.click();
  }, [toast]);

  const handleExport = useCallback(() => {
    exportToJSON(state);
    toast({
      title: "Export Successful", 
      description: "Design exported as JSON file"
    });
  }, [state, toast]);

  const handleZoomIn = useCallback(() => {
    setState(prev => ({ ...prev, zoom: Math.min(prev.zoom * 1.2, 3) }));
  }, []);

  const handleZoomOut = useCallback(() => {
    setState(prev => ({ ...prev, zoom: Math.max(prev.zoom / 1.2, 0.2) }));
  }, []);

  const handleZoom = useCallback((newZoom: number, newPanX: number, newPanY: number) => {
    setState(prev => ({
      ...prev,
      zoom: newZoom,
      panX: newPanX,
      panY: newPanY
    }));
  }, []);

  return (
    <div className="flex h-screen bg-gray-100">
      <UnitLibrary
        unitTypes={state.unitTypes}
        onAddNewUnitType={handleAddNewUnitType}
        onEditUnitType={handleEditUnitType}
        onDeleteUnitType={handleDeleteUnitType}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isCollapsed={libraryCollapsed}
        onToggleCollapse={() => setLibraryCollapsed(!libraryCollapsed)}
        gridSize={state.gridSize}
        zoom={state.zoom}
        selectedUnitType={selectedUnitType}
        onSelectUnitType={setSelectedUnitType}
      />
      
      <div className="flex-1 flex flex-col">
        <TopToolbar
          currentTool={state.currentTool}
          onToolChange={setCurrentTool}
          onImport={handleImport}
          onExport={handleExport}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          zoom={state.zoom}
        />
        
        <div className="flex-1 relative canvas-workspace">
          <CanvasWorkspace
            units={state.units}
            gridlines={state.gridlines}
            currentTool={state.currentTool}
            alignmentStep={state.alignmentStep}
            gridSize={state.gridSize}
            canvasWidth={state.canvasWidth}
            canvasHeight={state.canvasHeight}
            panX={state.panX}
            panY={state.panY}
            zoom={state.zoom}
            statusMessage={getStatusMessage()}
            onCanvasClick={handleCanvasClick}
            onCanvasDrop={handleCanvasDrop}
            onItemDrag={handleItemDrag}
            onZoom={handleZoom}
          />
        </div>
      </div>
      
      {selectedUnitType ? (
        <UnitTypeInspector
          unitType={selectedUnitType}
          onSave={handleEditUnitType}
          onDelete={handleDeleteUnitType}
          onClose={() => setSelectedUnitType(null)}
        />
      ) : (
        <InspectorPanel
          selectedItem={state.selectedItem}
          onUpdateUnit={handleUpdateUnit}
          onUpdateGridline={handleUpdateGridline}
          onDuplicateUnit={handleDuplicateUnit}
          onDeleteItem={handleDeleteItem}
          isCollapsed={inspectorCollapsed}
          onToggleCollapse={() => setInspectorCollapsed(!inspectorCollapsed)}
        />
      )}
    </div>
  );
}
