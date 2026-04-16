import { useState } from "react";
import Editor from "@monaco-editor/react";

const templates: any = {
  html: "<h1>Hello HTML</h1>",
  javascript: "console.log('Hello JS');",
  cpp: `#include <iostream>
using namespace std;

int main() {
  cout << "Hello C++";
  return 0;
}`,
  java: `public class Main {
  public static void main(String[] args) {
    System.out.println("Hello Java");
  }
}`
};

// export default function MultiLangEditor() {
export default function V1() {
  const [language, setLanguage] = useState("html");
  const [code, setCode] = useState(templates.html);
  const [output, setOutput] = useState("");
   const [showOutput, setShowOutput] = useState(false);

  const handleLangChange = (lang: string) => {
    setLanguage(lang);
    setCode(templates[lang]);
    setOutput("");
  };

  const runCode = () => {
    if (language === "html") {
      setOutput(code);
    } else if (language === "javascript") {
      try {
        const logs: any[] = [];
        const originalLog = console.log;

        console.log = (...args) => logs.push(args.join(" "));
        eval(code);
        console.log = originalLog;

        setOutput(logs.join("\n"));
      } catch (err: any) {
        setOutput(err.message);
      }
    } else {
      // Backend needed
      setOutput("⚠️ Execution requires backend compiler");
    }
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      
      {/* Tabs */}
      <div style={{ display: "flex", gap: "10px", padding: "10px" }}>
        {["html", "javascript", "cpp", "java"].map((lang) => (
          <button key={lang} onClick={() => handleLangChange(lang)}>
            {lang.toUpperCase()}
          </button>
        ))}

        <button onClick={runCode}>Run ▶</button>
       <button onClick={() => setShowOutput((prev) => !prev)}>
          {showOutput ? "Hide Output" : "Show Output"}
        </button>
      </div>

      {/* Editor */}
      <Editor
        height="50%"
        language={language === "cpp" ? "cpp" : language}
        value={code}
        onChange={(val) => setCode(val || "")}
        theme="vs-dark"
      />

      {/* Run */}
      

      {/* Output */}
       {showOutput && (
      <div style={{ flex: 1, background: "#111", color: "#0f0", padding: "10px" }}>
        {language === "html" ? (
          <iframe
            srcDoc={output}
            sandbox="allow-scripts"
            width="100%"
            height="100%"
            title="preview"
          />
        ) : (
          <pre>{output}</pre>
        )}
      </div>
)}
    </div>
  );
}