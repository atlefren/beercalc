var ol = ol || {};
(function(ns) {


    var Malt = Backbone.Model.extend({

    });

    var Malts = Backbone.Collection.extend({

        model: Malt,

        url: "/api/malts/"

    });

    var MaltRow = Backbone.View.extend({

        tagName: "tr",

        render: function() {
            var d = this.model.toJSON();
            console.log(d);
            this.$el.append(_.template($("#malt_row").html(), d));
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
            console.log("addone", model);
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
            this.$el.remove();
        }

    });

    ns.MaltList = Backbone.View.extend({

        events: {
            "click #add": "add"
        },

        initialize: function() {
            _.bindAll(this, "add", "added");
            this.collection = new Malts();
            new MaltTable({"el": this.$el.find("tbody"), collection: this.collection})
        },

        setData: function(data) {
            this.collection.reset(data);
            return this;
        },

        add: function() {
            var form = ["name", "color", "ppg"];
            var adder = new Adder({"form": form, "callback": this.added}).render();
            this.$el.find("tbody").append(adder.$el);
        },

        added: function(values) {
            var model = new this.collection.model();
            this.collection.add(model);
            model.save(values, {wait: true});
        }
    });
}(ol));
