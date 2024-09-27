import { useRef } from "react";
import { MapboxCad } from "../mapbox/mapbox-cad";
import { Subjects } from "../mapbox/types";

interface CadMapProps {
    file: File;
    showCad: boolean;
    subjects: Subjects
}

export function CadMapComponent({ file, showCad, subjects }: CadMapProps) {

    const createdMap = useRef(false);

    const onMapElementRender = (containerElement: HTMLDivElement) => {
        if (!createdMap.current) {
            createdMap.current = true;
            console.log("create map cad");
            new MapboxCad(containerElement, file, subjects);
        }
    }

    return <div className="map-element" style={{ zIndex: showCad ? 6 : 4 }} ref={onMapElementRender} />
} 