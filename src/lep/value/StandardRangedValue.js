/**
 * Author: Lennart Pegel - https://github.com/justlep
 * License: MIT (http://www.opensource.org/licenses/mit-license.php)
 *
 * @constructor
 */
lep.StandardRangedValue = lep.util.extendClass(lep.BaseValue, {

    _init: function(opts) {
        this._super(opts);

        var self = this;

        lep.util.assertObject(opts.rangedValue, 'Missing rangedValue for {}', opts.name);
        this.rangedValue = opts.rangedValue;
        this.indicateableValue = opts.indicateableValue || opts.rangedValue;
        lep.util.assertFunction(this.indicateableValue.setIndication, 'Invalid indicateableValue for {}', this.name);
        this._takeover = null;

        this.rangedValue.addValueObserver(128, function(newValue) {
            // lep.logDebug('{} -> rangedValue observer fired with newValue: {}', self.name, newValue);
            self.value = newValue;

            var takeover = self._takeover;
            if (takeover && takeover.isSynced) {
                if (takeover.recentSyncedValues[newValue]) {
                    takeover.recentSyncedValues[newValue] = 0;
                } else {
                    // lep.logDebug('{} -> went OFF SYNC -> newValue: {}', self.name, newValue);
                    takeover.isSynced = null;
                    takeover.recentSyncedValues = {};
                }
            }
            self.syncToController();
        });

        lep.StandardRangedValue._instances.push(this);
    },

    /**
     * Set the value of this SRV manually (i.e. programmatically instead of MIDI-value-received or observer event)
     */
    setValue: function(value, optionalRange) {
        this.rangedValue.set(value, optionalRange || 128);
    },
    setTakeoverEnabled: function(isEnabled) {
        this._takeover = isEnabled ? (this._takeover || {
            isSynced: null, // null := not synced && no takeover range defined;  false := not synced, but range defined
            minValue: null,
            maxValue: null,
            recentSyncedValues: {}
        }) : null;
    },
    /** @Override */
    setIndication: function(on) {
        // lep.logDebug('setIndications({}) for {}', on, this.name);
        this.indicateableValue.setIndication(on);
    },
    /** @Override */
    onRelativeValueReceived: function(delta, range) {
        if (this._takeover) {
            this.setTakeoverEnabled(false);
        }
        this.rangedValue.inc(delta, range);
    },
    /** @Override */
    onAbsoluteValueReceived: function(absoluteValue, isTakeoverAdvised) {
        // lep.logDebug('{} -> onAbsoluteValueReceived({}, {})', this.name, absoluteValue, isTakeoverAdvised);
        var takeover = this._takeover,
            takeoverDirectionMsg;

        if (takeover && isTakeoverAdvised) {
            if (!takeover.isSynced) {
                if (takeover.isSynced === null) {
                    if (absoluteValue < this.value) {
                        takeover.minValue = this.value;
                        takeover.maxValue = 127;
                        takeoverDirectionMsg = 'Takeover ↑↑';
                    } else {
                        takeover.minValue = 0;
                        takeover.maxValue = this.value;
                        takeoverDirectionMsg = 'Takeover ↓↓';
                    }
                    host.showPopupNotification(takeoverDirectionMsg);
                }
                takeover.isSynced = (absoluteValue >= takeover.minValue) && (absoluteValue <= takeover.maxValue);
                if (!takeover.isSynced) {
                    // lep.logDebug('{} -> rejected takeover: {} <> [{}-{}]', this.name, absoluteValue, takeover.minValue, takeover.maxValue);
                    return;
                }
                // lep.logDebug('{} -> takeover SUCCESS', this.name);
            }
            takeover.recentSyncedValues[absoluteValue] = 1;
        }
        this.rangedValue.set(absoluteValue, 128);
    }
});

/** @static */
lep.StandardRangedValue._instances = [];

