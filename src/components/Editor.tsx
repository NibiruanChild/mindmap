import { useEffect } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListNode, ListItemNode } from '@lexical/list';
import type { EditorState } from 'lexical';
import { parseEditorContent } from '../utils/hierarchyParser';
import type { ParsedContent } from '../types';
import ToolbarPlugin from './plugins/ToolbarPlugin';
import DraggablePlugin from './plugins/DraggablePlugin';
import './Editor.css';

const theme = {
  heading: {
    h1: 'editor-heading-h1',
    h2: 'editor-heading-h2',
    h3: 'editor-heading-h3',
    h4: 'editor-heading-h4',
    h5: 'editor-heading-h5',
    h6: 'editor-heading-h6',
  },
  list: {
    nested: {
      listitem: 'editor-nested-listitem',
    },
    ol: 'editor-list-ol',
    ul: 'editor-list-ul',
    listitem: 'editor-listitem',
  },
  paragraph: 'editor-paragraph',
  text: {
    bold: 'editor-text-bold',
    italic: 'editor-text-italic',
    underline: 'editor-text-underline',
  },
};

interface OnChangePluginWrapperProps {
  onChange: (content: ParsedContent) => void;
}

function OnChangePluginWrapper({ onChange }: OnChangePluginWrapperProps) {
  const [editor] = useLexicalComposerContext();

  const handleChange = (editorState: EditorState) => {
    editorState.read(() => {
      const parsedContent = parseEditorContent();
      onChange(parsedContent);
    });
  };

  useEffect(() => {
    // Initial parse
    editor.update(() => {
      const parsedContent = parseEditorContent();
      onChange(parsedContent);
    });
  }, [editor, onChange]);

  return <OnChangePlugin onChange={handleChange} />;
}

interface EditorProps {
  onChange: (content: ParsedContent) => void;
}

export default function Editor({ onChange }: EditorProps) {
  const initialConfig = {
    namespace: 'MindMapEditor',
    theme,
    onError: (error: Error) => {
      console.error(error);
    },
    nodes: [HeadingNode, ListNode, ListItemNode, QuoteNode],
  };

  return (
    <div className="editor-container">
      <LexicalComposer initialConfig={initialConfig}>
        <div className="editor-inner">
          <ToolbarPlugin />
          <div className="editor-content">
            <RichTextPlugin
              contentEditable={<ContentEditable className="editor-input" />}
              placeholder={
                <div className="editor-placeholder">
                  Start typing... Use headings (H1-H6), paragraphs, and lists to create your mindmap
                </div>
              }
              ErrorBoundary={LexicalErrorBoundary}
            />
            <HistoryPlugin />
            <ListPlugin />
            <DraggablePlugin />
            <OnChangePluginWrapper onChange={onChange} />
          </div>
        </div>
      </LexicalComposer>
    </div>
  );
}
