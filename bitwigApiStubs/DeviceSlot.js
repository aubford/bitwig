/* API Version - 2.1.3 */

/**
 * Instances of this interface represent nested FX slots in devices.
 *
 * @since API version 1
 */
function DeviceSlot() {}

DeviceSlot.prototype = new DeviceChain();
DeviceSlot.prototype.constructor = DeviceSlot;