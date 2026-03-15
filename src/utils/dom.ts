/**
 * Measures the rendered height of a DOM element including margins.
 */
export function measureElementHeight(el: HTMLElement): number {
  const style = window.getComputedStyle(el);
  const marginTop = parseFloat(style.marginTop) || 0;
  const marginBottom = parseFloat(style.marginBottom) || 0;
  return el.getBoundingClientRect().height + marginTop + marginBottom;
}

/**
 * Gets the total content height of all direct children of a container.
 */
export function measureContentHeight(container: HTMLElement): number {
  let height = 0;
  for (let i = 0; i < container.children.length; i++) {
    height += measureElementHeight(container.children[i] as HTMLElement);
  }
  return height;
}

/**
 * Finds the index of the first child element that overflows the given max height.
 * Returns -1 if nothing overflows.
 */
export function findOverflowIndex(
  container: HTMLElement,
  maxHeight: number
): number {
  let accumulated = 0;
  for (let i = 0; i < container.children.length; i++) {
    accumulated += measureElementHeight(container.children[i] as HTMLElement);
    if (accumulated > maxHeight) {
      return i;
    }
  }
  return -1;
}

/**
 * Creates a hidden off-screen container for measuring content.
 */
export function createMeasurementContainer(
  width: number
): HTMLDivElement {
  const div = document.createElement('div');
  div.style.position = 'absolute';
  div.style.top = '-9999px';
  div.style.left = '-9999px';
  div.style.width = `${width}px`;
  div.style.visibility = 'hidden';
  document.body.appendChild(div);
  return div;
}

export function removeMeasurementContainer(div: HTMLDivElement): void {
  if (div.parentNode) {
    div.parentNode.removeChild(div);
  }
}
