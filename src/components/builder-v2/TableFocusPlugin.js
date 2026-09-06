import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";

export const TableFocusPlugin = Extension.create({
  name: "tableFocus",
  
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("tableFocus"),
        props: {
          decorations(state) {
            const { selection } = state;
            const decorations = [];
            
            if (selection.node && selection.node.type.name === "table") {
              decorations.push(
                Decoration.node(selection.from, selection.from + selection.node.nodeSize, {
                  class: "table-has-focus"
                })
              );
            } else if (selection.$from) {
              for (let depth = selection.$from.depth; depth > 0; depth--) {
                const node = selection.$from.node(depth);
                if (node.type.name === "table") {
                  const pos = selection.$from.before(depth);
                  decorations.push(
                    Decoration.node(pos, pos + node.nodeSize, {
                      class: "table-has-focus"
                    })
                  );
                  break;
                }
              }
            }
            return DecorationSet.create(state.doc, decorations);
          }
        }
      })
    ];
  }
});
