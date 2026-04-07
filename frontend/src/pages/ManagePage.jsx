import { useEffect, useState } from "react";
import { Link} from "react-router-dom";
import QuoteCard from "../components/QuoteCard";
import { getAllQuotes, addQuote, updateQuote, deleteQuote,fetchAuthorImage,generateQuote} from "../api/quotesApi";
import {useFormValidation} from "../hooks/useFormValidation";


const VAlIDATION_RULES={
    author:{
        required:    true,
        requiredMsg:"Autorul este obligatoriu.",
        minLength:  2,
        minLengthMsg:"Autorul trebuire sa aiba cel putin doua caractere.",
        maxLength:  100,
        maxLengthMsg:"Autorul poate avea maxim 100 de caractere.",
    },
    quote:{
        required:    true,
        requiredMsg:"Citatul este obligatoriu.",
        minLength:  5,
        minLengthMsg:"CItatul trebuie sa aiba cel putin 5 caractere.",
        maxLength:  500,
        maxLengthMsg:"Autorul poate avea maxim 500 de caractere.",
    },
};

export default function ManagePage() {

const [quotes, setQuotes]        = useState([]);

const [editingQuote, setEditingQuote]= useState(null);


const [formData,setFormData]      =useState({author:"",quote:""});

const[feedback,setFeedback]       =useState({message:"",type:""});
const[loading,setLoading]         =useState(true);

const {errors,validate,clearErrors}= useFormValidation(VAlIDATION_RULES);
const [imageUrl, setImageUrl]         = useState("");
const [imageLoading, setImageLoading] = useState(false);
const [imageError, setImageError]     = useState("");
const[aiLoading,setAiLoading]=useState(false);
const[aiGenerated, setAiGenerated]=useState(false);



useEffect(()=>{
        fetchQuotes();
    }, []);

useEffect(() => {

  if (
    formData.author.trim().length < 3 ||
    editingQuote ||
    formData.quote.trim().length > 0
  ) return;


  const timer = setTimeout(async () => {
    setAiLoading(true);
    try {
      const result = await generateQuote(formData.author);

      setFormData(prev => ({ ...prev, quote: result.quote }));
      setAiGenerated(true); 
    } catch (err) {

      console.warn("Generare AI eșuată:", err.message);
    } finally {
      setAiLoading(false);
    }
  }, 3000); 

  
  return () => clearTimeout(timer);

}, [formData.author, editingQuote]);

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
if(e.target.name ==="quote"){
  setAiGenerated(false);
}
}

async function handleFetchImage() {
  if (!formData.author.trim()) {
    setImageError("Introduceți mai întâi numele autorului.");
    return;
  }

  setImageLoading(true);
  setImageError("");

  try {
    const result = await fetchAuthorImage(formData.author);
    setImageUrl(result.imageUrl);
  } catch (err) {
    setImageError(err.message);
    setImageUrl("");
  } finally {
    setImageLoading(false);
  }
}

function handleEdit(quote) {

setEditingQuote(quote);
setFormData({ author: quote.author, quote: quote.quote });
setImageUrl(quote.imageUrl || "");
setImageError("");
clearErrors();
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

function resetForm() {
setEditingQuote(null);
setFormData({ author: "", quote: ""});
setImageUrl("");
setImageError("");
setAiGenerated(false);
clearErrors();
}


async function handleSubmit(e) {
e.preventDefault();

if(!validate(formData)) return;


const payload={...formData,imageUrl};

try {
if (editingQuote) {

await updateQuote (editingQuote.id, payload);
showFeedback("Citatul a fost actualizat cu succes.", "success");
} else {
    await addQuote(payload);
    showFeedback("CItatul a fost adaugat cu succes.","succes");
}
resetForm();
fetchQuotes();
} catch (err) {

showFeedback(err.message, "error");
}
}



function showFeedback(message, type) {

setFeedback({ message, type });
setTimeout(() => setFeedback({ message: "", type: ""}), 3000);
}


const inputBase=`w-full px-4 py-2 border rounded-lg text-sm
focus:outline-none focus:ring-2 transition`;
const inputClass=(field)=>
    `${inputBase} ${errors[field]? "border-red-400 focus:ring-red-300 bg-red-50"
        :"border-gray-300 focus:ring-indigo-300 bg-white"
    }`;

return(
    <div className="min-h-screen bg-gray-50">

     {/* Header*/}
    <header className="sticky top-8 z-10 bg-white shadow-sm">
<div className="max-w-5xl mx-auto px-4 py-4 flex items-center
justify-between">
<h1 className="text-2x1 font-bold text-brand"> Administrare citate</h1>
{/* Link de întoarce a utilizatorului la pagina de afişare */}
<Link
to="/"
className="px-4 py-2 text-sm font-medium text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-600 hover: text-white transition-colors duration-200"
>
 ⬅️ Inapoi la citate
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

    {feedback.type==="success"? "✅": "⚠️"} {feedback.message}
    </div>
)}
    {/* Formular adaugare / editare */}
