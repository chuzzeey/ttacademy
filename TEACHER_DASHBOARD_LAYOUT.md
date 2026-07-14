# Teacher Dashboard Layout Documentation

## Overview
The teacher dashboard (`app/teachers/[course]/page.tsx`) is a responsive layout that adapts across different screen sizes. This document focuses on the **md** (768px) and **lg** (1024px) breakpoints.

---

## Breakpoint Definitions

- **md**: 768px and above
- **lg**: 1024px and above

---

## Layout Structure

### 1. Sidebar Navigation

#### Mobile (< md)
- **Hidden by default** (`-translate-x-full`)
- Slides in from left when hamburger menu is clicked
- Overlay backdrop appears (`bg-black/50`)
- Width: `w-72` (288px)
- Close button visible

#### md Breakpoint (768px - 1023px)
- **Persistent sidebar** (always visible)
- Position: `static` (part of normal flow)
- No overlay backdrop
- Width: `w-64` (256px)
- Close button hidden (`md:hidden`)
- Main content offset: `md:ml-64`

#### lg Breakpoint (1024px+)
- **Persistent sidebar** (always visible)
- Position: `static`
- Width: `w-72` (288px) - slightly wider for breathing room
- Main content offset: `xl:ml-72`

**Sidebar Components:**
```
┌─────────────────────┐
│ Course Icon + Title │  ← Course branding header
│ "Data Science"      │
│ "Mentor Dashboard"  │
├─────────────────────┤
│ User Profile        │  ← Avatar + Name + Role
│ [M] Mentor          │
│ Data Science Teacher│
├─────────────────────┤
│ 🏠 Dashboard        │  ← Navigation items
│ 📚 My Courses       │
│ 👤 Profile          │
│ ⚙️  Settings         │
├─────────────────────┤
│ 🚪 Sign Out         │  ← Bottom action
└─────────────────────┘
```

---

### 2. Main Content Area

