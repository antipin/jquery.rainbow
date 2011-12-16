/**
 *  
 *  Rainbow jQuery library. v1.0
 *  jQuery plugin for slightly color changing effect
 *  
 *  Copyright (c) Labs42 | http://labs42.com
 *  Developer: Alex Antipin | http://alex.antipin.com
 *  Licensed under the MIT License (LICENSE.txt).
 * 
 *  This code based on Andrew Shitov's script:
 *
 *     Copyright (c) Art. Lebedev Studio | http://www.artlebedev.ru/
 *     Andrew Shitov | ash@design.ru	
 *     13.12.05; 30.02.06
 *
 *  HSV to RGB convertion algorithm with an example can be found
 *  at http://www.w3.org/TR/2003/CR-css3-color-20030514/#hsl-color
 *
 */

(function($) {
  
  $.fn.rainbow = function(givenOptions) {
      
    var classRainbow = function($this, o) {
      
      var
        colorTimer = null
      , castTimer = null
      , countDown = true // Math.floor (Math.random() + 0.5);
      , color = {
          
          // Current value
          h: 0,
          s: 0,
          v: 0,
          
          // Values range
          range: {
            h: {min: 0, max: 360, step: 2},
            s: {min: 40, max: 70, step: 5},
            v: {min: 30, max: 50, step: 5}
          }
        }
      ;
      
      var hex2hsv = function (h) {
        h = (h.charAt(0) == "#") ? h.substring(1, 7) : h;
        var r = parseInt(h.substring(0, 2), 16) / 255,
        g = parseInt(h.substring(2, 4), 16) / 255,
        b = parseInt(h.substring(4, 6), 16) / 255,
        result = {
          'h': 0,
          's': 0,
          'v': 0
        },
        minVal = Math.min(r, g, b),
        maxVal = Math.max(r, g, b),
        delta = (maxVal - minVal);
        result.v = maxVal;
        if (delta == 0) {
          result.h = 0;
          result.s = 0
        } else {
          result.s = delta / maxVal;
          var del_R = (((maxVal - r) / 6) + (delta / 2)) / delta;
          var del_G = (((maxVal - g) / 6) + (delta / 2)) / delta;
          var del_B = (((maxVal - b) / 6) + (delta / 2)) / delta;
          if (r == maxVal) result.h = del_B - del_G;
          else if (g == maxVal) result.h = (1 / 3) + del_R - del_B;
          else if (b == maxVal) result.h = (2 / 3) + del_G - del_R;
          if (result.h < 0) result.h += 1;
          if (result.h > 1) result.h -= 1
        }
        var rh = Math.round(result.h * 360),
        rs = Math.round(result.s * 100),
        rv = Math.round(result.v * 100);
        return {
          'h': rh,
          's': rs,
          'v': rv
        }
      }

      var hsv2rgb = function(h, s, v) {
        h /= 360;
        s /= 100;
        v /= 100;

        var m2 = v <= 0.5 ? v * (s + 1) : v + s - v * s;
        var m1 = v * 2 - m2;
        var r = norm2hex (hue2rgb (m1, m2, h + 1/3));
        var g = norm2hex (hue2rgb (m1, m2, h));
        var b = norm2hex (hue2rgb (m1, m2, h - 1/3));
        return r + '' + g + '' + b;
      }

      var hue2rgb = function(m1, m2, h) {
        if (h < 0) h = h + 1;
        if (h > 1) h = h - 1;
        if (h * 6 < 1) return m1 + (m2 - m1) * h * 6;
        if (h * 2 < 1) return m2;
        if (h * 3 < 2) return m1 + (m2 - m1) * (2/3 - h) * 6;
        return m1;
      } 

      var norm2hex = function(value) {
        return dec2hex (Math.floor (255 * value));
      }

      var dec2hex = function(dec) {
        var hexChars = "0123456789ABCDEF";
        var a = dec % 16;
        var b = (dec - a) / 16;
        return '' + hexChars.charAt (b) + hexChars.charAt (a);
      }
      
      var rgb2hex = function(rawRGB) {
        // Input value should be in rgb(xx, xx, xx) format
        if (rawRGB.substr(0, 4) == 'rgb(') {
          rawRGB = rawRGB.slice(4, -1);
          rawRGB = rawRGB.split(', ');
          return '#' + dec2hex(rawRGB[0]) + dec2hex(rawRGB[1]) + dec2hex(rawRGB[2]);
        }
        else {
          return false;
        }
      }
      
      var castColorParam = function(callback) {
        
        if (!castTimer) {
          
          castTimer = setInterval(
            function(){
              
              var
                params = ['v', 's']
              , currentParam = ''
              , finishedParamsCount = 0
              , dir = 0
              ;
              
              for (var key in params) {
                
                currentParam = params[key]
                
                if (color[currentParam] < color.range[currentParam].min) {
                  dir = 1;
                }
                else if (color[currentParam] > color.range[currentParam].max) {
                  dir = -1;
                }
                if (dir != 0) {
                  color[currentParam] = color[currentParam] + color.range[currentParam].step * dir;
                }
                else {
                  finishedParamsCount++;
                }
              }
              
              setColor(color);
              
              if (finishedParamsCount == params.length) {
                clearInterval(castTimer);
                callback();
              }
            },
            o.colorChagingInterval
          );
        }
      }
      
      
      var setRandomValue = function(param) {
        var value = color.range[param].min + Math.floor((color.range[param].max - color.range[param].min) * Math.random());
        return value ;
      }

      var setRandomColor = function() {	
        color.h = setRandomValue('h');
        color.s = setRandomValue('s');
        color.v = setRandomValue('v');
        setColor(color);
      }

      var slightlyAlterColor = function() {
        
        setInterval (
          function(){

            color.h += color.range.h.step;
            setColor(color);

            if (color.h > color.range.h.max) {
              color.h = color.range.h.min;
            }

          },
          o.colorChagingInterval
        );
      }
      
      
      var setColor = function(color) {
        $this.css({
          backgroundColor: '#' + hsv2rgb (color.h, color.s, color.v)
        });
      }
      
      
      var initRainbow = function() {
        
        // If startColor in rgb(X, X, X) format, we convert it to HEX format
        o.startColor = (rgb2hex(o.startColor)) ? rgb2hex(o.startColor) : o.startColor;
        // Set color to start color
        color.h = hex2hsv(o.startColor).h;
        color.s = hex2hsv(o.startColor).s;
        color.v = hex2hsv(o.startColor).v;        
        setColor(color);
        
        // Handle mouseHover event if required
        if (o.randomColorOnMouseOver == true) {
          $this.mouseenter(function(){
            setRandomColor();
          })
        }
        
        // If start color saturation and brightness out of range, cast it to range frames
        setTimeout(
          function(){
            castColorParam(function(){
              slightlyAlterColor();
            });
          },
          o.startDelayInterval
        );
        
      }

      initRainbow();
    }


    /**
     * Plugin initialization
     */
    return this.each(function() {

      var
      $this = $(this)
        
      , givenOptions = givenOptions || {}
      
      , o = $.extend({
        randomColorOnMouseOver: true,
        startColor: $this.css('backgroundColor'),
        colorChagingInterval: 75,
        startDelayInterval : 3000
      }, givenOptions || {})
      
      , rainbow = new classRainbow($this, o)
      
      ;

    });
      
  }

})(jQuery);