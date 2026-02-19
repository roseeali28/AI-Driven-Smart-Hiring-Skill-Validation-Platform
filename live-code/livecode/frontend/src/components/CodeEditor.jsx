
import React from 'react';
import Editor from '@monaco-editor/react';

const CodeEditor = ({ language = 'javascript', code, onChange }) => {
  const handleEditorChange = (value) => {
    onChange(value);
  };

  return (
    <div className="h-full w-full border border-gray-300 rounded overflow-hidden">
      <Editor
        height="100%"
        language={language}
        defaultValue="// Write your code here"
        value={code}
        onChange={handleEditorChange}
        theme="vs-dark"
        path={`file.${language}`} // unique path per language to reset validation
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          scrollBeyondLastLine: false,
          automaticLayout: true,
        }}
      />
    </div>
  );
};

export default CodeEditor;
