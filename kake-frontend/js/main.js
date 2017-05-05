var app = angular.module('kkApp', []);

/**
 * Service
 */
app.service('genericService', ['$http', '$q', function ($http, $q) {

    var that = this;

    // CSRF
    this.csrfKey = document.getElementsByName('csrf-param')[0].getAttribute('content');
    this.csrfToken = document.getElementsByName('csrf-token')[0].getAttribute('content');

    // Show message
    this.message = function (message, type) {
        type = type || 'error';
        console.log('%c' + type.ucFirst() + ':', 'color:red;');
        console.log(message);
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
                that.message(error);
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

    command.compile = function ($element, attr) {
        var fn = $parse(attr.kkTap);
        return function ngEventHandler(scope, element) {
            var alloy = {};
            alloy.tap = function (event) {
                var callback = function () {
                    fn(scope, {
                        $event: event
                    });
                };
                scope.$apply(callback);
            };

            new AlloyFinger(element[0], alloy);
        };
    };

    return command;
}]);

/**
 * Directive css animation
 */
app.directive('kkAnimation', function () {

    var command = {
        scope: {},
        restrict: 'A',
        template: '<i></i><span ng-transclude></span>',
        transclude: true
    };

    command.link = function (scope, elem, attrs) {
        var cls = attrs.kkAnimation;
        new AlloyFinger(elem[0], {
            tap: function () {
                elem.addClass(cls);
                setTimeout(function () {
                    elem.removeClass(cls);
                }, 500);
            }
        });
    };

    return command;
});

/**
 * Directive focus
 */
app.directive('kkFocus', ['genericService', function (genericService) {

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

        if (!attrs.id) {
            return genericService.message('[kk-focus] Current element must has attribute `id`!');
        }

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

            touchEnd: function (event, v, index) {

                this.preventDefault = false;

                var step_v = index * this.step * -1;
                var dx = v - step_v;

                if (v < this.min) {
                    v = this.min;
                } else if (v > this.max) {
                    v = this.max;
                } else if (Math.abs(dx) < 30) {
                    v = step_v;
                } else if (dx > 0) {
                    v = step_v + this.step;
                } else {
                    v = step_v - this.step;
                }

                this.to(v, that.playTime);
                that.auto(v);

                return false;
            },

            animationEnd: function () {
                that.pointObject.children().removeClass('current');
                that.pointObject.children().eq(this.currentPage).addClass('current');
            }
        });

        // plan
        this.stayTime = attrs.focusStayTime || 3000;
        this.playTime = attrs.focusPlayTime || 500;

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
app.directive('kkScroll', ['genericService', function (genericService) {

    var command = {
        scope: {},
        restrict: 'A'
    };

    command.link = function (scope, elem, attrs) {

        var that = this;

        if (!attrs.id) {
            return genericService.message('[kk-scroll] Current element must has attribute `id`!');
        }

        this.scrollObject = elem.children();
        this.imageObject = this.scrollObject.children();
        this.marginAndPadding = parseInt(this.scrollObject.css('margin-left'))
            + parseInt(this.scrollObject.css('padding-left')) * (that.scrollObject.children().length - 1)
            + parseInt(this.imageObject.css('margin-right')) * (that.scrollObject.children().length - 1)
            + parseInt(this.imageObject.css('padding-left')) * (that.scrollObject.children().length - 1)
            + parseInt(this.imageObject.css('margin-left')) * (that.scrollObject.children().length - 1)
            + parseInt(this.imageObject.css('padding-right')) * (that.scrollObject.children().length - 1);
        Transform(this.scrollObject[0]);
        new AlloyTouch({
            touch: '#' + attrs.id,
            vertical: false,
            target: that.scrollObject[0],
            property: 'translateX',
            min: -that.scrollObject.children().width() * that.scrollObject.children().length + window.innerWidth - this.marginAndPadding,
            //min: -that.scrollObject.children().width() * that.scrollObject.children().length + window.innerWidth - 15 * that.scrollObject.children().length,
            max: 0,
            sensitivity: 1.5,

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
 * Directive loading
 */
app.directive('kkLoading', function () {
    return {
        scope: {
            loading: '='
        },
        restrict: 'E',
        template: '' +
        '<div class="loading" ng-show="loading">' +
        '   <div class="loading-bar loading-bounce kk-animate" ng-class="{\'kk-t2b-show\': loading}">' +
        '       <div class="in"></div>' +
        '       <div class="out"></div>' +
        '   </div>' +
        '</div>',
        replace: true
    }
});

/**
 * Directive message
 */
app.directive('kkMessage', function () {
    return {
        scope: {
            message: '='
        },
        restrict: 'E',
        template: '' +
        '<div class="message" ng-show="message" kk-tap="closeMessage()">' +
        '   <div class="message-bar kk-animate" ng-class="{\'kk-t2b-show\': message}">' +
        '       <p ng-bind="message"></p>' +
        '       <button class="close hidden">' +
        '           <span aria-hidden="true" kk-tap="closeMessage()">&times;</span>' +
        '       </button>' +
        '   </div>' +
        '</div>',
        replace: true,
        link: function (scope) {
            scope.closeMessage = function () {
                scope.message = null;
            };
        }
    }
});

/**
 * Directive sms
 */
app.directive('kkSms', ['genericService', 'genericFactory', function (genericService, genericFactory) {

    var command = {
        scope: false,
        restrict: 'A'
    };

    command.link = function (scope, elem, attrs) {

        var time = attrs.smsTime || 60;
        var type = attrs.smsType;
        var uri = 'general/ajax-sms';

        var alloy = {};

        alloy.tap = function () {

            // disabled
            if (typeof elem.attr('disabled') !== 'undefined') {
                return null;
            }

            genericFactory.loading = true;

            var data = {
                api: uri,
                post: {
                    phone: attrs.kkSms,
                    type: type
                }
            };

            data.success = function () {
                genericFactory.loading = false;
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
                genericFactory.loading = false;
                genericFactory.message = result.info;
            };

            scope.request(data);
        };
        new AlloyFinger(elem[0], alloy);
    };

    return command;
}]);

/**
 * Directive menu
 */
app.directive('kkMenu', ['genericService', function (genericService) {

    var command = {
        scope: {},
        restrict: 'A'
    };

    command.link = function (scope, elem, attrs) {
        var menu = $(attrs.kkMenu);
        var pos = genericService.offset(elem[0]);

        var padding = parseInt(menu.css('paddingLeft')) + parseInt(menu.css('paddingRight'));

        menu.css({
            left: pos.left - parseInt(menu.width()) - padding + parseInt(elem.width()),
            top: pos.top + pos.height + 15
        });

        new AlloyFinger(elem[0], {
            tap: function () {
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
app.directive('kkFixed', ['genericService', function (genericService) {

    var command = {
        scope: {},
        restrict: 'A'
    };

    command.link = function (scope, elem, attrs) {

        var prefixHeight = parseInt(attrs.kkFixed) || 0;
        var pos = genericService.offset(elem[0]);

        var fillBoxClass = attrs.fixedBox || 'fixed-fill-box';
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
        var tabElements = elem.find(attrs.tabElement || '*');
        var tab = [];
        var tabElement = [];
        tabElements.each(function () {
            var tabDiv = $(this).attr('tab-card');

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
                    var tabDiv = $(this).attr('tab-card');
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
app.directive('kkAjaxLoad', ['genericService', 'genericFactory', '$compile', function (genericService, genericFactory, $compile) {

    var command = {
        scope: false,
        restrict: 'A'
    };

    command.link = function (scope, elem, attrs) {
        genericService.reachBottom(function () {

            if (elem.attr('data-over')) {
                return null;
            }

            var page = parseInt(elem.attr('data-page'));
            page = page ? page : 2;

            var data = attrs.extraParams;
            data = data ? genericService.parseQueryString(data) : {};
            data.page = page;

            scope.request({
                api: attrs.kkAjaxLoad,
                post: data,
                success: function (res) {

                    var over = function () {
                        elem.attr('data-over', true);
                        if (attrs.blankMessage) {
                            genericFactory.message = attrs.blankMessage;
                        }
                        return null;
                    };

                    genericService.isEmpty(res.data.html) && over();

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
 * Service for data
 */
app.factory('genericFactory', ['$timeout', function ($timeout) {
    return {
        message: null,
        loading: false
    };
}]);

/**
 * Controller
 */
app.controller('generic', ['$scope', '$q', '$timeout', 'genericService', 'genericFactory', function ($scope, $q, $timeout, genericService, genericFactory) {

    $scope.service = genericService;
    $scope.factory = genericFactory;

    $scope.conf = {
        ajaxLock: {}
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
            if (!lock[api] || genericService.time() > lock[api]) {
                lock[api] = genericService.time() + 1000; // 1 second
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
            option.loading =  true;
        }

        if (!$scope.ajaxLock(option.api)) {
            return false;
        }

        if (option.loading) {
            $scope.factory.loading = true;
        }

        $scope.service.ajaxPost(option.api, option.post, function (error) {

            $scope.factory.loading = false;
            $scope.factory.message = error;

        }).then(function (result) {

            $scope.factory.loading = false;
            if (!$scope.service.isEmpty(result.info)) {
                $scope.factory.message = result.info;
            }

            option.success && option.success(result);
        }, function (result) {

            $scope.factory.loading = false;

            if (option.fail) {
                option.fail(result);
            } else {
                $scope.factory.message = result.info;
            }
        });
    };
}]);