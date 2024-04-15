function updateUrl(url, param) {
    var param_keys = Object.keys(param);
    if (param_keys.length != 0) {
        param_keys.forEach(function (e, i) {
            if (i == 0) { url = url + "?" + e } else { url = url + "&" + e }
            if (param[e] != "") { url = url + "=" + param[e] }
        });
    }
    return encodeURI(url);
}

function getAllUrlParams(url) {
    var queryString = url ? url.split("?")[1] : window.location.search.slice(1);
    var obj = {};
    if (queryString) {
        queryString = queryString.split("#")[0];
        var arr = queryString.split("&");
        for (var i = 0; i < arr.length; i++) {
            var a = arr[i].split("=");
            var paramName = a[0];
            var paramValue = typeof a[1] === "undefined" ? "" : a[1];
            if (paramName.match(/\[(\d+)?\]$/)) {
                var key = paramName.replace(/\[(\d+)?\]/, "");
                if (!obj[key]) obj[key] = [];
                if (paramName.match(/\[\d+\]$/)) {
                    var index = /\[(\d+)\]/.exec(paramName)[1];
                    obj[key][index] = decodeURIComponent(paramValue);
                } else {
                    obj[key].push(decodeURIComponent(paramValue));
                }
            } else {
                if (!obj[paramName]) {
                    obj[paramName] = decodeURIComponent(paramValue);
                } else if (obj[paramName] && typeof obj[paramName] === "string") {
                    obj[paramName] = [obj[paramName]];
                    obj[paramName].push(decodeURIComponent(paramValue));
                } else {
                    obj[paramName].push(decodeURIComponent(paramValue));
                }
            }
        }
    }
    return obj;
}