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

var in_topic = 'public1';
var out_topic = 'public1';

var cfenv = require('cfenv');
var appEnv = cfenv.getAppEnv();
var mq_server = process.env.MQ_SERVER;
var mq_port = process.env.MQ_PORT;
var mq_user = process.env.MQ_USER;
var mq_password = process.env.MQ_PASSWORD;
var my_service = "amqp://" + mq_user + ":" + mq_password
                        + "@" + mq_server + ":" + mq_port;

var mqlight = require('mqlight');
var receiveClient = mqlight.createClient(opts);
receiveClient.subscribe(in_topic);
var sendClient = mqlight.createClient({service: my_service});

receiveClient.on('error', function(error) {
    console.error('mqlight.createClient error');
    if (error) {
      if (error.message) console.error('message: %s', error.toString());
      else if (error.stack) console.error(error.stack);
    }
});

receiveClient.on('message', function(data, delivery) {
  console.log('<<< Received from Message Hub: %s, topic: %s, ttl: %d', data
                                                        , delivery.message.topic
                                                        , delivery.message.ttl);
  sendClient.send(out_topic, data);
  console.log('>>> Sent to MQ: %s, topic: %s, ttl: %d', data
                                                        , delivery.message.topic
                                                        , delivery.message.ttl);
});

var express = require('express');
var app = express();
app.use(express.static(__dirname + '/public'));

app.listen(appEnv.port, '0.0.0.0', function() {
    console.log("server starting on " + appEnv.url);
});
