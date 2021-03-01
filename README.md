# StreamDeckHomeAssistant
Unofficial Elgato Stream Deck plugin for simple control of Home Assistant devices, entities and services.

## Installation
If you're at this repo, you're probably installing the plugin manually instead of through the store.  
Luckily, that's still pretty easy to do! You just don't get automatic updates.  

To install or update the plugin, simply pop on over to the [Releases tab](https://github.com/Gunsmithy/StreamDeckHomeAssistant/releases) and download the latest `*.streamDeckPlugin` file.  
All you have to do is run it and Stream Deck should launch, asking if you want to install.  

## Configuration
The most important setup to be done is on your Home Assistant Instance.  
You need to enable the [API Integration](https://www.home-assistant.io/integrations/api/) which also depends on the [HTTP Integration](https://www.home-assistant.io/integrations/http/).  
Myself and the Home Assistant team both strongly recommend that you [secure your instance](https://www.home-assistant.io/docs/configuration/securing/) when exposing APIs like this, even locally.  
As it stands right now though, the plugin will connect to secure or insecure Home Assistant instances using a toggle during your Stream Deck setup.  
Once the API is configured, secure or otherwise, you need a Long-Lived Access Token which can be retrieved from your [Profile page](https://www.home-assistant.io/docs/authentication/#your-account-profile).  

After all that, just create any action button on your Stream Deck and provide the Hostname/IP with the Port on which the API is accesible, check the appropriate Secure button, enter your Token, and you will be ready to go!  
Any change to the Endpoint, Secure button, or Token should result in a reconnect of the websocket/listing of entities again, just make sure to click away from the current field after typing/pasting your values.

![Switch Setup GIF](/../resources/gifs/switch_setup.gif?raw=true "Switch Setup")

## Features
1. Websocket API to ensure immediate state updates on your Stream Deck once Home Assistant detects them.
2. Automatic listing of supported entities in Home Assistant for easy button setup.
3. Call Service action with configurable JSON payload for any actions not natively supported by the plugin.

## Supported Entities/Actions
#### Binary Sensor
![Binary Sensor Off Icon](/ca.smithycode.streamdeckhomeassistant.sdPlugin/images/binarySensorOffIcon.png?raw=true "Binary Sensor Off") ![Binary Sensor On Icon](/ca.smithycode.streamdeckhomeassistant.sdPlugin/images/binarySensorOnIcon.png?raw=true "Binary Sensor On")
Show the status of a Binary Sensor and manually refreshing on press if you're the untrusting sort.

#### Cover
![Cover Open Icon](/ca.smithycode.streamdeckhomeassistant.sdPlugin/images/coverOpenIcon.png?raw=true "Cover Open") ![Cover Closed Icon](/ca.smithycode.streamdeckhomeassistant.sdPlugin/images/coverClosedIcon.png?raw=true "Cover Closed")
Show the status of a Cover and toggle it between open/closed on press.

#### Light
![Light Off Icon](/ca.smithycode.streamdeckhomeassistant.sdPlugin/images/lightOffIcon.png?raw=true "Light Off") ![Light On Icon](/ca.smithycode.streamdeckhomeassistant.sdPlugin/images/lightOnIcon.png?raw=true "Light On")
Show the status of a Light and toggle it between off/on on press.
Does not currently support scene/brightness/colour changes.

#### Lock
![Lock Unlocked Icon](/ca.smithycode.streamdeckhomeassistant.sdPlugin/images/lockUnlockedIcon.png?raw=true "Light Unlocked") ![Lock Locked Icon](/ca.smithycode.streamdeckhomeassistant.sdPlugin/images/lockLockedIcon.png?raw=true "Lock Locked")
Show the status of a Lock and toggle it between unlocked/locked on press.  
Does not currently support locks with codes.

#### Switch
![Switch Off Icon](/ca.smithycode.streamdeckhomeassistant.sdPlugin/images/switchOffIcon.png?raw=true "Switch Off") ![Switch On Icon](/ca.smithycode.streamdeckhomeassistant.sdPlugin/images/switchOnIcon.png?raw=true "Switch On")
Show the status of a Switch and toggle it off/on on press.

#### Call Service
![Call Service Icon](/ca.smithycode.streamdeckhomeassistant.sdPlugin/images/callServiceIcon.png?raw=true "Call Service")
For anything not supported above, you can use the Call Service action!  
The action will list all services much like the [Home Assistant Developer Tools tab](https://www.home-assistant.io/docs/tools/dev-tools/#services).  
You can then select a service and specify an arbitrary JSON payload to send upon pressing the button.

## Limitations
The main limitations with this plugin would probably be in terms of error handling and stability.  
Right now the Websocket connection which is used to get state updates is instantiated when the plugin/Stream Deck application launches, or you change any of the configuration values.  
Should the Websocket lose connection for any reason, such as temporary loss of connectivity on your computer or a reboot of Home Assistant, the Websocket will likely need to be restarted.  
Either restart Stream Deck application or just toggle Secure from No back to Yes or vice versa and that should fix it.  

Furthermore, the supported entities are basic, just supporting toggle functionality and no additional attributes.  
That being said, the `Call Service` action exists to hopefully bridge the gap for any missing niche functionality.  

This project was thrown together over a weekend using some of the provided sample code from Elgato.  
I'm also much more used to Python and Typescript development than Javascript, so code quality is a little lacking and I may migrate this project to Typescript given the time.  

## Contribute!
We're all busy people, but I love Home Assistant and the Stream Deck for niche little use cases like this, so I will try to work on this project as often as I can.  

If you find any bugs or have any suggestions, check out the [Issues tab](https://github.com/Gunsmithy/StreamDeckHomeAssistant/issues) to see if someone else has already submitted it, and submit it yourself if not.  
When doing so, if you are so inclined, 

If so inclined, you're welcome to Fork the repo and submit any pull requests you desire and I will review them as soon as I can. As specified in the limitations, code quality isn't particularly stellar anyways, so there's a good chance it will be pretty frictionless to merge. :)  

Lastly, I'm not strapped for cash or anything, but a little beer money always goes a long way too. ;)  

[![paypal](https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif)](https://www.paypal.com/donate?hosted_button_id=JCMTKUVQRLHQY)
