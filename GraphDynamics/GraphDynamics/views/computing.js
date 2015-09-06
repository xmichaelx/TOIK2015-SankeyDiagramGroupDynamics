define(["require", "exports", "aurelia-router", "utils/graphDynamics"], function (require, exports, aur, impl) {
    var NavTest = (function () {
        function NavTest(theRouter, dynamics) {
            this.theRouter = theRouter;
            this.dynamics = dynamics;
            this.loadedData = [];
            this.flows = [];
            this.canVisualize = false;
        }
        NavTest.prototype.activate = function () {
            if (localStorage.getItem("loaded_data")) {
                this.loadedData = JSON.parse(localStorage.getItem("loaded_data"));
                if (localStorage.getItem("flows")) {
                    this.flows = JSON.parse(localStorage.getItem("flows"));
                    this.canVisualize = true;
                }
            }
        };
        NavTest.prototype.attached = function () {
            var input = document.getElementById("newFiles");
            var that = this;
            input.addEventListener("change", function (ev) {
                var list = [];
                for (var i = 0; i < input.files.length; i++) {
                    list.push(input.files[i]);
                }
                var promises = list.map(function (file) {
                    return new Promise(function (resolve, reject) {
                        var reader = new FileReader();
                        reader.onload = function (event) {
                            var textData = event.target.result;
                            var lines = textData.split("\n").filter(function (x) { return x.trim() !== ""; });
                            var t = parseInt(file.name);
                            var communities = [];
                            lines.forEach(function (line) {
                                var tokens = line.split(":");
                                var community_id = parseInt(tokens[0]);
                                var participants = tokens[1].trim().split(" ").map(function (x) { return parseInt(x); });
                                communities.push(participants);
                            });
                            resolve({ t: t, communities: communities });
                        };
                        reader.onerror = function (err) {
                            reject(err);
                        };
                        reader.readAsText(file);
                    });
                });
                Promise.all(promises).then(function (value) {
                    that.loadedData = value;
                    localStorage.setItem("loaded_data", JSON.stringify(value));
                });
                var reader = new FileReader();
            }, false);
        };
        NavTest.prototype.loadFile = function () {
            localStorage.setItem("loaded_data", null);
            localStorage.setItem("flows", null);
            this.loadedData = [];
            this.flows = [];
            $("#newFiles").click();
        };
        NavTest.prototype.compute = function () {
            var _this = this;
            if (this.loadedData.length > 0) {
                this.flows = [];
                var promises = [];
                for (var i = 0; i < this.loadedData.length - 1; i++) {
                    var promise = new Promise(function (resolve, reject) {
                        var myWorker = new Worker("../scripts/worker.js");
                        var piece = _this.loadedData.slice(i, i + 2);
                        myWorker.postMessage({ i: i, loadedData: piece });
                        console.log('Message posted to worker');
                        myWorker.onerror = function (e) {
                            reject(e);
                        };
                        myWorker.onmessage = function (e) {
                            console.log('Message received from worker');
                            _this.flows.push(e.data);
                            resolve(e);
                        };
                    });
                    promises.push(promise);
                }
                Promise.all(promises).then(function () {
                    localStorage.setItem("flows", JSON.stringify(_this.flows));
                    _this.canVisualize = true;
                });
            }
        };
        NavTest.prototype.visualize = function () {
            this.theRouter.navigate("visualisation", true);
        };
        NavTest.prototype.exportFile = function () {
            var text = JSON.stringify(JSON.parse(localStorage.getItem("flows")), null, '\t');
            var blob = new Blob([text], { type: "text/plain;charset=utf-8" });
            saveAs(blob, "flows.json");
        };
        NavTest.inject = [aur.Router, impl.GraphDynamics];
        return NavTest;
    })();
    exports.NavTest = NavTest;
});
//# sourceMappingURL=computing.js.map