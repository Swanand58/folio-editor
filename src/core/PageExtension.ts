import { Extension } from '@tiptap/core';
import type { FolioConfig, DeepPartial, Margin, PageSize, HeaderFooterConfig, PageNumberConfig } from '../types';
import { PAGE_SIZES, DEFAULT_PAGE_SIZE } from '../layout/presets';
import { DEFAULT_MARGINS, getContentHeight } from '../layout/margins';
import { DEFAULT_HEADER, DEFAULT_FOOTER, DEFAULT_PAGE_NUMBER } from '../layout/header-footer';
import { createPaginationPlugin } from '../pagination/PaginationPlugin';
import { createPageDecorationsPlugin } from './PageDecorationsPlugin';
import { injectStyles, removeStyles } from '../styles/injector';
import { generateStyles } from '../styles/base';

export interface FolioExtensionOptions extends DeepPartial<FolioConfig> {}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    folioExtension: {
      recomputePagination: () => ReturnType;
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
      pageBreakBackground: '#f0f0f0',
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
      pageBreakBackground: this.options.pageBreakBackground ?? '#f0f0f0',
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

    const contentHeight = getContentHeight(resolvedSize, margins, header, footer);

    return [
      createPaginationPlugin({
        contentHeight,
        enabled: true,
      }),
      createPageDecorationsPlugin({
        headerEnabled: header.enabled,
        footerEnabled: footer.enabled,
        headerHTML: header.render ? header.render() : '',
        footerHTML: footer.render ? footer.render() : '',
        showPageNumber: pageNumber.show,
        pageNumberPosition: pageNumber.position,
        pageNumberAlignment: pageNumber.alignment,
        showPageNumberOnFirst: pageNumber.showOnFirstPage,
        showTotalPages: pageNumber.showTotal,
        pageNumberFormat: pageNumber.format,
      }),
    ];
  },

  addCommands() {
    return {
      recomputePagination:
        () =>
        ({ view }: { view: any }) => {
          view.dispatch(view.state.tr);
          return true;
        },

      printDocument:
        () =>
        () => {
          window.print();
          return true;
        },
    };
  },
});
