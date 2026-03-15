import { Node } from '@tiptap/core';

const DEFAULT_COLORS = [
  '#4285f4', '#ea4335', '#fbbc04', '#34a853',
  '#ff6d01', '#46bdc6', '#7baaf7', '#f07b72',
];

export interface ChartConfig {
  type: 'bar' | 'line' | 'pie';
  labels: string[];
  values: number[];
  title?: string;
  colors?: string[];
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    chartBlock: {
      insertChart: (config: ChartConfig) => ReturnType;
    };
  }
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/** Validate a CSS color value — only allow hex, rgb(), hsl(), and named colors. */
function safeColor(c: string): string {
  if (/^#[0-9a-fA-F]{3,8}$/.test(c)) return c;
  if (/^(rgb|hsl)a?\(\s*[\d.,\s%]+\)$/.test(c)) return c;
  if (/^[a-zA-Z]{1,30}$/.test(c)) return c;
  return '#999';
}

function renderBarChart(c: ChartConfig): string {
  const { labels, values, title, colors = DEFAULT_COLORS } = c;
  const w = 500, h = 300;
  const pad = { t: title ? 40 : 20, r: 20, b: 50, l: 50 };
  const cw = w - pad.l - pad.r, ch = h - pad.t - pad.b;
  const max = Math.max(...values, 1);
  const bw = cw / labels.length * 0.7;
  const bg = cw / labels.length * 0.3;

  let s = `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" style="font-family:-apple-system,sans-serif">`;
  if (title) s += `<text x="${w / 2}" y="24" text-anchor="middle" font-size="14" font-weight="600" fill="#333">${esc(title)}</text>`;

  s += `<line x1="${pad.l}" y1="${pad.t}" x2="${pad.l}" y2="${pad.t + ch}" stroke="#ddd"/>`;
  s += `<line x1="${pad.l}" y1="${pad.t + ch}" x2="${pad.l + cw}" y2="${pad.t + ch}" stroke="#ddd"/>`;

  for (let i = 0; i <= 5; i++) {
    const y = pad.t + ch - (i / 5) * ch;
    s += `<line x1="${pad.l}" y1="${y}" x2="${pad.l + cw}" y2="${y}" stroke="#f0f0f0"/>`;
    s += `<text x="${pad.l - 8}" y="${y + 4}" text-anchor="end" font-size="10" fill="#999">${Math.round((i / 5) * max)}</text>`;
  }

  for (let i = 0; i < labels.length; i++) {
    const x = pad.l + i * (cw / labels.length) + bg / 2;
    const bh = (values[i] / max) * ch;
    const y = pad.t + ch - bh;
    const col = safeColor(colors[i % colors.length]);
    s += `<rect x="${x}" y="${y}" width="${bw}" height="${bh}" fill="${col}" rx="2"/>`;
    s += `<text x="${x + bw / 2}" y="${pad.t + ch + 20}" text-anchor="middle" font-size="10" fill="#666">${esc(labels[i])}</text>`;
    s += `<text x="${x + bw / 2}" y="${y - 5}" text-anchor="middle" font-size="10" fill="#666">${values[i]}</text>`;
  }

  return s + '</svg>';
}

function renderLineChart(c: ChartConfig): string {
  const { labels, values, title, colors = DEFAULT_COLORS } = c;
  const w = 500, h = 300;
  const pad = { t: title ? 40 : 20, r: 20, b: 50, l: 50 };
  const cw = w - pad.l - pad.r, ch = h - pad.t - pad.b;
  const max = Math.max(...values, 1);
  const col = safeColor(colors[0]);
  const step = cw / Math.max(labels.length - 1, 1);

  let s = `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" style="font-family:-apple-system,sans-serif">`;
  if (title) s += `<text x="${w / 2}" y="24" text-anchor="middle" font-size="14" font-weight="600" fill="#333">${esc(title)}</text>`;

  s += `<line x1="${pad.l}" y1="${pad.t}" x2="${pad.l}" y2="${pad.t + ch}" stroke="#ddd"/>`;
  s += `<line x1="${pad.l}" y1="${pad.t + ch}" x2="${pad.l + cw}" y2="${pad.t + ch}" stroke="#ddd"/>`;

  for (let i = 0; i <= 5; i++) {
    const y = pad.t + ch - (i / 5) * ch;
    s += `<line x1="${pad.l}" y1="${y}" x2="${pad.l + cw}" y2="${y}" stroke="#f0f0f0"/>`;
    s += `<text x="${pad.l - 8}" y="${y + 4}" text-anchor="end" font-size="10" fill="#999">${Math.round((i / 5) * max)}</text>`;
  }

  const pts: string[] = [];
  for (let i = 0; i < labels.length; i++) {
    pts.push(`${pad.l + i * step},${pad.t + ch - (values[i] / max) * ch}`);
  }

  const baseY = pad.t + ch;
  s += `<polygon points="${pad.l},${baseY} ${pts.join(' ')} ${pad.l + (labels.length - 1) * step},${baseY}" fill="${col}" fill-opacity="0.1"/>`;
  s += `<polyline points="${pts.join(' ')}" fill="none" stroke="${col}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>`;

  for (let i = 0; i < labels.length; i++) {
    const x = pad.l + i * step;
    const y = pad.t + ch - (values[i] / max) * ch;
    s += `<circle cx="${x}" cy="${y}" r="4" fill="${col}" stroke="#fff" stroke-width="2"/>`;
    s += `<text x="${x}" y="${baseY + 20}" text-anchor="middle" font-size="10" fill="#666">${esc(labels[i])}</text>`;
  }

  return s + '</svg>';
}

function renderPieChart(c: ChartConfig): string {
  const { labels, values, title, colors = DEFAULT_COLORS } = c;
  const w = 400, h = 320;
  const cx = 150, cy = title ? 170 : 150, r = 110;
  const total = values.reduce((a, b) => a + b, 0) || 1;

  let s = `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" style="font-family:-apple-system,sans-serif">`;
  if (title) s += `<text x="${w / 2}" y="24" text-anchor="middle" font-size="14" font-weight="600" fill="#333">${esc(title)}</text>`;

  let angle = -Math.PI / 2;
  for (let i = 0; i < values.length; i++) {
    if (values[i] <= 0) { continue; }
    const slice = (values[i] / total) * 2 * Math.PI;
    const end = angle + slice;
    const x1 = cx + r * Math.cos(angle), y1 = cy + r * Math.sin(angle);
    const x2 = cx + r * Math.cos(end), y2 = cy + r * Math.sin(end);
    const large = slice > Math.PI ? 1 : 0;
    s += `<path d="M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z" fill="${safeColor(colors[i % colors.length])}" stroke="#fff" stroke-width="2"/>`;
    angle = end;
  }

  const lx = cx + r + 30;
  for (let i = 0; i < labels.length; i++) {
    const y = (title ? 60 : 40) + i * 22;
    const pct = Math.round((values[i] / total) * 100);
    s += `<rect x="${lx}" y="${y}" width="12" height="12" rx="2" fill="${safeColor(colors[i % colors.length])}"/>`;
    s += `<text x="${lx + 18}" y="${y + 10}" font-size="11" fill="#333">${esc(labels[i])} (${pct}%)</text>`;
  }

  return s + '</svg>';
}

function renderChartSvg(config: ChartConfig): string {
  switch (config.type) {
    case 'bar': return renderBarChart(config);
    case 'line': return renderLineChart(config);
    case 'pie': return renderPieChart(config);
    default: return '<svg></svg>';
  }
}

export const ChartBlock = Node.create<Record<string, never>, Record<string, never>>({
  name: 'chartBlock',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      config: { default: '{}' },
    };
  },

  parseHTML() {
    return [{
      tag: 'div[data-chart-block]',
      getAttrs: (el) => {
        if (typeof el === 'string') return false;
        return { config: el.getAttribute('data-config') || '{}' };
      },
    }];
  },

  renderHTML({ node }) {
    return ['div', {
      'data-chart-block': '',
      'data-config': node.attrs.config,
      style: 'text-align:center;margin:16px 0;',
    }];
  },

  addNodeView() {
    return ({ node, editor, getPos }) => {
      const dom = document.createElement('div');
      dom.setAttribute('data-chart-block', '');
      Object.assign(dom.style, {
        textAlign: 'center',
        margin: '16px 0',
        cursor: 'default',
        borderRadius: '4px',
        transition: 'outline 0.15s',
      });

      try {
        const config = JSON.parse(node.attrs.config) as ChartConfig;
        dom.innerHTML = renderChartSvg(config);
        const svg = dom.querySelector('svg');
        if (svg) {
          svg.style.maxWidth = '100%';
          svg.style.height = 'auto';
          svg.style.pointerEvents = 'none';
        }
      } catch {
        dom.textContent = 'Invalid chart configuration';
        Object.assign(dom.style, { color: '#999', fontStyle: 'italic', padding: '20px' });
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
      insertChart: (config: ChartConfig) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: { config: JSON.stringify(config) },
        });
      },
    };
  },
});
