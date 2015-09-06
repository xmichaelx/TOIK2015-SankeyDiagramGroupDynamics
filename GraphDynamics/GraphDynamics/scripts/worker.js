onmessage = function (e) {
    console.log('Message received from main script');
    var i = e.data.i;
    var current = {};
    current["cont"] = cont(e.data.loadedData, 0,  1);
    current["merge"] = merge(e.data.loadedData, 0,  1, 0.5);
    current["split"] = split(e.data.loadedData, 0,  1, 0.5);
    current["start"] = i
    current["end"] = i + 1;

    console.log('Posting message back to main script');
    postMessage(current);
}

function AND(x, y) {
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
}

function OR(x, y) {
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
}

function at_least_one_common(x, y) {
    for (var i = 0; i < x.length; i++) {
        for (var z = 0; z < y.length; z++) {
            if (x[i] == y[z]) {
                return true;
            }
        }
    }

    return false;
}

function pairwise(list) {
    var pairs = [];
    list
        .slice(0, list.length - 1)
        .forEach(function (first, n) {
            var tail = list.slice(n + 1, list.length);
            tail.forEach(function (item) {
                pairs.push([first, item])
            });
        })
    return pairs;
}


function cont(data, first, second) {

    var a = data[first].communities;
    var b = data[second].communities;

    var out = b.map(function (x, j)  {
        var candidates = a.map(function (y, i) {
            if ((x.length == y.length) && at_least_one_common(x, y) && (AND(x, y).length == y.length)) {
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
}

function merge(data, first, second, percent) {
    var a = data[first].communities;
    var b = data[second].communities;

    var out = b.map(function (x, j)  {
        var candidates = a.map(function (y, i){
            if (at_least_one_common(x, y)) {
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
            pairwise(candidates).forEach(function (pair)  {
                var pair1 = pair[0][1];
                var pair2 = pair[1][1];
                var sum = OR(pair1, pair2);
                var shared = AND(sum, x).length / (x.length > sum.length ? x.length : sum.length);
                if ((shared > percent) && (AND(pair1, x).length > pair1.length / 2) && (AND(pair2, x).length > pair2.length / 2)) {
                    if ((pair1.length == x.length) && (AND(pair1, x).length == x.length)) {

                    } else if ((pair2.length == x.length) && (AND(pair2, x).length == x.length)) {

                    } else {
                        merge_list.push([pair[0][0], pair[1][0]])
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
}

function split(data, second, first, percent) {
    var a = data[first].communities;
    var b = data[second].communities;

    var out = b.map(function (x, j) {
        var candidates = a.map( function (y, i)  {
            if (at_least_one_common(x, y)) {
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
            pairwise(candidates).forEach( function (pair) {
                var pair1 = pair[0][1];
                var pair2 = pair[1][1];
                var sum = OR(pair1, pair2);
                var shared = AND(sum, x).length / (x.length > sum.length ? x.length : sum.length);
                if ((shared > percent) && (AND(pair1, x).length > pair1.length / 2) && (AND(pair2, x).length > pair2.length / 2)) {
                    if ((pair1.length == x.length) && (AND(pair1, x).length == x.length)) {

                    } else if ((pair2.length == x.length) && (AND(pair2, x).length == x.length)) {

                    } else {
                        merge_list.push([pair[0][0], pair[1][0]])
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
}