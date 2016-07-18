/**
 * Blockly Demos: Block Factory
 *
 * Copyright 2012 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview JavaScript for Blockly's Block Factory application.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

/**
 * Workspace for user to build block.
 * @type {Blockly.Workspace}
 */
var mainWorkspace = null;

/**
 * Workspace for preview of block.
 * @type {Blockly.Workspace}
 */
var previewWorkspace = null;

/**
 * Name of block if not named.
 */
var UNNAMED = 'unnamed';

/**
 * Change the language code format.
 */
function formatChange() {
  var mask = document.getElementById('blocklyMask');
  var languagePre = document.getElementById('languagePre');
  var languageTA = document.getElementById('languageTA');
  if (document.getElementById('format').value == 'Manual') {
    Blockly.hideChaff();
    mask.style.display = 'block';
    languagePre.style.display = 'none';
    languageTA.style.display = 'block';
    var code = languagePre.textContent.trim();
    languageTA.value = code;
    languageTA.focus();
    updatePreview();
  } else {
    mask.style.display = 'none';
    languageTA.style.display = 'none';
    languagePre.style.display = 'block';
    updateLanguage();
  }
  disableEnableLink();
}

/**
 * Update the language code based on constructs made in Blockly.
 */
function updateLanguage() {
  var rootBlock = getRootBlock();
  if (!rootBlock) {
    return;
  }
  var blockType = rootBlock.getFieldValue('NAME').trim().toLowerCase();
  if (!blockType) {
    blockType = UNNAMED;
  }
  blockType = blockType.replace(/\W/g, '_').replace(/^(\d)/, '_\\1');
  switch (document.getElementById('format').value) {
    case 'JSON':
      var code = formatJson_(blockType, rootBlock);
      break;
    case 'JavaScript':
      var code = formatJavaScript_(blockType, rootBlock);
      break;
  }
  injectCode(code, 'languagePre');
  updatePreview();
}

/**
 * Update the language code as JSON.
 * @param {string} blockType Name of block.
 * @param {!Blockly.Block} rootBlock Factory_base block.
 * @return {string} Generanted language code.
 * @private
 */
function formatJson_(blockType, rootBlock) {
  var JS = {};
  // Type is not used by Blockly, but may be used by a loader.
  JS.type = blockType;
  // Generate inputs.
  var message = [];
  var args = [];
  var contentsBlock = rootBlock.getInputTargetBlock('INPUTS');
  var lastInput = null;
  while (contentsBlock) {
    if (!contentsBlock.disabled && !contentsBlock.getInheritedDisabled()) {
      var fields = getFieldsJson_(contentsBlock.getInputTargetBlock('FIELDS'));
      for (var i = 0; i < fields.length; i++) {
        if (typeof fields[i] == 'string') {
          message.push(fields[i].replace(/%/g, '%%'));
        } else {
          args.push(fields[i]);
          message.push('%' + args.length);
        }
      }

      var input = {type: contentsBlock.type};
      // Dummy inputs don't have names.  Other inputs do.
      if (contentsBlock.type != 'input_dummy') {
        input.name = contentsBlock.getFieldValue('INPUTNAME');
      }
      var check = JSON.parse(getOptTypesFrom(contentsBlock, 'TYPE') || 'null');
      if (check) {
        input.check = check;
      }
      var align = contentsBlock.getFieldValue('ALIGN');
      if (align != 'LEFT') {
        input.align = align;
      }
      args.push(input);
      message.push('%' + args.length);
      lastInput = contentsBlock;
    }
    contentsBlock = contentsBlock.nextConnection &&
        contentsBlock.nextConnection.targetBlock();
  }
  // Remove last input if dummy and not empty.
  if (lastInput && lastInput.type == 'input_dummy') {
    var fields = lastInput.getInputTargetBlock('FIELDS');
    if (fields && getFieldsJson_(fields).join('').trim() != '') {
      var align = lastInput.getFieldValue('ALIGN');
      if (align != 'LEFT') {
        JS.lastDummyAlign0 = align;
      }
      args.pop();
      message.pop();
    }
  }
  JS.message0 = message.join(' ');
  if (args.length) {
    JS.args0 = args;
  }
  // Generate inline/external switch.
  if (rootBlock.getFieldValue('INLINE') == 'EXT') {
    JS.inputsInline = false;
  } else if (rootBlock.getFieldValue('INLINE') == 'INT') {
    JS.inputsInline = true;
  }
  // Generate output, or next/previous connections.
  switch (rootBlock.getFieldValue('CONNECTIONS')) {
    case 'LEFT':
      JS.output =
          JSON.parse(getOptTypesFrom(rootBlock, 'OUTPUTTYPE') || 'null');
      break;
    case 'BOTH':
      JS.previousStatement =
          JSON.parse(getOptTypesFrom(rootBlock, 'TOPTYPE') || 'null');
      JS.nextStatement =
          JSON.parse(getOptTypesFrom(rootBlock, 'BOTTOMTYPE') || 'null');
      break;
    case 'TOP':
      JS.previousStatement =
          JSON.parse(getOptTypesFrom(rootBlock, 'TOPTYPE') || 'null');
      break;
    case 'BOTTOM':
      JS.nextStatement =
          JSON.parse(getOptTypesFrom(rootBlock, 'BOTTOMTYPE') || 'null');
      break;
  }
  // Generate colour.
  var colourBlock = rootBlock.getInputTargetBlock('COLOUR');
  if (colourBlock && !colourBlock.disabled) {
    var hue = parseInt(colourBlock.getFieldValue('HUE'), 10);
    JS.colour = hue;
  }
  JS.tooltip = '';
  JS.helpUrl = 'http://www.example.com/';
  return JSON.stringify(JS, null, '  ');
}

