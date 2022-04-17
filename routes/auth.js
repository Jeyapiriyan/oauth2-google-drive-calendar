const { Router } = require('express')
const passport = require('passport')


let router = Router()

router.get('/login', function (req, res) {

    if (req.user) res.redirect('/dashboard')
    else res.redirect('/auth/login/google')

})

router.get('/login/google', passport.authenticate("google", {
    scope: ['profile', "https://www.googleapis.com/auth/drive.file","https://www.googleapis.com/auth/calendar", "email"]
}))

router.get('/google/callback', passport.authenticate('google'), function (req, res) {

    res.redirect('/dashboard')
})


router.get('/logout', function (req, res) {
    req.logOut();
    res.redirect('/')
})

module.exports = router