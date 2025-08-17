// Relay blocks (esp32)
if (typeof Blockly !== 'undefined' && Blockly.Blocks) {
    // Basic ON/OFF
    Blockly.Blocks['esp32_relay_set'] = {
        init: function () {
            this.appendDummyInput()
                .appendField('Relay pin')
                .appendField(new Blockly.FieldTextInput('4', function (t) {
                    const n = parseInt(t); return (!isNaN(n) && n >= 0 && n <= 40) ? t : null;
                }), 'PIN')
                .appendField('state')
                .appendField(new Blockly.FieldDropdown([["ON", "HIGH"], ["OFF", "LOW"]]), 'STATE');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(20);
            this.setTooltip('ON / OFF relay (digitalWrite)');
            this.setHelpUrl('');
        }
    };

    // Blink relay (HIGH then LOW with delays)
    Blockly.Blocks['esp32_relay_blink'] = {
        init: function () {
            this.appendDummyInput()
                .appendField('Blink relay pin')
                .appendField(new Blockly.FieldTextInput('4', function (t) {
                    const n = parseInt(t); return (!isNaN(n) && n >= 0 && n <= 40) ? t : null;
                }), 'PIN');
            this.appendDummyInput()
                .appendField('ON ms')
                .appendField(new Blockly.FieldTextInput('1000', function (t) { const n = parseInt(t); return (!isNaN(n) && n >= 0) ? t : null; }), 'DELAY_ON')
                .appendField('OFF ms')
                .appendField(new Blockly.FieldTextInput('1000', function (t) { const n = parseInt(t); return (!isNaN(n) && n >= 0) ? t : null; }), 'DELAY_OFF');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(20);
            this.setTooltip('Blink relay: HIGH then LOW with ON/OFF timing');
            this.setHelpUrl('');
        }
    };
}
