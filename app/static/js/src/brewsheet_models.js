/*global Backbone: false*/
var ol = this.ol || {};

(function (ns) {
    'use strict';

    var Fermentation  = Backbone.Model.extend({
        'defaults': {
            'type': '',
            'days': '',
            'temperature': ''
        }
    });

    var Fermentations = Backbone.Collection.extend({

        initialize: function (models) {
            if (!models) {
                this.add([
                    {'type': 'primary'},
                    {'type': 'secondary'},
                    {'type': 'storage'}
                ]);
            }
        },

        model: Fermentation
    });

    var ScaleableIngredientCollection = Backbone.Collection.extend({
        scale: function (factor) {
            this.each(function (element) {
                if (element.has('quantity')) {
                    var new_quantity = Math.round(element.get('quantity') * factor * 100) / 100;
                    element.set({'quantity': new_quantity});
                }
            });
        }
    });

    var Malt = Backbone.Model.extend({
        'defaults': {
            'quantity': '',
            'percentage': '',
            'name': '',
            'ppg': '',
            'color': ''
        },

        validate: function (attrs) {
            return _.reduce(attrs, function (ok, attr) {
                ok =  (this.get(attr) !== '' && !isNaN(this.get(attr)));
                return ok;
            }, true, this);
        }
    });

    ns.Malts = ScaleableIngredientCollection.extend({

        model: Malt,

        comparator: function (malt) {
            return -parseInt(malt.get('quantity'), 10);
        }
    });

    var Hop = Backbone.Model.extend({
        'defaults': {
            'quantity': '',
            'name': '',
            'form': 'cones',
            'alpha_acid': '',
            'boil_time': ''
        },

        validate: function () {
            var attrs = ['quantity', 'alpha_acid', 'boil_time'];
            return _.reduce(attrs, function (ok, attr) {
                ok = (this.get(attr) !== '' && !isNaN(this.get(attr)));
                return ok;
            }, true, this);

        }
    });

    ns.Hops = ScaleableIngredientCollection.extend({

        model: Hop,

        comparator: function (hop_a, hop_b) {
            var a = hop_a.get('boil_time');
            var b = hop_b.get('boil_time');
            if (!ol.calc.isNumber(a)) {
                a = -1;
            }
            if (!ol.calc.isNumber(b)) {
                b = -1;
            }
            a = parseInt(a, 10);
            b = parseInt(b, 10);
            if (a > b) {
                return -1;
            }
            if (a < b) {
                return 1;
            }
            return 0;

        }
    });

    var Yeast = Backbone.Model.extend({
        'defaults': {
            'name': '',
            'type': 'none',
            'attenuation': ''
        }
    });

    ns.Yeasts = Backbone.Collection.extend({

        initialize: function (models) {
            if (!models) {
                this.add(new Yeast());
            }
        },

        model: Yeast
    });

    var Additive = Backbone.Model.extend({
        'defaults': {
            'quantity': '',
            'name': '',
            'added_when': '',
            'boil_time': ''
        }
    });

    var Additives = ScaleableIngredientCollection.extend({

        model: Additive,

        comparator: function (additive) {
            return -parseInt(additive.get('boil_time'), 10);
        }
    });

    var MashTime = Backbone.Model.extend({
        'defaults': {
            'mash_time': '',
            'mash_temperature': ''
        }
    });

    var MashSchedule = Backbone.Collection.extend({
        model: MashTime
    });

    ns.Brew = Backbone.Model.extend({
        'defaults': {
            'beer_name': '',
            'brewer': '',
            'beer_style': -1,
            'wort_size': '',
            'batch_size': '',
            'boil_time': '',
            'brewhouse_efficiency': 75,
            'brew_efficiency': '-',
            'computed_color': '-',
            'computed_ibu': '-',
            'computed_og': '-',
            'actual_og': '',
            'computed_fg': '-',
            'computed_abv': '-',
            'actual_fg': '',
            'brew_date': '',
            'bottle_date': '',
            'filtered': false,
            'co2': 'none',
            'comment': '',
            'mashing_water': '',
            'sparging_water': '',
            'mash_schedule': new MashSchedule(),
            'malts': new ns.Malts(),
            'hops': new ns.Hops(),
            'additives': new Additives(),
            'yeasts': new ns.Yeasts(),
            'fermentations': new Fermentations()
        },

        url: function () {
            var base = '/api/brew';
            if (this.has('id')) {
                return base + '/' + this.get('id');
            }
            return base;
        },

        asJSON: function () {
            return _.clone(this.attributes);
        },

        toJSON: function () {
            //TODO: query user if this should be public
            return {
                'name': this.get('beer_name'),
                'data': JSON.stringify(this.asJSON()),
                'public': true
            };
        },

        setData: function (data) {
            _.each(data, function (value, key) {
                if (this.get(key) instanceof Backbone.Collection) {
                    this.get(key).reset(value);
                } else if (this.get(key) instanceof Backbone.Model) {
                    this.get(key).set(value);
                } else {
                    this.set(key, value);
                }

            }, this);
        },

        scale: function (new_volume) {
            if (this.has('batch_size')) {
                var factor = new_volume / this.get('batch_size');
                this.get('hops').scale(factor);
                this.get('malts').scale(factor);
                this.get('additives').scale(factor);
            }
        }
    });

}(ol));