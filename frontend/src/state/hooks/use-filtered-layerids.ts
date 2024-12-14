import { useEffect, useState } from "react";
import { useSubjectContext } from "../subjects-context";

export function useFilteredLayerIds() {
	const { $filteredLayerIds } = useSubjectContext();
	const [layerIds, setLayerIds] = useState<string[]>([]);

	useEffect(() => {
		const sub = $filteredLayerIds.subscribe((layerIds) => {
			setLayerIds(layerIds);
		});

		return () => {
			sub.unsubscribe();
		};
	}, [$filteredLayerIds]);

	return {
		layerIds,
		removeLayerId: (removedLayerId: string) => {
			const updatedLayerIds = layerIds.filter((layerId) => layerId !== removedLayerId);
			$filteredLayerIds.next(updatedLayerIds);
		},
	};
}
