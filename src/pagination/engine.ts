import type { EditorView } from '@tiptap/pm/view';
import type { Transaction } from '@tiptap/pm/state';
import { findOverflowChildIndex } from './measurement';
import { moveBlocksToNextPage, createNewPage } from './splitter';

export interface PaginationEngineOptions {
  contentHeight: number;
  enabled: boolean;
}

/**
 * Core pagination algorithm.
 * Iterates through all pages, detects overflow, and redistributes content.
 *
 * Returns a transaction if changes were needed, or null if everything fits.
 */
export function paginate(
  view: EditorView,
  options: PaginationEngineOptions
): Transaction | null {
  if (!options.enabled) return null;

  const { state } = view;
  let tr = state.tr;
  let didChange = false;
  let iterations = 0;
  const MAX_ITERATIONS = 100;

  while (iterations < MAX_ITERATIONS) {
    iterations++;
    let foundOverflow = false;

    const doc = tr.doc;
    let pagePos = 0;

    for (let pageIdx = 0; pageIdx < doc.childCount; pageIdx++) {
      const pageNode = doc.child(pageIdx);

      if (pageNode.type.name !== 'page') {
        pagePos += pageNode.nodeSize;
        continue;
      }

      // We need the view to measure, so apply intermediate tr and re-measure
      // For the initial pass, use the current view's DOM
      const overflowIdx = findOverflowChildIndex(
        view,
        pagePos,
        options.contentHeight
      );

      if (overflowIdx >= 0 && overflowIdx < pageNode.childCount) {
        foundOverflow = true;

        const nextPageIdx = pageIdx + 1;
        const afterPagePos = pagePos + pageNode.nodeSize;

        if (nextPageIdx < doc.childCount) {
          const nextPageNode = doc.child(nextPageIdx);
          tr = moveBlocksToNextPage(
            tr,
            pagePos,
            pageNode,
            afterPagePos,
            nextPageNode,
            overflowIdx
          );
        } else {
          // Need to create a new page
          const blocksToMove = [];
          for (let i = overflowIdx; i < pageNode.childCount; i++) {
            blocksToMove.push(pageNode.child(i));
          }

          tr = createNewPage(tr, afterPagePos, blocksToMove);

          // Remove moved blocks from source
          const sourceStart = pagePos + 1 + childOffset(pageNode, overflowIdx);
          const sourceEnd = pagePos + 1 + pageNode.content.size;
          if (sourceEnd > sourceStart) {
            tr = tr.delete(sourceStart, sourceEnd);
          }
        }

        didChange = true;
        break;
      }

      pagePos += pageNode.nodeSize;
    }

    if (!foundOverflow) break;
  }

  return didChange ? tr : null;
}

function childOffset(node: any, childIndex: number): number {
  let offset = 0;
  for (let i = 0; i < childIndex && i < node.childCount; i++) {
    offset += node.child(i).nodeSize;
  }
  return offset;
}
