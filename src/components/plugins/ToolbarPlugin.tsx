import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getSelection, $isRangeSelection, FORMAT_TEXT_COMMAND } from 'lexical';
import { $setBlocksType } from '@lexical/selection';
import { $createHeadingNode, type HeadingTagType } from '@lexical/rich-text';
import { $createParagraphNode } from 'lexical';
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
} from '@lexical/list';
import { useCallback } from 'react';
import './ToolbarPlugin.css';

export default function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();

  const formatHeading = useCallback(
    (headingSize: HeadingTagType) => {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createHeadingNode(headingSize));
        }
      });
    },
    [editor]
  );

  const formatParagraph = useCallback(() => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createParagraphNode());
      }
    });
  }, [editor]);

  const formatBulletList = useCallback(() => {
    editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
  }, [editor]);

  const formatNumberedList = useCallback(() => {
    editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
  }, [editor]);

  const formatBold = useCallback(() => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');
  }, [editor]);

  const formatItalic = useCallback(() => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic');
  }, [editor]);

  const formatUnderline = useCallback(() => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline');
  }, [editor]);

  return (
    <div className="toolbar">
      <button onClick={() => formatHeading('h1')} className="toolbar-item" title="Heading 1">
        H1
      </button>
      <button onClick={() => formatHeading('h2')} className="toolbar-item" title="Heading 2">
        H2
      </button>
      <button onClick={() => formatHeading('h3')} className="toolbar-item" title="Heading 3">
        H3
      </button>
      <button onClick={() => formatHeading('h4')} className="toolbar-item" title="Heading 4">
        H4
      </button>
      <button onClick={() => formatHeading('h5')} className="toolbar-item" title="Heading 5">
        H5
      </button>
      <button onClick={() => formatHeading('h6')} className="toolbar-item" title="Heading 6">
        H6
      </button>
      <span className="toolbar-divider" />
      <button onClick={formatParagraph} className="toolbar-item" title="Paragraph">
        P
      </button>
      <span className="toolbar-divider" />
      <button onClick={formatBulletList} className="toolbar-item" title="Bullet List">
        • List
      </button>
      <button onClick={formatNumberedList} className="toolbar-item" title="Numbered List">
        1. List
      </button>
      <span className="toolbar-divider" />
      <button onClick={formatBold} className="toolbar-item" title="Bold">
        <strong>B</strong>
      </button>
      <button onClick={formatItalic} className="toolbar-item" title="Italic">
        <em>I</em>
      </button>
      <button onClick={formatUnderline} className="toolbar-item" title="Underline">
        <u>U</u>
      </button>
    </div>
  );
}
