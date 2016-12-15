'use strict'
var express = require('express');
var mosca = require('mosca');

var app = express();

var moscaSettings = {
    host: '0.0.0.0',
    port: 1883,
    http: {
        port: 3000,
        host: '0.0.0.0',
        static: './public/',
        bundle: true,
    },
};

var mqtt_server = new mosca.Server(moscaSettings);

mqtt_server.on('ready', () => {
    console.log("MQTT server is ready on port %s", moscaSettings.port);
    console.log("HTTP Server is ready on pott %s", moscaSettings.http.port);
});

mqtt_server.on('clientConnected', (client) => {
    console.log('client has connected', client.id);
});

mqtt_server.on('published', function(packet, client) {
  console.log('Published', packet.payload.toString());
});

