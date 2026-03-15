import type { Node as PMNode, Schema } from '@tiptap/pm/model';
import type { Transaction } from '@tiptap/pm/state';
import type { EditorView } from '@tiptap/pm/view';

/**
 * Determines if a node is a table.
 */
export function isTableNode(node: PMNode): boolean {
  return node.type.name === 'table';
}

/**
 * Measures individual row heights within a table rendered in the DOM.
 * Returns an array of { rowIndex, height } for each row.
 */
export function measureTableRowHeights(
  view: EditorView,
  tablePos: number
): number[] {
  const dom = view.nodeDOM(tablePos);
  if (!dom || !(dom instanceof HTMLElement)) return [];

  const rows = dom.querySelectorAll('tr');
  const heights: number[] = [];

  rows.forEach((row) => {
    const rect = row.getBoundingClientRect();
    heights.push(rect.height);
  });

  return heights;
}

/**
 * Finds the split point for a table: the last row index that fits
 * within the remaining height on the current page.
 * Returns -1 if even the first row doesn't fit (table must move entirely).
 * Returns the table's full row count if the whole table fits.
 */
export function findTableSplitRow(
  rowHeights: number[],
  availableHeight: number,
  hasHeader: boolean
): number {
  if (rowHeights.length === 0) return -1;

  const startRow = hasHeader ? 1 : 0;
  let accumulated = 0;

  // Account for header row height on continuation pages
  if (hasHeader && rowHeights.length > 0) {
    accumulated += rowHeights[0];
    if (accumulated > availableHeight) return -1;
  }

  for (let i = startRow; i < rowHeights.length; i++) {
    accumulated += rowHeights[i];
    if (accumulated > availableHeight) {
      // Row i doesn't fit; split before it
      return i <= startRow ? -1 : i;
    }
  }

  // Everything fits
  return rowHeights.length;
}

/**
 * Splits a ProseMirror table node at the given row index.
 * Returns two arrays of row nodes:
 * - `before`: rows that stay on the current page (including header if present)
 * - `after`: rows that go to the next page (header is cloned if present)
 */
export function splitTableAtRow(
  tableNode: PMNode,
  splitAtRow: number,
  schema: Schema
): { before: PMNode; after: PMNode } | null {
  if (splitAtRow <= 0 || splitAtRow >= tableNode.childCount) return null;

  const tableType = schema.nodes.table;
  if (!tableType) return null;

  const beforeRows: PMNode[] = [];
  const afterRows: PMNode[] = [];

  let hasHeaderRow = false;
  let headerRow: PMNode | null = null;

  // Check if first row contains header cells
  if (tableNode.childCount > 0) {
    const firstRow = tableNode.child(0);
    if (firstRow.type.name === 'tableRow') {
      let allHeaders = true;
      firstRow.forEach((cell) => {
        if (cell.type.name !== 'tableHeader') {
          allHeaders = false;
        }
      });
      if (allHeaders) {
        hasHeaderRow = true;
        headerRow = firstRow;
      }
    }
  }

  for (let i = 0; i < tableNode.childCount; i++) {
    if (i < splitAtRow) {
      beforeRows.push(tableNode.child(i));
    } else {
      afterRows.push(tableNode.child(i));
    }
  }

  // Clone header row to continuation table
  if (hasHeaderRow && headerRow && splitAtRow > 0) {
    afterRows.unshift(headerRow);
  }

  const beforeTable = tableType.create(tableNode.attrs, beforeRows);
  const afterTable = tableType.create(tableNode.attrs, afterRows);

  return { before: beforeTable, after: afterTable };
}
