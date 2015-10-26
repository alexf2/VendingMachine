!(function ($) {
    'use strict';
    
    var JS_PLUGIN_NAME = 'VendingMachine';
    var PLUGIN_NAME = 'vending_machine';

    var NameSpace = 'VmSimulator',
        NS = $[NameSpace] || ($[NameSpace] = {});

    var STAT_READY      = 'Ready',
        STAT_DEPOSIT    = 'Depositing',
        STAT_NOTENOUGH  = 'Deposit is not enough',
        STAT_RUNOUT     = 'Run out',
        STAT_NOCHANGE   = 'No change';

    function myScope() {
        return '.' + JS_PLUGIN_NAME;
    }
    function scopedName(name) {
        return name + myScope();
    }

    var VendingMachine = function (element, options) {
        this.$element = $(element);
        this.options = options;        
        this.model = createModel.call(this, options);
    };

    /* --- Prototype --- */
    VendingMachine.prototype = {

        /* --- Public --- */
        constructor: VendingMachine,

        pluginName: PLUGIN_NAME,

        getId: function () { return this.$element.attr('id'); },

        cashIn: function(moneyItem) {
            this.model.operationWallet.deposit(moneyItem);
            this.model.status(STAT_DEPOSIT);
        },

        destroy: function () { teardown.call(this); }
    };
    /* --- END Prototype --- */

    /* --- Private --- */
    function createModel(opt) {
        var that = this,
            opWallet = new NS.Wallet("opw", "OperationWallet", []);

        return {
            wallet: opt.wallet,
            goods: opt.goods,

            operationWallet: opWallet,
            operationBalance: ko.pureComputed(function () { return opWallet.getBalance(); }),
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
        if (!this.options.goodsTemplate || typeof this.options.goodsTemplate != 'string' || this.options.goodsTemplate.length == 0)
            throw new Error('Plugin ' + PLUGIN_NAME + ' can not recognize template, specified in options');

        return this.options.goodsTemplate;
    }

    function showLoader(show) {

        if (show) {
            if (this.$element.has('.list-ajax-loader').length == 0)
                $('<div class="list-ajax-loader" />').prependTo(this.$element);
        } else
            this.$element.find('.list-ajax-loader').remove();
    }

    function purchaseItem (merchendise) {
        
        var res = this.model.goods.purchase(merchendise.name, this.model.operationWallet.getDetails());        

        if (res.status === NS.PurcashingResult.prototype.SOLD_OK) {
            this.model.operationWallet.withdrawAll();
            this.model.status(STAT_READY);
        }
        else if (res.status === NS.PurcashingResult.prototype.RUN_OUT)
            this.model.status(STAT_RUNOUT);
        else if (res.status === NS.PurcashingResult.prototype.NOT_ENOUGHT_MONEY)
            this.model.status(STAT_NOTENOUGH);
        else //if (res.status === NS.PurcashingResult.prototype.NO_CHANGE)
            this.model.status(STAT_NOCHANGE);
            
        this.$element.trigger('purchase-result', { result: res, merch: merchendise });
    }
    function refundCash() {        
        this.$element.trigger('money-refund', this.model.operationWallet.withdrawAll());
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
    $.fn[PLUGIN_NAME] = function (options) {

        var args = $.makeArray(arguments),
            extraParams = args.slice(1);


        return this.each(function () {
            var instance = $.data(this, PLUGIN_NAME);

            if (instance) {
                if (typeof options == 'string')
                    instance[options].apply(instance, extraParams);
                else if (instance.update)
                    instance.update.apply(instance, args);
            } else {
                var opt = $.extend({}, $.fn[PLUGIN_NAME].defaults, typeof options == 'object' && options);

                instance = new VendingMachine(this, opt);
                init.call(instance);

                $.data(this, PLUGIN_NAME, instance);
                $(this).addClass(PLUGIN_NAME);

                if (typeof options == 'string')
                    instance[options].apply(instance, extraParams);
            }
            return true;
        });
    };

    $.fn[PLUGIN_NAME].Constructor = VendingMachine;

    var defTmp = $.fn[PLUGIN_NAME].defaults = {
        wallet: new NS.Wallet("m", "MachineWallet", []),
        goodsTemplate: 'goods-template.html',
        id: 'def1',
        name: 'Vending Machine'
    };
    defTmp.goods = new NS.GoodsStore([], defTmp.wallet);
    /* --- END JQuery plugin registration API --- */


})(window.jQuery);
