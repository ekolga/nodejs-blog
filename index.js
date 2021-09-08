const homeRoutes    = require('./routes/home');
const articleRoutes = require('./routes/article');
const topicsRoutes  = require('./routes/topics');
const path          = require('path');
const express       = require('express');
const app           = express();
const exphbs        = require('express-handlebars');
const mongoose      = require('mongoose');
const User          = require('./models/user');
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

// Temporary a single-user middleware
app.use(async (req, res, next) => {
    try {
        const user = await User.findById('6136cb142fa96ec8e16a120a');

        req.user = user;

        next();
    } catch (error) {
        console.error(error);
    }
})

// Routes registration
app.use('/', homeRoutes);
app.use('/article', articleRoutes);
app.use('/topics', topicsRoutes);

// Starting the server and connecting to the database
async function start() {
    const urlToDb = 'mongodb+srv://admin:5TeQ6ZlFe80jAyDU@blog.wbumg.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'

    try {
        await mongoose.connect(urlToDb, {useNewUrlParser: true});

        const candidate = await User.findOne();

        if (!candidate) {
            const user = new User({
                email: 'kolga@gmail.com',
                password: 123123,
                name: "Edward",
                role: "admin"
            });

            await user.save();
        }


        app.listen(8000);
    } catch (e) {
        console.error(e);
    }
}

start();