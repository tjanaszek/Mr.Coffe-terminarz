const express = require('express');
const expressLayouts = require('express-ejs-layouts')
const crypto = require('crypto');
const path = require('path')
const { users, schedules } = require('./data');
const app = express();
let bodyParser = require('body-parser')
let urlencodedParser = bodyParser.urlencoded({ extended: false })

app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts)
app.set('view engine', 'ejs');
app.use(express.static('public/css'));
app.use(express.json());


app.use(require('body-parser').urlencoded({ extended: true })); //sprawdź czy to działa z curl -> działa

app.use ((req, res, next) => {
    res.locals.url = req.originalUrl;
    res.locals.host = req.get('host');
    res.locals.protocol = req.protocol;
    next();
});

// const {Client} = require('pg')

// const client = new Client({
//     host: "localhost",
//     user: "postgres",
//     port: 5432,
//     password: "Galimatias3!",
//     database: "mrcoffee"
// })

// client.connect();
const { Pool } = require('pg');
const config = require('../nodejs-postgresql/routes/config');
const pool = new Pool(config.db);
/**
 * Query the database using the pool
 * @param {*} query 
 * @param {*} params 
 * 
 * @see https://node-postgres.com/features/pooling#single-query
 */
// async function query(query, params) {
//     const {rows, fields} = await pool.query(query, params);
//     return rows;
// }
// module.exports = {
//   query
// }

app.get('/', (req, res) => {
  res.render('index', { title: 'Hey', message: 'Hello there!' })
});

app.get('/users', (req, res) => {
  pool.query('Select * from users', (err, result)=>{
    if(!err){
      res.render('users', {title: 'Users', users: result.rows})
    }
    else{
        console.log(err.message)
    }
})
});

app.get('/users/:userId/schedules', (req, res) => {
  const { userId } = req.params;
  const userSchedules = [];
  pool.query('Select * from schedule', (err, result)=>{
    if(!err){
      const userSchedules = [];
      for (const i of result.rows) {
        if (userId == i.id_user) {
          userSchedules.push(i);
        }
      }
      if(userSchedules.length!=0){
        res.render('userSchedules', {title: 'User Schedules', userSchedules: userSchedules})
      }
      else{
        res.render('errorPage', {title: 'User Schedules', message: 'This user has no schedules'})
      }
        //res.render('schedules', {title: 'Schedules', schedules: result.rows})
    }
    else{
        console.log(err.message)
    }
})
  // for (const i of schedules) {
  //   if (userId == i.user_id) {
  //     userSchedules.push(i);
  //   }
  // }
  // if(userSchedules.length!=0){
  //   console.log(userSchedules.length)
  //   res.render('userSchedules', {title: 'User Schedules', userSchedules: userSchedules})
  // }
  // else{
  //   res.render('errorPage', {title: 'User Schedules', message: 'This user has no schedules'})
  // }
});

app.get('/schedules', (req, res) => {
  pool.query('Select * from schedule', (err, result)=>{
    if(!err){
        res.render('schedules', {title: 'Schedules', schedules: result.rows})
    }
    else{
        console.log(err.message)
    }
})
});

app.get('/schedules/new', (req, res) => {
  res.render('newSchedule', {title: 'Add new schedule'})
});

app.post('/schedules/new', (req, res) => {
  const u = req.body;
  schedules.push(u);
  res.render('schedules', {title: 'Schedules', schedules: schedules})
});

app.get('/users/new', (req, res) => {
  res.render('newUser', {title: 'Add new user', users: users})
});

app.post('/users/new', urlencodedParser, (req, res) => {
  const u = req.body;
  u.password = crypto.createHash('sha256').update(u.password).digest('hex');
  users.push(u);
  res.render('users', {title: 'Users', users: users})
});

app.get('/users/:userId', (req, res) => {
  const { userId } = req.params;
  pool.query('Select * from users where user_id='+userId, (err, result)=>{
    if(!err){
      res.render('user', {title: 'User', user: result.rows[0]})
    }
    else{
        console.log(err.message)
    }
})
});

app.listen(3000);
