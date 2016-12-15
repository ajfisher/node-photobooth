var inputVideo, animationCanvas, overlayCanvas, octx, outputCanvas, outctx, faces;

var camera, scene, renderer, particles, geometry, materials = [],
    parameters, i, h, color, sprite, size;

var half_width, half_height;

var heads;

var NO_PARTICLES = 20;

var countdown = 3;

function three_init() {

    var canv = animationCanvas;
    console.log(canv.width, canv.height);

    half_width = canv.width / 2;
    half_height = canv.height / 2;
    scene = new THREE.Scene();

    geometry = new THREE.Geometry();

    camera = new THREE.PerspectiveCamera( 75, canv.width / canv.height, 1, 2000 );
    camera.position.z = 1000;

	var textureLoader = new THREE.TextureLoader();

	sprite = textureLoader.load( "/static/img/snowflake7_alpha.png" );

	for ( i = 0; i < NO_PARTICLES; i ++ ) {

		var particle = new THREE.Vector3();
		particle.x = (Math.random() * canv.width*2 - canv.width) * 1.25;
		particle.y = (Math.random() * canv.height*2 - canv.height) * 1.25;
		particle.z = (Math.random() * canv.width*2 - canv.width) * 1.25;

		geometry.vertices.push(particle);
	}

	parameters = [
		[ [1.0, 0.2, 0.5], sprite, 7 ],
		[ [0.90, 0.05, 0.5], sprite, 5 ],
		[ [0.85, 0, 0.5], sprite, 15 ],
		[ [0.80, 0, 0.5], sprite, 24 ]
	];

	for ( i = 0; i < parameters.length; i ++ ) {

		color  = parameters[i][0];
		sprite = parameters[i][1];
		size   = parameters[i][2];

		materials[i] = new THREE.PointsMaterial( {
            color: color,
			size: size,
			map: sprite,
            blending: THREE.AdditiveBlending,
            depthTest: false,
            transparent : true
        } );

		materials[i].color.setHSL( color[0], color[1], color[2] );

		particles = new THREE.Points( geometry, materials[i] );

		particles.rotation.x = Math.random() * 1;
		particles.rotation.y = Math.random() * 1;
		particles.rotation.z = Math.random() * 7;

        particles.sortParticles = true;

		scene.add( particles );
	}

    renderer = new THREE.WebGLRenderer({canvas: canv, alpha: true});
    renderer.setClearColor( 0x000000, 0);
    renderer.setSize( canv.width, canv.height );

}

function particle_animator() {
    // deals with all of the particle animations
    //
	var time = Date.now() * 0.00005;

    particles.rotation.y += 0.01;
    particles.rotation.x += 0.05;
    particles.rotation.z += 0.01;

	for ( i = 0; i < scene.children.length; i ++ ) {
    	var object = scene.children[i];

        if ( object instanceof THREE.Points ) {

            object.rotation.y = time * ( i < 4 ? i + 1 : - ( i + 1 ) );
        }
    }
}

function animate() {

    requestAnimationFrame( animate );

    particle_animator();

    overlays();

    renderer.render( scene, camera );
}

function overlays() {
    // generate any overlays

    //draw_face_boxes(head);
    octx.clearRect(0, 0, outputCanvas.width, outputCanvas.height);
    if (typeof(heads) !== 'undefined') {
        heads.forEach(function(head) {
            octx.save();
            // translate the context to the specific point where you want to draw the boxes.
            //octx.translate(head.x, head.y);
            draw_face_box(head);

            octx.restore();
        });
    }
}

function draw_face_box(head) {
    // draws the boxes around the face etc
    // face box
    octx.strokeStyle = "rgba(210,50,240, 0.6)";
    octx.lineWidth = 2;
    octx.strokeRect(head.x, head.y, head.width, head.height);
    octx.fillStyle = "rgba(210, 50, 240, 0.3)";
    octx.fillRect(head.x, head.y, head.width, head.height);
}

function take_snapshot() {

    animate();
    var img = new Image;
    img.src = renderer.domElement.toDataURL('image/png');;

    img.onload = function() {
        outctx.drawImage(inputVideo, 0, 0);
        outctx.drawImage(overlayCanvas, 0, 0, 480, 360, 0, 0, 640, 480);
        outctx.drawImage(img, 0, 0, 480, 360, 0, 0, 640, 480);

        data_uri = outputCanvas.toDataURL("image/jpeg", 1.0);
        var i = document.createElement('img');
        i.setAttribute('src', data_uri);
        document.getElementById('c-results').appendChild(i);
        //document.getElementById('results').innerHTML = '<img src="'+data_uri+'"/>';
    };
}

function do_countdown() {
    // do the countdown process

    var countdown_obj = document.getElementById("countdown");

    if (countdown == 0) {
        countdown_obj.innerHTML = "";
        countdown = 3;
        take_snapshot();
    } else {
        countdown_obj.innerHTML = countdown;
        countdown--;
        setTimeout(do_countdown, 1000);
    }

}

function send_image() {

    var email = document.getElementById("email").value;

    var images = document.querySelectorAll('#c-results img');

    var payload_images = [];

    if (images.length > 0) {
        images.forEach(function(img) {
            payload_images.push(img.src);
        });
    }

    var payload = {
        email: email,
        images: payload_images,
    };

    messaging.client.publish("photobooth/ic/mail", JSON.stringify(payload));
    status_update("Sending photos...");
}

function close_panel() {

    var send_panel = document.getElementById("c-send-panel");
    send_panel.classList.remove("show");
    send_panel.classList.add("hide");
}

function capture_email() {

    var send_panel = document.getElementById("c-send-panel");

    send_panel.classList.add("show");
    send_panel.classList.remove("hide");
}

function status_update(message) {
    // updates the status bar with the current message
    var messagebar = document.getElementById('message');
    messagebar.classList.add('visible');
    document.getElementById('status').innerHTML = message;
}

function photobooth_init() {
    // run this to initialise various callbacks etc.

    // add the status update callback for when we get messages to display them
    messaging.status_notifier(status_update);

	inputVideo = document.getElementById('inputVideo');

	animationCanvas = document.getElementById('animationCanvas');

	overlayCanvas = document.getElementById('overlayCanvas');
	octx = overlayCanvas.getContext('2d');

	outputCanvas = document.getElementById('outputCanvas');
	outctx = outputCanvas.getContext('2d');

	// set the output to be flipped (this makes output like a mirror)
	outctx.translate(outputCanvas.width, 0);
	outctx.scale(-1, 1);

	faces = new tracking.ObjectTracker(['face']);
	faces.setInitialScale(4);
	faces.setStepSize(2);
	faces.setEdgesDensity(0.1);

	faces.on('track', function(event) {
		if (event.data.length === 0) {
			// No objects were detected in this frame.
		} else {
			heads = event.data;
		}
	});

	tracking.track(inputVideo, faces, { camera: true });

	// start up the animation etc.
	three_init();
	animate();

}


