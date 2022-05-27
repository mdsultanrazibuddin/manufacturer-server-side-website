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

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: 'UnAuthorized access' });
  }
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (error, decoded) {
    if (error) {
      return res.status(403).send({ message: 'Forbidden access' })
    }
    req.decoded = decoded;
    next();
  });
}

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
        app.delete('/part/:id', async (req, res) =>{
              const id = req.params.id;
              const query = {_id: ObjectId(id)};
              const result = await partCollection.deleteOne(query);
             
              res.send(result);
              
        app.post('/purchase', async (req, res) => {
              const booking = req.body;
                const result = await userPurchase.insertOne(booking);
                res.send(result);
            });

        app.post('/part', async(req, res) =>{
                const newProduct = req.body;
                const result = await partCollection.insertOne(newProduct);
                res.send(result)
            })
      
          })
        app.get('/user', verifyJWT, async(req, res) =>{
            
          const users = await userCollection.find().toArray();
           
            res.send(users)})

            app.put('/user/admin/:email', verifyJWT, async (req, res) => {
              const email = req.params.email;
              const requester = req.decoded.email;
              const requesterAccount = await userCollection.findOne({ email: requester });
              if (requesterAccount.role === 'admin') {
                const filter = { email: email };
                const updateDoc = {
                  $set: { role: 'admin' },
                };
                const result = await userCollection.updateOne(filter, updateDoc);
                res.send(result);
              }
              else{
                res.status(403).send({message: 'forbidden'});
              }
        
            })
       
        
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
        

        app.get('/booking', verifyJWT, async(req, res) =>{
            const client = req.query.client;
            
            const authorization = req.headers.authorization;
            console.log(authorization);
            const query = {client: client};
            const bookings = await bookingCollection.find(query).toArray();
            res.send(bookings)})


        


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