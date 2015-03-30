var ol = this.ol || {};
ol.templateFunc = {};

(function (ns) {
    'use strict';

    ns.rpad = function (val, space) {
        var str = String(val);
        var add = space - str.length;
        if (add > 0) {
            var pad = '', i;
            for (i = 0; i < add; i += 1) {
                pad += ' ';
            }
            str = pad + str;
        }
        return str;
    };

    ns.lpad = function (val, space) {
        var str = String(val);
        var add = space - str.length;
        if (add > 0) {
            var pad = '', i;
            for (i = 0; i < add; i += 1) {
                pad += ' ';
            }
            str = str + pad;
        }
        return str;
    };

    ns.orNa = function (val) {
        if (val === '') {
            return '-';
        }
        return val;
    };

    ns.yesNo = function (val) {
        if (val) {
            return 'ja';
        }
        return 'nei';
    };

    ns.mapCo2 = function (val) {
        if (val === 'natural') {
            return 'naturlig';
        }
        if (val === 'added') {
            return 'tilsatt';
        }
        return '-';
    };

    ns.mapHopForm = function (val) {
        if (val === 'pellets') {
            return 'pellets';
        }
        if (val === 'cones') {
            return 'hel';
        }
        return '-';
    };

    ns.mapYeast = function (val) {
        if (val === 'liquid') {
            return 'flytende gjær';
        }
        if (val === 'dry') {
            return 'tørrgjær';
        }
        if (val === 'homgegrown') {
            return 'selvdyrket gjær';
        }
        return '-';
    };
}(ol.templateFunc));