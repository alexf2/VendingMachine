define("goods-store", ["jquery", "purcashing-result", "knockoutjs"], function ($, purcashingResult, ko) {
    'use strict';
    

    /**
     *  Initializes new instance of GoodsStorage.
     *  @constructor
     *  @param {goodItem} goodItems The items in store, which are available for selling.
     *  @wallet {Wallet} wallet Wallet for recieving money and giving change.
     */
    var thisClass = function(goodItems, wallet) {

        var items = goodItems || [];

        this.items = ko.utils.arrayMap(items, function(it) {
            var res = $.extend({}, it);
            res.countInPieces = ko.observable(res.countInPieces);
            return res;
        });

        this.wallet = wallet;
    };

    thisClass.prototype = {

        /**
         * Sells goods by name accepting an array of money units.
         * @param {string} name The name of goods.
         * @param {moneyItem[]} moneyItems An array of money items.
         * @returns {PurcashingResult} operation status and change, if any. When the summ of moneyItems is exact or in case of an error, change is undefined.
         */
        purchase: function(name, moneyItems) {
            var item;
            for (var i = 0; i < this.items.length; ++i)
                if (this.items[i].name === name) {
                    item = this.items[i];
                    break;
                }

            if (!item)
                throw new Error('Goods ' + name + ' is not found');

            if (item.countInPieces() < 1)
                return new purcashingResult(purcashingResult.prototype.RUN_OUT); //run out

            var cashSumm = this.wallet.getBalance(moneyItems);
            if (cashSumm < item.price)
                return new purcashingResult(purcashingResult.prototype.NOT_ENOUGHT_MONEY); //not enough money

            this.wallet.deposit(moneyItems);

            var change;
            if (cashSumm !== item.price) {

                change = this.wallet.adjustedWithdraw(cashSumm - item.price);
                if ($.isNumeric(change)) {
                    if (this.wallet.withdraw(moneyItems) !== true) //cancelling depositing
                        throw new Error('Inconsistent wallet ' + this.name);
                    return new purcashingResult(purcashingResult.prototype.NO_CHANGE, change); //can't change
                }
            }

            item.countInPieces(item.countInPieces() - 1);

            return new purcashingResult(purcashingResult.prototype.SOLD_OK, change); //sold
        }

    }; //End prototype
   
    return thisClass;
});