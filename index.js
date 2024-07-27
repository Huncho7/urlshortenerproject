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
  const originalUrl = req.body.url;
  const urlObject = new URL(originalUrl);

  dns.lookup(urlObject.hostname, (err, address, family) => {
    if (err) {
      res.json({
        originalUrl: originalUrl,
        shortenedUrl: "Invalid URL",
      });
    } else {
      var shortenedUrl = Math.floor(Math.random() * 100000).toString();

      urlDatabase[shortenedUrl] = originalUrl;

      res.json({
        originalURL: originalUrl,
        shortenedURL: shortenedUrl,
      });
    }
  });
});

// Endpoint to handle redirecting short URL to long URL
app.get("/api/shorturl/:shortenedUrl", (req, res) => {
  const shortenedUrl = req.params.shortenedUrl;
  const originalUrl = urlDatabase[shortenedUrl];

  if (!originalUrl) {
    return res
      .status(404)
      .json({ error: "No short URL found for the given input." });
  }
  res.redirect(originalUrl);
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
