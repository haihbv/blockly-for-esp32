// ESP32 Delay blocks
console.log('Loading delay blocks...');

if (typeof Blockly !== 'undefined' && Blockly.Blocks) {

  Blockly.Blocks['esp32_delay_ms'] = {
    init: function () {
      this.appendDummyInput()
        .appendField("Delay")
        .appendField(new Blockly.FieldTextInput("1000", function (text) {
          // Validate that input is a positive number
          const n = parseInt(text);
          return (!isNaN(n) && n >= 0) ? text : null;
        }), "DELAY")
        .appendField("ms");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(230);
      this.setTooltip("Pause the program for the specified milliseconds");
      this.setHelpUrl("");
    }
  };

  // Value block returning current time in milliseconds (Arduino millis())
  Blockly.Blocks['esp32_millis'] = {
    init: function () {
      this.appendDummyInput().appendField('millis()');
      this.setOutput(true, 'Number');
      this.setColour(230);
      this.setTooltip('Returns milliseconds since the program started');
      this.setHelpUrl('https://www.arduino.cc/reference/en/language/functions/time/millis/');
    }
  };

} else {
  console.error('Blockly not available for delay blocks');
}