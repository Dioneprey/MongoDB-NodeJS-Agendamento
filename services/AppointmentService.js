const appointment = require("../models/Appointment")
const mongoose = require("mongoose")
const AppointmentFactory = require("../factories/AppointmentFactory")
const nodemailer = require("nodemailer")
const smtpTransport = require("nodemailer-smtp-transport")

const Appo = mongoose.model("Appointment", appointment)

class AppointmentService {

    async Create(name, email, description, cpf, date, time){
        var newAppo = new Appo({
            name,
            email,
            description,
            cpf,
            date,
            time,
            finished: false,
            notified: false
        })
        try{
            await newAppo.save()
            return true
        }catch(err){
            console.log(err)
            return false
        }
        
    }

    async GetAll(showFinished){
        if(showFinished){
            return await Appo.find()
        }else {
           var appos = await Appo.find({'finished': false})
           var appointments = []

           appos.forEach(appointment => {

            if(appointment.date != undefined){
                appointments.push(AppointmentFactory.Build(appointment) )
            }            
           })

           return appointments
        }
    }
    
    async GetById(id){
        try {
            var event = await Appo.findOne({'_id': id})
            return event
        } catch(err){
            console.log(err)
        }
       
    }

    async Finish(id){
        try{
            await Appo.findByIdAndUpdate(id,{finished: true})
            return true
        }catch(err){
            console.log(err)
            return false
        }       
    }

    async Search(query){

        try{
            var appos = await Appo.find().or([{email: query},{cpf: query}])
            return appos
        }catch(err){
            console.log(err)
            return []
        }

        
    }

    async SendNotification(){
        var appos = await this.GetAll(false)
console.log("task")
        var transporter = nodemailer.createTransport({
            host: "smtp.mailtrap.io",
            port: 587,            
            auth: {
                user: "3e34e0f8168f8e",
                pass: "1f27087eca5d8a"
            }
        })

        appos.forEach(async app => {

            var date = app.start.getTime()
            var hour = 1000 * 60 * 60
            var gap = date - Date.now()

            if(gap <= hour){
                if(!app.notified) {

                    await Appo.findByIdAndUpdate(app.id,{notified: true})

                    transporter.sendMail({
                        from: "NodeJS Project <3e34e0f8168f8e>",
                        to: app.email,
                        subject: "Lembre de consulta",
                        text: "Sua consulta vai acontecer em 1 hora"                        
                    }).then(msg => {
                        console.log(msg)
                    }).catch(err => {
                        console.log(err)
                    })


                }
            }

        })
    }
}

module.exports = new AppointmentService()