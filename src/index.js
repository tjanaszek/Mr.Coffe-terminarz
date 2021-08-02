const express = require('express');
const expressLayouts = require('express-ejs-layouts')
const crypto = require('crypto');
const path = require('path')
const { users, schedules, getHashedPassword, generateAuthToken, numberToWeekDay } = require('./data');
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser');
const urlencodedParser = bodyParser.urlencoded({ extended: false })
const dotenv = require("dotenv");
dotenv.config();
const DB_NAME = process.env.DB_NAME
const DB_USER = process.env.DB_USER
const DB_PASSWORD = process.env.DB_PASSWORD

const app = express();
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts)
app.set('view engine', 'ejs');
app.use(express.static('public/css'));
// app.use(express.json());
app.use(cookieParser())


app.use(require('body-parser').urlencoded({ extended: true })); //sprawdź czy to działa z curl -> działa

app.use ((req, res, next) => {
    res.locals.url = req.originalUrl;
    res.locals.host = req.get('host');
    res.locals.protocol = req.protocol;
    next();
});

app.use((req, res, next) => {
  // Get auth token from the cookies
  const authToken = req.cookies['AuthToken'];

  // Inject the user to the request
  req.user = authTokens[authToken];

  next();
});

//Authtokens
const authTokens = {};

//Sequelize
const Sequelize = require('sequelize')
const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: 'localhost',
  dialect: 'postgres',
});

sequelize
.authenticate()
.then(() => {
console.log('Connection has been established successfully.');
})
.catch(err => {
console.error('Unable to connect to the database:', err);
});

const User = sequelize.define('user', {
  // attributes
  firstname: {
  type: Sequelize.STRING,
  allowNull: false
  },
  lastname: {
  type: Sequelize.STRING,
  allowNull: false
  },
  email: {
  type: Sequelize.STRING,
  allowNull: false
  },
  password: {
  type: Sequelize.STRING,
  allowNull: false
  }
  }, {
  // options
  });
  // Note: using `force: true` will drop the table if it already exists
  User.sync({ force: false}) // Now the `users` table in the database corresponds to the model definition

  const Schedule = sequelize.define('schedule', {
    // attributes
    user_id: {
    type: Sequelize.INTEGER,
    allowNull: false
    },
    day: {
    type: Sequelize.INTEGER,
    allowNull: false
    },
    start_at: {
    type: Sequelize.TIME,
    allowNull: false
    },
    end_at: {
    type: Sequelize.TIME,
    allowNull: false
    }
    }, {
    // options
    });
    // Note: using `force: true` will drop the table if it already exists
    Schedule.belongsTo(User, {foreignKey: "user_id"});
    Schedule.sync({ force: false})
    

app.get('/', (req, res) => {
  res.render('index', { title: 'Hey', message: 'Hello there!' })
});

app.get('/login', (req, res) => {
  res.render('login', { title: 'Login', message: ''})
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = getHashedPassword(password)

  try{
    const user = await User.findAll({
      where: { email: email, password: hashedPassword }
      })
      if(user[0] ){
        const authToken = generateAuthToken();
        authTokens[authToken] = user[0].dataValues;
        res.cookie('AuthToken', authToken);
        res.redirect('userPage')
      }
      else{
        res.render('login', {title: 'Login', message: 'Invalid email or password.', alertClass: "alert-danger"})
      }
  }catch(error){
    console.error(error)
  }
});

app.get('/signup', (req, res) => {
  res.render('signUp', { title: 'Sign up', message: ''})
});

app.post('/signup', async (req, res) => {
  const u = req.body;
  if(u.password===u.confirmPassword){
    try{
      const user = await User.findAll({
        where: { email: u.email}
        })
        if(user[0]){
          res.render('signUp', {title: 'Sign up', message: 'User is already registered.', alertClass: 'alert-danger'})
        }
        else{
          try {
            u.password = getHashedPassword(u.password)
            const newUser = new User(u)
            await newUser.save()
            res.render('login', {title: 'login', message: 'Registration complete. Please login to continue.',alertClass: 'alert-success'})
            } catch(error) {
            console.error(error)
            }
        }
    }catch(error){
      console.error(error)
    }
  }
  else{
    res.render('signUp', { title: 'Sign up', message:"Password does not match."})
  }
});

app.get('/userPage', async (req, res) => {
  if(!req.user){
    res.render('login', { title: 'Login', message: "You have to login to see this page."})
  }
  else {
    try {
      const schedules = await Schedule.findAll()
      for (const i of schedules) {
        i.day = numberToWeekDay(i.day)
      }
      res.render('schedules', {title: 'User Page', schedules: schedules})
      } catch(error) {
      console.error(error)
    }
  }
});

app.get('/users', async (req, res) => {
  try{
    const u = await User.findAll()
    res.render('users', {title: 'Users', users: u})
  }catch(error){
    console.error(error)
  }
});

app.get('/userSchedules', async (req, res) => {
  if(!req.user){
    res.render('login', { title: 'Login', message: "You have to login to see this page."})
  }
  else {
    const userId  = req.user.id

    try{
      const s = await Schedule.findAll({
        where: { user_id: userId }
        })
        for (const i of s) {
          i.day = numberToWeekDay(i.day)
        }
        res.render('userSchedules', {title: 'User Schedules', userSchedules: s})
    }catch(error){
      console.error(error)
    }
  }
});


app.get('/schedules', async (req, res) => {
  if(!req.user){
    res.render('login', { title: 'Login', message: "You have to login to see this page."})
  }
  else {
    try {
    const schedules = await Schedule.findAll()
    res.render('schedules', {title: 'Schedules', schedules: schedules})
    } catch(error) {
    console.error(error)
    }
  }
});

app.get('/schedules/new', (req, res) => {
  if(!req.user){
    res.render('login', { title: 'Login', message: "You have to login to see this page."})
  }
  else {
    res.render('newSchedule', {title: 'Add new schedule'})
  }
});

app.get('/schedules/delete/:id', (req, res) => {
  if(!req.user){
    res.render('login', { title: 'Login', message: "You have to login to see this page."})
  }
  else {
    const id_schedule = req.params.id;
    console.log("Helloe: "+ id_schedule)
    try{
      Schedule.destroy({
        where: {id: id_schedule}
      })
    }catch(error){
      console.log(error)
    }
    res.redirect('/userSchedules')
  }
});

app.post('/schedules/new', async (req, res) => {
  if(!req.user){
    res.render('login', { title: 'Login', message: "You have to login to see this page."})
  }
  else {
    try {
      const s = req.body
      s.user_id=req.user.id
      console.log(s)
      const newSchedule = new Schedule(s)
      await newSchedule.save()
      res.redirect('/userSchedules') // Returns the new user that is created in the database
      } catch(error) {
      console.error(error)
      }
  }
});

app.get('/users/new', (req, res) => {
  res.render('newUser', {title: 'Add new user', users: users})
});

app.post('/users/new', urlencodedParser, async (req, res) => {
  try {
    const u = req.body
    u.password = getHashedPassword(u.password)
    const newUser = new User(u)
    await newUser.save()
    res.redirect('/users') // Returns the new user that is created in the database
    } catch(error) {
    console.error(error)
    }
});

app.get('/users/:userId', async (req, res) => {
  const {userId} = req.params
  try {
  const user = await User.findAll({
  where: { id: userId }
  })
  const userSchedules = await Schedule.findAll({
    where: {user_id: userId}
  })
  res.render('user', {title: 'User', user: user[0], userSchedules: userSchedules})
  } catch(error) {
  console.error(error)
  }
});

app.listen(3000);
