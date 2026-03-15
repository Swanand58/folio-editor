import { Node, mergeAttributes } from '@tiptap/core';

export interface PageNodeOptions {
  pageWidth: number;
  pageHeight: number;
  contentHeight: number;
  marginTop: number;
  marginBottom: number;
  marginLeft: number;
  marginRight: number;
  headerHeight: number;
  footerHeight: number;
}

export const PageNode = Node.create<PageNodeOptions>({
  name: 'page',
  group: 'page',
  content: 'block+',
  isolating: true,
  defining: true,

  addOptions() {
    return {
      pageWidth: 794,
      pageHeight: 1123,
      contentHeight: 1003,
      marginTop: 72,
      marginBottom: 72,
      marginLeft: 72,
      marginRight: 72,
      headerHeight: 0,
      footerHeight: 0,
    };
  },

  addAttributes() {
    return {
      pageIndex: {
        default: 0,
        parseHTML: (el) => parseInt(el.getAttribute('data-page-index') || '0', 10),
        renderHTML: (attrs) => ({ 'data-page-index': attrs.pageIndex }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-folio-page]' }];
  },

  renderHTML({ HTMLAttributes }) {
    const {
      pageWidth,
      pageHeight,
      marginTop,
      marginBottom,
      marginLeft,
      marginRight,
      headerHeight,
      footerHeight,
    } = this.options;

    const contentTop = marginTop + headerHeight;
    const contentBottom = marginBottom + footerHeight;

    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-folio-page': '',
        class: 'folio-page',
        style: [
          `width: ${pageWidth}px`,
          `min-height: ${pageHeight}px`,
          `padding-top: ${contentTop}px`,
          `padding-bottom: ${contentBottom}px`,
          `padding-left: ${marginLeft}px`,
          `padding-right: ${marginRight}px`,
          `position: relative`,
          `box-sizing: border-box`,
        ].join('; '),
      }),
      0,
    ];
  },
});
