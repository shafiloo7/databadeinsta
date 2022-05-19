const express = require("express")
const app = express()
const ejs = require("ejs")
const bcrypt = require("bcrypt")
const validator = require("express-validator")


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
        res.redirect('/profile/' + user.id)
    } else {
        res.redirect('/login')
    }
})

// profile

app.get('/profile/:id', async(req, res) => {
    const database = dbClient.db('second')
    console.log(req.params.id)
    let user = await database.collection('collection2').findOne({ id: req.params.id })
    console.log(user)
    res.render('profile', { user })
})


app.listen(5555)