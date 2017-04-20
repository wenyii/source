var app = angular.module('kkApp', []);

/**
 * Service
 */
app.service('generic', function ($http, $q) {

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
    String.prototype.trim = function () {
        return this.replace(/(^\s*)|(\s*$)/g, '');
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

    this.isArray = function (val) {
        if (null === val) {
            return false;
        }
        return typeof val === 'object' && val.constructor === Array;
    };

    this.isObject = function (val) {
        if (null === val) {
            return false;
        }
        return typeof val === 'object' && val.constructor === Object;
    };

    this.isJson = function (val) {
        if (null === val) {
            return false;
        }
        return typeof val === 'object' && Object.prototype.toString.call(val).toLowerCase() === '[object object]';
    };

    this.isString = function (val) {
        if (null === val) {
            return false;
        }
        return typeof val === 'string' && val.constructor === String;
    };

    this.isNumeric = function (val) {
        if (null === val || '' === val) {
            return false;
        }
        return !isNaN(val);
    };

    this.isBoolean = function (val) {
        if (null === val) {
            return false;
        }
        return typeof val === 'boolean' && val.constructor === Boolean;
    };

    this.isFunction = function (val) {
        if (null === val) {
            return false;
        }
        return typeof val === 'function' && Object.prototype.toString.call(val).toLowerCase() === '[object function]';
    };

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

    this.offset = function (obj) {
        return {
            left: obj.offsetLeft,
            top: obj.offsetTop,
            width: obj.offsetWidth,
            height: obj.offsetHeight
        };
    };

    // 发送 POST AJAX 请求
    this.ajaxPost = function (uri, params) {

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
            that.message('An error occurred, try again later.');
        });

        return defer.promise;
    };
});

/**
 * Config
 */
app.config(function ($httpProvider) {

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
});

/**
 * Directive tap replace ng-click
 */
app.directive('kkTap', ['$parse', function ($parse) {

    var command = {
        restrict: 'A'
    };

    command.cmpile = function ($element, attr) {
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
        elem.bind('click', function () {
            elem.addClass(cls);
            setTimeout(function () {
                elem.removeClass(cls);
            }, 500);
        });
    };

    return command;
});

/**
 * Directive sms
 */
app.directive('kkSms', function () {

    var command = {
        scope: true,
        restrict: 'A'
    };

    command.link = function (scope, elem, attrs) {

        var time = attrs.smsTime || 60;
        var type = attrs.smsAction || 'frontend-register';
        var uri = 'general/ajax-sms';

        var alloy = {};

        alloy.tap = function () {

            // disabled
            if (typeof elem.attr('disabled') !== 'undefined') {
                return null;
            }

            scope.loading = true;

            var data = {
                api: uri,
                post: {
                    phone: attrs.kkSms,
                    type: type
                }
            };

            data.success = function () {
                scope.loading = false;
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
                scope.loading = false;
                scope.$parent.message = result.info;
            };

            scope.request(data);
        };
        new AlloyFinger(elem[0], alloy);
    };

    return command;
});

/**
 * Directive focus
 */
app.directive('kkFocus', ['generic', function (generic) {

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
            return generic.message('[kk-focus] Current element must has attribute `id`!');
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
app.directive('kkScroll', ['generic', function (generic) {

    var command = {
        scope: {},
        restrict: 'A'
    };

    command.link = function (scope, elem, attrs) {

        var that = this;

        if (!attrs.id) {
            return generic.message('[kk-scroll] Current element must has attribute `id`!');
        }

        this.scrollObject = elem.children();
        this.imageObject = this.scrollObject.children();

        this.marginAndPadding = parseInt(this.scrollObject.css('marginLeft')) * 2
        + parseInt(this.scrollObject.css('paddingLeft')) * 2
        + parseInt(this.imageObject.find('img').css('marginLeft'))
        + parseInt(this.imageObject.find('img').css('paddingLeft'));

        Transform(this.scrollObject[0]);
        new AlloyTouch({
            touch: '#' + attrs.id,
            vertical: false,
            target: that.scrollObject[0],
            property: 'translateX',
            min: -that.scrollObject.width() + window.innerWidth - this.marginAndPadding,
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
        scope: true,
        restrict: 'E',
        template: '' +
        '<div class="loading" ng-if="loading">' +
        '   <div class="loading-bar loading-bounce kk-animate" ng-class="{ \'kk-t2b-show\': loading}">' +
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
        scope: true,
        restrict: 'E',
        template: '' +
        '<div class="message kk-animate" ng-show="message" ng-class="{ \'kk-t2b-show-message\': $parent.message}">' +
        '   <p ng-bind="message"></p>' +
        '   <button class="close">' +
        '       <span aria-hidden="true" ng-click="$parent.message=null">&times;</span>' +
        '   </button>' +
        '</div>',
        replace: true
    }
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
 * Controller
 */
app.controller('generic', function ($scope, $q, $timeout, generic) {

    $scope.service = generic;

    $scope.loading = false;
    $scope.message = null;
    $scope.search = null;

    $scope.conf = {
        messageStay: 2500,
        ajaxLock: {}
    };

    /**
     * Close message
     *
     * @param newValue
     * @param oldValue
     */
    $scope.$watch('message', function (newValue, oldValue, scope) {
        if (newValue !== null && oldValue === null) {
            $timeout(function () {
                scope.message = null;
            }, $scope.conf.messageStay);
        }
    });

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
            if (!lock[api] || generic.time() > lock[api]) {
                lock[api] = generic.time() + 1000; // 1 second
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
        var service = $scope.service;
        option.loading = option.loading || true;

        if (!$scope.ajaxLock(option.api)) {
            return false;
        }

        if (option.loading) {
            $scope.loading = true;
        }

        service.ajaxPost(option.api, option.post).then(function (result) {

            $scope.loading = false;
            $scope.message = result.info;

            option.success && option.success(result);
        }, function (result) {

            $scope.loading = false;

            if (option.fail) {
                option.fail(result);
            } else {
                $scope.message = result.info;
            }
        });
    };
});
    /**
     * 菜单点击展开关闭
     */
$(document).ready(function () {
    var menu = true;
    $(".menu").on("touchstart", function () {
        if (menu == true) {
            $(".menu-1").css('display', 'block');
            menu = !menu;
        }
        else {
             $(".menu-1").hide(1000);
            menu = !menu;
        }
    });
});