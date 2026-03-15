import { Extension } from '@tiptap/core';
import type { FolioConfig, DeepPartial, Margin, PageSize, HeaderFooterConfig, PageNumberConfig } from '../types';
import { PAGE_SIZES, DEFAULT_PAGE_SIZE } from '../layout/presets';
import { DEFAULT_MARGINS } from '../layout/margins';
import { DEFAULT_HEADER, DEFAULT_FOOTER, DEFAULT_PAGE_NUMBER } from '../layout/header-footer';
import { createPaginationPlugin } from '../pagination/PaginationPlugin';
import { injectStyles, removeStyles } from '../styles/injector';
import { generateStyles } from '../styles/base';
import { toPx } from '../utils/units';

export interface FolioExtensionOptions extends DeepPartial<FolioConfig> {}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    folioExtension: {
      printDocument: () => ReturnType;
    };
  }
}

function resolvePageSize(input: PageSize | string | undefined): PageSize {
  if (!input) return DEFAULT_PAGE_SIZE;
  if (typeof input === 'string') {
    return PAGE_SIZES[input.toUpperCase()] || DEFAULT_PAGE_SIZE;
  }
  return input;
}

function resolveMargins(input: DeepPartial<Margin> | undefined): Margin {
  return {
    top: input?.top ?? DEFAULT_MARGINS.top,
    bottom: input?.bottom ?? DEFAULT_MARGINS.bottom,
    left: input?.left ?? DEFAULT_MARGINS.left,
    right: input?.right ?? DEFAULT_MARGINS.right,
  };
}

function resolveHeader(input: DeepPartial<HeaderFooterConfig> | undefined): HeaderFooterConfig {
  return {
    enabled: input?.enabled ?? DEFAULT_HEADER.enabled,
    height: input?.height ?? DEFAULT_HEADER.height,
    render: input?.render ?? DEFAULT_HEADER.render,
  };
}

function resolveFooter(input: DeepPartial<HeaderFooterConfig> | undefined): HeaderFooterConfig {
  return {
    enabled: input?.enabled ?? DEFAULT_FOOTER.enabled,
    height: input?.height ?? DEFAULT_FOOTER.height,
    render: input?.render ?? DEFAULT_FOOTER.render,
  };
}

function resolvePageNumber(input: DeepPartial<PageNumberConfig> | undefined): PageNumberConfig {
  return {
    show: input?.show ?? DEFAULT_PAGE_NUMBER.show,
    showTotal: input?.showTotal ?? DEFAULT_PAGE_NUMBER.showTotal,
    showOnFirstPage: input?.showOnFirstPage ?? DEFAULT_PAGE_NUMBER.showOnFirstPage,
    position: input?.position ?? DEFAULT_PAGE_NUMBER.position,
    alignment: input?.alignment ?? DEFAULT_PAGE_NUMBER.alignment,
    format: input?.format ?? DEFAULT_PAGE_NUMBER.format,
  };
}

export const FolioExtension = Extension.create<FolioExtensionOptions>({
  name: 'folioExtension',

  addOptions() {
    return {
      pageSize: 'A4',
      margins: DEFAULT_MARGINS,
      header: DEFAULT_HEADER,
      footer: DEFAULT_FOOTER,
      pageNumber: DEFAULT_PAGE_NUMBER,
      pageGap: 40,
      pageBreakBackground: '#e8e8e8',
      debug: false,
    };
  },

  onCreate() {
    const resolvedSize = resolvePageSize(this.options.pageSize);
    const margins = resolveMargins(this.options.margins);
    const header = resolveHeader(this.options.header);
    const footer = resolveFooter(this.options.footer);
    const pageNumber = resolvePageNumber(this.options.pageNumber);

    const styles = generateStyles({
      pageSize: resolvedSize,
      margins,
      header,
      footer,
      pageNumber,
      pageGap: this.options.pageGap ?? 40,
      pageBreakBackground: this.options.pageBreakBackground ?? '#e8e8e8',
    });
    injectStyles(styles);
  },

  onDestroy() {
    removeStyles();
  },

  addProseMirrorPlugins() {
    const resolvedSize = resolvePageSize(this.options.pageSize);
    const margins = resolveMargins(this.options.margins);
    const header = resolveHeader(this.options.header);
    const footer = resolveFooter(this.options.footer);
    const pageNumber = resolvePageNumber(this.options.pageNumber);

    const pageHeightPx = toPx(resolvedSize.height, resolvedSize.unit);
    const pageWidthPx = toPx(resolvedSize.width, resolvedSize.unit);

    return [
      createPaginationPlugin({
        pageHeight: pageHeightPx,
        pageWidth: pageWidthPx,
        marginTop: margins.top,
        marginBottom: margins.bottom,
        marginLeft: margins.left,
        marginRight: margins.right,
        headerHeight: header.enabled ? header.height : 0,
        footerHeight: footer.enabled ? footer.height : 0,
        pageGap: this.options.pageGap ?? 40,
        showPageNumber: pageNumber.show,
        pageNumberPosition: pageNumber.position,
        pageNumberAlignment: pageNumber.alignment,
        showPageNumberOnFirst: pageNumber.showOnFirstPage,
        showTotalPages: pageNumber.showTotal,
        pageNumberFormat: pageNumber.format,
        headerHTML: header.render ? header.render() : '',
        footerHTML: footer.render ? footer.render() : '',
        pageBreakBackground: this.options.pageBreakBackground ?? '#e8e8e8',
        headerEnabled: header.enabled,
        footerEnabled: footer.enabled,
      }),
    ];
  },

  addCommands() {
    return {
      printDocument:
        () =>
        () => {
          window.print();
          return true;
        },
    };
  },
});