/**
 * Update the language code as JavaScript.
 * @param {string} blockType Name of block.
 * @param {!Blockly.Block} rootBlock Factory_base block.
 * @return {string} Generanted language code.
 * @private
 */
function formatJavaScript_(blockType, rootBlock) {
  var code = [];
  code.push("Blockly.Blocks['" + blockType + "'] = {");
  code.push("  init: function() {");
  // Generate inputs.
  var TYPES = {'input_value': 'appendValueInput',
               'input_statement': 'appendStatementInput',
               'input_dummy': 'appendDummyInput'};
  var contentsBlock = rootBlock.getInputTargetBlock('INPUTS');
  while (contentsBlock) {
    if (!contentsBlock.disabled && !contentsBlock.getInheritedDisabled()) {
      var name = '';
      // Dummy inputs don't have names.  Other inputs do.
      if (contentsBlock.type != 'input_dummy') {
        name = escapeString(contentsBlock.getFieldValue('INPUTNAME'));
      }
      code.push('    this.' + TYPES[contentsBlock.type] + '(' + name + ')');
      var check = getOptTypesFrom(contentsBlock, 'TYPE');
      if (check) {
        code.push('        .setCheck(' + check + ')');
      }
      var align = contentsBlock.getFieldValue('ALIGN');
      if (align != 'LEFT') {
        code.push('        .setAlign(Blockly.ALIGN_' + align + ')');
      }
      var fields = getFieldsJs_(contentsBlock.getInputTargetBlock('FIELDS'));
      for (var i = 0; i < fields.length; i++) {
        code.push('        .appendField(' + fields[i] + ')');
      }
      // Add semicolon to last line to finish the statement.
      code[code.length - 1] += ';';
    }
    contentsBlock = contentsBlock.nextConnection &&
        contentsBlock.nextConnection.targetBlock();
  }
  // Generate inline/external switch.
  if (rootBlock.getFieldValue('INLINE') == 'EXT') {
    code.push('    this.setInputsInline(false);');
  } else if (rootBlock.getFieldValue('INLINE') == 'INT') {
    code.push('    this.setInputsInline(true);');
  }
  // Generate output, or next/previous connections.
  switch (rootBlock.getFieldValue('CONNECTIONS')) {
    case 'LEFT':
      code.push(connectionLineJs_('setOutput', 'OUTPUTTYPE'));
      break;
    case 'BOTH':
      code.push(connectionLineJs_('setPreviousStatement', 'TOPTYPE'));
      code.push(connectionLineJs_('setNextStatement', 'BOTTOMTYPE'));
      break;
    case 'TOP':
      code.push(connectionLineJs_('setPreviousStatement', 'TOPTYPE'));
      break;
    case 'BOTTOM':
      code.push(connectionLineJs_('setNextStatement', 'BOTTOMTYPE'));
      break;
  }
  // Generate colour.
  var colourBlock = rootBlock.getInputTargetBlock('COLOUR');
  if (colourBlock && !colourBlock.disabled) {
    var hue = parseInt(colourBlock.getFieldValue('HUE'), 10);
    if (!isNaN(hue)) {
      code.push('    this.setColour(' + hue + ');');
    }
  }
  code.push("    this.setTooltip('');");
  code.push("    this.setHelpUrl('http://www.example.com/');");
  code.push('  }');
  code.push('};');
  return code.join('\n');
}

/**
 * Create JS code required to create a top, bottom, or value connection.
 * @param {string} functionName JavaScript function name.
 * @param {string} typeName Name of type input.
 * @return {string} Line of JavaScript code to create connection.
 * @private
 */
function connectionLineJs_(functionName, typeName) {
  var type = getOptTypesFrom(getRootBlock(), typeName);
  if (type) {
    type = ', ' + type;
  } else {
    type = '';
  }
  return '    this.' + functionName + '(true' + type + ');';
}

