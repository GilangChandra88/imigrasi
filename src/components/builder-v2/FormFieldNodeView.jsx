import React from 'react';
import { NodeViewWrapper } from '@tiptap/react';

export default function FormFieldNodeView({ node, updateAttributes, extension, editor, getPos }) {
  const { fieldName, fieldType, isBold, isItalic, isUnderline } = node.attrs;

  const handleClick = (e) => {
    if (typeof getPos === 'function') {
      editor.commands.setNodeSelection(getPos());
    }

    if (typeof extension.options.onFieldClick === 'function') {
      extension.options.onFieldClick(node.attrs, updateAttributes);
    }
  };
  
  const formatClasses = [];
  if (isBold) formatClasses.push('font-bold');
  if (isItalic) formatClasses.push('italic');
  if (isUnderline) formatClasses.push('underline');
  const formatClassStr = formatClasses.join(' ');

  return (
    <NodeViewWrapper className="inline-block align-middle" as="span">
      <span 
        onClick={handleClick}
        className={`cursor-pointer mx-1 px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded border border-indigo-300 font-mono text-xs select-none hover:bg-indigo-200 transition-colors ${formatClassStr}`}
        contentEditable={false}
      >
        {fieldName || 'Nama_Variabel'}
      </span>
    </NodeViewWrapper>
  );
}
