/**
 * vending-machine-plugin module.
 * @module vending-machine-plugin
 */
define("vending-machine-plugin", ["jquery", "wallet", "goods-store", "purcashing-result", "knockoutjs"], function ($, wallet, goodsStore, purcashingResult, ko) {
    'use strict';

    /**
     * purchase-result event. Fired when a user clicks a goods item.
     *
     * @memberof module:vending-machine-plugin.VendingMachineP
     * @event purchase-result
     * @type {PurchaseResultArg}      
   */

    /**
     * money-refund event. Fired when a user clicks Refund button.
     *
     * @memberof module:vending-machine-plugin.VendingMachineP
     * @event money-refund
     * @type {MoneyRefundArg}      
   */

    

    var JS_PLUGIN_NAME = 'VendingMachineP';
    var PLUGIN_NAME = 'vending_machine_p';
    

    var STAT_READY = 'Ready',
        STAT_DEPOSIT = 'Depositing',
        STAT_NOTENOUGH = 'Deposit is not enough',
        STAT_RUNOUT = 'Run out',
        STAT_NOCHANGE = 'No change';

    function myScope() {
        return '.' + JS_PLUGIN_NAME;
    }

    function scopedName(name) {
        return name + myScope();
    }

    /**
     * Creates the plugin, representing a Vending Machine. Should not be used directly, instead, create it via jQuery warapper: $('css-selector').vending_machine_p(elem, opt).
     * @memberof module:vending-machine-plugin
     * @constructs VendingMachineP
     * @classdesc Represents a Vending Machine plugin, which is responsible for UI representation and interaction.
     * @param {DomNode} element The DOM element to attach plugin to.
     * @param {module:vending-machine-plugin.VendingMachineP.VmOptions} options Plugin settings.
     * @fires purchase-result
     * @fires money-refund
    */
    var VendingMachineP = function (element, options) {
        /**
         * jQuery DOM node wrapper, which wraps an HTML node, where the VM is rendered.
         * @type {jQueryWrapper}
         */
        this.$element = $(element);

        /**
         * Plugin configuration options.
         * @type {module:vending-machine-plugin.VendingMachineP.VmOptions}
         */
        this.options = options;

        /**
         * VM model.
         * @type {module:vending-machine-plugin.VendingMachineP.VmModel}
         */
        this.model = createModel.call(this, options);
    };

    /* --- Prototype --- */
    VendingMachineP.prototype = {

        /* --- Public --- */

        /**
         * Initializes VendingMachineP instance.
         * @param {DomNode} element The DOM element to attach plugin to.
         * @param {module:vending-machine-plugin.VendingMachineP.VmOptions} options Plugin settings.
        */
        constructor: VendingMachineP,

        /**
         * Returns jQuery plugin name 'wallet_p'.
         * @type {string}
         */
        pluginName: PLUGIN_NAME,

        /**
         * Gets hosting DOM node attribute id value.         
         * @returns {string}
        */
        getId: function() { return this.$element.attr('id'); },

        /**
         * Deposites specified money into operational wallet of this VM.
         * @param {MoneyItem} moneyItem Specifies one money item of a certain nominal, which is being added to the operational VM wallet. User needs to deposit several items to gain a certain money amount, which is enough to buy a goods item.
         */
        cashIn: function(moneyItem) {
            this.model.operationWallet.deposit(moneyItem);
            this.model.status(STAT_DEPOSIT);
        },

        /**
         * Detaches all event handlers, additional CSS classes and data off the hosting DOM node.
         */
        destroy: function() { teardown.call(this); }
    };

    /* --- END Prototype --- */

    /* --- Private --- */

    /**
    * Represents vending machine model.
    * @memberOf module:vending-machine-plugin.VendingMachineP
    * @typedef {object} VmModel
    * @prop {module:wallet.Wallet} wallet The internal wallet of vending machine.
    * @prop {GoodItem[]} goods The goods, which vending machine sells.
    * @prop {module:wallet.Wallet} operationWallet Operational wallet. Used to keep current user's deposit until he will buy a goods item or will request refunding.
    * @prop {number} operationBalance Computed observable, which represents user's deposit balance in the operational wallet.
    * @prop {string} status Represents machine state.
    * @prop {itemClick}
    * @prop {callback} itemClick Event handler for left mouse button click on a goods item. Sells the goods item, specified in merchandise.
    * @prop {callback} refundClick Event handler for 'Refund' button. Refunds to user all the content of operational wallet.
    */

    function createModel(opt) {
        var that = this,
            opWallet = new wallet("opw", "OperationWallet", []);
        
        return  {
            wallet: opt.wallet,
            goods: opt.goods,

            operationWallet: opWallet,
            operationBalance: ko.pureComputed(function() { return opWallet.getBalance(); }), //is readonly property, so, use 'pure'
            status: ko.observable(STAT_READY),
            
            itemClick: function(merchandise) {
                purchaseItem.call(that, merchandise);
            },
            
            refundClick: function() { refundCash.call(that); }
        };
    }

    function init() {
        var that = this;

        getMachineTitle$.call(this).text(this.options.name);

        function start(xhr) { showLoader.call(that, true); }

        function complete(dataXHR, textStatus, jqXHR) { showLoader.call(that, false); }

        function success(result, textStatus, jqXHR) {
            getGoods$.call(that).html(result);
            ko.applyBindings(that.model, that.$element.get(0));
            bindEvents.call(that);
        }

        function failure(jqXHR, textStatus, errorThrown) {
            that.$element.text('Can not load template - ' + textStatus + ': \'' + errorThrown + '\'');
        }

        var xhrRequest = {
            url: buildTemplateUrl.call(this),
            dataType: "html",
            beforeSend: start,
            type: 'GET'
        };

        $.ajax(xhrRequest).
            always(complete).
            done(success).
            fail(failure);
    }

    function bindEvents() {
    }

    function unbindEvents() {
    }

    function buildTemplateUrl() {
        if (!this.options.goodsTemplate || typeof this.options.goodsTemplate != 'string' || this.options.goodsTemplate.length === 0)
            throw new Error('Plugin ' + PLUGIN_NAME + ' can not recognize template, specified in options');

        return this.options.goodsTemplate;
    }

    function showLoader(show) {

        if (show) {
            if (this.$element.has('.list-ajax-loader').length === 0)
                $('<div class="list-ajax-loader" />').prependTo(this.$element);
        } else
            this.$element.find('.list-ajax-loader').remove();
    }

    /**
    * Represents purchasing result event argument.    
    * @global
    * @typedef {object} PurchaseResultArg
    * @prop {module:purcashing-result.PurcashingResult} result Refunded money items array.    
    * @prop {GoodItem} merch Purchased goods item
   */

    function purchaseItem(merchendise) {

        var res = this.model.goods.purchase(merchendise.name, this.model.operationWallet.getDetails());

        if (res.status === purcashingResult.prototype.SOLD_OK) {
            this.model.operationWallet.withdrawAll();
            this.model.status(STAT_READY);
        } else if (res.status === purcashingResult.prototype.RUN_OUT)
            this.model.status(STAT_RUNOUT);
        else if (res.status === purcashingResult.prototype.NOT_ENOUGHT_MONEY)
            this.model.status(STAT_NOTENOUGH);
        else 
            this.model.status(STAT_NOCHANGE);

        this.$element.trigger('purchase-result', { result: res, merch: merchendise });
    }

    /**
    * Represents refund event argument.    
    * @global
    * @typedef {object} MoneyRefundArg
    * @prop {MoneyItem[]} items Refunded money items array.    
   */

    function refundCash() {
        this.$element.trigger('money-refund', { items: this.model.operationWallet.withdrawAll() });
        this.model.status(STAT_READY);
    }

    /* --- DOM Traversal ---*/
    function getGoods$() {
        return this.$element.find('.id-goods');
    }

    function getMachineTitle$() {
        return this.$element.find('.id-machine-title');
    }

    /* --- END DOM Traversal ---*/

    function teardown() {
        $.removeData(this.$element.get(0), PLUGIN_NAME);
        this.$element.removeClass(PLUGIN_NAME);
        unbindEvents.call(this);
        this.$element = null;
    }

    /* --- END Private --- */

    /* --- JQuery plugin registration API --- */
    $.fn[PLUGIN_NAME] = function(options) {

        var args = $.makeArray(arguments),
            extraParams = args.slice(1);


        return this.each(function() {
            var instance = $.data(this, PLUGIN_NAME);

            if (instance) {
                if (typeof options == 'string')
                    instance[options].apply(instance, extraParams);
                else if (instance.update)
                    instance.update.apply(instance, args);
            } else {
                var opt = $.extend({}, $.fn[PLUGIN_NAME].defaults, typeof options == 'object' && options);

                instance = new VendingMachineP(this, opt);
                init.call(instance);

                $.data(this, PLUGIN_NAME, instance);
                $(this).addClass(PLUGIN_NAME);

                if (typeof options == 'string')
                    instance[options].apply(instance, extraParams);
            }
            return true;
        });
    };

    $.fn[PLUGIN_NAME].Constructor = VendingMachineP;

    /**
    * Represents plugin settings.
    * @memberOf module:vending-machine-plugin.VendingMachineP
    * @typedef {object} VmOptions
    * @prop {module:wallet.Wallet} wallet The internal wallet of vending machine.
    * @prop {string} goodsTemplate Html template URL. This template is used for rendering the goods list.
    * @prop {string | number} id Machine unique id.
    * @prop {string} name Machine display name.
    * @prop {module:goods-store.GoodsStore} goods The store with merchendises.
   */
    var defTmp = $.fn[PLUGIN_NAME].defaults = {
        wallet: new wallet("m", "MachineWallet", []),
        goodsTemplate: 'goods-template.html',
        id: 'def1',
        name: 'Vending Machine'
    };
    defTmp.goods = new goodsStore([], defTmp.wallet);
    /* --- END JQuery plugin registration API --- */
});