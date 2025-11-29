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
      const offsetX = x - data.rect.x - data.maskRadius;
      const offsetY = y - data.rect.y - data.maskRadius;
      data.lightEl.style.maskPosition = `${offsetX}px ${offsetY}px`;
      data.lightEl.style.webkitMaskPosition = `${offsetX}px ${offsetY}px`;
    }
  };

  const onPointerEnter = (e) => {
    if (!isEnabled()) return;
    const d = data;
    const el = getEl();

    d.rect = el.getBoundingClientRect();
    const lightElWrap = document.createElement("span");
    lightElWrap.className = "rounded-[inherit]";
    lightElWrap.style = `left: ${offset}px; top: ${offset}px; right: ${offset}px; bottom: ${offset}px;transition-duration: 300ms; opacity: 0; position: absolute; overflow: hidden; pointer-events: none`;

    // Background layer with static color and animated mask
    const backgroundEl = document.createElement("span");
    backgroundEl.style.position = "absolute";
    backgroundEl.style.inset = "0";
    backgroundEl.style.backgroundColor = "color(srgb 8 8 8)";
    backgroundEl.style.pointerEvents = "none";

    // Fixed-size circular mask (200px diameter)
    const maskSize = 150;
    d.maskRadius = maskSize / 2;

    const hdrOpacity = 0.1 * opacity;
    // Apply mask with gradient: 90% opacity at center fading to transparent
    backgroundEl.style.maskImage = `radial-gradient(circle at center, rgba(0,0,0,${hdrOpacity}) 0%, transparent 70%)`;
    // backgroundEl.style.webkitMaskImage = `radial-gradient(circle at center, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 40%, transparent 70%)`;
    backgroundEl.style.maskSize = `${maskSize}px ${maskSize}px`;
    backgroundEl.style.webkitMaskSize = `${maskSize}px ${maskSize}px`;
    backgroundEl.style.maskPosition = "0px 0px";
    backgroundEl.style.webkitMaskPosition = "0px 0px";
    backgroundEl.style.maskRepeat = "no-repeat";
    backgroundEl.style.webkitMaskRepeat = "no-repeat";
    backgroundEl.style.opacity = `${opacity}`;

    d.lightEl = backgroundEl;
    d.lightElWrap = lightElWrap;
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
        el.style.transitionDuration = "500ms";
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
