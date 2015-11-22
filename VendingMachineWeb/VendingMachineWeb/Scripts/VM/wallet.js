define("wallet", ["jquery", "knockoutjs"], function ($, ko) {
    "use strict";    

    /**
     * Creates a wallet instance.
     * @constructor
     * @param {string | number} id Wallet unique id.
     * @param {string} name Wallet descriptive name.
     * @param {moneyItem[]} moneyItems An array of {nominal, amount}.
    */
    var thisClass = function(id, name, moneyItems, readonly) {
        this.id = id;
        this.name = name;
        this.readonly = readonly || false;

        var items = moneyItems || [];

        this.items = ko.utils.arrayMap(items, function(it) {
            if (it.nominal !== it.nominal >> 0)
                throw new Error('Wallet does not support fractional money units');

            var res = $.extend({}, it);
            res.amount = ko.observable(res.amount);
            return res;
        });

        //sorting desc
        this.items.sort(function(a, b) {
            return b.nominal - a.nominal;
        });

        this.items = ko.observableArray(this.items);
    };

    thisClass.prototype = {

        /**
         * Adds money, listed in pairs {nominal, amount}.
         * @param {moneyItem[] | moneyItem} moneyItems Money to add to the wallet.
         * @returns {number} added total amount.
        */
        deposit: function(moneyItem) {
            if (!moneyItem)
                throw new Error('Money to deposit are not specified');

            var that = this;

            if ($.isArray(moneyItem))
                $.each(moneyItem, function(idx, val) {
                    depositOne.call(that, val);
                });
            else
                depositOne.call(this, moneyItem);
        },

        /**
         * Withdraws money, listed in pairs {nominal, amount}.
         * @param {moneyItem[] | moneyItem} moneyItems Money to withdraw off the wallet.
         * @returns {number | UnderflowInfo} withdrawn total amount or UnderflowInfo , if current balance is not enough or availbale units do not allow to gather requested amount.
        */
        withdraw: function(moneyItem) {
            if (!moneyItem)
                throw new Error('Money to withdraw are not specified');

            var vres = validateWithdrawl.call(this, moneyItem);
            if (vres !== true)
                return vres;

            withdrawInternal.call(this, moneyItem);

            return true;
        },

        /**
         * Withdraws a specified amount of money if current balance is enough and money units allow to gather required amount.
         * @param {number} amount The number to withdraw. The number should be integer: fractions are not supported.
         * @returns {moneyItem[] | number} withdrawn money array or a negative number, representing underflow.
         */
        adjustedWithdraw: function(amount) {
            if (!amount)
                throw new Error('Amount to withdraw is not specified');

            var requested = amount, resultItems = [];

            for (var i = 0; i < this.items().length; ++i) {
                var item = this.items()[i];
                if (item.nominal <= amount) {
                    var subCount = amount / item.nominal >> 0; //getting whole part
                    subCount = Math.min(subCount, item.amount());
                    if (subCount > 0) {
                        resultItems.push({ nominal: item.nominal, amount: subCount });
                        amount -= item.nominal * subCount;
                    }
                }
            }

            if (amount === 0) { //the requst can be satisfied: execute actual withdrawl
                withdrawInternal.call(this, resultItems);
                return resultItems;
            }

            //not enough money
            return this.getBalance() - requested;
        },

        /**
         * Withdraws all the money.
         * @returns {moneyItem[]} withdrawn money array.
         */
        withdrawAll: function() {
            var tmp = this.items();
            this.items([]);
            return tmp;
        },

        /**
         * Calculates summ of products {nominal, amount}.
         * @param {moneyItem[] | moneyItem} items Money to summarize.
         * @returns {number} summ of products unit * amount.
        */
        getBalance: function(items) {

            var totalAmount = 0;
            var moneyItem = items || this.items();

            if ($.isArray(moneyItem))
                $.each(moneyItem, function(idx, val) {
                    totalAmount += val.nominal * ko.utils.unwrapObservable(val.amount);
                });
            else
                totalAmount += moneyItem.nominal * ko.utils.unwrapObservable(moneyItem.amount);

            return totalAmount;
        },

        /**
         * Returns wallet content.
         * @returns {moneyItem[]}.
         */
        getDetails: function() {
            return this.items();
        },

        /**
         * Returns true if the wallet is empty.
         * @returns {bool}.
         */
        isEmpty: function() {
            return this.items().length === 0 || this.getBalance() === 0;
        },

        getMoneyItem: function(nominal) {
            var idx = binarySearchMoneyItem(this.items(), nominal);
            return idx >= 0 ? this.items()[idx] : null;
        }

    }; //End prototype

    /* --- Privates --- */
    function depositOne(moneyItem) {

        var idx = binarySearchMoneyItem(this.items(), moneyItem.nominal);
        if (idx < 0) {
            idx = ~idx;
            this.items.splice(idx, 0, { nominal: moneyItem.nominal, amount: ko.observable(moneyItem.amount) });
        } else
            this.items()[idx].amount(this.items()[idx].amount() + ko.utils.unwrapObservable(moneyItem.amount));
    }

    function validateWithdrawl(moneyItem) {
        if (!$.isArray(moneyItem))
            moneyItem = [moneyItem];

        for (var i = 0; i < moneyItem.length; ++i) {
            var item = moneyItem[i];
            var idx = binarySearchMoneyItem(this.items(), item.nominal);

            if (idx < 0)
                return new UnderflowInfo(item.nominal);

            if (this.items()[idx].amount() < ko.utils.unwrapObservable(item.amount))
                return new UnderflowInfo(item.nominal, this.items()[idx].amount() - ko.utils.unwrapObservable(item.amount));
        }

        return true;
    }

    function withdrawOne(moneyItem) {
        var idx = binarySearchMoneyItem(this.items(), moneyItem.nominal);
        if (idx < 0)
            throw new Error('Nominal ' + moneyItem.nominal + ' is not found');

        if (this.items()[idx].amount() < ko.utils.unwrapObservable(moneyItem.amount))
            throw new Error('Cant withdrow ' + ko.utils.unwrapObservable(moneyItem.amount) + ' of ' + moneyItem.nominal);

        this.items()[idx].amount(this.items()[idx].amount() - ko.utils.unwrapObservable(moneyItem.amount));
    }

    function withdrawInternal(moneyItem) {
        var that = this;

        if ($.isArray(moneyItem))
            $.each(moneyItem, function(idx, val) {
                withdrawOne.call(that, val);
            });
        else
            withdrawOne.call(this, moneyItem);
    }

    function binarySearchMoneyItem(array, value) {
        var low = 0,
            high = array.length - 1;

        while (low <= high) {
            var mid = (low + high) >>> 1;

            var cmp = value - array[mid].nominal; //ordering desc

            if (cmp === 0)
                return mid;
            if (cmp < 0)
                low = mid + 1;
            else
                high = mid - 1;
        }

        return ~low;
    }

    function UnderflowInfo(nominal, diff) {
        this.nominal = nominal;
        this.amountDiff = diff;
    }
    /* --- End Privates --- */

    return thisClass;
});