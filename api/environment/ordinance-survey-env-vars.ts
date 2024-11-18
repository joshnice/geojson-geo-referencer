export function getOrdinaceSurveyApiKey() {
    const environmentVariable = process.env.OS_API_KEY;
    if (environmentVariable == null) {
        throw new Error("Google maps api key is not in environment variables");
    }
    return environmentVariable;
}