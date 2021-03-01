// Protype which represents an action
function Action(inContext, inSettings) {
    // Private variable containing the context of the action
    var context = inContext;

    // Private variable containing the settings of the action
    var settings;

    // Public function for settings the settings
    this.setActionSettings = function(inContext, inSettings) {
        settings = inSettings;
        if (!([inSettings.currentSelectedID, inContext] in hassCache.entityActions)) {
            hassCache.entityActions.push([inSettings.currentSelectedID, inContext]);
        }
    }

    // Public function returning the context
    this.getContext = function() {
        return context;
    };

    // Public function returning the settings
    this.getSettings = function() {
        return settings;
    };

    // Public function to set the defaults
    this.setActionDefaults = function() {
        // Check if any endpoint is configured
        if (!('endpoint' in globalSettings)) {
            log('No endpoint configured.');
            showAlert(inContext);
            return;
        }

        // Check if any token is configured
        if (!('token' in globalSettings)) {
            log('No token configured.');
            showAlert(inContext);
            return;
        }
    }
}