#### Layout Flow
```
┌──────────────────────────────────────────────────────┐
│ Top Bar (sticky)                                     │
│ [← Back]                    [🔔] [M]                │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Hero Section (gradient background)                  │
│  ┌──────┐                                           │
│  │ Icon │ Welcome, Mentor                            │
│  └──────┘ You are the teacher for Data Science       │
│                                                      │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ┌─────────────────┐  ┌─────────────────┐          │
│  │ Send            │  │ Share           │          │
│  │ Announcement    │  │ Resources       │          │
│  │                 │  │                 │          │
│  │ [Title Input]   │  │ [Link Title]    │          │
│  │ [Message Box]   │  │ [Paste Link]    │          │
│  │                 │  │                 │          │
│  │ [Send Button]   │  │ [Add Link]      │          │
│  └─────────────────┘  └─────────────────┘          │
│                                                      │
│  ┌─────────────────────────────────────────┐        │
│  │ 💡 Mentor Tips                           │        │
│  │ • Use announcements...                   │        │
│  │ • Share Zoom links...                    │        │
│  │ • Include deadlines...                   │        │
│  │ • Keep supportive tone...                │        │
│  └─────────────────────────────────────────┘        │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

### 3. Top Bar

#### All Breakpoints
- **Position**: `sticky top-0`
- **Height**: `h-16` (64px)
- **Background**: White with border
- **Z-index**: 30

#### md Breakpoint
- Back button: `hidden sm:inline-flex` (visible)
- Hamburger menu: `md:hidden` (hidden)
- Padding: `px-4`

#### lg Breakpoint
- Back button: Visible
- Hamburger menu: Hidden
- Padding: `lg:px-8`

**Components:**
- Left: Back button (← Back)
- Right: Notification bell + User avatar

---

### 4. Hero Section

#### md Breakpoint
- Padding: `py-8 sm:py-10`
- Icon size: `w-14 h-14 sm:w-16 sm:h-16`
- Heading: `text-2xl sm:text-3xl`
- Subtitle: `text-base sm:text-lg`

#### lg Breakpoint
- Padding: `lg:py-10`
- Icon size: `sm:w-16 sm:h-16` (same as md)
- Heading: `lg:text-4xl`
- Subtitle: `sm:text-lg` (same as md)

**Content:**
```
┌─────────────────────────────────────────┐
│  [Icon]  Welcome, Mentor                │
│          You are the teacher for         │
│          Data Science                    │
└─────────────────────────────────────────┘
```

---

### 5. Main Content Grid

#### md Breakpoint (768px - 1023px)
- **Layout**: Single column (`grid-cols-1`)
- Cards stack vertically
- Full width utilization

#### lg Breakpoint (1024px+)
- **Layout**: Two columns (`lg:grid-cols-2`)
- Cards side by side
- Gap: `gap-6 sm:gap-8`

**Grid Structure:**
```
md:                    lg:
┌─────────────┐       ┌──────────┬──────────┐
│ Send Annc.  │       │ Send     │ Share    │
│             │       │ Annc.    │ Resources│
│ [Form]      │       │ [Form]   │ [Form]   │
│             │       │          │          │
│ [Button]    │       │ [Button] │ [Button]│
└─────────────┘       └──────────┴──────────┘
┌─────────────┐       
│ Mentor Tips │       
│             │       
│ [4 tips]    │       
└─────────────┘       
```

---

### 6. Cards Detail

#### Send Announcement Card
- **Border**: Course-specific color
- **Padding**: `p-5 sm:p-8`
- **Header**: Icon + Title + Subtitle
- **Form Fields**:
  - Message Title input
  - Message textarea (5 rows)
  - Error/success messages
  - Send to All Students button

#### Share Resources Card
- **Border**: Course-specific color
- **Padding**: `p-5 sm:p-8`
- **Header**: Icon + Title + Subtitle
- **Form Fields**:
  - Link Title input
  - Paste Link input
  - Error/success messages
  - Add Link button
  - Links list (if any added)

---

### 7. Mentor Tips Section

#### md Breakpoint
- **Grid**: `grid-cols-1 sm:grid-cols-2`
- 2 columns on md screens
- Padding: `p-5 sm:p-6`
- Margin top: `mt-5 sm:mt-6`

#### lg Breakpoint
- **Grid**: `lg:grid-cols-4`
- 4 columns on lg screens
- Same padding and margin

**Content:**
```
┌──────────────────────────────────────────────────────┐
│ 🔔 Mentor Tips                                       │
├──────────────────────────────────────────────────────┤
│ • Use announcements for important updates            │
│ • Share Zoom links for live sessions                 │
│ • Include deadlines in your messages                 │
│ • Keep a supportive and encouraging tone             │
└──────────────────────────────────────────────────────┘
```

---

## Responsive Behavior Summary

### md Breakpoint (768px - 1023px)
| Component | Behavior |
|-----------|----------|
| Sidebar | Persistent, 256px wide, left side |
| Main Content | Offset by 256px (ml-64) |
| Grid Layout | Single column |
| Top Bar | Back button visible, hamburger hidden |
| Hero | Medium sizing |
| Cards | Full width, stacked |
| Tips | 2 columns |

### lg Breakpoint (1024px+)
| Component | Behavior |
|-----------|----------|
| Sidebar | Persistent, 288px wide, left side |
| Main Content | Offset by 288px (xl:ml-72) |
| Grid Layout | Two columns (side by side) |
| Top Bar | Back button visible, hamburger hidden |
| Hero | Large sizing |
| Cards | Half width each, side by side |
| Tips | 4 columns |

---

## Key CSS Classes by Breakpoint

### Sidebar
```tsx
// Base (mobile)
className="fixed top-0 left-0 z-50 h-full w-72 transform -translate-x-full"

// md and above
className="md:translate-x-0 md:static md:z-auto md:w-64"

// xl and above
className="xl:w-72"
```

### Main Content Offset
```tsx
// md and above
className="md:ml-64"

// xl and above
className="xl:ml-72"
```

### Container Width (Improved for lg)
```tsx
// Hero and main content containers
className="max-w-6xl mx-auto"

// Previously used max-w-7xl, now optimized to max-w-6xl for better focus
```

### Grid Layout
```tsx
// Base: 1 column, lg: 2 columns
className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8"
```

### Card Padding (Improved for lg)
```tsx
// Cards
className="p-6 sm:p-8"

