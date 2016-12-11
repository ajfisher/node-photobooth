var camera, scene, renderer, particles, geometry, materials = [],
    parameters, i, h, color, sprite, size;

var heads;

var NO_PARTICLES = 200;

function three_init() {

    var canv = animationCanvas;
    //clock = new THREE.Clock();
    scene = new THREE.Scene();
    //scene.fog = new THREE.FogExp2( 0x000000, 0.0008 );

    geometry = new THREE.Geometry();

    camera = new THREE.PerspectiveCamera( 75, canv.width / canv.height, 1, 2000 );
    camera.position.z = 1000;

	var textureLoader = new THREE.TextureLoader();

	sprite = textureLoader.load( "/static/img/snowflake7_alpha.png" );

	for ( i = 0; i < NO_PARTICLES; i ++ ) {

		var particle = new THREE.Vector3();
		particle.x = Math.random() * canv.width*2 - canv.width;
		particle.y = Math.random() * canv.height*2 - canv.height;
		particle.z = Math.random() * canv.width*2 - canv.width;

        particle.velocity = new THREE.Vector3(0, -Math.random(), 0);

		geometry.vertices.push(particle);
	}

	parameters = [
		[ [1.0, 0.2, 0.5], sprite, 7 ],
		[ [0.95, 0.1, 0.5], sprite, 10 ],
		[ [0.90, 0.05, 0.5], sprite, 5 ],
		[ [0.85, 0, 0.5], sprite, 15 ],
		[ [0.80, 0, 0.5], sprite, 24 ]
	];

	for ( i = 0; i < parameters.length; i ++ ) {

		color  = parameters[i][0];
		sprite = parameters[i][1];
		size   = parameters[i][2];

		materials[i] = new THREE.PointsMaterial( {
			size: size,
			map: sprite,
            blending: THREE.AdditiveBlending,
            depthTest: false,
            transparent : true
        } );

		materials[i].color.setHSL( color[0], color[1], color[2] );

		particles = new THREE.Points( geometry, materials[i] );

		//particles.rotation.x = Math.random() * 1;
		//particles.rotation.y = Math.random() * 1;
		//particles.rotation.z = Math.random() * 7;

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

    particles.rotation.y += 0.1;
    particles.rotation.x += 0.1

    /**
	for ( i = 0; i < scene.children.length; i ++ ) {
		var object = scene.children[i];

		if ( object instanceof THREE.Points ) {
			//object.rotation.y = time * ( i < 4 ? i + 1 : - ( i + 1 ) );
		}
	}**/

/**	for ( i = 0; i < materials.length; i ++ ) {

		color = parameters[i][0];
		h = ( 360 * ( color[0] + time ) % 360 ) / 360;
		materials[i].color.setHSL( h, color[1], color[2] );
	}**/
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
    octx.strokeStyle = "rgba(240,210,50, 0.6)";
    octx.lineWidth = 2;
    octx.strokeRect(head.x, head.y, head.width, head.height);
    // head box
    octx.strokeStyle = "rgba(240,210,50, 0.2)";
    octx.lineWidth = 1;
    //octx.strokeRect(head.bounds.l, head.bounds.t, head.bounds.w, head.bounds.h);
}

function take_snapshot() {

    animate();
    //var animFrameDataURI = renderer.domElement.toDataURL('image/png');
    var img = new Image;
    img.src = renderer.domElement.toDataURL('image/png');;

    img.onload = function() {
        outctx.drawImage(inputVideo, 0, 0);
        outctx.drawImage(overlayCanvas, 0, 0);
        outctx.drawImage(img, 0, 0);

        data_uri = outputCanvas.toDataURL("image/jpeg", 1.0);
        document.getElementById('result').innerHTML = '<img src="'+data_uri+'"/>';
    };
}

