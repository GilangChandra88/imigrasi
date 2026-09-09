import React, { useContext } from 'react';
import { NodeViewWrapper, NodeViewContent } from '@tiptap/react';
import { generateHTML } from '@tiptap/core';
import { FormDataContext } from './PreviewFieldExtension';

export default function CustomTableNodeView({ node, editor, getPos }) {
  const isBuilder = editor.isEditable;
  const formData = useContext(FormDataContext);

  if (isBuilder || !node.attrs.isRepeater) {
    return (
      <NodeViewWrapper as="table" style={{ width: node.attrs.width || '100%', borderWidth: node.attrs.borderWidth, borderColor: node.attrs.borderColor }} className="relative">
        <NodeViewContent as="tbody" />
      </NodeViewWrapper>
    );
  }

  const rowsData = formData[node.attrs.fieldId];
  const listData = Array.isArray(rowsData) ? rowsData : [];
  
  if (listData.length === 0) {
     return (
       <NodeViewWrapper as="table" className="hidden">
         <NodeViewContent as="tbody" />
       </NodeViewWrapper>
     );
  }

  const extensions = editor.extensionManager.extensions;
  const htmlTemplate = generateHTML({ type: 'doc', content: node.toJSON().content || [] }, extensions);
  
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlTemplate, 'text/html');
  
  const trs = doc.querySelectorAll('tr');
  let headerHtml = '';
  let templateRowNode = null;

  if (trs.length >= 2) {
    headerHtml = trs[0].outerHTML;
    templateRowNode = trs[1];
  } else if (trs.length === 1) {
    templateRowNode = trs[0];
  }

  const renderedRows = [];
  if (headerHtml) {
    renderedRows.push(headerHtml);
  }

  if (templateRowNode) {
    for (let idx = 0; idx < listData.length; idx++) {
        const rowObj = listData[idx];
        const clone = templateRowNode.cloneNode(true);
        
        const spans = clone.querySelectorAll('span[data-type="form-field"]');
        spans.forEach(span => {
            const fieldId = span.getAttribute('fieldid');
            const fieldType = span.getAttribute('fieldtype');
            if (fieldId && rowObj[fieldId] !== undefined) {
                span.innerHTML = rowObj[fieldId];
            } else if (fieldType === 'table_index') {
                span.innerHTML = String(idx + 1) + '.';
            }
            span.className = 'whitespace-pre-wrap';
            span.style = '';
        });
        renderedRows.push(clone.outerHTML);
    }
  }

  return (
    <NodeViewWrapper as="table" style={{ width: node.attrs.width || '100%', borderWidth: node.attrs.borderWidth, borderColor: node.attrs.borderColor, borderCollapse: 'collapse' }}>
       <tbody dangerouslySetInnerHTML={{ __html: renderedRows.join('') }} />
       <tbody className="hidden">
         <NodeViewContent as="tr" />
       </tbody>
    </NodeViewWrapper>
  );
}

