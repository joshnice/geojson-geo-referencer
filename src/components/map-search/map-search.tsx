import { useReducer, type ChangeEvent } from "react";
import { searchMapboxApi } from "./map-search-api-functions";
import {
	initialMapSearchReducerState,
	mapSearchReducer,
} from "./map-search-state";
import { useSubjectContext } from "../../state/subjects-context";
import "./map-search.css";

export function MapSearch() {
	const { $searchLocationClicked } = useSubjectContext();
	const [state, dispatch] = useReducer(
		mapSearchReducer,
		initialMapSearchReducerState,
	);

	const handleMapSearchChange = async (
		event: ChangeEvent<HTMLInputElement>,
	) => {
		const searchString = event.target.value;
		dispatch({
			type: "update-search-string",
			payload: { request: setupApiCall(searchString), searchString },
		});
	};

	const setupApiCall = (searchString: string) => {
		return setTimeout(async () => {
			const results = await searchMapboxApi(searchString);
			dispatch({ type: "update-results", payload: results.features });
		}, 1000);
	};

	const handleResultClicked = (
		locationBbox: [number, number, number, number],
		name: string,
	) => {
		$searchLocationClicked.next(locationBbox);
		console.log("name", name);
		dispatch({ type: "result-clicked", payload: name });
	};

	return (
		<div className="map-search">
			<input
				type="text"
				value={state.searchString}
				onChange={handleMapSearchChange}
				placeholder="Search for location"
			/>
			{state.results.map((result) => (
				<button
					type="button"
					className="map-search-result"
					key={result.id}
					onClick={() =>
						handleResultClicked(
							result.properties.bbox,
							result.properties.full_address,
						)
					}
				>
					{result.properties.full_address}
				</button>
			))}
			{state.touched && state.results.length === 0 && (
				<button type="button" className="map-search-result">
					No results
				</button>
			)}
		</div>
	);
}
