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

// Define RESERVED_WORDS_
Blockly.Arduino.RESERVED_WORDS_ = 'setup,loop,if,else,for,switch,case,while,do,break,continue,function,return,goto,try,throw,catch,finally,true,false,null,undefined,void,int,float,double,char,byte,boolean,String,Array';

// Helper functions for better code formatting
Blockly.Arduino.INDENT = '  '; // 2 spaces for indentation (VS Code style)

// Function to add proper indentation to multi-line code
Blockly.Arduino.addIndent = function (code, level) {
  if (!code) return '';
  level = level || 1;
  const indent = Blockly.Arduino.INDENT.repeat(level);
  return code.split('\n').map(line => {
    return line.trim() ? indent + line.trim() : '';
  }).join('\n');
};

// Override statementToCode to provide better formatting
Blockly.Arduino.statementToCode = function (block, name) {
  var targetBlock = block.getInputTargetBlock(name);
  var code = Blockly.Arduino.blockToCode(targetBlock);
  if (!code) {
    return '';
  }
  // Add proper indentation
  return Blockly.Arduino.addIndent(code) + '\n';
};

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

// Block generators with improved formatting
if(!Blockly.Arduino.usedPins_) Blockly.Arduino.usedPins_ = new Set();
Blockly.Arduino['esp32_digital_write'] = function (block) {
  const pin = block.getFieldValue('PIN');
  const state = block.getFieldValue('STATE');
  Blockly.Arduino.usedPins_.add(pin);
  // (auto pinMode removed) require explicit esp32_pin_mode block
  return 'digitalWrite(' + pin + ', ' + state + ');\n';
};

Blockly.Arduino['esp32_digital_read'] = function (block) {
  const pin = block.getFieldValue('PIN');
  Blockly.Arduino.usedPins_.add(pin);
  // (auto pinMode removed) require explicit esp32_pin_mode block
  const code = 'digitalRead(' + pin + ')';
  return [code, Blockly.Arduino.ORDER_ATOMIC];
};

Blockly.Arduino['esp32_analog_read'] = function (block) {
  const pin = block.getFieldValue('PIN');
  const code = 'analogRead(' + pin + ')';
  return [code, Blockly.Arduino.ORDER_ATOMIC];
};

Blockly.Arduino['esp32_button_read'] = function (block) {
  const pin = block.getFieldValue('PIN');
  Blockly.Arduino.usedPins_.add(pin);
  // (auto pinMode removed) require explicit esp32_pin_mode block using INPUT_PULLUP if needed
  const code = 'digitalRead(' + pin + ')';
  return [code, Blockly.Arduino.ORDER_ATOMIC];
};

Blockly.Arduino['esp32_high_low'] = function (block) {
  const state = block.getFieldValue('STATE');
  return [state, Blockly.Arduino.ORDER_ATOMIC];
};

// Explicit pinMode block (allows manual control order)
Blockly.Arduino['esp32_pin_mode'] = function (block) {
  const pin = block.getFieldValue('PIN');
  const mode = block.getFieldValue('MODE');
  Blockly.Arduino.setups_['pin_' + pin] = 'pinMode(' + pin + ', ' + mode + ');';
  return '';
};

Blockly.Arduino['esp32_delay_ms'] = function (block) {
  const delay = block.getFieldValue('DELAY');
  return 'delay(' + delay + ');\n';
};

// millis() value block
Blockly.Arduino['esp32_millis'] = function (block) {
  return ['millis()', Blockly.Arduino.ORDER_ATOMIC];
};

