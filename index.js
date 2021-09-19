const homeRoutes    = require('./routes/home');
const articleRoutes = require('./routes/article');
const topicsRoutes  = require('./routes/topics');
const loginRoutes   = require('./routes/login');
const path          = require('path');
const express       = require('express');
const app           = express();
const flash         = require('connect-flash');
const session       = require('express-session');
const csrf          = require('csurf');
const MongoStore    = require('connect-mongodb-session')(session);
const exphbs        = require('express-handlebars');
const mongoose      = require('mongoose');
const User          = require('./models/user');
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

 // Authorization check
app.use(varMiddleware);

// Routes registration
app.use('/', homeRoutes);
app.use('/article', articleRoutes);
app.use('/topics', topicsRoutes);
app.use('/auth', loginRoutes);
app.use((req, res) => {
    res.status(404).send('There is nothing to see.');
})
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send(`It's a 500... I'm sorry, but something is probably broken right now.`);
})

// Starting the server and connecting to the database
async function start() {
    try {
        await mongoose.connect(keys.MONGODB_URI, {useNewUrlParser: true});

        app.listen(8000, () => console.log('Server is running...'));
    } catch (e) {
        console.error(e);
    }
}

start();