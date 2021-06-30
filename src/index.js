const express = require('express');
const { users, schedules } = require('./data');
const crypto = require('crypto')

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Welcome to our schedule website');
});

app.get('/users', (req, res) => {
  res.send(users);
});

app.get('/users/:userId', (req, res) => {
  const { userId } = req.params;
  const user = users[userId];
  res.send(user);
});

app.get('/users/:userId/schedules', (req, res) => {
  const { userId } = req.params;
  const userSchedules = [];
  for (let i of schedules) {
    if (userId == i.user_id) {
      userSchedules.push(i);
    }
  }
  res.send(userSchedules);
});

app.get('/schedules', (req, res) => {
  res.send(schedules);
});


app.post('/schedules', (req, res) => {
  const u = req.body;
  schedules.push(u);
  res.send(u);
});

app.post('/users', (req, res) => {
  const u = req.body;
  u['password']=crypto.createHash("sha256").update(u['password']).digest("hex");
  users.push(u);
  res.send(u)
});

app.listen(3000);
