import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronRight, Copy, Trash2, MousePointer } from 'lucide-react';
import { Unit, Gridline } from '@/types/drafting';

interface InspectorPanelProps {
  selectedItem: Unit | Gridline | null;
  onUpdateUnit: (unit: Unit) => void;
  onUpdateGridline: (gridline: Gridline) => void;
  onDuplicateUnit: (unit: Unit) => void;
  onDeleteItem: (item: Unit | Gridline) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function InspectorPanel({
  selectedItem,
  onUpdateUnit,
  onUpdateGridline,
  onDuplicateUnit,
  onDeleteItem,
  isCollapsed,
  onToggleCollapse
}: InspectorPanelProps) {
  if (isCollapsed) {
    return (
      <div className="w-12 bg-white border-l border-gray-200 flex flex-col items-center py-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="text-gray-500 hover:text-gray-700"
        >
          <ChevronRight className="h-4 w-4 rotate-180" />
        </Button>
      </div>
    );
  }

  const isUnit = selectedItem && 'width' in selectedItem;
  const isGridline = selectedItem && 'orientation' in selectedItem;

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
      {/* Inspector Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Inspector</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="text-gray-500 hover:text-gray-700"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {isUnit && (
          <UnitProperties
            unit={selectedItem as Unit}
            onUpdate={onUpdateUnit}
            onDuplicate={onDuplicateUnit}
            onDelete={onDeleteItem}
          />
        )}
        
        {isGridline && (
          <GridlineProperties
            gridline={selectedItem as Gridline}
            onUpdate={onUpdateGridline}
            onDelete={onDeleteItem}
          />
        )}
        
        {!selectedItem && (
          <div className="p-4 text-center">
            <div className="text-gray-500 text-sm">
              <MousePointer className="mx-auto mb-3 h-8 w-8" />
              <p>Select a unit or gridline to edit properties</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function UnitProperties({
  unit,
  onUpdate,
  onDuplicate,
  onDelete
}: {
  unit: Unit;
  onUpdate: (unit: Unit) => void;
  onDuplicate: (unit: Unit) => void;
  onDelete: (unit: Unit) => void;
}) {
  const handleChange = (field: keyof Unit, value: any) => {
    onUpdate({ ...unit, [field]: value });
  };

  return (
    <div className="p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Unit Properties</h3>
      
      {/* Unit Name */}
      <div className="mb-4">
        <Label htmlFor="unit-name" className="text-xs font-medium text-gray-700 mb-1">
          Name
        </Label>
        <Input
          id="unit-name"
          type="text"
          value={unit.name}
          onChange={(e) => handleChange('name', e.target.value)}
          className="text-sm"
        />
      </div>
      
      {/* Unit Color */}
      <div className="mb-4">
        <Label className="text-xs font-medium text-gray-700 mb-1">Fill Color</Label>
        <div className="flex items-center space-x-2">
          <input
            type="color"
            value={unit.color}
            onChange={(e) => handleChange('color', e.target.value)}
            className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
          />
          <Input
            type="text"
            value={unit.color}
            onChange={(e) => handleChange('color', e.target.value)}
            className="flex-1 text-sm font-mono"
          />
        </div>
      </div>
      
      {/* Unit Dimensions */}
      <div className="mb-4">
        <Label className="text-xs font-medium text-gray-700 mb-2">Dimensions</Label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs text-gray-500 mb-1">Width</Label>
            <div className="flex items-center">
              <Input
                type="number"
                value={unit.width}
                onChange={(e) => handleChange('width', Math.max(1, parseFloat(e.target.value) || 1))}
                className="text-sm"
                min="1"
                step="0.5"
              />
              <span className="ml-1 text-xs text-gray-500">ft</span>
            </div>
          </div>
          <div>
            <Label className="text-xs text-gray-500 mb-1">Height</Label>
            <div className="flex items-center">
              <Input
                type="number"
                value={unit.height}
                onChange={(e) => handleChange('height', Math.max(1, parseFloat(e.target.value) || 1))}
                className="text-sm"
                min="1"
                step="0.5"
              />
              <span className="ml-1 text-xs text-gray-500">ft</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Unit Position */}
      <div className="mb-6">
        <Label className="text-xs font-medium text-gray-700 mb-2">Position</Label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs text-gray-500 mb-1">X</Label>
            <div className="flex items-center">
              <Input
                type="number"
                value={unit.x}
                onChange={(e) => handleChange('x', Math.max(0, parseFloat(e.target.value) || 0))}
                className="text-sm"
                min="0"
                step="0.5"
              />
              <span className="ml-1 text-xs text-gray-500">ft</span>
            </div>
          </div>
          <div>
            <Label className="text-xs text-gray-500 mb-1">Y</Label>
            <div className="flex items-center">
              <Input
                type="number"
                value={unit.y}
                onChange={(e) => handleChange('y', Math.max(0, parseFloat(e.target.value) || 0))}
                className="text-sm"
                min="0"
                step="0.5"
              />
              <span className="ml-1 text-xs text-gray-500">ft</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Constraints */}
      <div className="mb-6">
        <Label className="text-xs font-medium text-gray-700 mb-2">Constraints</Label>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Left edge</span>
            <span className={`text-xs ${unit.constraints.left ? 'text-blue-600 font-mono' : 'text-gray-400'}`}>
              {unit.constraints.left || 'Unconstrained'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Right edge</span>
            <span className={`text-xs ${unit.constraints.right ? 'text-blue-600 font-mono' : 'text-gray-400'}`}>
              {unit.constraints.right || 'Unconstrained'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Top edge</span>
            <span className={`text-xs ${unit.constraints.top ? 'text-blue-600 font-mono' : 'text-gray-400'}`}>
              {unit.constraints.top || 'Unconstrained'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Bottom edge</span>
            <span className={`text-xs ${unit.constraints.bottom ? 'text-blue-600 font-mono' : 'text-gray-400'}`}>
              {unit.constraints.bottom || 'Unconstrained'}
            </span>
          </div>
        </div>
      </div>
      
      {/* Actions */}
      <div className="space-y-2">
        <Button
          onClick={() => onDuplicate(unit)}
          className="w-full bg-blue-600 text-white hover:bg-blue-700"
          size="sm"
        >
          <Copy className="mr-2 h-4 w-4" />
          Duplicate
        </Button>
        <Button
          onClick={() => onDelete(unit)}
          variant="destructive"
          className="w-full"
          size="sm"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </Button>
      </div>
    </div>
  );
}

function GridlineProperties({
  gridline,
  onUpdate,
  onDelete
}: {
  gridline: Gridline;
  onUpdate: (gridline: Gridline) => void;
  onDelete: (gridline: Gridline) => void;
}) {
  const handleChange = (field: keyof Gridline, value: any) => {
    onUpdate({ ...gridline, [field]: value });
  };

  return (
    <div className="p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Gridline Properties</h3>
      
      <div className="mb-4">
        <Label htmlFor="gridline-label" className="text-xs font-medium text-gray-700 mb-1">
          Label
        </Label>
        <Input
          id="gridline-label"
          type="text"
          value={gridline.label}
          onChange={(e) => handleChange('label', e.target.value)}
          className="text-sm"
        />
      </div>
      
      <div className="mb-4">
        <Label className="text-xs font-medium text-gray-700 mb-1">Position</Label>
        <div className="flex items-center">
          <Input
            type="number"
            value={gridline.position}
            onChange={(e) => handleChange('position', Math.max(0, parseFloat(e.target.value) || 0))}
            className="text-sm"
            min="0"
            step="0.5"
          />
          <span className="ml-1 text-xs text-gray-500">ft</span>
        </div>
      </div>
      
      <div className="mb-6">
        <Label className="text-xs font-medium text-gray-700 mb-2">Orientation</Label>
        <div className="text-sm text-gray-600 capitalize">
          {gridline.orientation}
        </div>
      </div>
      
      <Button
        onClick={() => onDelete(gridline)}
        variant="destructive"
        className="w-full"
        size="sm"
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Delete Gridline
      </Button>
    </div>
  );
}
