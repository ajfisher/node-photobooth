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

## Remote set up

```
screen
cd ~/node-photobooth
./utils/start_pi.sh
export DISPLAY=:0
chromium-browser --kiosk --app=http://localhost:3000/index.html &
```

You may want a physical or onscreen keyboard to be able to type the email
addresses.

## Acknowledgements:

Icons made by <a href="http://www.flaticon.com/authors/madebyoliver" title="Madebyoliver">Madebyoliver</a> from <a href="http://www.flaticon.com" title="Flaticon">www.flaticon.com</a> is licensed by <a href="http://creativecommons.org/licenses/by/3.0/" title="Creative Commons BY 3.0" target="_blank">CC 3.0 BY</a>
