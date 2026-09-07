import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import RepeaterBlockNodeView from './RepeaterBlockNodeView';

export const RepeaterBlockExtension = Node.create({
  name: 'repeaterBlock',
  group: 'block',
  content: 'block+',
  defining: true,
  isolating: true,

  addAttributes() {
    return {
      fieldId: { default: null },
      fieldName: { default: 'Data Pegawai' },
      repeaterType: { default: 'pegawai' },
      allowMultiple: { default: true },
    };
  },

  parseHTML() { return [{ tag: 'div[data-type="repeater-block"]' }]; },
  renderHTML({ HTMLAttributes }) { return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'repeater-block' }), 0]; },
  addNodeView() { return ReactNodeViewRenderer(RepeaterBlockNodeView); }
});
