# Rectangular Unit Drafting Tool (RUDT) – Product Requirements Document

## 1 · Purpose & Vision

Build a lightweight, **browser‑only** drafting environment—deployable as a *static site* on Replit—that lets users place, align, and manage rectangular **Units** on a 1‑ft grid. The MVP focuses on speed of implementation, offline persistence via JSON, and a clear upgrade path toward richer CAD/BIM features (rooms, 3‑D, collaboration) without overwhelming early builders.

## 2 · Goals & Success Criteria

| Goal                                                  | Metric                                                         |
| ----------------------------------------------------- | -------------------------------------------------------------- |
| Draw & edit Units on grid                             | First‑time user places & drags Unit in <30 s                   |
| Lock Units to gridlines & move/ stretch via alignment | Alignment interaction <2 clicks, visual feedback within 100 ms |
| Persist layouts locally                               | Export / Import JSON round‑trip with zero data loss            |
| Runs smoothly on low‑spec laptop                      | ≥30 fps while dragging ≤100 Units                              |

## 3 · Scope (MVP)

- **Single‑page app** (`index.html` + JS/CSS) served via **Replit Static Deployment**.
- **Grid**: fixed 1‑ft increments, visible snap.
- **Unit**: single rectangle with editable **name** & **transparent fill color**; min size 1×1 cell; unlimited stretch.
- **Unit Library**: left drawer listing saved Unit types; drag or copy/paste adds **linked instances** (edits to source ripple).
- **Gridlines**: infinite vertical/horizontal reference lines; create, move, duplicate; vertical lines auto‑label **A, B, C…**; horizontal remain unlabeled unless selected.
- **Align Tool**: two‑step (reference → target); supports gridline↔Unit edge and gridline↔gridline (merging). Parallel lines only.
- **Constraint Behaviour**
  - **Single‑lock**: moving gridline translates Unit.
  - **Double‑lock** (Unit edges locked to two gridlines): moving one gridline stretches Unit orthogonally.
- **Click precedence**: Unit edges/area capture clicks before overlapping gridlines.
- **Hotkeys**: `←↑↓→` move; **Delete**; **Ctrl/Cmd‑C /‑V** copy‑paste; **A** enter Align mode.
- **No undo/redo** in MVP.
- **Persistence**: `localStorage` for live state; JSON **export / import** buttons in top bar (schema includes `schemaVersion`).

## 4 · Out of Scope / Future Considerations

- Internal **room compositions** inside Units.
- 3‑D visualization or wall attributes.
- Multi‑page navigation or server‑side components.
- Cloud databases, real‑time collaboration, or authentication.
- Comprehensive undo/redo stack.
- Advanced snapping/constraints (angle, midpoint) beyond axis‑aligned.
- SVG/Canvas performance tuning for >100 Units.

## 5 · Functional Requirements

### 5.1 Canvas & Grid

- Fixed cell size (1 ft); rendered with subtle line weight.
- Mouse pan & scroll zoom (future stretch goal; optional v1).

### 5.2 Units

- **Create** via Library drag or paste.
- **Select** opens right‑hand Inspector (name, color, delete).
- **Move** via drag or arrow keys (snaps to grid).
- **Stretch** by dragging unit edges when selected (maintains lock logic).
- Name tag centered; color fill 20 % opacity.

### 5.3 Unit Library

- Drawer width 240 px; searchable list sorted A‑Z.
- Each entry shows color swatch + name + dimensions.

### 5.4 Gridlines

- Toolbar button “Add Gridline” prompts X or Y orientation; click canvas to place.
- Drag or arrow‑move (1‑cell increments).
- Selecting a gridline highlights itself and any locked Unit edges.

### 5.5 Align Tool Workflow

1. Press **A** or click Align icon.
2. “Select reference line” tooltip; valid: gridline.
3. “Select target edge” tooltip; valid edge highlighted on hover.
4. If parallel → translate target so edges coincide.
5. If gridline chosen as target → merge with reference into shared line.

### 5.6 Import / Export JSON

- **Download**: serialises Units, gridlines, library entries, `schemaVersion`.
- **Upload**: `<input type="file">` + `FileReader` parses JSON, replaces current state after confirmation.

## 6 · Non‑Functional Requirements

| Topic                 | Requirement                                                                |
| --------------------- | -------------------------------------------------------------------------- |
| **Hosting**           | Replit **Static Deployment**; `.replit` rewrite `/* → /index.html` for SPA |
| **Build script**      | NPM not required—vanilla JS; optional bundler (Vite) accepted              |
| **Browser support**   | Latest Chrome, Edge, and Firefox desktop                                   |
| **Persistence quota** | Fits within typical 5 MiB `localStorage` limit                             |
| **Security**          | No Secrets needed; HTTPS via `*.repl.co` or custom domain                  |
| **Performance**       | <200 ms blocking script; ≥30 fps drag under 100 Units                      |

## 7 · User Stories (MoSCoW)

- **Must**: *As a user, I can drag a Unit from the library onto the grid so I can start a layout.*
- **Must**: *As a user, I can lock the left edge of a Unit to a gridline so it stays aligned.*
- **Must**: *As a user, I can export my design to a JSON file so I can share it.*
- **Should**: *As a user, I can merge two gridlines so neighbouring Units share a boundary.*
- **Could**: *As a user, I can zoom the canvas for large sites.*
- **Won’t (v1)**: multi‑select modify, free‑rotation.

## 8 · Acceptance Criteria

1. New user tutorial demo passes in under 3 minutes.
2. Editing source Unit name updates tags on existing instances instantly.
3. Moving shared gridline translates at least two linked Units together with no overlap glitch.
4. JSON export → fresh browser → JSON import reproduces scene pixel‑perfect.

## 9 · Tech Stack & Project Layout

```
└─ public/
   ├─ index.html
   ├─ style.css
   ├─ app.js           (state, render, events)
   ├─ assets/
   └─ data/schema.json (example export)
```

- Optional: Vite‐powered dev server; configure in `.replit`.

## 10 · Risks & Mitigations

- **LocalStorage eviction** – notify user when reaching 80 % quota; encourage export.
- **Performance degradation** – throttle drag re‑renders on low FPS.

## 11 · Glossary

- **Unit** – Rectangular grouping object saved in library; instances stay linked.
- **Gridline** – Infinite axis‑aligned reference plane; can be shared.
- **Linked Instance** – Copy of a Unit that inherits future edits to its source.

---

*Last updated: 2025‑07‑19*

