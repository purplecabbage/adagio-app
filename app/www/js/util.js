
// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
if (!Function.prototype.debounce) {
    console.log("adding debounce");
    Function.prototype.debounce = function (threshold, execAsap) {

        var func = this, timeout;

        return function debounced() {
            var obj = this, args = arguments;
            function delayed() {
                if (!execAsap) {
                    func.apply(obj, args);
                }
                timeout = null;
            };

            if (timeout) {
                clearTimeout(timeout);
            }
            else if (execAsap) {
                func.apply(obj, args);
            }

            timeout = setTimeout(delayed, threshold || 100);
        };

    };
}

if (!Function.prototype.bind) {
    Function.prototype.bind = function(sub) {
        var me = this;
        return function() {
            return me.apply(sub, arguments);
        };
    };
}

function $(query) {
    return document.querySelector(query);
}