// Relay generators
Blockly.Arduino['esp32_relay_set'] = function (block) {
  const pin = block.getFieldValue('PIN');
  const state = block.getFieldValue('STATE');
  // (auto pinMode removed) require explicit esp32_pin_mode block
  // Track initial states if placed inside setup block
  if (!Blockly.Arduino.relayInitialStates_) Blockly.Arduino.relayInitialStates_ = {};
  let inSetup = false;
  let parent = block.getParent && block.getParent();
  while (parent) {
    if (parent.type === 'esp32_setup') { inSetup = true; break; }
    parent = parent.getParent && parent.getParent();
  }
  if (inSetup) {
    // Remember initial state, but don't emit digitalWrite (user wants clean setup)
    Blockly.Arduino.relayInitialStates_[pin] = state;
    return '';
  }
  return 'digitalWrite(' + pin + ', ' + state + ');\n';
};
Blockly.Arduino['esp32_relay_blink'] = function (block) {
  const pin = block.getFieldValue('PIN');
  const onMs = block.getFieldValue('DELAY_ON');
  const offMs = block.getFieldValue('DELAY_OFF');
  // (auto pinMode removed) require explicit esp32_pin_mode block
  // Nếu block trước đó đã set HIGH cùng pin thì bỏ dòng HIGH đầu để tránh trùng lặp
  let skipFirstHigh = false;
  const prev = block.getPreviousBlock();
  if (prev && prev.type === 'esp32_relay_set') {
    const prevPin = prev.getFieldValue('PIN');
    const prevState = prev.getFieldValue('STATE');
    if (prevPin === pin && prevState === 'HIGH') skipFirstHigh = true;
  }
  let code = '';
  if (!skipFirstHigh) {
    code += 'digitalWrite(' + pin + ', HIGH);\n';
  }
  code += 'delay(' + onMs + ');\n';
  code += 'digitalWrite(' + pin + ', LOW);\n';
  code += 'delay(' + offMs + ');\n';
  return code;
};

// ===== Setup & Loop top-level blocks =====
// Lưu code riêng biệt để finish() lắp vào
Blockly.Arduino.userSetupCode_ = '';
Blockly.Arduino.userLoopCode_ = '';

Blockly.Arduino['esp32_setup'] = function (block) {
  // Lấy các câu lệnh bên trong
  let branch = Blockly.Arduino.statementToCode(block, 'DO');
  if (branch) {
    // bỏ indent đầu do statementToCode đã thêm
    branch = branch.replace(/^  /gm, '');
  }
  Blockly.Arduino.userSetupCode_ += branch + '\n';
  return '';// Không sinh trực tiếp
};

Blockly.Arduino['esp32_loop'] = function (block) {
  let branch = Blockly.Arduino.statementToCode(block, 'DO');
  if (branch) {
    branch = branch.replace(/^  /gm, '');
  }
  Blockly.Arduino.userLoopCode_ += branch + '\n';
  return '';
};

// WHILE loop with better formatting
Blockly.Arduino['esp32_while'] = function (block) {
  const condition = Blockly.Arduino.valueToCode(block, 'CONDITION', Blockly.Arduino.ORDER_NONE) || 'false';
  let branch = Blockly.Arduino.statementToCode(block, 'DO');

  // Remove extra indentation since we'll add it properly
  branch = branch.replace(/^  /gm, '');

  if (branch) {
    branch = Blockly.Arduino.addIndent(branch.trim()) + '\n';
  }

  return 'while (' + condition + ') {\n' + branch + '}\n';
};

// IF statement with better formatting
Blockly.Arduino['controls_if'] = function (block) {
  var n = 0;
  var code = '';
  var conditionCode, branchCode;

  // Main IF condition
  conditionCode = Blockly.Arduino.valueToCode(block, 'IF' + n, Blockly.Arduino.ORDER_NONE) || 'false';
  branchCode = Blockly.Arduino.statementToCode(block, 'DO' + n);

  // Remove extra indentation and re-add properly
  branchCode = branchCode.replace(/^  /gm, '');
  if (branchCode.trim()) {
    branchCode = Blockly.Arduino.addIndent(branchCode.trim()) + '\n';
  }

  code += 'if (' + conditionCode + ') {\n' + branchCode + '}';

  // ELSE IF conditions
  for (n = 1; n <= block.elseifCount_; n++) {
    conditionCode = Blockly.Arduino.valueToCode(block, 'IF' + n, Blockly.Arduino.ORDER_NONE) || 'false';
    branchCode = Blockly.Arduino.statementToCode(block, 'DO' + n);

    // Remove extra indentation and re-add properly
    branchCode = branchCode.replace(/^  /gm, '');
    if (branchCode.trim()) {
      branchCode = Blockly.Arduino.addIndent(branchCode.trim()) + '\n';
    }

    code += ' else if (' + conditionCode + ') {\n' + branchCode + '}';
  }

  // ELSE condition
  if (block.elseCount_) {
    branchCode = Blockly.Arduino.statementToCode(block, 'ELSE');

    // Remove extra indentation and re-add properly
    branchCode = branchCode.replace(/^  /gm, '');
    if (branchCode.trim()) {
      branchCode = Blockly.Arduino.addIndent(branchCode.trim()) + '\n';
    }

    code += ' else {\n' + branchCode + '}';
  }

  return code + '\n';
};

