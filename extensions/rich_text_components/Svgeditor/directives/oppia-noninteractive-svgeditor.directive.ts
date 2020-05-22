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
 * @fileoverview Directive for the Image rich-text component.
 *
 * IMPORTANT NOTE: The naming convention for customization args that are passed
 * into the directive is: the name of the parameter, followed by 'With',
 * followed by the name of the arg.
 */

require('pages/exploration-player-page/services/image-preloader.service.ts');
require('services/assets-backend-api.service.ts');
require('services/context.service.ts');
require('services/html-escaper.service.ts');

angular.module('oppia').directive('oppiaNoninteractiveSvgeditor', [
  'AssetsBackendApiService', 'ContextService',
  'HtmlEscaperService', 'ImagePreloaderService',
  function(
      AssetsBackendApiService, ContextService,
      HtmlEscaperService, ImagePreloaderService) {
    return {
      restrict: 'E',
      scope: {},
      bindToController: {},
      template: require('./svgeditor.directive.html'),
      controllerAs: '$ctrl',
      controller: ['$attrs', function($attrs) {
        var ctrl = this;
        ctrl.$onInit = function() {
          ctrl.filepath = HtmlEscaperService.escapedJsonToObj(
            $attrs.svgFilepathWithValue);
          ctrl.dimensions = (
            ImagePreloaderService.getDimensionsOfImage(ctrl.filepath));
          ctrl.svgContainerStyle = {
            height: ctrl.dimensions.height + 'px',
            width: ctrl.dimensions.width + 'px'
          };
          try {
            ctrl.svgUrl = AssetsBackendApiService.getImageUrlForPreview(
              ContextService.getEntityType(), ContextService.getEntityId(),
              ctrl.filepath);
          } catch (e) {
            var additionalInfo = (
              '\nEntity type: ' + ContextService.getEntityType() +
              '\nEntity ID: ' + ContextService.getEntityId() +
              '\nFilepath: ' + ctrl.filepath);
            e.message += additionalInfo;
            throw e;
          }
        ctrl.svgAltText = '';
        if ($attrs.altWithValue) {
          ctrl.svgAltText = HtmlEscaperService.escapedJsonToObj(
            $attrs.altWithValue);
        }

        }
      }]
    };
  }
]);