/**
 * goods-store module.
 * @module goods-store
 */
define("goods-store", ["jquery", "purcashing-result", "knockoutjs"], function ($, purcashingResult, ko) {
    'use strict';
    

    /**     
     *  Initializes new instance of goods storage.               
     *  @memberof module:goods-store     
     *  @constructs GoodsStore          
     *  @classdesc Represents a storage of goods, keeping items count and price for each item.          
     *  @param {GoodItem[]} goodItems The items in store, which are available for selling.
     *  @param {module:wallet.Wallet} wallet Wallet for recieving money and giving change.
     */
    var thisClass = function(goodItems, wallet) {

        var items = goodItems || [];

        /**
         * Products array with observable countInPieces.
         * @type {GoodItem[]}
         */
        this.items = ko.utils.arrayMap(items, function(it) {
            var res = $.extend({}, it); //cloning
            res.countInPieces = ko.observable(res.countInPieces);
            return res;
        });

        /**
         * Machine wallet.
         * @type {module:wallet.Wallet}
         */
        this.wallet = wallet;
    };
        
    thisClass.prototype = /** @lends GoodsStore.prototype */ {

        /**         
         * Sells a goods item by name accepting an array of money units. If money amount is enough, diminishes goods item count and returns change. 
         * If the money amount is exact, then the change is undefined.        
         * @param {string} name The name of goods.
         * @param {MoneyItem[]} moneyItems An array of money items.
         * @returns {module:purcashing-result.PurcashingResult} operation status and change, if any. Change is undefined when the summ of moneyItems is exact or in case of an error.                  
         * @throws {Error} When the good item hasn't found by name 
         */
        purchase: function(name, moneyItems) {
            var item;
            for (var i = 0; i < this.items.length; ++i)
                if (this.items[i].name === name) {
                    item = this.items[i];
                    break;
                }

            if (!item)
                throw new Error('Goods item "' + name + '" is not found');

            if (item.countInPieces() < 1) //run out of items
                return new purcashingResult(purcashingResult.prototype.RUN_OUT);

            var cashSumm = this.wallet.getBalance(moneyItems);
            if (cashSumm < item.price) //not enough money
                return new purcashingResult(purcashingResult.prototype.NOT_ENOUGHT_MONEY); 

            this.wallet.deposit(moneyItems);

            var change;
            if (cashSumm !== item.price) {

                change = this.wallet.adjustedWithdraw(cashSumm - item.price);
                if ($.isNumeric(change)) {
                    this.wallet.withdraw(moneyItems); //cancelling depositing
                    return new purcashingResult(purcashingResult.prototype.NO_CHANGE, change); //can't return change due to a lack of apropriate coins
                }
            }

            item.countInPieces(item.countInPieces() - 1);

            return new purcashingResult(purcashingResult.prototype.SOLD_OK, change); //sold
        }

    }; //End prototype
   
    return thisClass;
});