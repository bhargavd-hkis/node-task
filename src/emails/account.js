const sgMail = require('@sendgrid/mail')

// const sendgridAPIKey = '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'

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: "daeton.lejuan@ifyourock.com",
        subject: "Thank for joining in!",
        text: `Welcome to the app, ${name}. Let me know how you get along with the app.`,
    })
}

const sendCancelationEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: "daeton.lejuan@ifyourock.com",
        subject: "Sorry to see you go..",
        text: `Goodbye, ${name}. I hope you enjoy this app.`,
    })
}

module.exports = {
    sendWelcomeEmail,
    sendCancelationEmail
}
// sgMail.send({
//     to: "daeton.lejuan@ifyourock.com",
//     from: "daeton.lejuan@ifyourock.com",
//     subject: "testing subject from node.js email sending",
//     text: "this is working",
// })

