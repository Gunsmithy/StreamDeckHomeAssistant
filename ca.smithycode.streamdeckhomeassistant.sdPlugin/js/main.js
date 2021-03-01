// Global web sockets
var websocket = null;
var hassWebsocket = null;

// Global cache
var hassCache = {
    messageId: 1,
    stateSubscriptionMessageId: null,
    services: [],
    states: {},
    entityActions: [], // Array of tuples of [entity_id, context] to search for entity IDs in use and notify of state changes
};

// Global settings
var globalSettings = {
    endpoint: null,
    token: null,
    secure: true,
};

// Global of currently used actions
var actions = {};

// Setup the websocket and handle communication
function connectElgatoStreamDeckSocket(inPort, inPluginUUID, inRegisterEvent, inInfo) {
    // Open the web socket to Stream Deck
    // Use 127.0.0.1 because Windows needs 300ms to resolve localhost
    websocket = new WebSocket('ws://127.0.0.1:' + inPort);

    // Web socket is connected
    websocket.onopen = function() {
        // Register plugin to Stream Deck
        registerPlugin(inRegisterEvent, inPluginUUID);

        log('Registered HASS Plugin with UUID: ' + inPluginUUID);

        // Request the global settings of the plugin
        requestGlobalSettings(inPluginUUID);
    }

    // Websocket received a message
    websocket.onmessage = async function(inEvent) {
        // Parse parameter from string to object
        var jsonObj = JSON.parse(inEvent.data);

        // Extract payload information
        var event = jsonObj['event'];
        var action = jsonObj['action'];
        var context = jsonObj['context'];
        var jsonPayload = jsonObj['payload'];
        var settings;

        // Key up event
        if(event === 'keyUp') {
            // log('Received keyUp message.');
            settings = jsonPayload['settings'];
            var coordinates = jsonPayload['coordinates'];
            var userDesiredState = jsonPayload['userDesiredState'];
            var state = jsonPayload['state'];

            // Send onKeyUp event to actions
            if (context in actions) {
                actions[context].onKeyUp(context, settings, coordinates, userDesiredState, state);
            }
        }
        else if(event === 'willAppear') {
            // log('Received willAppear message.');
            settings = jsonPayload['settings'];

            // Add current instance is not in actions array
            if (!(context in actions)) {
                // Add current instance to array
                if(action === 'ca.smithycode.streamdeckhomeassistant.binary-sensor') {
                    actions[context] = new BinarySensorAction(context, settings);
                } if(action === 'ca.smithycode.streamdeckhomeassistant.call-service') {
                    actions[context] = new CallServiceAction(context, settings);
                } else if(action === 'ca.smithycode.streamdeckhomeassistant.cover') {
                    actions[context] = new CoverAction(context, settings);
                } else if(action === 'ca.smithycode.streamdeckhomeassistant.light') {
                    actions[context] = new LightAction(context, settings);
                } else if(action === 'ca.smithycode.streamdeckhomeassistant.lock') {
                    actions[context] = new LockAction(context, settings);
                } else if(action === 'ca.smithycode.streamdeckhomeassistant.switch') {
                    actions[context] = new SwitchAction(context, settings);
                }
            }
        }
        else if(event === 'willDisappear') {
            // log('Received willDisappear message.');
            // Remove current instance from array
            if (context in actions) {
                delete actions[context];
            }
        }
        else if(event === 'didReceiveGlobalSettings') {
            log('Received didReceiveGlobalSettings message.');

            let willReconnect = false;
            if (jsonPayload.settings.endpoint !== globalSettings.endpoint
                || jsonPayload.settings.token !== globalSettings.token
                || jsonPayload.settings.secure !== globalSettings.secure) {
                    willReconnect = true;
            }

            if (jsonPayload.settings.endpoint !== globalSettings.endpoint) {
                // Resetting state and services cache in case of connecting to a different instance
                hassCache.services = [];
                hassCache.states = {};
            }

            // Update global settings to received payload after comparing with current values
            globalSettings = jsonPayload['settings'];

            if (willReconnect) {
                connectHassWebsocket();
            }

            log(`Calling HASS API for all states.`);
            const states_json = await getAllHassStates(globalSettings.endpoint, globalSettings.token);
            log(`Successfully called HASS API for all states`);

            for (const state of states_json) {
                hassCache.states[state.entity_id] = JSON.parse(JSON.stringify(state));
            }
            log(`Successfully updated full state cache.`);
            // log(`State Cache: ${JSON.stringify(hassCache.states)}`);

            log(`Calling HASS API for all services.`);
            const services_json = await getAllHassServices(globalSettings.endpoint, globalSettings.token);
            log(`Successfully called HASS API for all services`);

            for (const domain of services_json) {
                for (const [service, serviceData] of Object.entries(domain.services)) {
                    hassCache.services.push(`${domain.domain}.${service}`);
                }
            }
            hassCache.services.sort();
            log(`Successfully updated full service cache.`);
            // log(`Services Cache: ${JSON.stringify(hassCache.services)}`);

            // TODO - See if with this and some PI wizardry I can fix re-listing entities when config values change
            // sendToPropertyInspector(action, context, hassCache);
            // log(`Sent updated cache to Property Inspector.`);
        }
        else if(event === 'didReceiveSettings') {
            log('Received didReceiveSettings message.');
            settings = jsonPayload['settings'];

            // Set settings
            if (context in actions) {
                actions[context].setSettings(context, settings);
            }
        }
        else if(event === 'propertyInspectorDidAppear') {
            // log('Received propertyInspectorDidAppear message.');
            // Send cache to PI
            sendToPropertyInspector(action, context, hassCache);
        }
        else if(event === 'sendToPlugin') {
            // log('Received sendToPlugin message.');
        }
    };
}

