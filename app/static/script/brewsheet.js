var ol = {};
ol.calc = {};

(function(ns) {

    var toLbs = ns.toLbs = function(grams) {
        return grams * 0.002205;
    };

    var toGallons = ns.toGallons = function(liter) {
        return liter * 0.264172051242;
    };

    ns.isNumber = isNumber = function(val){
        if(val === "") {
            return false;
        }
        return !isNaN(val);
    };

    //Thinseth equation, Palmer "How to brew" p 58
    var computeUtilization = function(G, T) {

        var fG = function(g) {
            return 1.65 * Math.pow(0.000125, (g-1));
        };

        var fT = function(t) {
            return (1 - Math.pow(Math.E, (-0.04 * t)))/ 4.15;
        };

        return fG(G) * fT(T);
    };

    ns.computeBitterness= function(og, volume, hops) {
        var bitterness = "-";
        if(isNumber(og) && isNumber(volume) && hops.length > 0) {

            var ibu = hops.reduce(function(total_ibu, hop) {
                var quantity = hop.get("quantity");
                var alpha_acid = hop.get("alpha_acid");
                var boil_time = hop.get("boil_time");
                if(isNumber(quantity) && isNumber(alpha_acid) && isNumber(boil_time)) {
                    var aau = parseFloat(quantity) * parseFloat(alpha_acid);
                    var utilization = computeUtilization(og, parseFloat(boil_time));
                    var ibu = aau * utilization * (10 / volume );
                    if(hop.get("form") === "pellets"){
                        //according to "radical brewing" (pp 64) utilization is 24% higher for pellets
                        ibu *= 1.24;
                    }
                    return total_ibu + ibu;
                }
                return total_ibu;
            }, 0);

            if(ibu > 0) {
                bitterness = Math.round(ibu);
            }
        }
        return bitterness;
    };

    //this is the "alternate formula" from http://www.brewersfriend.com/2011/06/16/alcohol-by-volume-calculator-updated/
    ns.computeABV = function(og, fg) {
        return (76.08 * (og-fg) / (1.775-og)) * (fg / 0.794)
    };


    //see "how to brew" pp. 194-195
    ns.computeGravity = function(volume, efficiency, malts) {
        var og = "-";
        if(ol.calc.isNumber(volume)  && ol.calc.isNumber(efficiency) && malts.length > 0) {
            var computed = malts.reduce(function(sum, malt) {
                var amount = malt.get("quantity");
                var ppg = malt.get("ppg");
                if(ol.calc.isNumber(amount) && ol.calc.isNumber(ppg)) {
                    return sum + ((efficiency / 100) * ppg) * (toLbs(amount) / toGallons(volume));
                }
                return sum;
            }, 0);

            if(computed !== 0){
                //round and get from nn to 1.0nn
                og = Math.round((1 + (computed / 1000)) * 1000) / 1000;
            }

        }
        return og;
    };

    //taken from http://www.homebrewtalk.com/f13/estimate-final-gravity-32826/#post322639
    ns.computeFG = function(og, yeasts) {
        var fg = "-";
        if(ol.calc.isNumber(og) && yeasts.length > 0) {
            var avg_attenuation = yeasts.reduce(function(sum, yeast) {
                var attenuation = yeast.get("attenuation");
                if(ol.calc.isNumber(attenuation)) {
                    return sum + attenuation;
                }
                return sum;
            }, 0);

            if(avg_attenuation > 0) {
                avg_attenuation = avg_attenuation / yeasts.length;
                fg = Math.round(((og - 1)-((og - 1) * (avg_attenuation / 100)) + 1) * 1000) / 1000;
            }
        }
        return fg;
    };

    //see http://brewwiki.com/index.php/Estimating_Color
    ns.computeColor = function(volume, malts) {
        var ebc = "-";
        if(ol.calc.isNumber(volume)  && malts.length > 0) {
            var sum = malts.reduce(function(sum, malt) {
                var amount = malt.get("quantity");
                var ebc = malt.get("color");
                if(ol.calc.isNumber(amount) && ol.calc.isNumber(ebc)) {
                    return sum + (amount * 0.0022) * (ebc * 0.508);
                }
                return sum;
            }, 0);
            if (sum > 0 ) {
                var total_mcu = sum / (volume * 0.2642);
                //Moreys Formula
                var srm = 1.4922 * Math.pow(total_mcu, 0.6859);
                ebc = Math.round(srm * 1.97); //lovibond to ebc
            }
        }
        return ebc;
    };


    //see "how to brew" pp. 192
    ns.computeEfficiency = function(og, volume, malts) {
        var efficiency = "-";
        if(ol.calc.isNumber(og) && ol.calc.isNumber(volume) && malts.length > 0){

            var max_gravity = malts.reduce(function(sum, malt){
                var amount = malt.get("quantity");
                var ppg = malt.get("ppg");
                if(ol.calc.isNumber(amount) && ol.calc.isNumber(ppg)) {
                    var addition = ppg * (toLbs(amount) / toGallons(volume));
                    return sum + addition;
                }
                return sum;
            }, 0);

            if(max_gravity > 0) {
                efficiency = Math.round(((og - 1) * 1000 / max_gravity) * 100)
            }
        }

        return efficiency;
    };


    //taken from http://methodbrewery.com/srm.php
    ns.getHexForEBC = function(input) {

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

(function(ns) {


    var apiSearch = function(query, callback, model) {
        var params = {"filters": [{"name": "name", "op": "like", "val": query + "%"}]};
        $.get("/api/" + model + "?q=" + JSON.stringify(params) + "&results_per_page=200", function(res) {

            if(res.objects){
                callback(res.objects);
            } else {
                callback([]);
            }
        });
    };

    var ToggleView = Backbone.View.extend({

        initialize: function() {
            _.bindAll(this, "toggle");
        },

        render: function() {
            this.$el.find(".toggle").on("click", this.toggle);
        },

        toggle: function() {
            this.$el.find(".content").toggle();
            this.$el.find(".toggle").toggleClass("icon-plus").toggleClass("icon-minus");
        }
    });

    var DynamicTableView = ToggleView.extend({

        listenOn: [],

        events: {
            "click .icon-remove-circle": "remove"
        },

        initialize: function() {
            ToggleView.prototype.initialize.apply(this, arguments);
            _.bindAll(this, "remove", "change");
        },

        render: function() {
            ToggleView.prototype.render.apply(this, arguments);
            _.each(this.listenOn, function(name) {
                this.$el.find("#" + name).on("change", this.change);
            }, this);
            return this;
        },

        change: function(e){
            var target = $(e.currentTarget);
            this.model.set(target.attr("id"), target.val());
        },

        remove: function() {
            this.model.destroy();
        }

    });

    var BaseSectionView = ToggleView.extend({

        initialize: function() {
            ToggleView.prototype.initialize.apply(this, arguments);
            this.collection.on("add", this.render, this);
            this.collection.on("destroy", this.render, this);
        },

        render: function() {
            ToggleView.prototype.render.apply(this, arguments);
            return this;
        },

        add: function(){
            this.collection.add(new this.collection.model());
        }
    });


    var MashTime = Backbone.Model.extend({
        "defaults": {
            "mash_time": "",
            "mash_temperature": ""
        }
    });

    var MashSchedule = Backbone.Collection.extend({
        model: MashTime
    });

    var MashTimeView = ns.MashTimeView = BaseSectionView.extend({

        events: {
            "click #add_mash_time": "add"
        },

        initialize: function() {
            _.bindAll(this, "add");
            BaseSectionView.prototype.initialize.apply(this, arguments);
            this.collection.on("destroy", this.render, this);
            this.collection.on("add", this.render, this);
        },

        render: function() {
            BaseSectionView.prototype.render.apply(this, arguments);
            var table = this.$el.find("#mash_schedule_table").find("tbody");
            table.html("");
            this.collection.each(function(mashTime) {
                table.append(new MashScheduleRowView({model: mashTime}).render().$el);
            });

            this.mashGraph = new MashGraph({collection: this.collection, el: this.$el.find("#mash_graph")}).render();
        }
    });

    var MashGraph = Backbone.View.extend({

        initialize: function () {
            this.collection.on("change", this.render, this);
        },

        render: function() {

            var data = this.collection.reduce(function(res, time) {
                if(!isNaN(parseFloat(time.get("mash_time"))) && !isNaN(parseFloat(time.get("mash_temperature")))) {
                    var start = res.prev;
                    var stop = start + parseFloat(time.get("mash_time"));
                    res.prev = stop;
                    res.arr.push([start, parseFloat(time.get("mash_temperature"))]);
                    res.arr.push([stop, parseFloat(time.get("mash_temperature"))]);
                }
                return res;
            }, {arr: [], "prev": 0}).arr;

            if(data.length > 0) {
                this.$el.show();
                $.plot(
                    this.$el,
                    [{data: data}],
                    {
                        xaxis: {min: 0, axisLabel: 'Minutes'},
                        yaxis: {min: 0, max: 100, axisLabel: '&deg;C'}
                    }
                );
                return this;
            } else {
                this.$el.hide();
            }
        }

    });

    var MashScheduleRowView = DynamicTableView.extend({

        tagName: "tr",

        listenOn: ["mash_time", "mash_temperature"],

        initialize: function() {
            DynamicTableView.prototype.initialize.apply(this, arguments);
        },

        render: function() {
            this.$el.html(_.template($("#mash_time_row_template").html(), this.model.toJSON()));
            DynamicTableView.prototype.render.apply(this, arguments);
            return this;
        }
    });

    var Fermentation  = Backbone.Model.extend({
        "defaults": {
            "type": "",
            "days": "",
            "temperature": ""
        }
    });

    var AsciiView = Backbone.View.extend({

        tagName: "pre",

        render: function() {
            this.$el.html(_.template($("#ascii_template").html(), this.options.data.serialize()));
            return this;
        }
    });

    var JsonView = Backbone.View.extend({

        tagName: "pre",

        render: function() {
            this.$el.html(JSON.stringify(this.options.data, undefined, 4));
            return this;
        }
    });

    var Fermentations = Backbone.Collection.extend({

        initialize: function(models) {
            if(!models){
                this.add([{"type": "primary"}, {"type": "secondary"}, {"type": "storage"}]);
            }
        },

        model: Fermentation
    });

    var FermentationView = BaseSectionView.extend({

        events: {
            "click #add_fermentation": "add"
        },

        initialize: function() {
            _.bindAll(this, "add");
            BaseSectionView.prototype.initialize.apply(this, arguments);
            this.collection.on("destroy", this.render, this);
            this.collection.on("add", this.render, this);
        },

        render: function() {
            BaseSectionView.prototype.render.apply(this, arguments);
            var table = this.$el.find("#fermentation_table").find("tbody");
            table.html("");
            this.collection.each(function(fermentation) {
                table.append(new FermentationRowView({model: fermentation}).render().$el);
            });
        }
    });

    var FermentationRowView = DynamicTableView.extend({

        tagName: "tr",

        listenOn: ["type", "days", "temperature"],

        initialize: function() {
            DynamicTableView.prototype.initialize.apply(this, arguments);
        },

        render: function() {
            this.$el.html(_.template($("#fermentation_row_template").html(), this.model.toJSON()));
            DynamicTableView.prototype.render.apply(this, arguments);
            return this;
        }
    });

    var Malt = Backbone.Model.extend({
        "defaults": {
            "quantity": "",
            "percentage": "",
            "name": "",
            "ppg": "",
            "color": ""
        },

        validate: function(attrs) {
            return _.reduce(attrs, function(ok, attr) {
                return (this.get(attr) !== "" && !isNaN(this.get(attr)));
            }, true, this);
        }
    });

    var Malts = ns.Malts = Backbone.Collection.extend({

        model: Malt,

        comparator: function(malt) {
            return -parseInt(malt.get("quantity"), 10);
        }
    });

    var  MaltSectionView = ns.MaltSectionView = BaseSectionView.extend({

        events: {
            "click #add_malt": "add"
        },

        initialize: function() {
            _.bindAll(this, "add");
            BaseSectionView.prototype.initialize.apply(this, arguments);
            this.collection.on("change:quantity", this.render, this);
        },

        render: function() {
            BaseSectionView.prototype.render.apply(this, arguments);
            this.adjustPercentages();
            var table = this.$el.find("#malts_table").find("tbody");
            table.html("");
            this.collection.each(function(malt) {
                table.append(new MaltTableRowView({model: malt}).render().$el);
            });
        },

        adjustPercentages: function() {
            var total = this.collection.reduce(function(total, malt) {return total += parseFloat(malt.get("quantity"));}, 0);
            this.collection.each(function(malt) {
                var percentage = (malt.get("quantity")/total) * 100;
                var pow = Math.pow(10, 1);
                percentage = Math.round(percentage * pow) / pow;
                if(!(isNaN(percentage))) {
                    malt.set({"percentage": percentage});
                }
            });
            this.collection.sort();
        }
    });

    var MaltTableRowView = DynamicTableView.extend({

        tagName: "tr",

        listenOn: ["quantity", "name", "ppg", "color"],

        initialize: function() {
            DynamicTableView.prototype.initialize.apply(this, arguments);
            _.bindAll(this,  "setMalt");
            this.model.on("change:percentage", this.percentageChange, this);
        },

        render: function() {
            this.$el.html(_.template($("#malt_table_row_template").html(), this.model.toJSON()));
            this.$el.find("#name").typeahead({source: apiSearch, selectCallback: this.setMalt, model: "malt"});
            DynamicTableView.prototype.render.apply(this, arguments);
            return this;
        },

        setMalt: function(malt) {
            _.each(_.omit(malt, "id"), function(value, key) {
                this.$el.find("#" + key).val(value).change();
            }, this);
        },

        percentageChange: function() {
            this.$el.find("#percentage").val(this.model.get("percentage"));
        }
    });

    var Hop = Backbone.Model.extend({
        "defaults": {
            "quantity": "",
            "name": "",
            "form": "cones",
            "alpha_acid": "",
            "boil_time": ""
        },

        validate: function() {
            return _.reduce(["quantity", "alpha_acid", "boil_time"], function(ok, attr) {
                return (this.get(attr) !== "" && !isNaN(this.get(attr)));
            }, true, this);

        }
    });

    var Hops = ns.Hops = Backbone.Collection.extend({

        model: Hop,

        comparator: function(hop) {
            return -parseInt(hop.get("boil_time"), 10);
        }
    });

    var HopSectionView = ns.HopSectionView = BaseSectionView.extend({

        events: {
            "click #add_hop": "add"
        },

        initialize: function() {
            _.bindAll(this, "add");
            BaseSectionView.prototype.initialize.apply(this, arguments);
            this.collection.on("change:boil_time", this.changeBoilTime, this);
        },

        render: function() {
            BaseSectionView.prototype.render.apply(this, arguments);
            var table = this.$el.find("#hops_table").find("tbody");
            table.html("");
            this.collection.each(function(hop) {
                var view = new HopTableRowView({model: hop}).render();
                table.append(view.$el);
            });
        },

        changeBoilTime: function() {
            this.collection.sort();
            this.render();
        }
    });

    var HopTableRowView = DynamicTableView.extend({

        tagName: "tr",

        listenOn: ["quantity", "name", "form", "alpha_acid", "boil_time"],

        initialize: function() {
            _.bindAll(this, "setHop");
            DynamicTableView.prototype.initialize.apply(this, arguments);
        },

        render: function() {
            this.$el.html(_.template($("#hop_table_row_template").html(), this.model.toJSON()));

            this.$el.find("#name").typeahead({source: apiSearch, selectCallback: this.setHop, model : "hop"});

            DynamicTableView.prototype.render.apply(this, arguments);
            return this;
        },

        setHop: function(hop) {
            _.each(_.omit(hop, "id"), function(value, key) {
                this.$el.find("#" + key).val(value).change();
            }, this);
        }
    });

    var Yeast = Backbone.Model.extend({
        "defaults": {
            "name": "",
            "type": "none",
            "attenuation": ""
        }
    });

    var Yeasts = ns.Yeasts = Backbone.Collection.extend({

        initialize: function(models) {
            if(!models){
                this.add(new Yeast());
            }
        },

        model: Yeast
    });

    var YeastSectionView = ns.YeastSectionView = BaseSectionView.extend({

        events: {
            "click #add_yeast": "add"
        },

        initialize: function() {
            _.bindAll(this, "add");
            BaseSectionView.prototype.initialize.apply(this, arguments);
        },

        render: function() {
            BaseSectionView.prototype.render.apply(this, arguments);
            var table = this.$el.find("#yeasts_table").find("tbody");
            table.html("");
            this.collection.each(function(additive) {
                table.append(new YeastTableRowView({model: additive}).render().$el);
            });

            return this;
        }
    });

    var YeastTableRowView = DynamicTableView.extend({

        tagName: "tr",

        listenOn: ["name", "attenuation", "type"],

        initialize: function() {
            _.bindAll(this, "setYeast");
            DynamicTableView.prototype.initialize.apply(this, arguments);
        },

        render: function() {
            this.$el.html(_.template($("#yeast_table_row_template").html(), this.model.toJSON()));
            DynamicTableView.prototype.render.apply(this, arguments);
            this.$el.find("#name").typeahead({source: apiSearch, selectCallback: this.setYeast, model : "yeast"});
            return this;
        },

        setYeast: function(yeast) {
            _.each(_.omit(yeast, "id"), function(value, key) {
                this.$el.find("#" + key).val(value).change();
            }, this);
        }
    });

    var Additive = Backbone.Model.extend({
        "defaults": {
            "quantity": "",
            "name": "",
            "added_when": "",
            "boil_time": ""
        }
    });

    var Additives = Backbone.Collection.extend({

        model: Additive,

        comparator: function(additive) {
            return -parseInt(additive.get("boil_time"), 10);
        }
    });

    var AdditiveSectionView = ns.AdditiveSectionView = BaseSectionView.extend({

        events: {
            "click #add_additive": "add"
        },

        initialize: function() {
            _.bindAll(this, "add");
            BaseSectionView.prototype.initialize.apply(this, arguments);
            this.collection.on("change:boil_time", this.changeBoilTime, this);
        },

        render: function() {
            BaseSectionView.prototype.render.apply(this, arguments);
            var table = this.$el.find("#additives_table").find("tbody");
            table.html("");
            this.collection.each(function(additive) {
                table.append(new AdditiveTableRowView({model: additive}).render().$el);
            });
            return this;
        },

        changeBoilTime: function() {
            this.collection.sort();
            this.render();
        }
    });


    var AdditiveTableRowView = DynamicTableView.extend({

        tagName: "tr",

        listenOn: ["quantity", "name", "boil_time", "added_when"],

        initialize: function() {
            DynamicTableView.prototype.initialize.apply(this, arguments);
        },

        render: function() {
            this.$el.html(_.template($("#additive_table_row_template").html(), this.model.toJSON()));
            DynamicTableView.prototype.render.apply(this, arguments);
            return this;
        }
    });

    var Brew = Backbone.Model.extend({
        "defaults": {
            "beer_name": "",
            "brewer": "",
            "beer_style": "",
            "wort_size": "",
            "batch_size": "",
            "boil_time": "",
            "brewhouse_efficiency": "75",
            "brew_efficiency": "-",
            "computed_color": "-",
            "computed_ibu": "-",
            "computed_og": "-",
            "actual_og": "",
            "computed_fg": "-",
            "computed_abv": "-",
            "actual_fg": "",
            "brew_date": "",
            "bottle_date": "",
            "filtered": false,
            "co2": "none",
            "comment": "",
            "mashing_water": "",
            "sparging_water": "",
            "mash_schedule": new MashSchedule(),
            "malts": new Malts(),
            "hops": new Hops(),
            "additives": new Additives(),
            "yeasts": new Yeasts(),
            "fermentations": new Fermentations()
        },

        url: function() {
            var base = "/api/brew";
            if(this.has("id")){
                return base + "/" + this.get("id");
            }
            return base
        },

        asJSON: function() {
            return _.clone(this.attributes)
        },

        toJSON: function(){
            //TODO: query user if this should be public
            return {
                "name": this.get("beer_name"),
                "data": JSON.stringify(this.asJSON()),
                "public": true
            }
        },

        setData: function(data) {
            _.each(data, function(value, key) {
                if(this.get(key) instanceof Backbone.Collection) {
                    this.get(key).reset(value);
                } else if(this.get(key) instanceof Backbone.Model) {
                    this.get(key).set(value);
                } else {
                    this.set(key, value);
                }

            }, this);
        }
    });



    ns.BrewSheet = Backbone.View.extend({

        events: {
            "click #show_json": "showJSON",
            "click #save": "save",
            "click #clone": "clone"
        },

        initialize: function() {
            if(!this.options.brew) {
                this.brew = new Brew();
                if(this.options.name) {
                    this.brew.set({"brewer": this.options.name});
                }
            } else {
                this.brew = new Brew();
                this.brew.setData(this.options.brew)
            }
            _.bindAll(this, "change", "changeDate", "save", "saved", "clone");

            this.brew.on("change", function(brew) {console.log(brew);}, this);

            this.brew.get("malts").on("change", this.maltChange, this);
            this.brew.get("hops").on("change", this.hopChange, this);
            this.brew.get("yeasts").on("change", this.yeastChange, this);
            this.brew.on("change:batch_size", this.batchSizeChanged, this);
            this.brew.on("change:brewhouse_efficiency", this.efficiencyChanged, this);
            this.brew.on("change:computed_og", this.gravityChanged, this);

            this.brew.on("change:actual_og", this.computeActualABV, this);
            this.brew.on("change:actual_og", this.computeEfficiency, this);
            this.brew.on("change:actual_fg", this.computeActualABV, this);
        },

        subviews: {
            "malts": MaltSectionView,
            "hops": HopSectionView,
            "additives": AdditiveSectionView,
            "yeasts": YeastSectionView,
            "mash_schedule": MashTimeView,
            "fermentations": FermentationView
        },

        render: function() {
            this.$el.html("");
            var data = this.brew.asJSON();
            this.$el.append(_.template($("#brewsheet_template").html(), data));

            _.each(this.brew.defaults, function(value, key) {

                if(this.brew.get(key) instanceof Backbone.Collection) {
                    if(this.subviews[key]) {
                        new this.subviews[key]({"el": this.$el.find("#" + key), "collection": this.brew.get(key)}).render();
                    }
                }
                if(this.brew.get(key) instanceof Backbone.Model) {
                    if(this.subviews[key]) {
                        new this.subviews[key]({"el": this.$el.find("#" + key), "model": this.brew.get(key)}).render();
                    }
                } else {
                    var el = this.$el.find("#" + key);
                    if(el.length > 0) {
                        this.$el.find("#" + key).on("change", this.change);
                    }
                }
            }, this);
            if(this.options.disabled) {
                this.$el.find("input").prop("disabled", true);
                this.$el.find("button").each(function(){
                    if(this.id !== "show_recipe" && this.id !== "show_json" && this.id !== "clone") {
                        $(this).hide();
                    }
                });
                this.$el.find("select").prop("disabled", true);
                this.$el.find("textarea").prop("disabled", true);
            } else {
                this.$el.find(".date").datepicker().on('changeDate', this.changeDate);
            }

            this.computeActualABV();
            this.colorChanged();
            $('#brewsheet a:first').tab('show');
            return this;
        },

        changeDate: function (e){
            var target = $(e.currentTarget);
            this.change({"currentTarget": target.find("input")});
        },

        change: function(e) {
            var target = $(e.currentTarget);
            var key = target.attr("id");
            if(!(this.brew.get(key) instanceof Backbone.Collection) && !(this.brew.get(key) instanceof Backbone.Model)) {
                this.brew.set(target.attr("id"), target.val());
            }
        },

        batchSizeChanged: function(){
            if(ol.calc.isNumber(this.brew.get("batch_size"))){
                this.computeGravity();
                this.computeColor();
                this.computeBitterness();
                this.computeEfficiency();
            }
        },

        efficiencyChanged: function(){
            if(ol.calc.isNumber(this.brew.get("brewhouse_efficiency"))){
                this.computeGravity();
            }
        },

        gravityChanged: function() {
            if(ol.calc.isNumber(this.brew.get("computed_og"))){
                this.computeBitterness();
                this.computeFG();
            }
        },

        maltChange: function() {
            if(this.brew.get("malts").length > 0) {
                this.computeGravity();
                this.computeColor();
                this.computeEfficiency();
            }
        },

        hopChange: function() {
            if(this.brew.get("hops").length > 0) {
                this.computeBitterness();
            }
        },

        yeastChange: function() {
            if(this.brew.get("yeasts").length > 0) {
                this.computeFG();
            }
        },

        computeGravity: function() {
            var malts = this.brew.get("malts");
            var volume =  this.brew.get("batch_size");
            var efficiency = this.brew.get("brewhouse_efficiency");
            var og = ol.calc.computeGravity(volume, efficiency, malts);
            this.brew.set({"computed_og": og});
            this.$el.find("#computed_og").text(og);
        },

        computeColor: function() {
            var malts = this.brew.get("malts");
            var volume =  this.brew.get("batch_size");
            var ebc = ol.calc.computeColor(volume, malts);
            this.brew.set({"computed_color": ebc});
            this.colorChanged();
        },

        colorChanged: function() {
            var ebc = this.brew.get("computed_color");
            var c = "rgb(" + ol.calc.getHexForEBC(ebc) + ")";
            console.log(c);
            this.$el.find("#computed_color").text(ebc).css("background-color", c);
        },

        computeBitterness: function() {
            var og = this.brew.get("computed_og");
            var volume =  this.brew.get("batch_size");
            var hops = this.brew.get("hops");

            var bitterness = ol.calc.computeBitterness(og, volume, hops);
            this.brew.set({"computed_ibu": bitterness});
            this.$el.find("#computed_ibu").text(bitterness);
        },

        computeFG: function() {
            var og = this.brew.get("computed_og");
            var yeasts = this.brew.get("yeasts");

            var fg = ol.calc.computeFG(og, yeasts);
            this.brew.set({"computed_fg": fg});
            this.$el.find("#computed_fg").text(fg);
            this.computeABV();

        },

        computeABV: function() {
            var og = this.brew.get("computed_og");
            var fg = this.brew.get("computed_fg");

            var abv = "-";
            if(ol.calc.isNumber(og) && ol.calc.isNumber(fg)){
                abv = Math.round(ol.calc.computeABV(og, fg) * 10) / 10;
            }
            this.brew.set({"computed_abv": abv});
            this.$el.find("#computed_abv").text(abv);
        },

        computeActualABV: function() {
            var og = this.brew.get("actual_og");
            var fg = this.brew.get("actual_fg");

            var abv = "";
            if(ol.calc.isNumber(og) && ol.calc.isNumber(fg)){
                abv = Math.round(ol.calc.computeABV(og, fg) * 10) / 10;
            }
            this.brew.set({"actual_abv": abv});
            this.$el.find("#actual_abv").val(abv);
        },

        computeEfficiency: function() {
            var og = this.brew.get("actual_og");
            var volume =  this.brew.get("batch_size");
            var malts = this.brew.get("malts");

            var efficiency = ol.calc.computeEfficiency(og, volume, malts);
            this.brew.set({"brew_efficiency": efficiency});
            this.$el.find("#brew_efficiency").val(efficiency);
        },

        showJSON: function() {
            var modal = $('#modal');
            modal.find(".modal-body").html(new JsonView({data: this.brew.asJSON()}).render().$el);
            modal.modal('show');
        },

        save: function() {
            this.brew.save({}, {"success": this.saved});
        },

        saved: function() {
            window.history.pushState("object or string", "Title", "/brews/" + this.brew.get("id"));

            this.$el.find("#save_results").html(_.template($("#success_alert_template").html(), {"type": "success", "message": "Brew saved!"}));
        },

        clone: function() {
            window.history.pushState("object or string", "Title", "/brews/add");
            this.brew.set("id", null);
            this.options.disabled = false;
            this.render();
            this.$el.find("#clone").attr("id", "save").html("Save recipe");
        }
    });
}(ol));

ol.templateFunc = {};

(function(ns){

    ns.rpad = function(val, space) {
        var str = String(val);
        var add = space-str.length;
        if(add > 0){
            var pad = "";
            for(var i = 0; i<add; i++){
                pad += " ";
            }
            str = pad + str;
        }
        return str;
    };

    ns.lpad = function(val, space) {
        var str = String(val);
        var add = space-str.length;
        if(add > 0){
            var pad = "";
            for(var i = 0; i<add; i++){
                pad += " ";
            }
            str = str + pad;
        }
        return str;
    };

    ns.orNa = function(val){
        if(val === ""){
            return "-";
        }
        return val;
    };

    ns.yesNo = function(val){
        if(val) {
            return "ja";
        }
        return "nei";
    };

    ns.mapCo2 = function(val) {
        if(val === "natural") {
            return "naturlig";
        } else if(val === "added") {
            return "tilsatt";
        }
        return "-";
    };

    ns.mapHopForm = function(val) {
        if(val === "pellets") {
            return "pellets";
        } else if(val === "cones") {
            return "hel";
        }
        return "-";
    };

    ns.mapYeast = function(val) {
        if(val === "liquid") {
            return "flytende gjær";
        } else if(val === "dry") {
            return "tørrgjær";
        } else if(val === "homgegrown") {
            return "selvdyrket gjær";
        }
        return "-";
    }

}(ol.templateFunc));