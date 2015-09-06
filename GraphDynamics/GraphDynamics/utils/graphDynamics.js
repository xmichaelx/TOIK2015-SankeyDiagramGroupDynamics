define(["require", "exports"], function (require, exports) {
    var GraphDynamics = (function () {
        function GraphDynamics() {
        }
        GraphDynamics.prototype.setInput = function (input) {
            this.input = input;
        };
        GraphDynamics.prototype.computeFlows = function (converted, maxT) {
            var flows = [];
            for (var i = 0; i < maxT; i++) {
                var current = {};
                current["cont"] = this.cont(converted, i, i + 1);
                current["merge"] = this.merge(converted, i, i + 1, 0.5);
                current["split"] = this.split(converted, i, i + 1, 0.5);
                flows.push(current);
            }
            return { flows: flows, data: converted };
        };
        GraphDynamics.prototype.AND = function (x, y) {
            var ret = [];
            for (var i = 0; i < x.length; i++) {
                for (var z = 0; z < y.length; z++) {
                    if (x[i] == y[z]) {
                        ret.push(i);
                        break;
                    }
                }
            }
            return ret;
        };
        GraphDynamics.prototype.OR = function (x, y) {
            function arrayUnique(array) {
                var a = array.concat();
                for (var i = 0; i < a.length; ++i) {
                    for (var j = i + 1; j < a.length; ++j) {
                        if (a[i] === a[j])
                            a.splice(j--, 1);
                    }
                }
                return a;
            }
            return arrayUnique(x.concat(y));
        };
        GraphDynamics.prototype.at_least_one_common = function (x, y) {
            for (var i = 0; i < x.length; i++) {
                for (var z = 0; z < y.length; z++) {
                    if (x[i] == y[z]) {
                        return true;
                    }
                }
            }
            return false;
        };
        GraphDynamics.prototype.pairwise = function (list) {
            var pairs = [];
            list
                .slice(0, list.length - 1)
                .forEach(function (first, n) {
                var tail = list.slice(n + 1, list.length);
                tail.forEach(function (item) {
                    pairs.push([first, item]);
                });
            });
            return pairs;
        };
        GraphDynamics.prototype.cont = function (data, first, second) {
            var _this = this;
            var a = data[first].communities;
            var b = data[second].communities;
            var out = b.map(function (x, j) {
                var candidates = a.map(function (y, i) {
                    if ((x.length == y.length) && _this.at_least_one_common(x, y) && (_this.AND(x, y).length == y.length)) {
                        return i;
                    }
                    else {
                        return null;
                    }
                }).filter(function (x) { return x != null; });
                if (candidates.length > 0) {
                    var obj = {};
                    obj["prev"] = candidates[0];
                    obj["next"] = j;
                    return obj;
                }
                else {
                    return null;
                }
            });
            return out.filter(function (x) { return x != null; });
        };
        GraphDynamics.prototype.merge = function (data, first, second, percent) {
            var _this = this;
            var a = data[first].communities;
            var b = data[second].communities;
            var out = b.map(function (x, j) {
                var candidates = a.map(function (y, i) {
                    if (_this.at_least_one_common(x, y)) {
                        return [i, y];
                    }
                    else {
                        return null;
                    }
                }).filter(function (x) {
                    return x != null;
                });
                var merge_list = [];
                if (candidates.length > 1) {
                    _this.pairwise(candidates).forEach(function (pair) {
                        var pair1 = pair[0][1];
                        var pair2 = pair[1][1];
                        var sum = _this.OR(pair1, pair2);
                        var shared = _this.AND(sum, x).length / (x.length > sum.length ? x.length : sum.length);
                        if ((shared > percent) && (_this.AND(pair1, x).length > pair1.length / 2) && (_this.AND(pair2, x).length > pair2.length / 2)) {
                            if ((pair1.length == x.length) && (_this.AND(pair1, x).length == x.length)) {
                            }
                            else if ((pair2.length == x.length) && (_this.AND(pair2, x).length == x.length)) {
                            }
                            else {
                                merge_list.push([pair[0][0], pair[1][0]]);
                            }
                        }
                    });
                }
                var obj = {};
                obj["next"] = j;
                obj["prev"] = merge_list;
                return obj;
            });
            return out.filter(function (x) {
                return x["prev"].length > 0;
            });
        };
        GraphDynamics.prototype.split = function (data, second, first, percent) {
            var _this = this;
            var a = data[first].communities;
            var b = data[second].communities;
            var out = b.map(function (x, j) {
                var candidates = a.map(function (y, i) {
                    if (_this.at_least_one_common(x, y)) {
                        return [i, y];
                    }
                    else {
                        return null;
                    }
                }).filter(function (x) {
                    return x != null;
                });
                var merge_list = [];
                if (candidates.length > 1) {
                    _this.pairwise(candidates).forEach(function (pair) {
                        var pair1 = pair[0][1];
                        var pair2 = pair[1][1];
                        var sum = _this.OR(pair1, pair2);
                        var shared = _this.AND(sum, x).length / (x.length > sum.length ? x.length : sum.length);
                        if ((shared > percent) && (_this.AND(pair1, x).length > pair1.length / 2) && (_this.AND(pair2, x).length > pair2.length / 2)) {
                            if ((pair1.length == x.length) && (_this.AND(pair1, x).length == x.length)) {
                            }
                            else if ((pair2.length == x.length) && (_this.AND(pair2, x).length == x.length)) {
                            }
                            else {
                                merge_list.push([pair[0][0], pair[1][0]]);
                            }
                        }
                    });
                }
                var obj = {};
                obj["prev"] = j;
                obj["next"] = merge_list;
                return obj;
            });
            return out.filter(function (x) {
                return x["next"].length > 0;
            });
        };
        GraphDynamics.prototype.form = function (data, first, second) {
            var a = data[first].communities;
            var b = data[second].communities;
            var out = b.map(function (x, j) {
                var candidates = a.filter(function (y) {
                    return this.at_least_one_common(x, y);
                });
                if (candidates.length > 0) {
                    return null;
                }
                else {
                    return j;
                }
            }).filter(function (x) { return x != null; });
            return out;
        };
        GraphDynamics.prototype.dissolve = function (data, first, second) {
            return this.form(data, second, first);
        };
        return GraphDynamics;
    })();
    exports.GraphDynamics = GraphDynamics;
});
//# sourceMappingURL=graphDynamics.js.map