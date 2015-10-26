!(function ($) {
    'use strict';

    var JS_PLUGIN_NAME = 'SimulatorApp';
    var PLUGIN_NAME = 'simulator_app';

    var NameSpace = 'VmSimulator',
        NS = $[NameSpace] || ($[NameSpace] = {});

    function myScope() {
        return '.' + JS_PLUGIN_NAME;
    }
    function scopedName(name) {
        return name + myScope();
    }

    /**
     * Creates a Vending Machine simulation application.
     * @param {string} modelUrl Rest service URL to request the simulator model as JSON.
     * @param {string} templatesBaseUrl Base URL for HTML templates, used in the model.
    */
    var thisClass = NS.SimulatorApp = function (modelUrl, templatesBaseUrl) {
        this.modelUrl = modelUrl;
        this.templatesBaseUrl = templatesBaseUrl;
        this.logMessages = ko.observableArray();
    };

    thisClass.prototype = {
        run: function() {
            init.call(this);
            bindEvents.call(this);
        },

        clearLog: function () { this.logMessages([]); }
    }; //End prototype

    /* --- Privates --- */
    function init() {
        var that = this;

        ko.applyBindings(this, getLog$.call(this).get(0));

        function start(xhr) { showLoader.call(that, true); }

        function complete(dataXHR, textStatus, jqXHR) { showLoader.call(that, false); }

        function success(result, textStatus, jqXHR) {

            try {
                that.customerWallet = new NS.Wallet("uw", "User's wallet", result.customerWallet);
                //creating user's wallet
                getUserWallet$.call(that).walletp({
                    template: that.templatesBaseUrl + 'wallet-template.html',
                    wallet: that.customerWallet
                });

                var vmWallet = new NS.Wallet("mw", "VM's wallet", result.vendingMachine.wallet, true);

                //creating machine wallet
                getVmWallet$.call(that).walletp({
                    readonly: true,
                    template: that.templatesBaseUrl + 'wallet-template.html',
                    wallet: vmWallet
                });

                //creating vending machine
                getVM$.call(that).vending_machine({
                    goodsTemplate: that.templatesBaseUrl + 'goods-template.html',
                    wallet: vmWallet,
                    goods: new NS.GoodsStore(result.vendingMachine.goods, vmWallet),
                    id: 'vm1'
                });
            } catch (ex) {                
                $('<div class="err-msg"></div>').prependTo(document.body).text('Simulator initialization error: ' + ex.message);
            }
        }

        function failure(jqXHR, textStatus, errorThrown) {
            $('<div class="err-msg"></div>').prependTo(document.body).text('Can not load template - ' + textStatus + ': \'' + errorThrown + "'");
        }

        var xhrRequest = {
            url: this.modelUrl,
            dataType: "json",
            beforeSend: start,
            type: 'GET'
        };

        //requesting the model
        $.ajax(xhrRequest).
            always(complete).
            done(success).
            fail(failure);        
    }

    function bindEvents() {
        getUserWallet$.call(this).on(scopedName('money-item-clicked'), $.proxy(userWalletClicked, this));
        getVM$.call(this).
            on(scopedName('purchase-result'), $.proxy(purchaseTried, this)).
            on(scopedName('money-refund'), $.proxy(refund, this));
    }

    function unbindEvents() {
        getUserWallet$.call(this).off(myScope());
        getVM$.call(this).off(myScope());
    }

    function showLoader(show) {

        if (show) {
            if ($(document.body).has('.list-ajax-loader').length == 0)
                $('<div class="list-ajax-loader" />').prependTo($(document.body));
        } else
            $(document.body).find('.list-ajax-loader').remove();
    }

    function writeLog(msg) {
        this.logMessages.push(msg);
    }
   
    

    /* --- Event handlers --- */
    function userWalletClicked(ev, nominal) {
        var moneyItem = { nominal: nominal, amount: 1 };

        var wres = this.customerWallet.withdraw(moneyItem);
        if (wres === true) {
            getVM$.call(this).data('vending_machine').cashIn(moneyItem);
            writeLog.call(this, 'Deposit ' + nominal);
        } else 
            writeLog.call(this, 'Can not withdrow ' + wres.nominal + ': uderflow ' + wres.amountDiff);        

        return false;
    }
    function purchaseTried(ev, purcashingResult) {
        
        if (purcashingResult.result.status === NS.PurcashingResult.prototype.SOLD_OK) {
            
            writeLog.call(this, purcashingResult.merch.name + '/' + purcashingResult.merch.price + 'R was purchased');
            if (purcashingResult.result.change) {
                this.customerWallet.deposit(purcashingResult.result.change);
                writeLog.call(this, 'Change refunded: ' + this.customerWallet.getBalance(purcashingResult.result.change) + 'R');
            }

        } else if (purcashingResult.result.status === NS.PurcashingResult.prototype.RUN_OUT)
            writeLog.call(this, 'Purchasing failed: selected goods item has finished');

        else if (purcashingResult.result.status === NS.PurcashingResult.prototype.NOT_ENOUGHT_MONEY)
            writeLog.call(this, 'Purchasing failed: the deposit is not enough');

        else if (purcashingResult.result.status === NS.PurcashingResult.prototype.NO_CHANGE)
            writeLog.call(this, 'Purchasing failed: VM does not have enough change');

        return false;
    }
    function refund(ev, moneyItems) {
        this.customerWallet.deposit(moneyItems);

        return false;
    }
    /* --- END Event handlers --- */

    /* --- DOM Traversal ---*/
    function getUserWallet$() {
        return $('.id-user-wallet');
    }
    function getVmWallet$() {
        return $('.id-machine-wallet');
    }
    function getVM$() {
        return $('.id-machine');
    }
    function getLog$() {
        return $('.id-msg-log');
    }
    /* --- END DOM Traversal ---*/

/* --- End Privates --- */

})(window.jQuery);