// Logic and control blocks with improved formatting
Blockly.Arduino['logic_compare'] = function (block) {
  const OPERATORS = {
    'EQ': '==',
    'NEQ': '!=',
    'LT': '<',
    'LTE': '<=',
    'GT': '>',
    'GTE': '>='
  };
  const operator = OPERATORS[block.getFieldValue('OP')];
  const order = Blockly.Arduino.ORDER_RELATIONAL;
  const argument0 = Blockly.Arduino.valueToCode(block, 'A', order) || '0';
  const argument1 = Blockly.Arduino.valueToCode(block, 'B', order) || '0';
  const code = argument0 + ' ' + operator + ' ' + argument1;
  return [code, order];
};

Blockly.Arduino['logic_operation'] = function (block) {
  const operator = (block.getFieldValue('OP') == 'AND') ? '&&' : '||';
  const order = (operator == '&&') ? Blockly.Arduino.ORDER_LOGICAL_AND : Blockly.Arduino.ORDER_LOGICAL_OR;
  const argument0 = Blockly.Arduino.valueToCode(block, 'A', order);
  const argument1 = Blockly.Arduino.valueToCode(block, 'B', order);

  if (!argument0 && !argument1) {
    const code = (operator == '&&') ? 'false' : 'true';
    return [code, Blockly.Arduino.ORDER_ATOMIC];
  }

  const code = (argument0 || 'false') + ' ' + operator + ' ' + (argument1 || 'false');
  return [code, order];
};

Blockly.Arduino['logic_boolean'] = function (block) {
  const code = (block.getFieldValue('BOOL') == 'TRUE') ? 'true' : 'false';
  return [code, Blockly.Arduino.ORDER_ATOMIC];
};

// FOR loop with better formatting
Blockly.Arduino['controls_repeat_ext'] = function (block) {
  const repeats = Blockly.Arduino.valueToCode(block, 'TIMES', Blockly.Arduino.ORDER_ASSIGNMENT) || '0';
  let branch = Blockly.Arduino.statementToCode(block, 'DO');

  // Remove extra indentation and re-add properly
  branch = branch.replace(/^  /gm, '');
  if (branch.trim()) {
    branch = Blockly.Arduino.addIndent(branch.trim()) + '\n';
  }

  const code = 'for (int count = 0; count < ' + repeats + '; count++) {\n' + branch + '}\n';
  return code;
};

Blockly.Arduino['controls_whileUntil'] = function (block) {
  const until = block.getFieldValue('MODE') == 'UNTIL';
  const argument0 = Blockly.Arduino.valueToCode(block, 'BOOL', Blockly.Arduino.ORDER_NONE) || 'false';
  const branch = Blockly.Arduino.statementToCode(block, 'DO');
  if (until) {
    return 'while (!(' + argument0 + ')) {\n' + branch + '}\n';
  } else {
    return 'while (' + argument0 + ') {\n' + branch + '}\n';
  }
};

// Variables blocks removed

Blockly.Arduino['math_number'] = function (block) {
  const code = parseFloat(block.getFieldValue('NUM'));
  return [code, Blockly.Arduino.ORDER_ATOMIC];
};

Blockly.Arduino['math_arithmetic'] = function (block) {
  const OPERATORS = {
    'ADD': [' + ', Blockly.Arduino.ORDER_ADDITION],
    'MINUS': [' - ', Blockly.Arduino.ORDER_SUBTRACTION],
    'MULTIPLY': [' * ', Blockly.Arduino.ORDER_MULTIPLICATION],
    'DIVIDE': [' / ', Blockly.Arduino.ORDER_DIVISION],
    'POWER': [null, Blockly.Arduino.ORDER_COMMA]
  };
  const tuple = OPERATORS[block.getFieldValue('OP')];
  const operator = tuple[0];
  const order = tuple[1];
  const argument0 = Blockly.Arduino.valueToCode(block, 'A', order) || '0';
  const argument1 = Blockly.Arduino.valueToCode(block, 'B', order) || '0';
  let code;
  if (!operator) {
    code = 'pow(' + argument0 + ', ' + argument1 + ')';
    return [code, Blockly.Arduino.ORDER_FUNCTION_CALL];
  }
  code = argument0 + operator + argument1;
  return [code, order];
};

