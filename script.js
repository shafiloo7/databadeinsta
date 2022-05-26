const express = require("express")
const app = express()
const ejs = require("ejs")
const bcrypt = require("bcrypt")
const validator = require("express-validator")
const cookieParser = require("cookie-parser")

app.use(cookieParser())
app.use(express.static('static'))
app.set('view engine', 'ejs')

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

const MongoClient = require('mongodb').MongoClient
const url = 'mongodb+srv://sha:shapassword@cluster0.6l2ff.mongodb.net/second'
const dbClient = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true })
dbClient.connect((err) => {
    if (err) {
        console.log('error')
    } else {
        console.log('success')
    }
})

// login page

app.get('/login', (req, res) => {
    if (req.cookies.username) {
        return res.redirect('/profile')
    }
    res.render('login')
})

// singup

app.get('/singup', (req, res) => {
    res.render('singup')
})
app.post('/singup', async(req, res) => {
    const database = dbClient.db('second')
    let data = req.body
    data.id = `${Date.now()}`
    data.password = await bcrypt.hash(data.password, 2)
    console.log(data)
    await database.collection('collection2').insertOne(data).then(() => {
        console.log('success')
    }).catch(() => {
        console.log(e)
    })
    res.redirect('/login')

})

// login

app.post('/login', async(req, res) => {

    const database = dbClient.db('second')
    let d = req.body
    console.log(d)
    let user = await database.collection('collection2').findOne({ email: d.email })
    if (!user) {
        return res.redirect('/login')
    }
    console.log(user)
    let val = await bcrypt.compare(d.password, user.password)
    if (val) {
        let options = {
            maxAge: 1000 * 60 * 5, // would expire after 5 minutes
            httpOnly: false, // The cookie only accessible by the web server
        }
        res.cookie('username', user.username, options)
        res.redirect('/profile')
    } else {
        res.redirect('/login')
    }
})

// profile

app.get('/profile', async(req, res) => {
    const database = dbClient.db('second')
    let username = req.cookies.username
    if (!username) {
        return res.redirect('/login')
    }
    let user = await database.collection('collection2').findOne({ username: username })
    console.log(user)
    res.render('profile', { user })
})

//logout

app.get('/logout', (req, res) => {
    const database = dbClient.db('second')
    res.clearCookie('username');
    res.redirect('/login');
})


app.listen(5555)