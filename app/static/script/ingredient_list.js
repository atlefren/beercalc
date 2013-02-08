var ol = ol || {};
(function(ns) {


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
        },

        toTemplate: function (){

            return {
                "id": this.get("id"),
                "name": this.get("name"),
                "color": this.get("color"),
                "ppg": this.get("ppg")
            }
        }
    });

    var Malts = Backbone.Collection.extend({

        model: Malt,

        url: "/api/malt"

    });

    var MaltRow = Backbone.View.extend({

        tagName: "tr",

        render: function() {
            this.$el.append(_.template($("#malt_row").html(), this.model.toTemplate()));
            return this;
        }
    });

    var MaltTable = Backbone.View.extend({

        initialize: function() {
            this.collection.on("reset", this.addAll, this);
            //this.collection.on("add", this.addOne, this);
            this.collection.on("change", this.addOne, this);
        },

        addAll: function() {
            this.collection.each(this.addOne, this);
        },

        addOne: function(model) {
            if(!model.isNew()) {
                this.$el.append(new MaltRow({model: model}).render().$el);
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

            var data = _.map(this.options.form, function(el) {
                return "<td><input type='text' id='" + el +"'></td>"
            }, this);

            var data = data.join("") + "<td><button type='button' class='btn btn-primary' id='save'>Save</button></td>";

            this.$el.append($(data));
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

    ns.MaltList = Backbone.View.extend({

        events: {
            "click #add": "add"
        },

        initialize: function() {
            _.bindAll(this, "add", "added", "saved", "saveError");
            this.collection = new Malts();
            new MaltTable({"el": this.$el.find("tbody"), collection: this.collection})
        },

        setData: function(data) {
            this.collection.reset(data);
            return this;
        },

        add: function() {
            var form = ["name", "color", "ppg"];
            this.adder = new Adder({"form": form, "callback": this.added}).render();
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
}(ol));
