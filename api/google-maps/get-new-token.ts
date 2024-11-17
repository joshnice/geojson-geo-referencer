export async function getNewGoogleMapsToken(apiToken: string) {
    const response = await fetch(`https://tile.googleapis.com/v1/createSession?key=${apiToken}`, {
        method: "POST", body: JSON.stringify({
            mapType: "satellite",
            language: "en-US",
            region: "US"
        }), headers: {
            "Content-Type": "application/json"
        },
    });
    const parsedResponse = await response.json();
    return parsedResponse as { session: string, expiry: string }
}