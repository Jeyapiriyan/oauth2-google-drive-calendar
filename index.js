const express = require('express')
const homeRouter = require('./routes/home')
const authRouter = require('./routes/auth')
const passportConfig = require('./middleware/passport')
const passport = require('passport')
const cookieSession = require('cookie-session')
const nunjucks = require('nunjucks')
const fileUpload = require('express-fileupload')

// init app
let app = express()
const port = 3000 || process.env.PORT
app.listen(port, () => console.log(`server is running on ${port}`))

// init view
nunjucks.configure('views', {
    autoescape: true,
    express: app
});

// init static
app.use('/static', express.static('public'))


// init session
app.use(cookieSession({
    keys: [process.env.SECRET_KEY]
}))

// init passport
app.use(passport.initialize())
app.use(passport.session())

// file upload
app.use(fileUpload());

// init routes
app.use('', homeRouter) // home
app.use('/auth', authRouter) // auth
