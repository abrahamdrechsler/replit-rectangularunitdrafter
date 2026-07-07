import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  MousePointer, 
  AlignLeft, 
  Minus,
  FolderOpen,
  Download,
  ZoomIn,
  ZoomOut
} from 'lucide-react';

interface TopToolbarProps {
  currentTool: 'select' | 'align' | 'gridline-vertical' | 'gridline-horizontal';
  onToolChange: (tool: 'select' | 'align' | 'gridline-vertical' | 'gridline-horizontal') => void;
  onImport: () => void;
  onExport: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  zoom: number;
}

export function TopToolbar({
  currentTool,
  onToolChange,
  onImport,
  onExport,
  onZoomIn,
  onZoomOut,
  zoom
}: TopToolbarProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        
        {/* Left: File Operations */}
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onImport}
            className="text-gray-700 hover:bg-gray-100"
          >
            <FolderOpen className="mr-1.5 h-4 w-4" />
            Import
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onExport}
            className="text-gray-700 hover:bg-gray-100"
          >
            <Download className="mr-1.5 h-4 w-4" />
            Export
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              localStorage.removeItem('rudt-state');
              window.location.reload();
            }}
            className="text-red-600 hover:bg-red-50"
            title="Clear saved data and reset"
          >
            Reset
          </Button>
        </div>
        
        {/* Center: Drawing Tools */}
        <div className="flex items-center space-x-1 bg-gray-50 p-1 rounded-lg">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToolChange('select')}
            className={`px-3 py-1.5 ${
              currentTool === 'select'
                ? 'bg-blue-100 text-blue-700 shadow-sm'
                : 'text-gray-700 hover:bg-white hover:shadow-sm'
            }`}
            title="Select (V)"
          >
            <MousePointer className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToolChange('align')}
            className={`px-3 py-1.5 ${
              currentTool === 'align'
                ? 'bg-blue-100 text-blue-700 shadow-sm'
                : 'text-gray-700 hover:bg-white hover:shadow-sm'
            }`}
            title="Align Tool (A)"
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToolChange('gridline-vertical')}
            className={`px-3 py-1.5 ${
              currentTool === 'gridline-vertical'
                ? 'bg-blue-100 text-blue-700 shadow-sm'
                : 'text-gray-700 hover:bg-white hover:shadow-sm'
            }`}
            title="Add Vertical Gridline (G)"
          >
            <Minus className="h-4 w-4 rotate-90" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToolChange('gridline-horizontal')}
            className={`px-3 py-1.5 ${
              currentTool === 'gridline-horizontal'
                ? 'bg-blue-100 text-blue-700 shadow-sm'
                : 'text-gray-700 hover:bg-white hover:shadow-sm'
            }`}
            title="Add Horizontal Gridline (H)"
          >
            <Minus className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Right: View Options */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">{Math.round(zoom * 100)}%</span>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onZoomOut}
              className="p-1.5 text-gray-500 hover:text-gray-700"
              title="Zoom Out (-)"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onZoomIn}
              className="p-1.5 text-gray-500 hover:text-gray-700"
              title="Zoom In (+)"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
          <span className="text-sm text-gray-600">Pan: Click + Drag</span>
        </div>
      </div>
    </div>
  );
}
