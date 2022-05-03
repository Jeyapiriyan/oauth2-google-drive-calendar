const express = require('express')
const homeRouter = require('./routes/home')
const authRouter = require('./routes/auth')
const __ = require('./middleware/passport')
const passport = require('passport')
const session = require('express-session')
const nunjucks = require('nunjucks')
const fileUpload = require('express-fileupload')

// init app
let app = express()
const port = process.env.PORT
app.listen(process.env.PORT, '0.0.0.0', () => console.log(`server is running on ${process.env.PORT}`));


// init view
nunjucks.configure('views', {
    autoescape: true,
    express: app
});

// init static
app.use('/static', express.static('public'))

// init session
app.use(session({
    secret: process.env.SECRET_KEY,       //decode or encode session
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 2 * 60 * 1000
    }
}));

// init passport
app.use(passport.initialize())
app.use(passport.session())

//current User
app.use(function (req, res, next) {
    res.locals.currentUser = req.user;
    next();
})

// file upload
app.use(fileUpload());

// init routes
app.use('', homeRouter) // home
app.use('/auth', authRouter) // auth
