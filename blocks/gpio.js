// ESP32 GPIO blocks
console.log('Loading GPIO blocks v1.1 (with pinMode)...');

if (typeof Blockly !== 'undefined' && Blockly.Blocks) {
  console.log('Creating GPIO blocks...');

  Blockly.Blocks['esp32_digital_write'] = {
    init: function () {
      this.appendDummyInput()
        .appendField("Digital Write")
        .appendField(new Blockly.FieldTextInput("2", function (text) {
          // Validate that input is a number between 0-40
          const n = parseInt(text);
          return (!isNaN(n) && n >= 0 && n <= 40) ? text : null;
        }), "PIN")
        .appendField("to")
        .appendField(new Blockly.FieldDropdown([["HIGH", "HIGH"], ["LOW", "LOW"]]), "STATE");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(160);
      this.setTooltip("Set a GPIO pin to HIGH or LOW");
      this.setHelpUrl("");
    }
  };

  Blockly.Blocks['esp32_digital_read'] = {
    init: function () {
      this.appendDummyInput()
        .appendField("Digital Read")
        .appendField(new Blockly.FieldTextInput("2", function (text) {
          // Validate that input is a number between 0-40
          const n = parseInt(text);
          return (!isNaN(n) && n >= 0 && n <= 40) ? text : null;
        }), "PIN");
      this.setOutput(true, "Boolean");
      this.setColour(160);
      this.setTooltip("Read the digital state of a GPIO pin");
      this.setHelpUrl("");
    }
  };

  Blockly.Blocks['esp32_analog_read'] = {
    init: function () {
      this.appendDummyInput()
        .appendField("Analog Read")
        .appendField(new Blockly.FieldTextInput("A0", function (text) {
          // Validate that input is a valid analog pin
          if (text.match(/^A\d+$/) || text.match(/^\d+$/)) {
            return text;
          }
          return null;
        }), "PIN");
      this.setOutput(true, "Number");
      this.setColour(160);
      this.setTooltip("Read the analog value from a pin (0-4095)");
      this.setHelpUrl("");
    }
  };

  Blockly.Blocks['esp32_button_read'] = {
    init: function () {
      this.appendDummyInput()
        .appendField("Button on GPIO")
        .appendField(new Blockly.FieldTextInput("0", function (text) {
          // Validate that input is a number between 0-40
          const n = parseInt(text);
          return (!isNaN(n) && n >= 0 && n <= 40) ? text : null;
        }), "PIN")
        .appendField("is pressed");
      this.setOutput(true, "Boolean");
      this.setColour(160);
      this.setTooltip("Check if button is pressed (with internal pullup)");
      this.setHelpUrl("");
    }
  };

  Blockly.Blocks['esp32_high_low'] = {
    init: function () {
      this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([["HIGH", "HIGH"], ["LOW", "LOW"]]), "STATE");
      this.setOutput(true, "Boolean");
      this.setColour(160);
      this.setTooltip("HIGH or LOW constant value");
      this.setHelpUrl("");
    }
  };

  // pinMode configuration block
  Blockly.Blocks['esp32_pin_mode'] = {
    init: function () {
      this.appendDummyInput()
        .appendField("pinMode")
        .appendField(new Blockly.FieldTextInput("2", function (text) {
          const n = parseInt(text);
            return (!isNaN(n) && n >= 0 && n <= 40) ? text : null;
        }), "PIN")
        .appendField("as")
        .appendField(new Blockly.FieldDropdown([
          ["OUTPUT", "OUTPUT"],
          ["INPUT", "INPUT"],
          ["INPUT_PULLUP", "INPUT_PULLUP"],
          ["INPUT_PULLDOWN", "INPUT_PULLDOWN"]
        ]), "MODE");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(160);
      this.setTooltip("Configure a GPIO pin direction/mode");
      this.setHelpUrl("");
    }
  };

} else {
  console.error('Blockly not available for GPIO blocks at first load, will retry on window load');
  // Fallback: wait until window load then try again (rare race or cache issue)
  window.addEventListener('load', function retryRegisterGPIO(){
    if (typeof Blockly !== 'undefined' && Blockly.Blocks && !Blockly.Blocks['esp32_pin_mode']) {
      console.log('[GPIO fallback] Registering pinMode block after load');
      Blockly.Blocks['esp32_pin_mode'] = {
        init: function(){
          this.appendDummyInput()
            .appendField('pinMode')
            .appendField(new Blockly.FieldTextInput('2'), 'PIN')
            .appendField('as')
            .appendField(new Blockly.FieldDropdown([
              ['OUTPUT','OUTPUT'],['INPUT','INPUT'],['INPUT_PULLUP','INPUT_PULLUP'],['INPUT_PULLDOWN','INPUT_PULLDOWN']
            ]), 'MODE');
          this.setPreviousStatement(true,null);
          this.setNextStatement(true,null);
          this.setColour(160);
          this.setTooltip('Configure a GPIO pin direction/mode');
        }
      };
    }
  });
}