/*  hero.js  --  Hero section Three.js scene with dual-product zoom animation
 *  Depends on: three.js (global THREE), gsap + ScrollTrigger
 */

document.addEventListener('DOMContentLoaded', () => {
  /* ------------------------------------------------------------------ */
  /*  1. SCENE / CAMERA / RENDERER                                      */
  /* ------------------------------------------------------------------ */
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    45,
    canvas.clientWidth / canvas.clientHeight,
    0.1,
    100
  );
  camera.position.set(0, 0, 12);

  const isMobile = /Mobi|Android/i.test(navigator.userAgent);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
  });
  renderer.setPixelRatio(isMobile ? 1 : Math.min(window.devicePixelRatio, 2));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);

  /* ------------------------------------------------------------------ */
  /*  2. PRODUCT PLACEHOLDER GROUPS                                     */
  /* ------------------------------------------------------------------ */

  // -- Glove (left) ---------------------------------------------------
  const gloveGroup = new THREE.Group();

  const gloveMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#1a1a1a'),
    roughness: 0.45,
    metalness: 0.3,
  });

  // Palm
  const palm = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 1.6, 0.4),
    gloveMat
  );
  gloveGroup.add(palm);

  // Fingers (four + thumb)
  const fingerGeo = new THREE.CylinderGeometry(0.12, 0.1, 1.0, 8);
  const fingerOffsets = [-0.36, -0.12, 0.12, 0.36];
  fingerOffsets.forEach((xOff) => {
    const finger = new THREE.Mesh(fingerGeo, gloveMat);
    finger.position.set(xOff, 1.25, 0);
    gloveGroup.add(finger);
  });

  // Thumb
  const thumb = new THREE.Mesh(
    new THREE.CylinderGeometry(0.13, 0.11, 0.75, 8),
    gloveMat
  );
  thumb.position.set(-0.75, 0.2, 0);
  thumb.rotation.z = Math.PI / 4;
  gloveGroup.add(thumb);

  gloveGroup.position.set(-2, 0, -12);
  gloveGroup.scale.set(0.08, 0.08, 0.08);
  scene.add(gloveGroup);

  // -- Locket (right) -------------------------------------------------
  const locketGroup = new THREE.Group();

  const locketMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#1a1a1a'),
    roughness: 0.3,
    metalness: 0.6,
  });

  // Locket body
  const locketBody = new THREE.Mesh(
    new THREE.CylinderGeometry(0.7, 0.7, 0.25, 32),
    locketMat
  );
  locketBody.rotation.x = Math.PI / 2;
  locketGroup.add(locketBody);

  // Chain loop
  const chainLoop = new THREE.Mesh(
    new THREE.TorusGeometry(0.2, 0.04, 12, 24),
    locketMat
  );
  chainLoop.position.set(0, 0.8, 0);
  locketGroup.add(chainLoop);

  locketGroup.position.set(2, 0, -12);
  locketGroup.scale.set(0.08, 0.08, 0.08);
  scene.add(locketGroup);

  /* ------------------------------------------------------------------ */
  /*  3. LIGHTING                                                        */
  /* ------------------------------------------------------------------ */
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
  scene.add(ambientLight);

  const orangeLight = new THREE.DirectionalLight(0xff6b35, 1.4);
  orangeLight.position.set(4, 5, 4);
  scene.add(orangeLight);

  const purpleLight = new THREE.DirectionalLight(0x7c3aed, 0.5);
  purpleLight.position.set(-3, 2, -3);
  scene.add(purpleLight);

  const frontLight = new THREE.DirectionalLight(0xffffff, 0.8);
  frontLight.position.set(0, -2, 6);
  scene.add(frontLight);

  /* ------------------------------------------------------------------ */
  /*  4. AUTO-ZOOM ANIMATION  (triggered by 'loaderComplete')           */
  /* ------------------------------------------------------------------ */
  const gloveTargetColor = new THREE.Color('#FF6B35'); // orange-tinted
  const locketTargetColor = new THREE.Color('#2a2a2a'); // dark metallic
  const startColor = new THREE.Color('#1a1a1a');

  let zoomDone = false;

  function startZoomAnimation() {
    if (typeof gsap === 'undefined') return;
    if (typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
    }

    const heroTL = gsap.timeline({
      delay: 0.2,
      onUpdate: function () {
        const p = this.progress();

        // Interpolate material colours
        gloveMat.color.copy(startColor).lerp(gloveTargetColor, p);
        locketMat.color.copy(startColor).lerp(locketTargetColor, p);

        // Gradually increase light intensities
        ambientLight.intensity = 0.3 + 0.5 * p;
        orangeLight.intensity = 1.4 + 0.6 * p;
        purpleLight.intensity = 0.5 + 0.4 * p;
        frontLight.intensity = 0.8 + 0.4 * p;
      },
      onComplete: function () {
        zoomDone = true;
      },
    });

    heroTL
      .to([gloveGroup.position, locketGroup.position], {
        z: 0,
        duration: 2.5,
        ease: 'power2.inOut',
        stagger: 0.15,
      })
      .to(
        [gloveGroup.scale, locketGroup.scale],
        {
          x: 1,
          y: 1,
          z: 1,
          duration: 2.5,
          ease: 'power2.inOut',
        },
        '<'
      )
      .fromTo(
        '#hero-content',
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' },
        '-=1'
      );
  }

  window.addEventListener('loaderComplete', startZoomAnimation);

  /* ------------------------------------------------------------------ */
  /*  5 & 6. ANIMATION LOOP + INTERSECTION OBSERVER                    */
  /* ------------------------------------------------------------------ */
  function animate() {
    if (zoomDone) {
      gloveGroup.rotation.y += 0.003;
      locketGroup.rotation.y -= 0.003;
    }
    renderer.render(scene, camera);
  }

  // Only run render loop when the hero section is visible
  const heroSection =
    canvas.closest('section') || canvas.closest('.hero') || canvas.parentElement;

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

  if (heroSection) {
    observer.observe(heroSection);
  } else {
    // Fallback: always run
    renderer.setAnimationLoop(animate);
  }

  /* ------------------------------------------------------------------ */
  /*  RESIZE HANDLER (debounced 150ms)                                  */
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

  /* ------------------------------------------------------------------ */
  /*  7. EXPOSE FOR OTHER SCRIPTS                                       */
  /* ------------------------------------------------------------------ */
  window.gloveGroup = gloveGroup;
  window.locketGroup = locketGroup;
});
