import { Node } from '@tiptap/core';

/**
 * Replaces the default TipTap Document node.
 * Enforces that the document can only contain `page` nodes at the top level.
 */
export const PageDocument = Node.create({
  name: 'doc',
  topNode: true,
  content: 'page+',
});
