const express = require('express')
const app = express();
const path = require('path')

const ExpressError = require('./middleware/ExpressError')
const engine = require('ejs-mate')
const axios = require('axios')
const session = require('express-session')
const flash = require('connect-flash')
const WrapAsync = require('./middleware/WrapAsync')
app.engine('ejs', engine)
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({ extended: true }))

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
app.use(session(sessionConfig))
app.use(flash());
app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
})

//------------------------------------------------------------------------------------------------------------------------------//

app.get('/', (req, res) => {
  res.render('home')
})

app.post('/search', WrapAsync(async (req, res) => {
  const { term, Qtyp, genlist } = req.body;
  console.log(term)
  console.log(Qtyp)
  console.log(genlist)

  if(Qtyp=='n'){
    if(!term){  
      req.flash('error' , 'specify a Movie name to search'); 
      res.redirect('/')
    }
    var options = {
      params: { query: `${term}`, page: '1' },
      headers: {
        'x-rapidapi-key': '63b9d3c848msha0ae8f828dd1a7dp1cf9a0jsn45f857b82a7d',
        'x-rapidapi-host': 'advanced-movie-search.p.rapidapi.com'
      }
    };
    const result = await axios('https://advanced-movie-search.p.rapidapi.com/search/movie', options)
    const resultsARRAY = result.data.results;
    res.render('matches', { resultsARRAY, term ,genlist})
  }
  else if(Qtyp=='g'){
    if(!genlist){  
      req.flash('error' , 'specify a genre to search'); 
      res.redirect('/')
    }
    var options = {
      params: { with_genres: `${genlist}`, page: '1'},
      headers: {
        'x-rapidapi-key': '63b9d3c848msha0ae8f828dd1a7dp1cf9a0jsn45f857b82a7d',
        'x-rapidapi-host': 'advanced-movie-search.p.rapidapi.com'
      }
    };
    const result = await axios('https://advanced-movie-search.p.rapidapi.com/discover/movie', options)
    const resultsARRAY = result.data.results;
    res.render('matches', { resultsARRAY, genlist ,term})
  }
}))


app.get('/search/imdb/:tt', WrapAsync(async(req, res, next) => {
  let {tt} = req.params;
  console.log(tt)
  var options = {
    headers: {
      'x-rapidapi-key': '63b9d3c848msha0ae8f828dd1a7dp1cf9a0jsn45f857b82a7d',
      'x-rapidapi-host': 'imdb-internet-movie-database-unofficial.p.rapidapi.com'
    }
  };
  const result = await axios(`https://imdb-internet-movie-database-unofficial.p.rapidapi.com/film/${tt}`, options)
  const { data } = result;
  res.render('info2', { data })
}))

app.get('/search/:id', WrapAsync(async (req, res, next) => {
  const { id } = req.params;
  const options = {
    params: { movie_id: `${id}` },
    headers: {
      'x-rapidapi-key': '63b9d3c848msha0ae8f828dd1a7dp1cf9a0jsn45f857b82a7d',
      'x-rapidapi-host': 'advanced-movie-search.p.rapidapi.com'
    }
  };
  const result = await axios('https://advanced-movie-search.p.rapidapi.com/movies/getdetails', options)
  const {data} = result;
  res.render('info', {data})
}))



app.all('*', (req, res, next) => {
  next(new ExpressError('Page hai hi nhi', 404))
})

app.use((err, req, res, next) => {
  const { status = 500, message } = err;
  if (!message) { message.concat('Generic Error Message') }
  res.status(status).render('error', { err })
})

app.listen('3000', (req, res) => {
  console.log("LISTENing on port 3000")
})



/* 
var axios = require("axios").default;

var options = {
  method: 'GET',
  url: 'https://advanced-movie-search.p.rapidapi.com/search/movie',
  params: {query: 'kong', page: '1'},
  headers: {
    'x-rapidapi-key': '63b9d3c848msha0ae8f828dd1a7dp1cf9a0jsn45f857b82a7d',
    'x-rapidapi-host': 'advanced-movie-search.p.rapidapi.com'
  }
};

axios.request(options).then(function (response) {
  console.log(response.data);
}).catch(function (error) {
  console.error(error);
});


var axios = require("axios").default;

var options = {
  method: 'GET',
  url: 'https://advanced-movie-search.p.rapidapi.com/movies/getdetails',
  params: {movie_id: '399566'},
  headers: {
    'x-rapidapi-key': '63b9d3c848msha0ae8f828dd1a7dp1cf9a0jsn45f857b82a7d',
    'x-rapidapi-host': 'advanced-movie-search.p.rapidapi.com'
  }
};

axios.request(options).then(function (response) {
  console.log(response.data);
}).catch(function (error) {
  console.error(error);
});
 */