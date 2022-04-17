const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20')


passport.serializeUser((user, done) => {

    let sessionUser = {
        _id: user.googleID,
        accessToken: user.accesstoken,
        name: user.name,
        pic_url: user.pic_url,
        email: user.email
    }

    done(null, sessionUser)
})


passport.deserializeUser((sessionUser, done) => {

    done(null, sessionUser)
})


passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            callbackURL: process.env.LOGIN_REDIRECT_URL,
            passReqToCallback: true

        }, (request, accessToken, refreshToken, profile, done) => {

            //save data in session
            user = {
                "accesstoken": accessToken,
                'googleID': profile.id,
                'name': profile.displayName,
                'pic_url': profile._json.picture,
                'email': profile._json.email
            }

            done(null, user)
        }
    )
)