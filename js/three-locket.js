/*  three-locket.js  --  KAI Locket 3D scene with sticky scroll + explosion
 *  Depends on: three.js (global THREE), gsap + ScrollTrigger
 */

document.addEventListener('DOMContentLoaded', () => {
  gsap.registerPlugin(ScrollTrigger);

  /* ------------------------------------------------------------------ */
  /*  1. SCENE / CAMERA / RENDERER                                      */
  /* ------------------------------------------------------------------ */
  const canvas = document.getElementById('locket-canvas');
  if (!canvas) return;

  const isMobile = /Mobi|Android/i.test(navigator.userAgent);

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    45,
    canvas.clientWidth / canvas.clientHeight,
    0.1,
    50
  );
  camera.position.set(0, 0, 6);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
  });
  renderer.setPixelRatio(isMobile ? 1 : Math.min(window.devicePixelRatio, 2));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);

  /* ------------------------------------------------------------------ */
  /*  2. LIGHTING                                                        */
  /* ------------------------------------------------------------------ */
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
  scene.add(ambientLight);

  const tealLight = new THREE.DirectionalLight(0x00C8D4, 1.0);
  tealLight.position.set(-4, 3, 4);
  scene.add(tealLight);

  const purpleLight = new THREE.DirectionalLight(0x7C3AED, 0.5);
  purpleLight.position.set(3, -2, -2);
  scene.add(purpleLight);

  const rimLight = new THREE.DirectionalLight(0xffffff, 0.9);
  rimLight.position.set(0, 0, 8);
  scene.add(rimLight);

  /* ------------------------------------------------------------------ */
  /*  3. CASING (stays still, never moves in explosion)                  */
  /* ------------------------------------------------------------------ */
  const casingMat = new THREE.MeshStandardMaterial({
    color: 0x1A1A2E,
    metalness: 0.92,
    roughness: 0.08,
  });

  const casing = new THREE.Mesh(
    new THREE.CylinderGeometry(0.75, 0.75, 1.85, 32),
    casingMat
  );
  casing.position.set(0, 0, 0);
  scene.add(casing);

  /* ------------------------------------------------------------------ */
  /*  4. CHAIN LOOP (stays attached to casing)                           */
  /* ------------------------------------------------------------------ */
  const chainLoop = new THREE.Mesh(
    new THREE.TorusGeometry(0.15, 0.05, 8, 16),
    new THREE.MeshStandardMaterial({ color: 0xAAAAAA, metalness: 1.0 })
  );
  chainLoop.position.set(0, 1.0, 0);
  scene.add(chainLoop);

  /* ------------------------------------------------------------------ */
  /*  5. CAMERA LENS GROUP (stays on front face)                         */
  /* ------------------------------------------------------------------ */
  const lensGroup = new THREE.Group();
  lensGroup.position.set(0, 0, 0.77);

  // Rim
  const lensRim = new THREE.Mesh(
    new THREE.TorusGeometry(0.22, 0.03, 12, 24),
    new THREE.MeshStandardMaterial({ color: 0x333344, metalness: 0.9, roughness: 0.1 })
  );
  lensGroup.add(lensRim);

  // Lens
  const lens = new THREE.Mesh(
    new THREE.CircleGeometry(0.2, 24),
    new THREE.MeshStandardMaterial({ color: 0x112233, metalness: 0.5, roughness: 0.2 })
  );
  lensGroup.add(lens);

  // Glow dot
  const glowDot = new THREE.Mesh(
    new THREE.SphereGeometry(0.06, 12, 12),
    new THREE.MeshStandardMaterial({
      color: 0x00C8D4,
      emissive: 0x00C8D4,
      emissiveIntensity: 2.0,
    })
  );
  glowDot.position.set(0, 0, 0.05);
  lensGroup.add(glowDot);

  // Teal point light
  const lensPointLight = new THREE.PointLight(0x00C8D4, 1.0, 3);
  lensPointLight.position.set(0, 0, 0.1);
  lensGroup.add(lensPointLight);

  scene.add(lensGroup);

  /* ------------------------------------------------------------------ */
  /*  6. ELECTRONIC COMPONENTS (float OUT from casing in explosion)      */
  /* ------------------------------------------------------------------ */
  const locketParts = [
    {
      name: 'pizero',
      geometry: new THREE.BoxGeometry(0.65, 0.08, 0.45),
      matOpts: { color: 0x0A1F0A, metalness: 0.7, roughness: 0.3 },
      assembled: new THREE.Vector3(0, 0.2, 0),
      exploded: new THREE.Vector3(0, 2.8, 1.5),
      label: 'Pi Zero 2WH · Edge MCU',
    },
    {
      name: 'mic',
      geometry: new THREE.CylinderGeometry(0.08, 0.08, 0.12, 16),
      matOpts: { color: 0x2A2A2A, metalness: 0.8, roughness: 0.2 },
      assembled: new THREE.Vector3(-0.45, 0, 0.2),
      exploded: new THREE.Vector3(-2.2, 2.0, 1.0),
      label: 'INMP441 · MEMS Mic',
    },
    {
      name: 'display',
      geometry: new THREE.BoxGeometry(0.55, 0.04, 0.3),
      matOpts: { color: 0x00C8D4, emissive: 0x00C8D4, emissiveIntensity: 0.15, metalness: 0.3, roughness: 0.4 },
      assembled: new THREE.Vector3(0, -0.3, 0.35),
      exploded: new THREE.Vector3(0.3, 1.5, 2.2),
      label: 'SPI Display · Status',
    },
    {
      name: 'battery',
      geometry: new THREE.BoxGeometry(0.5, 0.35, 0.15),
      matOpts: { color: 0x1A2A0A, metalness: 0.3, roughness: 0.6 },
      assembled: new THREE.Vector3(0, -0.55, 0),
      exploded: new THREE.Vector3(0, -2.5, 0.8),
      label: 'LiPo Battery · 3.7V',
    },
    {
      name: 'speaker',
      geometry: new THREE.CylinderGeometry(0.2, 0.2, 0.06, 24),
      matOpts: { color: 0x1A1A1A, metalness: 0.7, roughness: 0.3 },
      assembled: new THREE.Vector3(0, -0.8, 0),
      exploded: new THREE.Vector3(1.5, -2.0, 0.8),
      label: 'Speaker · Audio Out',
    },
  ];

  const partMeshes = [];

  locketParts.forEach((part) => {
    const mat = new THREE.MeshStandardMaterial(part.matOpts);
    const mesh = new THREE.Mesh(part.geometry, mat);
    mesh.position.copy(part.assembled);
    mesh.userData = {
      assembled: part.assembled.clone(),
      exploded: part.exploded.clone(),
      label: part.label,
      name: part.name,
    };
    scene.add(mesh);
    partMeshes.push(mesh);
  });

  /* ------------------------------------------------------------------ */
  /*  7. SCROLL-DRIVEN ANIMATION (GSAP ScrollTrigger)                   */
  /* ------------------------------------------------------------------ */
  let currentProgress = 0;

  ScrollTrigger.create({
    trigger: '#kai',
    start: 'top top',
    end: 'bottom bottom',
    scrub: true,
    onUpdate: (self) => {
      updateLocketProgress(self.progress);
    },
  });

  /* ------------------------------------------------------------------ */
  /*  8. updateLocketProgress(p) -- 4-phase animation                    */
  /* ------------------------------------------------------------------ */
  function lerpVec3(out, a, b, t) {
    out.x = a.x + (b.x - a.x) * t;
    out.y = a.y + (b.y - a.y) * t;
    out.z = a.z + (b.z - a.z) * t;
  }

  function updateLocketProgress(p) {
    currentProgress = p;

    // Compute explosion parameter
    let explodeP = 0;

    if (p < 0.25) {
      // Phase 1: rotation, floating -- assembled
      explodeP = 0;
    } else if (p < 0.6) {
      // Phase 2: explosion -- components float OUT
      explodeP = (p - 0.25) / 0.35;
      explodeP = Math.min(Math.max(explodeP, 0), 1);
      // Ease in-out
      explodeP = explodeP * explodeP * (3 - 2 * explodeP);
    } else if (p < 0.8) {
      // Phase 3: fully exploded
      explodeP = 1;
    } else {
      // Phase 4: reassembly
      explodeP = 1 - (p - 0.8) / 0.2;
      explodeP = Math.min(Math.max(explodeP, 0), 1);
      explodeP = explodeP * explodeP * (3 - 2 * explodeP);
    }

    // Move components between assembled and exploded positions
    partMeshes.forEach((mesh) => {
      const data = mesh.userData;
      lerpVec3(mesh.position, data.assembled, data.exploded, explodeP);
    });

    // Casing stays at origin (no movement)

    // Update AR labels
    updateARLabels(explodeP);

    // Phase content switching
    updatePhaseContent(p);
  }

  /* ------------------------------------------------------------------ */
  /*  9. AR LABELS                                                       */
  /* ------------------------------------------------------------------ */
  const labelContainer = document.querySelector('.ar-labels-kai') ||
                          document.querySelector('.ar-labels');

  function updateARLabels(explodeP) {
    if (!labelContainer) return;

    const labels = labelContainer.querySelectorAll('.ar-label');
    if (labels.length === 0) return;

    const showLabels = explodeP > 0.3;

    labels.forEach((labelEl, i) => {
      if (!showLabels || i >= partMeshes.length) {
        labelEl.style.opacity = '0';
        labelEl.style.pointerEvents = 'none';
        return;
      }

      const mesh = partMeshes[i];
      const pos = mesh.position.clone();

      // Project 3D position to screen
      pos.project(camera);

      const x = (pos.x * 0.5 + 0.5) * canvas.clientWidth;
      const y = (-pos.y * 0.5 + 0.5) * canvas.clientHeight;

      labelEl.style.left = x + 'px';
      labelEl.style.top = y + 'px';
      labelEl.style.opacity = '1';
      labelEl.style.pointerEvents = 'auto';
    });
  }

  /* ------------------------------------------------------------------ */
  /*  10. PHASE CONTENT SWITCHING                                        */
  /* ------------------------------------------------------------------ */
  function updatePhaseContent(p) {
    const phases = document.querySelectorAll('.kai-phase');
    if (phases.length === 0) return;

    let activeIndex = 0;
    if (p < 0.25) {
      activeIndex = 0;
    } else if (p < 0.6) {
      activeIndex = 1;
    } else if (p < 0.8) {
      activeIndex = 2;
    } else {
      activeIndex = 3;
    }

    phases.forEach((phase, i) => {
      if (i === activeIndex) {
        phase.classList.add('active');
        phase.style.opacity = '1';
        phase.style.pointerEvents = 'auto';
      } else {
        phase.classList.remove('active');
        phase.style.opacity = '0';
        phase.style.pointerEvents = 'none';
      }
    });
  }

  /* ------------------------------------------------------------------ */
  /*  11. KAI LENS SECTION (#kai-lens)                                   */
  /* ------------------------------------------------------------------ */
  const kaiLensSection = document.getElementById('kai-lens');

  if (kaiLensSection) {
    ScrollTrigger.create({
      trigger: '#kai-lens',
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => {
        const lp = self.progress;
        const lensPhases = kaiLensSection.querySelectorAll('.lens-phase');
        if (lensPhases.length === 0) return;

        let activeIdx = 0;
        if (lp < 0.33) {
          activeIdx = 0; // Object detection
        } else if (lp < 0.66) {
          activeIdx = 1; // Currency detection
        } else {
          activeIdx = 2; // QR scan
        }

        lensPhases.forEach((phase, i) => {
          if (i === activeIdx) {
            phase.classList.add('active');
            phase.style.opacity = '1';
          } else {
            phase.classList.remove('active');
            phase.style.opacity = '0';
          }
        });
      },
    });
  }

  /* ------------------------------------------------------------------ */
  /*  12. ANIMATION LOOP + INTERSECTION OBSERVER                        */
  /* ------------------------------------------------------------------ */
  const clock = new THREE.Clock();

  function animate() {
    const time = clock.getElapsedTime();

    // Floating animation when assembled (Phase 1 or reassembled)
    if (currentProgress < 0.25 || currentProgress > 0.8) {
      casing.position.y = Math.sin(time * 1.1) * 0.1;
      casing.rotation.y += 0.004;

      // Chain follows casing
      chainLoop.position.y = 1.0 + Math.sin(time * 1.1) * 0.1;
      chainLoop.rotation.y = casing.rotation.y;

      // Lens group follows casing
      lensGroup.position.y = Math.sin(time * 1.1) * 0.1;
      lensGroup.rotation.y = casing.rotation.y;
    }

    // Pulsing lens point light
    lensPointLight.intensity = Math.sin(time) * 0.5 + 1.0;

    renderer.render(scene, camera);
  }

  // Only run render loop when visible
  const kaiSection =
    canvas.closest('#kai') ||
    canvas.closest('section') ||
    canvas.parentElement;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          renderer.setAnimationLoop(animate);
        } else {
          renderer.setAnimationLoop(null);
        }
      });
    },
    { threshold: 0 }
  );

  if (kaiSection) {
    observer.observe(kaiSection);
  } else {
    renderer.setAnimationLoop(animate);
  }

  /* ------------------------------------------------------------------ */
  /*  RESIZE HANDLER (debounced 150ms)                                   */
  /* ------------------------------------------------------------------ */
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(
        isMobile ? 1 : Math.min(window.devicePixelRatio, 2)
      );
      renderer.setSize(width, height);
    }, 150);
  });
});
