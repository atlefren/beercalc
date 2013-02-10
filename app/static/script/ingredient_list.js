var ol = ol || {};
(function(ns) {

    var IngredientRow = Backbone.View.extend({

        tagName: "tr",

        render: function() {
            var fields = _.map(this.options.attr, function(attribute){
                return {"value": this.model.get(attribute)}
            }, this);

            this.$el.append(_.template($("#ingredient_row_template").html(), {"fields": fields}));
            return this;
        }
    });

    var IngredientTable = Backbone.View.extend({

        initialize: function() {
            this.collection.on("reset", this.addAll, this);
            this.collection.on("change", this.addOne, this);
        },

        addAll: function() {
            this.collection.each(this.addOne, this);
        },

        addOne: function(model) {
            if(!model.isNew()) {
                this.$el.append(new IngredientRow({model: model, "attr": this.options.attributes}).render().$el);
            }
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
            var values = _.reduce(this.options.form, function(res, el) {
                res[el] = this.$el.find("#" + el).val();
                return res;
            }, {}, this);
            this.options.callback(values);
        }

    });

    var IngredientList = Backbone.View.extend({

        events: {
            "click #add": "add"
        },

        attributes: ["name", "color", "ppg"],

        initialize: function() {
            _.bindAll(this, "add", "added", "saved", "saveError");
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
            this.collection.add(model);
            model.save(values, {"wait": true, "success": this.saved, "error": this.saveError});
        },

        saved: function() {
            this.adder.$el.remove();
        },

        saveError: function(model, xhr, options) {
            console.log(model, xhr, options);
        }
    });

    var Malt = Backbone.Model.extend({

        toJSON: function (){
            var data = {
                "id": this.get("id"),
                "name": this.get("name")
            };
            if(this.has("ppg") && this.get("ppg") !== "") {
                data.ppg = this.get("ppg");
            }
            if(this.has("color") && this.get("color") !== "") {
                data.color = this.get("color");
            }
            return data;
        }
    });

    var Malts = Backbone.Collection.extend({

        model: Malt,

        url: "/api/malt"

    });

    ns.MaltList = IngredientList.extend({

        attributes: ["name", "color", "ppg"],

        initialize: function() {

            this.collection = new Malts();
            IngredientList.prototype.initialize.apply(this, arguments);
        }
    });
}(ol));
