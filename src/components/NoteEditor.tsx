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
// import MonacoEditor from "@monaco-editor/react";


import html2pdf from "html2pdf.js";
import DrawandErase from "./reactSketchCanvas/DrawandErase";
import V1 from "./codeBlockEditor/V1";
// import V1 from "./codeBlockEditor/V1";
import Audio1 from "./audioComp/Audio1";

interface NoteEditorProps {
	value: any[];
	onChange: (value: any[]) => void;
	darkMode: boolean;
}

const NoteEditor: React.FC<NoteEditorProps> = ({
	value,
	onChange,
	darkMode,
}) => {
	const editor = useMemo(() => withHistory(withReact(createEditor())), []);

	const renderElement = useCallback((props: any) => <Element {...props} />, []);
	const renderLeaf = useCallback((props: any) => <Leaf {...props} />, []);

	const handleKeyDown = (event: React.KeyboardEvent) => {
		const key = event.key.toLowerCase();

		// -------- FORMAT SHORTCUTS --------
		if (event.ctrlKey && !event.shiftKey) {
			switch (key) {
				case "b":
					event.preventDefault();
					toggleMark(editor, "bold");
					return;

				case "i":
					event.preventDefault();
					toggleMark(editor, "italic");
					return;

				case "u":
					event.preventDefault();
					toggleMark(editor, "underline");
					return;

				// case "`":
				// 	event.preventDefault();
				// 	toggleMark(editor, "code");
				// 	return;

				case "1":
					event.preventDefault();
					toggleBlock(editor, "heading-one");
					return;

				case "2":
					event.preventDefault();
					toggleBlock(editor, "heading-two");
					return;

				case "l":
					event.preventDefault();
					toggleBlock(editor, "bulleted-list");
					return;

				case "o":
					event.preventDefault();
					toggleBlock(editor, "numbered-list");
					return;
				case "k":
					event.preventDefault();
					toggleBlock(editor, "check-list-item");
					return;
			}
		}

		// -------- INSERT SHORTCUTS --------
		if (event.ctrlKey && event.shiftKey) {
			switch (key) {
				case "i":
					event.preventDefault();
					insertImage();
					return;

				case "v":
					event.preventDefault();
					insertVideo();
					return;

				case "a":
					event.preventDefault();
					insertAudio();
					return;

				case "d":
					event.preventDefault();
					insertDrawing();
					return;

				case "c":
					event.preventDefault();
					insertCodeBlock();
					return;

				case "p":
					event.preventDefault();
					exportToPDF();
					return;
			}
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
				<button
					title="Bold (Ctrl+B)"
					className={isMarkActive(editor, "bold") ? "active" : ""}
					onMouseDown={(e) => {
						e.preventDefault(); // IMPORTANT (keeps focus in editor)
						toggleMark(editor, "bold");
					}}
				>
					<Bold size={16} />
				</button>
				<button
					title="Italic (Ctrl+i)"
					className={isMarkActive(editor, "italic") ? "active" : ""}
					onMouseDown={(e) => {
						e.preventDefault(); // IMPORTANT (keeps focus in editor)
						toggleMark(editor, "italic");
					}}
				>
					<Italic size={16} />
				</button>
				<button
					title="Underline (Ctrl+U)"
					className={isMarkActive(editor, "underline") ? "active" : ""}
					onMouseDown={(e) => {
						e.preventDefault(); // IMPORTANT (keeps focus in editor)
						toggleMark(editor, "underline");
					}}
				>
					<Underline size={16} />
				</button>

				{/* <button
					title="Code (Ctrl+`)"
					className={isMarkActive(editor, "code") ? "active" : ""}
					onMouseDown={(e) => {
						e.preventDefault(); // IMPORTANT (keeps focus in editor)
						toggleMark(editor, "code");
					}}
				>
					<Code size={16} />
				</button> */}

				<button
					title="Heading 1 (Ctrl+1)"
					className={isBlockActive(editor, "heading-one") ? "active" : ""}
					onMouseDown={(e) => {
						e.preventDefault();
						toggleBlock(editor, "heading-one");
					}}
				>
					<Heading1 size={16} />
				</button>

				<button
					title="Heading 2 (Ctrl+2)"
					className={isBlockActive(editor, "heading-two") ? "active" : ""}
					onMouseDown={(e) => {
						e.preventDefault();
						toggleBlock(editor, "heading-two");
					}}
				>
					<Heading2 size={16} />
				</button>

				<button
					title="Bullet List (Ctrl+L)"
					className={isBlockActive(editor, "bulleted-list") ? "active" : ""}
					onMouseDown={(e) => {
						e.preventDefault();
						toggleBlock(editor, "bulleted-list");
					}}
				>
					<List size={16} />
				</button>

				<button
					title="Numbered List (Ctrl+O)"
					className={isBlockActive(editor, "numbered-list") ? "active" : ""}
					onMouseDown={(e) => {
						e.preventDefault();
						toggleBlock(editor, "numbered-list");
					}}
				>
					<ListOrdered size={16} />
				</button>

				<button
					title="Check List (Ctrl+K)"
					className={isBlockActive(editor, "check-list-item") ? "active" : ""}
					onMouseDown={(e) => {
						e.preventDefault();
						toggleBlock(editor, "check-list-item");
					}}
				>
					<CheckSquare size={16} />
				</button>

				<button
					onClick={insertAudio}
					title="Insert Audio (Ctrl + Shift + A)"
					className={isBlockActive(editor, "insertAudio") ? "active" : ""}
					onMouseDown={(e) => {
						e.preventDefault();
						toggleBlock(editor, "insertAudio");
					}}
				>
					<Music size={16} />
				</button>

				<button
					onClick={insertImage}
					title="Insert Image (Ctrl + Shift + I)"
					className={isBlockActive(editor, "insertImage") ? "active" : ""}
					onMouseDown={(e) => {
						e.preventDefault();
						toggleBlock(editor, "insertImage");
					}}
				>
					<Image size={16} />
				</button>
				<button
					onClick={insertVideo}
					title="Insert Image (Ctrl + Shift + V)"
					className={isBlockActive(editor, "insertVideo") ? "active" : ""}
					onMouseDown={(e) => {
						e.preventDefault();
						toggleBlock(editor, "insertVideo");
					}}
				>
					<Video size={16} />
				</button>

				<button
					onClick={insertCodeBlock}
					title="Insert Code Block (Ctrl + Shift + C)"
					className={isBlockActive(editor, "insertCodeBlock") ? "active" : ""}
					onMouseDown={(e) => {
						e.preventDefault();
						toggleBlock(editor, "insertCodeBlock");
					}}
				>
					<Code2 size={16} />
				</button>
				<button
					onClick={insertDrawing}
					title="Insert Drawing (Ctrl + Shift + D)"
					className={isBlockActive(editor, "insertDrawing") ? "active" : ""}
					onMouseDown={(e) => {
						e.preventDefault();
						toggleBlock(editor, "insertDrawing");
					}}
				>
					Draw
				</button>
				<button
					onClick={exportToPDF}
					title="Export to PDF (Ctrl + Shift + P)"
					className={isBlockActive(editor, "exportToPDF") ? "active" : ""}
					onMouseDown={(e) => {
						e.preventDefault();
						toggleBlock(editor, "exportToPDF");
					}}
				>
					<FileText size={16} />
				</button>
			</div>
			<div className="editor-wrapper">
				<div className="editor-container">
					<Slate editor={editor} initialValue={value} onChange={onChange}>
						<Editable
							renderElement={renderElement}
							renderLeaf={renderLeaf}
							onKeyDown={handleKeyDown}
							onPaste={handlePaste}
							placeholder="Start writing your note..."
						/>
					</Slate>
				</div>
			</div>
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
						width="100%"
						height="450px"
						src={`https://www.youtube.com/embed/${element.videoId}`}
						title="YouTube video player"
						frameBorder="0"
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
						allowFullScreen
					></iframe>
				</div>
			);
		case "audio":
			// return <audio {...attributes} src={element.url} controls />;
			return <Audio1 />;
		case "drawing":
			return (
				<div {...attributes} style={{ height: "55vh" }} contentEditable={false}>
					<DrawandErase />
					{children}
				</div>
			);
		case "code-block":
			return (
				<div {...attributes} className="code-block">
					{/* <MonacoEditor
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
						Run-1
					</button> */}
					{/* <V1 /> */}
					{/* <MonacoEditor height="50vh" defaultLanguage="javascript" defaultValue="// some comment" />; */}
					<V1 />
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
