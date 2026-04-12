import React, { useCallback, useMemo } from "react";
import {
	createEditor,
	Editor,
	Transforms,
	Element as SlateElement,
} from "slate";
import { Slate, Editable, withReact } from "slate-react";
import { withHistory } from "slate-history";
import {
	Bold,
	Italic,
	Underline,
	Code,
	Heading1,
	Heading2,
	List,
	ListOrdered,
	CheckSquare,
	Image,
	Video,
	Music,
	Code2,
	FileText,
} from "lucide-react";
import { ReactSketchCanvas } from "react-sketch-canvas";
import MonacoEditor from "@monaco-editor/react";
import html2pdf from "html2pdf.js";

interface NoteEditorProps {
	value: any[];
	onChange: (value: any[]) => void;
	darkMode: boolean;
}

const LineNumbers: React.FC<{ count: number; darkMode: boolean }> = ({
	count,
	darkMode,
}) => {
	const lines = Array.from({ length: count }, (_, i) => i + 1);
	return (
		<div className={`line-numbers ${darkMode ? "dark" : ""}`}>
			{lines.map((num) => (
				// <div key={num} className="line-number">
				<div key={num} >
					{/* {num} */}
					<p>{num}</p>
				</div>
			))}
		</div>
	);
};

const NoteEditor: React.FC<NoteEditorProps> = ({
	value,
	onChange,
	darkMode,
}) => {
	const editor = useMemo(() => withHistory(withReact(createEditor())), []);
	const lineCount = Math.max(value.length, 1);

	const renderElement = useCallback((props: any) => <Element {...props} />, []);
	const renderLeaf = useCallback((props: any) => <Leaf {...props} />, []);

	const handleKeyDown = (event: React.KeyboardEvent) => {
		if (!event.ctrlKey) return;

		switch (event.key) {
			case "b":
				event.preventDefault();
				toggleMark(editor, "bold");
				break;
			case "i":
				event.preventDefault();
				toggleMark(editor, "italic");
				break;
			case "u":
				event.preventDefault();
				toggleMark(editor, "underline");
				break;
			case "`":
				event.preventDefault();
				toggleMark(editor, "code");
				break;
		}
	};

	const toggleMark = (editor: Editor, format: string) => {
		const isActive = isMarkActive(editor, format);
		if (isActive) {
			Editor.removeMark(editor, format);
		} else {
			Editor.addMark(editor, format, true);
		}
	};

	const isMarkActive = (editor: Editor, format: string) => {
		const marks = Editor.marks(editor);
		return marks ? (marks as any)[format] === true : false;
	};

	const toggleBlock = (editor: Editor, format: string) => {
		const isActive = isBlockActive(editor, format);
		const isList = LIST_TYPES.includes(format);

		Transforms.unwrapNodes(editor, {
			match: (n) =>
				!Editor.isEditor(n) &&
				SlateElement.isElement(n) &&
				LIST_TYPES.includes((n as any).type),
			split: true,
		});
		const newProperties: any = {
			type: isActive ? "paragraph" : isList ? "list-item" : format,
		};
		Transforms.setNodes(editor, newProperties as any);

		if (!isActive && isList) {
			const block = { type: format, children: [] };
			Transforms.wrapNodes(editor, block);
		}
	};

	const isBlockActive = (editor: Editor, format: string) => {
		const { selection } = editor;
		if (!selection) return false;

		const [match] = Array.from(
			Editor.nodes(editor, {
				at: Editor.unhangRange(editor, selection),
				match: (n) =>
					!Editor.isEditor(n) &&
					SlateElement.isElement(n) &&
					(n as any).type === format,
			}),
		);

		return !!match;
	};

	const LIST_TYPES = ["numbered-list", "bulleted-list"];

	const insertImage = () => {
		const url = prompt("Enter image URL:");
		if (url) {
			const image = { type: "image", url, children: [{ text: "" }] };
			Transforms.insertNodes(editor, image as any);
			Transforms.insertNodes(editor, {
				type: "paragraph",
				children: [{ text: "" }],
			} as any);
			Transforms.move(editor);
		}
	};

	const insertVideo = () => {
		const url = prompt("Enter video URL:");
		if (url) {
			let videoElement;
			if (url.includes("youtube.com") || url.includes("youtu.be")) {
				const videoId = extractYouTubeId(url);
				if (videoId) {
					videoElement = {
						type: "youtube",
						videoId,
						children: [{ text: "" }],
					};
				} else {
					videoElement = { type: "video", url, children: [{ text: "" }] };
				}
			} else {
				videoElement = { type: "video", url, children: [{ text: "" }] };
			}
			Transforms.insertNodes(editor, videoElement as any);
			Transforms.insertNodes(editor, {
				type: "paragraph",
				children: [{ text: "" }],
			} as any);
			Transforms.move(editor);
		}
	};

	const extractYouTubeId = (url: string) => {
		const regExp =
			/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
		const match = url.match(regExp);
		return match && match[2].length === 11 ? match[2] : null;
	};

	const handlePaste = (event: React.ClipboardEvent) => {
		const items = event.clipboardData?.items;
		if (items) {
			for (let i = 0; i < items.length; i++) {
				const item = items[i];
				if (item.type.indexOf("image") !== -1) {
					const file = item.getAsFile();
					if (file) {
						const reader = new FileReader();
						reader.onload = (e) => {
							const result = e.target?.result as string;
							const image = {
								type: "image",
								url: result,
								children: [{ text: "" }],
							};
							Transforms.insertNodes(editor, image as any);
							Transforms.insertNodes(editor, {
								type: "paragraph",
								children: [{ text: "" }],
							} as any);
							Transforms.move(editor);
						};
						reader.readAsDataURL(file);
					}
				}
			}
		}
	};

	const insertAudio = () => {
		const url = prompt("Enter audio URL:");
		if (url) {
			const audio = { type: "audio", url, children: [{ text: "" }] };
			Transforms.insertNodes(editor, audio as any);
			Transforms.insertNodes(editor, {
				type: "paragraph",
				children: [{ text: "" }],
			} as any);
			Transforms.move(editor);
		}
	};

	const insertDrawing = () => {
		const drawing = { type: "drawing", children: [{ text: "" }] };
		Transforms.insertNodes(editor, drawing as any);
		Transforms.insertNodes(editor, {
			type: "paragraph",
			children: [{ text: "" }],
		} as any);
		Transforms.move(editor);
	};

	const insertCodeBlock = () => {
		const code = {
			type: "code-block",
			language: "javascript",
			code: "",
			children: [{ text: "" }],
		};
		Transforms.insertNodes(editor, code as any);
		Transforms.insertNodes(editor, {
			type: "paragraph",
			children: [{ text: "" }],
		} as any);
		Transforms.move(editor);
	};

	const exportToPDF = () => {
		const element = document.querySelector(".note-editor");
		if (element) {
			const opt = {
				margin: 1,
				filename: "note.pdf",
				image: { type: "jpeg" as const, quality: 0.98 },
				html2canvas: { scale: 2 },
				jsPDF: {
					unit: "in",
					format: "letter",
					orientation: "portrait" as const,
				},
			};
			html2pdf()
				.set(opt)
				.from(element as HTMLElement)
				.save();
		}
	};

	return (
		<div className={`note-editor ${darkMode ? "dark" : ""}`}>
			<div className="toolbar">
				<button onClick={() => toggleMark(editor, "bold")}>
					<Bold size={16} />
				</button>
				<button onClick={() => toggleMark(editor, "italic")}>
					<Italic size={16} />
				</button>
				<button onClick={() => toggleMark(editor, "underline")}>
					<Underline size={16} />
				</button>
				<button onClick={() => toggleMark(editor, "code")}>
					<Code size={16} />
				</button>
				<button onClick={() => toggleBlock(editor, "heading-one")}>
					<Heading1 size={16} />
				</button>
				<button onClick={() => toggleBlock(editor, "heading-two")}>
					<Heading2 size={16} />
				</button>
				<button onClick={() => toggleBlock(editor, "bulleted-list")}>
					<List size={16} />
				</button>
				<button onClick={() => toggleBlock(editor, "numbered-list")}>
					<ListOrdered size={16} />
				</button>
				<button onClick={() => toggleBlock(editor, "check-list-item")}>
					<CheckSquare size={16} />
				</button>
				<button onClick={insertImage}>
					<Image size={16} />
				</button>
				<button onClick={insertVideo}>
					<Video size={16} />
				</button>
				<button onClick={insertAudio}>
					<Music size={16} />
				</button>
				<button onClick={insertDrawing}>Draw</button>
				<button onClick={insertCodeBlock}>
					<Code2 size={16} />
				</button>
				<button onClick={exportToPDF}>
					<FileText size={16} />
				</button>
			</div>
			<div className="editor-wrapper">
  <div className="line-numberss">
    <LineNumbers count={lineCount} darkMode={darkMode} />
  </div>

  <div className="editor-container">
    <Slate editor={editor} initialValue={value} onChange={onChange}>
      <Editable
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
      />
    </Slate>
  </div>
</div>
			{/* <div className="editor-wrapper">
				<LineNumbers count={lineCount} darkMode={darkMode} />
				<Slate editor={editor} initialValue={value} onChange={onChange} style={{ flex: 3 }}>
					<Editable
						renderElement={renderElement}
						renderLeaf={renderLeaf}
						onKeyDown={handleKeyDown}
						onPaste={handlePaste}
						// placeholder="Start writing your note..."
					/>
				</Slate>
			</div> */}
		</div>
	);
};

