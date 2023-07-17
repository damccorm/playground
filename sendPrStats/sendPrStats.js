const fs = require('fs');
const nodemailer = require('nodemailer');


function sendReport(title, report) {
      
    nodemailer.createTransport({
        service: process.env['ISSUE_REPORT_SENDER_EMAIL_SERVICE'], // e.g. "gmail"
        auth: {
            user: process.env['ISSUE_REPORT_SENDER_EMAIL_ADDRESS'],
            pass: process.env['ISSUE_REPORT_SENDER_EMAIL_PASSWORD']
        }
    }).sendMail({
        from: process.env['ISSUE_REPORT_SENDER_EMAIL_ADDRESS'],
        to: process.env['ISSUE_REPORT_RECIPIENT_EMAIL_ADDRESS'],
        subject: title,
        html: report
    }, function(error, info){
        if (error) {
            throw new Error(`Failed to send email with error: ${error}`);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

function formatReport(contents) {
    linkIndex = contents.indexOf('(https://app.flowwer.dev');
    while (linkIndex != -1) {
        endIndex = contents.indexOf('<br/>', linkIndex) + 4;
        link = contents.substring(linkIndex, endIndex+5);
        contents = contents.replace(link, '');

        linkIndex = contents.indexOf('(https://app.flowwer.dev');
    }
    
    while (contents.indexOf('<br/>') > -1) {
        contents = contents.replace('<br/>', '')
    }

    return contents;
}

function validateEnvSet(envVar) {
    if (!process.env[envVar]) {
        throw new Error(`${envVar} environment variable not set.`)
    }
}

validateEnvSet('ISSUE_REPORT_SENDER_EMAIL_SERVICE')
validateEnvSet('ISSUE_REPORT_SENDER_EMAIL_ADDRESS')
validateEnvSet('ISSUE_REPORT_SENDER_EMAIL_PASSWORD')
validateEnvSet('ISSUE_REPORT_RECIPIENT_EMAIL_ADDRESS')

contents = fs.readFileSync('results.txt', 'utf-8');

sendReport('pr stats', formatReport(contents));