/**
 * Returns field strings and any config.
 * @param {!Blockly.Block} block Input block.
 * @return {!Array.<string>} Field strings.
 * @private
 */
function getFieldsJs_(block) {
  var fields = [];
  while (block) {
    if (!block.disabled && !block.getInheritedDisabled()) {
      switch (block.type) {
        case 'field_static':
          // Result: 'hello'
          fields.push(escapeString(block.getFieldValue('TEXT')));
          break;
        case 'field_input':
          // Result: new Blockly.FieldTextInput('Hello'), 'GREET'
          fields.push('new Blockly.FieldTextInput(' +
              escapeString(block.getFieldValue('TEXT')) + '), ' +
              escapeString(block.getFieldValue('FIELDNAME')));
          break;
        case 'field_angle':
          // Result: new Blockly.FieldAngle(90), 'ANGLE'
          fields.push('new Blockly.FieldAngle(' +
              parseFloat(block.getFieldValue('ANGLE')) + '), ' +
              escapeString(block.getFieldValue('FIELDNAME')));
          break;
        case 'field_checkbox':
          // Result: new Blockly.FieldCheckbox('TRUE'), 'CHECK'
          fields.push('new Blockly.FieldCheckbox(' +
              escapeString(block.getFieldValue('CHECKED')) + '), ' +
              escapeString(block.getFieldValue('FIELDNAME')));
          break;
        case 'field_colour':
          // Result: new Blockly.FieldColour('#ff0000'), 'COLOUR'
          fields.push('new Blockly.FieldColour(' +
              escapeString(block.getFieldValue('COLOUR')) + '), ' +
              escapeString(block.getFieldValue('FIELDNAME')));
          break;
        case 'field_date':
          // Result: new Blockly.FieldDate('2015-02-04'), 'DATE'
          fields.push('new Blockly.FieldDate(' +
              escapeString(block.getFieldValue('DATE')) + '), ' +
              escapeString(block.getFieldValue('FIELDNAME')));
          break;
        case 'field_variable':
          // Result: new Blockly.FieldVariable('item'), 'VAR'
          var varname = escapeString(block.getFieldValue('TEXT') || null);
          fields.push('new Blockly.FieldVariable(' + varname + '), ' +
              escapeString(block.getFieldValue('FIELDNAME')));
          break;
        case 'field_dropdown':
          // Result:
          // new Blockly.FieldDropdown([['yes', '1'], ['no', '0']]), 'TOGGLE'
          var options = [];
          for (var i = 0; i < block.optionCount_; i++) {
            options[i] = '[' + escapeString(block.getFieldValue('USER' + i)) +
                ', ' + escapeString(block.getFieldValue('CPU' + i)) + ']';
          }
          if (options.length) {
            fields.push('new Blockly.FieldDropdown([' +
                options.join(', ') + ']), ' +
                escapeString(block.getFieldValue('FIELDNAME')));
          }
          break;
        case 'field_image':
          // Result: new Blockly.FieldImage('http://...', 80, 60)
          var src = escapeString(block.getFieldValue('SRC'));
          var width = Number(block.getFieldValue('WIDTH'));
          var height = Number(block.getFieldValue('HEIGHT'));
          var alt = escapeString(block.getFieldValue('ALT'));
          fields.push('new Blockly.FieldImage(' +
              src + ', ' + width + ', ' + height + ', ' + alt + ')');
          break;
      }
    }
    block = block.nextConnection && block.nextConnection.targetBlock();
  }
  return fields;
}

/**
 * Returns field strings and any config.
 * @param {!Blockly.Block} block Input block.
 * @return {!Array.<string|!Object>} Array of static text and field configs.
 * @private
 */
function getFieldsJson_(block) {
  var fields = [];
  while (block) {
    if (!block.disabled && !block.getInheritedDisabled()) {
      switch (block.type) {
        case 'field_static':
          // Result: 'hello'
          fields.push(block.getFieldValue('TEXT'));
          break;
        case 'field_input':
          fields.push({
            type: block.type,
            name: block.getFieldValue('FIELDNAME'),
            text: block.getFieldValue('TEXT')
          });
          break;
        case 'field_angle':
          fields.push({
            type: block.type,
            name: block.getFieldValue('FIELDNAME'),
            angle: Number(block.getFieldValue('ANGLE'))
          });
          break;
        case 'field_checkbox':
          fields.push({
            type: block.type,
            name: block.getFieldValue('FIELDNAME'),
            checked: block.getFieldValue('CHECKED') == 'TRUE'
          });
          break;
        case 'field_colour':
          fields.push({
            type: block.type,
            name: block.getFieldValue('FIELDNAME'),
            colour: block.getFieldValue('COLOUR')
          });
          break;
        case 'field_date':
          fields.push({
            type: block.type,
            name: block.getFieldValue('FIELDNAME'),
            date: block.getFieldValue('DATE')
          });
          break;
        case 'field_variable':
          fields.push({
            type: block.type,
            name: block.getFieldValue('FIELDNAME'),
            variable: block.getFieldValue('TEXT') || null
          });
          break;
        case 'field_dropdown':
          var options = [];
          for (var i = 0; i < block.optionCount_; i++) {
            options[i] = [block.getFieldValue('USER' + i),
                block.getFieldValue('CPU' + i)];
          }
          if (options.length) {
            fields.push({
              type: block.type,
              name: block.getFieldValue('FIELDNAME'),
              options: options
            });
          }
          break;
        case 'field_image':
          fields.push({
            type: block.type,
            src: block.getFieldValue('SRC'),
            width: Number(block.getFieldValue('WIDTH')),
            height: Number(block.getFieldValue('HEIGHT')),
            alt: block.getFieldValue('ALT')
          });
          break;
      }
    }
    block = block.nextConnection && block.nextConnection.targetBlock();
  }
  return fields;
}

