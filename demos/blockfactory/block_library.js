/**
 * @fileoverview JavaScript for Block Library, an expansion upon Blockly's
 * Block Factory. Calls functions and depends on global variables
 * defined in factory.js.
 *
 * @author quacht (Tina Quach)
 */
'use strict';

goog.provide('BlockLibrary');
goog.require('BlockLibrary.Storage');
goog.require('BlockLibrary.UI');
goog.require('BlockFactory');

/**
* namespace for Block Library
* @namespace BlockLibrary
*/
var BlockLibrary = {};

/**
 * Returns the block type of the block the user is building.
 *
 * @return {string} the current block's type
 */
BlockLibrary.getCurrentBlockType = function() {
  var rootBlock = BlockFactory.getRootBlock(BlockFactory.mainWorkspace);
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
  BlockFactory.mainWorkspace.clear();
  Blockly.Xml.domToWorkspace(xml, BlockFactory.mainWorkspace);
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
    var xmlElement = Blockly.Xml.workspaceToDom(BlockFactory.mainWorkspace);
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
