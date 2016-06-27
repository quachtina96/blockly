

Blockly.Blocks['string_reverse'] = {
  init: function() {
    this.appendValueInput("STRING")
        .setCheck("String")
        .appendField("Reverse of");
    this.setOutput(true, "String");
    this.setColour(285);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

Blockly.JavaScript['string_reverse'] = function(block) {
  var value_string = Blockly.JavaScript.valueToCode(block, 'STRING', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = value_string + '.reverse()';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.Blocks['string_contains'] = {
  init: function() {
    this.appendValueInput("BIGSTRING")
        .setCheck("String");
    this.appendValueInput("SUBSTR")
        .setCheck("String")
        .appendField("contains");
    this.setInputsInline(true);
    this.setOutput(true, "Boolean");
    this.setColour(285);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

Blockly.JavaScript['string_contains'] = function(block) {
  var value_string = Blockly.JavaScript.valueToCode(block, 'BIGSTRING', Blockly.JavaScript.ORDER_ATOMIC);
  var value_substr = Blockly.JavaScript.valueToCode(block, 'SUBSTR', Blockly.JavaScript.ORDER_ATOMIC);
  var code = value_string + '.includes(' + value_substr + ')';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.Blocks['mouse_click'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("on mouse click");
    this.setNextStatement(true, null);
    this.setColour(20);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }, 
  onchange: function() {
  	alert("Boo! Gotcha.");
  }
};


Blockly.JavaScript['mouse_click'] = function(block) {
  // TODO: Assemble JavaScript into code variable.
  //var code = '...;\n';
  //return code;
  return '';
};


Blockly.Blocks['listen_start'] = {	//need to figure out how to generalize for internationalization
  init: function() {
    this.appendDummyInput()
        .appendField("Listen for")
        .appendField(new Blockly.FieldDropdown([["red", "red"], ["green", "green"], ["blue", "blue"]]), "SPEECH");
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

Blockly.JavaScript['listen_bool'] = function(block) {
  var dropdown_speech = block.getFieldValue('SPEECH');
  var code = 'listenForBool(\'' + dropdown_speech + '\') && (function() { while(resultWord==null) { if(\'' + dropdown_speech + '\' == resultWord) return true; else if (resultWord!=null) return false; } recognition.onresult = function(event) {window.console.log("Checking result."); var speechResult = event.results[0][0].transcript; window.console.log("You said: " + speechResult); resultWord = speechResult; return true;}}())';
  return [code, Blockly.JavaScript.ORDER_NONE];
};


//