/**
 * Escape a string.
 * @param {string} string String to escape.
 * @return {string} Escaped string surrouned by quotes.
 */
function escapeString(string) {
  return JSON.stringify(string);
}

/**
 * Fetch the type(s) defined in the given input.
 * Format as a string for appending to the generated code.
 * @param {!Blockly.Block} block Block with input.
 * @param {string} name Name of the input.
 * @return {?string} String defining the types.
 */
function getOptTypesFrom(block, name) {
  var types = getTypesFrom_(block, name);
  if (types.length == 0) {
    return undefined;
  } else if (types.indexOf('null') != -1) {
    return 'null';
  } else if (types.length == 1) {
    return types[0];
  } else {
    return '[' + types.join(', ') + ']';
  }
}

/**
 * Fetch the type(s) defined in the given input.
 * @param {!Blockly.Block} block Block with input.
 * @param {string} name Name of the input.
 * @return {!Array.<string>} List of types.
 * @private
 */
function getTypesFrom_(block, name) {
  var typeBlock = block.getInputTargetBlock(name);
  var types;
  if (!typeBlock || typeBlock.disabled) {
    types = [];
  } else if (typeBlock.type == 'type_other') {
    types = [escapeString(typeBlock.getFieldValue('TYPE'))];
  } else if (typeBlock.type == 'type_group') {
    types = [];
    for (var n = 0; n < typeBlock.typeCount_; n++) {
      types = types.concat(getTypesFrom_(typeBlock, 'TYPE' + n));
    }
    // Remove duplicates.
    var hash = Object.create(null);
    for (var n = types.length - 1; n >= 0; n--) {
      if (hash[types[n]]) {
        types.splice(n, 1);
      }
      hash[types[n]] = true;
    }
  } else {
    types = [escapeString(typeBlock.valueType)];
  }
  return types;
}

/**
 * Update the generator code.
 * @param {!Blockly.Block} block Rendered block in preview workspace.
 */
function updateGenerator(block) {
  function makeVar(root, name) {
    name = name.toLowerCase().replace(/\W/g, '_');
    return '  var ' + root + '_' + name;
  }
  var language = document.getElementById('language').value;
  var code = [];
  code.push("Blockly." + language + "['" + block.type +
            "'] = function(block) {");

  // Generate getters for any fields or inputs.
  for (var i = 0, input; input = block.inputList[i]; i++) {
    for (var j = 0, field; field = input.fieldRow[j]; j++) {
      var name = field.name;
      if (!name) {
        continue;
      }
      if (field instanceof Blockly.FieldVariable) {
        // Subclass of Blockly.FieldDropdown, must test first.
        code.push(makeVar('variable', name) +
                  " = Blockly." + language +
                  ".variableDB_.getName(block.getFieldValue('" + name +
                  "'), Blockly.Variables.NAME_TYPE);");
      } else if (field instanceof Blockly.FieldAngle) {
        // Subclass of Blockly.FieldTextInput, must test first.
        code.push(makeVar('angle', name) +
                  " = block.getFieldValue('" + name + "');");
      } else if (Blockly.FieldDate && field instanceof Blockly.FieldDate) {
        // Blockly.FieldDate may not be compiled into Blockly.
        code.push(makeVar('date', name) +
                  " = block.getFieldValue('" + name + "');");
      } else if (field instanceof Blockly.FieldColour) {
        code.push(makeVar('colour', name) +
                  " = block.getFieldValue('" + name + "');");
      } else if (field instanceof Blockly.FieldCheckbox) {
        code.push(makeVar('checkbox', name) +
                  " = block.getFieldValue('" + name + "') == 'TRUE';");
      } else if (field instanceof Blockly.FieldDropdown) {
        code.push(makeVar('dropdown', name) +
                  " = block.getFieldValue('" + name + "');");
      } else if (field instanceof Blockly.FieldTextInput) {
        code.push(makeVar('text', name) +
                  " = block.getFieldValue('" + name + "');");
      }
    }
    var name = input.name;
    if (name) {
      if (input.type == Blockly.INPUT_VALUE) {
        code.push(makeVar('value', name) +
                  " = Blockly." + language + ".valueToCode(block, '" + name +
                  "', Blockly." + language + ".ORDER_ATOMIC);");
      } else if (input.type == Blockly.NEXT_STATEMENT) {
        code.push(makeVar('statements', name) +
                  " = Blockly." + language + ".statementToCode(block, '" +
                  name + "');");
      }
    }
  }
  // Most languages end lines with a semicolon.  Python does not.
  var lineEnd = {
    'JavaScript': ';',
    'Python': '',
    'PHP': ';',
    'Dart': ';'
  };
  code.push("  // TODO: Assemble " + language + " into code variable.");
  if (block.outputConnection) {
    code.push("  var code = '...';");
    code.push("  // TODO: Change ORDER_NONE to the correct strength.");
    code.push("  return [code, Blockly." + language + ".ORDER_NONE];");
  } else {
    code.push("  var code = '..." + (lineEnd[language] || '') + "\\n';");
    code.push("  return code;");
  }
  code.push("};");

  injectCode(code.join('\n'), 'generatorPre');
}

