import {useEffect,useState} from "react";
import {Link} from "react-router-dom";
import {getAllQuotes} from "../api/quotesApi";
export default function QuotesPage (){
    const [quotes,setQuotes]=useState([]);
    const[loading,setLoading]=useState(true);
    const[error,setError]=useState(null);

    useEffect(()=>{
        getAllQuotes()
        .then(data=>setQuotes(data))
        .catch(err =>setError(err.message))
        .finally(()=>setLoading(false));
    },[]);
    if(loading){
        return(
            <div className="mih-h-screen flex items-center justify-center bg-brand-light">
                <p className="text-band text-lg font-medium animate-pulse">
                </p>
            </div>
        );
    }

    if(error){
        return(
            <div className="mih-h-screen flex items-center justify-center bg-brand-light">
                <p className="text-red-500 text-lg font-medium"> {error}</p>
            </div>
        );
    }
    return(
        <div className="mih-h-screen bg-band-light">
            {/*-Header-*/}
            {/*sticky top-0 z-10 =ramane vizibil la scroll */}
            <header className="sticky top-0 z-10 bg-white shadow-sm">
            <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">  
                <div>
                    <h1 className="text-2xl font-bold text-brand">Citate Autori Celebri</h1>
                    <p className="text-sm text-gray-500">
                        {quotes.length} {quotes.length===1 ? "citat":"citate"}
                    </p>
                    </div>    
                    {/*Link catre ruta /manage - fara reload */}   
                    <Link
                    to="manage"
                    className="px-4 py-2 bg-band text-white text-sm font-medium rounded-lg hover:bg-brand-dark transition-colors duration-200"
                    >

                    </Link>
        </div>
</header>
{/* -Grid de citate -*/}
<main className="max-w-6xl mx-auto px-4 py-8">
{quotes.length === 0 ? (
<div className="text-center py-20">
<p className="text-gray-400 text-xl mb-4">Nu există citate încă.</p>
<Link to="/manage" className="text-brand underline hover: text-brand-dark">
Adaugă primul citat →
</Link>
</div>
):(
// Grid responsiv:
// mobile (implicit): 1 coloană
// sm (≥640px):2 coloane
// lg (≥1024px):3 coloane
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
gap-6">
{quotes.map(q => (
// key={q.id) este obligatoriu în liste React
// permite React să identifice eficient ce elemente s-au schimbat


<QuoteCard key={q.id} quote={q} />
// fără onEdit/onDelete butoanele nu apar în QuotesPage
))}
</div>
)}
</main>
</div>
    );
}