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