// Text blocks
Blockly.Arduino['text'] = function (block) {
  const code = '"' + block.getFieldValue('TEXT') + '"';
  return [code, Blockly.Arduino.ORDER_ATOMIC];
};

// Raw text/code block (no quotes added) - user responsibility
Blockly.Arduino['esp32_text_raw'] = function (block) {
  let raw = block.getFieldValue('RAW') || '';
  // Trim only trailing spaces that might break code formatting? Keep as-is except leading/trailing
  raw = raw.trim();
  if (!raw) raw = '""'; // fallback empty string constant
  return [raw, Blockly.Arduino.ORDER_ATOMIC];
};

Blockly.Arduino['text_print'] = function (block) {
  const msg = Blockly.Arduino.valueToCode(block, 'TEXT', Blockly.Arduino.ORDER_NONE) || '""';
  Blockly.Arduino.setups_['serial_init'] = 'Serial.begin(115200);';
  return 'Serial.println(' + msg + ');\n';
};

// ===== Serial Blocks =====
Blockly.Arduino['esp32_serial_begin'] = function (block) {
  const baud = block.getFieldValue('BAUD') || '115200';
  Blockly.Arduino.setups_['serial_init'] = 'Serial.begin(' + baud + ');';
  return '';
};

Blockly.Arduino['esp32_serial_print'] = function (block) {
  const txt = Blockly.Arduino.valueToCode(block, 'TEXT', Blockly.Arduino.ORDER_NONE) || '""';
  if (!Blockly.Arduino.setups_['serial_init']) {
    Blockly.Arduino.setups_['serial_init'] = 'Serial.begin(115200);';
  }
  return 'Serial.print(' + txt + ');\n';
};

Blockly.Arduino['esp32_serial_println'] = function (block) {
  const txt = Blockly.Arduino.valueToCode(block, 'TEXT', Blockly.Arduino.ORDER_NONE) || '""';
  if (!Blockly.Arduino.setups_['serial_init']) {
    Blockly.Arduino.setups_['serial_init'] = 'Serial.begin(115200);';
  }
  return 'Serial.println(' + txt + ');\n';
};

Blockly.Arduino['esp32_serial_available'] = function (block) {
  if (!Blockly.Arduino.setups_['serial_init']) {
    Blockly.Arduino.setups_['serial_init'] = 'Serial.begin(115200);';
  }
  return ['Serial.available()', Blockly.Arduino.ORDER_ATOMIC];
};

Blockly.Arduino['esp32_serial_read'] = function (block) {
  if (!Blockly.Arduino.setups_['serial_init']) {
    Blockly.Arduino.setups_['serial_init'] = 'Serial.begin(115200);';
  }
  return ['Serial.read()', Blockly.Arduino.ORDER_ATOMIC];
};

// Comments
Blockly.Arduino['comment'] = function (block) {
  const comment = block.getFieldValue('COMMENT');
  return '// ' + comment + '\n';
};

// Procedures/Functions
Blockly.Arduino['procedures_defnoreturn'] = function (block) {
  const funcName = Blockly.Arduino.nameDB_.getName(block.getFieldValue('NAME'), Blockly.Procedures.NAME_TYPE);
  let branch = Blockly.Arduino.statementToCode(block, 'STACK');

  if (branch) {
    branch = Blockly.Arduino.addIndent(branch.trim()) + '\n';
  }

  const code = 'void ' + funcName + '() {\n' + branch + '}\n';
  Blockly.Arduino.definitions_[funcName] = code;
  return null;
};

Blockly.Arduino['procedures_callnoreturn'] = function (block) {
  const funcName = Blockly.Arduino.nameDB_.getName(block.getFieldValue('NAME'), Blockly.Procedures.NAME_TYPE);
  return funcName + '();\n';
};

// Additional common blocks that might be missing
Blockly.Arduino['text_length'] = function (block) {
  const text = Blockly.Arduino.valueToCode(block, 'VALUE', Blockly.Arduino.ORDER_MEMBER) || '""';
  return [text + '.length()', Blockly.Arduino.ORDER_MEMBER];
};

