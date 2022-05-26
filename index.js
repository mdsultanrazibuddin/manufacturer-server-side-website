const express = require('express')
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express()
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.51yt7.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
        await client.connect();
        const partCollection = client.db('manufacturer_website').collection('parts');
        const bookingCollection = client.db('manufacturer_website').collection('bookings');
        const userCollection = client.db('manufacturer_website').collection('users');

        app.get('/part', async(req, res) =>{
            const query ={}
            const cursor = partCollection.find(query)
            const parts = await cursor.toArray();
            res.send(parts)})
       
        
            app.put('/user/:email', async (req, res) => {
              const email = req.params.email;
              const user = req.body;
              const filter = { email: email };
              const options = { upsert: true };
              const updateDoc = {
                $set: user,
              };
              const result = await userCollection.updateOne(filter, updateDoc, options);
              const token = jwt.sign({email: email}, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h'})
             
              res.send({ result , token});
            })
        

        app.get('/booking', async(req, res) =>{
            const client = req.query.client;
            const query = {client: client};
            const bookings = await bookingCollection.find(query).toArray();
            res.send(bookings)})
            
           
            // app.get('/available', async (req, res) => {
            //   const date = req.query.date;
        
            //   // step 1:  get all services
            //   const services = await serviceCollection.find().toArray();
        
            //   // step 2: get the booking of that day. output: [{}, {}, {}, {}, {}, {}]
            //   const query = { date: date };
            //   const bookings = await bookingCollection.find(query).toArray();
        
              
             
        
        
            //   res.send(services);
            // })   


        app.post('/booking', async(req, res) =>{
            const booking =req.body;
            const query = {product: booking.product, client: booking.client}
            const exists = await bookingCollection.findOne(query)
            if(exists){
              return res.send ({success: false, booking: exists})
            }
            const result = await bookingCollection.insertOne(booking)
           
            res.send({success: true,result})});
          //   app.get('/part/:id', async (req, res) =>{
          //     const id = req.params.id;
          //     const query = {_id: ObjectId(id)};
          //     const product = await productCollection.findOne(query);
             
          //     res.send(product);
          // })    
    }
    finally{

    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})