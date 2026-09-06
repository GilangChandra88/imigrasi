import React, { useContext } from 'react';
import { NodeViewWrapper, NodeViewContent } from '@tiptap/react';
import { generateHTML } from '@tiptap/core';
import { FormDataContext } from './PreviewFieldExtension';

export default function RepeaterBlockNodeView({ node, editor, selected, getPos }) {
  const isBuilder = editor.isEditable;
  const formData = useContext(FormDataContext);

  if (isBuilder) {
    return (
      <NodeViewWrapper 
        className={`relative block my-6 border-2 border-dashed rounded-lg transition-colors ${selected ? 'border-indigo-500 bg-indigo-50/30' : 'border-indigo-200 bg-transparent'}`}
      >
        <div className={`absolute -top-3 left-4 bg-indigo-500 text-white text-[10px] font-bold px-3 py-1 rounded shadow-sm z-10 select-none cursor-pointer`} onClick={() => editor.commands.setNodeSelection(getPos())}>
          🔁 Area Pengulangan: {node.attrs.fieldName}
        </div>
        <div className={`p-4 pt-6 min-h-[80px]`}>
          <NodeViewContent className={`repeater-content`} />
        </div>
      </NodeViewWrapper>
    );
  }

  // RUNTIME RENDERING
  const employees = formData[node.attrs.fieldId];
  const pegawaiList = Array.isArray(employees) ? employees : (employees ? [employees] : []);
  
  if (pegawaiList.length === 0) {
     return (
       <NodeViewWrapper className="hidden">
         <NodeViewContent />
       </NodeViewWrapper>
     );
  }

  const extensions = editor.extensionManager.extensions;
  const htmlTemplate = generateHTML({ type: 'doc', content: node.toJSON().content || [] }, extensions);
  
  const parser = new DOMParser();
  const renderedItems = [];

  for (let idx = 0; idx < pegawaiList.length; idx++) {
      const emp = pegawaiList[idx];
      const doc = parser.parseFromString(htmlTemplate, 'text/html');
      
      const spans = doc.querySelectorAll('span[data-type="form-field"]');
      spans.forEach(span => {
          const type = span.getAttribute('fieldtype');
          if (type === 'pegawai_nama') span.innerHTML = emp.nama || '';
          else if (type === 'pegawai_nip') span.innerHTML = emp.nip || '';
          else if (type === 'pegawai_pangkat') span.innerHTML = emp.pangkat || '';
          else if (type === 'pegawai_jabatan') span.innerHTML = emp.jabatan || '';
          else if (type === 'pegawai_index') span.innerHTML = String(idx + 1) + '.';
          
          span.className = '';
          span.style = '';
      });
      renderedItems.push(doc.body.innerHTML);
  }

  return (
    <NodeViewWrapper>
       {renderedItems.map((html, i) => (
          <div key={i} dangerouslySetInnerHTML={{ __html: html }} className="repeater-item" />
       ))}
       <div className="hidden">
         <NodeViewContent />
       </div>
    </NodeViewWrapper>
  );
}