function connectHassWebsocket() {
    // Close the websocket if it is already open since this call should only be invoked when the endpoint, token or secure flag changes
    if (hassWebsocket && (hassWebsocket.readyState === WebSocket.OPENING || hassWebsocket.readyState === WebSocket.OPEN)) {
        hassWebsocket.close();
    }

    // Create the new websocket if it doesn't exist or if it exists and is still in the process of closing or has already closed
    if (!hassWebsocket || hassWebsocket.readyState === WebSocket.CLOSING || hassWebsocket.readyState === WebSocket.CLOSED) {
        if (globalSettings.secure === false) {
            hassWebsocket = new WebSocket(`ws://${globalSettings.endpoint}/api/websocket`);
        } else {
            hassWebsocket = new WebSocket(`wss://${globalSettings.endpoint}/api/websocket`);
        }
    }

    // Websocket is connected
    hassWebsocket.onopen = function() {
        log('Home Assistant websocket is open.');
    }

    // Websocket is disconnected
    hassWebsocket.onclose = function() {
        log('Home Assistant websocket is closed.');
    }

    // Websocket error logging
    hassWebsocket.onerror = function(error) {
        log(`Home Assistant websocket error occurred: ${JSON.stringify(error)}`);
    }

    // Websocket received a message
    hassWebsocket.onmessage = function(inEvent) {
        var jsonObj = JSON.parse(inEvent.data);
        var messageType = jsonObj['type'];

        if(messageType === 'auth_required') {
            log('Received Home Assistant auth_required message.');
            if (hassWebsocket) {
                var auth_message = {
                    'type': 'auth',
                    'access_token': globalSettings.token
                };

                hassWebsocket.send(JSON.stringify(auth_message));
            }
            log('Sent Home Assistant auth message.');
        }
        else if(messageType === 'auth_ok') {
            log('Received Home Assistant auth_ok message.');
            if (hassWebsocket) {
                hassCache.stateSubscriptionMessageId = hassCache.messageId++;
                var subscribe_states_message = {
                    'id': hassCache.stateSubscriptionMessageId,
                    'type': 'subscribe_events',
                    'event_type': 'state_changed',
                }
                hassWebsocket.send(JSON.stringify(subscribe_states_message));
                log(`Sent Home Assistant subscribe_events message.`);
            }
        }
        else if (messageType === 'result') {
            if (jsonObj.id === hassCache.stateSubscriptionMessageId) {
                log(`Received result for Home Assistant subscribe_events message.`);
                if (jsonObj.success === true) {
                    log(`Successfully subscribed to Home Assistant state changes.`);
                } else {
                    log(`Home Assistant subscribe_events response was unsuccessful: ${JSON.stringify(jsonObj)}`);
                }
            } else {
                log(`Unknown Home Assistant result with id: ${jsonObj.id}`);
            }
        }
        else if (messageType === 'event') {
            if (jsonObj.id === hassCache.stateSubscriptionMessageId) {
                // log(`Received new event for state_changed subscription.`);
                if (jsonObj.event.event_type === 'state_changed') {
                    hassCache.states[jsonObj.event.data.entity_id] = jsonObj.event.data.new_state;
                    for (const entityActionTuple of hassCache.entityActions) {
                        if (entityActionTuple[0] === jsonObj.event.data.entity_id) {
                            actions[entityActionTuple[1]].updateState();
                        }
                    }
                    // log(`New state: ${JSON.stringify(jsonObj.event.data.new_state)}`);
                } else {
                    log(`Home Assistant Event was somehow not a state_changed event: ${JSON.stringify(jsonObj)}`);
                }
            } else {
                log(`Unknown Home Assistant event with id: ${jsonObj.id}`);
            }
        }
        else if(messageType === 'auth_invalid') {
            log('Received Home Assistant auth_invalid message: ' + jsonObj.message);
        }
        else {
            log(`Received unknown Home Assistant messageType: ${messageType}`);
        }
    };
}