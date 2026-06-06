/*  three-glove.js  --  Smart Gloves 3D scene with sticky scroll & explosion
 *  Depends on: three.js (global THREE), gsap + ScrollTrigger
 */

document.addEventListener('DOMContentLoaded', () => {
  /* ------------------------------------------------------------------ */
  /*  1. SCENE / CAMERA / RENDERER                                      */
  /* ------------------------------------------------------------------ */
  const canvas = document.getElementById('glove-canvas');
  if (!canvas) return;

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    45,
    canvas.clientWidth / canvas.clientHeight,
    0.1,
    50
  );
  camera.position.set(0, 1.5, 7);
  camera.lookAt(0, 0.5, 0);

  const isMobile = /Mobi|Android/i.test(navigator.userAgent);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
  });
  renderer.setPixelRatio(isMobile ? 1 : Math.min(window.devicePixelRatio, 2));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);

  /* ------------------------------------------------------------------ */
  /*  2. LIGHTING  (studio 3-point)                                     */
  /* ------------------------------------------------------------------ */
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const keyLight = new THREE.DirectionalLight(0xFF8C55, 1.4);
  keyLight.position.set(4, 5, 4);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0x7C3AED, 0.6);
  fillLight.position.set(-3, 2, -3);
  scene.add(fillLight);

  const rimLight = new THREE.DirectionalLight(0xffffff, 0.8);
  rimLight.position.set(0, -3, 6);
  scene.add(rimLight);

  /* ------------------------------------------------------------------ */
  /*  3. MATERIALS                                                      */
  /* ------------------------------------------------------------------ */
  const MAT_GLOVE = new THREE.MeshStandardMaterial({
    color: 0x1C2333,
    metalness: 0.7,
    roughness: 0.25,
  });

  const MAT_SENSOR = new THREE.MeshStandardMaterial({
    color: 0xFF6B35,
    emissive: 0xFF6B35,
    emissiveIntensity: 0.25,
  });

  const MAT_PCB = new THREE.MeshStandardMaterial({
    color: 0x1A3A2A,
    metalness: 0.8,
    roughness: 0.2,
  });

  /* ------------------------------------------------------------------ */
  /*  4. HAND GROUP  (stays fixed during explosion)                     */
  /* ------------------------------------------------------------------ */
  const handGroup = new THREE.Group();

  // Palm
  const palm = new THREE.Mesh(
    new THREE.BoxGeometry(2, 1.3, 0.28),
    MAT_GLOVE
  );
  handGroup.add(palm);

  // Wrist
  const wrist = new THREE.Mesh(
    new THREE.CylinderGeometry(0.52, 0.62, 0.9, 16),
    MAT_GLOVE
  );
  wrist.position.set(0, -1.05, 0);
  handGroup.add(wrist);

  // Fingers (4 fingers, no thumb)
  const fingerXPositions = [-0.72, -0.24, 0.24, 0.72];
  const fingerBaseY = 0.72;
  const phalanxSizes = [
    { radius: 0.12, height: 0.35 }, // proximal
    { radius: 0.10, height: 0.30 }, // middle
    { radius: 0.08, height: 0.25 }, // distal
  ];

  fingerXPositions.forEach((xPos) => {
    let currentY = fingerBaseY;

    phalanxSizes.forEach((seg) => {
      const phalanx = new THREE.Mesh(
        new THREE.CylinderGeometry(seg.radius, seg.radius, seg.height, 12),
        MAT_GLOVE
      );
      currentY += seg.height / 2;
      phalanx.position.set(xPos, currentY, 0);
      handGroup.add(phalanx);
      currentY += seg.height / 2 + 0.02; // small gap between segments
    });
  });

  scene.add(handGroup);

  /* ------------------------------------------------------------------ */
  /*  5. ELECTRONIC COMPONENTS  (float UP in explosion)                 */
  /* ------------------------------------------------------------------ */
  const componentDefs = [
    {
      name: 'esp32',
      geo: new THREE.BoxGeometry(0.7, 0.1, 0.5),
      mat: MAT_PCB,
      assembled: new THREE.Vector3(0.3, 0.2, 0.12),
      exploded: new THREE.Vector3(1.8, 3.5, 1.2),
      label: 'ESP32 · WiFi @ 50Hz',
    },
    {
      name: 'ads1115',
      geo: new THREE.BoxGeometry(0.55, 0.08, 0.4),
      mat: MAT_PCB,
      assembled: new THREE.Vector3(-0.4, 0.18, 0.08),
      exploded: new THREE.Vector3(-2.0, 3.2, 0.8),
      label: 'ADS1115 · 16-bit ADC',
    },
    {
      name: 'mpu6050',
      geo: new THREE.BoxGeometry(0.35, 0.07, 0.3),
      mat: MAT_PCB,
      assembled: new THREE.Vector3(0, 0.17, 0.3),
      exploded: new THREE.Vector3(0.2, 4.0, 2.0),
      label: 'MPU6050 · Gyroscope',
    },
    {
      name: 'flex1',
      geo: new THREE.BoxGeometry(0.06, 0.3, 0.05),
      mat: MAT_SENSOR,
      assembled: new THREE.Vector3(-0.72, 0.85, 0.14),
      exploded: new THREE.Vector3(-1.8, 3.8, 1.5),
      label: 'Flex Sensor · Index',
    },
    {
      name: 'flex2',
      geo: new THREE.BoxGeometry(0.06, 0.32, 0.05),
      mat: MAT_SENSOR,
      assembled: new THREE.Vector3(-0.24, 0.9, 0.14),
      exploded: new THREE.Vector3(-0.5, 4.2, 1.8),
      label: 'Flex Sensor · Middle',
    },
    {
      name: 'flex3',
      geo: new THREE.BoxGeometry(0.06, 0.3, 0.05),
      mat: MAT_SENSOR,
      assembled: new THREE.Vector3(0.24, 0.87, 0.14),
      exploded: new THREE.Vector3(0.8, 4.0, 1.6),
      label: 'Flex Sensor · Ring',
    },
    {
      name: 'flex4',
      geo: new THREE.BoxGeometry(0.06, 0.25, 0.05),
      mat: MAT_SENSOR,
      assembled: new THREE.Vector3(0.72, 0.75, 0.14),
      exploded: new THREE.Vector3(2.0, 3.6, 1.4),
      label: 'Flex Sensor · Pinky',
    },
    {
      name: 'battery',
      geo: new THREE.BoxGeometry(0.6, 0.2, 0.35),
      mat: new THREE.MeshStandardMaterial({ color: 0x2A3A1A, metalness: 0.6 }),
      assembled: new THREE.Vector3(-0.1, -0.4, 0.1),
      exploded: new THREE.Vector3(-0.3, 2.8, 0.5),
      label: 'LiPo Battery · 3.7V',
    },
  ];

  const components = componentDefs.map((def) => {
    const mesh = new THREE.Mesh(def.geo, def.mat);
    mesh.position.copy(def.assembled);
    scene.add(mesh);
    return {
      name: def.name,
      mesh,
      assembled: def.assembled.clone(),
      exploded: def.exploded.clone(),
      label: def.label,
    };
  });

  /* ------------------------------------------------------------------ */
  /*  6. PARENT GROUP FOR ROTATION                                      */
  /* ------------------------------------------------------------------ */
  // We need a parent group that rotates everything together.
  // Remove hand and components from scene, add to gloveGroup.
  const gloveGroup = new THREE.Group();
  scene.remove(handGroup);
  gloveGroup.add(handGroup);
  components.forEach((c) => {
    scene.remove(c.mesh);
    gloveGroup.add(c.mesh);
  });
  scene.add(gloveGroup);

  /* ------------------------------------------------------------------ */
  /*  7. AR LABELS                                                      */
  /* ------------------------------------------------------------------ */
  const arLabels = document.querySelectorAll('.ar-label');

  function projectToScreen(object3D) {
    const vec = new THREE.Vector3();
    object3D.getWorldPosition(vec);
    vec.project(camera);

    const halfW = canvas.clientWidth / 2;
    const halfH = canvas.clientHeight / 2;

    return {
      x: vec.x * halfW + halfW,
      y: -(vec.y * halfH) + halfH,
    };
  }

  /* ------------------------------------------------------------------ */
  /*  8. SCROLL-DRIVEN ANIMATION                                        */
  /* ------------------------------------------------------------------ */
  gsap.registerPlugin(ScrollTrigger);

  let currentProgress = 0;

  ScrollTrigger.create({
    trigger: '#gloves',
    start: 'top top',
    end: 'bottom bottom',
    scrub: true,
    onUpdate: (self) => {
      currentProgress = self.progress;
      updateGloveProgress(self.progress);
    },
  });

  /* ------------------------------------------------------------------ */
  /*  9. UPDATE FUNCTION                                                */
  /* ------------------------------------------------------------------ */
  const phaseEls = document.querySelectorAll('.glove-phase');

  function updateGloveProgress(p) {
    // --- Rotation (continuous across all phases) ---
    gloveGroup.rotation.y = p * Math.PI * 8;

    // --- Explosion progress ---
    const explodeP = p < 0.25
      ? 0
      : p < 0.6
        ? (p - 0.25) / 0.35
        : p < 0.8
          ? 1
          : 1 - (p - 0.8) / 0.2;

    // --- Move components ---
    components.forEach((c) => {
      c.mesh.position.lerpVectors(c.assembled, c.exploded, explodeP);
    });

    // --- AR Labels ---
    arLabels.forEach((el) => {
      const compName = el.dataset.component;
      const comp = components.find((c) => c.name === compName);
      if (!comp) return;

      if (explodeP > 0.3) {
        const pos = projectToScreen(comp.mesh);
        el.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
        el.style.opacity = '1';
        el.style.pointerEvents = 'auto';
      } else {
        el.style.opacity = '0';
        el.style.pointerEvents = 'none';
      }
    });

    // --- Phase content switching ---
    let activePhase = 0;
    if (p < 0.25) activePhase = 0;
    else if (p < 0.6) activePhase = 1;
    else if (p < 0.8) activePhase = 2;
    else activePhase = 3;

    phaseEls.forEach((el, i) => {
      el.style.opacity = i === activePhase ? '1' : '0';
      el.style.pointerEvents = i === activePhase ? 'auto' : 'none';
    });
  }

  /* ------------------------------------------------------------------ */
  /*  10. RENDER LOOP + PERFORMANCE                                     */
  /* ------------------------------------------------------------------ */
  let isVisible = false;

  function render() {
    renderer.render(scene, camera);
  }

  function animate() {
    render();
  }

  // IntersectionObserver: only animate when #gloves is on-screen
  const section = document.getElementById('gloves');
  if (section) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisible = entry.isIntersecting;
          if (isVisible) {
            renderer.setAnimationLoop(animate);
          } else {
            renderer.setAnimationLoop(null);
          }
        });
      },
      { threshold: 0 }
    );
    observer.observe(section);
  } else {
    // Fallback: always animate
    renderer.setAnimationLoop(animate);
  }

  /* ------------------------------------------------------------------ */
  /*  11. RESIZE HANDLER                                                */
  /* ------------------------------------------------------------------ */
  function onResize() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;

    camera.aspect = w / h;
    camera.updateProjectionMatrix();

    renderer.setSize(w, h);
    renderer.setPixelRatio(
      isMobile ? 1 : Math.min(window.devicePixelRatio, 2)
    );
  }

  window.addEventListener('resize', onResize);

  // Initial render
  updateGloveProgress(0);
  render();
});
