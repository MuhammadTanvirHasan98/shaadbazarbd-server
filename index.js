const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// cors options
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
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
    const userCollection = db.collection("users");

    app.get("/admin/:email", async (req, res) => {
      const email = req.params.email;
      console.log(email);

      // Authorization check can be added here
      // if(email !== req.decoded.email){
      //    return res.status(403).send({message: 'unauthorized access'})
      // }

      const query = { email: email };
      const user = await userCollection.findOne(query);
      let admin = false;
      if (user) {
        admin = user.role === "admin";
      }
      res.send({ admin });
    });

    // get all cards data of gallery from database
    app.get("/allProducts", async (req, res) => {
      const search = req.query.search;
      const category = req.query.category;
      console.log("search:", search);
      console.log("category:", category);
      let query = {};
      if (search) {
        query.product_name = { $regex: search, $options: "i" };
      }

      if (category) {
        query.category = { $regex: category, $options: "i" };
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

    // get single product item data from database
    app.get("/product/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await allProducts.findOne(query);
      res.send(result);
    });

    // add product from admin and store it in the database
    app.post("/addProduct", async (req, res) => {
      const productData = req.body;
      console.log(productData);
      const result = await allProducts.insertOne(productData);
      res.send(result);
    });

    // Update a product of database
    app.patch("/updateProduct/:id", async (req, res) => {
      const updateProduct = req.body;
      const id = req.params.id;
      console.log("Update product for this id:", id);
      console.log(updateProduct);
      const query = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          ...updateProduct,
        },
      };
      const result = await allProducts.updateOne(query, updatedDoc);
      res.send(result);
    });

    // Delete specific product data from database
    app.delete("/removeProduct/:id", async (req, res) => {
      const id = req.params.id;
      console.log("Product delete id:", id);
      const query = { _id: new ObjectId(id) };
      const result = await allProducts.deleteOne(query);
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
