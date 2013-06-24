var base = (function() {

    return {
        summary: function(obj) {
            var result = 0;

            Object.keys(obj).forEach(function(key) {
                result += obj[ key ];
            });

            return result;
        },
        findTotal: function(obj) {
            var result = 0;
            Object.keys(obj).forEach(function(key) {
                result += base.summary(obj[ key ]);
            });

            return result;
        },
        findPercentage: function(total, part) {
            return +((part * 100)/total).toFixed(2);
        },
        fillArray: function(obj, sum) {
            var arr = [];

            Object.keys(obj).forEach(function(element){
                var persentage = base.findPercentage(sum, obj[element]);

                arr.push({"named": element, "value": obj[element], "percent": persentage});
            });

            return arr;
        },
        showNormalName: function(element){
            return element.charAt(0).toUpperCase() + element.replace(/_/, ' ').slice(1);
        }
    };

})();
