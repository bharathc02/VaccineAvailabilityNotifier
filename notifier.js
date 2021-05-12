const sendEmail  = require('./sendEmail');

function createTemplate(centerDetails, slotDetails, date){
    let message = `Hi, 
    <br/>
    Vaccine is available on <strong> ${date} </strong> in the following center(s): 
    <br/><br/>
    `
    for(const slot of slotDetails){
        let slotBody = `<strong> Center Name: ${centerDetails.name} </strong> <br/>
        Location: ${centerDetails.block_name}, ${centerDetails.state_name}, ${centerDetails.pincode} <br/>
        From ${centerDetails.from} to ${centerDetails.to} <br/>
        Fee Type: ${centerDetails.fee_type} <br/>

        Available Capacity: ${slot.available_capacity} dose(s) available <br/>
        Vaccine: ${centerDetails.vaccine} <br/>
        Slots Available: <br/>`
        for(const x of slot.slots){
            slotBody = `${slotBody} ${x} <br/>`
        }
        slotBody = `${slotBody} <br/><br/>`
        message = `${message} ${slotBody}`
    }

    return message
}
// Fee: ${centerDetails.fee} rupees <br/>

exports.notifyUser = function (email, toEmail, subjectLine, centerDetails, slotDetails, date, callback) {
    let message = createTemplate(centerDetails, slotDetails, date)
    sendEmail.sendEmail(email, toEmail, subjectLine, message)
};
