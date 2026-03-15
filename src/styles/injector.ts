let counter = 0;

export function injectStyles(css: string): string {
  const id = `folio-editor-styles-${counter++}`;
  const style = document.createElement('style');
  style.id = id;
  style.textContent = css;
  document.head.appendChild(style);
  return id;
}

export function removeStyles(id: string): void {
  const el = document.getElementById(id);
  if (el) el.remove();
}
