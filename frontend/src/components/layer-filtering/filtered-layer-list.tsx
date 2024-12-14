import { useFilteredLayerIds } from "../../state/hooks/use-filtered-layerids";
import { LayerChipComponent } from "./layer-chip";
import "./filtered-layer-list.css";

export function LayerListComponent() {
	const { layerIds, removeLayerId } = useFilteredLayerIds();

	return (
		<div className="layer-list">
			{layerIds.map((layerId) => (
				<LayerChipComponent key={layerId} layerId={layerId} onRemoveClicked={() => removeLayerId(layerId)} />
			))}
		</div>
	);
}
