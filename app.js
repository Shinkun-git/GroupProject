if (process.env.NODE_ENV !== "production") {
  require('dotenv').config();
}

const express = require('express')
const app = express();
const path = require('path')
const methodOverride = require('method-override')
const UserRoutes = require('./routes/UserRoutes')
const ReviewRoutes = require('./routes/ReviewRoutes')
const mongoose = require('mongoose')
const ExpressError = require('./middleware/ExpressError')
const WrapAsync = require('./middleware/WrapAsync')
const engine = require('ejs-mate')
const axios = require('axios')
const session = require('express-session')
const flash = require('connect-flash')
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/User');
const ReviewList = require('./models/ReviewList');

app.engine('ejs', engine)
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({ extended: true }))

const DBurl = 'mongodb://localhost:27017/MovieDB'
// const DBurl = `${process.env.mongoATLS}`

mongoose.connect(DBurl, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

const sessionConfig = {
  secret: 'secretSession',
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: null,
    maxAge: null
  }
}
app.use(methodOverride('_method'))
app.use(session(sessionConfig))
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
})

//------------------------------------------------------------------------------------------------------------------------------//

app.get('/', (req, res) => {
  res.render('home')
})
app.get('/about', (req, res)=>{
  res.render('about')
})
app.use('/', UserRoutes)
app.use('/', ReviewRoutes)

app.post('/search', WrapAsync(async (req, res) => {
  const { term, Qtyp, genlist } = req.body;

  if (Qtyp == 'n') {
    if (!term) {
      req.flash('error', 'specify a Movie name to search');
      res.redirect('/')
    }
    var options = {
      params: { query: `${term}`, page: '1' },
      headers: {
        'x-rapidapi-key': `${process.env.key}`,
        'x-rapidapi-host': `${process.env.adv}`
      }
    };
    const result = await axios('https://advanced-movie-search.p.rapidapi.com/search/movie', options)
    const resultsARRAY = result.data.results;
    res.render('matches', { resultsARRAY, term, genlist , Qtyp})
  }
  else if (Qtyp == 'g') {
    if (!genlist) {
      req.flash('error', 'specify a genre to search');
      res.redirect('/')
    }
    var options = {
      params: { with_genres: `${genlist}`, page: '1' },
      headers: {
        'x-rapidapi-key': `${process.env.key}`,
        'x-rapidapi-host': `${process.env.adv}`
      }
    };
    const result = await axios('https://advanced-movie-search.p.rapidapi.com/discover/movie', options)
    const resultsARRAY = result.data.results;
    res.render('matches', { resultsARRAY, term, Qtyp })
  }
}))


app.get('/search/:tt/:id', WrapAsync(async (req, res, next) => {
  const { tt, id } = req.params;
  // console.log("***", tt, id, "***")

  const options = {
    params: { movie_id: `${id}` },
    headers: {
      'x-rapidapi-key': `${process.env.key}`,
      'x-rapidapi-host': `${process.env.adv}`
    }
  };
  var param = {
    headers: {
      'x-rapidapi-key': `${process.env.key}`,
      'x-rapidapi-host': `${process.env.imdb}`
    }
  };
  let data = "";
  let data2 = "";
  try {
    const result = await axios('https://advanced-movie-search.p.rapidapi.com/movies/getdetails', options)
    data = result.data;
  }
  catch (e) {
    console.log("error in advnced mvie search")
    try {
      const result2 = await axios(`https://imdb-internet-movie-database-unofficial.p.rapidapi.com/film/${tt}`, param)
      data2 = result2.data;
    } catch (e) { console.log("error in imdb, after adv failed"); next(e); }
  }
  const imdbID = data.imdb_id || data2.id;
  console.log(data.imdb_id)
  console.log(data2.id)
  console.log('extracted= ', imdbID)
  const OMDBparam = {
    params: { i: `${imdbID}`, apikey:  `${process.env.Okey}` },
    header: {Accept: 'application/json'}
  }
  const OMDBres = await axios('http://www.omdbapi.com/', OMDBparam)
  const OMDB = OMDBres.data;
  // console.log('result*****************')
  const haveReviews = await ReviewList.find({MovieID : imdbID})
  // console.log(haveReviews)
  let LoggedUsr ="";
  if(req.user){
    LoggedUsr = req.user.username;
  }
  res.render('details', {OMDB , data , data2 , haveReviews , id , LoggedUsr})
}))



app.all('*', (req, res, next) => {
  next(new ExpressError('Page hai hi nhi', 404))
})

app.use((err, req, res, next) => {
  const { status = 500, message } = err;
  if (!message) { message.concat('Generic Error Message') }
  res.status(status).render('error', { err })
})

const port = process.env.PORT || 8080;
app.listen(port, (req, res) => {
  console.log(`Listening on port ${port}`)
})



