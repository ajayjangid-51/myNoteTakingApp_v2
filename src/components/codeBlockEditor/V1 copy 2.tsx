import { useState } from "react";
import Editor from "@monaco-editor/react";

export default function V1() {
  const [code, setCode] = useState(`<h1>Hello 👋</h1>`);
  const [isEditing, setIsEditing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    alert("Copied!");
  };

  return (
    <div style={{ border: "1px solid #333", borderRadius: 8 }}>
      
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "8px",
          background: "#1e1e1e",
          color: "#fff",
        }}
      >
        <span>HTML</span>

        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={handleCopy}>Copy</button>
          <button onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? "Lock" : "Edit"}
          </button>
          <button onClick={() => setShowPreview(!showPreview)}>
            {showPreview ? "Code" : "Preview"}
          </button>
        </div>
      </div>

      {/* Body */}
      <div style={{ height: "300px" }}>
        {showPreview ? (
          <iframe
            srcDoc={code}
            sandbox="allow-scripts"
            width="100%"
            height="100%"
            title="preview"
          />
        ) : isEditing ? (
          <Editor
            height="100%"
            // defaultLanguage="html"
            defaultLanguage="javascript"
            value={code}
            onChange={(val) => setCode(val || "")}
            theme="vs-dark"
          />
        ) : (
          <pre
            style={{
              padding: "10px",
              background: "#0d1117",
              color: "#c9d1d9",
              height: "100%",
              overflow: "auto",
            }}
          >
            <code>{code}</code>
          </pre>
        )}
      </div>
    </div>
  );
}