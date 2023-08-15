const express = require("express");
const app = express();
const port = 6180;

app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true }));

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
    let path_file = req.body.path_file;

    let data = await mysql.reg_user(user, pass, f_name, l_name, path_file);
    console.log(data);
    await res.json(data);
    res.end();
  } catch (error) {
    console.log(error);
    res.end();
  }
});

app.post("/check_pass", async (req, res) => {
  console.log("check_pass");
  console.log(req);
  try {
    let user = req.body.user;
    let pass = req.body.pass;

    let data = await mysql.check_pass(user, pass);
    console.log(data);
    await res.json(data);
    res.end();
  } catch (error) {
    console.log(error);
    res.end();
  }
});
