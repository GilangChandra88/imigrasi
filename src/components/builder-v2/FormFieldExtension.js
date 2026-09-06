import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import FormFieldNodeView from './FormFieldNodeView';

export const FormFieldExtension = Node.create({
  name: 'formField',

  group: 'inline',
  inline: true,
  atom: true,

  addOptions() {
    return {
      onFieldClick: () => {},
    }
  },

  addAttributes() {
    return {
      fieldId: {
        default: null,
      },
      fieldName: {
        default: 'Nama_Variabel',
      },
      fieldType: {
        default: 'text', 
      },
      fieldOptions: {
        default: [], 
      },
      listType: {
        default: '1',
      },
      isRequired: {
        default: false,
      },
      pegawaiFields: {
        default: ['nama', 'nip', 'pangkat', 'jabatan'],
      },
      pegawaiFormat: {
        default: 'bertumpuk',
      },
      allowMultiple: {
        default: false,
      },
      isBold: { default: false },
      isItalic: { default: false },
      isUnderline: { default: false }
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-type="form-field"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes, { 'data-type': 'form-field' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(FormFieldNodeView);
  },
});
