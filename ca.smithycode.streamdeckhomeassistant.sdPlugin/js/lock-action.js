// Prototype which represents a lock action
function LockAction(inContext, inSettings) {
    // Init LockAction
    var instance = this;

    // Inherit from Action
    Action.call(this, inContext, inSettings);

    this.updateState = function() {
        // Get the settings and the context
        var settings = instance.getSettings();
        var context = instance.getContext();

        // Check if any lock is configured
        if (!('currentSelectedID' in settings)) {
            return;
        }

        var lockState = hassCache.states[settings.currentSelectedID];

        // Set the new action state
        if (lockState) {
            switch(lockState.state) {
                case 'unlocked':
                    setState(context, 0);
                    break;
                case 'locked':
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
        // Check if any lock is configured
        if (!('currentSelectedID' in inSettings)) {
            log('No lock configured');
            showAlert(inContext);
            return;
        }

        var settings = instance.getSettings();
        var lockState = hassCache.states[settings.currentSelectedID];
        if (lockState.state === 'locked') {
            callLockUnlock(globalSettings.endpoint, globalSettings.token, inSettings.currentSelectedID);
        } else {
            callLockLock(globalSettings.endpoint, globalSettings.token, inSettings.currentSelectedID);
        }
    };
}