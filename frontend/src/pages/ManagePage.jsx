import { useEffect, useState } from "react";
import { Link} from "react-router-dom";
import QuoteCard from "../components/QuoteCard";
import { getAllQuotes, addQuote, updateQuote, deleteQuote } from "../api/quotesApi";

export default function ManagePage() {

const [quotes, setQuotes]        = useState([]);

const [editingQuote, setEditingQuote]= useState(null);


const [formData,setFormData]      =useState({author:"",quote:""});

const[feedback,setFeedback]       =useState({message:"",type:""});
const[loading,setLoading]         =useState(true);
useEffect(()=>{
        fetchQuotes();
    }, []);


async function fetchQuotes() {
try {
const data= await getAllQuotes();
setQuotes (data);
} catch (err) {
showFeedback(err.message, "error");
} finally {
setLoading (false);
}
}
     
function handleChange(e) {
setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
}

async function handleSubmit(e) {
e.preventDefault();
try {
if (editingQuote) {

await updateQuote (editingQuote.id, formData);
showFeedback("Citatul a fost actualizat cu succes.", "success");
} else {
    await addQuote(formData);
    showFeedback("CItatul a fost actualizat cu succes.","succes");
}

resetForm();
fetchQuotes();
} catch (err) {

showFeedback(err.message, "error");
}
}

function handleEdit(quote) {

setEditingQuote(quote);
setFormData({ author: quote.author, quote: quote.quote });

window.scrollTo({ top:0, behavior: "smooth" });
}

async function handleDelete(id) {
if (!window.confirm("Eşti sigur că vrei să ştergi acest citat?"))
return;
try {
await deleteQuote(id);
showFeedback("Citatul a fost şters.", "success");
fetchQuotes();
} catch (err) {
showFeedback(err.message, "error");
}
}
// Functii utilitare
// Resetează formularul şi iese din modul editare
function resetForm() {
setEditingQuote(null);
setFormData({ author: "", quote: ""});
}
// Afişează mesajul de feedback şi il ascunde automat după 3 secunde
function showFeedback(message, type) {

setFeedback({ message, type });
setTimeout(() => setFeedback({ message: "", type: ""}), 3000);
}

const inputClass ="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus: ring-2 focus: ring-brand border-gray-300 bg-white text-gray-800 placeholder-gray-400 transition";
return(
    <div className="min-h-screen bg-gray-50">

     {/* Header*/}
    <header className="sticky top-8 2-10 bg-white shadow-sm">
<div className="max-w-5xl mx-auto px-4 py-4 flex items-center
justify-between">
<h1 className="text-2x1 font-bold text-brand"> Administrare citate</h1>
{/* Link de întoarce a utilizatorului la pagina de afişare */}
<Link
to="/"
className="px-4 py-2 text-sm font-medium text-brand border border-brand rounded-lg hover:bg-brand hover: text-white transition-colors duration-200"
>
 Inapoi la citate
</Link>
</div>
   </header>
   <main className="max-w-5xl mx-auto px-4 py-8 space-y-10">
   {/* Banner feedback (succes / eroare)*/}
    {/* Tranziție de opacitate: apare și dispare fluid */}
   {feedback.message && (
    <div
      className={`px-4 py-3 rounded-lg text-sm font-medium transition-opacity duration-300
${feedback.type=== "success"
? "bg-green-50 text-green-700 border border-green-200"
:"bg-red-50 text-red-700 border border-red-200"
    }`}
    >

    {feedback.type==="success"? "✓": "✗"} {feedback.message}
    </div>
)}
    {/* Formular adaugare / editare */}
<section  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
    {/* Titlul si culoarea se schimba dinamic in functie de modul activ*/}
    <h2 className={`text-lg font-semibold mb-6 ${editingQuote ? "text-amber-600" : "text-brand"}`}>
        {editingQuote? "Editeaza citatul":" adauga citat nou"}
    </h2>
    {/* onSubmit pe <form> - capturat pe handleSubmit*/}
    <form onSubmit={handleSubmit} className="space-y-4">
    {/*Câmp autor */}
<div>
<label htmlFor="author" className="block text-sm font-medium
text-gray-700 mb-1">  
Autor
</label>
<input
id="author"
name="author"
type="text"
value={formData.author}
onChange={handleChange}
placeholder="ex.Marcus Aurelius"
required
className={inputClass}
/>
</div>
{/*Camp  citat */}
<div>
    <label htmlFor="quote" className="block text-sm font-medium text-gray-700 mb-1">
        Citat
    </label>
    <textarea 
    id="quote"
    name="quote"
    value={formData.quote}
    onChange={handleChange}
    placeholder="Introduceti citatul..."
    rows={4}
    required
    className={`${inputClass} resize-none`}
    />
</div>
{/*Butoanele formular se schimba in functie de mod */}
<div className="flex gap-3 pt-2">
    <button 
    type="submit"
    className={`flex-1 py-2.5 text-sm font-semibold text-white rounded-lg
                   transition-colors duration-200
                   ${editingQuote 
                    ? "bg-amber-500 hover:bg-amber-600"
                :"bg-brand hover:bg-brand-dark"}`}
                >
                    {editingQuote ? " Salveaza modificarile":" Adauga citat"}
                </button>

</div>


{/* Butoane formular - se schimba in functie de mod*/}
<div className="flex gap-3 pt-2">
    <button
    type="submit"
    className={`flex-1 py-2.5 text-sm font-semibold text-white rounded-lg
                                                transition-colors duration-200
                                                ${editingQuote
                                                    ? "bg-amber-500 hover:bg-amber-600"
                                                    :"bg-brand hover:bg-brand-dark"}`}
>
    {editingQuote ? "Salveaza modificarile":"Adauga citat"}
</button>

{/* Butonul "Anuleaza" apare doar in modul de editare*/}
{editingQuote && (
<button
type="button"
onClick={resetForm}
className="flex-1 py-2.5 text-sm font-semibold text-bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
>
    Anuleaza
</button>
)}
</div>
</form>
</section>

{/* Lista de citate existente */}
<section>
<h2 className="text-lg font-semibold text-gray-700 mb-4">
Citate existente
<span className="ml-2 text-sm font-normal text-gray-400">
({quotes.length})
</span>
</h2>
{loading ? (
<p className="text-center text-brand animate-pulse py-10">
Se încarcă...
</p>
): quotes.length === 0 ? (
<p className="text-center text-gray-400 py-10">
Nu există citate. Adaugă primul folosind formularul de mai sus.
</p>
):(
// Acelaşi grid responsiv ca în Quotes Page
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
{quotes.map(q => (
<QuoteCard
key={q.id}
quote={q}
onEdit={handleEdit}
//furnizăm callbacks → butoanele apar
onDelete={handleDelete}
/>
))}
</div>
)}
</section>
</main>
</div>
);
}

