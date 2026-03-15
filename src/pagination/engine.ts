import type { EditorView } from '@tiptap/pm/view';
import type { Node as PMNode, Schema } from '@tiptap/pm/model';
import type { Transaction } from '@tiptap/pm/state';
import { findOverflowChildIndex, measurePageContentHeight } from './measurement';
import { moveBlocksToNextPage, createNewPage } from './splitter';
import { isTableNode, measureTableRowHeights, findTableSplitRow, splitTableAtRow } from './table-splitter';

export interface PaginationEngineOptions {
  contentHeight: number;
  enabled: boolean;
}

/**
 * Core pagination algorithm.
 * Iterates through all pages, detects overflow, and redistributes content.
 * Handles table splitting at row boundaries with header repeat.
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
  const MAX_ITERATIONS = 200;

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

      const overflowIdx = findOverflowChildIndex(
        view,
        pagePos,
        options.contentHeight
      );

      if (overflowIdx >= 0 && overflowIdx < pageNode.childCount) {
        foundOverflow = true;
        const overflowNode = pageNode.child(overflowIdx);
        const afterPagePos = pagePos + pageNode.nodeSize;

        // Check if the overflowing block is a table we can split
        if (isTableNode(overflowNode) && overflowIdx === findFirstOverflowBlock(pageNode, view, pagePos, options.contentHeight)) {
          const handled = handleTableSplit(
            tr, view, pageNode, pagePos, overflowIdx, overflowNode, afterPagePos, pageIdx, doc, options
          );
          if (handled) {
            tr = handled;
            didChange = true;
            break;
          }
        }

        // Default: move entire blocks to next page
        if (pageIdx + 1 < doc.childCount) {
          const nextPageNode = doc.child(pageIdx + 1);
          tr = moveBlocksToNextPage(
            tr,
            pagePos,
            pageNode,
            afterPagePos,
            nextPageNode,
            overflowIdx
          );
        } else {
          const blocksToMove: PMNode[] = [];
          for (let i = overflowIdx; i < pageNode.childCount; i++) {
            blocksToMove.push(pageNode.child(i));
          }

          tr = createNewPage(tr, afterPagePos, blocksToMove);

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

  // Update page index attributes
  if (didChange) {
    tr = updatePageIndices(tr);
  }

  return didChange ? tr : null;
}

function handleTableSplit(
  tr: Transaction,
  view: EditorView,
  pageNode: PMNode,
  pagePos: number,
  overflowIdx: number,
  tableNode: PMNode,
  afterPagePos: number,
  pageIdx: number,
  doc: PMNode,
  options: PaginationEngineOptions
): Transaction | null {
  const tableAbsPos = pagePos + 1 + childOffset(pageNode, overflowIdx);

  const rowHeights = measureTableRowHeights(view, tableAbsPos);
  if (rowHeights.length === 0) return null;

  // Calculate remaining space before the table
  let usedHeight = 0;
  const pageDom = view.nodeDOM(pagePos);
  if (pageDom && pageDom instanceof HTMLElement) {
    for (let i = 0; i < overflowIdx; i++) {
      const child = pageDom.children[i] as HTMLElement;
      if (child) {
        const rect = child.getBoundingClientRect();
        const style = window.getComputedStyle(child);
        usedHeight += rect.height + (parseFloat(style.marginTop) || 0) + (parseFloat(style.marginBottom) || 0);
      }
    }
  }

  const availableForTable = options.contentHeight - usedHeight;

  // Detect header row
  let hasHeader = false;
  if (tableNode.childCount > 0) {
    const firstRow = tableNode.child(0);
    let allHeaders = true;
    firstRow.forEach((cell) => {
      if (cell.type.name !== 'tableHeader') allHeaders = false;
    });
    hasHeader = allHeaders;
  }

  const splitRow = findTableSplitRow(rowHeights, availableForTable, hasHeader);

  // Can't split — move entire table
  if (splitRow <= 0) return null;
  // Everything fits
  if (splitRow >= tableNode.childCount) return null;

  const schema = tr.doc.type.schema;
  const result = splitTableAtRow(tableNode, splitRow, schema);
  if (!result) return null;

  // Replace the table with the "before" portion
  const tableStart = tableAbsPos;
  const tableEnd = tableAbsPos + tableNode.nodeSize;

  tr = tr.replaceWith(tableStart, tableEnd, result.before);

  // Move remaining blocks (after the table in source page) + the "after" table to next page
  const updatedPageNode = tr.doc.nodeAt(tr.mapping.map(pagePos));
  if (!updatedPageNode) return tr;

  const blocksForNextPage: PMNode[] = [result.after];

  // Also move any blocks after the original table position
  const updatedOverflowIdx = overflowIdx + 1; // +1 because before table is still there
  for (let i = updatedOverflowIdx; i < pageNode.childCount; i++) {
    blocksForNextPage.push(pageNode.child(i));
  }

  const updatedAfterPagePos = tr.mapping.map(afterPagePos);

  if (pageIdx + 1 < doc.childCount) {
    // Insert at start of next page
    let insertPos = updatedAfterPagePos + 1;
    for (let i = blocksForNextPage.length - 1; i >= 0; i--) {
      tr = tr.insert(insertPos, blocksForNextPage[i]);
    }
  } else {
    tr = createNewPage(tr, updatedAfterPagePos, blocksForNextPage);
  }

  return tr;
}

function findFirstOverflowBlock(
  pageNode: PMNode,
  view: EditorView,
  pagePos: number,
  maxHeight: number
): number {
  const dom = view.nodeDOM(pagePos);
  if (!dom || !(dom instanceof HTMLElement)) return -1;

  let accumulated = 0;
  for (let i = 0; i < dom.children.length; i++) {
    const child = dom.children[i] as HTMLElement;
    const rect = child.getBoundingClientRect();
    const style = window.getComputedStyle(child);
    accumulated += rect.height + (parseFloat(style.marginTop) || 0) + (parseFloat(style.marginBottom) || 0);
    if (accumulated > maxHeight + 1) return i;
  }
  return -1;
}

function updatePageIndices(tr: Transaction): Transaction {
  const doc = tr.doc;
  let pos = 0;

  for (let i = 0; i < doc.childCount; i++) {
    const node = doc.child(i);
    if (node.type.name === 'page' && node.attrs.pageIndex !== i) {
      tr = tr.setNodeMarkup(pos, undefined, { ...node.attrs, pageIndex: i });
    }
    pos += node.nodeSize;
  }

  return tr;
}

function childOffset(node: PMNode, childIndex: number): number {
  let offset = 0;
  for (let i = 0; i < childIndex && i < node.childCount; i++) {
    offset += node.child(i).nodeSize;
  }
  return offset;
}
