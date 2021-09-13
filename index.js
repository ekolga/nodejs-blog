const homeRoutes    = require('./routes/home');
const articleRoutes = require('./routes/article');
const topicsRoutes  = require('./routes/topics');
const loginRoutes   = require('./routes/login');
const path          = require('path');
const express       = require('express');
const app           = express();
const session       = require('express-session');
const MongoStore    = require('connect-mongodb-session')(session);
const exphbs        = require('express-handlebars');
const mongoose      = require('mongoose');
const User          = require('./models/user');
const hbs           = exphbs.create({
    defaultLayout: 'main',
    extname: 'hbs'
});
const varMiddleware = require('./middlewares/variables');

const MONGODB_URI = 'mongodb+srv://admin:5TeQ6ZlFe80jAyDU@blog.wbumg.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';
const store       = new MongoStore({
    collection: 'sessions',
    uri: MONGODB_URI
})

// Engine setup and static folder registration
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', 'views');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({extended: true}));
app.use(session({
    secret: 'some secret value',
    resave: false,
    saveUninitialized: false,
    store
}));
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
        await mongoose.connect(MONGODB_URI, {useNewUrlParser: true});

        app.listen(8000, () => console.log('Server is running...'));
    } catch (e) {
        console.error(e);
    }
}

start();