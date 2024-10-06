import { useRef } from "react";
import { MapboxCad } from "../mapbox/mapbox-cad";
import { Subjects } from "../mapbox/types";

interface CadMapProps {
    file: File;
    subjects: Subjects
}

export function CadMapComponent({ file, subjects }: CadMapProps) {

    const createdMap = useRef(false);

    const onMapElementRender = (containerElement: HTMLDivElement) => {
        if (!createdMap.current) {
            createdMap.current = true;
            new MapboxCad(containerElement, file, subjects);
        }
    }

    return <div className="map-element" ref={onMapElementRender} />
} 