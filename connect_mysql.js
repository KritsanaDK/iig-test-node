var mysql = require("mysql2");
const util = require("util");

const host_ = "localhost";
const user_ = "root";
const pass_ = "password";
const db_ = "iig_db";

module.exports = {
  logIn,
  reg_user,
  check_pass,
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
    let sql =
      "SELECT * FROM reg_user WHERE Username='" +
      user +
      "' AND Password='" +
      pass +
      "';";
    const result = pool.query(sql);
    //   console.log(result);
    if (result) {
      return result;
    }
  } catch {}
}

function reg_user(user, pass, f_name, l_name, path_file) {
  try {
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
    const result = pool.query(sql);
    //   console.log(result);

    sql =
      "INSERT INTO reg_his (UserName, Password) VALUES ('" +
      user +
      "', '" +
      pass +
      "');";
    result = pool.query(sql);

    if (result) {
      return result;
    }
  } catch {}
}

function check_pass(user, pass) {
  try {
    let sql =
      "select * from(SELECT * FROM reg_his where reg_his.Username = '" +
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
