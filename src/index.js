const express = require('express');
const expressLayouts = require('express-ejs-layouts')
const crypto = require('crypto');
const path = require('path')
const { users, schedules } = require('./data');
const app = express();

app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts)
app.set('view engine', 'ejs');
app.use(express.static('public/css'));
app.use(express.json());

app.use ((req, res, next) => {
    res.locals.url = req.originalUrl;
    res.locals.host = req.get('host');
    res.locals.protocol = req.protocol;
    next();
});

app.get('/', (req, res) => {
  res.render('index', { title: 'Hey', message: 'Hello there!' })
});

app.get('/users', (req, res) => {
  // res.send(users);
  res.render('users', {title: 'Users', users: users})
});

app.get('/users/:userId', (req, res) => {
  const { userId } = req.params;
  const user = users[userId];
  res.render('user', {title: 'User', user})
});

app.get('/users/:userId/schedules', (req, res) => {
  const { userId } = req.params;
  const userSchedules = [];
  for (const i of schedules) {
    if (userId == i.user_id) {
      userSchedules.push(i);
    }
  }
  res.render('userSchedules', {title: 'User Schedules', userSchedules: userSchedules})
});

app.get('/schedules', (req, res) => {
  res.render('schedules', {title: 'Schedules', schedules: schedules})
});

app.post('/schedules', (req, res) => {
  const u = req.body;
  schedules.push(u);
  res.send(u);
});

app.use(require('body-parser').urlencoded({ extended: false })); //sprawdź czy to działa z curl -> działa
app.post('/users', (req, res) => {
  const u = req.body;
  u.password = crypto.createHash('sha256').update(u.password).digest('hex');
  users.push(u);
  res.send(u);
});

app.listen(3000);
