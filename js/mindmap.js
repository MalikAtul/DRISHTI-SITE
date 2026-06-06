/*  mindmap.js  --  3D Architecture Mindmap visualization
 *  Depends on: three.js (global THREE), OrbitControls, gsap
 */

document.addEventListener('DOMContentLoaded', () => {
  /* ------------------------------------------------------------------ */
  /*  1. SCENE / CAMERA / RENDERER                                      */
  /* ------------------------------------------------------------------ */
  const canvas = document.getElementById('mindmap-canvas');
  if (!canvas) return;

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    50,
    canvas.clientWidth / canvas.clientHeight,
    0.1,
    100
  );
  camera.position.set(0, 2, 18);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);

  /* ------------------------------------------------------------------ */
  /*  2. ORBIT CONTROLS                                                 */
  /* ------------------------------------------------------------------ */
  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enabled = true;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.5;
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.minDistance = 6;
  controls.maxDistance = 30;
  // Touch support works by default with OrbitControls

  /* ------------------------------------------------------------------ */
  /*  3. LIGHTING                                                       */
  /* ------------------------------------------------------------------ */
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);

  const dirLight1 = new THREE.DirectionalLight(0xff6b35, 0.8);
  dirLight1.position.set(5, 5, 5);
  scene.add(dirLight1);

  const dirLight2 = new THREE.DirectionalLight(0x00c8d4, 0.6);
  dirLight2.position.set(-5, 3, -3);
  scene.add(dirLight2);

  /* ------------------------------------------------------------------ */
  /*  4. NODE DEFINITIONS                                               */
  /* ------------------------------------------------------------------ */
  const COLORS = {
    orange:    0xFF6B35,
    orangeLt:  0xFF8F5E,
    green:     0x10B981,
    teal:      0x00C8D4,
    purple:    0x8B5CF6,
    purpleLt:  0xA78BFA,
  };

  const nodeData = [
    // Central
    { id: 'drishti',       label: 'DRISHTI SYSTEM',   color: COLORS.orange,   pos: [0, 0, 0],      r: 0.8, desc: 'Central ecosystem connecting both assistive devices' },

    // Left branch - Smart Gloves
    { id: 'gloves',        label: 'Smart Gloves',     color: COLORS.orange,   pos: [-6, 0, 0],     r: 0.6, desc: 'ISL gesture recognition to Hindi speech' },
    { id: 'esp32',         label: 'ESP32 ×2',    color: COLORS.green,    pos: [-9, 2, 1],     r: 0.35, desc: 'WiFi microcontroller, 50Hz UDP streaming' },
    { id: 'ads1115',       label: 'ADS1115',          color: COLORS.green,    pos: [-9, 0, 2],     r: 0.35, desc: '16-bit ADC for precise flex sensor readings' },
    { id: 'mpu6050',       label: 'MPU6050',          color: COLORS.green,    pos: [-9, -2, 1],    r: 0.35, desc: '6-axis IMU for wrist orientation tracking' },
    { id: 'flex',          label: 'Flex Sensors',     color: COLORS.orangeLt, pos: [-9, 1, -2],    r: 0.35, desc: 'Bend detection across 4 fingers' },
    { id: 'randomforest',  label: 'RandomForest ML',  color: COLORS.purple,   pos: [-7, 3, 0],     r: 0.4, desc: 'Trained classifier, 82%+ accuracy on ISL signs' },
    { id: 'pyttsx3',       label: 'pyttsx3 TTS',      color: COLORS.purpleLt, pos: [-7, -3, 0],    r: 0.4, desc: 'Offline Hindi text-to-speech engine' },

    // Right branch - KAI Locket
    { id: 'kai',           label: 'KAI Locket',       color: COLORS.teal,     pos: [6, 0, 0],      r: 0.6, desc: 'AI-powered seeing + hearing for the blind and deaf' },
    { id: 'pizero',        label: 'Pi Zero 2WH',      color: COLORS.green,    pos: [9, 2, 1],      r: 0.35, desc: 'Edge compute for KAI locket' },
    { id: 'picam',         label: 'Pi Camera',         color: COLORS.green,    pos: [9, 0, 2],      r: 0.35, desc: '5MP camera for object/currency/QR detection' },
    { id: 'inmp441',       label: 'INMP441 Mic',      color: COLORS.green,    pos: [9, -2, 1],     r: 0.35, desc: 'MEMS microphone for voice input' },
    { id: 'yolov8',        label: 'YOLOv8',           color: COLORS.teal,     pos: [7, 3, 0],      r: 0.4, desc: 'Nano model for real-time object detection' },
    { id: 'vosk',          label: 'Vosk STT',         color: COLORS.teal,     pos: [7, -3, 0],     r: 0.4, desc: 'Offline Hindi speech-to-text' },
    { id: 'gemini',        label: 'Gemini AI',        color: COLORS.purple,   pos: [9, 1, -2],     r: 0.4, desc: 'AI companion for conversational assistance' },

    // Bottom hub
    { id: 'pi4hub',        label: 'Raspberry Pi 4 Hub', color: COLORS.purple, pos: [0, -4, 0],     r: 0.5, desc: 'Central processing hub connecting both systems' },
  ];

  /* ------------------------------------------------------------------ */
  /*  5. CREATE SPHERE MESHES                                           */
  /* ------------------------------------------------------------------ */
  const nodeMeshes = [];       // { mesh, data }
  const meshById = {};

  nodeData.forEach((nd) => {
    const geo = new THREE.SphereGeometry(nd.r, 32, 32);
    const mat = new THREE.MeshStandardMaterial({
      color: nd.color,
      roughness: 0.35,
      metalness: 0.25,
      emissive: nd.color,
      emissiveIntensity: 0.15,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(nd.pos[0], nd.pos[1], nd.pos[2]);
    mesh.userData = nd;
    scene.add(mesh);
    const entry = { mesh, data: nd };
    nodeMeshes.push(entry);
    meshById[nd.id] = entry;
  });

  /* ------------------------------------------------------------------ */
  /*  6. CONNECTIONS (THREE.Line)                                       */
  /* ------------------------------------------------------------------ */
  const connectionPairs = [
    // Center connections
    ['drishti', 'gloves'],
    ['drishti', 'kai'],
    ['drishti', 'pi4hub'],
    // Gloves children
    ['gloves', 'esp32'],
    ['gloves', 'ads1115'],
    ['gloves', 'mpu6050'],
    ['gloves', 'flex'],
    ['gloves', 'randomforest'],
    ['gloves', 'pyttsx3'],
    // KAI children
    ['kai', 'pizero'],
    ['kai', 'picam'],
    ['kai', 'inmp441'],
    ['kai', 'yolov8'],
    ['kai', 'vosk'],
    ['kai', 'gemini'],
    // Pi4 Hub connections
    ['pi4hub', 'gloves'],
    ['pi4hub', 'kai'],
  ];

  const lineMat = new THREE.LineBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.15,
  });

  connectionPairs.forEach(([fromId, toId]) => {
    const from = meshById[fromId].mesh.position;
    const to = meshById[toId].mesh.position;
    const points = [from.clone(), to.clone()];
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geo, lineMat);
    scene.add(line);
  });

  /* ------------------------------------------------------------------ */
  /*  7. HTML LABEL OVERLAYS                                            */
  /* ------------------------------------------------------------------ */
  const labelContainer = document.createElement('div');
  labelContainer.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;overflow:hidden;';
  canvas.parentElement.style.position = 'relative';
  canvas.parentElement.appendChild(labelContainer);

  const labelEls = [];
  nodeData.forEach((nd) => {
    const el = document.createElement('div');
    el.className = 'node-label';
    el.textContent = nd.label;
    el.style.cssText =
      'position:absolute;font-family:"Orbitron",sans-serif;font-size:9px;color:#fff;' +
      'text-shadow:0 0 4px rgba(0,0,0,0.8),0 0 8px rgba(0,0,0,0.5);' +
      'white-space:nowrap;transform:translate(-50%,-50%);pointer-events:none;';
    labelContainer.appendChild(el);
    labelEls.push({ el, id: nd.id });
  });

  function updateLabels() {
    const rect = canvas.getBoundingClientRect();
    const w2 = rect.width / 2;
    const h2 = rect.height / 2;

    labelEls.forEach(({ el, id }) => {
      const mesh = meshById[id].mesh;
      const v = new THREE.Vector3().copy(mesh.position);
      v.project(camera);

      const x = v.x * w2 + w2;
      const y = -v.y * h2 + h2;

      // Hide if behind camera
      if (v.z > 1) {
        el.style.display = 'none';
      } else {
        el.style.display = '';
        el.style.left = x + 'px';
        el.style.top = y + 'px';
      }
    });
  }

  /* ------------------------------------------------------------------ */
  /*  8. NODE POPUP                                                     */
  /* ------------------------------------------------------------------ */
  let popup = document.getElementById('node-popup');
  if (!popup) {
    popup = document.createElement('div');
    popup.id = 'node-popup';
    popup.style.cssText =
      'display:none;position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);' +
      'background:rgba(10,10,20,0.95);border:1px solid rgba(255,107,53,0.4);' +
      'border-radius:12px;padding:24px 28px;color:#fff;font-family:"Orbitron",sans-serif;' +
      'z-index:1000;max-width:320px;text-align:center;backdrop-filter:blur(10px);';
    popup.innerHTML =
      '<h3 id="popup-title" style="margin:0 0 10px;font-size:14px;color:#FF6B35;"></h3>' +
      '<p id="popup-desc" style="margin:0 0 16px;font-size:12px;line-height:1.5;opacity:0.85;font-family:sans-serif;"></p>' +
      '<button id="popup-close" style="background:none;border:1px solid rgba(255,255,255,0.3);' +
      'color:#fff;padding:6px 18px;border-radius:6px;cursor:pointer;font-family:Orbitron,sans-serif;font-size:11px;">Close</button>';
    document.body.appendChild(popup);
  }

  const popupTitle = document.getElementById('popup-title');
  const popupDesc = document.getElementById('popup-desc');
  const popupClose = document.getElementById('popup-close');

  let selectedNode = null;
  let savedCamPos = null;
  let savedCamTarget = null;

  function showPopup(nd) {
    popupTitle.textContent = nd.label;
    popupDesc.textContent = nd.desc;
    popup.style.display = 'block';
  }

  function hidePopup() {
    popup.style.display = 'none';
    if (selectedNode) {
      // Reset emissive
      selectedNode.material.emissiveIntensity = 0.15;
      selectedNode = null;
    }
    // Return camera
    if (savedCamPos && savedCamTarget) {
      gsap.to(camera.position, {
        x: savedCamPos.x,
        y: savedCamPos.y,
        z: savedCamPos.z,
        duration: 1,
        ease: 'power2.inOut',
      });
      gsap.to(controls.target, {
        x: savedCamTarget.x,
        y: savedCamTarget.y,
        z: savedCamTarget.z,
        duration: 1,
        ease: 'power2.inOut',
      });
    }
  }

  popupClose.addEventListener('click', hidePopup);

  /* ------------------------------------------------------------------ */
  /*  9. RAYCASTER CLICK / TAP INTERACTION                              */
  /* ------------------------------------------------------------------ */
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();

  function onPointerDown(e) {
    // Ignore if popup is visible and click is on popup
    if (popup.style.display === 'block' && popup.contains(e.target)) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(pointer, camera);
    const meshes = nodeMeshes.map((n) => n.mesh);
    const intersects = raycaster.intersectObjects(meshes);

    if (intersects.length > 0) {
      const hit = intersects[0].object;
      const nd = hit.userData;

      // Save camera state before moving
      savedCamPos = camera.position.clone();
      savedCamTarget = controls.target.clone();

      // Reset previous selection
      if (selectedNode) {
        selectedNode.material.emissiveIntensity = 0.15;
      }

      // Highlight clicked node
      selectedNode = hit;
      hit.material.emissiveIntensity = 0.6;

      // Animate camera toward node
      const targetPos = hit.position.clone();
      const camOffset = new THREE.Vector3(0, 1, 6);
      const newCamPos = targetPos.clone().add(camOffset);

      gsap.to(camera.position, {
        x: newCamPos.x,
        y: newCamPos.y,
        z: newCamPos.z,
        duration: 1.2,
        ease: 'power2.inOut',
      });
      gsap.to(controls.target, {
        x: targetPos.x,
        y: targetPos.y,
        z: targetPos.z,
        duration: 1.2,
        ease: 'power2.inOut',
      });

      showPopup(nd);
    } else if (popup.style.display === 'block') {
      hidePopup();
    }
  }

  canvas.addEventListener('click', onPointerDown);
  canvas.addEventListener('touchend', (e) => {
    // Use changedTouches for touchend
    if (e.changedTouches && e.changedTouches.length > 0) {
      const touch = e.changedTouches[0];
      onPointerDown({
        clientX: touch.clientX,
        clientY: touch.clientY,
        target: e.target,
        touches: null,
      });
    }
  });

  /* ------------------------------------------------------------------ */
  /*  10. AUTO-ROTATE IDLE MANAGEMENT                                   */
  /* ------------------------------------------------------------------ */
  let idleTimer = null;
  const IDLE_DELAY = 3000;

  function resetIdleTimer() {
    controls.autoRotate = false;
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      controls.autoRotate = true;
    }, IDLE_DELAY);
  }

  ['pointerdown', 'pointermove', 'wheel', 'touchstart', 'touchmove'].forEach((evt) => {
    canvas.addEventListener(evt, resetIdleTimer, { passive: true });
  });

  // Start with auto-rotate on
  idleTimer = setTimeout(() => {
    controls.autoRotate = true;
  }, IDLE_DELAY);

  /* ------------------------------------------------------------------ */
  /*  11. INTERSECTION OBSERVER - PERFORMANCE                           */
  /* ------------------------------------------------------------------ */
  let isVisible = true;
  const section = document.getElementById('architecture') || canvas.closest('section');

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
      { threshold: 0.05 }
    );
    observer.observe(section);
  }

  /* ------------------------------------------------------------------ */
  /*  12. GENTLE NODE FLOAT ANIMATION                                   */
  /* ------------------------------------------------------------------ */
  const clock = new THREE.Clock();

  /* ------------------------------------------------------------------ */
  /*  13. ANIMATION LOOP                                                */
  /* ------------------------------------------------------------------ */
  function animate() {
    const t = clock.getElapsedTime();

    // Subtle float for nodes
    nodeMeshes.forEach(({ mesh, data }, i) => {
      const base = data.pos;
      mesh.position.y = base[1] + Math.sin(t * 0.8 + i * 0.7) * 0.08;
    });

    controls.update();
    updateLabels();
    renderer.render(scene, camera);
  }

  renderer.setAnimationLoop(animate);

  /* ------------------------------------------------------------------ */
  /*  14. RESIZE HANDLER                                                */
  /* ------------------------------------------------------------------ */
  function onResize() {
    const parent = canvas.parentElement;
    const w = parent.clientWidth;
    const h = parent.clientHeight;

    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  window.addEventListener('resize', onResize);
});
