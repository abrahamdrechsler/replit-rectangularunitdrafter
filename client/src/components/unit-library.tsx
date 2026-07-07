import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, ChevronLeft, GripVertical } from 'lucide-react';
import { UnitType } from '@/types/drafting';

interface UnitLibraryProps {
  unitTypes: UnitType[];
  onAddNewUnitType: () => void;
  onEditUnitType: (unitType: UnitType) => void;
  onDeleteUnitType: (unitTypeId: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  gridSize: number;
  zoom: number;
  selectedUnitType: UnitType | null;
  onSelectUnitType: (unitType: UnitType | null) => void;
}

export function UnitLibrary({
  unitTypes,
  onAddNewUnitType,
  onEditUnitType,
  onDeleteUnitType,
  searchQuery,
  onSearchChange,
  isCollapsed,
  onToggleCollapse,
  gridSize,
  zoom,
  selectedUnitType,
  onSelectUnitType
}: UnitLibraryProps) {
  const filteredUnitTypes = unitTypes.filter(unitType =>
    unitType.name.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => a.name.localeCompare(b.name));

  const handleDragStart = (e: React.DragEvent, unitType: UnitType) => {
    e.dataTransfer.setData('application/json', JSON.stringify(unitType));
    e.dataTransfer.effectAllowed = 'copy';
    
    // Create a simple transparent drag image to hide browser default
    const img = new Image();
    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=';
    e.dataTransfer.setDragImage(img, 0, 0);
    
    // Notify canvas about the unit type being dragged
    window.dispatchEvent(new CustomEvent('unitDragStart', { detail: unitType }));
  };

  if (isCollapsed) {
    return (
      <div className="w-12 bg-white border-r border-gray-200 flex flex-col items-center py-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="text-gray-500 hover:text-gray-700"
        >
          <ChevronLeft className="h-4 w-4 rotate-180" />
        </Button>
      </div>
    );
  }

  return (
    <div className="w-60 bg-white border-r border-gray-200 flex flex-col">
      {/* Library Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Unit Library</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="text-gray-500 hover:text-gray-700"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search units..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 text-sm"
          />
        </div>
      </div>
      
      {/* Unit List */}
      <div className="flex-1 overflow-y-auto p-2">
        {filteredUnitTypes.map((unitType) => (
          <div
            key={unitType.id}
            className={`unit-item p-3 mb-2 rounded-lg border cursor-grab active:cursor-grabbing transition-colors ${
              selectedUnitType?.id === unitType.id
                ? 'bg-blue-50 border-blue-300'
                : 'bg-gray-50 border-gray-200 hover:bg-blue-50'
            }`}
            draggable
            onDragStart={(e) => handleDragStart(e, unitType)}
            onClick={() => onSelectUnitType(unitType)}
          >
            <div className="flex items-center">
              <div 
                className="w-4 h-4 rounded border-2 mr-3"
                style={{ 
                  borderColor: unitType.color,
                  backgroundColor: `${unitType.color}33`
                }}
              />
              <div className="flex-1">
                <div className="font-medium text-sm text-gray-900">{unitType.name}</div>
                <div className="text-xs text-gray-500">{unitType.width}' × {unitType.height}'</div>
              </div>
              <GripVertical className="text-gray-400 h-4 w-4" />
            </div>
          </div>
        ))}
        
        {filteredUnitTypes.length === 0 && (
          <div className="text-center text-gray-500 text-sm py-8">
            {searchQuery ? 'No units found' : 'No units available'}
          </div>
        )}
      </div>
      
      {/* Add New Unit Button */}
      <div className="p-4 border-t border-gray-200">
        <Button
          onClick={onAddNewUnitType}
          className="w-full bg-blue-600 text-white hover:bg-blue-700"
          size="sm"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Unit
        </Button>
      </div>
    </div>
  );
}
