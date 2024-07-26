require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const crypto = require("crypto");
const dns = require('dns');
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

const urlDatabase = {};

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});



// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});


app.post("/api/shorturl", (req, res) => {
  const longUrl = req.body.longUrl;

  // if url isn't provided or incorrect format request
  if (!longUrl) {
    return res
      .status(400)
      .json({ error: "No URL provided or incorrectly formatted request." });
  }

  // if url is provided

  console.log("Received URL:", longUrl);

  // Ensure the URL starts with http:// or https://
  if (!/^https?:\/\//i.test(longUrl)) {
    longUrl = "http://" + longUrl;
  }

  // Parse the URL to extract the hostname
  const urlObj = new URL(longUrl);
  const hostname = urlObj.hostname;

  // TO validate the url address

  dns.lookup(hostname, (err, address, family) => {
    if (err) {
      console.error("DNS lookup failed:", err);
      return res.status(400).json({ error: "Invalid Hostname" });
    } else {
      console.log(`IP address: ${address}`);
      console.log(`Address family: IPv${family}`);

      // Generate a unique short identifier
      const shortId = generateShortId();

      // Store the mapping
      urlDatabase[shortId] = longUrl;

      // Construct the short URL
      // const shortUrl = `${req.protocol}://${req.get("host")}/api/shorturl/${shortId}`;
      const shortUrl = shortId;

      res.json({ shortUrl: shortUrl, longUrl: longUrl });
    }
  });

});

// Endpoint to handle redirecting short URL to long URL
app.get("/api/shorturl/:shortId", (req, res) => {
  const shortId = req.params.shortId;
  const longUrl = urlDatabase[shortId];

  if (!longUrl) {
    return res
      .status(404)
      .json({ error: "No short URL found for the given input." });
  }

  res.redirect(longUrl);
});


// Function to generate a random short identifier
function generateShortId(length = 1) {
  // Use crypto to generate a random string
  return crypto.randomBytes(length).toString('base64').replace(/\+/g, '0').replace(/\//g, '0').substring(0, length);
}


app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
