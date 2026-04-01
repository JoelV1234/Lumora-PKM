**Project Name**: Lumora
**License**: Open Source (MIT or AGPL recommended)  
**Type**: Personal Knowledge Management Studio (inspired by Capacities)  
**Key Constraints**:  
- No AI features whatsoever  
- Completely free – no payments, no premium tiers  
- Everything must be available to all users  
- Strong focus on data ownership and portability  

### 1. Purpose & High-Level Description
The app is a **calm, fast, and joyful second brain** for individuals.  
Users capture thoughts in **Daily Notes**, create **Objects** (structured items like notes, people, books, projects), and connect them with **bi-directional links**.  

The app helps users build a personal web of knowledge that is easy to search, browse, and explore over years.  

**Design Philosophy** (MUST be reflected in every screen):  
- Sleek, modern, and minimalist  
- Calm and focused atmosphere  
- Fast, fluid, and delightful to use  
- High attention to typography, spacing, and micro-interactions  

### 2. Core Concepts (MUST implement)
- **Object**: The fundamental unit. Everything is an Object.  
- **Object Type**: Template that defines properties and icon for a kind of Object.  
- **Property**: Structured field on an Object.  
- **Bi-directional Link**: Automatic backlinks.  
- **Daily Note**: Auto-created daily inbox.  
- **Graph View**: Visual 2D map of connections.  

### 3. Functional Requirements

#### 3.1 Capture & Daily Workflow (MUST)
- App automatically creates one Daily Note per day.  
- Users can write freely in Daily Notes using a block-based editor.  
- Users can turn any text block in a Daily Note into a new Object of chosen type.  
- Quick capture supported via: mobile share sheet, browser extension, desktop keyboard shortcuts.  
- Web clipper: save webpage URL + highlighted text as a new Object (with source metadata).  
- Photo and screenshot capture creates a Media Object.  

#### 3.2 Objects & Structure (MUST)
- Built-in Object Types (at minimum): Note, Person, Book, Project, Meeting, Task, Event, Highlight, Image, Link, Idea.  
- Users can create unlimited custom Object Types with custom icons and properties.  
- Supported Property Types: single-line text, multi-line text, date, date range, number, checkbox, select, multi-select, relation, URL, email, tags.  
- Every Object uses a block-based editor.  
- Users can link Objects using @mentions or direct link picker.  
- Automatic backlinks panel and unlinked mentions panel.  

#### 3.3 Organization & Views (MUST)
- Users can create Collections / Saved Views based on filters.  
- View types: List, Table, Gallery/Card, Calendar, Kanban.  
- Filters and sorting on any property.  
- Interactive 2D Graph View with zoom and pan.  
- Side panel for backlinks and related objects.  

#### 3.4 Tasks & Projects (SHOULD)
- Tasks as native Objects or checkboxes inside Objects.  
- Simple task overview: Today, Upcoming, All open tasks.  
- Projects link to tasks, notes, and people.  

#### 3.5 Search & Navigation (MUST)
- Fast full-text search.  
- Filter search by Object Type or properties.  
- Command palette for quick jump to any Object.  
- Recent Objects list and type-based browsing.  

#### 3.6 Editor & Content (MUST)
- Clean block editor with support for images, PDFs, embeds.  
- Simple version history per Object.  
- Full export as Markdown, PDF, JSON, CSV.  

### 4. Sleek & Modern UI/UX Requirements (MUST)

#### 4.1 Overall Visual Style
- **Modern minimalist aesthetic**: generous whitespace, clean lines, subtle shadows, and soft rounded corners (border-radius 8–12px).  
- **Premium feel**: high-quality typography, smooth animations, and refined micro-interactions.  
- **Calm color palette**: soft neutrals, subtle accents (e.g., deep indigo, teal, or emerald as primary accent). Users can choose between Light and Dark themes with multiple subtle variants.  
- **Typography**: Use a modern sans-serif font stack (e.g., Inter, SF Pro, or system-ui). Headings are bold but not heavy; body text is highly readable with good line height (1.6).  
- **Icons**: Clean, consistent, modern icon set (e.g., Lucide or Phosphor Icons). All icons are stroke-based, 20–24px, with subtle hover animations.

#### 4.2 Layout & Navigation
- **Sidebar navigation** (collapsible on desktop): Home, Daily Notes, Graph, Search, Objects (by type), Collections.  
- **Top bar**: Minimal – shows current object title, quick search, command palette trigger, and user settings.  
- **Command Palette** (⌘K): Sleek, modern overlay with smooth fade-in, categorized results, and keyboard navigation.  
- **Responsive design**: Beautiful on mobile, tablet, and desktop. Mobile uses bottom navigation or slide-out menu.  
- **Side panel**: Contextual panel on the right (or left in RTL) that slides in smoothly. Shows backlinks, linked objects, and properties. Can be resized or toggled.  

#### 4.3 Interactions & Animations
- **Fluid micro-interactions**: Buttons have subtle scale + opacity changes on hover/press. Objects and cards lift slightly on hover.  
- **Smooth transitions**: All view changes, panel openings, and graph interactions use 200–300ms ease-out animations.  
- **Drag & drop**: Modern drag handles with ghosting effect for reordering blocks, moving objects between views, or linking.  
- **Focus states**: Clear, glowing focus rings with accent color for accessibility and modern look.  
- **Loading states**: Elegant skeleton loaders instead of spinners where appropriate.  

#### 4.4 Editor Experience
- **Distraction-free editor**: Full bleed mode option with clean typing experience.  
- **Inline toolbar**: Appears contextually with subtle fade and modern styling when text is selected.  
- **Block handles**: Subtle drag handle appears on hover for each block.  
- **Property editor**: Modern form-like interface with clean cards for editing object properties.  

#### 4.5 Graph View UI
- **Sleek graph visualization**: Nodes with soft glow, elegant curved edges, zoom with smooth momentum.  
- **Modern styling**: Nodes show object icon + title; color-coded by object type.  
- **Interactive controls**: Floating toolbar with filter, search nodes, fit-to-screen, and export as image.  

#### 4.6 Themes & Customization
- **Built-in themes**: Light, Dark, and one or two soft accent themes (e.g., “Indigo”, “Teal”, “Emerald”).  
- **High contrast mode** for accessibility.  
- **Custom accent color picker** (optional stretch).  

### 5. Platforms & Technical Requirements (MUST)
- Web version as Progressive Web App (PWA) with offline support.  
- Desktop apps (Mac, Windows, Linux).  
- Mobile apps (iOS & Android) with native feel.  
- Local-first architecture.  
- Full offline mode.  
- Keyboard shortcuts for all major actions.  

### 6. Non-Functional Requirements (MUST)
- Performance: Fast and responsive even with thousands of Objects.  
- UI must feel premium and modern on every platform.  
- Privacy: No telemetry, no tracking.  
- Data portability: Easy full export.  
- Accessibility: Keyboard navigation, ARIA labels, focus management.  
- Open Source: All code publicly available.  

### 7. Stretch / Optional Features (MAY)
- Multiple Spaces.  
- Simple habit trackers.  
- Spatial canvas view.  
- Plugin system.  

### 8. Out of Scope
- Any AI or LLM features.  
- Team collaboration.  
- Payments or monetization. 