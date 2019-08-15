// Copyright 2016 The Oppia Authors. All Rights Reserved.
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
 * @fileoverview Directive for the showing Editor Navigation in small screen.
 */

require(
  'components/common-layout-directives/common-elements/' +
  'loading-dots.directive.ts');

require('domain/utilities/UrlInterpolationService.ts');
require('services/ContextService.ts');
require('services/ExplorationFeaturesService.ts');
require('services/SiteAnalyticsService.ts');
require('services/UserService.ts');
require('services/contextual/WindowDimensionsService.ts');
require('services/EditabilityService.ts');
require('pages/exploration-editor-page/services/exploration-rights.service.ts');
require(
  'pages/exploration-editor-page/services/exploration-warnings.service.ts');
require('pages/exploration-editor-page/services/router.service.ts');
require(
  'pages/exploration-editor-page/feedback-tab/services/thread-data.service.ts');
require('pages/exploration-editor-page/services/change-list.service.ts');
require('pages/exploration-editor-page/services/exploration-save.service.ts');

angular.module('oppia').directive('editorNavigationDropdown', [
  'UrlInterpolationService', function(UrlInterpolationService) {
    return {
      restrict: 'E',
      templateUrl: UrlInterpolationService.getDirectiveTemplateUrl(
        '/pages/exploration-editor-page/editor-navigation/' +
        'editor-navigation-dropdown.directive.html'),
      controller: [
        '$rootScope', '$scope', '$timeout', '$uibModal', 'ContextService',
        'ChangeListService', 'EditabilityService',
        'ExplorationFeaturesService', 'ExplorationRightsService',
        'ExplorationWarningsService', 'ExplorationSaveService', 'RouterService',
        'SiteAnalyticsService',
        'ThreadDataService', 'UserService', 'WindowDimensionsService',
        function(
            $rootScope, $scope, $timeout, $uibModal, ContextService,
            ChangeListService, EditabilityService,
            ExplorationFeaturesService, ExplorationRightsService,
            ExplorationWarningsService, ExplorationSaveService, RouterService,
            SiteAnalyticsService,
            ThreadDataService, UserService, WindowDimensionsService) {
          $scope.saveIsInProcess = false;
          $scope.publishIsInProcess = false;
          $scope.loadingDotsAreShown = false;
          $scope.showPublishButton = function() {
            return GLOBALS.can_publish && ExplorationRightsService.isPrivate();
          };

          $scope.isPrivate = function() {
            return ExplorationRightsService.isPrivate();
          };

          $scope.isExplorationLockedForEditing = function() {
            return ChangeListService.isExplorationLockedForEditing();
          };

          $scope.isEditableOutsideTutorialMode = function() {
            return EditabilityService.isEditableOutsideTutorialMode() ||
              EditabilityService.isTranslatable();
          };

          $scope.countWarnings = function() {
            return ExplorationWarningsService.countWarnings();
          };

          $scope.discardChanges = function() {
            ExplorationSaveService.discardChanges();
          };

          $scope.getChangeListLength = function() {
            return ChangeListService.getChangeList().length;
          };

          $scope.isExplorationSaveable = function() {
            return ExplorationSaveService.isExplorationSaveable();
          };

          $scope.getPublishExplorationButtonTooltip = function() {
            if (ExplorationWarningsService.countWarnings() > 0) {
              return 'Please resolve the warnings before publishing.';
            } else if (ChangeListService.isExplorationLockedForEditing()) {
              return 'Please save your changes before publishing.';
            } else {
              return 'Publish to Oppia Library';
            }
          };

          $scope.getSaveButtonTooltip = function() {
            if (ExplorationWarningsService.hasCriticalWarnings() > 0) {
              return 'Please resolve the warnings.';
            } else if (ExplorationRightsService.isPrivate()) {
              return 'Save Draft';
            } else {
              return 'Publish Changes';
            }
          };

          var showLoadingDots = function() {
            $scope.loadingDotsAreShown = true;
          };

          var hideLoadingDots = function() {
            $scope.loadingDotsAreShown = false;
          };

          $scope.showPublishExplorationModal = function() {
            $scope.publishIsInProcess = true;
            $scope.loadingDotsAreShown = true;

            ExplorationSaveService.showPublishExplorationModal(
              showLoadingDots, hideLoadingDots)
              .then(function() {
                $scope.publishIsInProcess = false;
                $scope.loadingDotsAreShown = false;
              });
          };

          $scope.saveChanges = function() {
            $scope.saveIsInProcess = true;
            $scope.loadingDotsAreShown = true;

            ExplorationSaveService.saveChanges(showLoadingDots, hideLoadingDots)
              .then(function() {
                $scope.saveIsInProcess = false;
                $scope.loadingDotsAreShown = false;
              });
          };
          $scope.popoverControlObject = {
            postTutorialHelpPopoverIsShown: false
          };
          $scope.isLargeScreen = (WindowDimensionsService.getWidth() >= 1024);
          $scope.isImprovementsTabEnabled = function() {
            return ExplorationFeaturesService.isInitialized() &&
              ExplorationFeaturesService.isImprovementsTabEnabled();
          };
          $scope.isFeedbackTabEnabled = function() {
            return ExplorationFeaturesService.isInitialized() &&
              !ExplorationFeaturesService.isImprovementsTabEnabled();
          };

          $scope.$on('openPostTutorialHelpPopover', function() {
            if ($scope.isLargeScreen) {
              $scope.popoverControlObject.postTutorialHelpPopoverIsShown = true;
              $timeout(function() {
                $scope.popoverControlObject
                  .postTutorialHelpPopoverIsShown = false;
              }, 4000);
            } else {
              $scope.popoverControlObject
                .postTutorialHelpPopoverIsShown = false;
            }
          });

          $scope.userIsLoggedIn = null;
          UserService.getUserInfoAsync().then(function(userInfo) {
            $scope.userIsLoggedIn = userInfo.isLoggedIn();
          });

          $scope.showUserHelpModal = function() {
            var explorationId = ContextService.getExplorationId();
            SiteAnalyticsService.registerClickHelpButtonEvent(explorationId);
            var EDITOR_TUTORIAL_MODE = 'editor';
            var TRANSLATION_TUTORIAL_MODE = 'translation';
            var modalInstance = $uibModal.open({
              templateUrl: UrlInterpolationService.getDirectiveTemplateUrl(
                '/pages/exploration-editor-page/modal-templates/' +
                'help-modal.template.html'),
              backdrop: true,
              controller: [
                '$scope', '$uibModalInstance',
                'SiteAnalyticsService', 'ContextService',
                function(
                    $scope, $uibModalInstance,
                    SiteAnalyticsService, ContextService) {
                  var explorationId = (
                    ContextService.getExplorationId());

                  $scope.beginEditorTutorial = function() {
                    SiteAnalyticsService
                      .registerOpenTutorialFromHelpCenterEvent(
                        explorationId);
                    $uibModalInstance.close(EDITOR_TUTORIAL_MODE);
                  };

                  $scope.beginTranslationTutorial = function() {
                    SiteAnalyticsService
                      .registerOpenTutorialFromHelpCenterEvent(
                        explorationId);
                    $uibModalInstance.close(TRANSLATION_TUTORIAL_MODE);
                  };

                  $scope.goToHelpCenter = function() {
                    SiteAnalyticsService.registerVisitHelpCenterEvent(
                      explorationId);
                    $uibModalInstance.dismiss('cancel');
                  };
                }
              ],
              windowClass: 'oppia-help-modal'
            });

            modalInstance.result.then(function(mode) {
              if (mode === EDITOR_TUTORIAL_MODE) {
                $rootScope.$broadcast('openEditorTutorial');
              } else if (mode === TRANSLATION_TUTORIAL_MODE) {
                $rootScope.$broadcast('openTranslationTutorial');
              }
            }, function() {
            });
          };

          $scope.countWarnings = ExplorationWarningsService.countWarnings;
          $scope.getWarnings = ExplorationWarningsService.getWarnings;
          $scope.hasCriticalWarnings = (
            ExplorationWarningsService.hasCriticalWarnings);

          $scope.ExplorationRightsService = ExplorationRightsService;
          $scope.getActiveTabName = RouterService.getActiveTabName;
          $scope.selectMainTab = RouterService.navigateToMainTab;
          $scope.selectTranslationTab = RouterService.navigateToTranslationTab;
          $scope.selectPreviewTab = RouterService.navigateToPreviewTab;
          $scope.selectSettingsTab = RouterService.navigateToSettingsTab;
          $scope.selectStatsTab = RouterService.navigateToStatsTab;
          $scope.selectImprovementsTab =
            RouterService.navigateToImprovementsTab;
          $scope.selectHistoryTab = RouterService.navigateToHistoryTab;
          $scope.selectFeedbackTab = RouterService.navigateToFeedbackTab;
          $scope.getOpenThreadsCount = ThreadDataService.getOpenThreadsCount;
          WindowDimensionsService.registerOnResizeHook(function() {
            $scope.isLargeScreen = (WindowDimensionsService.getWidth() >= 1024);
          });
        }
      ]
    };
  }
]);
