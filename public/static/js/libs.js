var inputVideo, animationCanvas, overlayCanvas, octx, outputCanvas, outctx;
var faces, heads;

var SNOW = false;  // turn on particle system
var FACEREC = false; // turn on face detection
var FACE_BOX = false; // turn on face boxes

var propdir = "/static/img/"

// locs is an array of locations to put clones of the image
// each element in array is an object that provides an x and y location
// to move it to that is a proportion of the container size and either a
// reference height or width to scale things according to the container size
// eg a height of 0.25 would mean 0.25 x container height which would be
// determined and then the actual height of the asset scaled accordingly.
var props = {
    tree: {
        active: false,
        file: propdir + "tree.svg",
        img: new Image(),
        origin: {
            x: 0.5, y: 1.0
        },
        locs: [
        {
            x: 0.5, y: 1.0,
            h: 0.65,
        },
        ],
    },
    mistletoe: {
        active: false,
        file: propdir + "mistletoe.svg",
        img: new Image(),
        origin: {
            x: 0.5, y: 0.0,
        },
        locs: [
        {
            x: 0.5, y: 0.0,
            h: 0.25,
        },
        ],
    },
    sleigh: {
        active: false,
        file: propdir + "sleigh.svg",
        img: new Image(),
        origin: {
            x: 0.5, y: 0.85
        },
        locs: [
        {
            x: 0.5, y: 1.0,
            h: 0.75,
        },
        ],
    },
    present: {
        active: false,
        file: propdir + "present.svg",
        img: new Image(),
        origin: {
            x: 0.5, y: 0.95
        },
        locs: [
        {
            x: 0.35, y: 1.0,
            h: 0.15,
        },
        {
            x: 0.65, y: 1.0,
            h: 0.10,
        },
        {
            x: 0.58, y: 1.0,
            h: 0.08,
        },
        ],
    },
    wreath: {
        active: false,
        file: propdir + "wreath.svg",
        img: new Image(),
        origin: {
            x: 0.5, y: 0.5,
        },
        locs: [
        {
            x: 0.5, y: 0.5,
            h: 0.90,
        },
        ],
    },
    stocking: {
        active: true,
        file: propdir + "stocking.svg",
        img: new Image(),
        origin: {
            x: 0.5, y: 0.0,
        },
        locs: [
        {
            x: 0.10, y: 0.20,
            h: 0.25,
        },
        {
            x: 0.24, y: 0.22,
            h: 0.25,
        },
        ],
    },
};

var current_prop = props.wreath;
//var current_prop = props.tree;

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

    octx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

    for (var prop in props) {
        if (props.hasOwnProperty(prop)) {
            if (props[prop].active) {
                draw_prop(props[prop], octx, overlayCanvas);
            }
        }
    }

    if (FACEREC) {
        if (typeof(heads) !== 'undefined') {
            heads.forEach(function(head) {
                octx.save();
                // translate the context to the specific point where you want
                // to draw the boxes.
                draw_head_prop(current_prop, head, octx);
                if (FACE_BOX) {
                    draw_face_box(head);
                }

                octx.restore();
            });
        }
    }
}

function draw_prop(prop, ctx, canv) {
    // draw a static prop to the context

    canv_h = canv.height;
    canv_w = canv.width;

    prop_h = prop.img.height;
    prop_w = prop.img.width;

    prop.locs.forEach(function(loc) {
        // go through each location that the prop needs to be put and
        // then scale / place it appropriately.
        var sf = 1.0;
        if (typeof(loc.h) != "undefined") {
            //scale by height
            sf = (loc.h * canv_h) / prop_h;
        } else if (typof(loc.w) != "undefined") {
            // scale by width
            sf = (loc.w * canv_w) / prop_w;
        }

        var dw = prop.img.width * sf;
        var dh = prop.img.height * sf;
        var dx = (canv_w * loc.x) - (prop.origin.x * dw);
        var dy = (canv_h * loc.y) - (prop.origin.y * dh);

        //console.log(canv_h, prop.img.height, prop.img.height * sf, sf, dy, dh, (prop.origin.y * sf));
        ctx.drawImage(prop.img, dx, dy, dw, dh);

    });

}

function draw_head_prop(prop, head, ctx) {

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
    window.navigator.getUserMedia( {
        /**video: {
            width: 640, height: 480
        },**/
	video: true,
    },
    function(stream) {
	try {
            inputVideo.src = window.URL.createObjectURL(stream);
        } catch (err) {
            inputVideo.src = stream;
        }
        /**inputVideo.onloadedmetadata = function(e) {
            inputVideo.play();
        };**/
    },
    function(err) {
        console.log("couldn't initiate video stream");
        console.log(err);
    });

}

function photobooth_init() {
    // run this to initialise various callbacks etc.

    console.log("Setting up with, FACE REC: %s SNOW: %s", FACEREC, SNOW);

    var prop_holder = document.getElementById("prop-holder");
    // load the various images in.
    for (var prop in props) {
        if (props.hasOwnProperty(prop)) {

            var p = props[prop];
            p.img.src = p.file;

            p.onLoad = function(img) {
                // add any further handling in here
                
                var li = document.createElement("li");
                var i = document.createElement("img");
                i.setAttribute('onclick', 'toggle_prop("' + prop + '")');
                i.setAttribute('src', img.src);
                i.setAttribute('class', 'off');
                i.setAttribute('id', prop);

                li.appendChild(i);
                prop_holder.appendChild(li);
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


