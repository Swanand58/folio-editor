const STYLE_ID = 'folio-editor-styles';

export function injectStyles(css: string): void {
  removeStyles();
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = css;
  document.head.appendChild(style);
}

export function removeStyles(): void {
  const existing = document.getElementById(STYLE_ID);
  if (existing) {
    existing.remove();
  }
}
