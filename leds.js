var five = require('johnny-five');
var mqtt = require('mqtt');
var pixel = require('node-pixel');

var board = five.Board();
var panel;

board.on('ready', () => {

    panel = new pixel.Strip({
        board: board,
        controller: "FIRMATA",
        data: 6,
        length: 64,
    });

    panel.on("ready", () => {
        console.log("LEDs ready.");
        panel.off();
        panel.show();
    });

});

var mqtt_client = mqtt.connect();

mqtt_client.on('connect', () => {

    mqtt_client.subscribe('photobooth/ic/flash', (err) => {

        if (err) {
            console.log("Issue subscribing to topic");
            return;
        }

        console.log("LED flash system ready and waiting for messages");
    });
});

mqtt_client.on('message', (topic, message) => {

    // only message that should be sent on pb/ic/flash will be a true
    // so won't even bother detecting it.

    // aim is to burst light and then drop it over about 200ms
    var time = 255; // basically use this as a method of dropping

    panel.color('#FFFFFF');
    panel.show();

    var countdown = setInterval(function() {
        time = time - 10;
        panel.color(`rgb(${time}, ${time}, ${time})`);
        panel.show();
        if (time <= 0) {
            clearInterval(countdown);
        }
    }, 10);


});