/** @static */
lep.StandardRangedValue.globalTakeoverEnabled = (function(_enabledObs, _allInstances) {
    return ko.computed({
        read: _enabledObs,
        write: function(newIsEnabled) {
            for (var i = _allInstances.length - 1; i >= 0; i--) {
                _allInstances[i].setTakeoverEnabled(newIsEnabled);
            }
            _enabledObs(newIsEnabled);
            host.showPopupNotification('Takeover ' + (newIsEnabled ? 'enabled' : 'disabled'));
        }
    }).extend({toggleable: true});
})(ko.observable(false), lep.StandardRangedValue._instances);


/** @static */
lep.StandardRangedValue.createVolumeValue = function(channelBank, channelIndex) {
    lep.util.assertObject(channelBank, 'Invalid channelBank for StandardRangedValue.createVolumeValue');
    lep.util.assertNumber(channelIndex, 'Invalid channelIndex for StandardRangedValue.createVolumeValue');
    return new lep.StandardRangedValue({
        name: lep.util.formatString('Vol{}', channelIndex),
        rangedValue: channelBank.getChannel(channelIndex).getVolume()
    });
};

/** @static */
lep.StandardRangedValue.createPanValue = function(channelBank, channelIndex) {
    lep.util.assertObject(channelBank, 'Invalid channelBank for StandardRangedValue.createPanValue');
    lep.util.assertNumber(channelIndex, 'Invalid channelIndex for StandardRangedValue.createPanValue');
    return new lep.StandardRangedValue({
        name: lep.util.formatString('Pan{}', channelIndex),
        rangedValue: channelBank.getChannel(channelIndex).getPan()
    });
};

/** @static */
lep.StandardRangedValue.createSendValue = function(channelBank, channelIndex, sendIndex) {
    lep.util.assertObject(channelBank, 'Invalid channelBank for StandardRangedValue.createSendValue');
    lep.util.assertNumber(channelIndex, 'Invalid channelIndex for StandardRangedValue.createSendValue');
    lep.util.assertNumber(sendIndex, 'Invalid sendIndex for StandardRangedValue.createSendValue');
    return new lep.StandardRangedValue({
        name: lep.util.formatString('Send{}/CH{}', sendIndex, channelIndex),
        rangedValue: channelBank.getChannel(channelIndex).getSend(sendIndex)
    });
};

/**
 * @deprecated
 * @static
 **/
lep.StandardRangedValue.createParamValue = function(cursorDevice, paramIndex) {
    lep.util.assertObject(cursorDevice, 'Invalid cursorDevice for StandardRangedValue.createParamValue');
    lep.util.assertNumber(paramIndex, 'Invalid paramIndex for StandardRangedValue.createParamValue');
    return new lep.StandardRangedValue({
        name: lep.util.formatString('Param{}', paramIndex),
        rangedValue: cursorDevice.getParameter(paramIndex)
    });
};

/** @static **/
lep.StandardRangedValue.createRemoteControlValue = function(remoteControlsPage, paramIndex) {
    lep.util.assertObject(remoteControlsPage, 'Invalid remoteControlsPage for StandardRangedValue.createRemoteControlValue');
    lep.util.assertNumber(paramIndex, 'Invalid paramIndex for StandardRangedValue.createRemoteControlValue');
    return new lep.StandardRangedValue({
        name: lep.util.formatString('Param{}', paramIndex),
        rangedValue: remoteControlsPage.getParameter(paramIndex)
    });
};

/**
 * @static
 *
 * TODO: in Bitwig 2 these values do show NO indication marker + do not get any feedback from the daw
 **/
lep.StandardRangedValue.createUserControlValue = function(userControlBank, controlIndex, label) {
    lep.util.assertObject(userControlBank, 'Invalid userControlBank for StandardRangedValue.createUserControlValue');
    lep.util.assertNumberInRange(controlIndex, 0, 127, 'Invalid controlIndex for StandardRangedValue.createUserControlValue');
    lep.util.assertString(label, 'Invalid label for StandardRangedValue.createUserControlValue');

    var userControl = userControlBank.getControl(controlIndex);
    userControl.setLabel(label);

    return new lep.StandardRangedValue({
        name: label,
        rangedValue: userControl.value(),
        indicateableValue: userControl
    });
};
