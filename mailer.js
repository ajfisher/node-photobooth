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
    subject: 'Check out my photobooth pics',
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

    let m_o = mail_options;
    m_o["to"] = maildata.email;
    m_o["text"] = `We took a photo on the PhotoBooth. Here it is.`;
    // neat - we can just use the same dataURL - FTW!
    var attachments = [];

    // iterate over the images, save them and add them to the mail attachments

    var attach_err = false;
    var attach_err_msg = "";

    maildata.images.forEach((image) => {

        let base64Data = image.replace(/^data:image\/jpeg;base64,/, "");
        base64Data += base64Data.replace('+', ' ');

        let bindata = new Buffer(base64Data, 'base64').toString('binary');

        let filename = "outputImages/" + uuid.v4() + ".jpg";

        try {
            fs.writeFileSync(filename, bindata, "binary");
        } catch (e) {
            console.log("there was an issue with " + filename);
            attach_err = true;
            attach_err_msg = e;
        }

        // we can still push the image though if we have it as data url
        attachments.push( { path: image } );
    });

    if (attach_err) {
        mqtt_client.publish("photobooth/sys/error", "File could not be saved");
        mqtt_client.publish("photobooth/oc/mail/status", JSON.stringify({
            code: "send_fail",
            msg: "File couldn't be saved: " + attach_err_msg,
        }) );
    }

    // now attach and then start send process
    m_o["attachments"] = attachments;

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
