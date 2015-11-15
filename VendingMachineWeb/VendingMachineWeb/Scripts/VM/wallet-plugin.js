!(function ($) {
    'use strict';
    
    var JS_PLUGIN_NAME = 'WalletP';
    var PLUGIN_NAME = 'walletp';

    var NameSpace = 'VmSimulator',
        NS = $[NameSpace] || ($[NameSpace] = {});


    function myScope() {
        return '.' + JS_PLUGIN_NAME;
    }
    function scopedName(name) {
        return name + myScope();
    }

    /**
     * Creates the plugin, representing a Wallet.
     * @constructor
     * @param {DomNode} the DOM element to attach plugin to.
     * @param {object} options object.
    */
    var WalletP = function (element, options) {
        this.$element = $(element);
        this.options = options;
        this.model = createModel.call(this, options);
    };

    /* --- Prototype --- */
    WalletP.prototype = {

        /* --- Public --- */
        constructor: WalletP,

        pluginName: PLUGIN_NAME,

        getId: function () { return this.$element.attr('id'); },

        destroy: function () { teardown.call(this); }
    };
    /* --- END Prototype --- */

    /* --- Private --- */
    function createModel(opt) {
        return {
            wallet: opt.wallet
        };
    }    

    function init() {
        var that = this;
        
        function start(xhr) { showLoader.call(that, true); }

        function complete(dataXHR, textStatus, jqXHR) { showLoader.call(that, false); }

        function success(result, textStatus, jqXHR) {
            that.$element.html(result);
            ko.applyBindings(that.model.wallet, that.$element.get(0));
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
        this.$element.find('.list-group').on(scopedName('click'), '.list-group-item', null, $.proxy(moneyItemClick, this));
    }

    function unbindEvents() {
        this.$element.find('.list-group').off(myScope());
    }

    function buildTemplateUrl() {
        if (!this.options.template || typeof this.options.template != 'string' || this.options.template.length == 0)
            throw new Error('Plugin ' + PLUGIN_NAME + ' can not recognize template, specified in options');

        return this.options.template;
    }

    function showLoader (show) {

        if (show) {
            if (this.$element.has('.list-ajax-loader').length == 0)
                $('<div class="list-ajax-loader" />').prependTo(this.$element);
        } else
            this.$element.find('.list-ajax-loader').remove();
    }

    /* --- Event handlers --- */
    function moneyItemClick(ev) {
        var nominal = parseFloat($(ev.target).closest('a.list-group-item').data('nominal'));        
        if (this.model.wallet.readonly == false)
            this.$element.trigger('money-item-clicked', nominal);
    }
    /* --- END Event handlers --- */

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

                instance = new WalletP(this, opt);
                init.call(instance);

                $.data(this, PLUGIN_NAME, instance);
                $(this).addClass(PLUGIN_NAME);

                if (typeof options == 'string')
                    instance[options].apply(instance, extraParams);
            }
            return true;
        });
    };

    $.fn[PLUGIN_NAME].Constructor = WalletP;

    $.fn[PLUGIN_NAME].defaults = {        
        wallet: new NS.Wallet("def-1", "default", []),
        template: 'wallet-template.html'
    };
    /* --- END JQuery plugin registration API --- */


})(window.jQuery);
