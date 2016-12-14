// Use this to deal with all the messaging requirements.
//
//


function Messaging() {

/**    this.server = "mqtt://localhost:1883";

    this.client = mqtt.connect(this.server);

    console.log(this.client);
    this.client.subscribe("hardware/#");


    this.client.on('message', function(topic, payload) {
        console.log(topic, payload);
    });

    this.client.publish("hardware/test", "This is a test");
**/
}


var messaging = new Messaging();
