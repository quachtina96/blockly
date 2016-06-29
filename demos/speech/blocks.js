
Blockly.Blocks['listen_start'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Listen for")
        .appendField(new Blockly.FieldTextInput("your special word"), "SPEECH");
    this.appendStatementInput("DO")
        .setCheck(null);
    this.setColour(260);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

Blockly.JavaScript['listen_start'] = function(block) {
  var speech = block.getFieldValue('SPEECH');
  block.data = speech;
  addRecognizableWord(speech);
  window.console.log("Changed the data value: " + block.data);
  return '';
};

Blockly.Blocks['listen_if'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("If you say")
        .appendField(new Blockly.FieldTextInput("your special word"), "WORD");
    this.appendStatementInput("DO")
        .setCheck(null);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(260);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

Blockly.JavaScript['listen_if'] = function(block) {
    var text_word = block.getFieldValue('WORD');
    var statements_do = Blockly.JavaScript.statementToCode(block, 'DO');
    addRecognizableWord(text_word);
    //listenIf(text_word,statements_do);  //trying different approach
    return 'if (listen_branch('+Blockly.JavaScript.quote_(text_word)+')) {\n' + statements_do + '}\n';
};

Blockly.Blocks['listen_bool'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("you say")
        .appendField(new Blockly.FieldTextInput("your special word"), "WORD");
    this.setOutput(true, null);
    this.setColour(260);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

Blockly.JavaScript['listen_bool'] = function(block) {
    var text_word = block.getFieldValue('WORD');
    addRecognizableWord(text_word);
    //listenIf(text_word,statements_do);  //trying different approach
    var code = 'listen_branch('+Blockly.JavaScript.quote_(text_word)+')';
    return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.Blocks['listen_text'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("what you say");
    this.setOutput(true, "String");
    this.setColour(260);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

Blockly.JavaScript['listen_text'] = function(block) {
  var code = 'listen_text()';
  return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.Blocks['display_img'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Display image at")
        .appendField(new Blockly.FieldTextInput("this link"), "IMG_SRC");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(330);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

Blockly.JavaScript['display_img'] = function(block) {
  var text_img_src = block.getFieldValue('IMG_SRC');
  var code = 'displayImage('+Blockly.JavaScript.quote_(text_img_src)+');\n';
  return code;
};

Blockly.Blocks['display_pause'] = {
  init: function() {
    this.appendValueInput("TIME")
        .setCheck("Number")
        .appendField("Pause for");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(330);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};


Blockly.JavaScript['display_pause'] = function(block) {
  var value_time = Blockly.JavaScript.valueToCode(block, 'TIME', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = 'pause('+value_time+');\n';
  return code;
};

/*
Blockly.Blocks['listen_prompt'] = {
  init: function() {
    this.appendValueInput("PROMPT")
        .setCheck("String")
        .appendField("Ask");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(260);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};


Blockly.JavaScript['listen_prompt'] = function(block) {
  var value_prompt = Blockly.JavaScript.valueToCode(block, 'PROMPT', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = 'alert(' + Blockly.JavaScript.quote_(value_prompt) + ');';
  return code;
};
*/

//