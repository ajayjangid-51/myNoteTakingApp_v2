import {
	ReactSketchCanvas,
	type ReactSketchCanvasRef,
} from "react-sketch-canvas";
import { type ChangeEvent, useRef, useState } from "react";

export default function DrawandErase() {
	const canvasRef = useRef<ReactSketchCanvasRef>(null);
	const [eraseMode, setEraseMode] = useState(false);
	const [strokeWidth, setStrokeWidth] = useState(5);
	const [eraserWidth, setEraserWidth] = useState(10);
	const [strokeColor, setStrokeColor] = useState("#000000");
	const [canvasColor, setCanvasColor] = useState("#aea2a2");
	const [readOnly, setReadOnly] = useState(false);

	const handleEraserClick = () => {
		setEraseMode(true);
		canvasRef.current?.eraseMode(true);
	};

	const handlePenClick = () => {
		setEraseMode(false);
		canvasRef.current?.eraseMode(false);
	};

	const handleStrokeWidthChange = (event: ChangeEvent<HTMLInputElement>) => {
		setStrokeWidth(+event.target.value);
	};

	const handleEraserWidthChange = (event: ChangeEvent<HTMLInputElement>) => {
		setEraserWidth(+event.target.value);
	};

	const handleStrokeColorChange = (event: ChangeEvent<HTMLInputElement>) => {
		setStrokeColor(event.target.value);
	};

	const handleCanvasColorChange = (event: ChangeEvent<HTMLInputElement>) => {
		setCanvasColor(event.target.value);
	};

	const handleReadOnlyChange = (event: ChangeEvent<HTMLInputElement>) => {
		setReadOnly(event.target.checked);
	};

	const handleUndoClick = () => {
		canvasRef.current?.undo();
	};

	const handleRedoClick = () => {
		canvasRef.current?.redo();
	};

	const handleClearClick = () => {
		canvasRef.current?.clearCanvas();
	};

	const handleResetClick = () => {
		canvasRef.current?.resetCanvas();
	};

	return (
		<div className="draw-container">
			<div className="draw-toolbar">
				{/* Colors */}
				<div className="tool-group">
					<label>Stroke</label>
					<input
						type="color"
						value={strokeColor}
						onChange={handleStrokeColorChange}
					/>

					<label>Canvas</label>
					<input
						type="color"
						value={canvasColor}
						onChange={handleCanvasColorChange}
					/>
				</div>

				{/* Tools */}
				<div className="tool-group">
					<button
						className={!eraseMode ? "active" : ""}
						onClick={handlePenClick}
					>
						✏️
					</button>

					<button
						className={eraseMode ? "active" : ""}
						onClick={handleEraserClick}
					>
						🧽
					</button>
				</div>

				{/* Sliders */}
				<div className="tool-group sliders">
					<div>
						<label>Stroke</label>
						<input
							type="range"
							min="1"
							max="20"
							value={strokeWidth}
							disabled={eraseMode}
							onChange={handleStrokeWidthChange}
						/>
					</div>

					<div>
						<label>Eraser</label>
						<input
							type="range"
							min="1"
							max="20"
							value={eraserWidth}
							disabled={!eraseMode}
							onChange={handleEraserWidthChange}
						/>
					</div>
				</div>

				{/* Actions */}
				<div className="tool-group">
					<button onClick={handleUndoClick}>↶</button>
					<button onClick={handleRedoClick}>↷</button>
					<button onClick={handleClearClick}>🧹</button>
					<button onClick={handleResetClick}>♻️</button>
				</div>

				{/* Toggle */}
				<div className="tool-group">
					<label className="switch">
						<input
							type="checkbox"
							checked={readOnly}
							onChange={handleReadOnlyChange}
						/>
						<span>Read only</span>
					</label>
				</div>
			</div>

			{/* Canvas */}
			<div className="canvas-wrapper">
				<ReactSketchCanvas
					ref={canvasRef}
					strokeWidth={strokeWidth}
					eraserWidth={eraserWidth}
					strokeColor={strokeColor}
					canvasColor={canvasColor}
					readOnly={readOnly}
				/>
			</div>
		</div>
	);
}
