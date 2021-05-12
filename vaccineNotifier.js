require('dotenv').config()
const moment = require('moment');
const cron = require('node-cron');
const axios = require('axios');
const notifier = require('./notifier');
const sendEmail  = require('./sendEmail');
/**
Step 1) Enable application access on your gmail with steps given here:
 https://support.google.com/accounts/answer/185833?p=InvalidSecondFactor&visit_id=637554658548216477-2576856839&rd=1
Step 2) Enter the details in the file .env, present in the same folder
Step 3) On your terminal run: npm i && pm2 start vaccineNotifier.js
To close the app, run: pm2 stop vaccineNotifier.js && pm2 delete vaccineNotifier.js
 */

const DISTRICT = process.env.DISTRICT
const PINCODE = process.env.PINCODE
const EMAIL = process.env.EMAIL
const TO_EMAIL = process.env.TO_EMAIL
const AGE = process.env.AGE

async function main(){
    try {
        let subject = "Vaccine Availability Notifier"
        let body = "Vaccine Availability Notifier service has begun. You will be notified when the slots are available. Stay home. Stay Safe."
        // checkAvailability();
        sendEmail.sendEmail(EMAIL, TO_EMAIL, subject, body)
        cron.schedule('* * * * *', async () => {
             await checkAvailability();
        });
    } catch (e) {
        console.log('an error occured: ' + JSON.stringify(e, null, 2));
        throw e;
    }
}

async function checkAvailability() {

    let datesArray = await fetchNextDays(5);
    datesArray.forEach(date => {
        getSlotsForDistrict(date);
    })
}

function getSlotsForDistrict(DATE) {
    let config = {
        method: 'get',
        url: 'https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=' + DISTRICT + '&date=' + DATE,
        headers: {
            'accept': 'application/json',
            'Accept-Language': 'hi_IN',
            'accept': 'application/json',
            'Accept-Language': 'hi_IN',
            'authority': 'cdn-api.co-vin.in',
            'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="90", "Google Chrome";v="90"',
            'accept': 'application/json, text/plain, */*',
            'sec-ch-ua-mobile': '?0',
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36',
            'origin': 'https://www.cowin.gov.in',
            'sec-fetch-site': 'cross-site',
            'sec-fetch-mode': 'cors',
            'sec-fetch-dest': 'empty',
            'referer': 'https://www.cowin.gov.in/',
            'accept-language': 'en-GB,en;q=0.9'
        }
    };

    axios(config)
        .then(function (slots) {
            let centers = slots.data.centers;
            centers.filter(center => {
                let sessions = center.sessions;
                let validSlots = sessions.filter(slot => slot.min_age_limit <= AGE &&  slot.available_capacity > 0)
                console.log({date:DATE, validSlots: validSlots.length})
                if(validSlots.length > 0) {
                    notifyMe(center, validSlots, DATE);
                }
            });
        })
        .catch(function (error) {
            console.log(error);
        });
}


function getSlotsForDate(DATE) {
    let config = {
        method: 'get',
        url: 'https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByPin?pincode=' + PINCODE + '&date=' + DATE,
        headers: {
            'accept': 'application/json',
            'Accept-Language': 'hi_IN',
            'accept': 'application/json',
            'Accept-Language': 'hi_IN',
            'authority': 'cdn-api.co-vin.in',
            'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="90", "Google Chrome";v="90"',
            'accept': 'application/json, text/plain, */*',
            'sec-ch-ua-mobile': '?0',
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36',
            'origin': 'https://www.cowin.gov.in',
            'sec-fetch-site': 'cross-site',
            'sec-fetch-mode': 'cors',
            'sec-fetch-dest': 'empty',
            'referer': 'https://www.cowin.gov.in/',
            'accept-language': 'en-GB,en;q=0.9'
        }
    };

    axios(config)
        .then(function (slots) {
            let centers = slots.data.centers;
            centers.filter(center => {
                let sessions = center.sessions;
                let validSlots = sessions.filter(slot => slot.min_age_limit <= AGE &&  slot.available_capacity > 0)
                console.log({date:DATE, validSlots: validSlots.length})
                if(validSlots.length > 0) {
                    notifyMe(center, validSlots, DATE);
                }
            });
        })
        .catch(function (error) {
            console.log(error);
        });
}

async function

notifyMe(centerDetails, validSlots, date){
    notifier.notifyUser(EMAIL, TO_EMAIL, 'VACCINE AVAILABLE', centerDetails, validSlots, date, (err, result) => {
        if(err) {
            console.error({err});
        }
    })
};

async function fetchNextDays(days){
    let dates = [];
    let today = moment();
    for(let i = 0 ; i < days ; i ++ ){
        let dateString = today.format('DD-MM-YYYY')
        dates.push(dateString);
        today.add(1, 'day');
    }
    return dates;
}


main()
    .then(() => {console.log('Vaccine availability checker started.');});