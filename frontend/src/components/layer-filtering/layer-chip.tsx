import { TooltipComponent } from "../tooltip/tooltip";
import "./layer-chip.css";

interface LayerChipProps {
	layerId: string;
	onRemoveClicked: () => void;
}

export function LayerChipComponent({ layerId, onRemoveClicked }: LayerChipProps) {
	return (
		<TooltipComponent message="Click to remove">
			<button type="button" onClick={onRemoveClicked} className="layer-chip">
				{layerId}
			</button>
		</TooltipComponent>
	);
}
