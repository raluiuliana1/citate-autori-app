const express=require("express");
const cors=require("cors");
const Joi=require("joi");
const fs=require("fs");
const path=require("path");
const app=express();
const IMAGES_DIR = path.join(__dirname, "images");

if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

app.use(cors());
app.use(express.json());
//Deserveste imaginile static
app.use("/images", express.static(path.join(__dirname,"images")));

const JSON_SERVER_URL="http://localhost:3000/quotes";
//verificam daca id-ul din PUT si DELETE este un numar valid

const validateId=(req,res,next)=>{
  if(isNaN(req.params.id)){
    return res.status(400).json({error:"invalid ID format"});
  }
  next();
};

const quoteSchema=Joi.object({
  author:Joi.string().min(2).required(),
  quote:Joi.string().min(5).required(),
  imageUrl: Joi.string().allow("").optional()
});


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
/*app.get("/api/quotes", (req,res)=>{
    res.status(200).json(quotes);
});*/


//Extragem citatele
app.get("/api/quotes",async(req,res)=>{
  try{
    const response=await fetch(JSON_SERVER_URL);
    const data=await response.json();
const {search}=req.query;
if(search && search.trim()){
  const term = search.trim().toLowerCase();

  const filtered=data.filter(q =>
    q.author.toLowerCase().includes(term) ||
    q.quote.toLowerCase().includes(term)
  );
  return res.status(200).json(filtered);
}
    res.status(200).json(data);
  }catch (error){
    console.error("eroare la preluarea citatelor:",error.message);
    res.status(500).json({error:"nu s-au putut prelua citatele"});
  }
  });

//POST /api/quotes-se adauga un citat nou

/*app.post("/api/quotes", (req, res) => {
  const { author, quote } = req.body;
  const newQuote = {
    id: quotes.length + 1, //generam un id unic
    author,
    quote
  };
  quotes.push(newQuote);
  res.status(201).json(newQuote);
});*/

//adauga un nou citat
app.post("/api/quotes",async(req,res)=>{

  const{error}=quoteSchema.validate(req.body);
  if(error){
    return res.status(400).json({error:error.details[0].message});
  }
  try{
    const response=await fetch(JSON_SERVER_URL);
    const quotes=await response.json();
 
    //generam un id numeric(urmatorul numar disponibil)
    const newID=quotes.length >0 ? Math.max(...quotes.map(q=>Number(q.id)))+1:1;
    const newQuote={id:newID.toString(),...req.body};
    //convertim id-ul in sir pentru a se potrivi informatul db.json
    //trimite la json-server
    const postResponse=await fetch(JSON_SERVER_URL,{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify(newQuote),
    });
    const data=await postResponse.json();
    res.status(postResponse.status).json(data);
  }catch(error)
  {
    console.error("error adding quote:",error);
    res.status(500).json({error:"failed to add quote"});
  }
  });


  app.post("/api/quotes/fetch-image", async (req, res) => {
  const { author } = req.body;

  if (!author || !author.trim()) {
    return res.status(400).json({ error: "Numele autorului este obligatoriu." });
  }

  try {

    const wikiName = author.trim().replace(/\s+/g, "_");
    const wikiUrl =
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wikiName)}`;

    // Cerere către Wikipedia REST API
    // User-Agent este recomandat de Wikipedia pentru identificarea aplicației
    const wikiResponse = await fetch(wikiUrl, {
      headers: {
        "User-Agent": "PrintingQuotesApp/1.0"
      }
    });

    if (!wikiResponse.ok) {
      return res.status(404).json({
        error: `Autorul "${author}" nu a fost găsit pe Wikipedia.`
      });
    }

    const wikiData = await wikiResponse.json();

    // Verificăm dacă pagina Wikipedia are o imagine thumbnail
    if (!wikiData.thumbnail?.source) {
      return res.status(404).json({
        error: `Nu există imagine disponibilă pentru "${author}" pe Wikipedia.`
      });
    }

    const imageUrl = wikiData.thumbnail.source;

    const ext = imageUrl.split(".").pop().split("?")[0].toLowerCase();

   
    const fileName = `${author.trim().toLowerCase().replace(/\s+/g, "_")}.${ext}`;
    const filePath  = path.join(IMAGES_DIR, fileName);

    if (fs.existsSync(filePath)) {
      console.log(`Imagine existentă returnată: ${fileName}`);
      return res.status(200).json({ imageUrl: `/images/${fileName}` });
    }

const imgResponse = await fetch(imageUrl);
if(!imgResponse.ok) {
return res.status(500).json({ error: "nu s-a putut descarca imaginea."});
}

    // Convertim răspunsul într-un Buffer (date binare)
    const buffer = Buffer.from(await imgResponse.arrayBuffer());

    // Scriem fișierul pe disc în directorul /images
    fs.writeFileSync(filePath, buffer);
    console.log(`Imagine salvată: ${fileName}`);

    // Returnăm URL-ul local — Express servește /images/* ca static
    res.status(200).json({ imageUrl: `/images/${fileName}` });

  } catch (error) {
    console.error("Eroare la fetch-image:", error.message);
    res.status(500).json({ error: "Eroare internă la preluarea imaginii." });
  }
});





//PUT /api/quotes/:id actualizaeaza citatul cu id-ul specificat in url. ':id' este un parametru dinamic, accesibil prin req.params.id

/*app.put("/api/quotes/:id", (req, res) => {
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
});*/

//actualizam un citat

app.put("/api/quotes/:id",async(req,res)=>{
   const{error}=quoteSchema.validate(req.body);
  if(error){
    return res.status(400).json({error:error.details[0].message});
  }

  try{
    const quoteId=req.params.id;
    //construiti obiectul actualizat,asigurandu-va ca id este prima cheie
    const updatedQuote={id: quoteId,...req.body};
    const response=await fetch(`${JSON_SERVER_URL}/${quoteId}`,{
      method:"PUT",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify(updatedQuote),
    });
    if(!response.ok){
      return res.status(404).json({error:"quote not found"});
    }
    const data=await response.json();
    //creati un nou obiect cu id ca prima cheie
    const reorderedData={id:data.id,author:data.author,quote:data.quote, imageUrl:data.imageUrl||""};
    res.status(response.status).json(reorderedData);
  }catch(error){
    console.error("Error updating quote:",error);
    res.status(500).json({error:"failed to update quote"});
  }
});

//DELETE /api/quotes/:id stergem citatul specificat din array splice() elimina direct din memorie

/*app.delete("/api/quotes/:id", (req,res)=>{
    const id=parseInt(req.params.id);
    const index=quotes.findIndex(q=>q.id=== id);

    if(index=== -1){
        return res.status(404).json({ message: "citatul nu a fost gasit" });
    }
    quotes.splice(index,1);
  res.status(200).json({message: "citatul a fost sters cu succes"});
});*/

//stergem un citat
app.delete("/api/quotes/:id",validateId,async(req,res)=>{
  try{
    const quoteId=req.params.id;
    const response= await fetch(`${JSON_SERVER_URL}/${quoteId}`);

    if(!response.ok){
      return res.status(404).json({error:"quote not found"});
    }
    await fetch(`${JSON_SERVER_URL}/${quoteId}`,{method:"DELETE"});
    res.status(200).json({message:"quote deleted succesfully"});

  }catch(error){
next(error);
  }
});

//Pornim serverul pe portul 5000
const PORT=process.env.port || 5000;
app.listen(PORT,() =>{
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Serving static images from:${path.join(__dirname,"images")}`);
});
console.log("server restarted!");