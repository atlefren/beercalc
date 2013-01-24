

var ol = {};
(function(ns) {

    var Malt = Backbone.Model.extend({
        "defaults": {
            "quantity": "",
            "percentage": "",
            "ingredient": "",
            "og": "",
            "color": ""
        }
    });

    var Malts = Backbone.Collection.extend({

        model: Malt,

        comparator: function(malt) {
            return malt.get("quantity");
        }
    });

    var Hop = Backbone.Model.extend({
        "defaults": {
            "quantity": "",
            "name": "",
            "form": "",
            "alpha_acid": "",
            "boil_time": ""
        }
    });

    var Hops = Backbone.Collection.extend({

        model: Hop,

        comparator: function(hop) {
            return hop.get("boil_time");
        }
    });

    var Additive = Backbone.Model.extend({
        "defaults": {
            "quantity": "",
            "name": "",
            "boil_time": ""
        }
    });

    var Additives = Backbone.Collection.extend({

        model: Additive,

        comparator: function(additive) {
            return additive.get("boil_time");
        }
    });

    var MashTime = Backbone.Model.extend({
        "defaults": {
            "mash_time": "",
            "mash_temperature": ""
        }
    });

    var MashSchedule = Backbone.Collection.extend({
        model: MashTime,
    });

    var Fermentation  = Backbone.Model.extend({
        "defaults": {
            "yeast_name": "",
            "primary_fermentation_days": "",
            "primary_fermentation_temp": "",
            "secondary_fermentation_days": "",
            "secondary_fermentation_temp": "",
            "storage_days": "",
            "storage_temp": ""
        }
    });

    var GeneralInformation = Backbone.Model.extend({
        "defaults": {
            "beer_name": "",
            "brewer": "",
            "beer_style": "",
            "brew_date": "",
            "wort_size": "",
            "batch_size": "",
            "computed_color": "",
            "computed_ibu": "",
            "actual_og": "",
            "fg": ""
        }
    });

    var AdditionalInformation = Backbone.Model.extend({
        "defaults": {
            "brew_date": "",
            "bottle_date": "",
            "filtered": false,
            "co2": "none",
            "comment": ""
        }
    });

    var Water = Backbone.Model.extend({
        "defaults": {
            "mashing_water": "",
            "sparging_water": ""
        }
    });

    var DynamicTableView = Backbone.View.extend({

        listenOn: [],

        initialize: function() {
            var changeHandleFunction = function(attributeName) {
                return function () {
                    var vals = {};
                    vals[attributeName] = this.$el.find("#" + attributeName).val();
                    this.model.set(vals);
                }
            }

            _.extend(this.events, _.reduce(this.listenOn, function(events, attr){
                events["blur #" + attr] = attr + "Change";
                var func = changeHandleFunction(attr);
                this.constructor.prototype[attr + "Change"] = func;
                return events;
            }, {}, this));
            var funcs  = _.map(this.listenOn, function(attr){
                return attr + "Change";
            });
            funcs.unshift(this);
            _.bindAll.apply(funcs);
        }

    });


    ns.GeneralInformationView = DynamicTableView.extend({

        listenOn: ["beer_name", "brewer", "beer_style", "brew_date", "wort_size", "batch_size", "computed_color", "computed_ibu", "actual_og", "fg"],

        events:  {},

        initialize: function() {
            DynamicTableView.prototype.initialize.apply(this, arguments);
        },

        render: function() {
            this.$el.html(_.template($("#general_information_template").html(), this.model.toJSON()));
            return this;
        }
    });

    ns.AdditionalInformationView = DynamicTableView.extend({

        listenOn: ["brew_date", "bottle_date", "comment"],

        events:  {
            "change #filtered": "changeFiltered",
            "change #co2": "changeCo2"
        },

        initialize: function() {
            DynamicTableView.prototype.initialize.apply(this, arguments);
            _.bindAll(this, "changeFiltered", "changeCo2");
        },

        render: function() {
            this.$el.html(_.template($("#additional_information_template").html(), this.model.toJSON()));
            return this;
        },

        changeFiltered: function(){
            var filtered = this.$el.find("#filtered").is(":checked");
            this.model.set({"filtered": filtered});
        },

        changeCo2: function() {
            var co2 = this.$el.find("#co2").val();
            this.model.set({"co2": co2});
        }
    });

    ns.FermentationView = DynamicTableView.extend({
        listenOn: ["yeast_name", "primary_fermentation_days", "primary_fermentation_temp", "secondary_fermentation_days", "secondary_fermentation_temp", "storage_days", "storage_temp"],

        events:  {},

        initialize: function() {
            DynamicTableView.prototype.initialize.apply(this, arguments);
        },

        render: function() {
            this.$el.html(_.template($("#fermentation_template").html(), this.model.toJSON()));
            return this;
        }
    });

    ns.WaterView = DynamicTableView.extend({

        listenOn: ["mashing_water", "sparging_water"],

        events:  {},

        initialize: function() {
            DynamicTableView.prototype.initialize.apply(this, arguments);
        },

        render: function() {
            this.$el.html(_.template($("#water_table_template").html(), this.model.toJSON()));
            return this;
        }
    });

    var BaseSectionView = Backbone.View.extend({

        render: function() {
            return this;
        },

        add: function(){
            this.collection.add(new this.collection.model());
        }
    });


    ns.MaltSectionView = BaseSectionView.extend({

        events: {
            "click #add_malt": "add"
        },

        initialize: function() {
            _.bindAll(this, "add");
            this.collection.on("add", this.render, this);
            this.collection.on("change:quantity", this.adjustPercentages, this);
        },

        render: function() {
            var table = this.$el.find("#malts_table").find("tbody");
            table.html("");
            this.collection.each(function(malt) {
                table.prepend(new MaltTableRowView({model: malt}).render().$el);
            });
        },

        adjustPercentages: function() {
            var total = this.collection.reduce(function(total, malt) {return total += malt.get("quantity");}, 0);
            this.collection.each(function(malt) {
                var percentage = (malt.get("quantity")/total) * 100;
                var pow = Math.pow(10, 1);
                malt.set({"percentage": Math.round(percentage * pow) / pow});
            });
            this.collection.sort();
            this.render();
        }
    });

    ns.HopSectionView = BaseSectionView.extend({

        events: {
            "click #add_hop": "add"
        },

        initialize: function() {
            _.bindAll(this, "add");
            this.collection.on("add", this.render, this);
            this.collection.on("change:boil_time", this.changeBoilTime, this);
        },

        render: function() {
            var table = this.$el.find("#hops").find("tbody");
            table.html("");
            this.collection.each(function(hop) {
                table.prepend(new HopTableRowView({model: hop}).render().$el);
            });
        },

        changeBoilTime: function() {
            this.collection.sort();
            this.render();
        }
    });

    ns.AdditiveSectionView = BaseSectionView.extend({

        events: {
            "click #add_additive": "add"
        },

        initialize: function() {
            _.bindAll(this, "add");
            this.collection.on("add", this.render, this);
            this.collection.on("change:boil_time", this.changeBoilTime, this);
        },

        render: function() {
            var table = this.$el.find("#additives").find("tbody");
            table.html("");
            this.collection.each(function(additive) {
                table.prepend(new AdditiveTableRowView({model: additive}).render().$el);
            });
        },

        changeBoilTime: function() {
            this.collection.sort();
            this.render();
        }
    });

    ns.MashTimeView = BaseSectionView.extend({

        events: {
            "click #add_mash_time": "add"
        },

        initialize: function() {
            _.bindAll(this, "add");
            this.collection.on("add", this.render, this);
        },

        render: function() {
            var table = this.$el.find("#mashing").find("tbody");
            table.html("");
            this.collection.each(function(mashTime) {
                table.prepend(new MashScheduleRowView({model: mashTime}).render().$el);
            });
        },
    });


    var MaltTableRowView = DynamicTableView.extend({

        tagName: "tr",

        events:  {
            "blur #quantity": "qtyChange",
        },

        listenOn: ["ingredient", "og", "color"],

        initialize: function() {
            DynamicTableView.prototype.initialize.apply(this, arguments);
            _.bindAll(this, "qtyChange");
            this.model.on("change:percentage", this.percentageChange, this);
        },

        render: function() {
            this.$el.html(_.template($("#malt_table_row_template").html(), this.model.toJSON()));
            return this;
        },

        qtyChange: function(e) {
            var el = this.$el.find("#quantity");
            var qty = parseFloat(el.val());
            if(!isNaN(qty)) {
                this.model.set({"quantity": qty});
            } else {
                var old = this.model.get("quantity");
                if(old === 0.0) {
                    old = "";
                }
                el.val(old);
            }
        },

        percentageChange: function() {
            this.$el.find("#percentage").val(this.model.get("percentage"));
        }
    });

    var HopTableRowView = DynamicTableView.extend({

        tagName: "tr",

        listenOn: ["quantity", "name", "form", "alpha_acid", "boil_time"],

        events: {},
        initialize: function() {
            DynamicTableView.prototype.initialize.apply(this, arguments);
        },

        render: function() {
            this.$el.html(_.template($("#hop_table_row_template").html(), this.model.toJSON()));
            return this;
        }
    });

    var AdditiveTableRowView = DynamicTableView.extend({

        tagName: "tr",

        listenOn: ["quantity", "name", "boil_time"],

        events:  {},

        initialize: function() {
            DynamicTableView.prototype.initialize.apply(this, arguments);
        },

        render: function() {
            this.$el.html(_.template($("#additive_table_row_template").html(), this.model.toJSON()));
            return this;
        }
    });

    var MashScheduleRowView = DynamicTableView.extend({

        tagName: "tr",

        listenOn: ["mash_time", "mash_temperature"],

        events:  {},

        initialize: function() {
            DynamicTableView.prototype.initialize.apply(this, arguments);
        },

        render: function() {
            this.$el.html(_.template($("#mash_time_row_template").html(), this.model.toJSON()));
            return this;
        }
    });

    var AsciiView = Backbone.View.extend({
        tagName: "pre",

        render: function() {
            console.log(this.options.data.serialize());
            this.$el.html(_.template($("#ascii_template").html(), this.options.data.serialize()));
            return this;
        }
    });

    ns.RecepieView = Backbone.View.extend({

        events: {
            "click #show_recepie": "show_recepie"
        },

        initialize: function() {
            _.bindAll(this, "show_recepie");
        },

        show_recepie: function() {
            this.$el.find("#content").html(new AsciiView({data: this.options.data}).render().$el);
        }

    });

    ns.createBrew = function() {
        var data = {};
        data.generalInformation = new GeneralInformation();
        data.malts = new Malts();
        data.hops = new Hops();
        data.additives = new Additives();
        data.water = new Water();
        data.mashSchedule = new MashSchedule();
        data.fermentation = new Fermentation();
        data.additionalInformation = new AdditionalInformation();


        var serialize = function() {
            return _.reduce(data, function(res, d, key) {
                res[key] = d.toJSON();
                return res;
            }, {});
        };

        return {
            malts: data.malts,
            hops: data.hops,
            generalInformation: data.generalInformation,
            additives: data.additives,
            water: data.water,
            mashSchedule: data.mashSchedule,
            fermentation: data.fermentation,
            additionalInformation: data.additionalInformation,
            serialize: serialize
        };
    };

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

}(ol.templateFunc));