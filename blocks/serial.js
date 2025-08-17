// ESP32 Serial (UART) blocks
console.log('Loading serial blocks...');

if (typeof Blockly !== 'undefined' && Blockly.Blocks) {

    // Serial begin block
    Blockly.Blocks['esp32_serial_begin'] = {
        init: function () {
            this.appendDummyInput()
                .appendField('Serial begin baud')
                .appendField(new Blockly.FieldDropdown([
                    ['115200', '115200'],
                    ['9600', '9600'],
                    ['57600', '57600'],
                    ['38400', '38400'],
                    ['19200', '19200'],
                    ['4800', '4800'],
                    ['2400', '2400']
                ]), 'BAUD');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(20);
            this.setTooltip('Initialize Serial with selected baud rate');
            this.setHelpUrl('');
        }
    };

    // Serial print block
    Blockly.Blocks['esp32_serial_print'] = {
        init: function () {
            this.appendValueInput('TEXT')
                .setCheck(null)
                .appendField('Serial print');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(20);
            this.setTooltip('Send data to Serial (no newline)');
            this.setHelpUrl('');
        }
    };

    // Serial println block
    Blockly.Blocks['esp32_serial_println'] = {
        init: function () {
            this.appendValueInput('TEXT')
                .setCheck(null)
                .appendField('Serial println');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(20);
            this.setTooltip('Send data to Serial and append newline');
            this.setHelpUrl('');
        }
    };

    // Serial available block (returns number of bytes)
    Blockly.Blocks['esp32_serial_available'] = {
        init: function () {
            this.appendDummyInput()
                .appendField('Serial available');
            this.setOutput(true, 'Number');
            this.setColour(20);
            this.setTooltip('Number of bytes available to read in buffer');
            this.setHelpUrl('');
        }
    };

    // Serial read block
    Blockly.Blocks['esp32_serial_read'] = {
        init: function () {
            this.appendDummyInput()
                .appendField('Serial read');
            this.setOutput(true, 'Number');
            this.setColour(20);
            this.setTooltip('Read one byte from Serial (return -1 if none)');
            this.setHelpUrl('');
        }
    };

} else {
    console.error('Blockly not available for serial blocks');
}
