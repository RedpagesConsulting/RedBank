const express = require("express"),
  app = express();

const MongoClient = require("mongodb").MongoClient;
const client = new MongoClient(
  "mongodb+srv://capture:HdYpsZZ0PtHnim6b@projects-o4uw3.mongodb.net/", { useUnifiedTopology: true },
  { useNewUrlParser: true } 
);

port = process.env.PORT || 3000;
app.use(express.json());
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});




app.get("/", (req, res) => {
  client.connect(err => {
    if (err) {
      res.send(err.message);
      return;
    }

    const collection = client.db("ATMs").collection("ATMLocations");
    collection
      .find()
      .toArray()
      .then(items => res.send("The connection is working!!!!!!!!!!!"))
      .catch(err => {
        res.send(err.message);
      });
    //client.close();
  });
});

//send customer's fault to database
app.post("/api/atmlocation", (req, res) => {
  client.connect((err) => {
    if (err) {
      res.send(err.message);
      return;
    }

    let alocation = req.body.location;
    let alanguage = req.body.language;
    let reply; 

    if (alanguage == 'Hausa'){
      reply = `Kuna iya samun ATMs din a adireshin masu zuwa. \n`; 
    } else if (alanguage == 'Igbo') {
      reply = `Can nwere ike ịhụ igwe ATM anyị n’adres na-esonụ \n`; 
    } else if (alanguage == 'Yoruba') {
      reply = `O le wa awọn ATMs wa ni adiresi atẹle. \n`; 
    } else {
      reply = `You can find our ATMs at the following address. \n`; 
    }
     
    let count = 1;
    
    const collection = client.db("ATMs").collection("ATMLocations");
    collection
    .find({ SurroundingSettlements: {$regex: `${alocation}`, $options:"i"} })
    .toArray(function (err, result) {
      if (result.length > 0) {
        result.forEach(function (element) {
          reply = reply.concat(`${count}. ${element.StreetAddress} \n`);
          count ++;
        });
        res.send(reply);
      } else {
        if (language == 'Hausa'){
          res.send(`Ba mu da ATM din ciki da wajen ${alocation} tukuna. Da kyau ku shiga 'atm' don gwada wani wurin.`); 
        } else if (language == 'Igbo') {
          res.send(`Anyị enweghị igwe ndọrọ ego ATM nọ na gburugburu ${alocation}. Jiri obi banye 'atm' iji nwaa ebe ozo.`);
        } else if (language == 'Yoruba') {
          res.send(`A ko ni ATM inu ati ni ayika ${alocation} sibẹsibẹ. Fi ọwọ tẹ 'atm' lati gbiyanju ipo miiran.`); 
        } else {
          res.send(`We do not have an ATM in and around ${alocation} yet. Kindly enter 'atm' to try another location`);
        }
      }
      if (err) throw err;
    });
  });
});



//start our server
app.listen(port, () => {
  console.log(`App listening on http://localhost:${port}`);
});
