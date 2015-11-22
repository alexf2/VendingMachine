define("purcashing-result", [], function () {
    'use strict';
    
    var thisClass = function (status, change) {
        this.status = status;
        this.change = change;
    }

    thisClass.prototype = {
        RUN_OUT: 0,
        NOT_ENOUGHT_MONEY: -1,
        NO_CHANGE: -2,
        SOLD_OK: 1
    };        

    return thisClass;
});