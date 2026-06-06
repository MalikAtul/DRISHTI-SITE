# DRISHTI -- Smart Assistive Ecosystem

DRISHTI is a smart assistive ecosystem designed to solve four major disability challenges using AI, Computer Vision, and IoT. It is a two-device modular system -- **Locket + Gloves** -- both working independently and together as one unified ecosystem.

Inspired by MIT's SignAloud gloves (one-way communication), DRISHTI improves on the concept by enabling **two-way communication** between deaf-mute users and the hearing world.

## Creator

**Atul Malik**, age 16, from Gohana, Haryana, India.

## Competition

**Manak Inspire 2026** -- National Innovation Competition for students.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Markup | HTML5 |
| Styling | CSS3 (custom properties, animations) |
| Scripting | Vanilla JavaScript (ES modules) |
| 3D Rendering | [Three.js](https://threejs.org/) |
| Animation | [GSAP](https://gsap.com/) (GreenSock Animation Platform) |
| Build Step | **None** -- open the HTML file and go |

## File Structure

```
DRISHTI-SITE/
├── index.html              # Main entry point (create when ready)
├── README.md               # This file
├── LICENSE                  # MIT License
│
├── css/
│   └── cursor.css          # Custom cursor styles
│
├── js/
│   ├── main.js             # Core site logic
│   ├── hero.js             # Hero section controller
│   ├── magnetic.js          # Magnetic hover effects
│   ├── cursor.js           # Custom cursor logic
│   ├── three-glove.js      # Three.js glove 3D scene
│   └── three-locket.js     # Three.js locket 3D scene (when added)
│
└── assets/
    ├── models/             # 3D model files (.glb)
    │   └── README.txt      # Naming conventions for model files
    └── video/              # Video assets
        └── README.txt      # Instructions for signal animation video
```

## Running Locally

No build tools, no package manager, no server required.

1. Clone the repository:
   ```bash
   git clone https://github.com/<your-username>/DRISHTI-SITE.git
   cd DRISHTI-SITE
   ```

2. Open `index.html` in a browser:
   ```bash
   # macOS
   open index.html

   # Linux
   xdg-open index.html

   # Windows
   start index.html
   ```

   > **Note:** Some browsers restrict `file://` access for ES modules and Three.js model loading. If you run into CORS errors, serve the folder with any static server:
   > ```bash
   > # Python 3
   > python3 -m http.server 8000
   >
   > # Node (npx, no install)
   > npx serve .
   > ```
   > Then visit `http://localhost:8000`.

## GitHub Pages Deployment

1. Push your code to the `main` branch on GitHub.
2. Go to **Settings > Pages** in your repository.
3. Under **Source**, select **Deploy from a branch**.
4. Choose the `main` branch and `/ (root)` folder.
5. Click **Save**. The site will be live at `https://<your-username>.github.io/DRISHTI-SITE/` within a few minutes.

No build step or CI configuration is needed -- GitHub Pages serves the static files directly.

## Adding 3D Models

See [`assets/models/README.txt`](assets/models/README.txt) for the full list of expected `.glb` files and their naming conventions.

After placing the model files:
1. Open `js/three-glove.js` (and `js/three-locket.js` when created).
2. Search for `PLACEHOLDER` comments.
3. Follow the inline instructions to swap placeholder geometry for the real models.

## Adding the Signal Animation Video

See [`assets/video/README.txt`](assets/video/README.txt) for the required filenames.

After placing the video:
1. Search the gloves section HTML for `GEMINI VIDEO`.
2. Uncomment the `<video>` element.
3. Comment out or remove the CSS placeholder div above it.

## License

This project is released under the [MIT License](LICENSE).
