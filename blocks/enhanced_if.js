// Enhanced IF blocks with else if and else support for ESP32
if (typeof Blockly !== 'undefined' && Blockly.Blocks) {

    // Check if controls_if already exists, if not, we'll use the default one from Blockly
    console.log('Loading enhanced_if.js');
    console.log('Available blocks:', Object.keys(Blockly.Blocks));

    // Simple If-Else-If block (fixed structure)
    Blockly.Blocks['esp32_if_elseif_else'] = {
        init: function () {
            this.appendValueInput("IF0")
                .setCheck("Boolean")
                .appendField("if");
            this.appendStatementInput("DO0")
                .setCheck(null)
                .appendField("do");
            this.appendValueInput("IF1")
                .setCheck("Boolean")
                .appendField("else if");
            this.appendStatementInput("DO1")
                .setCheck(null)
                .appendField("do");
            this.appendStatementInput("ELSE")
                .setCheck(null)
                .appendField("else");
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(210);
            this.setTooltip("If-else if-else statement");
            this.setHelpUrl("");
            this.setInputsInline(false);
        }
    };

    // Multiple If-Else-If block (with 3 conditions)
    Blockly.Blocks['esp32_if_multiple'] = {
        init: function () {
            this.appendValueInput("IF0")
                .setCheck("Boolean")
                .appendField("if");
            this.appendStatementInput("DO0")
                .setCheck(null)
                .appendField("do");
            this.appendValueInput("IF1")
                .setCheck("Boolean")
                .appendField("else if");
            this.appendStatementInput("DO1")
                .setCheck(null)
                .appendField("do");
            this.appendValueInput("IF2")
                .setCheck("Boolean")
                .appendField("else if");
            this.appendStatementInput("DO2")
                .setCheck(null)
                .appendField("do");
            this.appendStatementInput("ELSE")
                .setCheck(null)
                .appendField("else");
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(210);
            this.setTooltip("If with multiple else if conditions and final else");
            this.setHelpUrl("");
        }
    };

    // Very clear If-Else block with different colors
    Blockly.Blocks['esp32_clear_if_else'] = {
        init: function () {
            this.appendValueInput("CONDITION")
                .setCheck("Boolean")
                .appendField("IF");
            this.appendStatementInput("IF_STATEMENTS")
                .setCheck(null)
                .appendField("THEN DO:");
            this.appendStatementInput("ELSE_STATEMENTS")
                .setCheck(null)
                .appendField("ELSE DO:");
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(300); // Different color - orange
            this.setTooltip("Clear if-else block: if condition is true do first part, otherwise do second part");
            this.setHelpUrl("");
            this.setInputsInline(false);
        }
    };

    // Simple and clear If-Else block
    Blockly.Blocks['esp32_simple_if_else'] = {
        init: function () {
            this.appendValueInput("CONDITION")
                .setCheck("Boolean")
                .appendField("🔍 if");
            this.appendStatementInput("IF_DO")
                .setCheck(null)
                .appendField("✅ then do");
            this.appendStatementInput("ELSE_DO")
                .setCheck(null)
                .appendField("❌ else do");
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(210);
            this.setTooltip("Simple if-else: do something if condition is true, otherwise do something else");
            this.setHelpUrl("");
            this.setInputsInline(false);
        }
    };

    // Simple If-Else-If (no final else)
    Blockly.Blocks['esp32_if_elseif'] = {
        init: function () {
            this.appendValueInput("IF0")
                .setCheck("Boolean")
                .appendField("if");
            this.appendStatementInput("DO0")
                .setCheck(null)
                .appendField("do");
            this.appendValueInput("IF1")
                .setCheck("Boolean")
                .appendField("else if");
            this.appendStatementInput("DO1")
                .setCheck(null)
                .appendField("do");
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(210);
            this.setTooltip("If-else if statement");
            this.setHelpUrl("");
        }
    };

    console.log('Enhanced IF blocks loaded successfully');
}
