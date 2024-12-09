const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 3000;

// cors options
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:4173",
    // "https://muhammads-cuisine.web.app",
    // "https://muhammads-cuisine.firebaseapp.com",
    // "https://shaadbazarbd.netlify.app",
  ],
  credentials: true,
  optionSuccessStatus: 200,
};

// middleware
app.use(cors(corsOptions));
app.use(express.json());

const uri =
  "mongodb+srv://shaadbazarBD:shaad_bazar_BD@muhammadcluster.h7migjc.mongodb.net/?retryWrites=true&w=majority&appName=MuhammadCluster";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection

    const db = client.db("shaadbazarbdDB");

    const allProducts = db.collection("allProducts");

    // get all cards data of gallery from database
    app.get("/allProducts", async (req, res) => {
      const search = req.query.search;
      // console.log(search);
      let query = {};
      if (search) {
        query = {
          food_name: { $regex: search, $options: "i" },
        };
      }
      // sorting to find top selling foods
      const sort = req.query.sort;
      //  console.log(sort);
      let options = {};
      if (sort) {
        options = {
          sort: { purchase_count: -1 },
        };
      }
      const result = await allProducts.find(query, options).toArray();
      res.send(result);
    });

    // get single food item data from database
    app.get("/product/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await allProducts.findOne(query);
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
