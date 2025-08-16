// Arduino code generator for ESP32 Blockly
console.log('Loading Arduino generator...');

// Ensure Blockly is available
if (typeof Blockly === 'undefined') {
  console.error('Blockly not available for generator');
} else {
  console.log('Blockly available, setting up Arduino generator...');

  // Initialize Arduino generator
  if (!Blockly.Arduino) {
    Blockly.Arduino = new Blockly.Generator('Arduino');
    console.log('Arduino generator created');
  }
}
Blockly.Arduino.addReservedWords('setup,loop,pinMode,digitalWrite,delay');

// Define operator precedence
Blockly.Arduino.ORDER_ATOMIC = 0;         // 0 "" ...
Blockly.Arduino.ORDER_NEW = 1.1;          // new
Blockly.Arduino.ORDER_MEMBER = 1.2;       // . []
Blockly.Arduino.ORDER_FUNCTION_CALL = 2;  // ()
Blockly.Arduino.ORDER_INCREMENT = 3;      // ++
Blockly.Arduino.ORDER_DECREMENT = 3;      // --
Blockly.Arduino.ORDER_BITWISE_NOT = 4.1;  // ~
Blockly.Arduino.ORDER_UNARY_PLUS = 4.2;   // +
Blockly.Arduino.ORDER_UNARY_MINUS = 4.3;  // -
Blockly.Arduino.ORDER_LOGICAL_NOT = 4.4;  // !
Blockly.Arduino.ORDER_TYPEOF = 4.5;       // typeof
Blockly.Arduino.ORDER_VOID = 4.6;         // void
Blockly.Arduino.ORDER_DELETE = 4.7;       // delete
Blockly.Arduino.ORDER_AWAIT = 4.8;        // await
Blockly.Arduino.ORDER_EXPONENTIATION = 5.0;
Blockly.Arduino.ORDER_MULTIPLICATION = 5.1;
Blockly.Arduino.ORDER_DIVISION = 5.2;
Blockly.Arduino.ORDER_MODULUS = 5.3;
Blockly.Arduino.ORDER_SUBTRACTION = 6.1;
Blockly.Arduino.ORDER_ADDITION = 6.2;
Blockly.Arduino.ORDER_BITWISE_SHIFT = 7;
Blockly.Arduino.ORDER_RELATIONAL = 8;
Blockly.Arduino.ORDER_IN = 8;
Blockly.Arduino.ORDER_INSTANCEOF = 8;
Blockly.Arduino.ORDER_EQUALITY = 9;
Blockly.Arduino.ORDER_BITWISE_AND = 10;
Blockly.Arduino.ORDER_BITWISE_XOR = 11;
Blockly.Arduino.ORDER_BITWISE_OR = 12;
Blockly.Arduino.ORDER_LOGICAL_AND = 13;
Blockly.Arduino.ORDER_LOGICAL_OR = 14;
Blockly.Arduino.ORDER_CONDITIONAL = 15;
Blockly.Arduino.ORDER_ASSIGNMENT = 16;
Blockly.Arduino.ORDER_YIELD = 17;
Blockly.Arduino.ORDER_COMMA = 18;
Blockly.Arduino.ORDER_NONE = 99;

// Block -> code
Blockly.Arduino['esp32_digital_write'] = function (block) {
  const pin = block.getFieldValue('PIN');
  const state = block.getFieldValue('STATE');
  Blockly.Arduino.setups_['pin_' + pin] = 'pinMode(' + pin + ', OUTPUT);';
  return 'digitalWrite(' + pin + ', ' + state + ');\n';
};

Blockly.Arduino['esp32_digital_read'] = function (block) {
  const pin = block.getFieldValue('PIN');
  Blockly.Arduino.setups_['pin_' + pin] = 'pinMode(' + pin + ', INPUT);';
  const code = 'digitalRead(' + pin + ')';
  return [code, Blockly.Arduino.ORDER_ATOMIC];
};

