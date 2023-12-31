const express = require('express')
const cors = require('cors')
const app = express()
require('dotenv').config()
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qlguchx.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const toysCollection = client.db('toysHobbies').collection('toys')

    app.get('/toys', async(req,res)=> {
      const result = await toysCollection.find().limit(20).toArray()
      res.send(result)
    })

    app.post('/toys', async(req,res) => {
      const query = req.body
      console.log(query)
      const result = await toysCollection.insertOne(query)
      res.send(result)
    })

    app.get('/toys/:text', async(req,res) => {
      const text = req.params.text;
      const query = {subcategory: text};
      const result = await toysCollection.find(query).toArray()
      res.send(result)
    })

    app.get('/toy/:id', async (req,res)=> {
      const id = req.params.id;
      console.log(id)
      const query = {_id: new ObjectId(id)}
      const result = await toysCollection.findOne(query)
      res.send(result)
    })
    app.put("/toy/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedToy = req.body;
      console.log(updatedToy);
      const option = { upsert: true };
      const updateDoc = {
        $set: {
          price: updatedToy.price,
          quantity: updatedToy.quantity,
          description: updatedToy.description,
        },
      };
      const result = await toysCollection.updateOne(filter, updateDoc, option);
      res.send(result);
    }); 


    app.delete("/toy/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toysCollection.deleteOne(query);
      res.send(result);
    });

    app.get("/my-toys", async (req, res) => {
      // console.log(req.query.email);
      let query = {};
      if (req.query.email) {
        query = { SellerEmail: req.query.email };
      }
      const result = await toysCollection.find(query).toArray();
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req,res) => {
    res.send('Hello from Toys and Hobbies Server')
})

app.listen(port, ()=> {
    console.log('running on port: ', port)
})