import aur = require("aurelia-router");
import impl = require("utils/graphDynamics");
declare var saveAs;

export class NavTest {
    static inject = [aur.Router, impl.GraphDynamics];
    public loadedData: Array<any> = [];
    public flows: Array<any> = [];
    public canVisualize: boolean = false;

    constructor(private theRouter: aur.Router, private dynamics: impl.GraphDynamics) {

    }

    activate() {
        if (localStorage.getItem("loaded_data")) {
            this.loadedData = JSON.parse(localStorage.getItem("loaded_data"));
            if (localStorage.getItem("flows")) {
                this.flows = JSON.parse(localStorage.getItem("flows"));
                this.canVisualize = true;
            }
        } 
    }

    attached() {
        var input = <HTMLInputElement>document.getElementById("newFiles");
        var that = this;
        input.addEventListener("change", function (ev: Event) {

            var list: Array<File> = [];
            for (var i = 0; i < input.files.length; i++) {
                list.push(input.files[i]);
            }

            var promises = list.map((file) => {
                return new Promise(function (resolve, reject) {
                    var reader = new FileReader();

                    reader.onload = function (event) {
                        var textData = <string>(<any>event.target).result;

                        var lines = textData.split("\n").filter((x) => x.trim() !== "");
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

            Promise.all(promises).then((value) => {
                that.loadedData = value;
                localStorage.setItem("loaded_data", JSON.stringify(value));
            });

            var reader = new FileReader();
            
        }, false);
    }

    loadFile() {
        localStorage.setItem("loaded_data", null);
        localStorage.setItem("flows", null);
        this.loadedData = [];
        this.flows = [];
        $("#newFiles").click();
    }

    compute() {
        if (this.loadedData.length > 0) {
            this.flows = [];
            var promises = [];
            for (var i = 0; i < this.loadedData.length - 1; i++) {
                var promise = new Promise((resolve, reject) => {
                    var myWorker = new Worker("../scripts/worker.js");
                    var piece = this.loadedData.slice(i,i+2)
                    myWorker.postMessage({ i: i, loadedData: piece });
                    console.log('Message posted to worker');

                    myWorker.onerror = (e) => {
                        reject(e);
                    };

                    myWorker.onmessage = (e) => {
                        console.log('Message received from worker');
                        this.flows.push(e.data);
                        resolve(e);
                    }

                });

                promises.push(promise);
            }

            Promise.all(promises).then(() => {
                localStorage.setItem("flows", JSON.stringify(this.flows));
                this.canVisualize = true;
            });
        }

    }

    visualize() {
        this.theRouter.navigate("visualisation", true);
    }

    exportFile() {
        var text = JSON.stringify(JSON.parse(localStorage.getItem("flows")), null, '\t');
        var blob = new Blob([text], { type: "text/plain;charset=utf-8" });
        
        saveAs(blob, "flows.json");

    }
} 