<section  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
    {/* Titlul si culoarea se schimba dinamic in functie de modul activ*/}
    <h2 className={`text-lg font-semibold mb-6 ${editingQuote ? "text-amber-600" : "text-brand"}`}>
        {editingQuote? "Editeaza citatul":" ➕ adauga citat nou"}
    </h2>
    {/* onSubmit pe <form> - capturat pe handleSubmit*/}
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
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
className={inputClass("author")}
/>
{errors.author && (
    <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
        <span>⚠️</span>{errors.author}
    </p>
)}
</div>

{/* — Secțiunea imagine autor — */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Imagine autor
  </label>

  <div className="flex gap-2">
    {/* Butonul caută imaginea pe Wikipedia prin Express */}
    <button
      type="button"      // ← nu trimite formularul
      onClick={handleFetchImage}
      disabled={imageLoading || !formData.author.trim()}
      className="flex-1 py-2 px-4 text-sm font-medium rounded-lg border
                 border-indigo-300 text-indigo-600 bg-indigo-50
                 hover:bg-indigo-100 disabled:opacity-50
                 disabled:cursor-not-allowed transition-colors"
    >
      {imageLoading ? "⏳ Se caută..." : "🔍 Caută imagine pe Wikipedia"}
    </button>

    {/* Dacă există imagine, afișăm buton de ștergere */}
    {imageUrl && (
      <button
        type="button"
        onClick={() => { setImageUrl(""); setImageError(""); }}
        className="px-3 py-2 text-sm text-red-500 border border-red-200
                   rounded-lg hover:bg-red-50 transition-colors"
      >
        ×
      </button>
    )}
  </div>

  {/* Mesaj de eroare dacă Wikipedia nu găsește autorul */}
  {imageError && (
    <p className="mt-1 text-xs text-red-500">⚠ {imageError}</p>
  )}

  {/* Previzualizare imagine — apare după ce s-a găsit cu succes */}
  {imageUrl && !imageError && (
    <div className="mt-3 flex items-center gap-3 p-3 bg-gray-50
                    rounded-lg border border-gray-100">
      <img
        src={`http://localhost:5000${imageUrl}`}
        alt={formData.author}
        className="w-16 h-16 rounded-full object-cover border-2 border-indigo-200"
        // Fallback dacă imaginea nu se încarcă
        onError={e => { e.target.style.display = "none"; }}
      />
      <div>
        <p className="text-xs font-medium text-gray-700">{formData.author}</p>
        <p className="text-xs text-gray-400 truncate max-w-xs">{imageUrl}</p>
      </div>
    </div>
  )}
</div>



{/* Câmp citat - populat automat de AI sau manual */}
<div>
  <div className="flex items-center justify-between mb-1">
    <label htmlFor="quote"
      className="block text-sm font-medium text-gray-700">
      Citat
    </label>

    {/* Indicator de stare AI - vizibil în timp ce OpenAI generează citat */}
    {aiLoading && (
      <span className="text-xs text-indigo-500 flex items-center gap-1 animate-pulse">
        <span>⚡</span> AI generează citat...
      </span>
    )}

    {/* Badge „Generat de AI” - apare după generare, dispare la editare manuală */}
    {aiGenerated && !aiLoading && (
      <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full border border-indigo-200">
        ✨ Generat de AI
      </span>
    )}
  </div>

  <textarea
    id="quote"
    name="quote"
    value={formData.quote}
    onChange={handleChange}
    placeholder={aiLoading
      ? "Se generează citatul..."
      : "Introduceți citatul sau așteptați generarea automată..."}
    rows={4}
    className={`${inputClass("quote")} resize-none transition-all 
      ${aiLoading ? "bg-indigo-50 border-indigo-200" : ""}`}
  />

  <div className="flex justify-between mt-1 items-start">
    <div className="flex flex-col gap-1">
      {errors.quote && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <span>⚠</span> {errors.quote}
        </p>
      )}
      
      {/* Notă adăugată – citatul AI poate fi editat sau înlocuit */}
      {aiGenerated && !aiLoading && (
        <p className="text-xs text-gray-400 italic">
          ⚠ Citat sugerat de AI – verificați autenticitatea înainte de salvare.
        </p>
      )}
    </div>
    
    <span className={`text-xs ml-auto flex-shrink-0 
      ${formData.quote.length > 450 ? "text-red-400" : "text-gray-400"}`}>
      {formData.quote.length}/500
    </span>
  </div>
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
{editingQuote && (
    <button type="button" onClick={resetForm}
    className="flex-1 py-2.5 text-sm font-semibold text-gray-600
                     bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                        ❌ Anuleaza
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

