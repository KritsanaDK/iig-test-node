const express = require("express");
const fileUpload = require("express-fileupload");
const cors = require("cors");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const _ = require("lodash");

const app = express();
const port = 6180;

// enable files upload
app.use(
  fileUpload({
    createParentPath: true,
  })
);

//add other middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(express.static(__dirname + "/uploads"));

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

app.all("*", function (req, res, next) {
  /**
   * Response settings
   * @type {Object}
   */
  var responseSettings = {
    AccessControlAllowOrigin: req.headers.origin,
    AccessControlAllowHeaders:
      "Content-Type,X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5,  Date, X-Api-Version, X-File-Name",
    AccessControlAllowMethods: "POST, GET, PUT, DELETE, OPTIONS",
    AccessControlAllowCredentials: true,
  };

  /**
   * Headers
   */
  res.header(
    "Access-Control-Allow-Credentials",
    responseSettings.AccessControlAllowCredentials
  );
  res.header(
    "Access-Control-Allow-Origin",
    responseSettings.AccessControlAllowOrigin
  );
  res.header(
    "Access-Control-Allow-Headers",
    req.headers["access-control-request-headers"]
      ? req.headers["access-control-request-headers"]
      : "x-requested-with"
  );
  res.header(
    "Access-Control-Allow-Methods",
    req.headers["access-control-request-method"]
      ? req.headers["access-control-request-method"]
      : responseSettings.AccessControlAllowMethods
  );

  if ("OPTIONS" == req.method) {
    res.send(200);
  } else {
    next();
  }
});

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

app.get("/ksn", async (req, res) => {
  console.log("ksn");
  res.end();
});

const mysql = require("./connect_mysql");

app.post("/logIn", async (req, res) => {
  console.log("logIn");
  try {
    let user = req.body.user;
    let pass = req.body.pass;

    let data = await mysql.logIn(user, pass);
    console.log(data);
    await res.json(data);
    res.end();
  } catch (error) {
    console.log(error);
    res.end();
  }
});

app.post("/reg_user", async (req, res) => {
  console.log("reg_user");
  console.log(req);
  try {
    let user = req.body.user;
    let pass = req.body.pass;
    let f_name = req.body.f_name;
    let l_name = req.body.l_name;
    let file_name = req.body.file_name;

    let data = await mysql.reg_user(user, pass, f_name, l_name, file_name);

    if (req.files) {
      let avatar = req.files.file;
      avatar.mv("./uploads/" + avatar.name);
    }

    // console.log(data);
    await res.json(data);
    res.end();
  } catch (error) {
    // console.log(error);
    res.end();
  }
});

app.post("/update_user", async (req, res) => {
  console.log("update_user");
  console.log(req.body);
  try {
    let user = req.body.user;
    let pass = req.body.pass;
    let f_name = req.body.f_name;
    let l_name = req.body.l_name;
    let file_name = req.body.file_name;

    let data = await mysql.update_user(user, pass, f_name, l_name, file_name);

    if (req.files) {
      let avatar = req.files.file;
      avatar.mv("./uploads/" + avatar.name);
    }

    console.log(data);
    await res.json(data);
    res.end();
  } catch (error) {
    console.log(error);
    res.end();
  }
});
