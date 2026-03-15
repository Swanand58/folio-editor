import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Slice, Fragment, Node as PMNode } from '@tiptap/pm/model';

export const clipboardPluginKey = new PluginKey('folioClipboard');

/**
 * Lightweight clipboard handler for paginated documents.
 *
 * Only does ONE thing: when pasted content contains page node wrappers,
 * it strips them so the content inserts cleanly into the current page.
 * The pagination engine handles overflow afterward.
 *
 * Does NOT override native copy, cut, or text serialization.
 */
export function createClipboardPlugin(): Plugin {
  return new Plugin({
    key: clipboardPluginKey,

    props: {
      transformPasted(slice: Slice): Slice {
        const unwrapped = unwrapPageNodes(slice.content);
        if (unwrapped === slice.content) return slice;
        return new Slice(unwrapped, slice.openStart, slice.openEnd);
      },
    },
  });
}

function unwrapPageNodes(fragment: Fragment): Fragment {
  let changed = false;
  const nodes: PMNode[] = [];

  fragment.forEach((node) => {
    if (node.type.name === 'page') {
      changed = true;
      node.content.forEach((child) => {
        nodes.push(child);
      });
    } else {
      nodes.push(node);
    }
  });

  return changed ? Fragment.from(nodes) : fragment;
}
