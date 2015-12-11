/**
 * purcashing-result module.
 * @module purcashing-result
 */
define("purcashing-result", [], function () {
    'use strict';
    
    /**     
    *  Initializes new instance of purcashing result.               
    *  @memberof module:purcashing-result
    *  @constructs PurcashingResult
    *  @classdesc Represents a result of a purchase.          
    *  @param {number} status Indicates the purchase result, whether it is sucsesfull or not.
    *  @param {moneyItem[]} change When the purchase is secsesfull, returns change. If change is not needed, then undefined.
    */
    var thisClass = function (status, change) {
        this.status = status;
        this.change = change;
    }

    /**
     * @enum {number}
     * @constant     
     */
    thisClass.prototype = {
        /**
         * Run out of items.         
         */
        RUN_OUT: 0,
        /**
         * The deposit is not enough to buy the goods item.         
         */
        NOT_ENOUGHT_MONEY: -1,
        /**
         * There is a lack of apropriate coins for change.         
         */
        NO_CHANGE: -2,
        /**
         * The purchase is sucsesfully completed.         
         */
        SOLD_OK: 1
    };        

    return thisClass;
});