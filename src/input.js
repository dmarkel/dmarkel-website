const movementKeys = new Set(["ArrowLeft", "ArrowRight", "KeyA", "KeyD"]);
const jumpKeys = new Set(["Space", "ArrowUp", "KeyW"]);

export function createInput({ joystick, joystickKnob, jumpButton }) {
  const keys = new Set();
  let joystickValue = 0;
  let jumpQueued = false;
  let joystickPointer = null;

  const resetJoystick = (event) => {
    if (event && joystickPointer !== null && event.pointerId !== joystickPointer) return;
    joystickPointer = null;
    joystickValue = 0;
    joystickKnob.style.transform = "translate3d(0, 0, 0)";
    joystick.classList.remove("is-active");
  };

  const reset = () => {
    keys.clear();
    jumpQueued = false;
    resetJoystick();
    jumpButton.classList.remove("is-active");
  };

  const relevant = (code) => movementKeys.has(code) || jumpKeys.has(code);

  window.addEventListener("keydown", (event) => {
    if (!relevant(event.code)) return;
    event.preventDefault();
    keys.add(event.code);
    if (jumpKeys.has(event.code) && !event.repeat) jumpQueued = true;
  });

  window.addEventListener("keyup", (event) => {
    keys.delete(event.code);
  });
  window.addEventListener("blur", reset);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) reset();
  });

  const updateJoystick = (event) => {
    if (event.pointerId !== joystickPointer) return;
    const rect = joystick.getBoundingClientRect();
    const radius = rect.width * 0.3;
    const centerX = rect.left + rect.width / 2;
    const dx = Math.max(-radius, Math.min(radius, event.clientX - centerX));
    const normalized = dx / radius;
    joystickValue = Math.abs(normalized) < 0.18 ? 0 : normalized;
    joystickKnob.style.transform = `translate3d(${dx}px, 0, 0)`;
  };

  joystick.addEventListener("pointerdown", (event) => {
    joystickPointer = event.pointerId;
    joystick.setPointerCapture(event.pointerId);
    joystick.classList.add("is-active");
    updateJoystick(event);
  });
  joystick.addEventListener("pointermove", updateJoystick);
  joystick.addEventListener("pointerup", resetJoystick);
  joystick.addEventListener("pointercancel", resetJoystick);
  joystick.addEventListener("lostpointercapture", resetJoystick);

  const releaseJump = () => jumpButton.classList.remove("is-active");
  jumpButton.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    jumpButton.setPointerCapture(event.pointerId);
    jumpButton.classList.add("is-active");
    jumpQueued = true;
  });
  jumpButton.addEventListener("pointerup", releaseJump);
  jumpButton.addEventListener("pointercancel", releaseJump);
  jumpButton.addEventListener("lostpointercapture", releaseJump);

  return {
    snapshot() {
      const keyboard = (keys.has("ArrowRight") || keys.has("KeyD") ? 1 : 0)
        - (keys.has("ArrowLeft") || keys.has("KeyA") ? 1 : 0);
      const result = {
        move: Math.max(-1, Math.min(1, keyboard + joystickValue)),
        jumpPressed: jumpQueued
      };
      jumpQueued = false;
      return result;
    },
    reset
  };
}
