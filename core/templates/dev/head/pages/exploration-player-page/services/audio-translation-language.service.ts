// Copyright 2017 The Oppia Authors. All Rights Reserved.
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
 * @fileoverview Service to manage the current language being
 * used for audio translations.
 */

require('domain/utilities/browser-checker.service.ts');
require('domain/utilities/language-util.service.ts');

angular.module('oppia').factory('AudioTranslationLanguageService', [
  'BrowserCheckerService', 'LanguageUtilService',
  function(
      BrowserCheckerService, LanguageUtilService) {
    var _currentAudioLanguageCode = null;
    var _allAudioLanguageCodesInExploration = null;
    var _explorationLanguageCode = null;
    var _automaticTextToSpeechEnabled = null;
    var _languagesInExploration = [];

    var attemptToSetAudioLanguageToExplorationLanguage = function() {
      // We minimize the number of related languages, because we want to
      // pick the language that is the most directly related to the exploration
      // language. For example, this would prioritize Hindi over Hinglish
      // if both were available as audio languages.
      var numRelatedLanguages = Number.MAX_VALUE;
      _allAudioLanguageCodesInExploration.forEach(function(audioLanguageCode) {
        var relatedLanguageCodes =
          LanguageUtilService.getLanguageCodesRelatedToAudioLanguageCode(
            audioLanguageCode);
        if (relatedLanguageCodes.length < numRelatedLanguages &&
            relatedLanguageCodes.indexOf(_explorationLanguageCode) !== -1) {
          _currentAudioLanguageCode = audioLanguageCode;
          numRelatedLanguages = relatedLanguageCodes.length;
        }
      });
    };

    var _isAutogeneratedAudioAllowed = function() {
      return _automaticTextToSpeechEnabled &&
        LanguageUtilService.supportsAutogeneratedAudio(
          _explorationLanguageCode);
    };

    var _init = function(
        allAudioLanguageCodesInExploration, preferredAudioLanguageCode,
        explorationLanguageCode, automaticTextToSpeechEnabled) {
      _allAudioLanguageCodesInExploration = allAudioLanguageCodesInExploration;
      _explorationLanguageCode = explorationLanguageCode;
      _automaticTextToSpeechEnabled = automaticTextToSpeechEnabled;
      _languagesInExploration = [];
      // Set the audio language that is chosen initially.
      // Use the following priority (highest to lowest):
      // 1. If the learner has a preferred audio language set, then set it to
      // that language if it is available.
      // 2. If the exploration language has a related audio language, then set
      // it to that.
      // 3. If only the autogenerated audio language is available, then set it
      // to that.
      // 4. Otherwise, just pick an available non-autogenerated audio language
      // at random.
      if (preferredAudioLanguageCode &&
          allAudioLanguageCodesInExploration.indexOf(
            preferredAudioLanguageCode) !== -1) {
        _currentAudioLanguageCode = preferredAudioLanguageCode;
      }

      if (_currentAudioLanguageCode === null) {
        attemptToSetAudioLanguageToExplorationLanguage();
      }

      if (_currentAudioLanguageCode === null &&
          _allAudioLanguageCodesInExploration.length >= 1) {
        _currentAudioLanguageCode = _allAudioLanguageCodesInExploration[0];
      }

      if (_currentAudioLanguageCode === null &&
          _allAudioLanguageCodesInExploration.length === 0 &&
          _isAutogeneratedAudioAllowed()) {
        _currentAudioLanguageCode =
          LanguageUtilService.getAutogeneratedAudioLanguage(
            _explorationLanguageCode).id;
      }

      _allAudioLanguageCodesInExploration.forEach(function(languageCode) {
        var languageDescription =
          LanguageUtilService.getAudioLanguageDescription(languageCode);
        _languagesInExploration.push({
          value: languageCode,
          displayed: languageDescription
        });
      });

      if (_isAutogeneratedAudioAllowed()) {
        var autogeneratedAudioLanguage =
          LanguageUtilService.getAutogeneratedAudioLanguage(
            _explorationLanguageCode);
        _languagesInExploration.push({
          value: autogeneratedAudioLanguage.id,
          displayed: autogeneratedAudioLanguage.description
        });
      }
    };

    return {
      init: function(
          allAudioLanguageCodesInExploration, preferredAudioLanguageCode,
          explorationLanguageCode, automaticTextToSpeechEnabled) {
        _init(allAudioLanguageCodesInExploration, preferredAudioLanguageCode,
          explorationLanguageCode, automaticTextToSpeechEnabled);
      },
      getCurrentAudioLanguageCode: function() {
        return _currentAudioLanguageCode;
      },
      getCurrentAudioLanguageDescription: function() {
        return LanguageUtilService.getAudioLanguageDescription(
          _currentAudioLanguageCode);
      },
      getallAudioLanguageCodesInExploration: function() {
        return _allAudioLanguageCodesInExploration;
      },
      getLanguageOptionsForDropdown: function() {
        return _languagesInExploration;
      },
      clearCurrentAudioLanguageCode: function() {
        _currentAudioLanguageCode = null;
      },
      setCurrentAudioLanguageCode: function(newLanguageCode) {
        _currentAudioLanguageCode = newLanguageCode;
      },
      isAutogeneratedAudioAllowed: function() {
        return _isAutogeneratedAudioAllowed();
      },
      isAutogeneratedLanguageCodeSelected: function() {
        return LanguageUtilService.isAutogeneratedAudioLanguage(
          _currentAudioLanguageCode);
      },
      isAutomaticTextToSpeechEnabled: function() {
        return _automaticTextToSpeechEnabled;
      },
      getSpeechSynthesisLanguageCode: function() {
        var autogeneratedAudioLanguage =
          LanguageUtilService.getAutogeneratedAudioLanguage(
            _explorationLanguageCode);
        if (BrowserCheckerService.isMobileDevice()) {
          return autogeneratedAudioLanguage.speechSynthesisCodeMobile;
        }
        return autogeneratedAudioLanguage.speechSynthesisCode;
      }
    };
  }]);
