/*global Backbone: false, window: false*/
var ol = this.ol || {};

(function (ns) {
    "use strict";

    var apiSearch = function (query, callback, model) {
        var params = {
            "filters": [
                {"name": "name", "op": "ilike", "val": query + "%"}
            ]
        };
        $.get("/api/" + model + "?q=" + JSON.stringify(params) + "&results_per_page=200", function (res) {
            if (res.objects) {
                callback(res.objects);
            } else {
                callback([]);
            }
        });
    };

    var ToggleView = Backbone.View.extend({

        initialize: function () {
            _.bindAll(this, "toggle");
        },

        render: function () {
            this.$el.find(".toggle").on("click", this.toggle);
        },

        toggle: function () {
            this.$el.find(".content").toggle();
            this.$el.find(".toggle")
                .toggleClass("icon-plus")
                .toggleClass("icon-minus");
        }
    });

    var DynamicTableView = ToggleView.extend({

        listenOn: [],

        events: {
            "click .icon-remove-circle": "remove"
        },

        initialize: function () {
            ToggleView.prototype.initialize.apply(this, arguments);
            _.bindAll(this, "remove", "change");
        },

        render: function () {
            ToggleView.prototype.render.apply(this, arguments);
            _.each(this.listenOn, function (name) {
                this.$el.find("#" + name).on("change", this.change);
            }, this);
            return this;
        },

        change: function (e) {
            var target = $(e.currentTarget);
            this.model.set(target.attr("id"), target.val());
        },

        remove: function () {
            this.model.destroy();
        }

    });

    var BaseSectionView = ToggleView.extend({

        initialize: function () {
            ToggleView.prototype.initialize.apply(this, arguments);
            this.collection.on("add", this.render, this);
            this.collection.on("destroy", this.render, this);
        },

        render: function () {
            ToggleView.prototype.render.apply(this, arguments);
            return this;
        },

        add: function () {
            this.collection.add(new this.collection.model());
        }
    });

    var MashScheduleRowView = DynamicTableView.extend({

        tagName: "tr",

        listenOn: ["mash_time", "mash_temperature"],

        initialize: function () {
            DynamicTableView.prototype.initialize.apply(this, arguments);
        },

        render: function () {
            this.$el.html(_.template(
                $("#mash_time_row_template").html(),
                this.model.toJSON()
            ));
            DynamicTableView.prototype.render.apply(this, arguments);
            return this;
        }
    });

    var MashGraph = Backbone.View.extend({

        initialize: function () {
            this.collection.on("change", this.render, this);
        },

        render: function () {

            var data = this.collection.reduce(function (res, time) {
                if (!isNaN(parseFloat(time.get("mash_time"))) && !isNaN(parseFloat(time.get("mash_temperature")))) {
                    var start = res.prev;
                    var stop = start + parseFloat(time.get("mash_time"));
                    res.prev = stop;
                    res.arr.push([
                        start,
                        parseFloat(time.get("mash_temperature"))
                    ]);
                    res.arr.push([
                        stop,
                        parseFloat(time.get("mash_temperature"))
                    ]);
                }
                return res;
            }, {arr: [], "prev": 0}).arr;

            if (data.length > 0) {
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
            }
            this.$el.hide();
        }

    });

    ns.MashTimeView = BaseSectionView.extend({

        events: {
            "click #add_mash_time": "add"
        },

        initialize: function () {
            _.bindAll(this, "add");
            BaseSectionView.prototype.initialize.apply(this, arguments);
            this.collection.on("destroy", this.render, this);
            this.collection.on("add", this.render, this);
        },

        render: function () {
            BaseSectionView.prototype.render.apply(this, arguments);
            var table = this.$el.find("#mash_schedule_table").find("tbody");
            table.html("");
            this.collection.each(function (mashTime) {
                table.append(
                    new MashScheduleRowView({model: mashTime}).render().$el
                );
            });

            this.mashGraph = new MashGraph({
                collection: this.collection,
                el: this.$el.find("#mash_graph")
            }).render();
        }
    });

    var JsonView = Backbone.View.extend({

        tagName: "pre",

        render: function () {
            this.$el.html(JSON.stringify(this.options.data, undefined, 4));
            return this;
        }
    });

    var FermentationRowView = DynamicTableView.extend({

        tagName: "tr",

        listenOn: ["type", "days", "temperature"],

        initialize: function () {
            DynamicTableView.prototype.initialize.apply(this, arguments);
        },

        render: function () {
            this.$el.html(_.template(
                $("#fermentation_row_template").html(),
                this.model.toJSON()
            ));
            DynamicTableView.prototype.render.apply(this, arguments);
            return this;
        }
    });

    var FermentationView = BaseSectionView.extend({

        events: {
            "click #add_fermentation": "add"
        },

        initialize: function () {
            _.bindAll(this, "add");
            BaseSectionView.prototype.initialize.apply(this, arguments);
            this.collection.on("destroy", this.render, this);
            this.collection.on("add", this.render, this);
        },

        render: function () {
            BaseSectionView.prototype.render.apply(this, arguments);
            var table = this.$el.find("#fermentation_table").find("tbody");
            table.html("");
            this.collection.each(function (fermentation) {
                table.append(
                    new FermentationRowView({model: fermentation}).render().$el
                );
            });
        }
    });

    var MaltTableRowView = DynamicTableView.extend({

        tagName: "tr",

        listenOn: ["quantity", "name", "ppg", "color"],

        initialize: function () {
            DynamicTableView.prototype.initialize.apply(this, arguments);
            _.bindAll(this,  "setMalt");
            this.model.on("change:percentage", this.percentageChange, this);
        },

        render: function () {
            this.$el.html(_.template(
                $("#malt_table_row_template").html(),
                this.model.toJSON()
            ));
            this.$el.find("#name").typeahead({
                source: apiSearch,
                selectCallback: this.setMalt,
                model: "malt"
            });
            DynamicTableView.prototype.render.apply(this, arguments);
            return this;
        },

        setMalt: function (malt) {
            _.each(_.omit(malt, "id"), function (value, key) {
                this.$el.find("#" + key).val(value).change();
            }, this);
        },

        percentageChange: function () {
            this.$el.find("#percentage").val(this.model.get("percentage"));
        }
    });

    ns.MaltSectionView = BaseSectionView.extend({

        events: {
            "click #add_malt": "add"
        },

        initialize: function () {
            _.bindAll(this, "add");
            BaseSectionView.prototype.initialize.apply(this, arguments);
            this.collection.on("change:quantity", this.render, this);
        },

        render: function () {
            BaseSectionView.prototype.render.apply(this, arguments);
            this.adjustPercentages();
            var table = this.$el.find("#malts_table").find("tbody");
            table.html("");
            this.collection.each(function (malt) {
                table.append(new MaltTableRowView({model: malt}).render().$el);
            });
        },

        adjustPercentages: function () {
            var total = this.collection.reduce(function (total, malt) {
                total = total + parseFloat(malt.get("quantity"));
                return total;
            }, 0);
            this.collection.each(function (malt) {
                var percentage = (malt.get("quantity") / total) * 100;
                var pow = Math.pow(10, 1);
                percentage = Math.round(percentage * pow) / pow;
                if (!(isNaN(percentage))) {
                    malt.set({"percentage": percentage});
                }
            });
            this.collection.sort();
        }
    });

    var HopTableRowView = DynamicTableView.extend({

        tagName: "tr",

        listenOn: ["quantity", "name", "form", "alpha_acid", "boil_time"],

        initialize: function () {
            _.bindAll(this, "setHop");
            DynamicTableView.prototype.initialize.apply(this, arguments);
        },

        render: function () {
            this.$el.html(_.template(
                $("#hop_table_row_template").html(),
                this.model.toJSON()
            ));

            this.$el.find("#name").typeahead({
                source: apiSearch,
                selectCallback: this.setHop,
                model : "hop"
            });

            DynamicTableView.prototype.render.apply(this, arguments);
            return this;
        },

        setHop: function (hop) {
            _.each(_.omit(hop, "id"), function (value, key) {
                this.$el.find("#" + key).val(value).change();
            }, this);
        }
    });

    ns.HopSectionView = BaseSectionView.extend({

        events: {
            "click #add_hop": "add"
        },

        initialize: function () {
            _.bindAll(this, "add");
            BaseSectionView.prototype.initialize.apply(this, arguments);
            this.collection.on("change:boil_time", this.changeBoilTime, this);
        },

        render: function () {
            BaseSectionView.prototype.render.apply(this, arguments);
            var table = this.$el.find("#hops_table").find("tbody");
            table.html("");
            this.collection.each(function (hop) {
                var view = new HopTableRowView({model: hop}).render();
                table.append(view.$el);
            });
        },

        changeBoilTime: function () {
            this.collection.sort();
            this.render();
        }
    });

    var YeastTableRowView = DynamicTableView.extend({

        tagName: "tr",

        listenOn: ["name", "attenuation", "type"],

        initialize: function () {
            _.bindAll(this, "setYeast");
            DynamicTableView.prototype.initialize.apply(this, arguments);
        },

        render: function () {
            this.$el.html(_.template(
                $("#yeast_table_row_template").html(),
                this.model.toJSON()
            ));
            DynamicTableView.prototype.render.apply(this, arguments);
            this.$el.find("#name").typeahead({
                source: apiSearch,
                selectCallback: this.setYeast,
                model : "yeast"
            });
            return this;
        },

        setYeast: function (yeast) {
            _.each(_.omit(yeast, "id"), function (value, key) {
                this.$el.find("#" + key).val(value).change();
            }, this);
        }
    });

    ns.YeastSectionView = BaseSectionView.extend({

        events: {
            "click #add_yeast": "add"
        },

        initialize: function () {
            _.bindAll(this, "add");
            BaseSectionView.prototype.initialize.apply(this, arguments);
        },

        render: function () {
            BaseSectionView.prototype.render.apply(this, arguments);
            var table = this.$el.find("#yeasts_table").find("tbody");
            table.html("");
            this.collection.each(function (additive) {
                table.append(
                    new YeastTableRowView({model: additive}).render().$el
                );
            });

            return this;
        }
    });

    var AdditiveTableRowView = DynamicTableView.extend({

        tagName: "tr",

        listenOn: ["quantity", "name", "boil_time", "added_when"],

        initialize: function () {
            DynamicTableView.prototype.initialize.apply(this, arguments);
        },

        render: function () {
            this.$el.html(_.template(
                $("#additive_table_row_template").html(),
                this.model.toJSON()
            ));
            DynamicTableView.prototype.render.apply(this, arguments);
            return this;
        }
    });

    ns.AdditiveSectionView = BaseSectionView.extend({

        events: {
            "click #add_additive": "add"
        },

        initialize: function () {
            _.bindAll(this, "add");
            BaseSectionView.prototype.initialize.apply(this, arguments);
            this.collection.on("change:boil_time", this.changeBoilTime, this);
        },

        render: function () {
            BaseSectionView.prototype.render.apply(this, arguments);
            var table = this.$el.find("#additives_table").find("tbody");
            table.html("");
            this.collection.each(function (additive) {
                table.append(
                    new AdditiveTableRowView({model: additive}).render().$el
                );
            });
            return this;
        },

        changeBoilTime: function () {
            this.collection.sort();
            this.render();
        }
    });

    var StyleModel = Backbone.Model.extend({

        initialize: function () {
            this.get('brew').on('change:beer_style', this.styleChanged, this);
            this.styleChanged();
        },

        styleChanged: function () {
            var styleId = this.get('brew').get('beer_style');
            var style = _.find(this.get('styles'), function (style) {
                return style.id === styleId;
            });
            this.set('style', style);
        },

        getStyleConformance: function () {

            var lookups = {
                srm: 'computed_color',
                ibu: 'computed_ibu',
                og: 'computed_og',
                fg: 'computed_fg',
                abv: 'computed_abv'
            };

            var brew = this.get('brew');
            return _.map(this.get('style').stats, function (stat) {
                var value = brew.get(lookups[stat.name]);
                if (!ol.calc.isNumber(value)) {
                    return _.extend({match: null}, stat);
                }
                var match = value >= stat.low && value <= stat.high;
                return _.extend({match: match, value: value}, stat);
            });
        }
    });

    var StyleConformanceView = Backbone.View.extend({

        initialize: function () {
            //this.style = this.getStyle(this.options.styleId);
            this.model.on('change:style', this.render, this);
        },

        render: function () {
            var conformance = this.model.getStyleConformance();
            console.log(conformance);
            /*var data = _.map(this.style.stats, function (stat) {
                return _.template('stat <%= name %>, low: <%= low %>, high: <%= high %>', stat);
            });
            this.$el.html(data);
            */
            return this;
        }
/*
        getStyle: function (styleId) {
            return _.find(this.options.styles, function (style) {
                return style.id === styleId;
            });
        }*/

    });

    ns.BrewSheet = Backbone.View.extend({

        events: {
            "click #show_json": "showJSON",
            "click #save": "save",
            "click #clone": "clone",
            "change #beer_style": "changeStyle"
        },

        initialize: function () {
            if (!this.options.brew) {
                this.brew = new ns.Brew();
                if (this.options.name) {
                    this.brew.set({"brewer": this.options.name});
                }
            } else {
                this.brew = new ns.Brew();
                this.brew.setData(this.options.brew);
            }
            _.bindAll(this, "change", "changeDate", "save", "saved", "clone", "changeStyle");

            this.styleModel = new StyleModel({
                styles: this.options.styles,
                brew: this.brew
            });
            this.styleConformance = new StyleConformanceView({
                model: this.styleModel
            });

            //this.brew.on("change", function(brew) {console.log(brew);}, this);

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
            "malts": ns.MaltSectionView,
            "hops": ns.HopSectionView,
            "additives": ns.AdditiveSectionView,
            "yeasts": ns.YeastSectionView,
            "mash_schedule": ns.MashTimeView,
            "fermentations": FermentationView
        },

        render: function () {
            this.$el.html("");
            var data = this.brew.asJSON();
            data.styles = this.styleModel.get('styles');
            this.$el.append(_.template($("#brewsheet_template").html(), data));

            _.each(this.brew.defaults, function (value, key) {

                if (this.brew.get(key) instanceof Backbone.Collection) {
                    if (this.subviews[key]) {
                        new this.subviews[key]({
                            "el": this.$el.find("#" + key),
                            "collection": this.brew.get(key)
                        }).render();
                    }
                }
                if (this.brew.get(key) instanceof Backbone.Model) {
                    if (this.subviews[key]) {
                        new this.subviews[key]({
                            "el": this.$el.find("#" + key),
                            "model": this.brew.get(key)
                        }).render();
                    }
                } else {
                    var el = this.$el.find("#" + key);
                    if (el.length > 0) {
                        this.$el.find("#" + key).on("change", this.change);
                    }
                }
            }, this);
            if (this.options.disabled) {
                this.$el.find("input").prop("disabled", true);
                this.$el.find("button").each(function () {
                    if (this.id !== "show_recipe" && this.id !== "show_json" && this.id !== "clone") {
                        $(this).hide();
                    }
                });
                this.$el.find("select").prop("disabled", true);
                this.$el.find("textarea").prop("disabled", true);
            } else {
                this.$el.find(".date").datepicker().on(
                    'changeDate',
                    this.changeDate
                );
            }

            this.computeActualABV();
            this.colorChanged();
            $('#brewsheet a:first').tab('show');
            this.$el.append(this.styleConformance.render().$el);
            return this;
        },

        changeStyle: function (e) {
            var styleId = $(e.currentTarget).val();
            this.brew.set({"beer_style": styleId});
        },

        changeDate: function (e) {
            var target = $(e.currentTarget);
            this.change({"currentTarget": target.find("input")});
        },

        change: function (e) {
            var target = $(e.currentTarget);
            var key = target.attr("id");
            if (!(this.brew.get(key) instanceof Backbone.Collection) && !(this.brew.get(key) instanceof Backbone.Model)) {
                this.brew.set(target.attr("id"), target.val());
            }
        },

        batchSizeChanged: function () {
            if (ol.calc.isNumber(this.brew.get("batch_size"))) {
                this.computeGravity();
                this.computeColor();
                this.computeBitterness();
                this.computeEfficiency();
            }
        },

        efficiencyChanged: function () {
            if (ol.calc.isNumber(this.brew.get("brewhouse_efficiency"))) {
                this.computeGravity();
            }
        },

        gravityChanged: function () {
            if (ol.calc.isNumber(this.brew.get("computed_og"))) {
                this.computeBitterness();
                this.computeFG();
            }
        },

        maltChange: function () {
            if (this.brew.get("malts").length > 0) {
                this.computeGravity();
                this.computeColor();
                this.computeEfficiency();
            }
        },

        hopChange: function () {
            if (this.brew.get("hops").length > 0) {
                this.computeBitterness();
            }
        },

        yeastChange: function () {
            if (this.brew.get("yeasts").length > 0) {
                this.computeFG();
            }
        },

        computeGravity: function () {
            var malts = this.brew.get("malts");
            var volume =  this.brew.get("batch_size");
            var efficiency = this.brew.get("brewhouse_efficiency");
            var og = ol.calc.computeGravity(volume, efficiency, malts);
            this.brew.set({"computed_og": og});
            this.$el.find("#computed_og").text(og);
        },

        computeColor: function () {
            var malts = this.brew.get("malts");
            var volume =  this.brew.get("batch_size");
            var ebc = ol.calc.computeColor(volume, malts);
            this.brew.set({"computed_color": ebc});
            this.colorChanged();
        },

        colorChanged: function () {
            var ebc = this.brew.get("computed_color");
            var c = "rgb(" + ol.calc.getHexForEBC(ebc) + ")";

            this.$el.find("#computed_color")
                .text(ebc)
                .css("background-color", c);
        },

        computeBitterness: function () {
            var og = this.brew.get("computed_og");
            var volume =  this.brew.get("batch_size");
            var hops = this.brew.get("hops");

            var bitterness = ol.calc.computeBitterness(og, volume, hops);
            this.brew.set({"computed_ibu": bitterness});
            this.$el.find("#computed_ibu").text(bitterness);
        },

        computeFG: function () {
            var og = this.brew.get("computed_og");
            var yeasts = this.brew.get("yeasts");

            var fg = ol.calc.computeFG(og, yeasts);
            this.brew.set({"computed_fg": fg});
            this.$el.find("#computed_fg").text(fg);
            this.computeABV();

        },

        computeABV: function () {
            var og = this.brew.get("computed_og");
            var fg = this.brew.get("computed_fg");

            var abv = "-";
            if (ol.calc.isNumber(og) && ol.calc.isNumber(fg)) {
                abv = Math.round(ol.calc.computeABV(og, fg) * 10) / 10;
            }
            this.brew.set({"computed_abv": abv});
            this.$el.find("#computed_abv").text(abv);
        },

        computeActualABV: function () {
            var og = this.brew.get("actual_og");
            var fg = this.brew.get("actual_fg");

            var abv = "";
            if (ol.calc.isNumber(og) && ol.calc.isNumber(fg)) {
                abv = Math.round(ol.calc.computeABV(og, fg) * 10) / 10;
            }
            this.brew.set({"actual_abv": abv});
            this.$el.find("#actual_abv").val(abv);
        },

        computeEfficiency: function () {
            var og = this.brew.get("actual_og");
            var volume =  this.brew.get("batch_size");
            var malts = this.brew.get("malts");

            var efficiency = ol.calc.computeEfficiency(og, volume, malts);
            this.brew.set({"brew_efficiency": efficiency});
            this.$el.find("#brew_efficiency").val(efficiency);
        },

        showJSON: function () {
            var modal = $('#modal');
            modal.find(".modal-body").html(new JsonView({data: this.brew.asJSON()}).render().$el);
            modal.modal('show');
        },

        save: function () {
            this.brew.save({}, {"success": this.saved});
        },

        saved: function () {
            window.history.pushState("object or string", "Title", "/brews/" + this.brew.get("id"));

            this.brew.set("data", null);
            this.brew.set("user", null);

            this.$el.find("#save_results").html(_.template(
                $("#success_alert_template").html(),
                {"type": "success", "message": "Brew saved!"}
            ));
        },

        clone: function () {
            window.history.pushState("object or string", "Title", "/brews/add");
            this.brew.set("id", null);
            this.options.disabled = false;
            this.render();
        }
    });
}(ol));
