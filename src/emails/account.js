const sgMail = require("@sendgrid/mail")

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name)=>{
    sgMail.send({
        to: email,
        from: "anass.belhaddad@gmail.com",
        subject: "Welcome to the Task manager application",
        text: `Welcome to the app, ${name}. Let me how you get along with the app.`
    })
}


const sendCancelEmail= (email, name)=>{
    sgMail.send({
        to: email,
        from: "anass.belhaddad@gmail.com",
        subject: "Task manager application : Leaving us already?",
        text:`Hello ${name}, we are sorry that our application didn't impress you, would you please kindly tell us why you did cancel your subscription so we can improve ourseleves?`
    })
}

module.exports= {
    sendWelcomeEmail,
    sendCancelEmail
}