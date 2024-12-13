import { useEffect, useState } from "react";
import { useSubjectContext } from "../subjects-context";

export function useCadRotation() {
	const { $rotation } = useSubjectContext();
	const [rotation, setRotation] = useState(0);

	useEffect(() => {
		const sub = $rotation.subscribe((updatedRotation) => {
			setRotation(updatedRotation);
		});

		return () => {
			sub.unsubscribe();
		};
	}, [$rotation]);

	return {
		rotation,
		setRotaion: (value: number) => {
			$rotation.next(value);
		},
	};
}
