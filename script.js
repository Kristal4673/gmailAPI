// Client ID and API key from the Developer Console
var CLIENT_ID = 'YOUR_CLIENT_ID';
var API_KEY = 'YOUR_API_KEY';
var DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest'];
var SCOPES = 'https://www.googleapis.com/auth/gmail.send';

var authorizeButton = document.getElementById('authorizeButton');
var emailForm = document.getElementById('emailForm');
var recipientInput = document.getElementById('recipient');
var subjectInput = document.getElementById('subject');
var bodyInput = document.getElementById('body');
var statusDiv = document.getElementById('status');

function handleClientLoad() {
    gapi.load('client:auth2', initClient);
}

function initClient() {
    gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES
    }).then(function () {
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
        updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
    }).catch(function (error) {
        console.log('Error initializing client: ', error);
    });
}

function updateSigninStatus(isSignedIn) {
    if (isSignedIn) {
        emailForm.addEventListener('submit', sendEmail);
    } else {
        gapi.auth2.getAuthInstance().signIn();
    }
}

function sendEmail(event) {
    event.preventDefault();

    var headers = {
        'To': recipientInput.value,
        'Subject': subjectInput.value
    };

    var email = '';
    for (var header in headers)
        email += header += ": " + headers[header] + "\r\n";

    email += "\r\n" + bodyInput.value;

    var encodedEmail = btoa(email).replace(/\+/g, '-').replace(/\//g, '_');
    var request = gapi.client.gmail.users.messages.send({
        'userId': 'me',
        'resource': {
            'raw': encodedEmail
        }
    });

    request.execute(function (response) {
        if (response && response.error) {
            statusDiv.innerHTML = 'Error occurred while sending the email.';
        } else {
            statusDiv.innerHTML = 'Email sent successfully.';
            emailForm.reset();
        }
    });
}
