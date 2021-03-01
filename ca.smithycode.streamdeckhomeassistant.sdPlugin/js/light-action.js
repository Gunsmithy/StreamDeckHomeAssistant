// Prototype which represents a light action
function LightAction(inContext, inSettings) {
    // Init LightAction
    var instance = this;

    // Inherit from Action
    Action.call(this, inContext, inSettings);

    this.updateState = function() {
        // Get the settings and the context
        var settings = instance.getSettings();
        var context = instance.getContext();

        // Check if any light is configured
        if (!('currentSelectedID' in settings)) {
            return;
        }

        var lightState = hassCache.states[settings.currentSelectedID];

        // Set the new action state
        if (lightState) {
            switch(lightState.state) {
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
    this.onKeyUp = function(inContext, inSettings, inCoordinates, inUserDesiredState, inState) {
        // Check if any switch is configured
        if (!('currentSelectedID' in inSettings)) {
            log('No light configured');
            showAlert(inContext);
            return;
        }

        callToggleLight(globalSettings.endpoint, globalSettings.token, inSettings.currentSelectedID);
    };
}