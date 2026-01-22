import express from "express";
import cors from "cors";
import listEndpoints from "express-list-endpoints";

import flowerJson from "./data/flowers.json" with { type: "json" };

let flowerData = flowerJson //Jsonfilen finns i minnet på databasen. 

const port = process.env.PORT || 8080; //definierar vilken port vi använder
const app = express(); //startar express

// Add middlewares to enable cors and json body parsing
app.use(cors());
app.use(express.json());

// TODO: add documentation of the API here with express-list-endpoints
app.get("/", (req, res) => {
  const endpoints = listEndpoints(app)

  res.json({
    message: "welcome to the Flower API",
    endpoints: endpoints,
  })
});

// TODO: add endpoint for getting all flowers
// TODO: add query params to be able to filter on color or symbol

app.get("/flowers", (req, res) => {
  const { color, symbol } = req.query

  let filteredFlowers = flowerData

  // https://localhost:8080/flowers?color=red&symbol=passion

  if (color) { //Normalisera datan, eftersom array har stor bokstav i början av orden. 
    filteredFlowers = filteredFlowers.filter((flower) => {
      return flower.color.toLowerCase() === color.toLowerCase();
    });
  }

  if (symbol) {
    filteredFlowers = filteredFlowers.filter((flower) => {
      return flower.symbolism.some((word) => {
        return word.toLowerCase() === symbol.toLowerCase()
      })
    })

  }

  res.json(flowerData);
})

// TODO: add endpoint for getting one flower

app.get("/flowers/:id", (req, res) => {
  const id = req.params.id
  const flower = flowerData.find((flower) => Number(flower.id) === Number(id)); //säkra att det är ett nummer under id. 

  if (!flower) {
    return res.status(404).json({ error: `flower with id ${id} does not exist` })
  }
  res.json(flower);
})

//create a new flower. body kommer från postman, det är där vi skapar den nya flowern. Json
app.post("/flowers", (req, res) => {
  const body = req.body;

  // 1. Validation on the body that we will add to de DB. 
  // 2. if the validation does not go through, then respond with an error. 
  // 3. create a unique ID, not just take the length of the db entries.

  const newFlower = {
    id: flowerData.length + 1,
    name: body.name,
    scientificName: body.scientificName,
    botanicalFamily: body.botanicalFamily,
    color: body.color,
    isSpotted: body.isSpotted,
    scent: body.scent,
    size: body.size,
    symbolism: body.symbolism,
    lastSpottedTimestamp: body.lastSpottedTimestamp,
  };

  flowerData.push(newFlower)

  res.json(newFlower)
})

//Delete a flower. Görs också i Postman. Klicka delete till höger, och

app.delete("/flowers/:id", (req, res) => {
  const id = req.params.id
  const flower = flowerData.find((flower) => Number(flower.id) === Number(id)); //säkra att det är ett nummer under id, då det annars blir en string? 


  // om det inte finns någon flower, visa error meddelande. 
  if (!flower) {
    return res
      .status(404)
      .json({ error: `flower with id ${id} does not exist` });
  }

  const newFlowers = flowerData.filter(
    (flower) => Number(flower.id) !== Number(id)
  );

  flowerData = newFlowers;

  res.json(flower);
});


// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
