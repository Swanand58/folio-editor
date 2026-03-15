import { Extension } from '@tiptap/core';

/**
 * Handles keyboard interactions specific to paginated editing.
 * - Prevents deletion across page boundaries (backspace at start of page)
 * - Handles Enter at end of page (should flow to next page)
 */
export const PageKeymap = Extension.create({
  name: 'folioPageKeymap',

  addKeyboardShortcuts() {
    return {
      Backspace: ({ editor }) => {
        const { state } = editor;
        const { selection } = state;
        const { $from } = selection;

        // If cursor is at the very start of a page node's content,
        // prevent default backspace from merging pages
        const pageNode = $from.node($from.depth - 1);
        if (pageNode?.type.name === 'page') {
          const startOfPage = $from.start($from.depth - 1);
          if ($from.pos === startOfPage) {
            return true;
          }
        }

        return false;
      },

      Delete: ({ editor }) => {
        const { state } = editor;
        const { selection } = state;
        const { $to } = selection;

        const pageNode = $to.node($to.depth - 1);
        if (pageNode?.type.name === 'page') {
          const endOfPage = $to.end($to.depth - 1);
          if ($to.pos === endOfPage) {
            return true;
          }
        }

        return false;
      },
    };
  },
});
