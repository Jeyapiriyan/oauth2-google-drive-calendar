const { Router } = require('express')
const passport = require('passport')
const { google } = require('googleapis')
const { youtube } = require('googleapis/build/src/apis/youtube')
const { time } = require('console')

const router = Router()

router.get('/', function (req, res) {
    res.render('auth.ejs', { 'title': 'Application Home' })
})

router.get('/dashboard', function (req, res) {

    if (typeof req.user == "undefined") res.redirect('/auth/login/google')
    else {

        let parseData = {
            title: 'DASHBOARD',
            googleid: req.user._id,
            name: req.user.name,
            avatar: req.user.pic_url,
            email: req.user.email
        }

        if (req.query.file !== undefined) {

            if (req.query.file == "upload") parseData.file = "uploaded"
            else if (req.query.file == "notupload") parseData.file = "notuploaded"
        }

        if (req.query.calendar !== undefined) {

            if (req.query.calendar == "success"){
                parseData.calendar = "success"
                parseData.start = req.query.start
                parseData.summary = req.query.summary
            } else if (req.query.calendar == "failed") {
                parseData.calendar = "failed"
            } else if (req.query.calendar == "empty") {
                parseData.calendar = "empty"
            }
        }

        res.render('dashboard.ejs', parseData)
    }
})

router.post('/upload', function (req, res) {

    if (!req.user) res.redirect('/auth/login/google')
    else {
        // config google drive with client token
        const oauth2Client = new google.auth.OAuth2()
        oauth2Client.setCredentials({
            'access_token': req.user.accessToken
        });

        const drive = google.drive({
            version: 'v3',
            auth: oauth2Client
        });

        //move file to google drive

        let { name: filename, mimetype, data } = req.files.file_upload

        const driveResponse = drive.files.create({
            requestBody: {
                name: filename,
                mimeType: mimetype
            },
            media: {
                mimeType: mimetype,
                body: Buffer.from(data).toString()
            }
        });

        driveResponse.then(data => {

            if (data.status == 200) res.redirect('/dashboard?file=upload') // success
            else res.redirect('/dashboard?file=notupload') // unsuccess

        }).catch(err => { throw new Error(err) })
    }
})

router.get('/calendar', async function (req, res) {
    try {
        if (!req.user) {
            res.redirect('/auth/login/google')
        } else {
            // auth user
            // config google drive with client token
            const oauth2Client = new google.auth.OAuth2()
            oauth2Client.setCredentials({
                'access_token': req.user.accessToken
            });

            const calendar = google.calendar({
                version: 'v3',
                auth: oauth2Client
            });
        
            const calendar_list_response= await calendar.calendarList.list(maxResults=1)
            console.log(calendar_list_response.data.items[0].id)

            const eventList = await calendar.events.list({
                calendarId: calendar_list_response.data.items[0].id,
                timeMin: (new Date()).toISOString(),
                maxResults: 1,
                singleEvents: true,
                orderBy: 'startTime',
            })
            console.log(eventList.data.items)
            if (eventList.data.items.length > 0) {
                nextEventObj = eventList.data.items[0]
                console.log(nextEventObj)
                upcomingEvent = {
                  start: nextEventObj.start.dateTime || nextEventObj.start.date,
                  summary: nextEventObj.summary
                }
                console.log("upcoming event", upcomingEvent)
                res.redirect(`/dashboard?calendar=success&start=${upcomingEvent.start}&summary=${upcomingEvent.summary}`)
            } else {
                res.redirect('/dashboard?calendar=empty')
            }

        }
    } catch (error) {
        console.log(error)
        res.redirect('/dashboard?calendar=failed')
    }
   
})


module.exports = router

