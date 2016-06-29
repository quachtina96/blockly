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
  var code = '...;\n';
  return '';
};


Blockly.Blocks['listen_bool'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("you say")
        .appendField(new Blockly.FieldDropdown([["red", "red"], ["green", "green"], ["blue", "blue"]]), "SPEECH");
    this.setOutput(true, "Boolean");
    this.setColour(210);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

Blockly.JavaScript['listen_bool'] = function(block) { //this part is not currently working
  var dropdown_speech = block.getFieldValue('SPEECH');
  var code = 'listenForBool(\'' + dropdown_speech + '\') && (function() { while(resultWord==null) { if(\'' + dropdown_speech + '\' == resultWord) return true; else if (resultWord!=null) return false; } recognition.onresult = function(event) {window.console.log("Checking result."); var speechResult = event.results[0][0].transcript; window.console.log("You said: " + speechResult); resultWord = speechResult; return true;}}())';
  return [code, Blockly.JavaScript.ORDER_NONE];
};

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