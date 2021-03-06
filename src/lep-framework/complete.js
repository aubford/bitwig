/**
 * Loads all lep-framework files in the right order.
 *
 * Author: Lennart Pegel - https://github.com/justlep
 * License: MIT (http://www.opensource.org/licenses/mit-license.php)
 */

// dirt alert: found no cleaner way to let IntelliJ know global `host` is an instance of ControllerHost, not Host :-/
/** @typedef {ControllerHost} Host */

var lep = {};

load('../lib/knockout-stripped.js');

load('util/log.js');
load('util/util.js');
load('util/ko-extensions.js');
load('util/ScrollableView.js');

load('midi/MidiEventDispatcher.js');
load('midi/MidiFlushDispatcher.js');

load('control/BaseControl.js');
load('control/ClickEncoder.js');
load('control/Encoder.js');
load('control/Fader.js');
load('control/Button.js');
load('control/ControlSet.js');

load('value/BaseValue.js');
load('value/StandardRangedValue.js');
load('value/ValueSet.js');
load('value/ParamsValueSet.js');
load('value/SendsValueSet.js');
load('value/SelectedTrackSendsValueSet.js');
load('value/ToggledValue.js');
load('value/ChannelSelectValue.js');
load('value/ToggledTransportValue.js');
load('value/KnockoutSyncedValue.js');

load('view/SelectedTrackView.js');
load('view/TracksView.js');
load('view/LauncherSlot.js');
load('view/MatrixView.js');
load('util/VolumeMeter.js');
