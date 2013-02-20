var ol = ol || {};
(function(ns) {

    var Model = Backbone.Model.extend({
        toJSON: function() {
            return _.reduce(this.attributes, function(data, attr, key){
                if(!isNaN(attr)) {
                    data[key] = parseFloat(attr);
                } else {
                    data[key] = attr;
                }
                return data;
            }, {}, this);
        }
    });

    var IngredientRow = Backbone.View.extend({

        tagName: "tr",

        events: {
            "click #edit": "edit",
            "click #save": "save",
            "click #delete": "delete"
        },

        initialize: function() {
            _.bindAll(this, "edit", "save", "saved", "saveError", "delete");
            this.model.on("destroy", this.remove, this);
        },

        render: function() {
            var fields = _.map(this.options.attr, function(attribute){
                return {"value": this.model.get(attribute)}
            }, this);

            var data = {
                "fields": fields
            };
            if (this.model.tooltip) {
                data.tooltip = this.model.get(this.model.tooltip);
            }
            this.$el.html("");
            this.$el.append(_.template($("#ingredient_row_template").html(), data));
            return this;
        },

        edit: function() {
            var fields = _.map(this.options.attr, function(attribute) {
                return {"name": attribute, value: this.model.get(attribute)};
            }, this);

            this.$el.html("");
            this.$el.append(_.template($("#edit_row_template").html(), {"fields": fields}));
        },

        save: function() {

            this.$el.find(".control-group").removeClass("error");
            this.$el.find(".help-inline").remove();

            var values = _.reduce(this.options.attr, function(res, el) {
                res[el] = this.$el.find("#" + el).val();
                return res;
            }, {}, this);
            this.saveChanges(values);
        },

        saveChanges: function(values) {
            this.model.save(values, {"wait": true, "success": this.saved, "error": this.saveError});
        },

        saved: function() {
            this.render();
        },

        saveError: function(model, xhr, options) {
            var errors = JSON.parse(xhr.responseText);
            _.each(errors.message, function(error) {
                var parent = this.$el.find("#" + error.field).parent();
                parent.append($("<span class='help-inline'>" + error.message +  "</span>"));
                parent.addClass("error");
            }, this);
        },

        delete: function() {
            this.model.destroy();
        }
    });

    var IngredientTable = Backbone.View.extend({

        initialize: function() {
            this.collection.on("reset", this.addAll, this);
            this.collection.on("add", this.addOne, this);
        },

        addAll: function() {
            this.collection.each(this.addOne, this);
        },

        addOne: function(model) {
                this.$el.append(new IngredientRow({model: model, "attr": this.options.attributes}).render().$el);
        }
    });

    var Adder = Backbone.View.extend({

        tagName: "tr",

        events: {
            "click #save": "save"
        },

        initialize: function(){
            _.bindAll(this, "save")
        },

        render: function() {
            var fields = _.map(this.options.form, function(el) {
                return {"name": el, value:""};
            }, this);

            this.$el.append(_.template($("#edit_row_template").html(), {"fields": fields}));
            return this;
        },

        save: function(){

            this.$el.find(".control-group").removeClass("error");
            this.$el.find(".help-inline").remove();

            var values = _.reduce(this.options.form, function(res, el) {
                res[el] = this.$el.find("#" + el).val();
                return res;
            }, {}, this);
            this.options.callback(values);
        },

        displayError: function(xhr) {
            var errors = JSON.parse(xhr.responseText);
            _.each(errors.message, function(error) {
                var parent = this.$el.find("#" + error.field).parent();
                parent.append($("<span class='help-inline'>" + error.message +  "</span>"));
                parent.addClass("error");
            }, this);
        }
    });

    var IngredientList = Backbone.View.extend({

        events: {
            "click #add": "add"
        },

        initialize: function() {
            _.bindAll(this, "add", "added", "saved", "saveError");
            this.collection = new this.collectionType();
            new IngredientTable({"el": this.$el.find("tbody"), collection: this.collection, attributes: this.attributes})
        },

        setData: function(data) {
            this.collection.reset(data);
            return this;
        },

        add: function() {
            this.adder = new Adder({"form": this.attributes, "callback": this.added}).render();
            this.$el.find("tbody").append(this.adder.$el);
        },

        added: function(values) {
            var model = new this.collection.model();
            model.urlRoot = this.collection.url;
            model.save(values, {"wait": true, "success": this.saved, "error": this.saveError});
        },

        saved: function(model) {
            this.adder.$el.remove();
            this.collection.add(model);
        },

        saveError: function(model, xhr, options) {
           this.adder.displayError(xhr);
        }
    });

    var Malt = Model.extend({
        tooltip: "description"
    });

    var Malts = Backbone.Collection.extend({
        model: Malt,
        url: "/api/malt"
    });

    ns.MaltList = IngredientList.extend({

        attributes: ["name", "color", "ppg"],

        collectionType: Malts
    });

    var Hop = Model.extend({
        tooltip: "profile"
    });

    var Hops = Backbone.Collection.extend({
        model: Hop,
        url: "/api/hop"
    });

    ns.HopList = IngredientList.extend({

        attributes: ["name", "alpha_acid"],

        tooltip: "profile",

        collectionType: Hops
    });

    var Yeast = Model.extend({
        tooltip: "flavor"
    });

    var Yeasts = Backbone.Collection.extend({

        model: Yeast,

        url: "/api/yeast"

    });

    ns.YeastList = IngredientList.extend({

        attributes: ["name", "attenuation", "type"],

        collectionType: Yeasts
    });
}(ol));
