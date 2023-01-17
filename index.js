const bodyParser = require("body-parser")
const express = require("express")
const app = express()
const mongoose = require('mongoose')
const AppointmentService = require("./services/AppointmentService")

app.use(express.static("public"))

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

app.set('view engine','ejs')

mongoose.set('strictQuery', false)
mongoose.connect("mongodb://127.0.0.1:27017/agendamento",{useNewUrlParser: true, useUnifiedTopology: true})




app.get("/", (req,res) => {
    res.render("index")
})

app.get("/cadastro", (req,res) => {
    res.render("create")
})

app.post("/create", async (req,res) => {
    var{name, email, description, cpf, date, time} = req.body
    var status = await AppointmentService.Create(name, email, description, cpf, date, time)
    console.log("create")
    
    if(status){
        res.redirect("/")
    }else{
        res.send("Ocorreu uma falha!")
    }
})

app.get("/calendar", async (req,res) => {

    var appointments = await AppointmentService.GetAll(false)
    res.json(appointments)
})

app.get("/event/:id", async (req,res) => {
    var appointment = await AppointmentService.GetById(req.params.id)
    console.log(appointment)
    res.render("event", {appo: appointment})
})

app.post("/finish", async (req,res) => {
    var id = req.body.id
    var result = await AppointmentService.Finish(id)

    res.redirect("/")
})

app.get("/list", async (req,res) => {
    var appos = await AppointmentService.GetAll(true)
    res.render("list",{appos})   
})

app.get("/searchresult", async (req,res) => {   
    var appos = await AppointmentService.Search(req.query.search)
    res.render("list",{appos}) 
})

var poolTime = 1000 * 60 *5 // a cada 5min verifica se envia a notificação

setInterval(async () => {
    
    await AppointmentService.SendNotification()

},poolTime)


app.listen(8080, () => {})