const Element = ({ attributes, children, element }: any) => {
	switch ((element as any).type) {
		case "heading-one":
			return <h1 {...attributes}>{children}</h1>;
		case "heading-two":
			return <h2 {...attributes}>{children}</h2>;
		case "bulleted-list":
			return <ul {...attributes}>{children}</ul>;
		case "numbered-list":
			return <ol {...attributes}>{children}</ol>;
		case "list-item":
			return <li {...attributes}>{children}</li>;
		case "check-list-item":
			return (
				<div {...attributes} className="check-list-item">
					<input type="checkbox" checked={(element as any).checked} readOnly />
					<span>{children}</span>
				</div>
			);
		case "image":
			return (
				<img
					{...attributes}
					src={element.url}
					alt=""
					style={{ maxWidth: "100%" }}
				/>
			);
		case "video":
			return (
				<video
					{...attributes}
					src={element.url}
					controls
					style={{ maxWidth: "100%" }}
				/>
			);
		case "youtube":
			return (
				<div {...attributes}>
					<iframe
						width="560"
						height="315"
						src={`https://www.youtube.com/embed/${element.videoId}`}
						title="YouTube video player"
						frameBorder="0"
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
						allowFullScreen
					></iframe>
				</div>
			);
		case "audio":
			return <audio {...attributes} src={element.url} controls />;
		case "drawing":
			return (
				<div {...attributes}>
					<ReactSketchCanvas
						style={{ border: "1px solid #ccc", width: "80%", height: "300px" }}
						strokeWidth={4}
						strokeColor="red"
					/>
				</div>
			);
		case "code-block":
			return (
				<div {...attributes} className="code-block">
					<MonacoEditor
						height="200px"
						language={(element as any).language}
						value={(element as any).code}
						theme="vs-dark"
					/>
					<button
						onClick={() => {
							try {
								const result = eval((element as any).code);
								alert("Output: " + result);
							} catch (e: any) {
								alert("Error: " + e.message);
							}
						}}
					>
						Run
					</button>
				</div>
			);
		default:
			return <p {...attributes}>{children}</p>;
	}
};

const Leaf = ({ attributes, children, leaf }: any) => {
	if (leaf.bold) {
		children = <strong>{children}</strong>;
	}

	if (leaf.italic) {
		children = <em>{children}</em>;
	}

	if (leaf.underline) {
		children = <u>{children}</u>;
	}

	if (leaf.code) {
		children = <code>{children}</code>;
	}

	return <span {...attributes}>{children}</span>;
};

export default NoteEditor;
