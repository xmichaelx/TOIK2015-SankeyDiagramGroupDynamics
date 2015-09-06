define(["require", "exports", "aurelia-router"], function (require, exports, aur) {
    var App = (function () {
        function App(router) {
            this.router = router;
            this.router.configure(function (config) {
                config.title = "Graph dynamics visualisation";
                config.map([
                    { route: "visualisation", moduleId: "views/visualisation", nav: false, title: "Visualisation" },
                    { route: ["", "computing"], moduleId: "views/computing", nav: true, title: "Computing" }
                ]);
            });
        }
        App.inject = [aur.Router];
        return App;
    })();
    exports.App = App;
});
//# sourceMappingURL=app.js.map