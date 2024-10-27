import type { MapboxSearchResults } from "./map-search-types";

const MAPBOX_SEARCH_API_URL_BASE =
	"https://api.mapbox.com/search/geocode/v6/forward";

const MAPBOX_SEARCH_API_TOKEN =
	"pk.eyJ1Ijoiam9zaG5pY2U5OCIsImEiOiJjanlrMnYwd2IwOWMwM29vcnQ2aWIwamw2In0.RRsdQF3s2hQ6qK-7BH5cKg";

export async function searchMapboxApi(searchString: string): Promise<MapboxSearchResults> {
	const results = await fetch(generateMapboxSearchApiUrl(searchString), {
		method: "GET",
	});
	const parsedResults = await results.json();
	return parsedResults;
}

function generateMapboxSearchApiUrl(searchString: string) {
	return `${MAPBOX_SEARCH_API_URL_BASE}?q=${searchString}&access_token=${MAPBOX_SEARCH_API_TOKEN}&types=place`;
}