/**
 * Existing direction ('ltr' vs 'rtl') of preview.
 */
var oldDir = null;

/**
 * Update the preview display.
 */
function updatePreview() {
  // Toggle between LTR/RTL if needed (also used in first display).
  var newDir = document.getElementById('direction').value;
  if (oldDir != newDir) {
    if (previewWorkspace) {
      previewWorkspace.dispose();
    }
    var rtl = newDir == 'rtl';
    previewWorkspace = Blockly.inject('preview',
        {rtl: rtl,
         media: '../../media/',
         scrollbars: true});
    oldDir = newDir;
  }
  previewWorkspace.clear();

  // Fetch the code and determine its format (JSON or JavaScript).
  var format = document.getElementById('format').value;
  if (format == 'Manual') {
    var code = document.getElementById('languageTA').value;
    // If the code is JSON, it will parse, otherwise treat as JS.
    try {
      JSON.parse(code);
      format = 'JSON';
    } catch (e) {
      format = 'JavaScript';
    }
  } else {
    var code = document.getElementById('languagePre').textContent;
  }
  if (!code.trim()) {
    // Nothing to render.  Happens while cloud storage is loading.
    return;
  }

  // Backup Blockly.Blocks object so that main workspace and preview don't
  // collide if user creates a 'factory_base' block, for instance.
  var backupBlocks = Blockly.Blocks;
  try {
    // Make a shallow copy.
    Blockly.Blocks = {};
    for (var prop in backupBlocks) {
      Blockly.Blocks[prop] = backupBlocks[prop];
    }

    if (format == 'JSON') {
      var json = JSON.parse(code);
      Blockly.Blocks[json.id || UNNAMED] = {
        init: function() {
          this.jsonInit(json);
        }
      };
    } else if (format == 'JavaScript') {
      eval(code);
    } else {
      throw 'Unknown format: ' + format;
    }

    // Look for a block on Blockly.Blocks that does not match the backup.
    var blockType = null;
    for (var type in Blockly.Blocks) {
      if (typeof Blockly.Blocks[type].init == 'function' &&
          Blockly.Blocks[type] != backupBlocks[type]) {
        blockType = type;
        break;
      }
    }
    if (!blockType) {
      return;
    }

    // Create the preview block.
    var previewBlock = previewWorkspace.newBlock(blockType);
    previewBlock.initSvg();
    previewBlock.render();
    previewBlock.setMovable(false);
    previewBlock.setDeletable(false);
    previewBlock.moveBy(15, 10);
    previewWorkspace.clearUndo();

    updateGenerator(previewBlock);
  } finally {
    Blockly.Blocks = backupBlocks;
  }
}

/**
 * Inject code into a pre tag, with syntax highlighting.
 * Safe from HTML/script injection.
 * @param {string} code Lines of code.
 * @param {string} id ID of <pre> element to inject into.
 */
function injectCode(code, id) {
  var pre = document.getElementById(id);
  pre.textContent = code;
  code = pre.innerHTML;
  code = prettyPrintOne(code, 'js');
  pre.innerHTML = code;
}

/**
 * Return the uneditable container block that everything else attaches to.
 * @return {Blockly.Block}
 */
