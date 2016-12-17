// Functions to deal with the various UI handlers etc.

function update_image_list() {
    // updates the lists of images on the right hand side.

    var li = document.createElement('li');

    // create the delete link
    var dl = document.createElement('a');
    dl.setAttribute("onclick", "remove_image(this)");
    dl.innerHTML = "<i class=\"fa fa-times-circle\"></i>";
    li.appendChild(dl);

    // create the image object
    var i = document.createElement('img');
    i.setAttribute('src', data_uri);
    li.appendChild(i);

    document.getElementById('c-results').appendChild(li);
    document.querySelector('#img-controls').classList.remove("hide");
}


function remove_image(el) {
    // remove the image from the results list

    var li = el.parentElement;
    var results_list = li.parentElement;
    results_list.removeChild(li);

    if (document.querySelectorAll("ul#c-results li").length == 0) {
        document.querySelector('#img-controls').classList.add("hide");
    }
}

function clear_all_images() {
    // removes all of the images from the result lists

    Array.prototype.slice.call(document.querySelectorAll("ul#c-results li")).forEach(function(el) {
        el.parentElement.removeChild(el);
    });

    document.querySelector('#img-controls').classList.add("hide");
}

function do_countdown() {
    // do the countdown process

    var countdown_obj = document.getElementById("countdown");
    countdown_obj.classList.remove("shrinktext");
    void countdown_obj.offsetWidth; // trigger reset for animation

    if (countdown == 0) {
        countdown_obj.innerHTML = "";
        countdown = 3;
        take_snapshot();
    } else {
        countdown_obj.innerHTML = countdown;
        if (countdown == 1) {
            // we need to fire the lights off
            setTimeout(fire_lights, 750);
            console.log("lights");
        }
        countdown--;
        countdown_obj.classList.add("shrinktext");
        setTimeout(do_countdown, 900);
    }
}

function fire_lights() {
    // fire a message that the lights will happen

    messaging.client.publish("photobooth/ic/flash", "true");
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

    close_panel();
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
    messagebar.classList.remove('hide');
    messagebar.classList.add('show');
    messagebar.classList.add('fadeout');
    document.getElementById('status').innerHTML = message;

    window.setTimeout(function() {
        messagebar.classList.remove("show");
        messagebar.classList.remove("fadeout");
        messagebar.classList.add("hide");
    }, 4800);
}