Blockly.Arduino['text_isEmpty'] = function (block) {
  const text = Blockly.Arduino.valueToCode(block, 'VALUE', Blockly.Arduino.ORDER_MEMBER) || '""';
  return [text + '.length() == 0', Blockly.Arduino.ORDER_EQUALITY];
};

Blockly.Arduino['text_join'] = function (block) {
  const itemCount = block.itemCount_;
  if (itemCount === 0) {
    return ['""', Blockly.Arduino.ORDER_ATOMIC];
  } else if (itemCount === 1) {
    const element = Blockly.Arduino.valueToCode(block, 'ADD0', Blockly.Arduino.ORDER_NONE) || '""';
    return [element, Blockly.Arduino.ORDER_ATOMIC];
  } else {
    const elements = [];
    for (let i = 0; i < itemCount; i++) {
      elements[i] = Blockly.Arduino.valueToCode(block, 'ADD' + i, Blockly.Arduino.ORDER_NONE) || '""';
    }
    const code = 'String(' + elements.join(') + String(') + ')';
    return [code, Blockly.Arduino.ORDER_FUNCTION_CALL];
  }
};

// Lists (Arrays) basic support
Blockly.Arduino['lists_create_empty'] = function (block) {
  return ['{}', Blockly.Arduino.ORDER_ATOMIC];
};

Blockly.Arduino['lists_create_with'] = function (block) {
  const elements = [];
  for (let i = 0; i < block.itemCount_; i++) {
    elements[i] = Blockly.Arduino.valueToCode(block, 'ADD' + i, Blockly.Arduino.ORDER_NONE) || '0';
  }
  const code = '{' + elements.join(', ') + '}';
  return [code, Blockly.Arduino.ORDER_ATOMIC];
};

