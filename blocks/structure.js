// Logic blocks for ESP32
Blockly.Blocks['esp32_if'] = {
    init: function () {
        this.appendValueInput("CONDITION")
            .setCheck("Boolean")
            .appendField("if");
        this.appendStatementInput("DO")
            .setCheck(null)
            .appendField("do");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(210);
        this.setTooltip("Execute code if condition is true");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['esp32_while'] = {
    init: function () {
        this.appendValueInput("CONDITION")
            .setCheck("Boolean")
            .appendField("while");
        this.appendStatementInput("DO")
            .setCheck(null)
            .appendField("do");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(210);
        this.setTooltip("Repeat code while condition is true");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['esp32_if_else'] = {
    init: function () {
        this.appendValueInput("CONDITION")
            .setCheck("Boolean")
            .appendField("if");
        this.appendStatementInput("DO")
            .setCheck(null)
            .appendField("do");
        this.appendStatementInput("ELSE")
            .setCheck(null)
            .appendField("else");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(210);
        this.setTooltip("Execute code if condition is true, otherwise execute else code");
        this.setHelpUrl("");
    }
};