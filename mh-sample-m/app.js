// Startup Express App
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
http.listen(process.env.PORT || 3000);

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
io.sockets.on('connection', function(socket) {

  var receiveClient = mqlight.createClient(opts);
  receiveClient.subscribe(my_topic);

  receiveClient.on('error', function(error) {
    onsole.error('mqlight.createClient error, service: %s',opts.service);
    if (error) {
      if (error.message) console.error('message: %s', error.toString());
      else if (error.stack) console.error(error.stack);
    }
  });

  receiveClient.on('message', function(data, delivery) {
    console.log('<<< Received from Message Hub: %s, topic: %s, ttl: %d', data
                                                        , delivery.message.topic
                                                        , delivery.message.ttl);
    socket.broadcast.emit('msg', {'msg' : data});
  });

});

// Configure Jade template engine
var path = require('path');
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.static(path.join(__dirname, 'public')));

// handle HTTP GET request to the "/" URL
app.get('/', function(req, res) {
  res.render('index', {messages: ""});
});

// socket.io listen for messages
io.on('connection', function(socket) {
  socket.on('msg', function(data) {
    socket.broadcast.emit('msg', data);
  });
});
