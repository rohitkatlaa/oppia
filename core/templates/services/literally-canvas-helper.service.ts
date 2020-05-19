// Copyright 2019 The Oppia Authors. All Rights Reserved.
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
 * @fileoverview LiterallyCanvas editor helper service.
 */


angular.module('oppia').factory('LiterallyCanvasHelperService', [
  function() {
    const getPoints = (x, y, angle, width, length) => [
      {
          x: x + (Math.cos(angle + Math.PI / 2) * width) / 2,
          y: y + (Math.sin(angle + Math.PI / 2) * width) / 2,
      },
      {
          x: x + Math.cos(angle) * length,
          y: y + Math.sin(angle) * length,
      },
      {
          x: x + (Math.cos(angle - Math.PI / 2) * width) / 2,
          y: y + (Math.sin(angle - Math.PI / 2) * width) / 2,
      },
    ];
    const arrow = {
      svg(x, y, angle, width, color, position, length = null) {
          if (length == null) {
              length = 0;
          }
          length = length || width;
          const points = getPoints(x, y, angle, width, length);

          return "<polygon id='"+ position +"' fill='" + color +"' stroke='none' points='" + (points.map(function(p) {
        return p.x + "," + p.y;
        }).join(' ')) + "' />";
      }
    };

    var svgToSnapshot = function(node) {
      var id = node.attributes.id.value.split("-")
      // shape is of type any because the key value pair of shape is different
      // for each shape.
      var shape:any ={}
      if(id[0] == "ellipse"){
        shape.className = "Ellipse";
        shape.data = {};
        shape.data.x = node.attributes.cx.value-node.attributes.rx.value;
        shape.data.y = node.attributes.cy.value-node.attributes.ry.value;
        shape.data.width  = 2*node.attributes.rx.value;
        shape.data.height  = 2*node.attributes.ry.value;
        shape.data.strokeWidth = parseInt(node.attributes["stroke-width"].value);
        shape.data.strokeColor = node.attributes.stroke.value;
        shape.data.fillColor = node.attributes.fill.value;
        shape.id = id.slice(1).join("-");
      } 
      else if(id[0] == "rectangle") {
        shape.className = "Rectangle";
        shape.data = {};
        var strokeWidth = node.attributes["stroke-width"].value;
        var shift = 0;
        if (strokeWidth % 2 !== 0) {
          shift = 0.5;
        }
        shape.data.x = node.attributes.x.value - shift;
        shape.data.y = node.attributes.y.value - shift;
        shape.data.width = parseInt(node.attributes.width.value);
        shape.data.height = parseInt(node.attributes.height.value);
        shape.data.strokeWidth = parseInt(strokeWidth);
        shape.data.strokeColor = node.attributes.stroke.value;
        shape.data.fillColor = node.attributes.fill.value;
        shape.id = id.slice(1).join("-");
      }
      else if(id[0] == "line"){
        shape.className = "Line";
        // console.log(node)
        var innerTags = node.querySelectorAll("*");
        var lineTag = innerTags[0];
        var shift = 0;
        var strokeWidth = lineTag.attributes["stroke-width"].value;
        if (strokeWidth % 2 !== 0) {
          shift = 0.5;
        }
        shape.data = {};
        shape.data.x1 = lineTag.attributes.x1.value - shift;
        shape.data.y1 = lineTag.attributes.y1.value - shift;
        shape.data.x2 = lineTag.attributes.x2.value - shift;
        shape.data.y2 = lineTag.attributes.y2.value - shift;
        shape.data.strokeWidth = parseInt(strokeWidth);
        shape.data.color = lineTag.attributes.stroke.value;
        shape.data.capString = lineTag.attributes["stroke-linecap"].value;
        shape.data.dash = null;
        shape.id = id.slice(1).join("-");
        if(typeof lineTag.attributes["stroke-dasharray"] !== 'undefined'){
          shape.data.dash = lineTag.attributes["stroke-dasharray"].value.split(', ').map(a => parseInt(a));
        }
        shape.data.endCapShapes = [null, null];
        if(innerTags.length > 1){
          var position = innerTags[1].attributes.id.value.slice(-1);
          if(position == '0'){
            shape.data.endCapShapes[0] = "arrow";
          }
          else {
            shape.data.endCapShapes[1] = "arrow";
          }
          if(innerTags.length == 3){
            var position = innerTags[2].attributes.id.value.slice(-1);
            if(position == '0'){
              shape.data.endCapShapes[0] = "arrow";
            }
            else {
              shape.data.endCapShapes[1] = "arrow";
            }
          }
        }
      }
      else if(id[0] == "linepath"){
        shape.className = "LinePath"
        shape.data = {}
        shape.data.order = 3;
        shape.data.tailSize = 3;
        shape.data.smooth = true;
        var smoothedPoints = node.attributes.points.value.split(' ').map(a => a.split(',').map(b => parseFloat(b)))
        var points = []
        for(var i=0;i<smoothedPoints.length;i+=8){
          points.push(smoothedPoints[i]);
        }
        shape.data.pointCoordinatePairs = points;
        shape.data.smoothedPointCoordinatePairs = smoothedPoints;
        shape.data.pointSize = parseInt(node.attributes["stroke-width"].value);
        shape.data.pointColor = node.attributes.stroke.value;
        shape.id = id.slice(1).join("-");
      }
      else if(id[0] == 'polygon'){
        shape.className = "Polygon"
        shape.data={};
        if(id[1] == 'closed'){
          var strokeWidth = node.attributes["stroke-width"].value;
          shape.data.strokeWidth = parseInt(strokeWidth);
          shape.data.fillColor = node.attributes.fill.value;
          shape.data.strokeColor = node.attributes.stroke.value;
          shape.data.dash = null;
          if(typeof node.attributes["stroke-dasharray"] !== 'undefined'){
            shape.data.dash = node.attributes["stroke-dasharray"].value.split(', ').map(a => parseInt(a));
          }
          shape.data.isClosed = true;
          var shift = 0;
          if (strokeWidth % 2 !== 0) {
            shift = 0.5;
          }
          shape.data.pointCoordinatePairs = node.attributes.points.value.split(' ').map(a => a.split(',').map(b => parseFloat(b) - shift))
        }
        else{
          var innerPolygon = node.querySelectorAll("*")[0];
          var outerPolygon = node.querySelectorAll("*")[1];
          var strokeWidth = outerPolygon.attributes["stroke-width"].value;
          shape.data.strokeWidth = parseInt(strokeWidth);
          shape.data.fillColor = innerPolygon.attributes.fill.value;
          shape.data.strokeColor = outerPolygon.attributes.stroke.value;
          shape.data.dash = null;
          if(typeof outerPolygon.attributes["stroke-dasharray"] !== 'undefined'){
            shape.data.dash = outerPolygon.attributes["stroke-dasharray"].value.split(', ').map(a => parseInt(a));
          }
          shape.data.isClosed = false;
          var shift = 0;
          if (strokeWidth % 2 !== 0) {
            shift = 0.5;
          }
          shape.data.pointCoordinatePairs = innerPolygon.attributes.points.value.split(' ').map(a => a.split(',').map(b => parseFloat(b) - shift))
        }
        shape.id = id.slice(2).join("-");
      }
      else if(id[0] == 'text'){
        shape.className = "Text"
        shape.data={};
        shape.data.x = parseFloat(node.attributes.x.value);
        shape.data.y = parseFloat(node.attributes.y.value);
        var text = "";
        node.querySelectorAll("*").forEach(a=>{
          text += a.innerHTML.slice(1,-1) + "\n";
        })
        shape.data.text = text.slice(0,-1);
        shape.data.color = node.attributes.fill.value;
        shape.data.font = node.attributes.style.value.slice(6,-1);
        shape.data.forcedWidth = typeof node.attributes.width !== 'undefined' ? parseFloat(node.attributes.width.value) : 0;
        shape.data.forcedHeight = typeof node.attributes.height !== 'undefined' ? parseFloat(node.attributes.height.value) : 0;
      }
      return shape;
    };
    return {
      svgParse: function(svgString, lc){
        var domParser = new DOMParser();
        var doc = domParser.parseFromString(svgString, 'text/xml');
        var snapshot = {
          colors: {
            primary: "",
            secondary: "",
            background: ""
          },
          position: "",
          scale: 1,
          shapes: [],
          backgroundShapes: [],
          imageSize: {
            width: "",
            height: ""
          }
        };
        var rect = doc.querySelector('svg > rect');
        snapshot.colors.primary = lc.colors.primary;
        snapshot.colors.secondary = lc.colors.secondary;
        snapshot.colors.background = rect.attributes.fill.value;
        snapshot.position = lc.position;
        snapshot.backgroundShapes = lc.backgroundShapes;
        snapshot.imageSize.width = rect.attributes.width.value;
        snapshot.imageSize.height = rect.attributes.height.value;

        doc.querySelectorAll('svg > g > *').forEach((node) => {
          snapshot.shapes.push(svgToSnapshot(node));
        })
        return snapshot;
      },

      rectangleSVGRenderer: function(shape) {
        var height, width, x, x1, x2, y, y1, y2, id;
        x1 = shape.x;
        y1 = shape.y;
        x2 = shape.x + shape.width;
        y2 = shape.y + shape.height;
        x = Math.min(x1, x2);
        y = Math.min(y1, y2);
        width = Math.max(x1, x2) - x;
        height = Math.max(y1, y2) - y;
        if (shape.strokeWidth % 2 !== 0) {
          x += 0.5;
          y += 0.5;
        }
        id = "rectangle-" + shape.id;
        return "<rect id='" + id + "' x='" + x + "' y='" + y + "' width='" + width + "' height='" + height + "' stroke='" + shape.strokeColor + "' fill='" + shape.fillColor + "' stroke-width='" + shape.strokeWidth + "' />";
      },

      ellipseSVGRenderer: function(shape) {
        var centerX, centerY, halfHeight, halfWidth, id;
        halfWidth = Math.floor(shape.width / 2);
        halfHeight = Math.floor(shape.height / 2);
        centerX = shape.x + halfWidth;
        centerY = shape.y + halfHeight;
        id = "ellipse-" + shape.id;
        return "<ellipse id='" + id + "' cx='" + centerX + "' cy='" + centerY + "' rx='" + (Math.abs(halfWidth)) + "' ry='" + (Math.abs(halfHeight)) + "' stroke='" + shape.strokeColor + "' fill='" + shape.fillColor + "' stroke-width='" + shape.strokeWidth + "' />";
      },

      lineSVGRenderer: function(shape) {
        var arrowWidth, capString, dashString, x1, x2, y1, y2, id;
        dashString = shape.dash ? "stroke-dasharray='" + (shape.dash.join(', ')) + "'" : '';
        capString = '';
        arrowWidth = Math.max(shape.strokeWidth * 2.2, 5);
        x1 = shape.x1;
        x2 = shape.x2;
        y1 = shape.y1;
        y2 = shape.y2;
        if (shape.strokeWidth % 2 !== 0) {
          x1 += 0.5;
          x2 += 0.5;
          y1 += 0.5;
          y2 += 0.5;
        }
        if (shape.endCapShapes[0]) {
          capString += arrow.svg(x1, y1, Math.atan2(y1 - y2, x1 - x2), arrowWidth, shape.color, "position0");
        }
        if (shape.endCapShapes[1]) {
          capString += arrow.svg(x2, y2, Math.atan2(y2 - y1, x2 - x1), arrowWidth, shape.color, "position1");
        }
        id = "line-" + shape.id;
        return "<g id='" + id + "' > <line x1='" + x1 + "' y1='" + y1 + "' x2='" + x2 + "' y2='" + y2 + "' " + dashString + " stroke-linecap='" + shape.capStyle + "' stroke='" + shape.color + "' stroke-width='" + shape.strokeWidth + "' /> " + capString + " </g>";
      },

      linepathSVGRenderer: function(shape) {
        var id = "linepath-" + shape.id;
        return "<polyline id='" + id + "' fill='none' points='" + (shape.smoothedPoints.map(function(p) {
          var offset;
          offset = p.size % 2 === 0 ? 0.0 : 0.5;
          return (p.x + offset) + "," + (p.y + offset);
        }).join(' ')) + "' stroke='" + shape.points[0].color + "' stroke-linecap='round' stroke-width='" + shape.points[0].size + "' />";
      },

      polygonSVGRenderer: function(shape) {
        if (shape.isClosed) {
          var id = "polygon-closed-" + shape.id;
          return "<polygon id='" + id + "' fill='" + shape.fillColor + "' points='" + (shape.points.map(function(p) {
            var offset;
            offset = p.size % 2 === 0 ? 0.0 : 0.5;
            return (p.x + offset) + "," + (p.y + offset);
          }).join(' ')) + "' stroke='" + shape.strokeColor + "' stroke-width='" + shape.strokeWidth + "' />";
        } else {
          var id = "polygon-open-" + shape.id;
          return "<g id='" + id + "' > <polyline fill='" + shape.fillColor + "' points='" + (shape.points.map(function(p) {
            var offset;
            offset = p.size % 2 === 0 ? 0.0 : 0.5;
            return (p.x + offset) + "," + (p.y + offset);
          }).join(' ')) + "' stroke='none' /> <polyline fill='none' points='" + (shape.points.map(function(p) {
            var offset;
            offset = p.size % 2 === 0 ? 0.0 : 0.5;
            return (p.x + offset) + "," + (p.y + offset);
          }).join(' ')) + "' stroke='" + shape.strokeColor + "' stroke-width='" + shape.strokeWidth + "' /> </g>";
        }
      },

      textSVGRenderer: function(shape) {
        var heightString, textSplitOnLines, widthString, id;
        widthString = shape.forcedWidth ? "width='" + shape.forcedWidth + "px'" : "";
        heightString = shape.forcedHeight ? "height='" + shape.forcedHeight + "px'" : "";
        textSplitOnLines = shape.text.split(/\r\n|\r|\n/g);
        if (shape.renderer) {
          textSplitOnLines = shape.renderer.lines;
        }
        id = "text-" + shape.id;
        return "<text id='" + id + "' x='" + shape.x + "' y='" + shape.y + "' " + widthString + " " + heightString + " fill='" + shape.color + "' style='font: " + shape.font + ";'> " + (textSplitOnLines.map((function(_this) {
          return function(line, i) {
            var dy;
            dy = i === 0 ? 0 : '1.2em';
            return "<tspan x='" + shape.x + "' dy='" + dy + "' alignment-baseline='text-before-edge'> " + line + " </tspan>";
          };
        })(this)).join('')) + " </text>";
      }
    };
  }
]);
