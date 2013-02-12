describe("Brewsheet", function() {
    var brewSheet;

    beforeEach(function() {
        //todo: fix absolute path shait
        jasmine.getFixtures().fixturesPath = 'file:///home/atlefren/code/beercalc/app/static/jsTests/specs/fixtures';
        loadFixtures('fixtures.html', 'templates.html');

        brewSheet = new ol.BrewSheet().render();
    });

    it("should be defined", function() {
        expect(brewSheet).toBeDefined();
    });

    describe()

});