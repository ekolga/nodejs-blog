const homeRoutes    = require('./routes/home');
const articleRoutes = require('./routes/article');
const topicsRoutes  = require('./routes/topics');
const path          = require('path');
const express       = require('express');
const app           = express();
const exphbs        = require('express-handlebars');
const mongoose      = require('mongoose');
const hbs           = exphbs.create({
    defaultLayout: 'main',
    extname: 'hbs'
});

// Engine setup and static folder registration
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', 'views');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({extended: true}));

// Routes registration
app.use('/', homeRoutes);
app.use('/article', articleRoutes);
app.use('/topics', topicsRoutes);

// Starting the server and connecting to the database
async function start() {
    const urlToDb = 'mongodb+srv://admin:5TeQ6ZlFe80jAyDU@blog.wbumg.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'

    try {
        await mongoose.connect(urlToDb, {useNewUrlParser: true});
        app.listen(8000);
    } catch (e) {
        console.error(e);
    }
}

start();