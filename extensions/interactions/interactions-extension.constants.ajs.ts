// Copyright 2018 The Oppia Authors. All Rights Reserved.
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
 * @fileoverview Constants for interactions extensions.
 */

// TODO(#7092): Delete this file once migration is complete and these AngularJS
// equivalents of the Angular constants are no longer needed.
import { InteractionsExtensionsConstants } from
  'interactions/interactions-extension.constants';

// Minimum confidence required for a predicted answer group to be shown to user.
// Generally a threshold of 0.7-0.8 is assumed to be a good one in practice,
// however value need not be in those bounds.
angular.module('oppia').constant(
  'CODE_REPL_PREDICTION_SERVICE_THRESHOLD',
  InteractionsExtensionsConstants.CODE_REPL_PREDICTION_SERVICE_THRESHOLD);

angular.module('oppia').constant(
  'GRAPH_INPUT_LEFT_MARGIN',
  InteractionsExtensionsConstants.GRAPH_INPUT_LEFT_MARGIN);

// Gives the staff-lines human readable values.
angular.module('oppia').constant(
  'NOTE_NAMES_TO_MIDI_VALUES',
  InteractionsExtensionsConstants.NOTE_NAMES_TO_MIDI_VALUES);

// Minimum confidence required for a predicted answer group to be shown to user.
// Generally a threshold of 0.7-0.8 is assumed to be a good one in practice,
// however value need not be in those bounds.
angular.module('oppia').constant(
  'TEXT_INPUT_PREDICTION_SERVICE_THRESHOLD',
  InteractionsExtensionsConstants.TEXT_INPUT_PREDICTION_SERVICE_THRESHOLD);
