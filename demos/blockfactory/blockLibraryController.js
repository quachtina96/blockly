/**
 * @fileoverview JavaScript for Block Library, an expansion upon Blockly's
 * Block Factory. Calls functions and depends on global variables
 * defined in factory.js.
 *
 * @author quacht (Tina Quach)
 */
'use strict';

goog.provide('BlockLibrary.Controller');

goog.require('BlockLibrary');
goog.require('BlockLibrary.Store');
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
BlockLibrary.Controller.getCurrentBlockType = function() {
  var rootBlock = BlockFactory.getRootBlock(BlockFactory.mainWorkspace);
  return rootBlock.getFieldValue('NAME').trim().toLowerCase();
};

/**
 * Removes current block from Block Library
 *
 * @param {string} blockType - type of block
 */
BlockLibrary.Controller.removeFromBlockLibrary = function() {
  var blockType = BlockLibrary.Controller.getCurrentBlockType();
  BlockLibrary.storage.removeBlock(blockType);
  BlockLibrary.storage.saveToLocalStorage();
  BlockLibrary.populateBlockLibrary();
};

/**
 * Updates the workspace to show the block user selected from library
 *
 * @param {Element} blockLibraryDropdown - your block library dropdown
 */
BlockLibrary.Controller.selectHandler = function(blockLibraryDropdown) {
  var index = blockLibraryDropdown.selectedIndex;
  var blockType = blockLibraryDropdown.options[index].value;
  var xml = BlockLibrary.Controller.storage.getBlockXML(blockType);
  BlockFactory.mainWorkspace.clear();
  Blockly.Xml.domToWorkspace(xml, BlockFactory.mainWorkspace);
};

/**
 * Clears the block library in local storage and updates the dropdown.
 */
BlockLibrary.Controller.clearBlockLibrary = function() {
  var check = prompt(
      'Are you sure you want to clear your Block Library? ("yes" or "no")');
  if (check == "yes") {
    BlockLibrary.Controller.storage.clear();
    BlockLibrary.Controller.storage.saveToLocalStorage();
    BlockLibrary.UI.clearOptions('blockLibraryDropdown');
  }
};

/**
 * Saves current block to local storage and updates dropdown.
 */
BlockLibrary.Controller.saveToBlockLibrary = function() {
  var blockType = BlockLibrary.Controller.getCurrentBlockType();
  if (BlockLibrary.Controller.isInBlockLibrary(blockType)) {
    alert('You already have a block called ' + blockType + ' in your library.' +
      ' Please rename your block or delete the old one.');
  } else {
    var xmlElement = Blockly.Xml.workspaceToDom(BlockFactory.mainWorkspace);
    BlockLibrary.Controller.storage.addBlock(blockType, xmlElement);
    BlockLibrary.Controller.storage.saveToLocalStorage();
    BlockLibrary.UI.addOption(blockType, blockType, 'blockLibraryDropdown');
  }
};

/**
 * Checks to see if the given blockType is already in Block Library
 *
 * @param {string} blockType - type of block
 * @return {boolean} indicates whether or not block is in the library
 */
BlockLibrary.Controller.isInBlockLibrary = function(blockType) {
  var blockLibrary = BlockLibrary.Controller.storage.blocks;
  return (blockType in blockLibrary && blockLibrary[blockType] != null);
};

/**
 * Loads block library from local storage and populates the dropdown menu.
 * @param {string} libraryName - name of Block Library
 */
BlockLibrary.Controller.populateBlockLibrary = function(libraryName) {
  BlockLibrary.Controller.storage = BlockLibrary.Store.Storage(libraryName);
  if (BlockLibrary.Controller.storage.isEmpty()) {
    alert('Your block library is empty! Click "Save to Block Library" so ' +
         'you can reopen it the next time you visit Block Factory!');
  }
  BlockLibrary.UI.clearOptions('blockLibraryDropdown');
  var blockLibrary = BlockLibrary.Controller.storage.blocks;
  for (var block in blockLibrary) {
    // Make sure the block wasn't deleted.
    if (blockLibrary[block] != null) {
      BlockLibrary.UI.addOption(block, block, 'blockLibraryDropdown');
    }
  }
};
