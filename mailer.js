'use strict'
/** This process subscribes to MQTT and runs the mailing service **/
var fs = require('fs');
var mqtt = require('mqtt');
var nodemailer = require('nodemailer');
var uuid = require('node-uuid');

var config = require('./config.json');

let smtpstring = `smtps:\/\/${encodeURIComponent(config.smtp.username)}:${config.smtp.password}@${config.smtp.hostname}`

var transporter = nodemailer.createTransport(smtpstring);

var mail_options = {
    from: '"PhotoBooth" <ajfisher@rocketmelbourne.com>',
    subject: 'Check out my photobooth photo',
};

var mqtt_client = mqtt.connect();

mqtt_client.on('connect', () => {

    mqtt_client.subscribe('photobooth/ic/mail', (err) => {

        if (err) {
            console.log("Issue subscribing to topic");
            return;
        }

        console.log("Mailing system ready and waiting for messages");
    });
});

mqtt_client.on('message', (topic, message) => {

    // grab the mail data out of the message, parse it to turn it into
    // an image and save the data off to the file system.
    // Once saved (so we have it for later) then make an email and send it
    // off as an attachment.

    var maildata = JSON.parse(message.toString());

    var base64Data = maildata.image.replace(/^data:image\/jpeg;base64,/, "");
    base64Data += base64Data.replace('+', ' ');

    var binData = new Buffer(base64Data, 'base64').toString('binary');

    var filename = "outputImages/" + uuid.v4() + ".jpg";

    fs.writeFile(filename, binData, "binary", function (err) {

        if (err) {
            console.log(err); // writes out file without error
            mqtt_client.publish("photobooth/sys/error", "File not saved to disk");
            mqtt_client.publish("photobooth/oc/mail/status", JSON.stringify({
                code: "send_fail",
                msg: "File was not saved to disk",
            }) );
            return;

        }

        let m_o = mail_options;
        m_o["to"] = maildata.email;
        m_o["text"] = `We took a photo on the PhotoBooth. Here it is.`;
        // neat - we can just use the same dataURL - FTW!
        m_o["attachments"] = [ { path: maildata.image }, ];

        transporter.sendMail(m_o, (err, info) => {
            // send the mail off and then generate appropriate messaging where needed.
            if (err) {
                console.log(err);
                mqtt_client.publish("photobooth/sys/error", "Email could not be sent");
                mqtt_client.publish("photobooth/oc/mail/status", JSON.stringify({
                    code: "send_fail",
                    msg: "Email couldn't be sent: " + err,
                }) );
                return;
            }

            if (info.response.indexOf("OK") > 0) {
                console.log("Message to %s sent ok", maildata.email);
                mqtt_client.publish("photobooth/oc/mail/status", JSON.stringify({
                    code: "sent",
                    msg: "Email sent to " + maildata.email,
                }) );
            } else {
                console.log("Message to %s send issue: %s", maildata.email, info.response);
                mqtt_client.publish("photobooth/oc/mail/status", JSON.stringify({
                    code: "send_fail",
                    msg: "Email couldn't be sent " + info.response,
                }) );
            }
        });
    });
});
