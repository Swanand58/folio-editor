import { Node } from '@tiptap/core';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    svgBlock: {
      insertSvg: (options: { src: string; width?: number; height?: number }) => ReturnType;
    };
  }
}

const SVG_ALLOWED_TAGS = new Set([
  'svg', 'g', 'path', 'rect', 'circle', 'ellipse', 'line', 'polyline',
  'polygon', 'text', 'tspan', 'textpath', 'defs', 'use', 'symbol',
  'clippath', 'mask', 'pattern', 'lineargradient', 'radialgradient',
  'stop', 'filter', 'fegaussianblur', 'feoffset', 'feblend',
  'fecolormatrix', 'fecomposite', 'feflood', 'femerge', 'femergenode',
  'femorphology', 'marker', 'image', 'title', 'desc', 'metadata',
]);

const SVG_DANGEROUS_ATTRS = /^on/i;
const SVG_DANGEROUS_VALUES = /javascript:|data:/i;
const SVG_EXTERNAL_HREF_TAGS = new Set(['image', 'use']);
const SVG_HREF_ATTRS = new Set(['href', 'xlink:href']);

function isExternalUrl(value: string): boolean {
  const trimmed = value.trim();
  return /^(https?:|\/\/)/i.test(trimmed);
}

function sanitizeSvg(raw: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(raw, 'image/svg+xml');
  const errors = doc.querySelector('parsererror');
  if (errors) return '';

  const svg = doc.documentElement;
  if (svg.tagName.toLowerCase() !== 'svg') return '';

  function clean(el: Element): void {
    const tag = el.tagName.toLowerCase();
    if (!SVG_ALLOWED_TAGS.has(tag)) {
      el.remove();
      return;
    }
    for (const attr of Array.from(el.attributes)) {
      if (SVG_DANGEROUS_ATTRS.test(attr.name) || SVG_DANGEROUS_VALUES.test(attr.value)) {
        el.removeAttribute(attr.name);
        continue;
      }
      if (SVG_EXTERNAL_HREF_TAGS.has(tag) && SVG_HREF_ATTRS.has(attr.name) && isExternalUrl(attr.value)) {
        el.removeAttribute(attr.name);
      }
    }
    for (const child of Array.from(el.children)) {
      clean(child);
    }
  }

  clean(svg);
  return svg.outerHTML;
}

export const SvgBlock = Node.create<Record<string, never>, Record<string, never>>({
  name: 'svgBlock',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      src: { default: '' },
      width: { default: null },
      height: { default: null },
    };
  },

  parseHTML() {
    return [{
      tag: 'div[data-svg-block]',
      getAttrs: (el) => {
        if (typeof el === 'string') return false;
        return {
          src: el.getAttribute('data-src') || el.innerHTML || '',
          width: el.getAttribute('data-width') ? Number(el.getAttribute('data-width')) : null,
          height: el.getAttribute('data-height') ? Number(el.getAttribute('data-height')) : null,
        };
      },
    }];
  },

  renderHTML({ node }) {
    return ['div', {
      'data-svg-block': '',
      'data-src': node.attrs.src,
      ...(node.attrs.width ? { 'data-width': String(node.attrs.width) } : {}),
      ...(node.attrs.height ? { 'data-height': String(node.attrs.height) } : {}),
      style: 'text-align:center;margin:16px 0;',
    }];
  },

  addNodeView() {
    return ({ node, editor, getPos }) => {
      const dom = document.createElement('div');
      dom.setAttribute('data-svg-block', '');
      Object.assign(dom.style, {
        textAlign: 'center',
        margin: '16px 0',
        cursor: 'default',
        borderRadius: '4px',
        transition: 'outline 0.15s',
      });

      const safe = sanitizeSvg(node.attrs.src);
      if (safe) {
        dom.innerHTML = safe;
      } else {
        dom.textContent = 'Invalid or unsafe SVG';
        Object.assign(dom.style, { color: '#999', fontStyle: 'italic', padding: '20px' });
      }

      const svg = dom.querySelector('svg');
      if (svg) {
        if (node.attrs.width) svg.setAttribute('width', String(node.attrs.width));
        if (node.attrs.height) svg.setAttribute('height', String(node.attrs.height));
        svg.style.maxWidth = '100%';
        svg.style.height = 'auto';
        svg.style.pointerEvents = 'none';
      }

      dom.addEventListener('mousedown', (e) => {
        e.preventDefault();
        const pos = getPos();
        if (typeof pos === 'number') editor.commands.setNodeSelection(pos);
      });

      return {
        dom,
        selectNode() { dom.style.outline = '2px solid #68CEF8'; dom.style.outlineOffset = '2px'; },
        deselectNode() { dom.style.outline = ''; dom.style.outlineOffset = ''; },
      };
    };
  },

  addCommands() {
    return {
      insertSvg: (options) => ({ commands }) => {
        return commands.insertContent({ type: this.name, attrs: options });
      },
    };
  },
});
