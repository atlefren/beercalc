var ol = window.ol || {};
ol.calc = {};

(function (ns) {

    "use strict";

    var toLbs = ns.toLbs = function (grams) {
        return grams * 0.002205;
    };

    var toGallons = ns.toGallons = function (liter) {
        return liter * 0.264172051242;
    };

    var isNumber = ns.isNumber = function (val){
        if (val === "") {
            return false;
        }
        return !isNaN(val);
    };

    //Thinseth equation, Palmer "How to brew" p 58
    var computeUtilization = function (G, T) {

        var fG = function (g) {
            return 1.65 * Math.pow(0.000125, (g - 1));
        };

        var fT = function (t) {
            return (1 - Math.pow(Math.E, (-0.04 * t))) / 4.15;
        };

        return fG(G) * fT(T);
    };

    ns.computeBitterness = function (og, volume, hops) {
        var bitterness = "-";
        if (isNumber(og) && isNumber(volume) && hops.length > 0) {

            var ibu = hops.reduce(function (total_ibu, hop) {
                var quantity = hop.get("quantity");
                var alpha_acid = hop.get("alpha_acid");
                var boil_time = hop.get("boil_time");
                if (isNumber(quantity) && isNumber(alpha_acid) && isNumber(boil_time)) {
                    var aau = parseFloat(quantity) * parseFloat(alpha_acid);
                    var utilization = computeUtilization(og, parseFloat(boil_time));
                    var ibu = aau * utilization * (10 / volume);
                    if (hop.get("form") === "pellets") {
                        //according to "radical brewing" (pp 64) utilization is 24% higher for pellets
                        ibu *= 1.24;
                    }
                    return total_ibu + ibu;
                }
                return total_ibu;
            }, 0);

            if (ibu > 0) {
                bitterness = Math.round(ibu);
            }
        }
        return bitterness;
    };

    //this is the "alternate formula" from http://www.brewersfriend.com/2011/06/16/alcohol-by-volume-calculator-updated/
    ns.computeABV = function (og, fg) {
        return (76.08 * (og - fg) / (1.775 - og)) * (fg / 0.794);
    };


    //see "how to brew" pp. 194-195
    ns.computeGravity = function (volume, efficiency, malts) {
        var og = "-";
        if (ns.isNumber(volume)  && ns.isNumber(efficiency) && malts.length > 0) {
            var computed = malts.reduce(function (sum, malt) {
                var amount = malt.get("quantity");
                var ppg = malt.get("ppg");
                if (ns.isNumber(amount) && ns.isNumber(ppg)) {
                    return sum + ((efficiency / 100) * ppg) * (toLbs(amount) / toGallons(volume));
                }
                return sum;
            }, 0);

            if (computed !== 0) {
                //round and get from nn to 1.0nn
                og = Math.round((1 + (computed / 1000)) * 1000) / 1000;
            }
        }
        return og;
    };

    //taken from http://www.homebrewtalk.com/f13/estimate-final-gravity-32826/#post322639
    ns.computeFG = function (og, yeasts) {
        var fg = "-";
        if (ns.isNumber(og) && yeasts.length > 0) {
            var avg_attenuation = yeasts.reduce(function (sum, yeast) {
                var attenuation = yeast.get("attenuation");
                if (ns.isNumber(attenuation)) {
                    return sum + attenuation;
                }
                return sum;
            }, 0);

            if (avg_attenuation > 0) {
                avg_attenuation = avg_attenuation / yeasts.length;
                fg = Math.round(((og - 1) - ((og - 1) * (avg_attenuation / 100)) + 1) * 1000) / 1000;
            }
        }
        return fg;
    };

    //see http://brewwiki.com/index.php/Estimating_Color
    ns.computeColor = function (volume, malts) {
        var ebc = "-";
        if (ns.isNumber(volume)  && malts.length > 0) {
            var sum = malts.reduce(function (sum, malt) {
                var amount = malt.get("quantity");
                var ebc = malt.get("color");
                if (ns.isNumber(amount) && ns.isNumber(ebc)) {
                    return sum + (amount * 0.0022) * (ebc * 0.508);
                }
                return sum;
            }, 0);
            if (sum > 0) {
                var total_mcu = sum / (volume * 0.2642);
                //Moreys Formula
                var srm = 1.4922 * Math.pow(total_mcu, 0.6859);
                ebc = Math.round(srm * 1.97); //lovibond to ebc
            }
        }
        return ebc;
    };

    //see "how to brew" pp. 192
    ns.computeEfficiency = function (og, volume, malts) {
        var efficiency = "-";
        if (ns.isNumber(og) && ol.calc.isNumber(volume) && malts.length > 0) {
            var max_gravity = malts.reduce(function (sum, malt) {
                var amount = malt.get("quantity");
                var ppg = malt.get("ppg");
                if (ns.isNumber(amount) && ns.isNumber(ppg)) {
                    var addition = ppg * (toLbs(amount) / toGallons(volume));
                    return sum + addition;
                }
                return sum;
            }, 0);

            if (max_gravity > 0) {
                efficiency = Math.round(((og - 1) * 1000 / max_gravity) * 100)
            }
        }
        return efficiency;
    };

    //taken from http://methodbrewery.com/srm.php
    ns.getHexForEBC = function (input) {

        var colors = [
            {'rgb':'250,250,160','srm':1},
            {'rgb':'250,250,105','srm':2},
            {'rgb':'245,246,50','srm':3},
            {'rgb':'235,228,47','srm':4},
            {'rgb':'225,208,50','srm':5},
            {'rgb':'215,188,52','srm':6},
            {'rgb':'205,168,55','srm':7},
            {'rgb':'198,148,56','srm':8},
            {'rgb':'193,136,56','srm':9},
            {'rgb':'192,129,56','srm':10},
            {'rgb':'192,121,56','srm':11},
            {'rgb':'192,114,56','srm':12},
            {'rgb':'190,106,56','srm':13},
            {'rgb':'180,99,56','srm':14},
            {'rgb':'167,91,54','srm':15},
            {'rgb':'152,84,51','srm':16},
            {'rgb':'138,75,48','srm':17},
            {'rgb':'124,68,41','srm':18},
            {'rgb':'109,60,34','srm':19},
            {'rgb':'95,53,23','srm':20},
            {'rgb':'81,45,11','srm':21},
            {'rgb':'67,38,12','srm':22},
            {'rgb':'52,30,17','srm':23},
            {'rgb':'38,23,22','srm':24},            ,
            {'rgb':'33,19,18','srm':25},
            {'rgb':'28,16,15','srm':26},
            {'rgb':'23,13,12','srm':27},
            {'rgb':'18,9,8','srm':28},
            {'rgb':'13,6,5','srm':29},
            {'rgb':'8,3,2','srm':30},
            {'rgb':'6,2,1','srm':31}
        ];

        if(!isNumber(input)) {
            return "255,255,255";
        }

        input = input/2;

        if(input < 1) {
            input = 1   ;
        } else if(input > 62) {
            input = 62;
        }

        input = Math.round(input);

        return _.find(colors, function(c) {
            return (c.srm == input);
        }).rgb;
    };

}(ol.calc));