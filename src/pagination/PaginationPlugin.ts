import { Plugin, PluginKey } from '@tiptap/pm/state';
import type { EditorView } from '@tiptap/pm/view';
import { paginate, type PaginationEngineOptions } from './engine';

export const paginationPluginKey = new PluginKey('folioPagination');

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

export function createPaginationPlugin(
  options: PaginationEngineOptions
): Plugin {
  return new Plugin({
    key: paginationPluginKey,

    view() {
      return {
        update(view: EditorView) {
          if (!options.enabled) return;

          // Debounce pagination to avoid excessive recalculations
          if (debounceTimer) clearTimeout(debounceTimer);

          debounceTimer = setTimeout(() => {
            runPagination(view, options);
          }, 50);
        },

        destroy() {
          if (debounceTimer) {
            clearTimeout(debounceTimer);
            debounceTimer = null;
          }
        },
      };
    },
  });
}

function runPagination(
  view: EditorView,
  options: PaginationEngineOptions
): void {
  try {
    const tr = paginate(view, options);
    if (tr) {
      tr.setMeta(paginationPluginKey, { fromPagination: true });
      tr.setMeta('addToHistory', false);
      view.dispatch(tr);
    }
  } catch (error) {
    if (options.enabled) {
      console.warn('[folio-editor] Pagination error:', error);
    }
  }
}
