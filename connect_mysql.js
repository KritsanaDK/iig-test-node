var mysql = require("mysql2");
const util = require("util");
//Checking the crypto module
const crypto = require("crypto");
const algorithm = "aes-256-cbc"; //Using AES encryption
const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);
var hash = require("hash.js");

const host_ = "localhost";
const user_ = "root";
const pass_ = "password";
const db_ = "iig_db";

module.exports = {
  logIn,
  reg_user,
  check_pass,
  update_user,
};

var pool = mysql.createPool({
  connectionLimit: 10,
  host: host_,
  user: user_,
  password: pass_,
  database: db_,
  queryTimeout: 60000, // setting timeout
});

pool.query = util.promisify(pool.query);

function logIn(user, pass) {
  try {
    pass = encrypt(pass);

    let sql =
      "SELECT * FROM reg_user WHERE UserName='" +
      user +
      "' AND Password='" +
      pass +
      "';";
    console.log(sql);
    const result = pool.query(sql);
    console.log(result);
    if (result) {
      return result;
    }
  } catch {
    return { result: "error" };
  }
}

function reg_user(user, pass, f_name, l_name, file_name) {
  try {
    pass = encrypt(pass);

    let sql =
      "INSERT INTO reg_user (UserName, Password, FirstName, LastName, file_name) VALUES ('" +
      user +
      "', '" +
      pass +
      "', '" +
      f_name +
      "', '" +
      l_name +
      "', '" +
      file_name +
      "');";
    console.log(sql);
    pool.query(sql);
    //   console.log(result);

    sql =
      "INSERT INTO reg_his (UserName, Password) VALUES ('" +
      user +
      "', '" +
      pass +
      "');";
    pool.query(sql);

    return { result: "ok" };
  } catch {
    return { result: "error2" };
  }
}

function check_pass(user, pass) {
  try {
    pass = encrypt(pass);

    let sql =
      "select * from(SELECT * FROM reg_his where reg_his.UserName = '" +
      user +
      "' order by Date_Time asc) tb1 WHERE tb1.Password = '" +
      pass +
      "' limit 5;";

    console.log(sql);
    const result = pool.query(sql);
    //   console.log(result);
    if (result) {
      return result;
    }
  } catch {}
}

async function update_user(user, pass, f_name, l_name, file_name) {
  try {
    if (pass == "") {
      let temp_img = "";
      if (file_name != undefined) {
        temp_img = ", file_name = '" + file_name + "'";
      }

      let sql =
        "UPDATE reg_user SET FirstName = '" +
        f_name +
        "', LastName = '" +
        l_name +
        "' " +
        temp_img +
        " WHERE UserName = '" +
        user +
        "';";
      const result = await pool.query(sql);
      if (result) {
        return { result: "ok" };
      } else {
        return { result: "error" };
      }
    } else {
      let sql =
        "SELECT * FROM(SELECT * FROM reg_his WHERE UserName = '" +
        user +
        "' ORDER BY Date_Time DESC) tb1 WHERE tb1.Password = '" +
        pass +
        "' LIMIT 5;";
      const result = await pool.query(sql);

      console.log(result.length);

      if (result.length != 0) {
        return { result: "error" };
      } else {
        pass = encrypt(pass);

        let sql_a =
          "INSERT INTO reg_his (UserName, Password) VALUES ('" +
          user +
          "', '" +
          pass +
          "');";
        await pool.query(sql_a);

        let temp_img = "";
        if (file_name != undefined) {
          temp_img = ", file_name = '" + file_name + "'";
        }

        let sql_b =
          "UPDATE reg_user SET Password='" +
          pass +
          "',FirstName = '" +
          f_name +
          "', LastName = '" +
          l_name +
          "' " +
          temp_img +
          " WHERE UserName = '" +
          user +
          "';";
        await pool.query(sql_b);

        return { result: "ok" };
      }
    }
  } catch {
    return { result: "error" };
  }
}

//Encrypting text
function encrypt(text) {
  // let cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(key), iv);
  // let encrypted = cipher.update(text);
  // encrypted = Buffer.concat([encrypted, cipher.final()]);
  // return { iv: iv.toString("hex"), encryptedData: encrypted.toString("hex") };
  // return encrypted.toString("hex");

  var sha512 = require("hash.js/lib/hash/sha/512");

  return sha512().update(text).digest("hex");
}

// Decrypting text
function decrypt(text) {
  let iv = Buffer.from(text.iv, "hex");
  let encryptedText = Buffer.from(text.encryptedData, "hex");
  let decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(key), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}
