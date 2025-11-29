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
      el.style.translate = "";

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

    // Reset stretch state and transform origin
    const el2 = getEl();
    if (el2) {
      el2.style.transformOrigin = "";
    }
    data.isDragging = false;
    data.dragStartX = undefined;
    data.dragStartY = undefined;
    data.stretchX = 0;
    data.stretchY = 0;
  };

  const updateStretch = (e) => {
    if (
      !data.rect ||
      !data.isDragging ||
      data.dragStartX === undefined ||
      data.dragStartY === undefined
    )
      return;

    const el = getEl();

    if (!el) return;

    const x = e.clientX;
    const y = e.clientY;
    const rect = data.rect;

    // Calculate delta from drag start position
    const deltaX = x - data.dragStartX;
    const deltaY = y - data.dragStartY;

    // Apply damping to create elastic feel (max 30px stretch)
    const maxStretch = 40;
    const dampingFactor = 0.2;
    const stretchX = Math.max(
      -maxStretch,
      Math.min(maxStretch, deltaX * dampingFactor)
    );
    const stretchY = Math.max(
      -maxStretch,
      Math.min(maxStretch, deltaY * dampingFactor)
    );

    // Calculate how far outside bounds the pointer is
    let distanceOutsideX = 0;
    let distanceOutsideY = 0;

    if (x < rect.left) {
      distanceOutsideX = rect.left - x;
    } else if (x > rect.right) {
      distanceOutsideX = x - rect.right;
    }

    if (y < rect.top) {
      distanceOutsideY = rect.top - y;
    } else if (y > rect.bottom) {
      distanceOutsideY = y - rect.bottom;
    }

    // Calculate scale based on distance outside bounds (smooth transition)
    const maxScaleDistance = 100; // Distance for max scale
    const scaleXAmount = Math.min(distanceOutsideX / maxScaleDistance, 1) * 0.1; // Max 10% scale per axis
    const scaleYAmount = Math.min(distanceOutsideY / maxScaleDistance, 1) * 0.1;

    // Base scale for press-down effect (1.02 = 2% larger when pressed)
    const baseScale = 1.02;
    const scaleX = baseScale + scaleXAmount;
    const scaleY = baseScale + scaleYAmount;

    // Set transform origin based on where the cursor is relative to the element
    let originX = "50%";
    let originY = "50%";

    if (x < rect.left) {
      originX = "100%"; // Scale from right edge when pulling left
    } else if (x > rect.right) {
      originX = "0%"; // Scale from left edge when pulling right
    }

    if (y < rect.top) {
      originY = "100%"; // Scale from bottom edge when pulling up
    } else if (y > rect.bottom) {
      originY = "0%"; // Scale from top edge when pulling down
    }

    el.style.transformOrigin = `${originX} ${originY}`;

    data.stretchX = stretchX;
    data.stretchY = stretchY;

    // Apply translation and non-uniform scale
    el.style.transform = `translate(${stretchX}px, ${stretchY}px) scale(${scaleX}, ${scaleY})`;
  };

  const setLightPosition = (e) => {
    if (data.lightEl && data.maskRadius && data.rect) {
      const x = e.clientX;
      const y = e.clientY;
      const rect = data.rect;

      // Calculate cursor position relative to element
      const cursorX = x - rect.x;
      const cursorY = y - rect.y;

      // Clamp cursor position to element bounds
      const clampedCursorX = Math.max(0, Math.min(rect.width, cursorX));
      const clampedCursorY = Math.max(0, Math.min(rect.height, cursorY));

      // Calculate mask position (center of mask at cursor position)
      // Subtract maskRadius to position the center, not the top-left
      let targetX = clampedCursorX - data.maskRadius;
      let targetY = clampedCursorY - data.maskRadius;

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

    // If we're dragging and highlight already exists, just update rect and return
    if (d.isDragging && d.lightElWrap) {
      d.rect = el.getBoundingClientRect();
      return;
    }

    // Clean up any existing highlight before creating a new one
    if (d.lightElWrap) {
      d.lightElWrap.remove();
      d.lightElWrap = null;
      d.lightEl = null;
      d.backgroundEl = null;
    }

    d.rect = el.getBoundingClientRect();
    const lightElWrap = document.createElement("span");
    lightElWrap.className = "rounded-[inherit]";
    lightElWrap.style = `left: ${offset}px; top: ${offset}px; right: ${offset}px; bottom: ${offset}px;transition-duration: 50ms; opacity: 0; position: absolute; overflow: hidden; pointer-events: none`;

    // Background layer with static color and animated mask
    const backgroundEl = document.createElement("span");
    backgroundEl.style.position = "absolute";
    backgroundEl.style.inset = "0";
    backgroundEl.style.pointerEvents = "none";
    backgroundEl.style.transition = "background-color 150ms ease-out";

    // Fixed-size circular mask (200px diameter)
    const maskSize = 150;
    d.maskRadius = maskSize / 2;

    const hoverOpacity = 0.5 * opacity;
    const dragOpacity = 0.1 * opacity;

    // Check if we're currently dragging to set appropriate colors
    const isDragging = d.isDragging === true;
    const bgColor = isDragging ? "color(srgb 8 8 8)" : "#fff";
    const maskOpacity = isDragging ? dragOpacity : hoverOpacity;

    backgroundEl.style.backgroundColor = bgColor;
    backgroundEl.style.maskImage = `radial-gradient(circle at center, rgba(0,0,0,${maskOpacity}) 0%, transparent 70%)`;
    backgroundEl.style.maskSize = `${maskSize}px ${maskSize}px`;
    backgroundEl.style.webkitMaskSize = `${maskSize}px ${maskSize}px`;
    backgroundEl.style.maskPosition = "0px 0px";
    backgroundEl.style.webkitMaskPosition = "0px 0px";
    backgroundEl.style.maskRepeat = "no-repeat";
    backgroundEl.style.webkitMaskRepeat = "no-repeat";
    backgroundEl.style.opacity = `${opacity}`;

    // Store for later updates
    d.maskSize = maskSize;
    d.hoverOpacity = hoverOpacity;

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
    updateStretch(e);
  };

  const onGlobalPointerMove = (e) => {
    if (!isEnabled() || !data.isDragging) return;
    setLightPosition(e);
    updateStretch(e);
  };

  const onPointerDown = (e) => {
    if (!isEnabled()) return;

    // On touch devices, pointerenter might not fire, so create highlight if it doesn't exist
    if (!data.lightElWrap) {
      onPointerEnter(e);
    }

    data.isDragging = true;
    data.dragStartX = e.clientX;
    data.dragStartY = e.clientY;
    const el = getEl();
    if (el) {
      el.style.transitionDuration = "150ms";
      el.style.transitionTimingFunction = "cubic-bezier(0.34, 1.56, 0.64, 1)";
      // Apply initial press-down scale
      el.style.transform = "translate(0px, 0px) scale(1.02, 1.02)";

      // Then remove transition for smooth dragging
      setTimeout(() => {
        if (data.isDragging && el) {
          el.style.transitionDuration = "0ms";
        }
      }, 150);
    }
    // Change glow color and opacity when dragging
    if (data.backgroundEl && data.maskSize !== undefined) {
      data.backgroundEl.style.backgroundColor = "color(srgb 8 8 8)";
      const dragOpacity = 0.1 * opacity;
      data.backgroundEl.style.maskImage = `radial-gradient(circle at center, rgba(0,0,0,${dragOpacity}) 0%, transparent 70%)`;
    }
    // Attach global listeners for tracking outside element bounds
    document.addEventListener("pointermove", onGlobalPointerMove);
    document.addEventListener("pointerup", onGlobalPointerUp);
    document.addEventListener("pointercancel", onGlobalPointerCancel);
  };

  const onGlobalPointerUp = (e) => {
    if (!isEnabled()) return;
    data.isDragging = false;
    data.dragStartX = undefined;
    data.dragStartY = undefined;

    const el = getEl();
    if (el) {
      // Elastic spring-back animation
      el.style.transitionDuration = "300ms";
      el.style.transitionTimingFunction = "cubic-bezier(0.34, 1.56, 0.64, 1)";
      el.style.transform = "translate(0px, 0px) scale(1, 1)";

      data.stretchX = 0;
      data.stretchY = 0;
    }

    // Remove global listeners
    document.removeEventListener("pointermove", onGlobalPointerMove);
    document.removeEventListener("pointerup", onGlobalPointerUp);
    document.removeEventListener("pointercancel", onGlobalPointerCancel);

    // Remove highlight after release
    removeHoverHighlight();
  };

  const onGlobalPointerCancel = (e) => {
    if (!isEnabled()) return;
    data.isDragging = false;
    data.dragStartX = undefined;
    data.dragStartY = undefined;

    const el = getEl();
    if (el) {
      // Elastic spring-back animation
      el.style.transitionDuration = "300ms";
      el.style.transitionTimingFunction = "cubic-bezier(0.34, 1.56, 0.64, 1)";
      el.style.transform = "translate(0px, 0px) scale(1, 1)";

      data.stretchX = 0;
      data.stretchY = 0;
    }

    // Remove global listeners
    document.removeEventListener("pointermove", onGlobalPointerMove);
    document.removeEventListener("pointerup", onGlobalPointerUp);
    document.removeEventListener("pointercancel", onGlobalPointerCancel);

    // Remove highlight after cancel
    removeHoverHighlight();
  };

  const onPointerLeave = (e) => {
    // Don't remove highlight if dragging - keep tracking globally
    if (!data.isDragging) {
      removeHoverHighlight();
    }
  };

  const attachEvents = () => {
    const el = getEl();
    if (!el) return;
    el.addEventListener("pointerenter", onPointerEnter);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointerleave", onPointerLeave);
  };

  const detachEvents = () => {
    const el = getEl();
    if (!el) return;
    el.removeEventListener("pointerenter", onPointerEnter);
    el.removeEventListener("pointermove", onPointerMove);
    el.removeEventListener("pointerdown", onPointerDown);
    el.removeEventListener("pointerleave", onPointerLeave);

    // Clean up any global listeners that might still be attached
    document.removeEventListener("pointermove", onGlobalPointerMove);
    document.removeEventListener("pointerup", onGlobalPointerUp);
    document.removeEventListener("pointercancel", onGlobalPointerCancel);
  };

  return {
    removeHoverHighlight,
    attachEvents,
    detachEvents,
  };
};
