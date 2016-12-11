var express = require('express');
var http = require('http');
var mosca = require('mosca');
var path = require("path");

var app = express();
var srv = http.createServer(app);

var mqtt_server = new mosca.Server({});
mqtt_server.attachHttpServer(srv);

app.use(express.static('public'));
app.use('/static', express.static('static'));
app.use(express.static(path.dirname(require.resolve("mosca")) + "/public"));

app.listen(3000, () => {
    console.log("Server running on localhost:3000");
});

app.get('/', (req, res) => {
    res.send("hi there");
});
