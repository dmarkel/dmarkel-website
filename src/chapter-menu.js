// Native buttons keep chapter navigation usable with touch and keyboard.
export function createChapterMenu(chapters, { onSelect, onOpenChange }) {
  const toggle = document.querySelector('#chapter-toggle');
  const panel = document.querySelector('#chapter-panel');
  const list = document.querySelector('#chapter-list');
  if (!toggle || !panel || !list) return { setActive() {}, isOpen: () => false };
  let open = false;
  let active = 0;
  const buttons = chapters.map((chapter, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = chapter.label;
    button.addEventListener('click', () => {
      setOpen(false);
      onSelect(index);
    });
    list.appendChild(button);
    return button;
  });
  function setOpen(value) {
    open = value;
    panel.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    onOpenChange(open);
    if (open) buttons[active]?.focus();
    else toggle.focus();
  }
  toggle.addEventListener('click', () => setOpen(!open));
  document.addEventListener('pointerdown', event => {
    if (open && !panel.contains(event.target) && !toggle.contains(event.target)) setOpen(false);
  });
  panel.addEventListener('keydown', event => {
    // Prevent game controls from consuming navigation keys in the panel.
    event.stopPropagation();
    if (event.key === 'Escape') { event.preventDefault(); setOpen(false); }
    const index = buttons.indexOf(document.activeElement);
    if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1
        : (index + (event.key === 'ArrowDown' ? 1 : -1) + buttons.length) % buttons.length;
      buttons[next].focus();
    }
  });
  document.addEventListener('keydown', event => {
    if (open && event.key === 'Escape') { event.preventDefault(); setOpen(false); }
  });
  panel.addEventListener('focusout', () => queueMicrotask(() => {
    if (open && !panel.contains(document.activeElement) && document.activeElement !== toggle) setOpen(false);
  }));
  return {
    isOpen: () => open,
    setActive(index) {
      active = index;
      buttons.forEach((button, i) => {
        if (i === index) button.setAttribute('aria-current', 'location');
        else button.removeAttribute('aria-current');
      });
    },
  };
}
