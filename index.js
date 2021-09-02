const homeRoutes    = require('./routes/home');
const articleRoutes = require('./routes/article');
const topicsRoutes  = require('./routes/topics');
const express       = require('express');
const app           = express();
const exphbs        = require('express-handlebars');
const hbs           = exphbs.create({
    defaultLayout: 'main',
    extname: 'hbs'
});

// Engine setup and static folder registration
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', 'views');
app.use(express.static('public'));
app.use(express.urlencoded({extended: true}));

// Routes registration
app.use('/', homeRoutes);
app.use('/article', articleRoutes);
app.use('/topics', topicsRoutes);

// Starting the server
app.listen(8000);