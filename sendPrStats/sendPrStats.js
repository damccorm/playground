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
        contents = contents.replace('<br/>', '');
    }
    
    while (contents.indexOf('▀') > -1) {
        contents = contents.replace('▀', '');
    }
    
    while (contents.indexOf('**') > -1) {
        contents = contents.replace('**', '');
    }
    
    while (contents.indexOf('[') > -1) {
        contents = contents.replace('[', '');
    }
    
    while (contents.indexOf(']') > -1) {
        contents = contents.replace(']', '');
    }

    splitContents = contents.split('\n');

    splitContents[0] = 'PR review stats for the last 90 days of the apache beam repo. Generated from https://github.com/flowwer-dev/pull-request-stats:';
    splitContents[1] = '';
    let paddingLength = 16;
    splitContents[2] = '|   | User | Total reviews | Time to review | Total comments |';
    splitContents.splice(3);
    for (let i = 2; i < splitContents.length; i++) {
        let line = splitContents[i];
        let splitLine = line.split('|');
        for (let j = 1; j < splitLine.length; j++) {
            while (splitLine[j].length < paddingLength) {
                splitLine[j] += ' ';
            }
        }

        splitContents[i] = splitLine.join('|');
    }

    contents = splitContents.join('<br/>');

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