function getRootBlock() {
  var blocks = mainWorkspace.getTopBlocks(false);
  for (var i = 0, block; block = blocks[i]; i++) {
    if (block.type == 'factory_base') {
      return block;
    }
  }
  return null;
}
/**
 * Generate a file from the contents of a given text area and
 * download that file.
 * @param {string} filename The name of the file to create.
 * @param {string} id The text area to download.
*/
function downloadTextArea(filename, id) {
  var code = document.getElementById(id).textContent;
  createAndDownloadFile_(code, filename, 'plain');
}

/**
 * Create a file with the given attributes and download it.
 * @param {string} contents - The contents of the file.
 * @param {string} filename - The name of the file to save to.
 * @param {string} fileType - The type of the file to save.
 * @private
 */
function createAndDownloadFile_(contents, filename, fileType) {
  var data = new Blob([contents], {type: 'text/' + fileType});
  var clickEvent = new MouseEvent("click", {
    "view": window,
    "bubbles": true,
    "cancelable": false
  });

  var a = document.createElement('a');
  a.href = window.URL.createObjectURL(data);
  a.download = filename;
  a.textContent = 'Download file!';
  a.dispatchEvent(clickEvent);
}

/**
 * Save the workspace's xml representation to a file.
 * @private
 */
function saveWorkspaceToFile() {
  var xmlElement = Blockly.Xml.workspaceToDom(mainWorkspace);
  var prettyXml = Blockly.Xml.domToPrettyText(xmlElement);
  createAndDownloadFile_(prettyXml, 'blockXml', 'xml');
}

/**
 * Disable link and save buttons if the format is 'Manual', enable otherwise.
 */
function disableEnableLink() {
  var linkButton = document.getElementById('linkButton');
  var saveBlockButton = document.getElementById('localSaveButton');
  var disabled = document.getElementById('format').value == 'Manual';
  linkButton.disabled = buttonDisabled;
  saveBlockButton.disabled = buttonDisabled;
}

/**
 * Imports xml file for a block to the workspace.
 */
function importBlockFromFile() {
  var files = document.getElementById('files');
  // If the file list is empty, they user likely canceled in the dialog.
  if (files.files.length > 0) {
    // The input tag doesn't have the "mulitple" attribute
    // so the user can only choose 1 file.
    var file = files.files[0];
    var fileReader = new FileReader();
    fileReader.addEventListener('load', function(event) {
      var fileContents = event.target.result;
      var xml = '';
      try {
        xml = Blockly.Xml.textToDom(fileContents);
      } catch (e) {
        var message = 'Could not load your saved file.\n'+
          'Perhaps it was created with a different version of Blockly?';
        window.alert(message + '\nXML: ' + fileContents);
        return;
      }
      mainWorkspace.clear();
      Blockly.Xml.domToWorkspace(xml, mainWorkspace);
    });

    fileReader.readAsText(file);
  }
}

/**
* namespace for Block Library
* @namespace BlockLibrary
*/
var BlockLibrary = {};

/**
* namespace for Block Library UI
* @namespace UI
*/
BlockLibrary.UI = {};

/**
 * Creates a node of a given element type and appends to the node with given id.
 *
 * @param {string} optionName - value of option
 * @param {string} optionText - text in option
 * @param {string} dropdownID - id for HTML select element
 */
BlockLibrary.UI.addOption = function(optionName, optionText, dropdownID) {
  var dropdown = document.getElementById(dropdownID);
  var option = document.createElement('option');
  option.text = optionText;
  option.value = optionName;
  dropdown.add(option);
};

/**
 * Removes option currently selected in dropdown from dropdown menu.
 *
 * @param {string} dropdownID - id of HTML select element within which to find
 *     the selected option.
 */
BlockLibrary.UI.removeSelectedOption = function(dropdownID) {
  var dropdown = document.getElementById(dropdownID);
  if (dropdown) {
    dropdown.remove(dropdown.selectedIndex);
  }
};

/**
 * Removes all options from dropdown.
 *
 * @param {string} dropdownID - id of HTML select element to clear options of.
 */
BlockLibrary.UI.clearOptions = function(dropdownID) {
  var dropdown = document.getElementById(dropdownID);
  while (dropdown.length > 0) {
    dropdown.remove(dropdown.length - 1);
  }
};

/**
 * Represents a block library's storage.
 * @constructor
 *
 * @param {string} blockLibraryName - desired name of Block Library, also used
 * to create the key for where it's stored in local storage.
 */
BlockLibrary.Storage = function(blockLibraryName) {
  // Add prefix to this.name to avoid collisions in local storage.
  this.name = 'BlockLibrary.Storage.' + blockLibraryName;
  this.loadFromLocalStorage();
  if (this.blocks == null) {
    this.blocks = Object.create(null);
    // The line above is equivalent of {} except that this object is TRULY
    // empty. It doesn't have built-in attributes/functions such as length
    // or toString.
    this.saveToLocalStorage();
  }
};

/**
 * Reads the named block library from local storage and saves it in this.blocks.
 */
