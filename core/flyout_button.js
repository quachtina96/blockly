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
 * @fileoverview Class for a button in the flyout.
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.provide('Blockly.FlyoutButton');

goog.require('Blockly.FlyoutLabel');
goog.require('goog.dom');
goog.require('goog.math.Coordinate');


/**
 * Class for a button in the flyout.
 * @param {!Blockly.Workspace} workspace The workspace in which to place this
 *     button.
 * @param {!Blockly.Workspace} targetWorkspace The flyout's target workspace.
 * @param {string} text The text to display on the button.
 * @extends {Blockly.FlyoutLabel}
 * @constructor
 */
Blockly.FlyoutButton = function(workspace, targetWorkspace, text) {
  Blockly.FlyoutButton.superClass_.constructor.call(this,
      workspace, targetWorkspace, text);
};
goog.inherits(Blockly.FlyoutButton, Blockly.FlyoutLabel);

/**
 * The margin around the text in the button.
 */
Blockly.FlyoutButton.MARGIN = 5;

/**
 * The width of the button's rect.
 * @type {number}
 */
Blockly.FlyoutButton.prototype.width = 0;

/**
 * The height of the button's rect.
 * @type {number}
 */
Blockly.FlyoutButton.prototype.height = 0;

/**
 * Create the button elements.
 * @return {!Element} The button's SVG group.
 */
Blockly.FlyoutButton.prototype.createDom = function() {
  this.svgGroup_ = Blockly.createSvgElement('g',
      {'class': 'blocklyFlyoutButton'}, this.workspace_.getCanvas());

  // Rect with rounded corners.
  var rect = Blockly.createSvgElement('rect',
      {'rx': 4, 'ry': 4,
       'height': 0, 'width': 0},
       this.svgGroup_);

  var svgText = Blockly.createSvgElement('text',
      {'class': 'blocklyText', 'x': 0, 'y': 0,
       'text-anchor': 'middle'}, this.svgGroup_);
  svgText.textContent = this.text_;

  this.width = svgText.getComputedTextLength() +
      2 * Blockly.FlyoutButton.MARGIN;
  this.height = 20; // Can't compute it :(

  rect.setAttribute('width', this.width);
  rect.setAttribute('height', this.height);

  svgText.setAttribute('x', this.width / 2);
  svgText.setAttribute('y', this.height - Blockly.FlyoutButton.MARGIN);

  this.updateTransform_();
  return this.svgGroup_;
};

/**
 * Correctly position the flyout button and make it visible.
 */
Blockly.FlyoutButton.prototype.show = function() {
  Blockly.FlyoutButton.superClass_.show.call(this);
};

/**
 * Update svg attributes to match internal state.
 */
Blockly.FlyoutButton.prototype.updateTransform_ = function() {
  Blockly.FlyoutButton.superClass_.updateTransform_.call(this);
};

/**
 * Move the button to the given x, y coordinates.
 * @param {number} x The new x coordinate.
 * @param {number} y The new y coordinate.
 */
Blockly.FlyoutButton.prototype.moveTo = function(x, y) {
  Blockly.FlyoutButton.superClass_.moveTo.call(this, x, y);
};

/**
 * Dispose of this button.
 */
Blockly.FlyoutButton.prototype.dispose = function() {
  Blockly.FlyoutButton.superClass_.moveTo.dispose(this);
};

/**
 * Do something when the button is clicked.
 * @param {!Event} e Mouse up event.
 */
Blockly.FlyoutButton.prototype.onMouseUp = function(e) {
  // Don't scroll the page.
  e.preventDefault();
  // Don't propagate mousewheel event (zooming).
  e.stopPropagation();

  Blockly.Variables.createVariable(this.targetWorkspace_);
};
