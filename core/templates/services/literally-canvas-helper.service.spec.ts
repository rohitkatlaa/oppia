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
 * @fileoverview Unit test for LiterallyCanvasHelperService.
 */

import { UpgradedServices } from 'services/UpgradedServices';


fdescribe('LiterallyCanvasHelperService', function() {
  var LiterallyCanvasHelperService = null;

  beforeEach(angular.mock.module('oppia'));
  beforeEach(angular.mock.module('oppia', function($provide) {
    var ugs = new UpgradedServices();
    for (let [key, value] of Object.entries(ugs.getUpgradedServices())) {
      $provide.value(key, value);
    }
  }));

  beforeEach(angular.mock.inject(function($injector) {
    LiterallyCanvasHelperService = $injector.get('LiterallyCanvasHelperService');
  }));

  it('should convert a rectangle shapeobject to svg tag', function() {
    var rectShape = {
      'x': 142.5,
      'y': 96.5,
      'width': 12,
      'height': 29,
      'strokeWidth': 2,
      'strokeColor': 'hsla(0, 0%, 0%, 1)',
      'fillColor': 'hsla(0, 0%, 100%, 1)',
      'id': 'de569866-9c11-b553-f5b7-4194e2380d9f'
    }
    var actualSvgTag = "<rect id='rectangle-de569866-9c11-b553-f5b7-4194e2380d9f' x='142.5' y='96.5' width='12' height='29' stroke='hsla(0, 0%, 0%, 1)' fill='hsla(0, 0%, 100%, 1)' stroke-width='2' />";
    var svgTag = null;
    svgTag = (
      LiterallyCanvasHelperService.rectangleSVGRenderer(rectShape)
    )
    expect(svgTag).toBe(actualSvgTag);
  });

  it('should convert a ellpise shapeobject to svg tag', function() {
    var ellipseShape = {
      'x': 60.5,
      'y': 77.5,
      'width': 30,
      'height': 45,
      'strokeWidth': 2,
      'strokeColor': 'hsla(0, 0%, 0%, 1)',
      'fillColor': 'hsla(0, 0%, 100%, 1)',
      'id': '4343fcbf-b1e9-3c6d-fcc8-809c00c6ba9b'
    }
    var actualSvgTag = "<ellipse id='ellipse-4343fcbf-b1e9-3c6d-fcc8-809c00c6ba9b' cx='75.5' cy='99.5' rx='15' ry='22' stroke='hsla(0, 0%, 0%, 1)' fill='hsla(0, 0%, 100%, 1)' stroke-width='2' />";
    var svgTag = null;
    svgTag = (
      LiterallyCanvasHelperService.ellipseSVGRenderer(ellipseShape)
    )
    expect(svgTag).toBe(actualSvgTag);
  });

  it('should convert a text shapeobject to svg tag', function() {
    var textShape = {
      'x': 72.5,
      'y': 142.5,
      'text': 'hello',
      'color': 'hsla(0, 0%, 0%, 1)',
      'font': '18px \"Helvetica Neue\",Helvetica,Arial,sans-serif',
      'forcedWidth': 0,
      'forcedHeight': 0,
      'v': 1,
      'id': '90ee8761-dd62-9d70-b61a-02e6fec487e9'
    }
    var actualSvgTag = `<text id='text-90ee8761-dd62-9d70-b61a-02e6fec487e9' x='72.5' y='142.5'   fill='hsla(0, 0%, 0%, 1)' style='font: 18px "Helvetica Neue",Helvetica,Arial,sans-serif;'> <tspan x='72.5' dy='0' alignment-baseline='text-before-edge'> hello </tspan> </text>`;
    var svgTag = null;
    svgTag = (
      LiterallyCanvasHelperService.textSVGRenderer(textShape)
    )
    expect(svgTag).toBe(actualSvgTag);
  });

  it('should convert a line shapeobject to svg tag', function() {
    var lineShape = {
      'x1': 20.5,
      'y1': 104.5,
      'x2': 43.5,
      'y2': 97.5,
      'strokeWidth': 2,
      'color': 'hsla(0, 0%, 0%, 1)',
      'capStyle': 'round',
      'dash': null,
      'endCapShapes': [
        null,
        null
      ],
      'id': 'dfee1d2f-4959-8371-b036-a30b2982bb20'
    }
    var actualSvgTag = "<g id='line-dfee1d2f-4959-8371-b036-a30b2982bb20' > <line x1='20.5' y1='104.5' x2='43.5' y2='97.5'  stroke-linecap='round' stroke='hsla(0, 0%, 0%, 1)' stroke-width='2' />  </g>";
    var svgTag = null;
    svgTag = (
      LiterallyCanvasHelperService.lineSVGRenderer(lineShape)
    )
    expect(svgTag).toBe(actualSvgTag);
  });

  it('should convert a linepath shapeobject to svg tag', function() {
    var linepathShape = {
      "points": [
        {
          'x': 57,
          'y': 170,
          'color': "hsla(0, 0%, 0%, 1)",
          'size': 2
        },
        {
          'x': 65,
          'y': 176,
          'color': "hsla(0, 0%, 0%, 1)",
          'size': 2
        }
      ],
      "smoothedPoints": [
        {
          'x': 57,
          'y': 170,
          'color': "hsla(0, 0%, 0%, 1)",
          'size': 2
        },
        {
          'x': 65,
          'y': 176,
          'color': "hsla(0, 0%, 0%, 1)",
          'size': 2
        }
      ],
      "id": "e09d8a59-88d2-1714-b721-032dc017b81d"
    }
    var actualSvgTag = "<polyline id='linepath-e09d8a59-88d2-1714-b721-032dc017b81d' fill='none' points='57,170 65,176' stroke='hsla(0, 0%, 0%, 1)' stroke-linecap='round' stroke-width='2' />"
    var svgTag = null;
    svgTag = (
      LiterallyCanvasHelperService.linepathSVGRenderer(linepathShape)
    )
    expect(svgTag).toBe(actualSvgTag);
  });

  it('should convert a polygon shapeobject to svg tag', function() {
    var polygonShape = {
      "strokeWidth": 2,
      "fillColor": "hsla(0, 0%, 100%, 1)",
      "strokeColor": "hsla(0, 0%, 0%, 1)",
      "isClosed": true,
      "points": [
        {
          'x': 146,
          'y': 108,
          'color': "hsla(0, 0%, 0%, 1)",
          'size': 2
        },
        {
          'x': 72,
          'y': 174,
          'color': "hsla(0, 0%, 0%, 1)",
          'size': 2
        },
        {
          'x': 156,
          'y': 208,
          'color': "hsla(0, 0%, 0%, 1)",
          'size': 2
        },
        {
          'x': 220,
          'y': 149,
          'color': "hsla(0, 0%, 0%, 1)",
          'size': 2
        }
      ],
      "id": "89874c6a-1e67-a13d-d4e4-6fa1cabbbc58"
    }
    var actualSvgTag = "<polygon id='polygon-closed-89874c6a-1e67-a13d-d4e4-6fa1cabbbc58' fill='hsla(0, 0%, 100%, 1)' points='146,108 72,174 156,208 220,149' stroke='hsla(0, 0%, 0%, 1)' stroke-width='2' />"
    var svgTag = null;
    svgTag = (
      LiterallyCanvasHelperService.polygonSVGRenderer(polygonShape)
    )
    expect(svgTag).toBe(actualSvgTag);
  });

});
    
