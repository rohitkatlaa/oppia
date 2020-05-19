import { lch } from "d3";

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
 * @fileoverview Directive for literally canvas diagram editor.
 */


require('domain/utilities/url-interpolation.service.ts');
require('services/alerts.service.ts');
require('services/csrf-token.service.ts');
require('pages/exploration-player-page/services/image-preloader.service.ts');
require('services/assets-backend-api.service.ts');
require('services/context.service.ts');
require('services/image-upload-helper.service.ts');
require('services/literally-canvas-helper.service.ts')


angular.module('oppia').directive('literallyCanvasDiagramEditor',[
  '$sce', '$timeout', 'AlertsService', 'AssetsBackendApiService', 'ContextService',
  'CsrfTokenService', 'ImagePreloaderService', 'ImageUploadHelperService','LiterallyCanvasHelperService',
  'UrlInterpolationService',
  function($sce, $timeout, AlertsService, AssetsBackendApiService, ContextService,
      CsrfTokenService, ImagePreloaderService, ImageUploadHelperService, LiterallyCanvasHelperService,
      UrlInterpolationService) {
    return {
      restrict: 'E',
      scope: {},
      bindToController: {
        value: '='
      },
      template: require('./literally-canvas-diagram-editor.directive.html'),
      controllerAs: '$ctrl',
      controller: ['$scope', function($scope) {
        var ctrl = this;
        ctrl.diagramStatus = 'editing';
        ctrl.maxDiagramWidth = 491;
        ctrl.maxDiagramHeight = 551;
        ctrl.diagramWidth = 450;
        ctrl.diagramHeight = 350;
        ctrl.savedSVGDiagram = '';
        ctrl.data = {};
        ctrl.invalidTagsAndAttributes = {
          tags: [],
          attrs: []
        };
        ctrl.entityId = ContextService.getEntityId();
        ctrl.entityType = ContextService.getEntityType();
        ctrl.svgContainerStyle = {};
        ctrl.onWidthInputBlur = function() {
          if(ctrl.diagramWidth < ctrl.maxDiagramWidth) {
            ctrl.lc.setImageSize(ctrl.diagramWidth, ctrl.diagramHeight);
          }
        }

        ctrl.onHeightInputBlur = function() {
          if(ctrl.diagramHeight < ctrl.maxDiagramHeight) {
            ctrl.lc.setImageSize(ctrl.diagramWidth, ctrl.diagramHeight);
          }
        }

        ctrl.getDiagramSizeHelp = function() {
          var maxWidth = ctrl.maxDiagramWidth;
          var maxHeight = ctrl.maxDiagramHeight;
          return 'This diagram has a maximum dimension of ' + maxWidth +
          "px X " + maxHeight + "px to ensure that it fits in the card."
        }

        ctrl.isDiagramCreated = function() {
          if(typeof(ctrl.lc) != "undefined" && ctrl.diagramStatus == 'editing'){
            var svgString = ctrl.lc.getSVGString();
            var domParser = new DOMParser();
            var doc = domParser.parseFromString(svgString, 'text/xml');
            var elements = doc.querySelectorAll('svg > g > *');
            if(elements.length > 0) {
              return true;
            }
          }
          return false;
        }

        ctrl.isUserDrawing = function() {
          if(typeof(ctrl.lc) != "undefined" &&
             ctrl.lc._shapesInProgress.length > 0) {
            return true;
          }
          return false;
        }

        ctrl.setSavedImageFilename = function(filename, setData) {
          ctrl.diagramStatus = 'saved';
          ctrl.data = {
            saveSVGFileName: filename,
            savedSVGUrl: getTrustedResourceUrlForImageFileName(filename)
          }
          ctrl.value = filename;
          if(setData) {
            $.get(ctrl.data.savedSVGUrl, function(data, status) {
              ctrl.savedSVGDiagram = data;
            }, 'text');
          }
        }

        var getTrustedResourceUrlForImageFileName = function(imageFileName) {
          var encodedFilepath = window.encodeURIComponent(imageFileName);
          return $sce.trustAsResourceUrl(
            AssetsBackendApiService.getImageUrlForPreview(
              ctrl.entityType, ctrl.entityId, encodedFilepath));
        };


        ctrl.postImageToServer = function(dimensions, resampledFile) {
          let form = new FormData();
          form.append('image', resampledFile);
          form.append('payload', JSON.stringify({
            filename: ImageUploadHelperService.generateImageFilename(
              dimensions.height, dimensions.width, 'svg')
          }));
          var imageUploadUrlTemplate = '/createhandler/imageupload/' +
            '<entity_type>/<entity_id>';
          CsrfTokenService.getTokenAsync().then(function(token) {
            form.append('csrf_token', token);
              $.ajax({
                url: UrlInterpolationService.interpolateUrl(
                  imageUploadUrlTemplate, {
                    entity_type: ctrl.entityType,
                    entity_id: ctrl.entityId
                  }
                ),
                data: form,
                processData: false,
                contentType: false,
                type: 'POST',
                dataFilter: function(data) {
                  // Remove the XSSI prefix.
                  var transformedData = data.substring(5);
                  return JSON.parse(transformedData);
                },
                dataType: 'text'
              }).done(function(data) {
                // Pre-load image before marking the image as saved.
                var img = new Image();
                img.onload = function() {
                  ctrl.setSavedImageFilename(data.filename, true);
                  var dimensions = (
                    ImagePreloaderService.getDimensionsOfImage(data.filename));
                  ctrl.svgContainerStyle = {
                    height: dimensions.height + 'px',
                    width: dimensions.width + 'px'
                  };
                  $scope.$apply();
                };
                img.src = getTrustedResourceUrlForImageFileName(data.filename);
              }).fail(function(data) {
                // Remove the XSSI prefix.
                var transformedData = data.responseText.substring(5);
                var parsedResponse = JSON.parse(transformedData);
                AlertsService.addWarning(
                  parsedResponse.error || 'Error communicating with server.');
                $scope.$apply();
              });
            });
        }

        ctrl.saveUploadedFile = function() {
          AlertsService.clearWarnings();

          if (!ctrl.isDiagramCreated()) {
            AlertsService.addWarning('Custom Diagram not created.');
            return;
          }

          ctrl.diagramStatus = 'saved';
          var svgString = ctrl.lc.getSVGString();
          var svgDataURI = 'data:image/svg+xml;base64,' + btoa(svgString);
          var dimensions = {
            width: ctrl.diagramWidth,
            height: ctrl.diagramHeight,
           }
          let resampledFile;
          ctrl.savedSVGDiagram = svgString;
          ctrl.invalidTagsAndAttributes = (
            ImageUploadHelperService.getInvalidSvgTagsAndAttrs(
              svgDataURI));
          var tags = ctrl.invalidTagsAndAttributes.tags;
          var attrs = ctrl.invalidTagsAndAttributes.attrs;
          if (tags.length === 0 && attrs.length === 0) {
            resampledFile = (
              ImageUploadHelperService.convertImageDataToImageFile(
                svgDataURI));
            ctrl.postImageToServer(dimensions, resampledFile);
          }
        }

        ctrl.isDiagramSaved = function() {
          return ctrl.diagramStatus == 'saved';
        }

        ctrl.continueDiagramEditing = function() {
          ctrl.diagramStatus = 'editing';
          ctrl.data = {};
          ctrl.invalidTagsAndAttributes = {
            tags: [],
            attrs: []
          };
          $timeout(function() {
            ctrl.lc = LC.init(document.getElementById("lc"), {
                imageSize: {width: 450, height: 350},
                imageURLPrefix: '/third_party/static/literallycanvas-0.4.14/img',
                toolbarPosition: 'bottom',
                defaultStrokeWidth: 2,
                strokeWidths: [1, 2, 3, 5, 30],
                tools: [
                  LC.tools.Pencil,
                  LC.tools.Line,
                  LC.tools.Ellipse,
                  LC.tools.Rectangle,
                  LC.tools.Text,
                  LC.tools.Polygon,
                  LC.tools.Pan,
                  LC.tools.Eyedropper
                ]
              });
            var snapshot = LiterallyCanvasHelperService.svgParse(ctrl.savedSVGDiagram, ctrl.lc)
            ctrl.lc.loadSnapshot(snapshot);
            })
        }

        
        
        
        ctrl.$onInit = function() {
          // A timeout is necessary because when literallyCanvas is initialized
          // container has no size. So a timeout is necessary to ensure that the
          // lc div is loaded into the DOM before literallyCanvas is initialized.
          // console.log("hi")
          // console.log(ctrl.value)
          // console.log("hi")
          if(ctrl.value) {
            ctrl.setSavedImageFilename(ctrl.value, false);
            var dimensions = (
              ImagePreloaderService.getDimensionsOfImage(ctrl.value));
            ctrl.svgContainerStyle = {
              height: dimensions.height + 'px',
              width: dimensions.width + 'px'
            };
          }
          $timeout(function() {
            LC.defineSVGRenderer('Rectangle', LiterallyCanvasHelperService.rectangleSVGRenderer);
            LC.defineSVGRenderer('Ellipse', LiterallyCanvasHelperService.ellipseSVGRenderer);
            LC.defineSVGRenderer('Line', LiterallyCanvasHelperService.lineSVGRenderer);
            LC.defineSVGRenderer('LinePath', LiterallyCanvasHelperService.linepathSVGRenderer);
            LC.defineSVGRenderer('Polygon', LiterallyCanvasHelperService.polygonSVGRenderer);
            LC.defineSVGRenderer('Text', LiterallyCanvasHelperService.textSVGRenderer);
            ctrl.lc = LC.init(document.getElementById("lc"), {
                imageSize: {width: 450, height: 350},
                imageURLPrefix: '/third_party/static/literallycanvas-0.4.14/img',
                toolbarPosition: 'bottom',
                defaultStrokeWidth: 2,
                strokeWidths: [1, 2, 3, 5, 30],
                // Eraser tool is removed because svgRenderer has not been
                // implimented in LiterallyCanvas. Can include once it is implimented.
                tools: [
                  LC.tools.Pencil,
                  LC.tools.Line,
                  LC.tools.Ellipse,
                  LC.tools.Rectangle,
                  LC.tools.Text,
                  LC.tools.Polygon,
                  LC.tools.Pan,
                  LC.tools.Eyedropper
                ]
              });
            }
          )
        }
      }]

    };
  }
]);
