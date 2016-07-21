/**
 * @fileoverview Javascript for Block Library's Storage Class. Interfaces with
 * window's local storage to store blocks.
 *
 * @author quachtina96 (Tina Quach)
 */

'use strict';

goog.provide('BlockLibrary.Store');
goog.require('BlockLibrary');

/**
 * Represents a block library's storage.
 * @constructor
 *
 * @param {string} blockLibraryName - desired name of Block Library, also used
 * to create the key for where it's stored in local storage.
 */
BlockLibrary.Store.Storage = function(blockLibraryName) {
  // Add prefix to this.name to avoid collisions in local storage.
  this.name = 'BlockLibrary.Store.' + blockLibraryName;
  // Initialize this.blocks by loading from local storage.
  this.loadFromLocalStorage();
  if (this.blocks == null) {
    this.blocks = Object.create(null);
    /**
     * The line above is equivalent of {} except that this object is TRULY
     * empty. It doesn't have built-in attributes/functions such as length
     * or toString.
     */
    this.saveToLocalStorage();
  }
};

/**
 * Reads the named block library from local storage and saves it in this.blocks.
 */
BlockLibrary.Store.Storage.prototype.loadFromLocalStorage = function() {
  // goog.global is synonymous to window, and  allows for flexibility
  // between browsers.
  var object = goog.global.localStorage[this.name];
  this.blocks = object ? JSON.parse(object) : null;
};

/**
 * Writes the current block library (this.blocks) to local storage.
 */
BlockLibrary.Store.Storage.prototype.saveToLocalStorage = function() {
  goog.global.localStorage[this.name] = JSON.stringify(this.blocks);
};

/**
 * Clears the current block library.
 */
BlockLibrary.Store.Storage.prototype.clear = function() {
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
BlockLibrary.Store.Storage.prototype.addBlock = function(blockType, blockXML) {
  var prettyXml = Blockly.Xml.domToPrettyText(blockXML);
  this.blocks[blockType] = prettyXml;
};

/**
 * Removes block from current block library (this.blocks).
 *
 * @param {string} blockType - type of block
 */
BlockLibrary.Store.Storage.prototype.removeBlock = function(blockType) {
  this.blocks[blockType] = null;
};

/**
 * Returns the xml of given block type stored in current block library
 * (this.blocks).
 *
 * @param {string} blockType - type of block
 * @return {Element} the xml that represents the block type
 */
BlockLibrary.Store.Storage.prototype.getBlockXML = function(blockType) {
  var xmlText = this.blocks[blockType];
  return Blockly.Xml.textToDom(xmlText);
};

/**
 * Checks to see if block library is empty.
 *
 * @return {Boolean} true if empty, false otherwise.
 */
BlockLibrary.Store.Storage.prototype.isEmpty = function() {
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