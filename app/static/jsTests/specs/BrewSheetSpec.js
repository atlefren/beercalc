describe("Brewsheet.Calculator", function() {

    var calc = ol.calc;

    console.log(ol);

    beforeEach(function() {

    });

    it("should be defined", function() {
        expect(calc).toBeDefined();
    });

    it("should convert liters to gallons", function(){
        expect(calc.toGallons(10)).toBe(2.64172051242);
    });

    it("should convert grams to lbs", function(){
        expect(calc.toLbs(10)).toBe(0.02205);
    });

    it("shouldDetectisNumber", function(){
        expect(calc.isNumber(1)).toBeTruthy();
        expect(calc.isNumber(1.0)).toBeTruthy();
        expect(calc.isNumber("-")).toBeFalsy();
    });

    it("should calculate ABV", function() {
        expect(Math.round(ol.calc.computeABV(1.05, 1.01) * 10) / 10).toBe(5.3);
    });

    describe("Bitterness calc", function(){

        //example from "how to brew" pp. 56-57
        beforeEach(function(){
            this.hops = new ol.Hops(
                [
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
            );

            this.volume = 19;
            this.og = 1.080;

        });

        it("should return blank when not og set", function() {
            expect(calc.computeBitterness("", this.volume, this.hops)).toBe("-")
        });

        it("should return blank when not volume set", function() {
            expect(calc.computeBitterness(this.og, "", this.hops)).toBe("-")
        });

        it("should return blank when no hops", function() {
            expect(calc.computeBitterness(this.og, this.volume, new ol.Hops())).toBe("-")
        });

        it("should return blank when not alpha acid set for hop", function() {

            this.hops.each(function(hop) {
                hop.set("alpha_acid", "");
            });
            expect(calc.computeBitterness(this.og, this.volume, this.hops)).toBe("-")
        });

        it("should return blank when not quantity set for hop", function() {
            this.hops.each(function(hop) {
                hop.set("quantity", "");
            });
            expect(calc.computeBitterness(this.og, this.volume, this.hops)).toBe("-")
        });

        it("should return blank when not boil_time set for hop", function() {
            this.hops.each(function(hop) {
                hop.set("boil_time", "");
            });
            expect(calc.computeBitterness(this.og, this.volume, this.hops)).toBe("-")
        });

        it("should compute IBU for cones", function(){
            expect(calc.computeBitterness(this.og, this.volume, this.hops)).toBe(31)
        });

        it("should compute IBU for pellets", function(){
            this.hops.each(function(hop) {
                hop.set("form", "pellets");
            });
            expect(calc.computeBitterness(this.og, this.volume, this.hops)).toBe(39)
        });
    });

    describe("Gravity calc", function(){

        //example from "how to brew" pp. 194-195
        beforeEach(function(){
            this.malts = new ol.Malts(
                [
                    {
                        "quantity": "3401.94277", //7.5 lbs
                        "name": "2-row lager malt",
                        "ppg": "36",
                        "color": ""
                    },
                    {
                        "quantity": "226.796185", //0.5 lbs
                        "name": "caramel 15",
                        "ppg": "34",
                        "color": ""
                    },
                    {
                        "quantity": "226.796185", //0.5 lbs
                        "name": "caramel 75",
                        "ppg": "35",
                        "color": ""
                    },
                    {
                        "quantity": "226.796185", //0.5 lbs
                        "name": "chocolate malt",
                        "ppg": "34",
                        "color": ""
                    },
                    {
                        "quantity": "226.796185", //0.5 lbs
                        "name": "roasted barley",
                        "ppg": "30",
                        "color": ""
                    }
                ]
            );

            this.volume = 19;
            this.efficiency = 75;

        });

        it("should return blank when efficiency not set", function() {
            expect(calc.computeGravity(this.volume, "", this.malts)).toBe("-")
        });

        it("should return blank when volume not set", function() {
            expect(calc.computeGravity("", this.efficiency, this.malts)).toBe("-")
        });

        it("should return blank when malt quantity not set", function() {
            this.malts.each(function(malt) {
                malt.set("quantity", "");
            });
            expect(calc.computeGravity(this.volume, this.efficiency, this.malts)).toBe("-")
        });

        it("should return blank when malt ppg not set", function() {
            this.malts.each(function(malt) {
                malt.set("ppg", "");
            });
            expect(calc.computeGravity(this.volume, this.efficiency, this.malts)).toBe("-")
        });

        it("should compute gravity", function() {
            expect(calc.computeGravity(this.volume, this.efficiency, this.malts)).toBe(1.050)
        });
    });

    describe("efficiency calc", function(){

        //example from "how to brew" pp. 194-195
        beforeEach(function(){
            this.malts = new ol.Malts(
                [
                    {
                        "quantity": "2948.35041", //6.5 lbs
                        "name": "2-row lager malt",
                        "ppg": "36",
                        "color": ""
                    },
                    {
                        "quantity": "226.796185", //0.5 lbs
                        "name": "caramel 15",
                        "ppg": "34",
                        "color": ""
                    },
                    {
                        "quantity": "226.796185", //0.5 lbs
                        "name": "caramel 75",
                        "ppg": "35",
                        "color": ""
                    },
                    {
                        "quantity": "226.796185", //0.5 lbs
                        "name": "chocolate malt",
                        "ppg": "34",
                        "color": ""
                    },
                    {
                        "quantity": "226.796185", //0.5 lbs
                        "name": "roasted barley",
                        "ppg": "30",
                        "color": ""
                    }
                ]
            );

            this.volume = 22.7124707; //6 gallons
            this.og = 1.038;

        });

        it("should return blank when og not set", function() {
            expect(calc.computeEfficiency("", this.volume, this.malts)).toBe("-");
        });

        it("should return blank when volume not set", function() {
            expect(calc.computeEfficiency(this.og, "", this.malts)).toBe("-");
        });

        it("should return blank when malt quantity not set", function() {
            this.malts.each(function(malt) {
                malt.set("quantity", "");
            });
            expect(calc.computeEfficiency(this.og, this.volume, this.malts)).toBe("-");
        });

        it("should return blank when malt ppg not set", function() {
            this.malts.each(function(malt) {
                malt.set("ppg", "");
            });
            expect(calc.computeEfficiency(this.og, this.volume, this.malts)).toBe("-");
        });

        it("should compute Efficiency", function() {
            expect(calc.computeEfficiency(this.og, this.volume, this.malts)).toBe(76);
        });
    });

    describe("FG calc", function(){
        //example from http://www.homebrewtalk.com/f13/estimate-final-gravity-32826/#post322639
        beforeEach(function(){
            this.yeasts = new ol.Yeasts(
                [
                    {
                        "attenuation": 75
                    }
                ]
            );

            this.og = 1.055;
        });

        it("should return blank when og not set", function() {
            expect(calc.computeFG("", this.yeasts)).toBe("-");
        });

        it("should return blank when yeast attenuation not set", function() {
            this.yeasts.each(function(yeast) {
                yeast.set("attenuation", "");
            });
            expect(calc.computeFG(this.og, this.yeasts)).toBe("-");
        });

    });


    describe("Color calc", function(){

        //example from "how to brew" pp. 272-273
        beforeEach(function(){
            this.malts = new ol.Malts(
                [
                    {
                        "quantity": "2721.55422", //6 lbs
                        "name": "2-row lager malt",
                        "ppg": "36",
                        "color": "10"
                    },
                    {
                        "quantity": "226.796185", //0.5 lbs
                        "name": "caramel 15",
                        "ppg": "34",
                        "color": "120"
                    },
                    {
                        "quantity": "226.796185", //0.5 lbs
                        "name": "chocolate malt",
                        "ppg": "34",
                        "color": "700"
                    },
                    {
                        "quantity": "113.398093", //0.25 lbs
                        "name": "black patent",
                        "ppg": "30",
                        "color": "1000"
                    }
                ]
            );

            this.volume = 19;
        });

        it("should return blank when volume not set", function() {
            expect(calc.computeColor("", this.malts)).toBe("-")
        });

        it("should return blank when malt quantity not set", function() {
            this.malts.each(function(malt) {
                malt.set("quantity", "");
            });
            expect(calc.computeColor(this.volume, this.malts)).toBe("-")
        });

        it("should return blank when malt color not set", function() {
            this.malts.each(function(malt) {
                malt.set("color", "");
            });
            expect(calc.computeColor(this.volume, this.malts)).toBe("-")
        });

        it("should compute color", function() {
            expect(calc.computeColor(this.volume, this.malts)).toBe(56)
        });
    });
});