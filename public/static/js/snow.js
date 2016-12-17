var camera, scene, renderer, particles, geometry, materials = [],
    parameters, i, h, color, sprite, size;

var half_width, half_height;

var NO_PARTICLES = 20;

function three_init() {

    var canv = animationCanvas;

    // test for webgl support:
    var gl = null;
    try { gl = canv.getContext("webgl"); }
    catch (x) { gl = null; }

    if (gl == null) {
        try { gl = canvas.getContext("experimental-webgl"); }
        catch (x) { gl = null; }
    }

    if (gl == null) {
        SNOW = false; // turn the snow off
        return; // bail out before we try and do anything
    }


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
		[ [0.90, 0.05, 0.5], sprite, 15 ],
		[ [0.85, 0, 0.5], sprite, 24 ],
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