Blockly.Arduino['esp32_button_read'] = function (block) {
  const pin = block.getFieldValue('PIN');
  Blockly.Arduino.setups_['pin_' + pin] = 'pinMode(' + pin + ', INPUT_PULLUP);';
  const code = '!digitalRead(' + pin + ')';
  return [code, Blockly.Arduino.ORDER_ATOMIC];
};

Blockly.Arduino['esp32_delay_ms'] = function (block) {
  const t = block.getFieldValue('DELAY');
  return 'delay(' + t + ');\n';
};

Blockly.Arduino['esp32_if'] = function (block) {
  const condition = Blockly.Arduino.valueToCode(block, 'CONDITION', Blockly.Arduino.ORDER_NONE) || 'false';
  const branch = Blockly.Arduino.statementToCode(block, 'DO');
  return 'if (' + condition + ') {\n' + branch + '}\n';
};

Blockly.Arduino['esp32_while'] = function (block) {
  const condition = Blockly.Arduino.valueToCode(block, 'CONDITION', Blockly.Arduino.ORDER_NONE) || 'false';
  const branch = Blockly.Arduino.statementToCode(block, 'DO');
  return 'while (' + condition + ') {\n' + branch + '}\n';
};

Blockly.Arduino['esp32_if_else'] = function (block) {
  const condition = Blockly.Arduino.valueToCode(block, 'CONDITION', Blockly.Arduino.ORDER_NONE) || 'false';
  const branchIf = Blockly.Arduino.statementToCode(block, 'DO');
  const branchElse = Blockly.Arduino.statementToCode(block, 'ELSE');
  return 'if (' + condition + ') {\n' + branchIf + '} else {\n' + branchElse + '}\n';
};
// Mapping cho API mới
if (!Blockly.Arduino.forBlock) Blockly.Arduino.forBlock = Object.create(null);
Blockly.Arduino.forBlock['esp32_digital_write'] = Blockly.Arduino['esp32_digital_write'];
Blockly.Arduino.forBlock['esp32_digital_read'] = Blockly.Arduino['esp32_digital_read'];
Blockly.Arduino.forBlock['esp32_button_read'] = Blockly.Arduino['esp32_button_read'];
Blockly.Arduino.forBlock['esp32_delay_ms'] = Blockly.Arduino['esp32_delay_ms'];
Blockly.Arduino.forBlock['esp32_if'] = Blockly.Arduino['esp32_if'];
Blockly.Arduino.forBlock['esp32_if_else'] = Blockly.Arduino['esp32_if_else'];
Blockly.Arduino.forBlock['esp32_while'] = Blockly.Arduino['esp32_while'];
console.log('[Arduino generator] Registered blocks:', Object.keys(Blockly.Arduino.forBlock));

Blockly.Arduino.init = function () {
  Blockly.Arduino.definitions_ = Object.create(null);
  Blockly.Arduino.setups_ = Object.create(null);
};
Blockly.Arduino.finish = function (code) {
  let setups = 'void setup()\n{\n';
  for (const k in Blockly.Arduino.setups_) setups += '  ' + Blockly.Arduino.setups_[k] + '\n';
  setups += '}\n\n';
  return setups + 'void loop()\n{\n' + code + '}\n';
};
Blockly.Arduino.scrub_ = function (block, code) {
  const next = block.nextConnection && block.nextConnection.targetBlock();
  let nextCode = '';
  if (next) {
    nextCode = Blockly.Arduino.blockToCode(next);
    if (Array.isArray(nextCode)) nextCode = nextCode[0];
  }
  return code + nextCode;
};
Blockly.Arduino.workspaceToCode = function (ws) {
  ws = ws || Blockly.common.getMainWorkspace();
  if (!ws) return '';
  Blockly.Arduino.init(ws);
  const tops = ws.getTopBlocks(true).sort((a, b) => a.getRelativeToSurfaceXY().y - b.getRelativeToSurfaceXY().y);
  let code = '';
  for (const b of tops) {
    let line = Blockly.Arduino.blockToCode(b);
    if (Array.isArray(line)) line = line[0];
    if (typeof line === 'string') code += line;
  }
  return Blockly.Arduino.finish(code);
};