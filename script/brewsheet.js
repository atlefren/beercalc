var ol = {};
(function(ns) {

    var maltSearch = function(query, callback) {
        var res = [
                {"id": 1, "name": "Marris Otter", "max_ppg": 38, "color": 6},
                {"id": 2, "name": "Crystal Rye", "max_ppg": 29, "color": 150},
                {"id": 3, "name": "Pale Chocolate", "max_ppg": 28, "color": 690}
            ];
        callback(res);
    };


    //todo: update with data from http://www.brewersfriend.com/2010/02/27/hops-alpha-acid-table-2009/
    var hopSearch = function(query, callback) {
        var res = [
            {"id": 1, "name": "British Columbia Goldings", "alpha_acid": 5},
            {"id": 2, "name": "Cascade", "alpha_acid": 5.5},
            {"id": 3, "name": "Crystal", "alpha_acid": 3.5},
            {"id": 4, "name": "East Kent Goldings", "alpha_acid": 5},
            {"id": 5, "name": "Fuggles", "alpha_acid": 4},
            {"id": 6, "name": "Glacier", "alpha_acid": 5.5},
            {"id": 7, "name": "Hallertauer Hersbrucker", "alpha_acid": 3.5},
            {"id": 8, "name": "Hallertauer Mittelfrüh", "alpha_acid": 4},
            {"id": 9, "name": "Liberty", "alpha_acid": 4},
            {"id": 10, "name": "Mt. Hood", "alpha_acid": 6},
            {"id": 11, "name": "Progress", "alpha_acid": 5.5},
            {"id": 12, "name": "Saaz", "alpha_acid": 3.5},
            {"id": 13, "name": "Spalt", "alpha_acid": 4.5},
            {"id": 14, "name": "Styrian Goldings", "alpha_acid": 6},
            {"id": 15, "name": "Tettnang", "alpha_acid": 4.5},
            {"id": 16, "name": "Willamette", "alpha_acid": 5},
            {"id": 17, "name": "Whitbread Goldings Variety", "alpha_acid": 4.5},
            {"id": 18, "name": "Challenger", "alpha_acid": 8.5},
            {"id": 19, "name": "Summit", "alpha_acid": 18.5},
        ];
        callback(res);
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
                this.$el.find("#" + name).on("blur", this.change);
            }, this);
            return this;
        },

        change: function(e){
            var target = $(e.currentTarget);
            var vals = {};
            vals[target.attr("id")] = target.val();
            this.model.set(vals);
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



    var GeneralInformation = Backbone.Model.extend({
        "defaults": {
            "beer_name": "",
            "brewer": "",
            "beer_style": "",
            "wort_size": "",
            "batch_size": "",
            "computed_color": "",
            "computed_ibu": "",
            "actual_og": "",
            "fg": ""
        }
    });

    ns.GeneralInformationView = DynamicTableView.extend({

        listenOn: ["beer_name", "brewer", "beer_style", "wort_size", "batch_size", "computed_color", "computed_ibu", "actual_og", "fg"],

        events: {
            "click #calculate_abv": "calculate_abv"
        },

        initialize: function() {
            DynamicTableView.prototype.initialize.apply(this, arguments);

            this.model.on("change:actual_og", this.toggleABV, this);
            this.model.on("change:fg", this.toggleABV, this);
            _.bindAll(this, "calculate_abv");
        },

        render: function() {
            this.$el.find("#desc").html(_.template($("#general_information_template").html(), this.model.toJSON()));
            DynamicTableView.prototype.render.apply(this, arguments);
            return this;
        },

        toggleABV: function() {
            var btn = this.$el.find("#calculate_abv");
            var og = this.model.get("actual_og");
            var fg = this.model.get("fg");
            if(!isNaN(og) && og !== "" && !isNaN(fg) && fg !== "" ) {
                btn.removeAttr("disabled");
            } else {
                btn.attr("disabled", "disabled");
            }
        },

        calculate_abv: function() {
            var og = this.model.get("actual_og");
            var fg = this.model.get("fg");
            var abv =(76.08 * (og - fg) / (1.775 - og)) * (fg / 0.794); //taken from http://www.brewersfriend.com/2011/06/16/alcohol-by-volume-calculator-updated/
            abv = Math.round( abv * 10 ) / 10;
            this.$el.find("#abv").val(abv);
        }
    });

    var Malt = Backbone.Model.extend({
        "defaults": {
            "quantity": "",
            "percentage": "",
            "ingredient": "",
            "max_ppg": "",
            "color": ""
        }
    });

    var Malts = Backbone.Collection.extend({

        model: Malt,

        comparator: function(malt) {
            return -parseInt(malt.get("quantity"), 10);
        }
    });

    ns.MaltSectionView = BaseSectionView.extend({

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
            var total = this.collection.reduce(function(total, malt) {return total += malt.get("quantity");}, 0);
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

        events: _.extend(_.clone(DynamicTableView.prototype.events), {
            "blur #quantity": "qtyChange"
        }),

        listenOn: ["ingredient", "max_ppg", "color"],

        initialize: function() {
            DynamicTableView.prototype.initialize.apply(this, arguments);
            _.bindAll(this, "qtyChange", "setMalt");
            this.model.on("change:percentage", this.percentageChange, this);
        },

        render: function() {
            this.$el.html(_.template($("#malt_table_row_template").html(), this.model.toJSON()));
            this.$el.find("#ingredient").typeahead({source: maltSearch, selectCallback: this.setMalt});
            DynamicTableView.prototype.render.apply(this, arguments);
            return this;
        },

        setMalt: function(malt) {
            this.model.set({"ingredient": malt.name, "max_ppg": malt.max_ppg, "color": malt.color});
            this.render();
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

    var MashTime = Backbone.Model.extend({
        "defaults": {
            "mash_time": "",
            "mash_temperature": ""
        }
    });

    var MashSchedule = Backbone.Collection.extend({
        model: MashTime
    });

    ns.MashTimeView = BaseSectionView.extend({

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
            var table = this.$el.find("#mashing").find("tbody");
            table.html("");
            this.collection.each(function(mashTime) {
                table.append(new MashScheduleRowView({model: mashTime}).render().$el);
            });
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

    var Hop = Backbone.Model.extend({
        "defaults": {
            "quantity": "",
            "name": "",
            "form": "none",
            "alpha_acid": "",
            "boil_time": ""
        }
    });

    var Hops = Backbone.Collection.extend({

        model: Hop,

        comparator: function(hop) {
            return -parseInt(hop.get("boil_time"), 10);
        }
    });

    ns.HopSectionView = BaseSectionView.extend({

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
            var table = this.$el.find("#hops").find("tbody");
            table.html("");
            this.collection.each(function(hop) {
                table.append(new HopTableRowView({model: hop}).render().$el);
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

            this.$el.find("#name").typeahead({source: hopSearch, selectCallback: this.setHop});

            DynamicTableView.prototype.render.apply(this, arguments);
            return this;
        },

        setHop: function(hop) {
            this.model.set({"name": hop.name, "alpha_acid": hop.alpha_acid});
            this.render();
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
            return -parseInt(additive.get("boil_time"), 10);
        }
    });

    ns.AdditiveSectionView = BaseSectionView.extend({

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
            var table = this.$el.find("#additives").find("tbody");
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

        listenOn: ["quantity", "name", "boil_time"],

        initialize: function() {
            DynamicTableView.prototype.initialize.apply(this, arguments);
        },

        render: function() {
            this.$el.html(_.template($("#additive_table_row_template").html(), this.model.toJSON()));
            DynamicTableView.prototype.render.apply(this, arguments);
            return this;
        }
    });

    var Water = Backbone.Model.extend({
        "defaults": {
            "mashing_water": "",
            "sparging_water": ""
        }
    });

    ns.WaterView = DynamicTableView.extend({

        listenOn: ["mashing_water", "sparging_water"],

        render: function() {
            this.$el.find("#water").html(_.template($("#water_form_template").html(), this.model.toJSON()));
            DynamicTableView.prototype.render.apply(this, arguments);
            return this;
        }
    });

    var Boil = Backbone.Model.extend({
        "defaults": {
            "boil_time": ""
        }
    });

    ns.BoiltimeView = DynamicTableView.extend({

        listenOn: ["boil_time"],

        render: function() {
            this.$el.find("#boiling").html(_.template($("#boil_time_form_template").html(), this.model.toJSON()));
            DynamicTableView.prototype.render.apply(this, arguments);
            return this;
        }
    });

    var Fermentation  = Backbone.Model.extend({
        "defaults": {
            "yeast_name": "",
            "yeast_type": "none",
            "primary_fermentation_days": "",
            "primary_fermentation_temp": "",
            "secondary_fermentation_days": "",
            "secondary_fermentation_temp": "",
            "storage_days": "",
            "storage_temp": ""
        }
    });

    ns.FermentationView = DynamicTableView.extend({

        listenOn: ["yeast_name", "primary_fermentation_days", "primary_fermentation_temp", "secondary_fermentation_days", "secondary_fermentation_temp", "storage_days", "storage_temp"],


        events: {
            "change #yeast_type": "changeYeastType"
        },

        render: function() {
            this.$el.find("#fermentation").html(_.template($("#fermentation_form_template").html(), this.model.toJSON()));
            DynamicTableView.prototype.render.apply(this, arguments);
            return this;
        },

        changeYeastType: function() {
           var yeast_type = this.$el.find("#yeast_type").val();
           this.model.set({"yeast_type": yeast_type});
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

    ns.AdditionalInformationView = DynamicTableView.extend({

        listenOn: ["brew_date", "bottle_date", "comment"],

        events:  {
            "change #filtered": "changeFiltered",
            "change #co2": "changeCo2"
        },

        initialize: function() {
            DynamicTableView.prototype.initialize.apply(this, arguments);
            _.bindAll(this, "changeFiltered", "changeCo2", "brewDateChanged", "bottleDateChanged");
        },

        render: function() {
            this.$el.find("#additional_desc").html(_.template($("#additional_information_template").html(), this.model.toJSON()));
            DynamicTableView.prototype.render.apply(this, arguments);

            this.$el.find("#brew_date").parent().datepicker().on('changeDate', this.brewDateChanged);
            this.$el.find("#bottle_date").parent().datepicker().on('changeDate', this.bottleDateChanged);

            return this;
        },

        brewDateChanged: function(e) {
            this.model.set({"brew_date": this.$el.find("#brew_date").val()});
        },

        bottleDateChanged: function(e) {
            this.model.set({"bottle_date": this.$el.find("#bottle_date").val()});
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
            this.$el.html(JSON.stringify(this.options.data.serialize(), undefined, 4));
            return this;
        }
    });

    ns.RecepieView = Backbone.View.extend({

        events: {
            "click #show_recipe": "show_recipe",
            "click #show_json": "show_json"
        },

        initialize: function() {
            _.bindAll(this, "show_recipe", "show_json");
        },

        show_recipe: function() {
            var modal = $('#recipeModal');
            modal.find(".modal-body").html(new AsciiView({data: this.options.data}).render().$el);
            modal.modal('show');
        },

        show_json: function() {
            var modal = $('#recipeModal');
            modal.find(".modal-body").html(new JsonView({data: this.options.data}).render().$el);
            modal.modal('show');
        }

    });

    ns.createBrew = function() {
        var data = {};
        data.generalInformation = new GeneralInformation();
        data.malts = new Malts();
        data.mashSchedule = new MashSchedule();
        data.hops = new Hops();
        data.additives = new Additives();
        data.water = new Water();
        data.boil = new Boil();
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
            boil: data.boil,
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