# Lusion 3D Interactive Hero & Showreel Standalone Package

This directory contains the completely extracted, standalone code for everything **before the Featured Work section** from the [lusion.co](https://lusion.co) WebGL/WebGPU architecture.

---

## 🌟 What is Included in this Package

- **Full-Screen Interactive 3D WebGL Canvas**: Three.js WebGL2 pipeline with custom GLSL liquid shaders, mouse-tracking physics, and particle simulation.
- **Floating Interactive Header**: "LUSION" brand logo, live audio equalizer toggle button, pill button with magnetic hover ("Let's talk"), and full-screen menu overlay.
- **Hero Section (`#home-hero`)**: Interactive typography, animated crosshairs, and dynamic scroll indicator.
- **Showreel Section (`#home-reel`)**: 3D curve ribbons, interactive video preview player, watch button, and retro HUD elements.
- **Interactive Audio System**: WebAudio ambient audio, hover tones, and click feedback.
- **All Assets Included**:
  - `assets/fonts/`: Aeonik, IBMPlexMono, and LusionMono fonts.
  - `assets/audios/`: Ambient soundtrack, UI hover, click, and transition effects.
  - `assets/models/`: Binary geometry buffers (`.buf`) for 3D crosshairs, lines, and ribbon meshes.
  - `assets/textures/`: HDR environment matcaps (`.exr`), SMAA antialiasing textures, and video loop (`desktop.mp4`).
  - `assets/images/`: Vector SVG icons.
- **Clean Custom Content Area**: A designated `<section id="custom-website-content">` ready for your own website's components (Services, About, Pricing, Contact, etc.).

---

## 🚀 How to Run Locally (Instant Preview)

1. **Windows (1-Click)**:
   Double-click [`start.bat`](start.bat). It will automatically start the lightweight local server and launch your default browser at:
   ```
   http://localhost:5500/
   ```

2. **Python**:
   ```bash
   python serve.py
   ```
   Then open `http://localhost:5500/` in Chrome or Edge.

---

## 📁 File Structure

```
hero-standalone/
├── index.html            # Main HTML page (Header + Hero + Showreel + Custom Content)
├── about.CNa9RfUh.css    # Cleaned styles for layout, header, typography & UI
├── hoisted.CUO_IjfL.js   # Compiled 3D WebGL runtime (Three.js, shaders, physics, audio)
├── serve.py              # Lightweight multithreaded local server
├── start.bat             # 1-click Windows launcher
├── README.md             # This documentation guide
└── assets/               # All required 3D models, textures, fonts, audios & icons
    ├── audios/           # Sound effects (.ogg)
    ├── fonts/            # Web fonts (.woff2)
    ├── images/           # UI SVGs and icons
    ├── meta/             # Favicons and webmanifest
    ├── models/           # 3D .buf binary meshes
    └── textures/         # Matcap .exr, SMAA textures, video mp4
```

---

## 🎨 How to Customize for Your Website

### 1. Change the Main Headline Text
Open `index.html` and search for `#home-hero-title`:
```html
<h1 id="home-hero-title">Your Custom Headline Here</h1>
```

### 2. Change the Logo / Brand Name
Search for `#header-logo` in `index.html`:
Replace the inner `<svg>` with your own SVG logo or brand text:
```html
<a id="header-logo" aria-label="Home" href="#">
  <span style="font-size: 24px; font-weight: 700; color: #fff; letter-spacing: -0.02em;">MY BRAND</span>
</a>
```

### 3. Add Your Own Sections Below the Hero
In `index.html`, find the `<section id="custom-website-content">` block:
```html
<!-- ========================================================================= -->
<!-- [YOUR WEBSITE'S CONTENT GOES HERE]                                        -->
<!-- ========================================================================= -->
<section id="custom-website-content">
  <!-- Insert your custom HTML, cards, pricing tables, or footer here -->
</section>
```

### 4. Replace the Reel Video
The showreel video is located at:
`assets/textures/reel/desktop.mp4`
Simply replace this MP4 with your own video file (keeping the same filename or updating the path in `hoisted.CUO_IjfL.js`).
