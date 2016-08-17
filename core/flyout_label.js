/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2016 Google Inc.
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
 * @fileoverview Class for a label in the flyout.
 * @author fenichel@google.com (Rachel Fenichel), quachtina96 (Tina Quach)
 */
'use strict';

goog.provide('Blockly.FlyoutLabel');

goog.require('goog.dom');
goog.require('goog.math.Coordinate');


/**
 * Class for a label in the flyout.
 * @param {!Blockly.Workspace} workspace The workspace in which to place this
 *     label.
 * @param {!Blockly.Workspace} targetWorkspace The flyout's target workspace.
 * @param {string} text The text to display on the label.
 * @constructor
 */
Blockly.FlyoutLabel = function(workspace, targetWorkspace, text) {
  /**
   * @type {!Blockly.Workspace}
   * @private
   */
  this.workspace_ = workspace;

  /**
   * @type {!Blockly.Workspace}
   * @private
   */
  this.targetWorkspace_ = targetWorkspace;

  /**
   * @type {string}
   * @private
   */
  this.text_ = text;

  /**
   * @type {goog.math.Coordinate}
   * @private
   */
  this.position_ = new goog.math.Coordinate(0, 0);
};

/**
 * The margin around the text in the label.
 */
Blockly.FlyoutLabel.MARGIN = 5;

/**
 * The width of the label's rect.
 * @type {number}
 */
Blockly.FlyoutLabel.prototype.width = 0;

/**
 * The height of the label's rect.
 * @type {number}
 */
Blockly.FlyoutLabel.prototype.height = 0;

/**
 * Create the button elements.
 * @return {!Element} The button's SVG group.
 */
Blockly.FlyoutLabel.prototype.createDom = function() {
  this.svgGroup_ = Blockly.createSvgElement('g',
      {'class': 'blocklyFlyoutLabel'}, this.workspace_.getCanvas());

  var svgText = Blockly.createSvgElement('text',
      {'class': 'blocklyFlyoutLabelText', 'x': 0, 'y': 0,
       'text-anchor': 'middle'}, this.svgGroup_);
  svgText.textContent = this.text_;

  this.width = svgText.getComputedTextLength() +
      2 * Blockly.FlyoutButton.MARGIN;
  this.height = 20; // Can't compute it :(

  svgText.setAttribute('x', this.width / 2);
  svgText.setAttribute('y', this.height - Blockly.FlyoutButton.MARGIN);

  this.updateTransform_();
  return this.svgGroup_;
};

/**
 * Correctly position the flyout label and make it visible.
 */
Blockly.FlyoutLabel.prototype.show = function() {
  this.updateTransform_();
  this.svgGroup_.setAttribute('display', 'block');
};

/**
 * Update svg attributes to match internal state.
 */
Blockly.FlyoutLabel.prototype.updateTransform_ = function() {
  this.svgGroup_.setAttribute('transform', 'translate(' + this.position_.x +
      ',' + this.position_.y + ')');
};

/**
 * Move the label to the given x, y coordinates.
 * @param {number} x The new x coordinate.
 * @param {number} y The new y coordinate.
 */
Blockly.FlyoutLabel.prototype.moveTo = function(x, y) {
  this.position_.x = x;
  this.position_.y = y;
  this.updateTransform_();
};

/**
 * Dispose of this label.
 */
Blockly.FlyoutLabel.prototype.dispose = function() {
  if (this.svgGroup_) {
    goog.dom.removeNode(this.svgGroup_);
    this.svgGroup_ = null;
  }
  this.workspace_ = null;
};
