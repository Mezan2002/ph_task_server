// requires start
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
const app = express();
const port = process.env.PORT || 5000;
// requires end

// middlewears start
app.use(cors());
app.use(express.json());
// middlewears end

// initial setup of express start

// connect the mongodb start

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.2ahck7i.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

// connect the mongodb end

// collections start

const registeredUser = client.db("phTaskDB").collection("registeredUser");
const billings = client.db("phTaskDB").collection("billings");

// collections end

// run function of CRUD start
const run = async () => {
  try {
    // register user API start
    app.post("/registration", async (req, res) => {
      const userData = req.body;
      const newUser = await registeredUser.insertOne(userData);
      res.send(newUser);
    });
    // register user API end

    // Login User API Start
    app.get("/login", async (req, res) => {
      const email = req.query.email;
      const password = req.query.password;
      const query = { email: email, password: password };
      const result = await registeredUser.findOne(query);
      res.send(result);
    });
    // Login User API End

    // add billing API start
    app.post("/add-billing", async (req, res) => {
      const billingsData = req.body;
      const addBilling = await billings.insertOne(billingsData);
      res.send(addBilling);
    });
    // add billing API end

    // get billing list API start
    app.get("/billing-list", async (req, res) => {
      const query = {};
      const result = await billings.find(query).toArray();
      res.send(result);
    });
    // get billing list API end

    // update billing details API start
    app.patch("/update-billing/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
    });
    // update billing details API end

    // delete billing details API start
    app.delete("/delete-billing/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await billings.deleteOne(query);
      res.send(result);
    });
    // delete billing details API end
  } finally {
  }
};
run().catch((err) => console.log(err));
// run function of CRUD end

app.get("/", (req, res) => {
  res.send("ph task server is running!");
});
app.listen(port, () => {
  console.log(`ph task server is running on port ${port}`);
});
// initial setup of express end
