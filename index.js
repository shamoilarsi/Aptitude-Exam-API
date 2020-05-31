const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const allowedOrigins = ["http://localhost", "https://aptitude-exam.web.app/"];

const PORT = process.env.PORT || 5000;
const app = express();

const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Origin not allowed by CORS"));
    }
  },
};

app.options("*", cors(corsOptions));

app.get("/", cors(corsOptions), (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.post("/api/saveResult", cors(corsOptions), (req, res) => {
  const id = req.query.id;
  const result = req.query.result;

  console.log(id, result);
  fs.readFile(
    path.join(__dirname, "json", "credentials.json"),
    "utf8",
    (err, data) => {
      if (!err) {
        data = JSON.parse(data);
        data[id]["result"] = result;

        fs.writeFile(
          path.join(__dirname, "json", "credentials.json"),
          JSON.stringify(data),
          (err) => {
            if (err) {
              res.json({ msg: "failed" });
            }
          }
        );
      }
    }
  );

  res.json({ msg: "success" });
});

app.post("/api/credentials", cors(corsOptions), (req, res) => {
  const id = req.query.id;
  const pass = req.query.pass;

  fs.readFile(
    path.join(__dirname, "json", "credentials.json"),
    "utf8",
    (err, data) => {
      if (!err) {
        data = JSON.parse(data)[id];
        const found = data && data["pass"] == pass;

        res.json({ status: found ? "success" : "failed" });
      } else res.status(400).send("");
    }
  );
});

app.post("/api/apti", cors(corsOptions), (req, res) => {
  if (req.query.limit <= 30) {
    fs.readFile(
      path.join(__dirname, "json", `${req.query.topic}.json`),
      "utf8",
      (err, data) => {
        if (!err) {
          let test = JSON.parse(data);
          let list = test["mcqs"];
          const shuffled = list
            .sort(() => 0.5 - Math.random())
            .slice(0, req.query.limit);

          res.json({ mcq: shuffled });
        }
      }
    );
  } else {
    res.status(400).end();
  }
});

app.listen(PORT, () => console.log(`Server running on ${PORT}`));
