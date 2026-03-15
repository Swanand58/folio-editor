import type { Node as PMNode } from '@tiptap/pm/model';
import type { Transaction } from '@tiptap/pm/state';

/**
 * Moves child nodes from one page to another starting at a given index.
 * Used when a page overflows and content must be pushed to the next page.
 */
export function moveBlocksToNextPage(
  tr: Transaction,
  sourcePagePos: number,
  sourcePageNode: PMNode,
  targetPagePos: number,
  targetPageNode: PMNode,
  fromChildIndex: number
): Transaction {
  const schema = tr.doc.type.schema;
  const pageType = schema.nodes.page;

  const blocksToMove: PMNode[] = [];
  for (let i = fromChildIndex; i < sourcePageNode.childCount; i++) {
    blocksToMove.push(sourcePageNode.child(i));
  }

  if (blocksToMove.length === 0) return tr;

  // Insert blocks at the beginning of the target page
  const insertPos = targetPagePos + 1;
  for (let i = blocksToMove.length - 1; i >= 0; i--) {
    tr = tr.insert(insertPos, blocksToMove[i]);
  }

  // Remove blocks from source page (positions shifted after insert, recalculate)
  const updatedSourcePagePos = tr.mapping.map(sourcePagePos);
  const updatedSourcePage = tr.doc.nodeAt(updatedSourcePagePos);

  if (updatedSourcePage) {
    const deleteFrom =
      updatedSourcePagePos + 1 + childOffset(updatedSourcePage, fromChildIndex);
    const deleteTo = updatedSourcePagePos + 1 + updatedSourcePage.content.size;

    if (deleteTo > deleteFrom) {
      tr = tr.delete(deleteFrom, deleteTo);
    }
  }

  return tr;
}

/**
 * Creates a new empty page node at the given position.
 */
export function createNewPage(
  tr: Transaction,
  insertPos: number,
  content?: PMNode[]
): Transaction {
  const schema = tr.doc.type.schema;
  const pageType = schema.nodes.page;
  const paragraphType = schema.nodes.paragraph;

  const children = content && content.length > 0
    ? content
    : [paragraphType.create()];

  const newPage = pageType.create(null, children);
  return tr.insert(insertPos, newPage);
}

/**
 * Pulls content from the next page into the current page if there's room.
 * Used when content is deleted and a page has remaining space.
 */
export function pullBlocksFromNextPage(
  tr: Transaction,
  currentPagePos: number,
  currentPageNode: PMNode,
  nextPagePos: number,
  nextPageNode: PMNode,
  count: number
): Transaction {
  if (count <= 0 || nextPageNode.childCount === 0) return tr;

  const blocksToPull: PMNode[] = [];
  const pullCount = Math.min(count, nextPageNode.childCount);

  for (let i = 0; i < pullCount; i++) {
    blocksToPull.push(nextPageNode.child(i));
  }

  // Append to end of current page
  const appendPos = currentPagePos + 1 + currentPageNode.content.size;
  for (const block of blocksToPull) {
    tr = tr.insert(appendPos, block);
  }

  // Remove from next page
  const updatedNextPagePos = tr.mapping.map(nextPagePos);
  const updatedNextPage = tr.doc.nodeAt(updatedNextPagePos);

  if (updatedNextPage) {
    const deleteFrom = updatedNextPagePos + 1;
    const deleteTo = updatedNextPagePos + 1 + childOffset(updatedNextPage, pullCount);

    if (deleteTo > deleteFrom) {
      tr = tr.delete(deleteFrom, deleteTo);
    }

    // If next page is now empty, remove it entirely
    const finalNextPage = tr.doc.nodeAt(tr.mapping.map(nextPagePos));
    if (finalNextPage && finalNextPage.childCount === 0) {
      const pos = tr.mapping.map(nextPagePos);
      tr = tr.delete(pos, pos + finalNextPage.nodeSize);
    }
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
