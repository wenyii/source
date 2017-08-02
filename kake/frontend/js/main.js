var app = angular.module('kkApp', []);

/**
 * Service
 */
app.service('service', ['$http', '$q', function ($http, $q) {

    var that = this;

    // CSRF
    this.csrfKey = document.getElementsByName('csrf-param')[0].getAttribute('content');
    this.csrfToken = document.getElementsByName('csrf-token')[0].getAttribute('content');

    // Show message
    this.debug = function (message, type) {

        type = type || 'error';

        console.log('%c' + type.ucFirst() + ':', 'color:red;');
        console.log(message);

        return false;
    };

    // Array.each
    Array.prototype.each = function (callback) {
        callback = callback || Function.K;
        var a = [];
        var args = Array.prototype.slice.call(arguments, 1);
        for (var i = 0; i < this.length; i++) {
            var res = callback.apply(this, [this[i], i].concat(args));
            if (res !== null) {
                a.push(res);
            }
        }
        return a;
    };

    // Array.contains
    Array.prototype.contains = function (element) {
        var self = this;
        for (var i = 0; i < self.length; i++) {
            if (self[i] === element) {
                return true;
            }
        }
        return false;
    };

    // Array.unique
    Array.prototype.unique = function () {
        var ra = [];
        for (var i = 0; i < this.length; i++) {
            if (!ra.contains(this[i])) {
                ra.push(this[i]);
            }
        }
        return ra;
    };

    // Array.complement
    Array.complement = function (a, b) {
        return Array.minus(Array.union(a, b), Array.intersect(a, b));
    };

    // Array.intersect
    Array.intersect = function (a, b) {
        return a.unique().each(function (o) {
            return b.contains(o) ? o : null;
        });
    };

    // Array.minus
    Array.minus = function (a, b) {
        return a.unique().each(function (o) {
            return b.contains(o) ? null : o;
        });
    };

    // Array.union
    Array.union = function (a, b) {
        return a.concat(b).unique();
    };

    // String.trim
    String.prototype.trim = function (str) {
        str = str ? ('\\s' + str) : '\\s';
        return this.replace(eval('/(^[' + str + ']*)|([' + str + ']*$)/g'), '');
    };

    // String.leftTrim
    String.prototype.leftTrim = function (str) {
        str = str ? ('\\s' + str) : '\\s';
        return this.replace(eval('/(^[' + str + ']*)/g'), '');
    };

    // String.rightTrim
    String.prototype.rightTrim = function (str) {
        str = str ? ('\\s' + str) : '\\s';
        return this.replace(eval('/([' + str + ']*$)/g'), '');
    };

    // String.lengths (mb length)
    String.prototype.lengths = function () {

        var length = 0;
        for (var i = 0; i < this.length; i++) {
            if (0 !== (this.charCodeAt(i) & 0xff00)) {
                length++;
            }
            length++;
        }

        return length;
    };

    // String.pad
    String.prototype.pad = function (padstr, length, type) {

        padstr = padstr.toString();
        type = type || 'left';

        if (this.length >= length || !['left', 'right', 'both'].exists(type)) {
            return this;
        }
        var last = (length - this.length) % padstr.length;
        var padnum = _padnum = Math.floor((length - this.length) / padstr.length);

        if (last > 0) {
            padnum += 1;
        }

        var _that = this;
        for (i = 0; i < padnum; i++) {
            if (i === _padnum) {
                padstr = padstr.substr(0, last);
            }
            switch (type) {
                case 'left':
                    _that = padstr + _that;
                    break;
                case 'right':
                    _that += padstr;
                    break;
                case 'both':
                    _that = (0 === i % 2) ? (padstr + _that) : (_that + padstr);
                    break;
            }
        }

        return _that;
    };

    // String.fill
    String.prototype.fill = function (fillstr, length, type) {

        fillstr = fillstr.toString();
        type = type || 'left';

        if (length < 1 || !['left', 'right', 'both'].exists(type)) {
            return this;
        }

        var _that = this;
        for (i = 0; i < length; i++) {
            switch (type) {
                case 'left':
                    _that = fillstr + _that;
                    break;
                case 'right':
                    _that += fillstr;
                    break;
                case 'both':
                    _that = (0 === i % 2) ? (fillstr + _that) : (_that + fillstr);
                    break;
            }
        }

        return _that;
    };

    // String.repeat
    String.prototype.repeat = function (num) {
        num = (isNaN(num) || num < 1) ? 1 : num + 1;
        return new Array(num).join(this)
    };

    // String.ucWords
    String.prototype.ucWords = function () {
        return this.replace(/\b(\w)+\b/g, function (word) {
            return word.replace(word.charAt(0), word.charAt(0).toUpperCase());
        });
    };

    // String.ucFirst
    String.prototype.ucFirst = function () {
        return this.replace(this.charAt(0), this.charAt(0).toUpperCase());
    };

    // String.lcFirst
    String.prototype.lcFirst = function () {
        return this.replace(this.charAt(0), this.charAt(0).toLowerCase());
    };

    // String.bigHump
    String.prototype.bigHump = function (split) {
        split = split || '-';
        var reg = new RegExp(split, 'g');
        return this.replace(reg, ' ').ucWords().replace(/ /g, '');
    };

    // String.smallHump
    String.prototype.smallHump = function (split) {
        return this.bigHump(split).lcFirst();
    };

    // Date.format
    // yyyy-MM-dd hh:mm:ss
    Date.prototype.format = function (fmt) {
        var o = {
            "M+": this.getMonth() + 1,
            "d+": this.getDate(),
            "h+": this.getHours(),
            "m+": this.getMinutes(),
            "s+": this.getSeconds(),
            "q+": Math.floor((this.getMonth() + 3) / 3),
            "S": this.getMilliseconds()
        };

        if (/(y+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
        }

        for (var k in o) {
            if (new RegExp("(" + k + ")").test(fmt)) {
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
            }
        }

        return fmt;
    };

    // AlloyTouch.ratio
    AlloyTouch.prototype.ratio = function (to, move) {

        move = move || 30;

        var baseTranX = this.currentPage * this.step * -1;
        var delta = to - baseTranX;

        if (to < this.min) {
            to = this.min;
        } else if (to > this.max) {
            to = this.max;
        } else if (Math.abs(delta) < move) {
            to = baseTranX;
        } else if (delta > 0) {
            to = baseTranX + this.step;
        } else {
            to = baseTranX - this.step;
        }

        return {
            to: to,
            delta: delta,
            index: to / this.step * -1
        };
    };

    // Is array
    this.isArray = function (val) {
        if (null === val) {
            return false;
        }
        return typeof val === 'object' && val.constructor === Array;
    };

    // Is object
    this.isObject = function (val) {
        if (null === val) {
            return false;
        }
        return typeof val === 'object' && val.constructor === Object;
    };

    // Is json
    this.isJson = function (val) {
        if (null === val) {
            return false;
        }
        return typeof val === 'object' && Object.prototype.toString.call(val).toLowerCase() === '[object object]';
    };

    // Is string
    this.isString = function (val) {
        if (null === val) {
            return false;
        }
        return typeof val === 'string' && val.constructor === String;
    };

    // Is numeric
    this.isNumeric = function (val) {
        if (null === val || '' === val) {
            return false;
        }
        return !isNaN(val);
    };

    // Is boolean
    this.isBoolean = function (val) {
        if (null === val) {
            return false;
        }
        return typeof val === 'boolean' && val.constructor === Boolean;
    };

    // Is function
    this.isFunction = function (val) {
        if (null === val) {
            return false;
        }
        return typeof val === 'function' && Object.prototype.toString.call(val).toLowerCase() === '[object function]';
    };

    // Is empty
    this.isEmpty = function (val, outNumZero) {
        if (typeof val === 'undefined' || val === null) {
            return true;
        }
        if (that.isNumeric(val) && outNumZero) {
            return Number(val) === 0;
        } else if (that.isString(val)) {
            return val.trim() === '';
        } else if (that.isJson(val)) {
            return that.jsonLength(val) === 0;
        } else if (that.isArray(val) || that.isObject(val)) {
            return val.length === 0;
        }
        return !val;
    };

    // Get timestamp
    this.time = function (sec) {
        var time = new Date().getTime();
        return sec ? Math.ceil(time / 1000) : time;
    };

    // Get json length
    this.jsonLength = function (json) {
        var length = 0;
        var i;
        for (i in json) {
            length++;
        }
        return length;
    };

    // Get document offset
    this.offset = function (obj) {
        return {
            left: obj.offsetLeft,
            top: obj.offsetTop,
            width: obj.offsetWidth,
            height: obj.offsetHeight
        };
    };

    // Listen scroll reach to bottom
    this.reachBottom = function (callback, prefixHeight) {

        $(window).scroll(function () {

            var scrollTop = $(window).scrollTop();
            var documentHeight = $(document).height();
            var windowHeight = $(window).height();

            prefixHeight = parseInt(prefixHeight) || 0;
            if ((prefixHeight + scrollTop) >= (documentHeight - windowHeight)) {
                callback(scrollTop, documentHeight, windowHeight);
            }
        });
    };

    // Listen scroll for to top
    this.goToTop = function (button, screenNum, time) {

        new AlloyFinger(button, {
            tap: function () {
                $('body, html').animate({scrollTop: 0}, time || 500);
            }
        });

        button = $(button);
        $(window).scroll(function () {

            var scrollTop = $(window).scrollTop();
            var windowHeight = $(window).height();

            screenNum = parseInt(screenNum) || 1;

            if (scrollTop >= (windowHeight * screenNum)) {
                button.fadeIn();
            } else {
                button.fadeOut();
            }
        });
    };

    // Send post base on ajax
    this.ajaxPost = function (uri, params, errorCallback) {

        var defer = $q.defer();
        params[that.csrfKey] = this.csrfToken;

        $http({
            method: 'POST',
            url: requestUrl + uri,
            data: params
        }).then(function (result) {

            if (result.data.state) {
                defer.resolve(result.data);
            } else {
                defer.reject(result.data);
            }

        }, function () {
            var error = 'An error occurred, try again later.';
            if (errorCallback) {
                errorCallback(error);
            } else {
                that.debug(error);
            }
        });

        return defer.promise;
    };

    // Validate
    this.check = function (param, type) {

        var items = {
            phone: /^[\d]([\d\-\ ]+)?[\d]$/
        };

        return !!items[type].test(param);
    };

    // Parse query string
    this.parseQueryString = function (url) {

        url = url || location.href;

        if (url.indexOf('?') !== -1) {
            url = url.split('?')[1];
        }

        if (url.indexOf('#')) {
            url = url.split('#')[0];
        }

        url = url.split('&');
        var items = {};
        $.each(url, function (key, item) {
            item = item.split('=');
            items[item[0]] = item[1];
        });

        return items;
    };

    // Supplement params from current location
    this.supplyParams = function (href, params) {
        var queryParams = that.parseQueryString();
        var queryString = '';
        $.each(params || [], function (k, v) {
            if (typeof queryParams[v] !== 'undefined') {
                queryString += '&' + v + '=' + queryParams[v];
            }
        });

        if (href.indexOf('?')) {
            href += queryString;
        } else {
            href = href + '?' + queryString.leftTrim('&')
        }

        return href;
    };

    // Image load completed
    this.imageLoaded = function (box, callback) {

        box = box || $('body');
        var imgDeferred = [];

        box.find('img').each(function () {

            var deferred = $.Deferred();
            $(this).bind('load', function () {
                deferred.resolve();
            }).bind('error', function () {
                deferred.reject();
            });

            if (this.complete) {
                deferred.resolve();
            }

            imgDeferred.push(deferred);
        });

        $.when(imgDeferred).done(function () {
            callback();
        });
    };

    // Count px of margin and padding
    this.MAP = function (obj, length, type, pos) {

        length = length || 1;
        type = type || ['margin', 'padding'];
        pos = pos || ['left', 'right'];

        var px = 0;

        type.each(function (m) {
            pos.each(function (n) {
                px += parseInt(obj.css(m + '-' + n)) * length;
            });
        });

        return px;
    };
}]);

/**
 * Config
 */
app.config(['$httpProvider', function ($httpProvider) {

    var jsonToUrl = function (obj) {
        var query = '', name, value, fullSubName, subName, subValue, innerObj, i;

        for (name in obj) {
            if (!obj.hasOwnProperty(name)) {
                continue;
            }
            value = obj[name];

            if (value instanceof Array) {
                for (i = 0; i < value.length; ++i) {
                    subValue = value[i];
                    fullSubName = name + '[' + i + ']';
                    innerObj = {};
                    innerObj[fullSubName] = subValue;
                    query += jsonToUrl(innerObj) + '&';
                }
            } else if (value instanceof Object) {
                for (subName in value) {
                    if (!value.hasOwnProperty(subName)) {
                        continue;
                    }
                    subValue = value[subName];
                    fullSubName = name + '[' + subName + ']';
                    innerObj = {};
                    innerObj[fullSubName] = subValue;
                    query += jsonToUrl(innerObj) + '&';
                }
            }
            else if (value !== undefined && value !== null) {
                query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
            }
        }

        return query.length ? query.substr(0, query.length - 1) : query;
    };

    // Format query data
    $httpProvider.defaults.transformRequest = function (obj) {
        return jsonToUrl(obj);
    };

    // Statement ajax request
    $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
    $httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
}]);

/**
 * Directive tap replace ng-click
 */
app.directive('kkTap', ['$parse', function ($parse) {

    var command = {
        restrict: 'A'
    };

    command.compile = function ($elem, attrs) {
        var fn = $parse(attrs.kkTap);
        return function ngEventHandler(scope, elem) {
            var alloy = {};
            alloy.tap = function (event) {
                window.event = event;
                var callback = function () {
                    fn(scope, {
                        $event: event
                    });
                };
                scope.$apply(callback);
            };
            new AlloyFinger(elem[0], alloy);
        };
    };

    return command;
}]);

/**
 * Directive focus
 */
app.directive('kkFocus', ['service', function (service) {

    var command = {
        scope: {},
        restrict: 'A'
    };

    command.link = function (scope, elem, attrs) {

        var that = this;

        this.scrollObject = elem.children();
        this.imageObject = this.scrollObject.find('img');
        this.pointObject = $(attrs.kkFocus);

        this.scrollObject.css({
            width: 100 * that.imageObject.length + '%'
        });

        this.imageObject.css({
            width: 100 / that.imageObject.length + '%'
        });

        this.scrollWidth = this.imageObject.width();

        this.stayTime = attrs.stayTime || 5000;
        this.playTime = attrs.playTime || 500;

        if (!attrs.id) {
            return service.debug('[kk-focus] Current element must has attribute `id`!');
        }

        var changeCurrent = function (index) {
            index = index || 0;
            var tpl = attrs.numberTpl;
            if (tpl) {
                tpl = tpl.replace(/\{TOTAL\}/g, that.imageObject.length);
                tpl = tpl.replace(/\{NOW\}/g, index + 1);
                that.pointObject.html(tpl);
            } else {
                var currentCss = attrs.pointCurrent || 'current';
                that.pointObject.children().removeClass(currentCss);
                that.pointObject.children().eq(index).addClass(currentCss);
            }
        };

        changeCurrent();
        Transform(this.scrollObject[0]);

        var touch = new AlloyTouch({
            touch: '#' + attrs.id,
            vertical: false,
            target: that.scrollObject[0],
            property: 'translateX',
            min: that.scrollWidth * -(that.imageObject.length - 1),
            max: 0,
            step: that.scrollWidth,
            inertia: false,
            sensitivity: 1,

            touchStart: function () {
                clearInterval(that.plan);
            },

            touchMove: function () {
                this.preventDefault = true;
            },

            touchEnd: function (event, to) {

                this.preventDefault = false;

                var obj = this.ratio(to);
                this.to(obj.to, that.playTime);
                that.auto(obj.to);

                return false;
            },

            animationEnd: function () {
                changeCurrent(this.currentPage);
            }
        });

        this.auto = function (v) {

            v = v || touch.max;

            that.plan = setInterval(function () {
                v -= touch.step;
                v = (v < touch.min) ? touch.max : v;
                touch.to(v, that.playTime);
            }, that.stayTime);
        };

        this.auto();
    };

    return command;
}]);

/**
 * Directive scroll
 */
app.directive('kkScroll', ['service', function (service) {

    var command = {
        scope: {},
        restrict: 'A'
    };

    command.link = function (scope, elem, attrs) {

        var that = this;

        if (!attrs.id) {
            return service.debug('[kk-scroll] Current element must has attribute `id`!');
        }

        this.scrollObject = elem.children();
        this.imageObject = this.scrollObject.children();
        this.MAP = 0
            + service.MAP(this.scrollObject)
            + service.MAP(this.imageObject, this.imageObject.length);

        this.offset = parseInt(attrs.kkScroll) ? parseInt(attrs.kkScroll) : 0;
        this.offset = window.innerWidth - this.MAP - this.offset;

        Transform(this.scrollObject[0]);
        new AlloyTouch({
            touch: '#' + attrs.id,
            vertical: false,
            target: that.scrollObject[0],
            property: 'translateX',
            min: that.imageObject.width() * -(that.imageObject.length) + this.offset,
            max: 0,
            sensitivity: 1,

            touchMove: function () {
                this.preventDefault = true;
            },

            touchEnd: function () {
                this.preventDefault = false;
            }
        });
    };

    return command;
}]);

/**
 * Directive camel
 */
app.directive('kkCamel', ['service', function (service) {

    var command = {
        scope: {},
        restrict: 'A'
    };

    command.link = function (scope, elem, attrs) {

        var that = this;

        if (!attrs.id) {
            return service.debug('[kk-camel] Current element must has attribute `id`!');
        }

        this.camelObject = elem.children();
        this.imageObject = this.camelObject.children();

        this.imageW = this.imageObject.width();
        this.imageL = this.imageObject.length;
        this.imageMAP = service.MAP(this.imageObject);

        this.MAP = 0
            + service.MAP(this.camelObject)
            + this.imageMAP * this.imageL;

        this.half = (window.innerWidth - this.imageW) / 2;
        this.scale = parseFloat(attrs.scale) || .9;

        this.first = -(this.imageW + this.imageMAP);
        this.last = -(this.imageW + this.imageMAP) * (this.imageL - 2);

        Transform(this.camelObject[0]);
        this.camelObject[0].translateX = -(this.imageW + this.imageMAP);

        this.imageObject.each(function (k, v) {
            Transform(v);
            v.translateX = that.half - service.MAP(that.imageObject, 1, null, ['left']);
            v.scaleX = v.scaleY = that.scale;
        });

        this.imageObject[1].scaleX = this.imageObject[1].scaleY = 1;

        new AlloyTouch({
            touch: '#' + attrs.id,
            vertical: false,
            target: that.camelObject[0],
            property: 'translateX',
            min: that.imageW * -(that.imageL) + window.innerWidth - this.MAP,
            max: 0,
            sensitivity: 1,
            step: that.imageW + that.imageMAP,
            inertia: false,

            pressMove: function (event, to) {

                var obj = this.ratio(to, this.step);
                if (obj.to > that.first) {
                    obj.to = that.first;
                    obj.index += 1;
                } else if (obj.to < that.last) {
                    obj.to = that.last;
                    obj.index -= 1;
                }

                var percent = (1 - that.scale) * Math.abs(obj.delta) / this.step;
                if (obj.delta < 0) { // touch to first
                    that.imageObject.each(function (k, v) {
                        var scale = (k === obj.index + 1) ? (that.scale + percent) : (1 - percent);
                        v.scaleX = v.scaleY = scale;
                    });
                } else if (obj.delta > 0) { // touch to last
                    that.imageObject.each(function (k, v) {
                        var scale = (k === obj.index - 1) ? (that.scale + percent) : (1 - percent);
                        v.scaleX = v.scaleY = scale;
                    });
                }
            },

            touchMove: function () {
                this.preventDefault = true;
            },

            touchEnd: function (event, to) {
                this.preventDefault = false;

                var obj = this.ratio(to);
                if (obj.to > that.first) {
                    obj.to = that.first;
                    obj.index += 1;
                } else if (obj.to < that.last) {
                    obj.to = that.last;
                    obj.index -= 1;
                }

                this.to(obj.to, 200);

                that.imageObject.each(function (k, v) {
                    v.scaleX = v.scaleY = (k === obj.index ? 1 : that.scale);
                });

                return false;
            }
        });
    };

    return command;
}]);

/**
 * Directive sms
 */
app.directive('kkSms', function () {

    var command = {
        scope: false,
        restrict: 'A'
    };

    command.link = function (scope, elem, attrs) {

        var time = attrs.time || 60;
        var type = attrs.type;
        var uri = 'general/ajax-sms';

        var alloy = {};

        alloy.tap = function () {

            // disabled
            if (typeof elem.attr('disabled') !== 'undefined') {
                return null;
            }

            scope.loading(true);

            var data = {
                api: uri,
                post: {
                    phone: attrs.kkSms,
                    type: type
                }
            };

            data.success = function () {
                scope.loading(false);
                elem.attr('disabled', 'disabled');

                var oldText = elem.html();
                var newText = '<i>' + time + '</i>秒后可重发';

                elem.html(newText);

                var obj = elem.find('i');
                var smsTime = setInterval(function () {
                    var sec = parseInt(obj.text());
                    if (sec <= 1) {
                        clearInterval(smsTime);
                        elem.html(oldText);
                        elem.removeAttr('disabled');

                        return null;
                    }
                    obj.text(sec - 1);
                }, 1000);
            };

            data.fail = function (result) {
                scope.message(result.info);
            };

            scope.request(data);
        };
        new AlloyFinger(elem[0], alloy);
    };

    return command;
});

/**
 * Directive menu
 */
app.directive('kkMenu', ['service', function (service) {

    var command = {
        scope: {},
        restrict: 'A'
    };

    command.link = function (scope, elem, attrs) {
        var menu = $(attrs.kkMenu);

        new AlloyFinger(elem[0], {
            tap: function () {
                var pos = service.offset(elem[0]);
                var padding = parseInt(menu.css('paddingLeft')) + parseInt(menu.css('paddingRight'));

                var posX = parseInt(attrs.posX || 0);
                var posY = parseInt(attrs.posY || 0);

                menu.css({
                    left: pos.left - parseInt(menu.width()) - padding + parseInt(elem.width()) + posX,
                    top: pos.top + pos.height + 15 + posY
                });

                menu.fadeToggle();
            }
        });

        $(window).scroll(function () {
            menu.fadeOut('fast');
        });
    };

    return command;
}]);

/**
 * Directive fixed box
 */
app.directive('kkFixed', ['service', function (service) {

    var command = {
        scope: {},
        restrict: 'A'
    };

    command.link = function (scope, elem, attrs) {

        var prefixHeight = parseInt(attrs.kkFixed) || 0;
        var pos = service.offset(elem[0]);

        var fillBoxClass = attrs.box || 'fixed-fill-box';
        var _fillBoxClass = '.' + fillBoxClass;

        $(window).scroll(function () {

            var scrollTop = $(window).scrollTop();

            if (prefixHeight + scrollTop >= pos.top) {
                elem.addClass('fixed-box');

                if (!$(_fillBoxClass).length) {
                    var fillBox = $('<div></div>');
                    fillBox.addClass(fillBoxClass).css({
                        width: pos.width,
                        height: pos.height
                    });
                    elem.before(fillBox);
                }
            } else {
                elem.removeClass('fixed-box');
                $(_fillBoxClass).remove();
            }
        });
    };

    return command;
}]);

/**
 * Directive table card
 */
app.directive('kkTabCard', function () {

    var command = {
        scope: {},
        restrict: 'A'
    };

    command.link = function (scope, elem, attrs) {
        var tabElements = elem.find(attrs.element || '*');
        var tab = [];
        var tabElement = [];
        tabElements.each(function () {
            var tabDiv = $(this).attr('data-card');

            if (tabDiv) {
                tab.push($(tabDiv)[0]);
                tabElement.push(this);
            }
        });

        $.each(tabElement, function () {
            new AlloyFinger(this, {
                tap: function () {
                    // action tab
                    $(tabElement).removeClass(attrs.kkTabCard);
                    $(this).addClass(attrs.kkTabCard);

                    // action card
                    var tabDiv = $(this).attr('data-card');
                    $(tab).hide();
                    $(tabDiv).fadeIn();
                }
            });
        });
    };

    return command;
});

/**
 * Directive input cancel
 */
app.directive('kkInputCancel', function () {

    var command = {
        scope: {},
        restrict: 'A'
    };

    command.link = function (scope, elem, attrs) {
        var input = $(attrs.kkInputCancel);

        input.bind('focus', function () {
            elem.show();
        });

        var alloy = {};

        alloy.tap = function () {
            input.val(null).blur();
            elem.hide();
        };
        new AlloyFinger(elem[0], alloy);
    };

    return command;
});

/**
 * Directive ajax load
 */
app.directive('kkAjaxLoad', ['service', '$compile', function (service, $compile) {

    var command = {
        scope: false,
        restrict: 'A'
    };

    command.link = function (scope, elem, attrs) {
        service.reachBottom(function () {

            if (elem.attr('data-over')) {
                return null;
            }

            var page = parseInt(elem.attr('data-page'));
            page = page ? page : 2;

            var query = location.search.replace('?r=', '');
            query = query ? service.parseQueryString(query) : {};

            var data = attrs.params;
            data = data ? service.parseQueryString(data) : {};
            data.page = page;

            data = $.extend({}, query, data);

            scope.request({
                api: attrs.kkAjaxLoad,
                post: data,
                success: function (res) {

                    var over = function () {
                        elem.attr('data-over', true);
                        attrs.message && scope.message(attrs.message);
                        return null;
                    };

                    service.isEmpty(res.data.html) && over();

                    var tpl = $compile(res.data.html);
                    res.data.html = tpl(scope);

                    elem.append(res.data.html).attr('data-page', page + 1);
                    res.data.over && over();
                }
            });
        });
    };

    return command;
}]);

/**
 * Directive ajax upload
 */
app.directive('kkAjaxUpload', ['service', function (service) {

    var command = {
        scope: false,
        restrict: 'A'
    };

    command.link = function (scope, elem, attrs) {

        var data = attrs.params ? service.parseQueryString(data) : {};
        data[service.csrfKey] = service.csrfToken;

        new AjaxUpload($(attrs.kkAjaxUpload), {
            action: requestUrl + attrs.action,
            name: 'ajax',
            autoSubmit: true,
            responseType: 'json',
            accept: '*',
            data: data,
            onChange: function () {
                scope.loading(true);
            },
            onComplete: function (file, response) {

                scope.loading(false);

                if (!response.state) {
                    return scope.message(response.info);
                }

                var fn = eval('scope.' + attrs.callback);
                fn && fn.apply(scope, [response.data]);
            }
        });
    };

    return command;
}]);

/**
 * Controller
 */
app.controller('generic', ['$scope', '$timeout', 'service', function ($scope, $timeout, service) {

    $scope.timeout = $timeout;
    $scope.service = service;
    $scope.conf = {
        ajaxLock: {},
        timeout: null
    };

    /**
     * 禁用滚动条
     *
     * @param scroll
     */
    $scope.scroll = function (scroll) {

        var obj = $('html,body');

        if (scroll) {
            obj.removeClass('scroll-y');
        } else {
            obj.addClass('scroll-y');
        }
    };

    /**
     * 加载图
     *
     * @param load
     * @param time
     */
    $scope.loading = function (load, time) {

        var hideTag;
        load = (typeof load === 'undefined') ? true : load;
        time = (parseInt(time) || 0) * 1000;

        var box = $('#loading');
        var bar = box.find('.loading-bar');

        if (load) {
            $scope.scroll(false);
            box.removeClass('hidden');
        } else {
            $scope.scroll(true);
            $scope.hideAnimate(box, bar, 700, hideTag);
        }

        if (time) {
            hideTag = setTimeout(function () {
                $scope.loading(false);
            }, time);
        }

        return null;
    };

    /**
     * 显示消息
     *
     * @param msg
     * @param time
     */
    $scope.message = function (msg, time) {

        var hideTag;
        $scope.loading(false);
        time = (parseInt(time) || 10) * 1000;

        var box = $('#message');
        var bar = box.find('.message-bar');

        $scope.scroll(false);
        var hide = function () {
            $scope.scroll(true);
            $scope.hideAnimate(box, bar, 700, hideTag);
        };

        box.removeClass('hidden').on('click', hide).find('.message-box').html(msg);
        hideTag = setTimeout(hide, time);

        return null;
    };

    /**
     * 收起动画
     *
     * @param box
     * @param bar
     * @param time
     * @param clear
     */
    $scope.hideAnimate = function (box, bar, time, clear) {

        time += 10;

        box.removeClass('kk-show').addClass('kk-hide');
        bar.removeClass('kk-t2b-show').addClass('kk-b2t-hide');

        clearTimeout(clear);

        setTimeout(function () {
            box.addClass('hidden');
            box.removeClass('kk-hide').addClass('kk-show');
            bar.removeClass('kk-b2t-hide').addClass('kk-t2b-show');
        }, time);
    };

    /**
     * Ajax lock
     *
     * @param api
     * @param unlock
     */
    $scope.ajaxLock = function (api, unlock) {
        var lock = $scope.conf.ajaxLock;
        if (unlock) {
            lock[api] = 0;
            return true;
        } else {
            if (!lock[api] || service.time() > lock[api]) {
                lock[api] = service.time() + 1000; // 1 second
                return true;
            }
            return false;
        }
    };

    /**
     * Request and show loading, lock
     *
     * @param option
     */
    $scope.request = function (option) {

        if (typeof option.loading === 'undefined') {
            option.loading = true;
        }

        if (!$scope.ajaxLock(option.api)) {
            return false;
        }

        if (option.loading) {
            $scope.loading(true);
        }

        service.ajaxPost(option.api, option.post, function (error) {

            $scope.message(error);

        }).then(function (result) {

            var handler = function () {
                $scope.loading(false);
                if (!service.isEmpty(result.info)) {
                    $scope.message(result.info);
                }

                option.success && option.success(result);
            };

            $timeout(handler, 500);

        }, function (result) {

            $scope.loading(false);
            if (option.fail) {
                option.fail(result);
            } else {
                $scope.message(result.info);
            }
        });
    };

    /**
     * 微信 SDK
     *
     * @param conf
     * @param title
     * @param description
     * @param cover
     */
    $scope.wxSDK = function (conf, title, description, cover) {

        wx.config(conf);
        wx.ready(function () {

            var hideList = [
                'menuItem:share:qq',
                'menuItem:share:weiboApp',
                'menuItem:share:facebook',
                'menuItem:share:QZone',
                'menuItem:editTag',
                'menuItem:delete',
                'menuItem:originPage',
                'menuItem:readMode',
                'menuItem:share:email',
                'menuItem:share:brand'
            ];
            wx.hideMenuItems({menuList: hideList});

            var options = {
                title: title,
                link: location.href,
                imgUrl: cover,
                success: function () {
                    $scope.message('分享成功');
                }
            };

            // 分享到朋友圈
            wx.onMenuShareTimeline(options);

            // 分享给朋友
            options.desc = description;
            wx.onMenuShareAppMessage(options);
        });
    };

    /**
     * 公用内容
     */
    $scope.common = function () {

        // 分销商标示
        $('a').on('tap click', function (e) {
            var href = $(this).attr('href');
            if (!href || href.indexOf('javascript:') === 0 || href.indexOf('tel:') === 0) {
                return true;
            }

            if (href.indexOf('http') === 0 && href.indexOf(baseUrl) === -1) {
                return true;
            }

            var _href = service.supplyParams(href, ['channel']);
            if (href === _href) {
                return true;
            }

            e && e.preventDefault && e.preventDefault();
            location.href = _href;
        });

        // 图片加载
        $scope.loading(true);
        var load = $('body').imagesLoaded({background: true}).always(function (instance) {
            $scope.loading(false);
        })
    };
}]);