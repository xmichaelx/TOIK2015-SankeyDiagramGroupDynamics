define(["require", "exports"], function (require, exports) {
    var Home = (function () {
        function Home() {
            this.diagram = [];
            this.valueX = 0;
            this.valueY = 3;
            this.margin = { top: 20, right: 20, bottom: 50, left: 50 };
            this.width = 1400;
            this.height = 800;
        }
        Home.prototype.setupSlider = function (that, max) {
            $("#ex2").slider();
            $("#ex2").slider('destroy');
            that.slider = $("#ex2").slider({ min: 0, max: max, value: [that.valueX, that.valueY], tooltip_position: "bottom" });
            that.slider.on("slideStop", function (ev) {
                that.valueX = ev.value[0];
                that.valueY = ev.value[1];
                that.update();
            });
        };
        Home.prototype.attached = function () {
            this.setupSlider(this, 4);
            this.loaded_graph = null;
            var canvas = d3.select("#chart").append("svg").attr("width", this.width).attr("height", this.height)
                .append("g")
                .call(d3.behavior.zoom().scaleExtent([0.5, 8]).scale(0.5).on("zoom", zoom))
                .append("g");
            function zoom() {
                var ev = d3.event;
                canvas.attr("transform", "translate(" + ev.translate + ")scale(" + ev.scale + ")");
            }
            this.diagramGroup = canvas.attr("transform", "translate(" + 1.5 * this.margin.left + "," + this.margin.top + ")");
            var loaded_data = JSON.parse(localStorage.getItem("loaded_data"));
            var data = { flows: JSON.parse(localStorage.getItem("flows")) };
            var graph = { nodes: [], links: [] };
            var maxVal = 1000000;
            var nodes = [];
            var edges = [];
            for (var i = 0; i < data.flows.length; i++) {
                var flow = data.flows[i];
                flow.cont.forEach(function (x) {
                    var sourceId = x.prev + i * maxVal;
                    var destId = x.next + (i + 1) * maxVal;
                    nodes.push(sourceId);
                    nodes.push(destId);
                    if (edges.filter(function (x) { return (x.source == sourceId) && (x.target == destId) && (x.connection_type == "cont"); }).length == 0) {
                        edges.push({ "source": sourceId, "target": destId, "value": 2, connection_type: "cont" });
                    }
                });
                flow.merge.forEach(function (x) {
                    var destId = x.next + (i + 1) * maxVal;
                    x.prev.forEach(function (y) {
                        y.forEach(function (z) {
                            var sourceId = z + i * maxVal;
                            nodes.push(sourceId);
                            if (edges.filter(function (x) { return (x.source == sourceId) && (x.target == destId) && (x.connection_type == "merge"); }).length == 0) {
                                edges.push({ "source": sourceId, "target": destId, "value": 2, connection_type: "merge" });
                            }
                        });
                    });
                    nodes.push(destId);
                });
                flow.split.forEach(function (x) {
                    var sourceId = x.prev + i * maxVal;
                    x.next.forEach(function (y) {
                        y.forEach(function (z) {
                            var destId = z + (i + 1) * maxVal;
                            nodes.push(destId);
                            if (edges.filter(function (x) { return (x.source == sourceId) && (x.target == destId) && (x.connection_type == "split"); }).length == 0) {
                                edges.push({ "source": sourceId, "target": destId, "value": 2, connection_type: "split" });
                            }
                        });
                    });
                    nodes.push(sourceId);
                });
            }
            var arrayUnique = function (a) {
                return a.reduce(function (p, c) {
                    if (p.indexOf(c) < 0)
                        p.push(c);
                    return p;
                }, []);
            };
            graph.nodes = arrayUnique(nodes).map(function (x) {
                var node = { "node": x, "name": "node" + x, t: Math.floor(x / maxVal) };
                var community_id = parseInt(x) % maxVal;
                if (!loaded_data[node.t].communities[community_id]) {
                    console.log("S");
                }
                else {
                    node["size"] = loaded_data[node.t].communities[community_id].length;
                }
                return node;
            });
            graph.links = edges;
            this.loaded_graph = graph;
            this.update();
            this.setupSlider(this, data.flows.length);
        };
        Home.prototype.extractSmallGraph = function (graph) {
            var x_begin = this.valueX, x_end = this.valueY;
            var filtered_nodes = graph.nodes.filter(function (x) { return (x.t >= x_begin) && (x.t <= x_end); });
            var filtered_ids = filtered_nodes.map(function (x) { return x.node; });
            var filtered_links = graph.links.filter(function (x) {
                return (filtered_ids.indexOf(x.target) > -1) && (filtered_ids.indexOf(x.source) > -1);
            });
            var times = filtered_nodes.map(function (x) { return parseInt(x.t.toString()); });
            times.sort();
            var minT = this.valueX;
            filtered_nodes.forEach(function (x) { x.t = x.t - minT; });
            return { nodes: filtered_nodes, links: filtered_links };
        };
        Home.prototype.createNewDiagram = function (graph) {
            var D3 = d3;
            var sankey = D3.sankey().nodeWidth(36).nodePadding(2)
                .size([1600, 1600]);
            var formatNumber = d3.format(",.0f"), format = function (d) { return formatNumber(d) + " "; }, color = d3.scale.category20();
            sankey.nodes(graph.nodes).links(graph.links).layout(32, this.width);
            var path = sankey.link();
            var linkWidth = graph.nodes.length > 50 ? 1 : 3;
            var link = this.diagramGroup.append("g").selectAll(".link").data(graph.links)
                .enter().append("path").attr("class", "link").attr("d", path)
                .style("stroke-width", function (d) { return linkWidth; })
                .style("stroke", function (d) {
                switch (d["connection_type"]) {
                    case "cont":
                        return "#1f77b4";
                        break;
                    case "split":
                        return "#ff7f0e";
                        break;
                    case "merge":
                        return "#2ca02c";
                        break;
                    default:
                        return "black";
                }
            })
                .sort(function (a, b) { return b["dy"] - a["dy"]; });
            link.append("title").text(function (d) {
                var src = parseInt(d["source"].node);
                var src_t = Math.round(src / 1000000);
                var src_id = src % 1000000;
                var dst = parseInt(d["target"].node);
                var dst_t = Math.round(dst / 1000000);
                var dst_id = dst % 1000000;
                return src_id + " -> " + d["connection_type"] + " -> " + dst_id;
            });
            var node = this.diagramGroup.append("g").selectAll(".node").data(graph.nodes)
                .enter().append("g").attr("class", "node")
                .attr("transform", function (d) { return "translate(" + d["x"] + "," + d["y"] + ")"; });
            node.append("rect").attr("height", function (d) { return d["dy"]; })
                .attr("width", sankey.nodeWidth())
                .style("fill", function (d) { return d["color"] = color(d["node"]); })
                .append("title").text(function (d) {
                var id = parseInt(d["name"].replace("node", ""));
                var t = Math.round(id / 1000000);
                id = id % 1000000;
                return "t: " + t + "\nid:" + id + "\nsize:" + d["size"];
            });
            return [node, link];
        };
        Home.prototype.deleteOldDiagram = function () {
            this.diagram.forEach(function (x) { x.remove(); });
        };
        Home.prototype.update = function () {
            if (this.loaded_graph == null) {
                return;
            }
            this.deleteOldDiagram();
            var deepCopy = JSON.parse(JSON.stringify(this.loaded_graph));
            var smallGraph = this.extractSmallGraph(deepCopy);
            if (smallGraph.links.length == 0) {
                console.log("no links");
                return;
            }
            this.diagram = this.createNewDiagram(smallGraph);
        };
        Home.prototype.left = function () {
            this.valueX--;
            this.update();
        };
        Home.prototype.right = function () {
            this.valueX++;
            this.update();
        };
        return Home;
    })();
    exports.Home = Home;
});
//# sourceMappingURL=visualisation.js.map