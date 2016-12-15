// Use this to deal with all the messaging requirements.
//
//


function Messaging() {

    //this.server = "mqtt://localhost:1883";

    this.client = mqtt.connect();

    this.client.subscribe("photobooth/oc/hardware/#");

    this.hardware_available = false;

    this.client.on('message', function(topic, payload) {
        if (topic.indexOf("hardware/available") >= 0 ) {
            this.hardware_available = (payload.toString() === 'true');
        }
    }.bind(this));

}

var messaging = new Messaging();

