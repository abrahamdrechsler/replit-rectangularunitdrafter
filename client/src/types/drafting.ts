export interface Unit {
  id: string;
  name: string;
  color: string;
  width: number; // in feet
  height: number; // in feet
  x: number; // in feet
  y: number; // in feet
  isSelected: boolean;
  constraints: {
    left?: string; // gridline id
    right?: string;
    top?: string;
    bottom?: string;
  };
}

export interface UnitType {
  id: string;
  name: string;
  color: string;
  width: number;
  height: number;
}

export interface Gridline {
  id: string;
  label: string;
  orientation: 'vertical' | 'horizontal';
  position: number; // in feet
  isSelected: boolean;
}

export interface AppState {
  units: Unit[];
  unitTypes: UnitType[];
  gridlines: Gridline[];
  selectedItem: Unit | Gridline | null;
  currentTool: 'select' | 'align' | 'gridline-vertical' | 'gridline-horizontal';
  alignmentStep: number;
  alignmentReference: Gridline | null;
  canvasWidth: number;
  canvasHeight: number;
  gridSize: number; // pixels per foot
  zoom: number;
  panX: number;
  panY: number;
}

export interface ExportData {
  schemaVersion: string;
  units: Unit[];
  unitTypes: UnitType[];
  gridlines: Gridline[];
  exportedAt: string;
}
