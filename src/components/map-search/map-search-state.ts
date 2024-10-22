import type { MapboxSearchResults } from "./map-search-types";

type UpdateSearchString = { type: "update-search-string", payload: {searchString: string, request: ReturnType<typeof setTimeout>} };
type UpdateResults = { type: "update-results", payload: MapboxSearchResults["features"] };
type ResultClicked = { type: "result-clicked", payload: string };


type MapSearchReducerPayload = UpdateSearchString | UpdateResults | ResultClicked;

type MapSearchReducerState = {
    searchString: string;
    results: MapboxSearchResults["features"];
    touched: boolean;
    apiCall: ReturnType<typeof setTimeout> | null;
}

export const initialMapSearchReducerState: MapSearchReducerState = {
    apiCall: null,
    results: [],
    searchString: "",
    touched: false
}

export function mapSearchReducer(state: MapSearchReducerState, action: MapSearchReducerPayload): MapSearchReducerState {
    switch (action.type) {
        case "update-results": 
            return {
                ...state,
                results: action.payload,
                touched: state.searchString.length > 0,
            }
        case "update-search-string": 
            if (state.apiCall != null) {
                clearTimeout(state.apiCall);
            }
            return {
                ...state,
                searchString: action.payload.searchString,
                apiCall: action.payload.request,
                touched: false,
            }
        case "result-clicked":
            console.log("action", action.payload); 
            return {
                ...state,
                touched: false,
                results: [],
                searchString: action.payload,
            }
    }
} 