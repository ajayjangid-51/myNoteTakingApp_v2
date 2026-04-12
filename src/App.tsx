import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import NoteEditor from "./components/NoteEditor";
import "./App.css";

interface Note {
	id: string;
	title: string;
	content: any[];
}

function App() {
	const [notes, setNotes] = useState<Note[]>([]);
	const [currentNoteId, setCurrentNoteId] = useState<string | null>(null);
	const [darkMode, setDarkMode] = useState(true);

	useEffect(() => {
		const savedNotes = localStorage.getItem("notes");
		const savedDarkMode = localStorage.getItem("darkMode");
		if (savedNotes) {
			setNotes(JSON.parse(savedNotes));
		}
		if (savedDarkMode) {
			setDarkMode(JSON.parse(savedDarkMode));
		}
	}, []);

	useEffect(() => {
		localStorage.setItem("notes", JSON.stringify(notes));
	}, [notes]);

	useEffect(() => {
		localStorage.setItem("darkMode", JSON.stringify(darkMode));
	}, [darkMode]);

	const currentNote = notes.find((note) => note.id === currentNoteId);

	const handleNewNote = () => {
		const newNote: Note = {
			id: Date.now().toString(),
			title: "New Note",
			content: [{ type: "paragraph", children: [{ text: "" }] }],
		};
		setNotes([...notes, newNote]);
		setCurrentNoteId(newNote.id);
	};

	const handleSelectNote = (id: string) => {
		setCurrentNoteId(id);
	};

	const handleDeleteNote = (id: string) => {
		setNotes(notes.filter((note) => note.id !== id));
		if (currentNoteId === id) {
			setCurrentNoteId(notes.length > 1 ? notes[0].id : null);
		}
	};

	const handleRenameNote = (id: string, newTitle: string) => {
		setNotes(
			notes.map((note) =>
				note.id === id ? { ...note, title: newTitle } : note,
			),
		);
	};

	const handleContentChange = (content: any[]) => {
		if (currentNote) {
			setNotes(
				notes.map((note) =>
					note.id === currentNote.id ? { ...note, content } : note,
				),
			);
		}
	};

	const toggleDarkMode = () => {
		setDarkMode(!darkMode);
	};

	return (
		<div className={`app ${darkMode ? "dark" : ""}`}>
			<Sidebar
				notes={notes}
				currentNoteId={currentNoteId}
				onSelectNote={handleSelectNote}
				onNewNote={handleNewNote}
				onDeleteNote={handleDeleteNote}
				onRenameNote={handleRenameNote}
				darkMode={darkMode}
				toggleDarkMode={toggleDarkMode}
			/>
			<div className="main-content">
				{currentNote ? (
					<NoteEditor
						value={currentNote.content}
						onChange={handleContentChange}
						darkMode={darkMode}
					/>
				) : (
					<div className="no-note">
						Select or create a note to start writing.
					</div>
				)}
			</div>
		</div>
	);
}

export default App;
