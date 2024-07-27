require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const crypto = require("crypto");
const dns = require("dns");
const URL = require("url").URL;
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Basic Configuration
const port = process.env.PORT || 3000;
app.use(cors());
app.use("/public", express.static(`${process.cwd()}/public`));
app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Database
const urlDatabase = {};

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

app.post("/api/shorturl/", (req, res) => {
  const original_url = req.body.url;
  const urlObject = new URL(original_url);

  dns.lookup(urlObject.hostname, (err, address, family) => {
    if (err) {
      res.json({
        error: "Invalid URL",
      });
    } else {
      var short_url = Math.floor(Math.random() * 100000).toString();

      urlDatabase[short_url] = original_url;

      res.json({
        original_url: original_url,
        short_url: short_url,
      });
    }
  });
});

// Endpoint to handle redirecting short URL to long URL
app.get("/api/shorturl/:short_url", (req, res) => {
  const short_url = req.params.short_url;
  const original_url = urlDatabase[short_url];

  if (!original_url) {
    return res
      .status(404)
      .json({ error: "No short URL found for the given input." });
  }
  res.redirect(original_url);
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
