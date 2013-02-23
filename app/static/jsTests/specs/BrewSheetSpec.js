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

    describe("Bitterness calc", function(){

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
    })


});