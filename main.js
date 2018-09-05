const express = require("express");
const fs = require("fs");
const app = express();
const template = require("./lib/template.js");
const path = require("path");
const qs = require("querystring");
const bodyParser = require("body-parser");
const compression = require("compression");
const sanitizeHtml = require("sanitize-html");
const topicRouter = require("./routes/topic");

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(compression());

app.get("*", (req, res, next) => {
  fs.readdir("./data", function(error, filelist) {
    req.list = filelist;
    next();
  });
});

// Default Page
app.get("/", function(req, res) {
  const title = "Welcome";
  const description = "Hello, Node.js";
  const list = template.list(req.list);
  const html = template.HTML(
    title,
    list,
    `<h2>${title}</h2>${description}
    <img src="http://localhost:3000/images/hello.jpg" style="width:200px; display:block; margin-top:10px">
    `,
    `<a href="/topic/create">create</a>`
  );
  res.send(html);
});

app.use("/topic", topicRouter);

// 404 Error
app.use(function(req, res, next) {
  res.status(404).send("Sorry cant find that!");
});

// Writing Error Handlers
app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

app.listen(3000, () => console.log("Example app listening on port 3000!"));
