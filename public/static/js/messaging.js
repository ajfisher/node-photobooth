// Use this to deal with all the messaging requirements.
//
//


function Messaging() {

    //this.server = "mqtt://localhost:1883";

    this.client = mqtt.connect();

    this.client.subscribe("photobooth/oc/#");

    this.hardware_available = false;

    this.status_callback = null;

    this.client.on('message', function(topic, payload) {

        if (topic.indexOf("hardware/available") >= 0 ) {
            this.hardware_available = (payload.toString() === 'true');
        }

        console.log(topic);
        if (topic.indexOf("mail/status") >= 0) {
            if (this.status_callback) {
                this.status_callback(JSON.parse(payload.toString()).msg);
            }
        }

    }.bind(this));
}

Messaging.prototype.status_notifier = function(cb) {

    // we use this to do a binding how to call the status notifier in the page
    this.status_callback = cb;
};


var messaging = new Messaging();

