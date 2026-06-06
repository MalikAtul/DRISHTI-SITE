(function () {
  "use strict";

  var RADIUS_MOUSE = 80;
  var RADIUS_TOUCH = 40;
  var STRENGTH = 0.35;
  var TRANSITION = "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)";

  var prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  function splitIntoSpans(el) {
    var text = el.textContent;
    el.textContent = "";

    var spans = [];

    for (var i = 0; i < text.length; i++) {
      var span = document.createElement("span");
      span.style.display = "inline-block";
      span.style.transition = TRANSITION;

      if (text[i] === " ") {
        span.innerHTML = " ";
      } else {
        span.textContent = text[i];
      }

      el.appendChild(span);
      spans.push(span);
    }

    return spans;
  }

  function applyDistortion(spans, mouseX, mouseY, radius) {
    for (var i = 0; i < spans.length; i++) {
      var rect = spans[i].getBoundingClientRect();
      var centerX = rect.left + rect.width / 2;
      var centerY = rect.top + rect.height / 2;

      var dx = mouseX - centerX;
      var dy = mouseY - centerY;
      var dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < radius) {
        var force = (radius - dist) / radius;
        var tx = -dx * force * STRENGTH;
        var ty = -dy * force * STRENGTH;
        spans[i].style.transform = "translate(" + tx + "px, " + ty + "px)";
      } else {
        spans[i].style.transform = "translate(0, 0)";
      }
    }
  }

  function resetSpans(spans) {
    for (var i = 0; i < spans.length; i++) {
      spans[i].style.transform = "translate(0, 0)";
    }
  }

  function init() {
    if (prefersReducedMotion) return;

    var elements = document.querySelectorAll(".mag-text");

    for (var j = 0; j < elements.length; j++) {
      (function (el) {
        var spans = splitIntoSpans(el);

        el.addEventListener("mousemove", function (e) {
          applyDistortion(spans, e.clientX, e.clientY, RADIUS_MOUSE);
        });

        el.addEventListener("mouseleave", function () {
          resetSpans(spans);
        });

        el.addEventListener(
          "touchmove",
          function (e) {
            var touch = e.touches[0];
            applyDistortion(spans, touch.clientX, touch.clientY, RADIUS_TOUCH);
          },
          { passive: true }
        );

        el.addEventListener("touchend", function () {
          resetSpans(spans);
        });
      })(elements[j]);
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();
