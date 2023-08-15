var mysql = require("mysql2");
const util = require("util");

const host_ = "localhost";
const user_ = "root";
const pass_ = "password";
const db_ = "iig_db";

module.exports = {
  logIn,
  reg_user,
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
    let sql = "SELECT * FROM reg_info;";
    const result = pool.query(sql);
    //   console.log(result);
    if (result) {
      return result;
    }
  } catch { }
}

function reg_user(user, pass, f_name, l_name, path_file) {
  try {
    let sql = "INSERT INTO reg_info (UserName, Password, FirstName, LastName, Path_file) VALUES ('" + user + "', '" + pass + "', '" + f_name + "', '" + l_name + "', '" + path_file + "');";
    const result = pool.query(sql);
    //   console.log(result);
    if (result) {
      return result;
    }
  } catch { }
}

