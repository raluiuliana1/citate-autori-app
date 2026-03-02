const express=require("express");
const cors=require("cors");
const fs=require("fs");
const path=require("path");
const app=express();
app.use(cors());
app.use(express.json());
//Deserveste imaginile static
app.use("/images", express.static(path.join(__dirname,"images")));

//Ruta de test
app.get("/", (req,res) =>{
    res.json({
        message:"Printing Quotes API is running...",
        endpoints:{
            quotes: "/api/quotes",
            health:"/api/health"

        }
    });
});

//DATE INITIALE(stocare in memorie).

let quotes=[
    {id: 1,author:"Socrates", quote:"The only true wisdom is in knowing you know nothing"},
    {id: 2, author:"Albert Einstein", quote:"life is like riding a bicycle.To keep your balance you must keep moving"}
];
//GET /api/quotes - returneaza lista completa a citatelor


app.get("/api/quotes", (req,res)=>{
    res.status(200).json(quotes);
});

//POST /api/quotes-se adauga un citat nou

app.post("/api/quotes", (req, res) => {
  const { author, quote } = req.body;
  const newQuote = {
    id: quotes.length + 1, //generam un id unic
    author,
    quote
  };
  quotes.push(newQuote);
  res.status(201).json(newQuote);
});

//PUT /api/quotes/:id actualizaeaza citatul cu id-ul specificat in url. ':id' este un parametru dinamic, accesibil prin req.params.id

app.put("/api/quotes/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const { author, quote } = req.body;

  const index = quotes.findIndex(q => q.id === id);

  if (index === -1) {
    //404 not found-citatul cu ide-ul respectiv nu exista
    return res.status(404).json({ message: "citatul nu a fost gasit" });
  }
  //actualizam intrarea pastrand id-ul neschimbat
  quotes[index] = { id, author, quote };
  res.status(200).json(quotes[index]);
});
//DELETE /api/quotes/:id stergem citatul specificat din array splice() elimina direct din memorie

app.delete("/api/quotes/:id", (req,res)=>{
    const id=parseInt(req.params.id);
    const index=quotes.findIndex(q=>q.id=== id);

    if(index=== -1){
        return res.status(404).json({ message: "citatul nu a fost gasit" });
    }
    quotes.splice(index,1);
    res.status(200).json({message:"citatul a fost sters cu succes"});
});

//Pornim serverul pe portul 5000
const PORT=process.env.port || 5000;
app.listen(PORT,() =>{
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Serving static images from:${path.join(__dirname,"images")}`);
});