import { useCadRotation } from "../../state/hooks/use-cad-rotation";

export function RotationCad() {
	const { rotation, setRotaion } = useCadRotation();

	const handleRotationChange = (valStr: string) => {
		const valNumber = Number.parseFloat(valStr);
		if (!Number.isNaN(valNumber)) {
			console.log("handleRotationChange", valNumber);

			if (valNumber > 360) {
				setRotaion(0);
				return;
			}

			if (valNumber < 0) {
				setRotaion(360);
				return;
			}

			setRotaion(valNumber);
		}
	};

	const readableBearing = Number.parseFloat(rotation.toFixed(2));

	return (
		<div className="control-option">
			<p className="control-label">Rotation </p>
			<input
				className="number-input"
				type="number"
				value={readableBearing}
				onChange={(event) => handleRotationChange(event.target.value)}
			/>
		</div>
	);
}