BlockLibrary.Storage.prototype.loadFromLocalStorage = function() {
  var object = window.localStorage[this.name];
  this.blocks = object ? JSON.parse(object) : null;
};

/**
 * Writes the current block library (this.blocks) to local storage.
 */
BlockLibrary.Storage.prototype.saveToLocalStorage = function() {
  window.localStorage[this.name] = JSON.stringify(this.blocks);
};

/**
 * Clears the current block library.
 */
BlockLibrary.Storage.prototype.clear = function() {
  this.blocks = Object.create(null);
  // The line above is equivalent of {} except that this object is TRULY
  // empty. It doesn't have built-in attributes/functions such as length or
  // toString.
};

/**
 * Saves block to block library.
 *
 * @param {string} blockType - the type the block
 * @param {Element} blockXML - the block's XML pulled from workspace
 */
BlockLibrary.Storage.prototype.addBlock = function(blockType, blockXML) {
  var prettyXml = Blockly.Xml.domToPrettyText(blockXML);
  this.blocks[blockType] = prettyXml;
};

/**
 * Removes block from current block library (this.blocks).
 *
 * @param {string} blockType - type of block
 */
BlockLibrary.Storage.prototype.removeBlock = function(blockType) {
  this.blocks[blockType] = null;
};

/**
 * Returns the xml of given block type stored in current block library
 * (this.blocks).
 *
 * @param {string} blockType - type of block
 * @return {Element} the xml that represents the block type
 */
BlockLibrary.Storage.prototype.getBlockXML = function(blockType) {
  var xmlText = this.blocks[blockType];
  return Blockly.Xml.textToDom(xmlText);
};

/**
 * Checks to see if block library is empty.
 *
 * @return {Boolean} true if empty, false otherwise.
 */
BlockLibrary.Storage.prototype.isEmpty = function() {
  if (Object.keys(this.blocks).length == 0) {
    return true;
  } else {
    for (var blockType in this.blocks) {
      // Deleted blocks are represented by a null value so simply iterating over
      // the attributes will not work.
      if (this.blocks[blockType] != null) {
        return false;
      }
    }
  }
  return true;
};

/**
 * Returns the block type of the block the user is building.
 *
 * @return {string} the current block's type
 */
BlockLibrary.getCurrentBlockType = function() {
  var rootBlock = getRootBlock();
  return rootBlock.getFieldValue('NAME').trim().toLowerCase();
};

/**
 * Removes current block from Block Library
 *
 * @param {string} blockType - type of block
 */
BlockLibrary.removeFromBlockLibrary = function() {
  var blockType = BlockLibrary.getCurrentBlockType();
  BlockLibrary.storage.removeBlock(blockType);
  BlockLibrary.storage.saveToLocalStorage();
  BlockLibrary.populateBlockLibrary();
};

/**
 * Updates the workspace to show the block user selected from library
 *
 * @param {Element} blockLibraryDropdown - your block library dropdown
 */
BlockLibrary.selectHandler = function(blockLibraryDropdown) {
  var index = blockLibraryDropdown.selectedIndex;
  var blockType = blockLibraryDropdown.options[index].value;
  var xml = BlockLibrary.storage.getBlockXML(blockType);
  mainWorkspace.clear();
  Blockly.Xml.domToWorkspace(xml, mainWorkspace);
};

/**
 * Clears the block library in local storage and updates the dropdown.
 */
BlockLibrary.clearBlockLibrary = function() {
  var check = prompt(
      'Are you sure you want to clear your Block Library? ("yes" or "no")');
  if (check == "yes") {
    BlockLibrary.storage.clear();
    BlockLibrary.storage.saveToLocalStorage();
    BlockLibrary.UI.clearOptions('blockLibraryDropdown');
  }
};

/**
 * Saves current block to local storage and updates dropdown.
 */
BlockLibrary.saveToBlockLibrary = function() {
  var blockType = BlockLibrary.getCurrentBlockType();
  if (BlockLibrary.isInBlockLibrary(blockType)) {
    alert('You already have a block called ' + blockType + ' in your library.' +
      ' Please rename your block or delete the old one.');
  } else {
    var blockType = BlockLibrary.getCurrentBlockType();
    var xmlElement = Blockly.Xml.workspaceToDom(mainWorkspace);
    BlockLibrary.storage.addBlock(blockType, xmlElement);
    BlockLibrary.storage.saveToLocalStorage();
    BlockLibrary.UI.addOption(blockType, blockType, 'blockLibraryDropdown');
  }
};

/**
 * Checks to see if the given blockType is already in Block Library
 *
 * @param {string} blockType - type of block
 * @return {boolean} indicates whether or not block is in the library
 */
BlockLibrary.isInBlockLibrary = function(blockType) {
  var blockLibrary = BlockLibrary.storage.blocks;
  return (blockType in blockLibrary && blockLibrary[blockType] != null);
};