// For loop improvements
Blockly.Arduino['controls_for'] = function (block) {
  const variable = Blockly.Arduino.nameDB_.getName(block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
  const argument0 = Blockly.Arduino.valueToCode(block, 'FROM', Blockly.Arduino.ORDER_ASSIGNMENT) || '0';
  const argument1 = Blockly.Arduino.valueToCode(block, 'TO', Blockly.Arduino.ORDER_ASSIGNMENT) || '0';
  const increment = Blockly.Arduino.valueToCode(block, 'BY', Blockly.Arduino.ORDER_ASSIGNMENT) || '1';
  let branch = Blockly.Arduino.statementToCode(block, 'DO');

  branch = branch.replace(/^  /gm, '');
  if (branch.trim()) {
    branch = Blockly.Arduino.addIndent(branch.trim()) + '\n';
  }

  let code;
  if (parseFloat(increment) == 1) {
    code = 'for (int ' + variable + ' = ' + argument0 + '; ' + variable + ' <= ' + argument1 + '; ' + variable + '++) {\n' + branch + '}\n';
  } else {
    code = 'for (int ' + variable + ' = ' + argument0 + '; ' + variable + ' <= ' + argument1 + '; ' + variable + ' += ' + increment + ') {\n' + branch + '}\n';
  }
  return code;
};

// Mapping cho API mới
if (!Blockly.Arduino.forBlock) Blockly.Arduino.forBlock = Object.create(null);
Blockly.Arduino.forBlock['esp32_digital_write'] = Blockly.Arduino['esp32_digital_write'];
Blockly.Arduino.forBlock['esp32_digital_read'] = Blockly.Arduino['esp32_digital_read'];
Blockly.Arduino.forBlock['esp32_analog_read'] = Blockly.Arduino['esp32_analog_read'];
Blockly.Arduino.forBlock['esp32_button_read'] = Blockly.Arduino['esp32_button_read'];
Blockly.Arduino.forBlock['esp32_high_low'] = Blockly.Arduino['esp32_high_low'];
Blockly.Arduino.forBlock['esp32_pin_mode'] = Blockly.Arduino['esp32_pin_mode'];
Blockly.Arduino.forBlock['esp32_delay_ms'] = Blockly.Arduino['esp32_delay_ms'];
Blockly.Arduino.forBlock['esp32_millis'] = Blockly.Arduino['esp32_millis'];
Blockly.Arduino.forBlock['esp32_relay_set'] = Blockly.Arduino['esp32_relay_set'];
Blockly.Arduino.forBlock['esp32_relay_blink'] = Blockly.Arduino['esp32_relay_blink'];
Blockly.Arduino.forBlock['esp32_while'] = Blockly.Arduino['esp32_while'];
Blockly.Arduino.forBlock['esp32_setup'] = Blockly.Arduino['esp32_setup'];
Blockly.Arduino.forBlock['esp32_loop'] = Blockly.Arduino['esp32_loop'];

// IF blocks generators - ALL REMOVED

// Standard Blockly blocks
Blockly.Arduino.forBlock['controls_if'] = Blockly.Arduino['controls_if'];
Blockly.Arduino.forBlock['logic_compare'] = Blockly.Arduino['logic_compare'];
Blockly.Arduino.forBlock['logic_operation'] = Blockly.Arduino['logic_operation'];
Blockly.Arduino.forBlock['logic_boolean'] = Blockly.Arduino['logic_boolean'];
Blockly.Arduino.forBlock['controls_repeat_ext'] = Blockly.Arduino['controls_repeat_ext'];
Blockly.Arduino.forBlock['controls_whileUntil'] = Blockly.Arduino['controls_whileUntil'];
// variables_get / variables_set mappings removed
Blockly.Arduino.forBlock['math_number'] = Blockly.Arduino['math_number'];
Blockly.Arduino.forBlock['math_arithmetic'] = Blockly.Arduino['math_arithmetic'];

// Text and other common blocks
Blockly.Arduino.forBlock['text'] = Blockly.Arduino['text'];
Blockly.Arduino.forBlock['esp32_text_raw'] = Blockly.Arduino['esp32_text_raw'];
Blockly.Arduino.forBlock['text_print'] = Blockly.Arduino['text_print'];
Blockly.Arduino.forBlock['text_length'] = Blockly.Arduino['text_length'];
Blockly.Arduino.forBlock['text_isEmpty'] = Blockly.Arduino['text_isEmpty'];
Blockly.Arduino.forBlock['text_join'] = Blockly.Arduino['text_join'];
Blockly.Arduino.forBlock['comment'] = Blockly.Arduino['comment'];
Blockly.Arduino.forBlock['procedures_defnoreturn'] = Blockly.Arduino['procedures_defnoreturn'];
Blockly.Arduino.forBlock['procedures_callnoreturn'] = Blockly.Arduino['procedures_callnoreturn'];

// Serial
Blockly.Arduino.forBlock['esp32_serial_begin'] = Blockly.Arduino['esp32_serial_begin'];
Blockly.Arduino.forBlock['esp32_serial_print'] = Blockly.Arduino['esp32_serial_print'];
Blockly.Arduino.forBlock['esp32_serial_println'] = Blockly.Arduino['esp32_serial_println'];
Blockly.Arduino.forBlock['esp32_serial_available'] = Blockly.Arduino['esp32_serial_available'];
Blockly.Arduino.forBlock['esp32_serial_read'] = Blockly.Arduino['esp32_serial_read'];

// Lists and additional controls
Blockly.Arduino.forBlock['lists_create_empty'] = Blockly.Arduino['lists_create_empty'];
Blockly.Arduino.forBlock['lists_create_with'] = Blockly.Arduino['lists_create_with'];
Blockly.Arduino.forBlock['controls_for'] = Blockly.Arduino['controls_for'];

console.log('[Arduino generator] Registered blocks:', Object.keys(Blockly.Arduino.forBlock));

// Error handler cho các block types chưa được implement
Blockly.Arduino.noGeneratorCodeInline = function (block) {
  console.warn('[Arduino Generator] No generator found for block type:', block.type);
  return ['/* Block type "' + block.type + '" not implemented */', Blockly.Arduino.ORDER_ATOMIC];
};

Blockly.Arduino.noGeneratorCodeLine = function (block) {
  console.warn('[Arduino Generator] No generator found for block type:', block.type);
  return '/* Block type "' + block.type + '" not implemented */\n';
};

Blockly.Arduino.init = function () {
  Blockly.Arduino.definitions_ = Object.create(null);
  Blockly.Arduino.setups_ = Object.create(null);
  Blockly.Arduino.userSetupCode_ = '';
  Blockly.Arduino.userLoopCode_ = '';
  Blockly.Arduino.usedPins_ = new Set();

  if (!Blockly.Arduino.nameDB_) {
    Blockly.Arduino.nameDB_ = new Blockly.Names(Blockly.Arduino.RESERVED_WORDS_);
  } else {
    Blockly.Arduino.nameDB_.reset();
  }
};
Blockly.Arduino.finish = function (code) {
  // Header comment
  let result = '// Generated by ESP32 Blockly IDE\n// Edit at your own risk!\n// NOTE: Use explicit pinMode blocks to configure pins (auto pinMode disabled).\n\n';

  // Setup function
  let setups = 'void setup() {\n';
  if (Object.keys(Blockly.Arduino.setups_).length > 0) {
    for (const k in Blockly.Arduino.setups_) {
      setups += '  ' + Blockly.Arduino.setups_[k] + '\n';
    }
  } else {
    setups += '  // Initialize your hardware here\n';
  }
  // Thêm user setup code (từ block esp32_setup)
  if (Blockly.Arduino.userSetupCode_.trim()) {
    const lines = Blockly.Arduino.userSetupCode_.trim().split('\n');
    for (const l of lines) {
      if (l.trim()) setups += '  ' + l + '\n'; else setups += '\n';
    }
  }
  setups += '}\n\n';

  // Loop function
  let loop = 'void loop() {\n';
  // Code sinh từ block esp32_loop (ưu tiên)
  let loopSource = Blockly.Arduino.userLoopCode_.trim();
  if (!loopSource) {
    // fallback: nếu chưa dùng block esp32_loop thì dùng code còn lại
    loopSource = code.trim();
  }
  if (loopSource) {
    const lines = loopSource.split('\n');
    for (const line of lines) {
      if (line.trim()) loop += '  ' + line + '\n'; else loop += '\n';
    }
  } else {
    loop += '  // Your main code goes here\n';
  }
  loop += '}\n';

  // Post-generation warning comment for any used pin lacking explicit pinMode
  const missing = [];
  if(Blockly.Arduino.usedPins_) {
    for (const p of Blockly.Arduino.usedPins_) {
      if(!Blockly.Arduino.setups_['pin_' + p]) missing.push(p);
    }
  }
  if(missing.length) {
    result += '// WARNING: Missing pinMode for pins: ' + missing.join(', ') + '\n// Add pinMode blocks for these pins.\n\n';
  }

  return result + setups + loop;
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

// Improved statementToCode function
Blockly.Arduino.statementToCode = function (block, name) {
  const targetBlock = block.getInputTargetBlock(name);
  let code = Blockly.Arduino.blockToCode(targetBlock);

  if (typeof code !== 'string') {
    return '';
  }

  // Add proper indentation for nested blocks
  if (code) {
    const lines = code.split('\n');
    const indentedLines = lines.map(line => {
      if (line.trim()) {
        return '  ' + line; // Add 2 spaces for indentation
      }
      return line;
    });
    code = indentedLines.join('\n');
  }

  return code;
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

// Override blockToCode để xử lý các block chưa có generator
const originalBlockToCode = Blockly.Arduino.blockToCode;
Blockly.Arduino.blockToCode = function (block) {
  if (!block || block.disabled) {
    return '';
  }

  const func = this.forBlock[block.type];
  if (func) {
    // Gọi generator function có sẵn
    const code = func.call(this, block);
    let result;
    if (Array.isArray(code)) {
      // Value block - trả về [code, order] 
      result = [code[0] || '', code[1] || this.ORDER_ATOMIC];
    } else {
      // Statement block - trả về string
      result = code || '';
    }

    // Xử lý kết nối với block tiếp theo (chỉ cho statement blocks)
    if (typeof result === 'string' && block.nextConnection) {
      result = this.scrub_(block, result);
    }

    return result;
  } else {
    // Block type chưa có generator
    console.warn('No generator for block type: ' + block.type);

    // Kiểm tra xem block có output hay không để quyết định trả về format nào
    if (block.outputConnection) {
      // Value block - trả về array
      return ['/* ' + block.type + ' */', this.ORDER_ATOMIC];
    } else {
      // Statement block - trả về string và xử lý next connection
      let result = '/* ' + block.type + ' */\n';
      if (block.nextConnection) {
        result = this.scrub_(block, result);
      }
      return result;
    }
  }
};