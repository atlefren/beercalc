(function (ns) {
    "use strict";

    buster.testCase('BrewsheetCalculatorTest', {

        "should be defined": function () {
            assert(ns.calc);
        },

        "should convert liters to gallons": function () {
            assert.equals(ns.calc.toGallons(10), 2.64172051242);
        },

        "shoould convert grams to lb": function () {
            assert.equals(ns.calc.toLbs(10), 0.02205);
        },

        "should detect if is number": function () {
            assert.equals(ns.calc.isNumber(1), true);
            assert.equals(ns.calc.isNumber(1.0), true);
            assert.equals(ns.calc.isNumber("-"), false);
        },

        "should calculate ABV": function () {
            assert.equals(Math.round(ns.calc.computeABV(1.05, 1.01) * 10) / 10, 5.3);
        },

        "should get right hex colors for ebc": function () {
            assert.equals(ns.calc.getHexForEBC(0), "250,250,160");
            assert.equals(ns.calc.getHexForEBC(19), "192,129,56");
            assert.equals(ns.calc.getHexForEBC(100), "6,2,1");
        }

    });

    buster.testCase('BitternessCalculatorTest', {

        setUp: function () {
            //example from "how to brew" pp. 56-57
            this.brew = new ns.Brew();
            this.brew.setData({
                "hops": [
                    {
                        "quantity": 43,
                        "name": "perle",
                        "form": "cones",
                        "alpha_acid": "6.4",
                        "boil_time": "60"
                    },
                    {
                        "quantity": 28,
                        "name": "liberty",
                        "form": "cones",
                        "alpha_acid": "4.6",
                        "boil_time": "15"
                    }
                ]
            });

            this.volume = 19;
            this.og = 1.080;
        },

        "should have hops": function () {
            assert(this.brew.get("hops"));
        },

        "should return blank when og not set": function () {
            var ibu = ns.calc.computeBitterness("", this.volume, this.brew.get("hops"));
            assert.equals(ibu, "-");
        },

        "should return blank when volume set": function () {
            var ibu = ns.calc.computeBitterness(this.og, "", this.brew.get("hops"));
            assert.equals(ibu, "-");
        },

        "should return blank when no hops": function () {
            var brew = new ns.Brew();
            var ibu = ns.calc.computeBitterness(this.og, "", brew.get("hops"));
            assert.equals(ibu, "-");
        },

        "should return blank when not alpha acid set for hop": function () {
            var hops = this.brew.get("hops");
            hops.each(function (hop) {
                hop.set("alpha_acid", "");
            });
            var ibu = ns.calc.computeBitterness(this.og, "", hops);
            assert.equals(ibu, "-");
        },

        "should return blank when not quantity set for hop": function () {
            var hops = this.brew.get("hops");
            hops.each(function (hop) {
                hop.set("quantity", "");
            });
            var ibu = ns.calc.computeBitterness(this.og, "", hops);
            assert.equals(ibu, "-");
        },

        "should return blank when not boil_time set for hop": function () {
            var hops = this.brew.get("hops");
            hops.each(function (hop) {
                hop.set("boil_time", "");
            });
            var ibu = ns.calc.computeBitterness(this.og, "", hops);
            assert.equals(ibu, "-");
        },

        "should compute bitterness for cones": function () {
            var ibu = ns.calc.computeBitterness(this.og, this.volume, this.brew.get("hops"));
            assert.equals(ibu, 31);
        },

        "should compute IBU for pellets": function () {
            var hops = this.brew.get("hops");
            hops.each(function (hop) {
                hop.set("form", "pellets");
            });
            var ibu = ns.calc.computeBitterness(this.og, this.volume, this.brew.get("hops"));
            assert.equals(ibu, 39);
        }
    });

}(ol));