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
    "https://shaadbazar.netlify.app",
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

const uri = `mongodb+srv://${process.env.SHAAD_DB_USER}:${process.env.SHAAD_DB_PASS}@muhammadcluster.h7migjc.mongodb.net/?retryWrites=true&w=majority&appName=MuhammadCluster`;

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
    await client.connect();

    const db = client.db("shaadbazarbdDB");

    const allProductsCollection = db.collection("allProducts");
    const wishlistProductsCollection = db.collection("wishlistProducts");
    const orderCollection = db.collection("orders");
    const userCollection = db.collection("users");

    app.get("/admin/:email", async (req, res) => {
      const email = req.params.email;
      console.log(email);

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
      const result = await allProductsCollection.find(query, options).toArray();
      res.send(result);
    });

    // get single product item data from database
    app.get("/product/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await allProductsCollection.findOne(query);
      res.send(result);
    });

    // get all orders item data from database
    app.get("/orders", async (req, res) => {
      const result = await orderCollection.find().toArray();
      res.send(result);
    });

    // get wishlist products for each user from database
    app.get("/wishProducts/:email", async (req, res) => {
      const user_email = req.params.email;
      const query = { user_email };
      console.log(query);
      const result = await wishlistProductsCollection.find(query).toArray();
      res.send(result);
    });

    // get order items by specific email from database
    app.get("/orders/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      console.log(query);
      const result = await orderCollection.find(query).toArray();
      res.send(result);
    });

    // add product from admin and store it in the database
    app.post("/addProduct", async (req, res) => {
      const productData = req.body;
      console.log(productData);
      const result = await allProductsCollection.insertOne(productData);
      res.send(result);
    });

    // add product to the wishlist from user to the database
    app.post("/addWishProduct", async (req, res) => {
      const wishProduct = req.body;
      console.log(wishProduct);
      const result = await wishlistProductsCollection.insertOne(wishProduct);
      res.send(result);
    });

    // add order by placing order from the users and save to the database
    app.post("/placeOrder", async (req, res) => {
      const orderDetails = req.body;
      console.log(orderDetails);
      const result = await orderCollection.insertOne(orderDetails);
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
      const result = await allProductsCollection.updateOne(query, updatedDoc);
      res.send(result);
    });

    // Delete specific wish data from database
    app.delete("/wish/:id", async (req, res) => {
      const id = req.params.id;
      console.log("Product delete id:", id);
      const query = { _id: new ObjectId(id) };
      const result = await wishlistProductsCollection.deleteOne(query);
      console.log(result);
      res.send(result);
    });

    // Delete specific product data from database
    app.delete("/removeProduct/:id", async (req, res) => {
      const id = req.params.id;
      console.log("Product delete id:", id);
      const query = { _id: new ObjectId(id) };
      const result = await allProductsCollection.deleteOne(query);
      res.send(result);
    });

    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Shaadbazar BD server is running here!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
