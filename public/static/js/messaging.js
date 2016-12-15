// Use this to deal with all the messaging requirements.
//
//


function Messaging() {

    //this.server = "mqtt://localhost:1883";

    this.client = mqtt.connect();

    this.client.subscribe("hardware/#");

    this.hardware_available = false;

    this.client.on('message', function(topic, payload) {

        if (topic.indexOf("hardware/available") ) {
            this.hardware_available = (payload.toString() === 'true');
        }
    });

}

var messaging = new Messaging();

