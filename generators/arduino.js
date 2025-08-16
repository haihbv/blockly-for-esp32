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

Blockly.Arduino['esp32_analog_read'] = function (block) {
  const pin = block.getFieldValue('PIN');
  const code = 'analogRead(' + pin + ')';
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

// Standard Blockly blocks generators
Blockly.Arduino['controls_if'] = function (block) {
  const condition = Blockly.Arduino.valueToCode(block, 'IF0', Blockly.Arduino.ORDER_NONE) || 'false';
  const branch = Blockly.Arduino.statementToCode(block, 'DO0');
  return 'if (' + condition + ') {\n' + branch + '}\n';
};

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

Blockly.Arduino['controls_repeat_ext'] = function (block) {
  const repeats = Blockly.Arduino.valueToCode(block, 'TIMES', Blockly.Arduino.ORDER_ASSIGNMENT) || '0';
  const branch = Blockly.Arduino.statementToCode(block, 'DO');
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

Blockly.Arduino['variables_get'] = function (block) {
  const code = Blockly.Arduino.nameDB_.getName(block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
  return [code, Blockly.Arduino.ORDER_ATOMIC];
};

Blockly.Arduino['variables_set'] = function (block) {
  const argument0 = Blockly.Arduino.valueToCode(block, 'VALUE', Blockly.Arduino.ORDER_ASSIGNMENT) || '0';
  const varName = Blockly.Arduino.nameDB_.getName(block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
  return varName + ' = ' + argument0 + ';\n';
};

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
Blockly.Arduino.forBlock['esp32_analog_read'] = Blockly.Arduino['esp32_analog_read'];
Blockly.Arduino.forBlock['esp32_button_read'] = Blockly.Arduino['esp32_button_read'];
Blockly.Arduino.forBlock['esp32_delay_ms'] = Blockly.Arduino['esp32_delay_ms'];
Blockly.Arduino.forBlock['esp32_if'] = Blockly.Arduino['esp32_if'];
Blockly.Arduino.forBlock['esp32_if_else'] = Blockly.Arduino['esp32_if_else'];
Blockly.Arduino.forBlock['esp32_while'] = Blockly.Arduino['esp32_while'];

// Standard Blockly blocks
Blockly.Arduino.forBlock['controls_if'] = Blockly.Arduino['controls_if'];
Blockly.Arduino.forBlock['logic_compare'] = Blockly.Arduino['logic_compare'];
Blockly.Arduino.forBlock['logic_operation'] = Blockly.Arduino['logic_operation'];
Blockly.Arduino.forBlock['logic_boolean'] = Blockly.Arduino['logic_boolean'];
Blockly.Arduino.forBlock['controls_repeat_ext'] = Blockly.Arduino['controls_repeat_ext'];
Blockly.Arduino.forBlock['controls_whileUntil'] = Blockly.Arduino['controls_whileUntil'];
Blockly.Arduino.forBlock['variables_get'] = Blockly.Arduino['variables_get'];
Blockly.Arduino.forBlock['variables_set'] = Blockly.Arduino['variables_set'];
Blockly.Arduino.forBlock['math_number'] = Blockly.Arduino['math_number'];
Blockly.Arduino.forBlock['math_arithmetic'] = Blockly.Arduino['math_arithmetic'];

console.log('[Arduino generator] Registered blocks:', Object.keys(Blockly.Arduino.forBlock));

Blockly.Arduino.init = function () {
  Blockly.Arduino.definitions_ = Object.create(null);
  Blockly.Arduino.setups_ = Object.create(null);

  if (!Blockly.Arduino.nameDB_) {
    Blockly.Arduino.nameDB_ = new Blockly.Names(Blockly.Arduino.RESERVED_WORDS_);
  } else {
    Blockly.Arduino.nameDB_.reset();
  }
};
Blockly.Arduino.finish = function (code) {
  // Header comment
  let result = '// Generated by ESP32 Blockly IDE\n// Edit at your own risk!\n\n';

  // Setup function
  let setups = 'void setup() {\n';
  if (Object.keys(Blockly.Arduino.setups_).length > 0) {
    for (const k in Blockly.Arduino.setups_) {
      setups += '  ' + Blockly.Arduino.setups_[k] + '\n';
    }
  } else {
    setups += '  // Initialize your hardware here\n';
  }
  setups += '}\n\n';

  // Loop function
  let loop = 'void loop() {\n';
  if (code.trim()) {
    // Process code to ensure proper indentation
    const lines = code.split('\n');
    for (const line of lines) {
      if (line.trim()) {
        loop += '  ' + line + '\n';
      } else {
        loop += '\n';
      }
    }
  } else {
    loop += '  // Your main code goes here\n';
  }
  loop += '}\n';

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