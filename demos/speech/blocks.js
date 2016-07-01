//listen_if block executes a set of statements if the user says a specified word (entered in a text field)
Blockly.Blocks['listen_if'] = {
  init: function() {
    this.appendValueInput("WORD")
        .setCheck("String")
        .appendField("If you say");
    this.appendStatementInput("DO")
        .setCheck(null);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(0);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

Blockly.JavaScript['listen_if'] = function(block) {
    var text_word = Blockly.JavaScript.valueToCode(block, 'WORD', Blockly.JavaScript.ORDER_ATOMIC);
    var statements_do = Blockly.JavaScript.statementToCode(block, 'DO');
    addRecognizableWord(text_word);
    return 'if (listen_branch('+text_word+')) {\n' + statements_do + '}\n';
};

//listen_bool returns a boolean value, true if the user says a specified word and false otherwise
Blockly.Blocks['listen_bool'] = {
  init: function() {
    this.appendValueInput("WORD")
        .setCheck("String")
        .appendField("you say");
    this.setOutput(true, null);
    this.setColour(0);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

Blockly.JavaScript['listen_bool'] = function(block) {
    var text_word = Blockly.JavaScript.valueToCode(block, 'WORD', Blockly.JavaScript.ORDER_ATOMIC);
    addRecognizableWord(text_word);
    var code = 'listen_branch('+Blockly.JavaScript.quote_(text_word)+')';
    return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

//listen_text returns a String containing what the user said
Blockly.Blocks['listen_text'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("what you say");
    this.setOutput(true, "String");
    this.setColour(0);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

Blockly.JavaScript['listen_text'] = function(block) {
  var code = 'listen_text()';
  return [code, Blockly.JavaScript.ORDER_NONE];
};

//display_img displays an image in a section of the page using the provided link
//TODO(edauterman): Is this a security problem?
Blockly.Blocks['display_img'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Display image at")
        .appendField(new Blockly.FieldTextInput("this link"), "IMG_SRC");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(60);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

Blockly.JavaScript['display_img'] = function(block) {
  var text_img_src = block.getFieldValue('IMG_SRC');
  var code = 'displayImage('+Blockly.JavaScript.quote_(text_img_src)+');\n';
  return code;
};

//display_pause pauses execution for TIME (given in miliseconds)
Blockly.Blocks['display_pause'] = {
  init: function() {
    this.appendValueInput("TIME")
        .setCheck("Number")
        .appendField("Pause for");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(60);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};


Blockly.JavaScript['display_pause'] = function(block) {
  var value_time = Blockly.JavaScript.valueToCode(block, 'TIME', Blockly.JavaScript.ORDER_ATOMIC);
  var code = 'pause('+value_time+');\n';
  return code;
};

//speech_speak block links to a String input and says the String aloud upon execution
Blockly.Blocks['speech_speak'] = {
  init: function() {
    this.appendValueInput("TO_SAY")
        .setCheck("String")
        .appendField("Say");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(300);
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
    this.setColour(60);
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