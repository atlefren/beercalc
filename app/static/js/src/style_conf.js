/*global Backbone: false*/
var ol = this.ol || {};
'use strict';

ol.getRange = function (name, min, max, parent) {
    var range = max - min;

    var wrapper = $('<div class="wrapper"></div>');
    var element = $('<div class="range-bg"></div>');
    var label = $('<div class="style-label">' + name + '</div>');
    wrapper.append([label, element]);
    parent.append(wrapper);
    var ll = $('<div class="label-left">' + min + '</div>');
    var lr = $('<div class="label-right">' + max + '</div>');
    element.html([ll, lr]);
    return function showRange(data) {
        if (!data.high && !data.low) {
            element.html('N/A').addClass('nodata')
            return;
        }
        var width = 100;
        var start = ((data.low - min) / range * width);
        var stop = width - ((data.high - min) / range * width);
        var val = ((data.value - min) / range * width);
        var rangeEl = $('<div class="range"></div>').css('left', start + '%').css('right', stop + '%');
        var valueEl = $('<div class="value"></div>').css('left', val + '%');
        var valueMarkerEl = $('<div class="value-marker">' + data.value + '</div>').css('left', val + '%');
        
        element.html([rangeEl, valueEl, valueMarkerEl, ll, lr]).removeClass('nodata');
    };
};
