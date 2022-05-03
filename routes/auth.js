const { Router } = require('express')
const passport = require('passport')

let router = Router()

router.get('/login', (req, res) => {
    console.log("login", req.user)
    if (req.user) {
        console.log("user is already loggedin")
        res.redirect('/dashboard') // user already authenticated hence redirect the user to dashboard
    }
    else {
        console.log("redirecting user to google signin")
        res.render('auth.ejs', { 'title': 'Login' }) // user is not authenticated hence render the login page
    }

}) // handle get requests on /auth/login endpoint

router.get('/login/google', passport.authenticate("google", {
    scope: ['profile', "https://www.googleapis.com/auth/drive.file", "https://www.googleapis.com/auth/calendar", "email"]
})) // handle get request on /auth/login/google endpoint


router.get('/google/callback', passport.authenticate('google'), (__req, res) => {
    res.redirect('/dashboard') // user successfully logged in hence redirect the user to dashboard
}) // handle get requests on /auth/google/callback endpoint

router.get('/logout', (req, res) => {
    req.logout(); // passport function to handle logout
    res.redirect('/') // redirect the user to home page
}) // handle get requests on /auth/logout endpoint

module.exports = router