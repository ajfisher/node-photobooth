function webglAvailable() {
	try {
		var canvas = document.getElementById('overlayCanvas');
		return !!( window.WebGLRenderingContext && (
			canvas.getContext( 'webgl' ) ||
			canvas.getContext( 'experimental-webgl' ) )
		);
	} catch ( e ) {
		return false;
	}
}

var camera, scene, renderer, particles, geometry, materials = [],
    parameters, i, h, color, sprite, size;

function three_init() {

    var canv = animationCanvas;
    //clock = new THREE.Clock();
    scene = new THREE.Scene();
    //scene.fog = new THREE.FogExp2( 0x000000, 0.0008 );

    geometry = new THREE.Geometry();

    camera = new THREE.PerspectiveCamera( 75, canv.width / canv.height, 1, 2000 );
    camera.position.z = 1000;

	var textureLoader = new THREE.TextureLoader();

	sprite1 = textureLoader.load( "/static/img/snowflake7_alpha.png" );
	sprite2 = textureLoader.load( "/static/img/snowflake7_alpha.png" );
	sprite3 = textureLoader.load( "/static/img/snowflake7_alpha.png" );
	sprite4 = textureLoader.load( "/static/img/snowflake7_alpha.png" );
	sprite5 = textureLoader.load( "/static/img/snowflake7_alpha.png" );

	for ( i = 0; i < 1000; i ++ ) {

		var vertex = new THREE.Vector3();
		vertex.x = Math.random() * 2000 - 1000;
		vertex.y = Math.random() * 2000 - 1000;
		vertex.z = Math.random() * 2000 - 1000;

		geometry.vertices.push( vertex );
	}

	parameters = [
		[ [1.0, 0.2, 0.5], sprite2, 20 ],
		[ [0.95, 0.1, 0.5], sprite3, 15 ],
		[ [0.90, 0.05, 0.5], sprite1, 10 ],
		[ [0.85, 0, 0.5], sprite5, 8 ],
		[ [0.80, 0, 0.5], sprite4, 5 ]
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
            transparent : true,
            alphaTest: 0.5,
        } );

		materials[i].color.setHSL( color[0], color[1], color[2] );

		particles = new THREE.Points( geometry, materials[i] );

		particles.rotation.x = Math.random() * 6;
		particles.rotation.y = Math.random() * 6;
		particles.rotation.z = Math.random() * 6;

		scene.add( particles );

	}

    renderer = new THREE.WebGLRenderer({canvas: canv, alpha: true});
    renderer.setClearColor( 0x000000, 0);
    renderer.setSize( canv.width, canv.height );

}

function animate() {

    requestAnimationFrame( animate );


	var time = Date.now() * 0.00005;

	for ( i = 0; i < scene.children.length; i ++ ) {
		var object = scene.children[ i ];

		if ( object instanceof THREE.Points ) {
			object.rotation.y = time * ( i < 4 ? i + 1 : - ( i + 1 ) );
		}
	}

	for ( i = 0; i < materials.length; i ++ ) {

		color = parameters[i][0];

		h = ( 360 * ( color[0] + time ) % 360 ) / 360;
		materials[i].color.setHSL( h, color[1], color[2] );
	}

    renderer.render( scene, camera );
}
