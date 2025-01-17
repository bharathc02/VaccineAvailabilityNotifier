let nodemailer = require('nodemailer');

let nodemailerTransporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: String(process.env.EMAIL),
        pass: String(process.env.APPLICATION_PASSWORD)
    }
});

exports.sendEmail = function (email, toEmail, subjectLine, body) {

    let options = {
        from: String('Vaccine Checker ' + email),
        to: toEmail,
        subject: subjectLine,
        html: body
    };
    nodemailerTransporter.sendMail(options, (error, info) => {
        if (error) {
            return callback(error);
        }
        callback(error, info);
    });
};