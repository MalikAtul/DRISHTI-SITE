document.addEventListener('DOMContentLoaded', () => {
  if (window.innerWidth < 1024) return;

  const sizes = [14, 13, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2];
  const opacities = [1.0, 0.85, 0.7, 0.58, 0.46, 0.36, 0.27, 0.20, 0.14, 0.09, 0.05, 0.02];
  const squares = [];

  for (let i = 0; i < 12; i++) {
    const el = document.createElement('div');
    el.classList.add('csq');
    el.style.width = sizes[i] + 'px';
    el.style.height = sizes[i] + 'px';
    el.style.opacity = opacities[i];
    document.body.appendChild(el);
    squares.push({ el, x: 0, y: 0 });
  }

  let mouseX = 0;
  let mouseY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function lerp(start, end, factor) {
    return start + (end - start) * factor;
  }

  let isHovering = false;

  function animate() {
    squares[0].x = lerp(squares[0].x, mouseX, 0.88);
    squares[0].y = lerp(squares[0].y, mouseY, 0.88);

    for (let i = 1; i < squares.length; i++) {
      squares[i].x = lerp(squares[i].x, squares[i - 1].x, 0.62);
      squares[i].y = lerp(squares[i].y, squares[i - 1].y, 0.62);
    }

    for (let i = 0; i < squares.length; i++) {
      const s = squares[i];
      if (i === 0 && isHovering) {
        s.el.style.transform = 'translate(' + s.x + 'px,' + s.y + 'px) translate(-50%,-50%) scale(2.5)';
      } else {
        s.el.style.transform = 'translate(' + s.x + 'px,' + s.y + 'px) translate(-50%,-50%)';
      }
    }

    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);

  // Detect dark/light sections
  const lightSectionIds = ['problem', 'gloves', 'how-it-works', 'isl-gallery', 'tech-stack', 'creator'];
  let onLight = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        const isLight = lightSectionIds.includes(id);
        if (isLight !== onLight) {
          onLight = isLight;
          squares.forEach((s) => {
            s.el.classList.toggle('on-light', onLight);
          });
        }
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('section[id]').forEach((section) => {
    observer.observe(section);
  });

  // Hover effect on interactive elements
  document.querySelectorAll('a, button, .card, [data-magnetic]').forEach((el) => {
    el.addEventListener('mouseenter', () => {
      isHovering = true;
      squares[0].el.classList.add('hovering');
    });
    el.addEventListener('mouseleave', () => {
      isHovering = false;
      squares[0].el.classList.remove('hovering');
    });
  });
});
