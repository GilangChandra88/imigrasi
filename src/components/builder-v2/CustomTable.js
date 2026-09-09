import { Table, TableView } from '@tiptap/extension-table';

class CustomTableView extends TableView {
  constructor(node, cellMinWidth, view, HTMLAttributes = {}) {
    super(node, cellMinWidth, view, HTMLAttributes);
    this.applyCustomAttributes(node);
  }

  update(node) {
    const wasUpdated = super.update(node);
    if (wasUpdated) {
      this.applyCustomAttributes(node);
    }
    return wasUpdated;
  }

  applyCustomAttributes(node) {
    if (!this.table) return;
    
    if (node.attrs.borderWidth !== undefined) {
      this.table.setAttribute('data-border-width', node.attrs.borderWidth);
      this.table.style.setProperty('--tbl-border-width', node.attrs.borderWidth);
    } else {
      this.table.removeAttribute('data-border-width');
      this.table.style.removeProperty('--tbl-border-width');
    }
    
    if (node.attrs.borderColor !== undefined) {
      this.table.setAttribute('data-border-color', node.attrs.borderColor);
      this.table.style.setProperty('--tbl-border-color', node.attrs.borderColor);
    } else {
      this.table.removeAttribute('data-border-color');
      this.table.style.removeProperty('--tbl-border-color');
    }
    
    if (node.attrs.borderless) {
      this.table.setAttribute('data-borderless', 'true');
    } else {
      this.table.removeAttribute('data-borderless');
    }
  }
}

export const CustomTable = Table.extend({
  addOptions() {
    return {
      ...this.parent?.(),
      View: CustomTableView,
    };
  },

  addAttributes() {
    return {
      ...this.parent?.(),
      borderWidth: {
        default: '1px',
        parseHTML: element => element.style.getPropertyValue('--tbl-border-width') || element.getAttribute('data-border-width') || '1px',
        renderHTML: attributes => {
          return {
            'data-border-width': attributes.borderWidth,
            style: `--tbl-border-width: ${attributes.borderWidth};`,
          };
        }
      },
      borderColor: {
        default: '#000000',
        parseHTML: element => element.style.getPropertyValue('--tbl-border-color') || element.getAttribute('data-border-color') || '#000000',
        renderHTML: attributes => {
          return {
            'data-border-color': attributes.borderColor,
            style: `--tbl-border-color: ${attributes.borderColor};`,
          };
        }
      },
      borderless: {
        default: false,
        parseHTML: element => element.getAttribute('data-borderless') === 'true',
        renderHTML: attributes => {
          return attributes.borderless ? { 'data-borderless': 'true' } : {};
        },
      },
      isRepeater: { default: false },
      fieldId: { default: null },
      fieldName: { default: 'Tabel Dinamis' },
    };
  },

  addCommands() {
    return {
      ...this.parent?.(),
      setTableAttributes: attributes => ({ tr, dispatch }) => {
        const { selection } = tr;
        let tablePos = -1;
        let tableNode = null;
        
        if (selection.node && selection.node.type.name === 'table') {
          tablePos = selection.from;
          tableNode = selection.node;
        } 
        else if (selection.$from) {
          for (let depth = selection.$from.depth; depth > 0; depth--) {
            const node = selection.$from.node(depth);
            if (node.type.name === 'table') {
              tablePos = selection.$from.before(depth);
              tableNode = node;
              break;
            }
          }
        }
        
        if (tableNode && tablePos !== -1) {
          if (dispatch) {
            const newAttrs = {
              ...tableNode.attrs,
              ...attributes
            };
            tr.setNodeMarkup(tablePos, undefined, newAttrs);
          }
          return true;
        }
        
        return false;
      }
    };
  }
});
