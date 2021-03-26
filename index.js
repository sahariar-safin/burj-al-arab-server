const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const admin = require('firebase-admin');
require('dotenv').config()

const app = express();
app.use(cors());
app.use(bodyParser.json());

const serviceAccount = require("./config/burj-al-arab-khalifa-firebase-adminsdk-imn7k-6e4342a7b6.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});


const uri = `mongodb+srv://${ process.env.DB_USER }:${ process.env.DB_PASS }@cluster0.vkms6.mongodb.net/burjalarab?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const collection = client.db("burjalarab").collection("booking");
    app.post('/booking', (req, res) => {
        collection.insertOne(req.body)
            .then(res => {
                console.log(res);
            })
    })
    app.get('/getBookings', (req, res) => {
        const token = (req.headers.authorization).split(" ")[1];
        admin.auth().verifyIdToken(token)
            .then((decodedToken) => {
                const email = decodedToken.email;
                if (email === req.query.email) {
                    collection.find({ email: req.query.email })
                        .toArray((err, bookings) => {
                            res.send(bookings);
                        })
                }
            })
            .catch((error) => {
                // Handle error
            });
    })
});


app.get('/', (req, res) => {
    res.send('working!!!!!!!!!!')
})



app.listen(5000);