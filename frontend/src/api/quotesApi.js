
const BASE_URL = "/api/quotes";
export async function getAllQuotes() {
const response = await fetch(BASE_URL);
if (!response.ok) throw new Error("Nu s-au putut prelua citatele.");
return response.json();
}

export async function addQuote(quoteData) {
const response= await fetch(BASE_URL, {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify(quoteData),
});
if (!response.ok) {
const err = await response.json();
throw new Error (err.errors?.join(", ") ||  "Nu s-a putut adăuga citatul.");
}
return response.json();
}

export async function updateQuote(id, quoteData) {
const response = await fetch(`${BASE_URL}/${id}`, {
method: "PUT",
headers: { "Content-Type": "application/json" },
body: JSON.stringify(quoteData),
});
if (!response.ok) {
const err = await response.json();
throw new Error(err.errors?.join(", ") || "Nu s-a putut actualiza citatul.");
}
return response.json();
}

export async function deleteQuote(id) {
    const response = await fetch(`${BASE_URL}/${id}`, {method:"DELETE"});
    if (!response.ok) throw new Error ("nu s-aa putut sterge citatul.");
}