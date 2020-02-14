// Copyright 2014 The Oppia Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview End-to-end testing utilities for the Pencil Code
 * Editor.
 */

var waitFor = require('../../../core/tests/protractor_utils/waitFor.js');

var customizeInteraction = function(interactionEditor, initialCode) {
  // There are no customizations.
};

var expectInteractionDetailsToMatch = function(elem) {
  // expect(
  //   elem.element(by.css('.CodeMirror')).isPresent()
  // ).toBe(true);
};

var submitAnswer = function(conversationInput, answerCode) {
  browser.executeScript(
    'var editor = $(".CodeMirror")[0].CodeMirror;editor.setValue("' +
    answerCode + '");');
  var submitAnswerButton = element(by.css(
    '.protractor-test-submit-answer-button'));
  waitFor.elementToBeClickable(
    submitAnswerButton, 'Submit Answer button is not clickable');
  submitAnswerButton.click();
};

var answerObjectType = 'CodeString';

var testSuite = [{
  interactionArguments: ['# You can enter the Code below'],
  ruleArguments: ['CodeEquals', 'print("Hello World")'],
  expectedInteractionDetails: ['# You can enter the Code below'],
  wrongAnswers: ['print("Hello")'],
  correctAnswers: ['print("Hello World")']
}];

exports.customizeInteraction = customizeInteraction;
exports.expectInteractionDetailsToMatch = expectInteractionDetailsToMatch;
exports.submitAnswer = submitAnswer;
exports.answerObjectType = answerObjectType;
exports.testSuite = testSuite;

