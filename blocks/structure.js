// Logic blocks for ESP32 - IF BLOCKS REMOVED

Blockly.Blocks['esp32_while'] = {
    init: function () {
        this.appendValueInput("CONDITION")
            .setCheck("Boolean")
            .appendField("WHILE");
        this.appendStatementInput("DO")
            .setCheck(null)
            .appendField("DO");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(230);
        this.setTooltip("Repeat code while condition is true");
        this.setHelpUrl("");
    }
};

// ===== Setup & Loop blocks (Arduino style) =====
// Setup block: top-level only (no previous/next connections)
Blockly.Blocks['esp32_setup'] = {
    init: function () {
        this.appendDummyInput().appendField('setup');
        this.appendStatementInput('DO').setCheck(null).appendField('do');
        this.setColour(300);
        this.setTooltip('Code here goes into setup() (runs once at boot)');
        this.setHelpUrl('');
    },
    // Ngăn không cho block khác nối phía trước / sau
    onchange: function () {
        if (this.previousConnection) this.previousConnection.disconnect();
        if (this.nextConnection) this.nextConnection.disconnect();
    }
};

// Loop block: generates code inside loop()
Blockly.Blocks['esp32_loop'] = {
    init: function () {
        this.appendDummyInput().appendField('loop');
        this.appendStatementInput('DO').setCheck(null).appendField('repeat');
        this.setColour(300);
        this.setTooltip('Code here goes into loop() (repeats forever)');
        this.setHelpUrl('');
    },
    onchange: function () {
        if (this.previousConnection) this.previousConnection.disconnect();
        if (this.nextConnection) this.nextConnection.disconnect();
    }
};