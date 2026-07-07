import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Save, X } from 'lucide-react';
import { UnitType } from '@/types/drafting';

interface UnitTypeInspectorProps {
  unitType: UnitType | null;
  onSave: (unitType: UnitType) => void;
  onDelete: (unitTypeId: string) => void;
  onClose: () => void;
}

export function UnitTypeInspector({
  unitType,
  onSave,
  onDelete,
  onClose
}: UnitTypeInspectorProps) {
  const [editingUnitType, setEditingUnitType] = useState<UnitType | null>(unitType);

  React.useEffect(() => {
    setEditingUnitType(unitType);
  }, [unitType]);

  if (!editingUnitType) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Unit Type Inspector</h2>
        </div>
        <div className="flex-1 flex items-center justify-center text-gray-500">
          Select a unit type to edit its properties
        </div>
      </div>
    );
  }

  const handleSave = () => {
    if (editingUnitType) {
      onSave(editingUnitType);
    }
  };

  const handleDelete = () => {
    if (editingUnitType) {
      onDelete(editingUnitType.id);
      onClose();
    }
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Unit Type Inspector</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 p-4 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="unit-name">Name</Label>
          <Input
            id="unit-name"
            value={editingUnitType.name}
            onChange={(e) => setEditingUnitType({
              ...editingUnitType,
              name: e.target.value
            })}
            placeholder="Unit name"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="unit-width">Width (feet)</Label>
            <Input
              id="unit-width"
              type="number"
              min="1"
              value={editingUnitType.width}
              onChange={(e) => setEditingUnitType({
                ...editingUnitType,
                width: parseInt(e.target.value) || 1
              })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="unit-height">Height (feet)</Label>
            <Input
              id="unit-height"
              type="number"
              min="1"
              value={editingUnitType.height}
              onChange={(e) => setEditingUnitType({
                ...editingUnitType,
                height: parseInt(e.target.value) || 1
              })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="unit-color">Color</Label>
          <div className="flex items-center space-x-2">
            <input
              id="unit-color"
              type="color"
              value={editingUnitType.color}
              onChange={(e) => setEditingUnitType({
                ...editingUnitType,
                color: e.target.value
              })}
              className="w-12 h-8 rounded border border-gray-300 cursor-pointer"
            />
            <Input
              value={editingUnitType.color}
              onChange={(e) => setEditingUnitType({
                ...editingUnitType,
                color: e.target.value
              })}
              placeholder="#000000"
              className="flex-1"
            />
          </div>
        </div>

        {/* Preview */}
        <div className="space-y-2">
          <Label>Preview</Label>
          <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
            <div
              className="mx-auto border-2 rounded"
              style={{
                width: `${Math.max(20, editingUnitType.width * 4)}px`,
                height: `${Math.max(20, editingUnitType.height * 4)}px`,
                backgroundColor: `${editingUnitType.color}33`,
                borderColor: editingUnitType.color
              }}
            />
            <div className="text-center text-xs text-gray-600 mt-2">
              {editingUnitType.width}' × {editingUnitType.height}'
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-gray-200 space-y-2">
        <Button
          onClick={handleSave}
          className="w-full bg-blue-600 text-white hover:bg-blue-700"
        >
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
        <Button
          onClick={handleDelete}
          variant="outline"
          className="w-full text-red-600 border-red-200 hover:bg-red-50"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Unit Type
        </Button>
      </div>
    </div>
  );
}