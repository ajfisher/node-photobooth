# node-photobooth
Photo booth using node, web and RPi

## Install

Clone this repo and then:

```
npm install
```

In addition ensure you have chromium on the raspberry pi

Uncomment this line from /etc/apt/sources.list

```
deb-src http://archive.raspbian.org/raspbian/ jessie main contrib non-free rpi
```

Run `apt-get update` and then you should be able to apt-get install
chromium-browser

## Launch

cd to project folder

Each of the modules can be launched individually

```
node index.js
```

Will launch the MQTT and app server and provide the web server.

Point a browser at http://localhost:3000/index.html to view

```
node mailer.js
```

Will launch the mail system to be able to email to the user. Note you will need
to put username and password details in the config.js file.

```
node leds.js
```

Will expose Node Pixel LEDS to the system to be able to create a flash.
