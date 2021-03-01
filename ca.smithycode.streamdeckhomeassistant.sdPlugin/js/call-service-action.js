// Prototype which represents a callservice action
function CallServiceAction(inContext, inSettings) {
    // Init CallServiceAction
    var instance = this;

    // Inherit from Action
    Action.call(this, inContext, inSettings);

    // Public function for settings the settings
    this.setSettings = function(inContext, inSettings) {
        this.setActionSettings(inContext, inSettings);
    }

    this.setSettings(inContext, inSettings);

    // Public function called on key up event
    this.onKeyUp = async function(inContext, inSettings, inCoordinates, inUserDesiredState, inState) {
        // Check if any service is configured
        if (!('currentSelectedID' in inSettings)) {
            log('No service configured');
            showAlert(inContext);
            return;
        }

        callService(globalSettings.endpoint, globalSettings.token, inSettings.currentSelectedID, inSettings.payload);
    };
}