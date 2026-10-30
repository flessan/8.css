/**
 * Gesture wiring for the 8.css demos.
 *
 * 8.css ships no runtime JavaScript: this file is demo wiring, not package
 * code. It turns the edge gestures Windows 8 defines into events the demo
 * pages can act on, using Pointer Events so touch, pen and mouse behave the
 * same way.
 *
 *   right edge  -> charms
 *   left edge   -> app switcher, or snap when dragged slowly
 *   top/bottom  -> app bar
 *   swipe up    -> dismiss the lock screen
 *   long press  -> select a tile (press and hold)
 *   pinch in    -> semantic zoom
 *
 * Every gesture also has a keyboard equivalent in the demo pages.
 */
(() => {
  const EDGE = 24;
  const SLOP = 12;
  const LONG_PRESS = 520;

  const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

  const listen = (options) => {
    const controller = new AbortController();
    const { signal } = controller;
    const done = () => controller.abort();
    return { signal, done };
  };

  /**
   * Drag in from a screen edge.
   * progress(fraction) fires while dragging, commit()/cancel() on release.
   */
  function edgeSwipe(edge, { progress, commit, cancel, axis = "x", threshold = 0.35 } = {}) {
    const { signal, done } = listen();
    let start = null;
    let active = false;

    const startPoint = (event) => {
      const x = event.clientX;
      const y = event.clientY;
      const atEdge =
        (edge === "right" && x >= window.innerWidth - EDGE) ||
        (edge === "left" && x <= EDGE) ||
        (edge === "top" && y <= EDGE) ||
        (edge === "bottom" && y >= window.innerHeight - EDGE);
      return atEdge ? { x, y } : null;
    };

    const onDown = (event) => {
      if (active) return;
      start = startPoint(event);
      if (!start) return;
      active = true;
      start.id = event.pointerId;
      start.t = performance.now();
      progress?.(0);
    };

    const onMove = (event) => {
      if (!active || event.pointerId !== start.id) return;
      const travel = axis === "x" ? Math.abs(event.clientX - start.x) : Math.abs(event.clientY - start.y);
      const span = axis === "x" ? window.innerWidth : window.innerHeight;
      progress?.(Math.min(1, Math.max(0, travel / (span * 0.28))));
    };

    const onUp = (event) => {
      if (!active || event.pointerId !== start.id) return;
      active = false;
      const travel = axis === "x" ? Math.abs(event.clientX - start.x) : Math.abs(event.clientY - start.y);
      const span = axis === "x" ? window.innerWidth : window.innerHeight;
      const fraction = travel / (span * 0.28);
      fraction >= threshold ? commit?.() : cancel?.();
      start = null;
    };

    addEventListener("pointerdown", onDown, { signal });
    addEventListener("pointermove", onMove, { signal });
    addEventListener("pointerup", onUp, { signal });
    addEventListener("pointercancel", onUp, { signal });
    return done;
  }

  /** A single-finger swipe in one direction on an element. */
  function swipe(element, direction, callback, { distance: minimum = 40 } = {}) {
    if (!element) return () => {};
    const { signal, done } = listen();
    let start = null;

    element.addEventListener(
      "pointerdown",
      (event) => {
        start = { x: event.clientX, y: event.clientY, id: event.pointerId };
      },
      { signal },
    );
    element.addEventListener(
      "pointerup",
      (event) => {
        if (!start || event.pointerId !== start.id) return;
        const dx = event.clientX - start.x;
        const dy = event.clientY - start.y;
        start = null;
        const moved = { up: -dy, down: dy, left: -dx, right: dx };
        if (moved[direction] >= minimum && Math.abs(direction === "up" || direction === "down" ? dx : dy) < minimum) {
          callback(event);
        }
      },
      { signal },
    );
    return done;
  }

  /**
   * Press and hold, without triggering the native context menu. The click
   * that follows a completed long press is swallowed so the action is not
   * immediately undone by the release.
   */
  function longPress(element, callback, { duration = LONG_PRESS, swallowClick = true } = {}) {
    if (!element) return () => {};
    const { signal, done } = listen();
    let timer = null;
    let origin = null;
    let fired = false;

    const clear = () => {
      clearTimeout(timer);
      timer = null;
      origin = null;
    };

    element.addEventListener(
      "pointerdown",
      (event) => {
        if (event.pointerType === "mouse" && event.button !== 0) return;
        origin = { x: event.clientX, y: event.clientY };
        timer = setTimeout(() => {
          timer = null;
          fired = true;
          callback(event);
        }, duration);
      },
      { signal },
    );
    element.addEventListener(
      "pointermove",
      (event) => {
        if (!origin) return;
        if (distance(origin, { x: event.clientX, y: event.clientY }) > SLOP) clear();
      },
      { signal },
    );
    element.addEventListener("pointerup", clear, { signal });
    if (swallowClick) {
      element.addEventListener(
        "click",
        (event) => {
          if (!fired) return;
          fired = false;
          event.preventDefault();
          event.stopPropagation();
        },
        { capture: true, signal },
      );
    }
    element.addEventListener("pointercancel", clear, { signal });
    element.addEventListener(
      "contextmenu",
      (event) => {
        if (event.pointerType === "touch" || timer) event.preventDefault();
      },
      { signal },
    );
    return done;
  }

  /** Two-finger pinch on an element: onIn when fingers close, onOut when apart. */
  function pinch(element, { onIn, onOut, threshold = 0.85 } = {}) {
    if (!element) return () => {};
    const { signal, done } = listen();
    const points = new Map();
    let initial = 0;

    const spread = () => {
      const [a, b] = [...points.values()];
      return distance(a, b);
    };

    element.addEventListener(
      "pointerdown",
      (event) => {
        points.set(event.pointerId, { x: event.clientX, y: event.clientY });
        if (points.size === 2) initial = spread();
      },
      { signal },
    );
    element.addEventListener(
      "pointermove",
      (event) => {
        if (!points.has(event.pointerId)) return;
        points.set(event.pointerId, { x: event.clientX, y: event.clientY });
      },
      { signal },
    );
    const finish = (event) => {
      if (points.size === 2 && initial > 0) {
        const ratio = spread() / initial;
        if (ratio <= threshold) onIn?.();
        else if (ratio >= 1 / threshold) onOut?.();
      }
      points.delete(event.pointerId);
      if (points.size < 2) initial = 0;
    };
    element.addEventListener("pointerup", finish, { signal });
    element.addEventListener("pointercancel", finish, { signal });
    return done;
  }

  /** Drag along an axis and report the delta, used for the Start screen pan. */
  function dragPan(element, callback) {
    if (!element) return () => {};
    const { signal, done } = listen();
    let start = null;
    element.addEventListener(
      "pointerdown",
      (event) => {
        if (event.pointerType === "touch") return; // native panning is better
        start = { x: event.clientX, scroll: element.scrollLeft, id: event.pointerId };
      },
      { signal },
    );
    element.addEventListener(
      "pointermove",
      (event) => {
        if (!start || event.pointerId !== start.id) return;
        const dx = event.clientX - start.x;
        if (Math.abs(dx) > 4) {
          element.scrollLeft = start.scroll - dx;
          element.classList.add("w8-grab");
        }
      },
      { signal },
    );
    const stop = () => {
      if (!start) return;
      start = null;
      callback?.();
    };
    element.addEventListener("pointerup", stop, { signal });
    element.addEventListener("pointercancel", stop, { signal });
    return done;
  }

  window.W8Gestures = { edgeSwipe, swipe, longPress, pinch, dragPan, EDGE };
})();
