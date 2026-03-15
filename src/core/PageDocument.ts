import { Node } from '@tiptap/core';

/**
 * Document node that allows standard block content.
 * Pages are rendered visually via CSS, not as ProseMirror nodes.
 * This avoids fighting ProseMirror's editing model with structural
 * page nodes that need constant redistribution.
 */
export const PageDocument = Node.create({
  name: 'doc',
  topNode: true,
  content: 'block+',
});
