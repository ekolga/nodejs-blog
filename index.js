const homeRoutes    = require('./routes/home');
const articleRoutes = require('./routes/article');
const topicsRoutes  = require('./routes/topics');
const loginRoutes   = require('./routes/login');
const contactRoutes = require('./routes/contact');
const path          = require('path');
const helmet        = require('helmet');
const compression   = require('compression');
const express       = require('express');
const app           = express();
const flash         = require('connect-flash');
const session       = require('express-session');
const csrf          = require('csurf');
const MongoStore    = require('connect-mongodb-session')(session);
const exphbs        = require('express-handlebars');
const mongoose      = require('mongoose');
const hbs           = exphbs.create({
    defaultLayout: 'main',
    extname: 'hbs'
});
const varMiddleware = require('./middlewares/variables');
const keys          = require('./keys');
// End of import

const store       = new MongoStore({
    collection: 'sessions',
    uri: keys.MONGODB_URI
})

// Engine setup and static folder registration
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', 'views');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({extended: true}));

// Setting up sessions
app.use(session({
    secret: keys.secret,
    resave: false,
    saveUninitialized: false,
    store
}));

// CSRF defence adding
app.use(csrf());

// Middleware for transportation errors to views
app.use(flash());

// A bunch of middlewares to secure this app
app.use(helmet());

// Adds a compression feature in order to speed the site in the future
app.use(compression());

 // Authorization check
app.use(varMiddleware);

// Routes registration
app.use('/', homeRoutes);
app.use('/article', articleRoutes);
app.use('/topics', topicsRoutes);
app.use('/auth', loginRoutes);
app.use('/contact-me', contactRoutes);
app.use((req, res) => {
    res.status(404).render('errors/404', {
        title: "Nothing to see here"
    });
})
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).render('errors/500', {
        title: "Oops! Something went wrong..."
    });
})

// Starting the server and connecting to the database
async function start() {
    try {
        await mongoose.connect(keys.MONGODB_URI, {useNewUrlParser: true});

        app.listen(8000, () => console.log('Server is online'));
    } catch (e) {
        console.error(e);
    }
}

start();