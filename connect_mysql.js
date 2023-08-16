var mysql = require("mysql2");
const util = require("util");
const bcrypt = require("bcrypt")

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

    pass = HastEncode(pass, 10);

    let sql =
      "SELECT * FROM reg_user WHERE UserName='" +
      user +
      "' AND Password='" +
      pass +
      "';";
    console.log(sql)
    const result = pool.query(sql);
    console.log(result);
    if (result) {
      return result;
    }
  } catch { }
}

async function reg_user(user, pass, f_name, l_name, path_file) {
  try {

    pass = HastEncode(pass, 10);

    let sql =
      "INSERT INTO reg_user (UserName, Password, FirstName, LastName, Path_file) VALUES ('" +
      user +
      "', '" +
      pass +
      "', '" +
      f_name +
      "', '" +
      l_name +
      "', '" +
      path_file +
      "');";

    await pool.query(sql);
    //   console.log(result);

    sql =
      "INSERT INTO reg_his (UserName, Password) VALUES ('" +
      user +
      "', '" +
      pass +
      "');";
    await pool.query(sql);


    return { "result": "ok" };

  } catch {
    return { "result": "error2" };
  }
}

function check_pass(user, pass) {

  try {

    pass = HastEncode(pass, 10);

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
  } catch { }
}



async function update_user(user, pass, f_name, l_name, path_file) {
  try {

    pass = HastEncode(pass, 10);

    if (pass == "") {
      let temp_img = "";
      if (path_file != undefined) {
        temp_img = ", Path_file = '" + path_file + "'";

      }

      let sql = "UPDATE reg_user SET FirstName = '" + f_name + "', LastName = '" + l_name + "' " + temp_img + " WHERE UserName = '" + user + "';"
      const result = await pool.query(sql);
      if (result) {
        return { "result": "ok" };
      }
      else {
        return { "result": "error" };
      }

    }
    else {
      let sql = "SELECT * FROM(SELECT * FROM reg_his WHERE UserName = '" + user + "' ORDER BY Date_Time DESC) tb1 WHERE tb1.Password = '" + pass + "' LIMIT 3;";
      const result = await pool.query(sql);

      console.log(result.length)

      if (result.length != 0) {
        return { "result": "error" };
      }
      else {
        let sql_a = "INSERT INTO reg_his (UserName, Password) VALUES ('" + user + "', '" + pass + "');";
        await pool.query(sql_a);

        let temp_img = "";
        if (path_file != undefined) {
          temp_img = ", Path_file = '" + path_file + "'";

        }

        let sql_b = "UPDATE reg_user SET Password='" + pass + "',FirstName = '" + f_name + "', LastName = '" + l_name + "' " + temp_img + " WHERE UserName = '" + user + "';"
        await pool.query(sql_b);

        return { "result": "ok" };
      }
    }

  } catch {
    return { "result": "error" };
  }
}

function HastEncode(password, saltRounds) {

  bcrypt
    .hash(password, saltRounds)
    .then(hash => {
      console.log('Hash ', hash)
      return hash;
    })
    .catch(err => {
      console.error(err.message)
      return err.message;
    })
}

HastEncode("ssssss", 10);
