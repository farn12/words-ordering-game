function Xhr() {
    function serializeObject(obj) {
        var str = [];
        for (var p in obj)
            if (obj.hasOwnProperty(p)) {
                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
            }
        return str.join("&");
    }

    return {
        get: function(url, callback) {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', encodeURI(url));
            xhr.onload = function () {
                if (xhr.status === 200) {
                    callback(xhr);
                }
                else {
                    alert('Request failed.  Returned status of ' + xhr.status);
                }
            };
            xhr.send();
        },
        post: function(url, data, callback) {
            var newName = 'John Smith',
            xhr = new XMLHttpRequest();

            xhr.open('POST', encodeURI(url));
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            xhr.onload = function () {
                if (xhr.status === 200) {
                    callback(xhr);
                }
                else {
                    alert('Request failed.  Returned status of ' + xhr.status);
                }
            };
            xhr.send(serializeObject(data));
        }
    }
};



