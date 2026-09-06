import { Extension } from '@tiptap/core';

export const TabExtension = Extension.create({
  name: 'tabExtension',

  addKeyboardShortcuts() {
    return {
      Tab: ({ editor }) => {
        // If cursor is in a list item, let the default list behavior handle it (indenting the list)
        if (editor.isActive('listItem')) {
          return false; 
        }
        
        // Otherwise, insert a true tab character for flexible alignment
        editor.commands.insertContent('\t');
        return true; 
      },
    };
  },
});
