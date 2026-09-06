import React, { createContext, useContext } from 'react';
import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';

// Context to share formData with Tiptap NodeViews
export const FormDataContext = createContext({});

function PreviewFieldNodeView({ node }) {
  const { fieldId, fieldName, fieldType, listType, isBold, isItalic, isUnderline } = node.attrs;
  const formData = useContext(FormDataContext);
  
  const value = formData[fieldId];
  
  // Format classes
  const formatClasses = [];
  if (isBold) formatClasses.push('font-bold');
  if (isItalic) formatClasses.push('italic');
  if (isUnderline) formatClasses.push('underline');
  const formatClassStr = formatClasses.join(' ');

  const getPrefix = (type, index) => {
    switch(type) {
      case '1': return `${index + 1}.`;
      case 'a': return `${String.fromCharCode(97 + index)}.`;
      case 'A': return `${String.fromCharCode(65 + index)}.`;
      case 'dot': return `•`;
      default: return `${index + 1}.`;
    }
  };

  if (fieldType === 'pegawai') {
    const pegawaiFields = node.attrs.pegawaiFields || ['nama', 'nip', 'pangkat', 'jabatan'];
    const pegawaiFormat = node.attrs.pegawaiFormat || 'bertumpuk';
    const allowMultiple = node.attrs.allowMultiple || false;

    const pegawaiList = Array.isArray(value) ? value : (value ? [value] : []);
    
    if (pegawaiList.length === 0) {
      return (
        <NodeViewWrapper className="inline-block align-bottom" as="span">
          <span className={`text-slate-400 border border-slate-300 border-dashed rounded px-1.5 py-0.5 text-xs bg-slate-50 mx-1 ${formatClassStr}`}>
            [{fieldName} (Data Pegawai)]
          </span>
        </NodeViewWrapper>
      );
    }
    
    if (pegawaiFormat === 'bertumpuk') {
      return (
        <NodeViewWrapper className="block w-full mt-1 mb-2" as="div">
          <div className={`flex flex-col gap-4 text-inherit ${formatClassStr}`}>
            {pegawaiList.map((pegawai, idx) => (
              <div key={idx} className="flex">
                {allowMultiple && pegawaiList.length > 1 && (
                   <div className="w-8 shrink-0">{idx + 1}.</div>
                )}
                <table className="flex-1 border-collapse border-none m-0 p-0 text-inherit leading-relaxed bg-transparent">
                  <tbody>
                    {pegawaiFields.includes('nama') && (
                      <tr className="border-none p-0 m-0 bg-transparent">
                        <td className="w-24 p-0 align-top border-none font-normal">Nama</td>
                        <td className="w-4 p-0 align-top border-none text-center">:</td>
                        <td className="p-0 align-top border-none uppercase">{pegawai.nama}</td>
                      </tr>
                    )}
                    {pegawaiFields.includes('nip') && (
                      <tr className="border-none p-0 m-0 bg-transparent">
                        <td className="w-24 p-0 align-top border-none font-normal">NIP</td>
                        <td className="w-4 p-0 align-top border-none text-center">:</td>
                        <td className="p-0 align-top border-none font-normal">{pegawai.nip}</td>
                      </tr>
                    )}
                    {pegawaiFields.includes('pangkat') && (
                      <tr className="border-none p-0 m-0 bg-transparent">
                        <td className="w-24 p-0 align-top border-none font-normal">Pangkat/Gol.</td>
                        <td className="w-4 p-0 align-top border-none text-center">:</td>
                        <td className="p-0 align-top border-none font-normal">{pegawai.pangkat}</td>
                      </tr>
                    )}
                    {pegawaiFields.includes('jabatan') && (
                      <tr className="border-none p-0 m-0 bg-transparent">
                        <td className="w-24 p-0 align-top border-none font-normal">Jabatan</td>
                        <td className="w-4 p-0 align-top border-none text-center">:</td>
                        <td className="p-0 align-top border-none font-normal">{pegawai.jabatan}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </NodeViewWrapper>
      );
    } else {
      return (
        <NodeViewWrapper className="inline" as="span">
          {pegawaiList.map((pegawai, idx) => {
            const parts = [];
            if (pegawaiFields.includes('nama')) parts.push(pegawai.nama);
            if (pegawaiFields.includes('nip')) parts.push(pegawai.nip);
            if (pegawaiFields.includes('pangkat')) parts.push(pegawai.pangkat);
            if (pegawaiFields.includes('jabatan')) parts.push(pegawai.jabatan);
            return (
              <span key={idx} className={`bg-yellow-100 border-b border-yellow-400 font-medium text-slate-800 ${formatClassStr}`}>
                {parts.join(' - ')}{idx < pegawaiList.length - 1 ? ', ' : ''}
              </span>
            );
          })}
        </NodeViewWrapper>
      );
    }
  }

  if (fieldType === 'list') {
    const isArray = Array.isArray(value) && value.length > 0;
    return (
      <NodeViewWrapper className="inline-block align-top w-full" as="span">
        {isArray ? (
          <div className="flex flex-col gap-1 w-full text-inherit">
            {value.map((item, idx) => (
              <div key={idx} className="flex">
                <span className="w-8 shrink-0">{getPrefix(listType, idx)}</span>
                <span className={`flex-1 bg-yellow-100 border-b border-yellow-400 font-medium text-slate-800 break-words ${formatClassStr}`}>{item}</span>
              </div>
            ))}
          </div>
        ) : (
          <span className={`text-slate-400 border border-slate-300 border-dashed rounded px-1.5 py-0.5 text-xs bg-slate-50 mx-1 ${formatClassStr}`}>
            [{fieldName} (List)]
          </span>
        )}
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper className="inline-block align-bottom" as="span">
      {value ? (
        <span className={`bg-yellow-100 border-b border-yellow-400 px-1 font-medium text-slate-800 transition-all duration-300 ${formatClassStr}`}>
          {value}
        </span>
      ) : (
        <span className={`text-slate-400 border border-slate-300 border-dashed rounded px-1.5 py-0.5 text-xs bg-slate-50 mx-1 ${formatClassStr}`}>
          [{fieldName}]
        </span>
      )}
    </NodeViewWrapper>
  );
}

export const PreviewFieldExtension = Node.create({
  name: 'formField', // Must match the name used in Builder V2
  group: 'inline',
  inline: true,
  atom: true,

  addAttributes() {
    return {
      fieldId: { default: null },
      fieldName: { default: '' },
      fieldType: { default: 'text' },
      fieldOptions: { default: [] },
      listType: { default: '1' },
      isRequired: { default: false },
      pegawaiFields: { default: ['nama', 'nip', 'pangkat', 'jabatan'] },
      pegawaiFormat: { default: 'bertumpuk' },
      allowMultiple: { default: false },
      isBold: { default: false },
      isItalic: { default: false },
      isUnderline: { default: false }
    };
  },

  parseHTML() {
    return [{ tag: 'span[data-type="form-field"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes, { 'data-type': 'form-field' })];
  },


  addNodeView() {
    return ReactNodeViewRenderer(PreviewFieldNodeView);
  }
});
