# IBM Cloud Hybrid Messaging Reference Implementation Using Message Hub

## Solution Overview

This project provides an end-to-end reference implementation to demonstrate how to implement hybrid messaging that connects public cloud to on-prem systems via a secure messaging solution. It uses Bluemix Secure Gateway to communicate to MQ deployed on a SoftLayer VM image (to mimic on-prem deployment)

The project also provides the following Node.js applications:
1. mh-mq-to-hub-m. A bridge app sending messages from MQ to MessageHub.
2. mh-hub-to-mq-m. A bridge app sending messages from MessageHub to MQ.
3. mh-sample-m. An app receiving messages from Message Hub.
4. mh-sample-2-m. An app sending messages to MessageHub.
5. mh-sample-3-m. An app receiving messages from MessageHub, and sending the reversed messages to MessageHub.
All apps publish and subscribe to MQ topics via the MQLite protocol. They are deployed to Bluemix as Cloud Foundry applications.
 
![Hybrid Messaging Architecture Overview](static/imgs/hybrid_messaging.png?raw=true)

## Setup the MQ on SoftLayer

Install a version of MQ on the SoftLayer VM that supports AMQP.
Create and start a Queue Manager.
Create and start the AMQP service.

More information here https://www.ibm.com/support/knowledgecenter/SSFKSJ_8.0.0/com.ibm.mq.ins.doc/q008250_.htm

## Setup a Secure Gateway service on Bluemix

1. From the Bluemix Catalog, select Secure Gateway
2. Click CREATE
3. ADD GATEWAY
4. Name GatewayToLocalMQ
5. Add a destination, named OnPremMQ
   * On-premises
   * SoftLayer VM's IP address
   * Port 5672
   * Using TCP

## Setup the Secure Gateway client on SoftLayer

1. FTP Secure Gateway Client installation package to /tmp directory
2. cd /tmp
3. rpm -ivhf [file-name].rpm
4. Start the client (after defining the Secure Gateway on Bluemix):
   1. cd /opt/ibm/securegateway/client
   2. node lib/secgwclient.js [gateway-id] --t [security-token]
   3. acl allow :5672
5. After the Secure gateway client is started, the Secure Gateway on Bluemix will show as connected.

## Run one or both of the bridge apps on Bluemix

1. Create a Message Hub service
   * From the Bluemix Catalog, select Message Hub
   * Click CREATE
   * Name the service MessageHub
   * Create a topic named MQLight
2. Download and extract the code
3. cd into the mq-to-hub-m (or the hub-to-mq-m) bridge app directory
4. Edit the manifest.yml file for your values of the environment variables, as applicable
   * MQ_SERVER: The secure gateway’s cloud host
   * MQ_PORT: The secure gateway’s cloud port
   * MQ_USER: A VM userid
   * MQ_PASSWORD: The associated VM password
5. cf push mq-to-hub-m (or the hub-to-mq-m)

## Run one or more of the sample apps on Bluemix

1. Download and extract the code
2. cd into the mh-sample-m (mh-sample-2-m/mh-sample-3-m) app directory
3. cf push mh-sample-m (mh-sample-2-m/mh-sample-3-m)

## Test the message flow from on-prem MQ to Cloud

1. Log on to the on-prem Linux systems
2. Use the MQ sample message publisher to create test message on the topic
   * /opt/mqm/samp/bin/amqspub <Topic> <Queue Manager>
   * E.g. /opt/mqm/samp/bin/amqspub public ONPREM_QM
   * An empty message followed by ENTER ends the program
3. The messages will be received and displayed by sample app mh-sample-m

## Test the message flow from Cloud to on-prem MQ

1. Log on to the on-prem Linux systems
2. Use the MQ sample message subscriber to display test message on the topic
   * /opt/mqm/samp/bin/amqssub <Topic> <Queue Manager>
   * E.g. /opt/mqm/samp/bin/amqssub public1 ONPREM_QM
3. Send test messages by using sample app mh-sample-2-m

## Test the message flow from on-prem MQ to Cloud back to on-prem MQ

1. Log on to the on-prem Linux systems
2. Use the MQ sample message publisher to create test message on the topic
   * /opt/mqm/samp/bin/amqspub <Topic> <Queue Manager>
   * E.g. /opt/mqm/samp/bin/amqspub public ONPREM_QM
   * An empty message followed by ENTER ends the program
3. Use the MQ sample message subscriber to display test message on the topic
   * /opt/mqm/samp/bin/amqssub <Topic> <Queue Manager>
   * E.g. /opt/mqm/samp/bin/amqssub public1 ONPREM_QM
3. The messages will be received and displayed by sample app mh-sample-3-m after arriving in the Cloud and before going back to on-prem MQ
