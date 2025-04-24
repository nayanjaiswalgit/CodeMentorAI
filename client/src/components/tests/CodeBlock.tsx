import { Editor } from "@monaco-editor/react";

interface CodeBlockProps {
  code: string;
  language: string;
  height?: string;
}

export function CodeBlock({ code, language, height = "200px" }: CodeBlockProps) {
  return (
    <div className="border rounded-md overflow-hidden">
      <Editor
        height={height}
        language={language}
        value={code}
        options={{
          readOnly: true,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          fontSize: 14,
        }}
      />
    </div>
  );
}
