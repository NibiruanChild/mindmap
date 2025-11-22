import { useState, useCallback } from 'react';
import Editor from './components/Editor';
import MindMap from './components/MindMap';
import type { ParsedContent } from './types';
import './App.css';

function App() {
  const [parsedContent, setParsedContent] = useState<ParsedContent>({
    nodes: [],
    rootNodes: [],
  });

  const handleEditorChange = useCallback((content: ParsedContent) => {
    setParsedContent(content);
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Text to MindMap Generator</h1>
        <p>Create beautiful mindmaps from structured text</p>
      </header>
      <div className="app-content">
        <div className="editor-panel">
          <h2 className="panel-title">Editor</h2>
          <Editor onChange={handleEditorChange} />
        </div>
        <div className="mindmap-panel">
          <h2 className="panel-title">MindMap</h2>
          <MindMap rootNodes={parsedContent.rootNodes} />
        </div>
      </div>
    </div>
  );
}

export default App;
