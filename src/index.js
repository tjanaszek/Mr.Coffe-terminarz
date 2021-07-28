const express = require('express');
const expressLayouts = require('express-ejs-layouts')
const crypto = require('crypto');
const path = require('path')
const { users, schedules, getHashedPassword, generateAuthToken } = require('./data');
let bodyParser = require('body-parser')
const cookieParser = require('cookie-parser');
let urlencodedParser = bodyParser.urlencoded({ extended: false })

const app = express();
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

//Authtokens
const authTokens = {};

//Sequelize
const Sequelize = require('sequelize')
const sequelize = new Sequelize('mrcoffee', 'postgres', 'Galimatias3!', {
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
    //Schedule.belongsTo(User)
    Schedule.sync({ force: true})
    

app.get('/', (req, res) => {
  res.render('index', { title: 'Hey', message: 'Hello there!' })
});

app.get('/login', (req, res) => {
  res.render('login', { title: 'Login'})
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
        authTokens[authToken] = user;
        res.cookie('AuthToken', authToken);
        res.json(authToken)
      }
      else{
        res.json("Nie ma go tuu")
      }
  }catch(error){
    console.error(error)
  }
});

app.get('/signup', (req, res) => {
  res.render('signUp', { title: 'Sign up'})
});

app.post('/signup', (req, res) => {
  const { email, firstname, lastname, password, confirmPassword } = req.body;
  if(password===confirmPassword){
    console.log("Tu jest niezrobione")
  }
  res.render('signUp', { title: 'Sign up'})
});

app.get('/users', async (req, res) => {
  try{
    const u = await User.findAll()
    res.render('users', {title: 'Users', users: u})
  }catch(error){
    console.error(error)
  }
});

app.get('/users/:userId/schedules', async (req, res) => {
  const { userId } = req.params;
  try{
    const s = await Schedule.findAll({
      where: { id: userId }
      })
      if(s.length===0){
        res.render('errorPage', {title: 'User Schedules', message: 'This user has no schedules'})
      }
      else{
        res.render('userSchedules', {title: 'User Schedules', userSchedules: s})
      }
  }catch(error){
    console.error(error)
  }
});

app.get('/schedules', async (req, res) => {
  try {
  const schedules = await Schedule.findAll()
  res.render('schedules', {title: 'Schedules', schedules: schedules})
  } catch(error) {
  console.error(error)
  }
});

app.get('/schedules/new', (req, res) => {
  res.render('newSchedule', {title: 'Add new schedule'})
});

app.post('/schedules/new', async (req, res) => {
  try {
    const s = req.body
    const newSchedule = new Schedule(s)
    await newSchedule.save()
    res.redirect('/schedules') // Returns the new user that is created in the database
    } catch(error) {
    console.error(error)
    }

  //
  const u = req.body;
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
  const u = await User.findAll({
  where: { id: userId }
  })
  res.render('user', {title: 'User', user: u[0]})
  } catch(error) {
  console.error(error)
  }
});

app.listen(3000);
