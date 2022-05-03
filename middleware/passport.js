const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20')

let strategy = new GoogleStrategy(
    {
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: process.env.LOGIN_REDIRECT_URL,
        passReqToCallback: true

    }, (__request, accessToken, __refreshToken, profile, done) => {
        //save data in user session
        user = {
            "accesstoken": accessToken, // this token will be used to request google resources
            'googleID': profile.id,
            'name': profile.displayName,
            'email': profile._json.email
        }
        done(null, user)
    }
)

let serializerFunction = function (user, done) {
    let sessionUser = {
        _id: user.googleID,
        accessToken: user.accesstoken,
        name: user.name,
        email: user.email
    }
    done(null, sessionUser)
}


let deserializerFunction = function (user, done) {
    done(null, user)
}

passport.serializeUser(serializerFunction)  // middleware to save user info in the session
passport.deserializeUser(deserializerFunction) // middleware to retrieve user info in the session
passport.use(strategy)