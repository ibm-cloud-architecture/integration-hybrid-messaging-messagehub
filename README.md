# IBM Cloud Hybrid Messaging Reference Implementation Using Message Hub

## Solution Overview

This project provides an end-to-end reference implementation to demonstrate how to implement hybrid messaging that connects public cloud to on-prem systems via a secure messaging solution. It uses Bluemix Secure Gateway to communicate to MQ deployed on a SoftLayer VM image (to mimic on-prem deployment)

The project also provides a simple Node.js application that publishes and subscribes to the MQ topics via MQLite protocol. It is deployed to Bluemix as a Cloud Foundry application.

### Insert Diagram here

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

## Run the app on Bluemix

1. Create a Message Hub service
   * From the Bluemix Catalog, select Message Hub
   * Click CREATE
   * Name the service MessageHub
   * Create a topic named MQLight
2. Download and extract the code
3. cd into the mq-to-hub-m bridge app directory
4. Edit the manifest.yml file for your values of the environment variables, as applicable
   * MQ_SERVER: The secure gateway’s cloud host
   * MQ_PORT: The secure gateway’s cloud port
   * MQ_USER: A VM userid
   * MQ_PASSWORD: The associated VM password
5. cf push mq-to-hub-m
6. cd into the mh-sample-m sample app directory
7. cf push mh-sample-m

## Test the message flow

1. Log on to the on-prem Linux systems
2. Use the MQ sample message publisher to create test message on the topic
   * /opt/mqm/samp/bin/amqspub <Topic> <Queue Manager>
   * E.g. /opt/mqm/samp/bin/amqspub public ONPREM_QM
   * An empty message followed by ENTER ends the program
