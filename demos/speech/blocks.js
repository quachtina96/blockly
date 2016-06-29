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
*/

//speech_speak block links to a String input and says the String aloud upon execution
Blockly.Blocks['speech_speak'] = {
  init: function() {
    this.appendValueInput("TO_SAY")
        .setCheck("String")
        .appendField("Say");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(230);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

Blockly.JavaScript['speech_speak'] = function(block) {
  var value_to_say = Blockly.JavaScript.valueToCode(block, 'TO_SAY', Blockly.JavaScript.ORDER_ATOMIC);
  var code;
  if (value_to_say !== '' && value_to_say !== null){
    code = 'say(' + value_to_say + ');\n';
  }  
  else{
    code = '\n';
  }
  return code;
};

//writes to display
Blockly.Blocks['display_text'] = {
  init: function() {
    this.appendValueInput("DISPLAY_TEXT")
        .setCheck("String")
        .appendField("Write");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(260);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};


//takes in the user's text from the block and shows it on the screen.
Blockly.JavaScript['display_text'] = function(block) {
  var value_display_text = Blockly.JavaScript.valueToCode(block, 'DISPLAY_TEXT', Blockly.JavaScript.ORDER_ATOMIC);
  console.log(value_display_text);
  var code = "updateTextDisplay(" + value_display_text + ");\n";
  return code;
};