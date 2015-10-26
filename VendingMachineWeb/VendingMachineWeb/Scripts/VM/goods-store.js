!(function ($) {
    'use strict';

    var NameSpace = 'VmSimulator',
        NS = $[NameSpace] || ($[NameSpace] = {});

    /**
     *  Initializes new instance of GoodsStorage.
     *  @param {goodItem} goodItems The items in store, which are available for selling.
     *  @wallet {Wallet} wallet Wallet for recieving money and giving change.
     */
    var thisClass = NS.GoodsStore = function (goodItems, wallet) {

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
        purchase: function (name, moneyItems) {            
            var item;
            for (var i = 0; i < this.items.length; ++i)
                if (this.items[i].name === name) {
                    item = this.items[i];
                    break;
                }

            if (!item)
                throw new Error('Goods ' + name + ' is not found');

            if (item.countInPieces() < 1)
                return new PurcashingResult(PurcashingResult.prototype.RUN_OUT); //run out

            var cashSumm = this.wallet.getBalance(moneyItems);
            if (cashSumm < item.price)
                return new PurcashingResult(PurcashingResult.prototype.NOT_ENOUGHT_MONEY); //not enough money
            
            this.wallet.deposit(moneyItems);

            var change;
            if (cashSumm !== item.price) {
                
                change = this.wallet.adjustedWithdraw(cashSumm - item.price);
                if ($.isNumeric(change)) {
                    if (this.wallet.withdraw(moneyItems) !== true) //cancelling depositing
                        throw new Error('Inconsistent wallet ' + this.name);
                    return new PurcashingResult(PurcashingResult.prototype.NO_CHANGE, change); //can't change
                }
            }
                        
            item.countInPieces( item.countInPieces() - 1 );

            return new PurcashingResult(PurcashingResult.prototype.SOLD_OK, change); //sold
        }

    }; //End prototype

    /* --- Privates --- */
    function PurcashingResult(status, change) {
        this.status = status;
        this.change = change;
    }

    PurcashingResult.prototype = {
        RUN_OUT: 0,
        NOT_ENOUGHT_MONEY: -1,
        NO_CHANGE: -2,
        SOLD_OK: 1
    };

    NS.PurcashingResult = PurcashingResult;
    /* --- End Privates --- */
})(window.jQuery);
