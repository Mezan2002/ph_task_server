// requires start
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
const { query } = require("express");
const app = express();
const port = process.env.PORT || 5000;
// requires end

// middlewears start
app.use(cors());
app.use(express.json());
// middlewears end

// initial setup of express start

// jwt token start
const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).send({ message: "Unauthorized Access!" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
    if (err) {
      res.status(401).send({ message: "Unauthorized Access!" });
    }
    req.decoded = decoded;
  });
  next();
};
// jwt token end

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
    app.get("/billing-list", verifyJWT, async (req, res) => {
      const activePage = parseInt(req.query.activePage);
      const dataPerPage = parseInt(req.query.dataPerPage);
      const search = req.query.search;
      let query = {};
      if (search.length > 0) {
        query = {
          $or: [
            { fullName: { $regex: search } },
            { email: { $regex: search } },
            { phone: { $regex: search } },
          ],
        };
      }
      const options = {
        sort: { createdTime: -1 },
      };
      const count = await billings.estimatedDocumentCount();
      const result = await billings
        .find(query, options)
        .skip(activePage * dataPerPage)
        .limit(dataPerPage)
        .toArray();
      res.send({ result, count });
    });
    // get billing list API end

    // get all bill for calculation API start
    app.get("/billAmount", async (req, res) => {
      const query = {};
      const result = await billings.find(query).toArray();
      res.send(result);
    });
    // get all bill for calculation API end

    // update billing details API start
    app.patch("/update-billing/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const fullName = req.body.fullName;
      const email = req.body.email;
      const phone = req.body.phone;
      const payableAmount = req.body.payableAmount;
      const updatedDoc = {
        $set: {
          fullName: fullName,
          email: email,
          phone: phone,
          payableAmount: payableAmount,
        },
      };
      const result = await billings.updateOne(filter, updatedDoc);
      res.send(result);
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

    // create JWT API start
    app.post("/jwt", async (req, res) => {
      const user = req.query.email;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN);
      res.send({ token: token });
    });
    // create JWT API end
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
