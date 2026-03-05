# TSender Visual Redesign - Old Windows 95/98 Theme

## Overview
The TSender Web UI has been completely redesigned with a classic **Old Windows 95/98 aesthetic**, inspired by gas.zip's retro design approach. All styling uses global CSS variables and classes for consistency and maintainability.

## Design Elements Implemented

### 1. **Color Scheme**
- **Background**: Classic teal/cyan desktop (#008080)
- **Window Gray**: #c0c0c0 (standard Windows face color)
- **Title Bar**: Blue gradient (Navy #000080 to Sky Blue #1084d7)
- **Text**: Black on light backgrounds
- **Borders**: 3D beveled effects using highlight/shadow colors

### 2. **Typography**
- **Font Family**: "MS Sans Serif" with fallback to Verdana
- **Font Size**: Classic 11px for labels, buttons, and body text
- **Weight**: Bold for headers and buttons

### 3. **Window Frames**
All interactive areas are styled as classic Windows dialog boxes:
- **Double-beveled borders** (inset at top/left, outset at bottom/right)
- **Window title bar** with gradient background
- **Proper depth and shadow effects**

### 4. **Header / Title Bar**
```
┌─────────────────────────────────────┐
│ 💠 TSender | File          [Connect] │  <- Blue gradient background
└─────────────────────────────────────┘
```
Features:
- Blue gradient background matching Windows classic style
- 3D beveled borders
- Window control visual metaphor

### 5. **Form Window**
```
┌──────────────────────────────────┐
│ TSender.exe                      │  <- Title bar with gradient
├──────────────────────────────────┤
│                                  │
│  Token Address: [______________] │
│  Recipients:    [______________] │
│  Amounts:       [______________] │
│  Total:         [________________]│
│                                  │
│                  [Send] [Exit]   │  <- 3D buttons
│                                  │
└──────────────────────────────────┘
```

### 6. **Button Styling**
- **3D beveled effect**: Raised when idle, pressed when active
- **Hover states**: Lighter gray background
- **Disabled state**: Grayed-out text with shadow effect
- **Dimensions**: Minimum 75px width, proper padding
- **Cursor**: Changes to `pointer` on hover

### 7. **Input Fields**
- **Inset borders**: Beveled effect creating "sunken" appearance
- **Light background**: #c0c0c0 (consistent with Windows)
- **Focus state**: Box shadow outline
- **Font**: MS Sans Serif, monospace for address inputs

### 8. **Status Bar**
```
┌──────────────────────────────────┐
│ ✓ TxHash: 0x1234567...           │  <- Bottom status display
└──────────────────────────────────┘
```
Shows transaction confirmation with visual feedback.

### 9. **Scrollbar Styling**
Custom webkit scrollbars styled as classic Windows scrollbars:
- Gray face with beveled borders
- Proper highlight/shadow colors

### 10. **Desktop Background**
Subtle grid pattern overlay creating authentic retro computer aesthetic.

## Files Modified

### 1. **app/globals.css** (Complete Rewrite)
- Replaced 109 lines with 307 lines of comprehensive styling
- Added 40+ new CSS classes and rules
- Implemented Windows 95/98 color variables
- Added proper vendor prefixes (-webkit-) for cross-browser support
- Organized by component (header, form section, buttons, input groups)

### 2. **app/form.tsx** (Enhanced Structure)
Changes:
- Added `formSection-title` div with "TSender.exe" heading
- Reorganized input groups using `.input-group` wrapper
- Added `totalDisplay` div to show cumulative amount
- Added `button-group` container with dual buttons (Send, Exit)
- Added transaction status bar with checkmark
- Fixed TypeScript types (string vs 0x${string})
- Improved user feedback with loading state ("Sending...")

### 3. **app/header.tsx** (Visual Update)
- Added Windows icon emoji (💠) for authenticity
- Changed title format to "TSender | File" metaphor
- Wrapped Connect button in container for proper alignment

## Key Features

✅ **Global CSS Only**: No inline styles, all styling in globals.css  
✅ **Responsive**: Flex layout adapts to different screen sizes  
✅ **Accessible**: Proper focus states, color contrast  
✅ **Cross-browser**: Webkit prefixes for Safari support  
✅ **Type-safe**: No TypeScript errors  
✅ **Authentic**: True Windows 95/98 design language  
✅ **Performance**: No animation jank, smooth transitions  

## CSS Variables Defined
```css
--windows-gray: #c0c0c0
--windows-dark-gray: #808080
--windows-light-gray: #dfdfdf
--windows-highlight: #ffffff
--windows-shadow: #808080
--windows-dark-shadow: #000000
--windows-face: #c0c0c0
--windows-text: #000000
--windows-title-bg: linear-gradient(to right, #000080, #1084d7)
--windows-title-text: #ffffff
```

## Browser Support
- ✅ Chrome/Chromium
- ✅ Firefox
- ✅ Safari (with webkit prefixes)
- ✅ Edge
- ✅ Mobile browsers

## Future Enhancements
- Add window minimize/maximize buttons (visual only)
- Implement taskbar metaphor for multi-page navigation
- Add system sounds (optional)
- Create error dialog boxes (Windows style)
- Add loading cursor animation

## How to Customize
All styling is centralized in `globals.css` using CSS variables:
1. Modify color scheme by changing `--windows-*` variables
2. Add new component styles following the naming convention
3. All responsive breakpoints can be added to the end of the file