/**
 * Loads block library from local storage and populates the dropdown menu.
 */
BlockLibrary.populateBlockLibrary = function() {
  BlockLibrary.storage = new BlockLibrary.Storage(BlockLibrary.name);
  if (BlockLibrary.storage.isEmpty()) {
    alert('Your block library is empty! Click "Save to Block Library" so ' +
         'you can reopen it the next time you visit Block Factory!');
  }
  BlockLibrary.UI.clearOptions('blockLibraryDropdown');
  var blockLibrary = BlockLibrary.storage.blocks;
  for (var block in blockLibrary) {
    // Make sure the block wasn't deleted.
    if (blockLibrary[block] != null) {
      BlockLibrary.UI.addOption(block, block, 'blockLibraryDropdown');
    }
  }
};

/**
 * Initialize Blockly and layout.  Called on page load.
 */
function init() {
  if ('BlocklyStorage' in window) {
    BlocklyStorage.HTTPREQUEST_ERROR =
        'There was a problem with the request.\n';
    BlocklyStorage.LINK_ALERT =
        'Share your blocks with this link:\n\n%1';
    BlocklyStorage.HASH_ERROR =
        'Sorry, "%1" doesn\'t correspond with any saved Blockly file.';
    BlocklyStorage.XML_ERROR = 'Could not load your saved file.\n' +
        'Perhaps it was created with a different version of Blockly?';
    var linkButton = document.getElementById('linkButton');
    linkButton.style.display = 'inline-block';
    linkButton.addEventListener('click',
        function() {BlocklyStorage.link(mainWorkspace);});
    disableEnableLink();
  }

  BlockLibrary.name = 'blockLibrary';
  BlockLibrary.populateBlockLibrary();

  document.getElementById('localSaveButton')
    .addEventListener('click', BlockLibrary.saveWorkspaceToFile);

  document.getElementById('saveToBlockLibraryButton')
    .addEventListener('click', BlockLibrary.saveToBlockLibrary);

  document.getElementById('clearBlockLibraryButton')
    .addEventListener('click', BlockLibrary.clearBlockLibrary);

  document.getElementById('removeBlockFromLibraryButton')
    .addEventListener('click', BlockLibrary.removeFromBlockLibrary);

  document.getElementById('downloadFromLibButton')
    .addEventListener('click', BlockLibrary.downloadBlockFiles);

  document.getElementById('files').addEventListener('change',
    function() {
      importBlockFromFile();
      // Clear this so that the change event still fires even if the
      // same file is chosen again. If the user re-imports a file, we
      // want to reload the workspace with its contents.
      this.value = null;
    });

  document.getElementById('helpButton').addEventListener('click',
    function() {
      open('https://developers.google.com/blockly/custom-blocks/block-factory',
           'BlockFactoryHelp');
    });
  document.getElementById('downloadBlocks').addEventListener('click',
    function() {
      downloadTextArea('blocks', 'languagePre');
    });

  document.getElementById('downloadGenerator').addEventListener('click',
    function() {
      downloadTextArea('generator', 'generatorPre')
    });

  var expandList = [
    document.getElementById('blockly'),
    document.getElementById('blocklyMask'),
    document.getElementById('preview'),
    document.getElementById('languagePre'),
    document.getElementById('languageTA'),
    document.getElementById('generatorPre')
  ];
  var onresize = function(e) {
    for (var i = 0, expand; expand = expandList[i]; i++) {
      expand.style.width = (expand.parentNode.offsetWidth - 2) + 'px';
      expand.style.height = (expand.parentNode.offsetHeight - 2) + 'px';
    }
  };
  onresize();
  window.addEventListener('resize', onresize);

  var toolbox = document.getElementById('toolbox');
  mainWorkspace = Blockly.inject('blockly',
      {collapse: false,
       toolbox: toolbox,
       media: '../../media/'});

  // Create the root block.
  if ('BlocklyStorage' in window && window.location.hash.length > 1) {
    BlocklyStorage.retrieveXml(window.location.hash.substring(1),
                               mainWorkspace);
  } else {
    var xml = '<xml><block type="factory_base" deletable="false" ' +
        'movable="false"></block></xml>';
    Blockly.Xml.domToWorkspace(Blockly.Xml.textToDom(xml), mainWorkspace);
  }
  mainWorkspace.clearUndo();

  mainWorkspace.addChangeListener(updateLanguage);
  document.getElementById('direction')
      .addEventListener('change', updatePreview);
  document.getElementById('languageTA')
      .addEventListener('change', updatePreview);
  document.getElementById('languageTA')
      .addEventListener('keyup', updatePreview);
  document.getElementById('format')
      .addEventListener('change', formatChange);
  document.getElementById('language')
      .addEventListener('change', updatePreview);
}
window.addEventListener('load', init);
