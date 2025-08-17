// Custom raw text block: outputs exactly what user types (no surrounding quotes)
if (typeof Blockly !== 'undefined') {
    // Raw text block
    Blockly.Blocks['esp32_text_raw'] = {
        init: function () {
            this.appendDummyInput()
                .appendField('Raw')
                .appendField(new Blockly.FieldTextInput('', null), 'RAW');
            this.setOutput(true, null);
            this.setColour('#27ae60');
            this.setTooltip('Raw string/code (kept exactly, no quotes added)');
            this.setHelpUrl('');
        }
    };

    // Override default text (string literal) block here for easier debugging/customization
    Blockly.Blocks['text'] = {
        init: function () {
            this.appendDummyInput()
                .appendField('String')
                .appendField(new Blockly.FieldTextInput('', null), 'TEXT');
            this.setOutput(true, null);
            this.setColour('#27ae60');
            this.setTooltip('Standard string literal (will be wrapped in \"\")');
            this.setHelpUrl('');
        }
    };
}
