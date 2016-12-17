var inputVideo, animationCanvas, overlayCanvas, octx, outputCanvas, outctx;
var faces, heads;

var SNOW = true;  // turn on particle system
var FACEREC = false; // turn on face detection
var FACE_BOX = false; // turn on face boxes

var propdir = "/static/img/"
var props = {
    hat: {
        file: propdir + "santahat2.svg",
        img: new Image(),
        origin: {
            x: 280, y: 130,
        },
        ref: {
            width: 240,
        },
    },
    elfhat: {
        file: propdir + "elf_hat.svg",
        img: new Image(),
        origin: {
            x: 0, y: 120,
        },
        ref: {
            width: 110,
        },
    },
};

var current_prop = props.elfhat;

var countdown = 3;

function animate() {
    // do the relevant animation steps if needed.

    requestAnimationFrame( animate );

    overlays();

    if (SNOW) {
        particle_animator();
        renderer.render( scene, camera );
    }

}

function overlays() {
    // generate any overlays that are required

    octx.clearRect(0, 0, outputCanvas.width, outputCanvas.height);

    if (FACEREC) {
        if (typeof(heads) !== 'undefined') {
            heads.forEach(function(head) {
                octx.save();
                // translate the context to the specific point where you want
                // to draw the boxes.
                draw_prop(current_prop, head, octx);
                if (FACE_BOX) {
                    draw_face_box(head);
                }

                octx.restore();
            });
        }
    }
}

function draw_prop(prop, head, ctx) {

    // given head and prop, add it to the overlay
    var sf = head.width / prop.ref.width; // determine scale factor based on head size
    var dw = prop.img.width * sf;
    var dh = prop.img.height * sf;
    var dx = head.x - (prop.origin.x * sf);
    var dy = head.y - (prop.origin.y * sf);
    ctx.drawImage(prop.img, dx, dy, dw, dh);

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

    if (SNOW) {
        // we need to render an animation frame to make sure the frame buffer
        // is good then load it into an image and copy that to the canvas context
        animate();
        var img = new Image;
        img.src = renderer.domElement.toDataURL('image/png');;

        img.onload = function() {
            composite_canvases(img);
            update_image_list();
        };
    } else {
        composite_canvases();
        update_image_list();
    }
}

function composite_canvases(render_image) {
    // composites the images together as required
    // render image provided optionally
    outctx.drawImage(inputVideo, 0, 0);
    outctx.drawImage(overlayCanvas, 0, 0, 480, 360, 0, 0, 640, 480);

    if (SNOW) {
        outctx.drawImage(render_image, 0, 0, 480, 360, 0, 0, 640, 480);
    }

    data_uri = outputCanvas.toDataURL("image/jpeg", 1.0);
}


function initiate_video() {
    // sets up the video stream if we need it
    navigator.getUserMedia( {
        video: {
            width: 640, height: 480
        },
    },
    function(stream) {
        inputVideo.srcObject = stream;
        inputVideo.onloadedmetadata = function(e) {
            inputVideo.play();
        };
    },
    function(err) {
        console.log("couldn't initiate video stream");
        console.log(err);
    });

}

function photobooth_init() {
    // run this to initialise various callbacks etc.

    console.log("Setting up with, FACE REC: %s SNOW: %s", FACEREC, SNOW);

    // load the various images in.
    for (var prop in props) {
        if (props.hasOwnProperty(prop)) {

            var p = props[prop];
            p.img.src = p.file;

            p.onLoad = function(i) {
                // add any further handling in here

            }(p.img);
        }
    }

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

    if (FACEREC) {

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
    } else {
        initiate_video();
    }

	// start up the particle system if needed.
    if (SNOW) {
	    three_init();
    }

    // start any animation sequences that are needed
	animate();

}


