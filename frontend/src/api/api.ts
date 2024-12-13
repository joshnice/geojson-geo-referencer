const BASE_URL = "https://jr4zupluaj.execute-api.eu-west-2.amazonaws.com/api";

export async function get<T>(url = "") {
	const respnse = await fetch(`${BASE_URL}/${url}`, { method: "GET" });
	const parsedResponse = await respnse.json();
	return parsedResponse as T;
}
