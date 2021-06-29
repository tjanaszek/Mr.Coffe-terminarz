const express = require('express');
const { users, schedules } = require('./data');
const app = express();
app.use(express.json())

app.get('/', function(req, res){
    res.send('Welcome to our schedule website')
  })


  app.get('/users', function(req, res){
    res.send(users)
  })


  app.get('/users/:userId', function(req, res){
    const userId = req.params.userId;
    const user = users[userId];
    res.send(user)
  })


  app.get('/users/:userId/schedules', function(req, res){
    const userId = req.params.userId;
    const userSchedules=[]
    for(let i of schedules){
        if(userId==i['user_id']){
            userSchedules.push(i)
        }
    }
    res.send(userSchedules)
  })


  app.get('/schedules', function(req, res){
    res.send(schedules)
  })


  app.post('/schedules', function(req, res){
    const u = req.body
    schedules.push(u)
    res.send(u)
  })

  app.post('/users', function(req, res){
    const u = req.body
    users.push(u)
    res.send(u)
  })


  app.listen(3000)


  