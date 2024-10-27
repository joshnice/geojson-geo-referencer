import { useState } from "react";
import { useSubjectContext } from "../../state/subjects-context";

export function MoveBackground() {
	const { $moveBackgroundPosition } = useSubjectContext();

	const [moveBackground, setMoveBackground] = useState(true);

	const handleMoveBackground = () => {
		const updatedValue = !moveBackground;
		setMoveBackground(updatedValue);
		$moveBackgroundPosition.next(updatedValue);
	};

	return (
		<div className="control-option">
			<p className="control-label">Move Background</p>
			<input
				type="checkbox"
				checked={moveBackground}
				onChange={() => handleMoveBackground()}
			/>
		</div>
	);
}
