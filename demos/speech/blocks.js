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


//updates the displayText div by either replacing or appending to current text.
Blockly.Blocks['display_update_text'] = {
  init: function() {
    this.appendValueInput("UPDATE_TEXT")
        .setCheck("String")
        .appendField("Write");
    this.appendDummyInput()
        .appendField("by")
        .appendField(new Blockly.FieldDropdown([["replacing old text.", "REPLACE"], ["adding to old text.", "APPEND"]]), "WRITETYPE");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(260);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

Blockly.JavaScript['display_update_text'] = function(block) {
  var value_update_text = Blockly.JavaScript.valueToCode(block, 'UPDATE_TEXT', Blockly.JavaScript.ORDER_ATOMIC);
  var dropdown_name = block.getFieldValue('WRITETYPE');
  var code = 'if( ' + Blockly.JavaScript.quote_(dropdown_name) + ' == "REPLACE"){\
      clearText("textArea");\
      }\
      appendText("p", '+ value_update_text + ',"textArea");\n';
  return code;
};

Blockly.Blocks['display_clear_text'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Clear all text.");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(260);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

Blockly.JavaScript['display_clear_text'] = function(block) {
  // TODO: Assemble JavaScript into code variable.
  var code = 'clearText("textArea");\n';
  return code;
};