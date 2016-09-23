/*eslint-env node*/

// This application uses express as its web server
// for more info, see: http://expressjs.com
var express = require('express');
var app = express();

var cfenv = require('cfenv');
var appEnv = cfenv.getAppEnv();

var opts = {};
var serviceName = 'messagehub';

if (process.env.VCAP_SERVICES) {
  var services = JSON.parse(process.env.VCAP_SERVICES);
  for (var key in services) {
    if (key.lastIndexOf(serviceName, 0) === 0) {
      var messageHubService = services[key][0];
      opts.service = messageHubService.credentials.mqlight_lookup_url;
      opts.user = messageHubService.credentials.user;
      opts.password = messageHubService.credentials.password;
    }
  }
}

var my_topic = 'public';

var mqlight = require('mqlight');
var receiveClient = mqlight.createClient(opts);
receiveClient.subscribe(my_topic);

receiveClient.on('error', function(error) {
    console.error('mqlight.createClient error, service: %s',opts.service);
    if (error) {
      if (error.message) console.error('message: %s', error.toString());
      else if (error.stack) console.error(error.stack);
    }
});

receiveClient.on('message', function(data, delivery) {
  console.log('<<< Received from Message Hub: %s, topic: %s, ttl: %d', data
                                                        , delivery.message.topic
                                                        , delivery.message.ttl);
});

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));

// start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', function() {
  // print a message when the server starts listening
  console.log('server starting on ' + appEnv.url);
});
