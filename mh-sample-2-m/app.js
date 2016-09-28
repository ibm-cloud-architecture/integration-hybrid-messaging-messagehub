// This application uses express as its web server
// for more info, see: http://expressjs.com
var express = require('express');
var cfenv = require('cfenv');

var app = express();
var appEnv = cfenv.getAppEnv();

var opts = {};
var serviceName = 'messagehub';
if (process.env.VCAP_SERVICES) {
    var services = JSON.parse(process.env.VCAP_SERVICES);
    for (var key in services) {
        if (key.lastIndexOf(serviceName, 0) === 0) {
            messageHubService = services[key][0];
            opts.service = messageHubService.credentials.mqlight_lookup_url;
            opts.user = messageHubService.credentials.user;
            opts.password = messageHubService.credentials.password;
        }
    }
}

var topic = 'public1';

var mqlight = require('mqlight');
var sendClient = mqlight.createClient(opts);

app.get('/api/message', function(req, res) {
  var data = req.query.message;
  if(sendClient.state == 'started') {
    //var data = 'Hello World!'
    console.log('>>> Sending to MessageHub: %s, data: %s', topic, data);
    sendClient.send(topic, data);
  } else {
    console.log('Message not sent, sendClient.state: %s', sendClient.state);
  }
  res.sendStatus(200);
	res.end();
	return;
});

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));

// start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', function() {
  // print a message when the server starts listening
  console.log('server starting on ' + appEnv.url);
});
