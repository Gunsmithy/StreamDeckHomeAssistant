// Prototype which represents a binarysensor action
function BinarySensorAction(inContext, inSettings) {
    // Init BinarySensorAction
    var instance = this;

    // Inherit from Action
    Action.call(this, inContext, inSettings);

    this.updateState = function() {
        // Get the settings and the context
        var settings = instance.getSettings();
        var context = instance.getContext();

        // Check if any binarysensor is configured
        if (!('currentSelectedID' in settings)) {
            return;
        }

        var binarySensorState = hassCache.states[settings.currentSelectedID];

        // Set the new action state
        if (binarySensorState) {
            switch(binarySensorState.state) {
                case 'off':
                    setState(context, 0);
                    break;
                case 'on':
                    setState(context, 1);
                    break;
                default:
                    setState(context, 2);
            }
        } else {
            log(`Could not update Stream Deck state for ${settings.currentSelectedID} since its state was not found in the cache.`);
        }
    }

    // Public function for settings the settings
    this.setSettings = function(inContext, inSettings) {
        this.setActionSettings(inContext, inSettings);

        // Update the state
        this.updateState();
    }

    this.setSettings(inContext, inSettings);

    // Public function called on key up event
    this.onKeyUp = async function(inContext, inSettings, inCoordinates, inUserDesiredState, inState) {
        // Check if any binarysensor is configured
        if (!('currentSelectedID' in inSettings)) {
            log('No binary_sensor configured');
            showAlert(inContext);
            return;
        }

        hassCache.states[inSettings.currentSelectedID] = await callRefreshBinarySensor(globalSettings.endpoint, globalSettings.token, inSettings.currentSelectedID);
        this.updateState();
    };
}