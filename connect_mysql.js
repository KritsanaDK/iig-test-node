/*
  @Author   : Kritsana  Wathaniyanon
  @Date     : 2023-08-17
 */
var mysql = require("mysql2");
const util = require("util");
const crypto = require("crypto");
const algorithm = "aes-256-cbc";
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

/*
  @Purpose : Check Login
  @Input   : user as string
           : pass as string
  @Output  : array object 
                Exam >> [{UserName: 'UserName' , Password :'Password', FirstName:'FirstName', LastName:'LastName', file_name:'file_name'}]
 */

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

/*
  @Purpose  : Register User
  @Input    : user as string
            : pass as string
            : f_name as string
            : l_name as string
            : file_name as string
  @Output   : array 
                Exam >> {result: 'ok'}
                Exam >> {result: 'error'}
 */

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
    return { result: "error" };
  }
}

/*
  @Purpose : Update User  & Check password duplicate from 5 time ago
  @Input   : user as string
           : pass as string
           : f_name as string
           : l_name as string
           : file_name as string
  @Output  : array 
                Exam >> {result: 'ok'}
                Exam >> {result: 'error'}
 */

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
      pass = encrypt(pass);
      let sql =
        "SELECT * FROM(SELECT * FROM reg_his WHERE UserName = '" +
        user +
        "' ORDER BY Date_Time DESC  LIMIT 5) tb1 WHERE tb1.Password = '" +
        pass +
        "';";

      console.log(sql)
      const result = await pool.query(sql);

      console.log(result.length);

      if (result.length != 0) {
        return { result: "error" };
      } else {
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

function encrypt(text) {
  var sha512 = require("hash.js/lib/hash/sha/512");
  return sha512().update(text).digest("hex");
}
