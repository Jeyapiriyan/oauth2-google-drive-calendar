const { Router } = require('express')
const { google } = require('googleapis')

const router = Router()

// middleware to check authentication
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/auth/login")
}

router.get('', (req, res) => {
    if (typeof req.user == "undefined") {
        res.redirect('/dashboard')
    } else {
        res.redirect('/auth/login')
    }
})

router.get('/dashboard', isLoggedIn, (req, res) => {

    let dashboardArgs = {
        title: 'Dashboard',
        googleid: req.user._id, // google user id
        name: req.user.name,    // google username
        email: req.user.email   // gmail id
    }

    if (req.query.file !== undefined) { // will have valid value upon file upload completion. This is populated by
        // file upload middleware
        if (req.query.file == "upload") // upload successful
            dashboardArgs.file = "uploaded"
        else if (req.query.file == "notupload")  // upload failed
            dashboardArgs.file = "notuploaded"
    }

    if (req.query.calendar !== undefined) { // will have a valid value upon a calendar event retrieval request
        if (req.query.calendar == "success") {          // successfully retrieved the event
            dashboardArgs.calendar = "success"
            dashboardArgs.start = req.query.start       // event starttime
            dashboardArgs.summary = req.query.summary   // event summary
        } else if (req.query.calendar == "failed") {    // failed to retrieve the event
            dashboardArgs.calendar = "failed"
        } else if (req.query.calendar == "empty") {     // no events in the calendar
            dashboardArgs.calendar = "empty"
        }
    }
    res.render('dashboard.ejs', dashboardArgs)  // render the dashboard
})

router.post('/upload', isLoggedIn, async (req, res) => { // handler for google drive file upload
    try {

        // configure google drive connection with client token
        const oauth2Client = new google.auth.OAuth2()
        oauth2Client.setCredentials({
            'access_token': req.user.accessToken    // accessToken from the google login
        });

        const drive = google.drive({
            version: 'v3',
            auth: oauth2Client
        });


        let { name: filename, mimetype, data } = req.files.file_upload // deserialize the file object

        const driveResponse = await drive.files.create({
            requestBody: {
                name: filename,
                mimeType: mimetype
            },
            media: {
                mimeType: mimetype,
                body: Buffer.from(data).toString()
            }
        });

        if (driveResponse.status == 200)
            res.redirect('/dashboard?file=upload') // successfully uploading the file
        else
            res.redirect('/dashboard?file=notupload') // file upload failed
    } catch (error) {
        console.log(error)
        res.redirect('/dashboard?file=notupload') // file upload failed
    }
})

router.get('/calendar', isLoggedIn, async (req, res) => {
    try {
        // configure google calendar connection with client token
        const oauth2Client = new google.auth.OAuth2()
        oauth2Client.setCredentials({
            'access_token': req.user.accessToken    // accessToken from the google login
        });

        const calendar = google.calendar({
            version: 'v3',
            auth: oauth2Client
        });

        const calendar_list_response = await calendar.calendarList.list(maxResults = 1) // select the first calendar
        console.log(calendar_list_response.data.items[0].id)

        const eventList = await calendar.events.list({  // retrieve the event list
            calendarId: calendar_list_response.data.items[0].id,
            timeMin: (new Date()).toISOString(),
            maxResults: 1,
            singleEvents: true,
            orderBy: 'startTime',
        })
        console.log(eventList.data.items)
        if (eventList.data.items.length > 0) {
            nextEventObj = eventList.data.items[0] // select the upcoming event
            console.log(nextEventObj)
            upcomingEvent = {
                start: nextEventObj.start.dateTime || nextEventObj.start.date,
                summary: nextEventObj.summary
            }
            console.log("upcoming event", upcomingEvent)
            res.redirect(`/dashboard?calendar=success&start=${upcomingEvent.start}&summary=${upcomingEvent.summary}`) // succefully retrieved hence redirect

        } else {
            res.redirect('/dashboard?calendar=empty') // no calendar events
        }
    } catch (error) {
        console.log(error)
        res.redirect('/dashboard?calendar=failed') // file upload failed
    }

})


module.exports = router

