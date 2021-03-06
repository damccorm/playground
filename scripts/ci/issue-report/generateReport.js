const { Octokit } = require("@octokit/rest");
const nodemailer = require('nodemailer');

function sendReport(title, header, issues) {
    if (!issues || issues.length == 0) {
        return;
    }
    let report = header + "\n\n"
    for (const issue of issues) {
        report += `${issue.url}: ${issue.title}\n`;
    }
      
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
        text: report
      }, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
}

async function generateReport() {
    const octokit = new Octokit({});

    let p0Issues = await octokit.paginate(octokit.rest.issues.listForRepo, {
    owner: 'apache',
    repo: 'beam',
    labels: 'P0'
    });
    p0Issues = p0Issues.filter(i => {
        for (const l of i.labels) {
            if (l.name == "flaky") {
                return false;
            }
        }
        return true;
    });
    let p0Header = `This is your daily summary of Beam's current P0 issues, not including flaky tests.

    See https://beam.apache.org/contribute/issue-priorities/#p0-outage for the meaning and expectations around P0 issues.

`;
    sendReport(`P0 issues report (${p0Issues.length})`, p0Header, p0Issues);

    let p1Issues = await octokit.paginate(octokit.rest.issues.listForRepo, {
    owner: 'apache',
    repo: 'beam',
    labels: 'P1'
    });
    p1Issues = p1Issues.filter(i => {
        for (const l of i.labels) {
            if (l.name == "flaky") {
                return false;
            }
        }
        return true;
    });
    let p1Header = `This is your daily summary of Beam's current P1 issues, not including flaky tests.

    See https://beam.apache.org/contribute/issue-priorities/#p1-critical for the meaning and expectations around P1 issues.

`;
    sendReport(`P1 issues report (${p1Issues.length})`, p1Header, p1Issues);

    let flakyIssues = await octokit.paginate(octokit.rest.issues.listForRepo, {
    owner: 'apache',
    repo: 'beam',
    labels: 'flaky'
    });
    let flakyHeader = `This is your daily summary of Beam's current flaky tests.

    These are P1 issues because they have a major negative impact on the community and make it hard to determine the quality of the software.

`;
    sendReport(`Flaky test issue report (${flakyIssues.length})`, flakyHeader, flakyIssues); 
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

generateReport();