const nextTick = (fn) => {
  requestAnimationFrame(() => {
    requestAnimationFrame(fn);
  });
};

export const useGlassHighlight = ({
  getEl,
  zIndex = 10,
  opacity = 1,
  offset = 1,
  enabled = true,
  data = {},
}) => {
  const isEnabled = () => {
    if (typeof enabled === "function") {
      return enabled();
    }
    return enabled;
  };
  const removeHoverHighlight = () => {
    const el = getEl();
    if (el && data.elScale) {
      data.elScale = false;
      el.style.scale = "";

      const onTransitionEnd = () => {
        el.style.transitionDuration = "";
        el.style.transitionTimingFunction = "";
        el.removeEventListener("transitionend", onTransitionEnd);
      };
      el.addEventListener("transitionend", onTransitionEnd);
    }

    if (data.lightElWrap) {
      const lightElWrap = data.lightElWrap;
      if (lightElWrap.style.opacity === "0") {
        lightElWrap.remove();
      } else {
        lightElWrap.addEventListener("transitionend", () => {
          lightElWrap.remove();
        });
        lightElWrap.style.opacity = 0;
      }
    }
  };

  const setLightPosition = (e) => {
    if (data.lightEl && data.maskRadius) {
      const { x, y } = e;
      const targetX = x - data.rect.x - data.maskRadius;
      const targetY = y - data.rect.y - data.maskRadius;

      // Initialize current position if not set
      if (data.currentMaskX === undefined) {
        data.currentMaskX = targetX;
        data.currentMaskY = targetY;
      }

      // Store target for lerping
      data.targetMaskX = targetX;
      data.targetMaskY = targetY;

      // Start lerp animation if not already running
      if (!data.isLerping) {
        data.isLerping = true;
        const lerpAnimation = () => {
          const lerpFactor = 0.09; // Smoothing factor (lower = smoother/slower)

          data.currentMaskX +=
            (data.targetMaskX - data.currentMaskX) * lerpFactor;
          data.currentMaskY +=
            (data.targetMaskY - data.currentMaskY) * lerpFactor;

          data.lightEl.style.maskPosition = `${data.currentMaskX}px ${data.currentMaskY}px`;
          data.lightEl.style.webkitMaskPosition = `${data.currentMaskX}px ${data.currentMaskY}px`;

          // Continue lerping if not close enough to target
          const distanceToTarget = Math.sqrt(
            Math.pow(data.targetMaskX - data.currentMaskX, 2) +
              Math.pow(data.targetMaskY - data.currentMaskY, 2)
          );

          if (distanceToTarget > 0.5) {
            requestAnimationFrame(lerpAnimation);
          } else {
            data.isLerping = false;
          }
        };
        requestAnimationFrame(lerpAnimation);
      }
    }
  };

  const onPointerEnter = (e) => {
    if (!isEnabled()) return;
    const d = data;
    const el = getEl();

    d.rect = el.getBoundingClientRect();
    const lightElWrap = document.createElement("span");
    lightElWrap.className = "rounded-[inherit]";
    lightElWrap.style = `left: ${offset}px; top: ${offset}px; right: ${offset}px; bottom: ${offset}px;transition-duration: 50ms; opacity: 0; position: absolute; overflow: hidden; pointer-events: none`;

    // Background layer with static color and animated mask
    const backgroundEl = document.createElement("span");
    backgroundEl.style.position = "absolute";
    backgroundEl.style.inset = "0";
    backgroundEl.style.backgroundColor = "color(srgb 8 8 8)";
    backgroundEl.style.pointerEvents = "none";

    // Fixed-size circular mask (200px diameter)
    const maskSize = 150;
    d.maskRadius = maskSize / 2;

    const targetHdrOpacity = 0.1 * opacity;
    // Start with 0 opacity in the mask gradient
    backgroundEl.style.maskImage = `radial-gradient(circle at center, rgba(0,0,0,${targetHdrOpacity}) 0%, transparent 70%)`;
    backgroundEl.style.maskSize = `${maskSize}px ${maskSize}px`;
    backgroundEl.style.webkitMaskSize = `${maskSize}px ${maskSize}px`;
    backgroundEl.style.maskPosition = "0px 0px";
    backgroundEl.style.webkitMaskPosition = "0px 0px";
    backgroundEl.style.maskRepeat = "no-repeat";
    backgroundEl.style.webkitMaskRepeat = "no-repeat";
    backgroundEl.style.opacity = `${opacity}`;

    d.lightEl = backgroundEl;
    d.lightElWrap = lightElWrap;
    d.backgroundEl = backgroundEl;
    setLightPosition(e);
    lightElWrap.append(backgroundEl);
    el.append(lightElWrap);
    if (e.pointerType !== "mouse") {
      if (e.pointerType !== "mouse") {
        d.elScale = true;
        let scale = 1.25;
        if (d.rect.width > 60 || d.rect.height > 60) {
          scale = 1.05;
        }
        el.style.scale = scale;
        el.style.transitionDuration = "50ms";
        el.style.transitionTimingFunction = "ease-in-out";
      }
    }

    nextTick(() => {
      lightElWrap.style.opacity = 1;
    });
  };

  const onPointerMove = (e) => {
    if (!isEnabled()) return;
    setLightPosition(e);
  };
  const onPointerLeave = (e) => {
    removeHoverHighlight();
  };
  const attachEvents = () => {
    const el = getEl();
    if (!el) return;
    el.addEventListener("pointerenter", onPointerEnter);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerleave", onPointerLeave);
  };
  const detachEvents = () => {
    const el = getEl();
    if (!el) return;
    el.removeEventListener("pointerenter", onPointerEnter);
    el.removeEventListener("pointermove", onPointerMove);
    el.removeEventListener("pointerleave", onPointerLeave);
  };

  return {
    removeHoverHighlight,
    attachEvents,
    detachEvents,
  };
};
