import { AppState, ExportData } from '@/types/drafting';

const STORAGE_KEY = 'rudt-state';
const SCHEMA_VERSION = '1.0.0';

export const saveToLocalStorage = (state: Partial<AppState>) => {
  try {
    const data: ExportData = {
      schemaVersion: SCHEMA_VERSION,
      units: state.units || [],
      unitTypes: state.unitTypes || [],
      gridlines: state.gridlines || [],
      exportedAt: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn('Failed to save to localStorage:', error);
  }
};

export const loadFromLocalStorage = (): Partial<AppState> | null => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;
    
    const data: ExportData = JSON.parse(saved);
    
    // Validate schema version
    if (data.schemaVersion !== SCHEMA_VERSION) {
      console.warn('Schema version mismatch, skipping load');
      return null;
    }
    
    return {
      units: data.units || [],
      unitTypes: data.unitTypes || [],
      gridlines: data.gridlines || []
    };
  } catch (error) {
    console.warn('Failed to load from localStorage:', error);
    return null;
  }
};

export const exportToJSON = (state: Partial<AppState>): void => {
  const data: ExportData = {
    schemaVersion: SCHEMA_VERSION,
    units: state.units || [],
    unitTypes: state.unitTypes || [],
    gridlines: state.gridlines || [],
    exportedAt: new Date().toISOString()
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `rudt-export-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

export const importFromJSON = (file: File): Promise<Partial<AppState>> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data: ExportData = JSON.parse(e.target?.result as string);
        
        // Validate schema version
        if (data.schemaVersion !== SCHEMA_VERSION) {
          reject(new Error('Incompatible schema version'));
          return;
        }
        
        resolve({
          units: data.units || [],
          unitTypes: data.unitTypes || [],
          gridlines: data.gridlines || []
        });
      } catch (error) {
        reject(new Error('Invalid JSON file format'));
      }
    };
    reader.readAsText(file);
  });
};
