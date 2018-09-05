const express = require("express");
const fs = require("fs");
const app = express();
const bodyParser = require("body-parser");
const compression = require("compression");
const indexRouter = require("./routes/index");
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

app.use("/", indexRouter);

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
