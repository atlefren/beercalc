(function (ns) {
    "use strict";

    buster.testCase('BrewsheetModels test', {

        setUp: function () {
            this.brew = new ns.Brew();
            this.brew.setData({
                "batch_size": "30",
                "hops": [
                    {
                        "alpha_acid": "10.3",
                        "boil_time": "60",
                        "name": "Northern Brewer (U.K.)",
                        "form": "pellets",
                        "quantity": "30"
                    },
                    {
                        "alpha_acid": "3.9",
                        "boil_time": "30",
                        "name": "Saaz (Czech)",
                        "form": "pellets",
                        "quantity": "60"
                    }
                ],
                "malts": [
                    {
                        "color": "3.2",
                        "percentage": 53.3,
                        "ppg": "36",
                        "name": "Pilsner",
                        "quantity": "4000"
                    },
                    {
                        "color": "15",
                        "percentage": 26.7,
                        "ppg": "35",
                        "name": "Munchener Light malt (Castle Malting)",
                        "quantity": "2000"
                    }],

                "additives": [
                    {
                        "added_when": "",
                        "boil_time": "5",
                        "name": "Koriander (hel)",
                        "quantity": "30"
                    },
                    {
                        "added_when": "",
                        "boil_time": "5",
                        "name": "Hvit pepper (hel)",
                        "quantity": "1.6"
                    }
                ]
            });
        },

        "should be defined": function () {
            assert(ns.Brew);
        },

        "should have scale function": function () {
            assert.defined(this.brew.scale);
        },

        "should scale hops correctly": function () {
            this.brew.scale(27);
            assert.equals(this.brew.get("hops").at(0).get("quantity"), 27);
            assert.equals(this.brew.get("hops").at(1).get("quantity"), 54);
        },

        "should scale malts correctly": function () {
            this.brew.scale(27);
            assert.equals(this.brew.get("malts").at(0).get("quantity"), 3600);
            assert.equals(this.brew.get("malts").at(1).get("quantity"), 1800);
        },

        "should scale additives correctly": function () {
            this.brew.scale(27);
            assert.equals(this.brew.get("additives").at(0).get("quantity"), 27);
            assert.equals(this.brew.get("additives").at(1).get("quantity"), 1.44);
        }

    });
}(ol));