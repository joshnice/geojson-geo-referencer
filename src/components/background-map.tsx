import { useRef } from "react";
import { MapboxBackground } from "../mapbox/mapbox-background";
import { Subjects } from "../mapbox/types";

interface BaseMapProps {
    subjects: Subjects;
}

export function BaseMapComponent({ subjects }: BaseMapProps) {

    const createdMap = useRef(false);

    const onMapElementRender = (containerElement: HTMLDivElement) => {
        if (!createdMap.current) {
            createdMap.current = true;
            new MapboxBackground(containerElement, subjects);
        }
    }

    return <div className="map-element" style={{ zIndex: 5 }} ref={onMapElementRender} />
} 