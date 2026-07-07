# Rectangular Unit Drafting Tool (RUDT)

## Overview

This is a browser-based drafting application for creating and managing rectangular units on a 1-foot grid system. The application is built as a full-stack web application with a React frontend and Express backend, designed to be deployed on Replit as a static site with optional server functionality.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS custom properties for theming
- **State Management**: React hooks with local state management
- **Data Fetching**: TanStack Query for server state management
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Runtime**: Node.js with ES modules
- **Database**: Drizzle ORM configured for PostgreSQL (currently using in-memory storage)
- **Session Management**: Basic session middleware setup
- **Development**: Hot module replacement via Vite integration

### Canvas Rendering
- **Graphics**: HTML5 Canvas for drawing the grid, units, and gridlines
- **Grid System**: 1-foot increments with pixel-to-feet conversion utilities
- **Interaction**: Mouse events for dragging, selecting, and manipulating objects

## Key Components

### Core Application Components
1. **DraftingTool** (`/pages/drafting-tool.tsx`) - Main application orchestrator
2. **CanvasWorkspace** - Canvas rendering and interaction handling
3. **UnitLibrary** - Sidebar for managing unit types and templates
4. **InspectorPanel** - Property editor for selected objects
5. **TopToolbar** - Tool selection and file operations

### Data Models
- **Unit**: Rectangular objects with position, dimensions, constraints, and styling
- **UnitType**: Templates for creating new units
- **Gridline**: Reference lines for alignment (vertical/horizontal)
- **AppState**: Central state management for the entire application

### Canvas System
- **Grid Rendering**: Visual 1-foot grid with configurable spacing
- **Object Interaction**: Click detection, drag handling, and selection management
- **Alignment Tools**: Two-step alignment process for precision positioning
- **Constraint System**: Single and double-lock constraints between units and gridlines

## Data Flow

### State Management
1. **Local State**: React useState for immediate UI interactions
2. **Persistence**: localStorage for session persistence with JSON schema versioning
3. **Import/Export**: JSON file format for sharing layouts
4. **Real-time Updates**: Direct state mutations with immediate canvas re-rendering

### User Interactions
1. **Tool Selection**: Mode-based interaction (select, align, gridline)
2. **Object Manipulation**: Direct drag operations with grid snapping
3. **Library Operations**: Drag-and-drop from unit library to canvas
4. **Keyboard Shortcuts**: Arrow keys, copy/paste, delete, and tool switching

### Canvas Rendering Pipeline
1. **Grid Base Layer**: Static 1-foot grid rendering
2. **Gridlines**: Dynamic reference lines with labels
3. **Units**: Rectangular objects with fill colors and borders
4. **Selection Indicators**: Visual feedback for selected objects
5. **Interactive Overlays**: Hover states and manipulation handles

## External Dependencies

### UI Framework Dependencies
- **Radix UI**: Complete set of unstyled, accessible UI primitives
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens
- **Lucide React**: Icon library for consistent iconography
- **Class Variance Authority**: Type-safe component variants

### Development Dependencies
- **TypeScript**: Static typing for improved developer experience
- **Vite**: Fast build tool with HMR and optimization
- **PostCSS**: CSS processing for Tailwind compilation
- **ESBuild**: Fast JavaScript bundling for production

### Data Management
- **Drizzle ORM**: Type-safe database toolkit (configured for PostgreSQL)
- **Zod**: Schema validation for data integrity
- **TanStack Query**: Server state management and caching

## Deployment Strategy

### Static Site Deployment (Primary)
- **Target**: Replit Static Deployment
- **Build Output**: `dist/public` directory with static assets
- **Client-Side**: Full application functionality in browser
- **Storage**: localStorage for persistence, JSON export/import for data portability

### Full-Stack Deployment (Optional)
- **Server**: Express.js backend for enhanced features
- **Database**: PostgreSQL with Drizzle ORM migrations
- **Environment**: NODE_ENV-based configuration switching
- **Development**: Vite dev server with Express API integration

### Configuration Management
- **Environment Variables**: DATABASE_URL for PostgreSQL connection
- **Build Scripts**: Separate development and production build processes
- **Asset Handling**: Vite-managed static assets with proper path resolution
- **Hot Reloading**: Development-only features with production optimization

The application is designed to work primarily as a client-side application with optional server enhancement, making it suitable for both simple static hosting and full-stack deployment scenarios.