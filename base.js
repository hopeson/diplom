function summary(obj) {
    var result = 0;

    Object.keys(obj).forEach(function(key) {
        result += obj[ key ];
    });

    return result;
}

function findTotal(obj) {
    var result = 0;
    Object.keys(obj).forEach(function(key) {
        result += summary(obj[ key ]);
    });

    return result;
}

function findPercentage(total, part) {
    return +((part * 100)/total).toFixed(2);
}

function fillArray(obj, sum) {
    var arr = [];

    Object.keys(obj).forEach(function(element){
        var persentage = findPercentage(sum, obj[element]);

        arr.push({"named": element, "value": obj[element], "percent": persentage});
    });

    return arr;
}

function showNormalName(element){
    return element.charAt(0).toUpperCase() + element.replace(/_/, ' ').slice(1);
}
