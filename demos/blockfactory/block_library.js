/**
 * @fileoverview JavaScript for Block Library, an expansion upon Blockly's
 * Block Factory.
 *
 * @author quacht@google.com (Tina Quach)
 */

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
 * @param {string} blockType - type of block
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
  var rootBlock = getRootBlock(mainWorkspace);
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
 * @param {string} libraryName - name of Block Library
 */
BlockLibrary.populateBlockLibrary = function(libraryName) {
  BlockLibrary.storage = new BlockLibrary.Storage(libraryName);
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
* Block Library Export Class
* @constructor
*
* @param {string} mainContainer - ID of div element to contain the exporter's
* hidden workspace
*/
BlockLibrary.Exporter = function(hiddenWorkspaceContainerID) {
  /**
   * Hidden workspace for the Block Library Exporter that holds pieces that make
   * up the block
   * @type {Blockly.Workspace}
   */
  this.hiddenWorkspace =  Blockly.inject(hiddenWorkspaceContainerID,
      {collapse: false,
       media: '../../media/'});
};

/**
 * Return the given language code of each block type in an array.
 *
 * @param {string[]} blockTypes - array of block types for which to get block
 * definitions
 * @param {string} definitionFormat - 'JSON' or 'JavaScript'
 * @return {string} in the desired format, the concatenation of each block's
 * language code.
 */
BlockLibrary.Exporter.prototype.getBlockDefs = function(blockTypes, definitionFormat) {
  var blockCode = [];
  for (var i = 0; i < blockTypes.length; i++) {
    var blockType = blockTypes[i];
    var xml = BlockLibrary.storage.getBlockXML(blockType);

    // Render and get block from hidden workspace.
    this.hiddenWorkspace.clear();
    Blockly.Xml.domToWorkspace(xml, this.hiddenWorkspace);
    var rootBlock = getRootBlock(this.hiddenWorkspace);

    // Generate the block's definition.
    blockType = blockType.replace(/\W/g, '_').replace(/^(\d)/, '_\\1');
    switch (definitionFormat) {
      case 'JSON':
        var code = formatJson_(blockType, rootBlock);
        break;
      case 'JavaScript':
        var code = formatJavaScript_(blockType, rootBlock);
        break;
    }
    // Add block's definition to the definitions to return.
    blockCode.push(code);
  }
  return blockCode.join("\n\n");
};

/**
 * Return the generator code of each block type in an array in a given language.
 *
 * @param {string[]} blockTypes - array of block types for which to get block
 * definitions
 * @param {string} generatorLanguage - e.g.'JavaScript', 'Python', 'PHP', 'Lua',
 *     'Dart'
 * @return {string} in the desired format, the concatenation of each block's
 * generator code.
 */
BlockLibrary.Exporter.prototype.getGeneratorCode =
    function(blockTypes, generatorLanguage) {
  var multiblockCode = [];
  // Define the custom blocks in order to be able to create instances of them in the
  // exporter workspace.
  var blockDefs = this.getBlockDefs(blockTypes, 'JavaScript');
  eval(blockDefs);

  for (var i = 0; i < blockTypes.length; i++) {
    var blockType = blockTypes[i];
    // Render the preview block in the hidden workspace.
    this.hiddenWorkspace.clear();
    var tempBlock = this.hiddenWorkspace.newBlock(blockType);
    this.hiddenWorkspace.clearUndo();
    // Get generator stub for the given block and add to  generator code.
    var blockGenCode = getGeneratorStub(tempBlock, generatorLanguage);
    multiblockCode.push(blockGenCode);
  }
  return multiblockCode.join("\n\n");
};