// Tips section
className="p-6 sm:p-8"
```

### Tips Grid
```tsx
// Base: 1 col, sm: 2 cols, lg: 4 cols
className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
```

---

## Visual Representation

### md View (Tablet)
```
┌──────────┬────────────────────────────────────┐
│          │  ← Back                [🔔] [M]   │
│ Sidebar  ├────────────────────────────────────┤
│ 256px    │                                    │
│          │  ┌──────────────────────────────┐  │
│          │  │ Welcome, Mentor              │  │
│          │  │ You are the teacher for      │  │
│          │  │ Data Science                 │  │
│          │  └──────────────────────────────┘  │
│          │                                    │
│          │  ┌──────────────────────────────┐  │
│          │  │ Send Announcement            │  │
│          │  │ [Form fields...]             │  │
│          │  │ [Send to All Students]       │  │
│          │  └──────────────────────────────┘  │
│          │                                    │
│          │  ┌──────────────────────────────┐  │
│          │  │ Share Resources              │  │
│          │  │ [Form fields...]             │  │
│          │  │ [Add Link]                   │  │
│          │  └──────────────────────────────┘  │
│          │                                    │
│          │  ┌──────────────────────────────┐  │
│          │  │ Mentor Tips                  │  │
│          │  │ • Tip 1  • Tip 2            │  │
│          │  └──────────────────────────────┘  │
└──────────┴────────────────────────────────────┘
```

### lg View (Desktop)
```
┌──────────┬────────────────────────────────────────────────────┐
│          │  ← Back                            [🔔] [M]     │
│ Sidebar  ├────────────────────────────────────────────────────┤
│ 288px    │                                                     │
│          │  ┌──────────────────────────────────────────────┐  │
│          │  │ Welcome, Mentor                              │  │
│          │  │ You are the teacher for Data Science         │  │
│          │  └──────────────────────────────────────────────┘  │
│          │                                                     │
│          │  ┌─────────────────────┬─────────────────────┐    │
│          │  │ Send Announcement   │ Share Resources     │    │
│          │  │ [Form fields...]    │ [Form fields...]    │    │
│          │  │ [Send to All]       │ [Add Link]          │    │
│          │  └─────────────────────┴─────────────────────┘    │
│          │                                                     │
│          │  ┌──────────────────────────────────────────────┐  │
│          │  │ Mentor Tips                                   │  │
│          │  │ • Tip 1  • Tip 2  • Tip 3  • Tip 4         │  │
│          │  └──────────────────────────────────────────────┘  │
└──────────┴────────────────────────────────────────────────────┘
```

---

## Color Coding

Each course has a specific color theme:
- **Data Science**: Emerald (green)
- **Cybersecurity**: Red
- **AI Automation**: Amber (yellow)
- **Computer Networking**: Cyan
- **Ethical Hacking**: Rose
- **Graphic Design**: Pink
- **UI/UX Design**: Purple
- **Full Stack Development**: Blue
- **Frontend Development**: Sky
- **Backend Development**: Indigo
- **Web Development**: Teal
- **Digital Marketing**: Orange
- **Cloud Computing**: Violet
- **Data Analysis**: Lime

Colors are applied to:
- Card borders
- Button gradients
- Icon backgrounds
- Accent elements
- Tips bullet points

---

## Interactive Features

### Mobile Only
- Hamburger menu toggle
- Sidebar slide animation
- Overlay backdrop
- Close button in sidebar

### All Breakpoints
- Form inputs with validation
- Success/error animations
- Link copying functionality
- Button hover effects
- Smooth transitions

---

## Technical Notes

- Uses Tailwind CSS for responsive design
- Breakpoints follow Tailwind defaults:
  - `sm`: 640px
  - `md`: 768px
  - `lg`: 1024px
  - `xl`: 1280px
- Icons from Lucide React
- Animations from Motion library
- Client-side routing with Next.js

## Recent Improvements (lg layout)

### Changes Made:
1. **Container Width**: Reduced from `max-w-7xl` to `max-w-6xl` for better content focus on large screens
2. **Card Padding**: Increased base padding from `p-5` to `p-6` for more consistent spacing
3. **Tips Section**: Enhanced padding from `p-5 sm:p-6` to `p-6 sm:p-8` for better visual balance
4. **Grid Gap**: Added `lg:gap-8` for more breathing room between cards on large screens
5. **Vertical Spacing**: Increased section spacing with `lg:py-10` and `lg:py-12` for better rhythm

### Result:
- More focused content area on large screens
- Better visual balance and breathing room
- Improved readability and user experience
- Consistent spacing across all breakpoints
