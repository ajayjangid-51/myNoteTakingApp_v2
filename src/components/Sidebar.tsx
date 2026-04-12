import React from "react";
import { Plus, FileText, Trash2, Edit3 } from "lucide-react";

interface Note {
	id: string;
	title: string;
}

interface SidebarProps {
	notes: Note[];
	currentNoteId: string | null;
	onSelectNote: (id: string) => void;
	onNewNote: () => void;
	onDeleteNote: (id: string) => void;
	onRenameNote: (id: string, newTitle: string) => void;
	darkMode: boolean;
	toggleDarkMode: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
	notes,
	currentNoteId,
	onSelectNote,
	onNewNote,
	onDeleteNote,
	onRenameNote,
	darkMode,
	toggleDarkMode,
}) => {
	return (
		<div className={`sidebar ${darkMode ? "dark" : ""}`}>
			<div className="sidebar-header">
				<button onClick={onNewNote} className="new-note-btn">
					<Plus size={16} /> New Note
				</button>
				<button onClick={toggleDarkMode} className="dark-mode-btn">
					{darkMode ? "☀️" : "🌙"}
				</button>
			</div>
			<div className="notes-list">
				{notes.map((note) => (
					<div
						key={note.id}
						className={`note-item ${currentNoteId === note.id ? "active" : ""}`}
						onClick={() => onSelectNote(note.id)}
					>
						<FileText size={16} />
						<span>{note.title}</span>
						<div className="note-actions">
							<button
								onClick={(e) => {
									e.stopPropagation();
									onRenameNote(
										note.id,
										prompt("New title:", note.title) || note.title,
									);
								}}
							>
								<Edit3 size={14} />
							</button>
							<button
								onClick={(e) => {
									e.stopPropagation();
									onDeleteNote(note.id);
								}}
							>
								<Trash2 size={14} />
							</button>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default Sidebar;
