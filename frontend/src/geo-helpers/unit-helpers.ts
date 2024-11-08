export function unitConversionToMeter(value: number, unit: string) {
    switch (unit) {
        case "meters":
            // hmmmm???
            return value * 1.1;
        case "millimeters":
            return (value / 1000);
        default:
            throw new Error(`Unit ${unit} is not suppored`);
    }
}