import { CadUploadOptions } from "../../types/cad-upload-types";

type FileChangeAction = {
    type: "geojson" | "style";
    payload: File;
};

type WidthChangeAction = {
    type: "width";
    payload: number;
};

export const initialState: CadUploadOptions = {
    geojsonFile: null,
    styleFile: null,
    width: 0,
};

export function reducer(
    state: CadUploadOptions,
    action: FileChangeAction | WidthChangeAction,
): CadUploadOptions {
    switch (action.type) {
        case "geojson":
            return { ...state, geojsonFile: action.payload };
        case "style":
            return { ...state, styleFile: action.payload };
        case "width":
            return { ...state, width: action.payload };
        default:
            return state;
    }
}