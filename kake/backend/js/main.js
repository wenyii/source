/**
 * JS工具包
 *
 * @author Leon <1113692008@qq.com>
 * @copyright 2016-12-05 16:55:47
 */
(function ($) {

    conf = {
        ajaxLock: {}
    };

    /**
     * 操作 Cookie
     */
    $.cookie = {
        set: function (name, value, time, domain) {
            var expires = new Date();
            if (!time) {
                time = 86400 * 365; // 1年
            }
            expires.setTime(expires.getTime() + time * 1000);
            if ($._isEmpty(domain)) {
                domain = '';
            } else {
                domain = '; domain=' + domain;
            }
            document.cookie = name + '=' + escape(value) + '; expires=' + expires.toGMTString() + '; path=/' + domain;
        },
        get: function (name) {
            var cookieArray = document.cookie.split('; ');
            for (var i = 0; i < cookieArray.length; i++) {
                var arr = cookieArray[i].split('=');
                if (arr[0] === name) {
                    return unescape(arr[1]);
                }
            }
            return false;
        },
        delete: function (name, domain) {
            if ($._isEmpty(domain)) {
                domain = '';
            } else {
                domain = '; domain=' + domain;
            }
            document.cookie = name + '=; expires=' + (new Date(0)).toGMTString() + '; path=/' + domain;
        }
    };

    /**
     * 远程ajax异步get请求
     *
     * @param url
     * @param callback
     * @return boolean
     */
    $.sendGetAsync = function (url, callback) {
        if (!$.ajaxLock(url)) {
            return false;
        }
        var requestUrl = $.handleUrl(url);
        $.get(requestUrl, function (result) {
            $.ajaxLock(url, 1);
            result = $.safeEval(result);

            if (callback) {
                callback(result);
            }
        });
    };

    /**
     * 远程ajax同步
     *
     * @param url
     * @param timeoutCallback
     * @return boolean
     */
    $.sendGetSync = function (url, timeoutCallback) {
        if (!$.ajaxLock(url)) {
            return false;
        }
        var requestUrl = $.handleUrl(url);
        var obj = $.ajax({
            url: requestUrl,
            async: false,
            timeout: 5000
        });
        $.ajaxLock(url, 1);

        if (obj.responseText) {
            $.safeEval(obj.responseText);
        } else {
            if (timeoutCallback) {
                timeoutCallback('request timeout, please try again');
            } else {
                $.alert('request timeout, please try again');
            }
        }
    };

    /**
     * 远程ajax异步post请求
     *
     * @param url
     * @param postData
     * @param callback
     * @param timeoutCallback
     * @return boolean
     */
    $.sendPost = function (url, postData, callback, timeoutCallback) {
        if (!$.ajaxLock(url)) {
            return false;
        }
        if (($._isJson(postData) && $.jsonLength(postData) === 0) || !postData) {
            postData = {
                ajaxTime: $.time(false)
            };
        }
        var requestUrl = $.handleUrl(url);
        $.ajax({
            type: 'POST',
            url: requestUrl,
            async: true,
            data: postData,
            timeout: 30000,
            success: function (result) {
                $.ajaxLock(url, 1);
                result = $.safeEval(result);

                if (callback) {
                    callback(result);
                }
            },
            error: function (obj) {
                $.ajaxLock(url, 1);

                if (obj.responseText) {
                    $.alert('[' + obj.status + '] ' + obj.statusText);
                } else {
                    if (timeoutCallback) {
                        timeoutCallback('request timeout, please try again');
                    } else {
                        $.alert('request timeout, please try again');
                    }
                }
            }
        });
    };

    /**
     * 远程AJAX跨域请求
     *
     * @param url 请求url
     * @param callback 请求成功的回调
     * @param jsonPCallback jsonP函数名
     * @param timeoutCallback 请求超时的回调
     * @return boolean
     */
    $.sendJsonP = function (url, callback, jsonPCallback, timeoutCallback) {
        if (!$.ajaxLock(url)) {
            return false;
        }
        var requestUrl = $.handleUrl(url);
        $.ajax({
            type: 'get',
            async: false,
            url: requestUrl,
            timeout: 30000,
            dataType: "jsonp",
            jsonPCallback: jsonPCallback,
            success: function (data) {
                $.ajaxLock(url, 1);
                data = $.safeEval(data);

                if (callback) {
                    callback(data);
                }
            },
            error: function (obj) {
                $.ajaxLock(url, 1);

                if (obj.responseText) {
                    $.safeEval(obj.responseText);
                } else {
                    if (timeoutCallback) {
                        timeoutCallback('request timeout, please try again');
                    } else {
                        $.alert('request timeout, please try again');
                    }
                }
            }
        });
    };

    /**
     * 非ajax且无form表单时的post/get提交请求
     *
     * @param url 请求提交的地址
     * @param params 提交的参数数组
     * @param type 请求类型
     * @return boolean
     */
    $.sendRequest = function (url, params, type) {
        type = type ? type.toLowerCase() : 'post';
        if (type !== 'post' && type !== 'get') {
            return false;
        }
        var temp = document.createElement('form');
        temp.action = url;
        temp.method = type;
        temp.style.display = 'none';
        for (var x in params) {
            if (!params.hasOwnProperty(x)) {
                continue;
            }
            var opt = document.createElement('textarea');
            opt.name = x;
            opt.value = params[x];
            temp.appendChild(opt);
        }
        document.body.appendChild(temp);
        temp.submit();

        return true;
    };

    /**
     * 锁定ajax请求以防重复发送
     *
     * @param url 请求地址
     * @param unlock 是否为解锁操作
     * @return boolean
     */
    $.ajaxLock = function (url, unlock) {
        if (unlock) {
            conf.ajaxLock.url = 0;
            return false;
        } else {
            if (!conf.ajaxLock.url || $.time(true) > conf.ajaxLock.url) {
                conf.ajaxLock.url = $.time(true) + 1; // 1秒内
                return true;
            } else {
                return false;
            }
        }
    };

    /**
     * url处理
     *
     * @param url 需要处理的url
     * @return string
     */
    $.handleUrl = function (url) {
        if (url.indexOf('ajaxtime=') !== -1) {
            url = url.replace(/[\?\&]ajaxtime=\d+/, '');
        }
        url += (url.indexOf('?') !== -1 ? '&ajaxtime=' : '?ajaxtime=') + $.time(false);

        return url;
    };

    /**
     * 强化版提示错误信息
     *
     * @param str 提示信息字符串
     * @param type 提示信息类型
     */
    $.safeEval = function (str, type) {
        if (!str) {
            return false;
        }
        type = type || 'json';

        // 后端报错处理
        if (str.toString().match(/notice|warring|fatal error|exception|undefined|array|<pre>/i)) {
            $.alert(str.toString(), 'info', 600);
            return false;
        } else {
            if (type === 'json' && (!$._isString(str))) {
                return str;
            } else {
                var result;
                try {
                    result = eval('(' + str + ')');
                } catch (e) {
                    result = e;
                }

                return result;
            }
        }
    };

    /**
     * 判断函数
     */
    $._isArray = function (val) {
        if (null === val) {
            return false;
        }
        return typeof val === 'object' && val.constructor === Array;
    };

    $._isObject = function (val) {
        if (null === val) {
            return false;
        }
        return typeof val === 'object' && val.constructor === Object;
    };

    $._isJson = function (val) {
        if (null === val) {
            return false;
        }
        return typeof val === 'object' && Object.prototype.toString.call(val).toLowerCase() === '[object object]';
    };

    $._isString = function (val) {
        if (null === val) {
            return false;
        }
        return typeof val === 'string' && val.constructor === String;
    };

    $._isNumeric = function (val) {
        if (null === val || '' === val) {
            return false;
        }
        return !isNaN(val);
    };

    $._isBoolean = function (val) {
        if (null === val) {
            return false;
        }
        return typeof val === 'boolean' && val.constructor === Boolean;
    };

    $._isFunction = function (val) {
        if (null === val) {
            return false;
        }
        return typeof val === 'function' && Object.prototype.toString.call(val).toLowerCase() === '[object function]';
    };

    $._isEmptyJson = function (val) {
        return JSON.stringify(val) === '{}';
    };

    $._cloneJson = function (val) {
        return JSON.parse(JSON.stringify(val));
    };

    $._mergeJson = function () {
        var evalString = '';
        for (var key in arguments) {
            if (!arguments.hasOwnProperty(key)) {
                continue;
            }
            if (!$._isEmptyJson(arguments[key])) {
                evalString += JSON.stringify(arguments[key]);
            }
        }
        return eval('(' + evalString.replace(/}{/g, ',') + ')');
    };

    $._isEmpty = function (val, outNumZero) {
        if (typeof val === 'undefined' || val === null) {
            return true;
        }
        if ($._isNumeric(val) && outNumZero) {
            return Number(val) === 0;
        } else if ($._isString(val)) {
            return val.trim() === '';
        } else if ($._isJson(val)) {
            return $.jsonLength(val) === 0;
        } else if ($._isArray(val) || $._isObject(val)) {
            return val.length === 0;
        }
        return !val;
    };

    $._isIE = function () {
        return /msie/.test(navigator.userAgent.toLowerCase());
    };

    /**
     * 获取当前时间戳
     *
     * @param sec 为真返回10位(秒)数时间戳 否则返回13位(微秒)
     * @return int
     */
    $.time = function (sec) {
        var time = new Date().getTime();
        return sec ? Math.ceil(time / 1000) : time;
    };

    /**
     * 获取变量json的长度
     *
     * @param json 要计算长度的json数据
     * @return int
     */
    $.jsonLength = function (json) {
        var length = 0;
        $.each(json, function () {
            length++;
        });
        return length;
    };

    /**
     * json转string
     *
     * @param json json对象
     * @return string
     */
    $.jsonToString = function (json) {
        if (!$._isIE() && JSON !== 'undefined') {
            return JSON.stringify(json);
        } else {
            var arr = [];
            $.each(json, function (key, val) {
                var next = '\'' + key + '\':\'';
                next += $.isPlainObject(val) ? $.jsonToString(val) : val;
                next += '\'';
                arr.push(next);
            });
            return '{' + arr.join(', ') + '}';
        }
    };

    /**
     * 弹出对象 - 测试专用
     *
     * @param val 测试变量
     * @param old 是否使用传统alert
     * @return void
     */
    $.dump = function (val, old) {
        if (typeof old === 'undefined') {
            old = true;
        }
        if ($._isObject(val)) {
            if (!$._isIE() && typeof JSON !== 'undefined') {
                val = JSON.stringify(val);
            } else {
                var arr = [];
                $.each(val, function (key, val) {
                    var next = key + ':';
                    next += $.isPlainObject(val) ? $.jsonToString(val) : val;
                    arr.push(next);
                });
                val = '{' + arr.join(',') + '}';
            }
        }
        old ? alert(val) : $.alert(val);
    };

    /**
     * 绑定键盘keyDown事件
     *
     * @param num 绑定键对应的键码数值
     * @param callback 回调函数
     * @param obj 绑定的对象元素
     * @param ctrl 是否需要回车键支持
     * @return void
     */
    $.keyBind = function (num, callback, obj, ctrl) {
        obj = obj || $(document);
        obj.unbind('keydown').bind('keydown', function (event) {
            if (ctrl) {
                if (event.keyCode === num && event.ctrlKey && callback) {
                    callback();
                }
            } else {
                if (event.keyCode === num && callback) {
                    callback();
                }
            }
        });
    };

    /**
     * 给Array类追加prototype的方法
     */
    Array.prototype.each = function (callback) { // 数组迭代器
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

    Array.prototype.contains = function (element) { // 是否包含指定元素
        var self = this;
        for (var i = 0; i < self.length; i++) {
            if (self[i] === element) {
                return true;
            }
        }
        return false;
    };

    Array.prototype.uniquelize = function () { // 数组去重
        var ra = [];
        for (var i = 0; i < this.length; i++) {
            if (!ra.contains(this[i])) {
                ra.push(this[i]);
            }
        }
        return ra;
    };

    Array.prototype.remove = function (val) { // 删除指定值
        var index = this.indexOf(val);
        if (index > -1) {
            this.splice(index, 1);
        }
        return this;
    };

    Array.prototype.swap = function (first, last) { // 交互索引
        this[first] = this.splice(last, 1, this[first])[0];
        return this;
    };

    Array.prototype.up = function (index) { // 前移
        if (index === 0) {
            return this;
        }
        return this.swap(index, index - 1);
    };

    Array.prototype.down = function (index) { // 后移
        if (index === this.length - 1) {
            return this;
        }
        return this.swap(index, index + 1);
    };

    Array.complement = function (a, b) { // 数组补集
        return Array.minus(Array.union(a, b), Array.intersect(a, b));
    };

    Array.intersect = function (a, b) { // 数组交集
        return a.uniquelize().each(function (o) {
            return b.contains(o) ? o : null;
        });
    };

    Array.minus = function (a, b) { // 数组差集
        return a.uniquelize().each(function (o) {
            return b.contains(o) ? null : o;
        });
    };

    Array.union = function (a, b) { // 数组并集
        return a.concat(b).uniquelize();
    };

    /**
     * 给String类追加prototype的方法
     *
     * @return string
     */
    String.prototype.trim = function () { // 字符串去除左右空格
        return this.replace(/(^\s*)|(\s*$)/g, '');
    };

    /**
     * select框选中指定
     *
     * @param obj jquery选中的select对象
     * @param val 要选中值为val的option
     * @return void
     */
    $.selectPos = function (obj, val) {
        obj.find('option').removeAttr('selected');
        if (typeof val !== 'undefined') {
            $.each(obj.find('option'), function () {
                if ($(this).val() === val) {
                    $(this).attr('selected', true).prop('selected', true);
                    return false;
                }
            });
        }
    };

    /**
     * 改变checkbox状态
     *
     * @param object 复选框
     * @param value 值
     * @param callback 选完后的回调函数
     * @return void
     */
    $.checkboxChange = function (object, value, callback) {
        object.prop('checked', value);
        object.attr('checked', value);
        callback && callback();
    };

    /**
     * checkbox全选
     *
     * @param object 点击对象
     * @param name checkbox名称
     * @param callback 选完后的回调函数
     * @return void
     */
    $.checkboxAllSelect = function (object, name, callback) {

        var obj = $('input[name="' + name + '"]');
        var checked = $(this).attr('checked');

        $.checkboxChange(obj, !checked);
        $(this).attr('checked', !checked);
        callback && callback();
    };

    /**
     * checkbox全选
     *
     * @param object 点击对象
     * @param name checkbox名称
     * @param callback 选完后的回调函数
     * @return void
     */
    $.checkboxReverseSelect = function (object, name, callback) {

        $('input[name="' + name + '"]').each(function () {
            $.checkboxChange($(this), !$(this).is(':checked'));
        });
        callback && callback();
    };

    /**
     * 获取选中的checkbox的值
     *
     * @param name
     * @returns array
     */
    $.checkboxValues = function (name) {

        var values = [];

        $('input[name="' + name + '"]').each(function () {
            $(this).is(':checked') && values.push($(this).val());
        });

        return values.uniquelize();
    };

    $.getCss = function (css) {
        var elem = document.createElement("link");
        elem.setAttribute("rel", "stylesheet");
        elem.setAttribute("type", "text/css");
        elem.setAttribute("href", css);
        document.getElementsByTagName("head")[0].appendChild(elem);
    };

    $.jsonToUrl = function (obj) {
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
})(jQuery);

/**
 * 项目适配功能代码
 *
 * @author Leon <1113692008@qq.com>
 * @copyright 2016-12-06 09:56:25
 */
$(function () {

    var body = $('body');
    var csrfKey = $('meta[name="csrf-param"]').attr('content');
    var csrfToken = $('meta[name="csrf-token"]').attr('content');

    $.alert = function (message, level, time) {
        level = level || 'warning';
        time = time || 60;
        var id = $.time(false);
        var tpl = '' +
            '<div id="' + id + '" class="alert alert-' + level + ' bigtosmall alert-dismissible" role="alert">' +
            '    <button type="button" class="close" data-dismiss="alert">' +
            '        <span aria-hidden="true">&times;</span>' +
            '        <span class="sr-only">Close</span>' +
            '    </button>' + message +
            '</div>';
        $('div#message').append(tpl);

        setTimeout(function () {
            id = $('#' + id);
            id.fadeOut(500, function () {
                id.remove();
            });
        }, time * 1000);
    };

    // 弹出页面 - 基于模态框
    $.showPage = function (api, params, method) {

        // 组织请求数据
        var postData = {};

        method = (method || 'get').toLowerCase();
        api = api.split('.');

        var query = '';
        if (method === 'get') {
            query = $._isJson(params) ? '&' + $.jsonToUrl(params) : '';
            postData[csrfKey] = csrfToken;
        } else {
            params[csrfKey] = csrfToken;
            postData = params;
        }
        $.sendPost(requestUrl + api[0] + '/ajax-modal-' + api[1] + query, postData, function (data) {
            if (!data.state) {
                $.alert(data.info, 'danger');
            } else {
                $.placeModal({
                    id: 'show-page',
                    title: data.data.title,
                    message: data.data.message,
                    yes: null,
                    no: null
                }).modal({
                    backdrop: 'static',
                    keyboard: false
                });
            }
        });
    };

    // 布置一个模态框
    $.placeModal = function (options) {

        options.size = options.size || 'lg';
        if ($.inArray(options.size, ['xs', 'sm', 'md', 'lg']) === false) {
            $.alert('模态框 size 参数不在可选范围内');
            return null;
        }

        options.title = options.title || '友情提示';
        options.message = options.message || '是否继续?';

        var yes = '';
        if (options.yes !== null) {
            options.yes = options.yes || '确定';
            yes = '<button type="button" class="btn btn-primary yes">' + options.yes + '</button>';
        }

        var no = '';
        if (options.no !== null) {
            options.no = options.no || '取消';
            no = '<button type="button" class="btn btn-default no" data-dismiss="modal">' + options.no + '</button>';
        }

        var footer = (yes || no) ? '<div class="modal-footer">' + no + yes + '</div>' : '';

        options.yesCallback = options.yesCallback || null;
        options.noCallback = options.noCallback || null;

        var tpl = '' +
            '<div class="modal fade" id="' + options.id + '" tabindex="-1">' +
            '   <div class="modal-dialog modal-' + options.size + '" role="document">' +
            '       <div class="modal-content">' +
            '           <div class="modal-header">' +
            '               <button type="button" class="close" data-dismiss="modal" aria-label="Close">' +
            '                   <span aria-hidden="true">&times;</span>' +
            '               </button>' +
            '               <h4 class="modal-title">' + options.title + '</h4>' +
            '           </div>' +
            '           <div class="modal-body">' + options.message + '</div>' + footer +
            '       </div>' +
            '   </div>' +
            '</div>';

        $('#' + options.id).remove();
        body.append(tpl);

        var modal = $('#' + options.id);
        modal.find('.modal-footer .yes').unbind('click').bind('click', function () {
            var result = true;
            if (options.yesCallback) {
                result = options.yesCallback(modal);
                result = (typeof result === 'undefined') ? true : result;
            }
            result && modal.find('.close').click();
        });

        if (options.no) {
            modal.find('.modal-footer .no').unbind('click').bind('click', options.noCallback);
        }

        modal.on('hidden.bs.modal', function () {
            modal.remove();
        });

        modal.find('[data-toggle="tooltip"]').tooltip();

        return modal;
    };

    // 导航部分
    $('.nav-sidebar > li > a').click(function () {
        var li = $(this).parent('li');
        li.siblings('li').removeClass('active');
        li.addClass('active');

        li.siblings('li').find('ul').slideUp(100);
        $(this).next('ul').slideToggle(100);
    });

    // 提示气泡
    $('[data-toggle="tooltip"]').tooltip();

    // 收起/展现菜单
    $.toggleMenu = function () {
        var menu = $('#menu-div');
        var content = $('#content-div');

        if (menu.hasClass('hidden')) {
            menu.stop().fadeIn('fast', function () {
                menu.removeClass('hidden');
                content.attr('class', 'col-sm-9 col-sm-offset-3 col-md-10 col-md-offset-2 main');
                $.sendGetSync(requestUrl + 'general/ajax-hide-menu&hide=0');
            });
        } else {
            menu.stop().fadeOut('fast', function () {
                menu.addClass('hidden');
                content.attr('class', 'col-sm-12 col-md-12 main');
                $.sendGetSync(requestUrl + 'general/ajax-hide-menu&hide=1');
            });
        }
    };

    // 收起/打开菜单栏 ctrl + enter
    $('#menu-toggle').click(function () {
        $.toggleMenu();
    });

    // 上传附件
    $.uploadAttachment = function (options) {
        new AjaxUpload($(options.triggerTarget), {
            action: options.action,
            name: 'ajax',
            autoSubmit: true,
            responseType: 'json',
            accept: '*',
            data: options.data,
            onComplete: function (file, response) {

                if (!response.state) {
                    $.alert(response.info, 'danger');
                    return null;
                }

                options.data = response.data;
                if (options.data.crop) {
                    $.showPage('general.crop', options, 'post');
                } else {
                    $.handleUpload(options);
                }
            }
        });
    };

    // 上传后处理
    $.handleUpload = function (options) {
        if ($.createThumb(options)) {
            var attachmentElem = $('input[name="' + options.attachmentName + '"]');

            // 允许多张图片上传
            if (parseInt(options.multiple)) {

                // 需提交的附件ids
                var ids = attachmentElem.val().split(',').uniquelize().remove('');
                ids.push(options.data.id);
                attachmentElem.val(ids.join(','));
            } else {
                attachmentElem.val(options.data.id);
            }
        }
    };

    // 生成附件预览
    $.createThumb = function (options) {

        if (!options.data.id || !options.data.url) {
            return null;
        }

        var previewObj = $('div[name="' + options.previewName + '"]');
        if (!parseInt(options.multiple)) {
            previewObj.html('');
        }

        var action = '';
        if (options.action) {
            action = '' +
                '<div class="action-btn">' +
                '   <span ' +
                '       class="glyphicon glyphicon-trash remove" ' +
                '       id="' + options.data.id + '" ' +
                '       name="' + options.attachmentName + '" ' +
                '       title="删除"></span>' +
                ' </div>';
        }

        previewObj.append('' +
            '<div class="col-sm-' + options.previewLabel + '">' +
            '   <a href="javascript:void(0)" class="thumbnail sortable-box">' + action +
            '       <img src="' + options.data.url + '?' + $.time() + '">' +
            '   </a>' +
            '</div>');

        return true;
    };

    // 拖拽排序
    $.sortable = function (htmlSelector, inputSelector) {
        var htmlBox = $(htmlSelector)[0];
        Sortable.create(htmlBox, {
            group: 'slave',
            animation: 200,
            onEnd: function (e) {
                var _old = e.oldIndex - 1;
                var _new = e.newIndex - 1;
                if (_new !== _old) {
                    var valueBox = $(inputSelector);
                    var value = valueBox.val().split(',');

                    // 从拖拽的元素开始动手
                    if (_old < _new) { // 往后排
                        for (var k = _old; k < _new; k++) {
                            value.down(k);
                        }
                    } else if (_old > _new) { // 往前排
                        for (var v = _old; v > _new; v--) {
                            value.up(v);
                        }
                    }

                    valueBox.val(value.join(','));
                }
            }
        });
    };

    // 处理模态框页面表单
    $.handleModalForm = function (form, handleFormDataFn, callbackObj) {
        var data = {};
        $.each(form.serializeArray(), function () {
            data[this.name] = this.value;
        });

        var close = true;
        if (handleFormDataFn) {
            var result = handleFormDataFn(data);
            if ($._isString(result)) {
                close = false;
                $.alert(result);
                return false;
            } else if (typeof result !== 'undefined') {
                close = !!result;
                data = $._isJson(result) ? result : data;
            }
        }

        if (callbackObj) {
            callbackObj.params.data = data;
            callbackObj.fn(callbackObj.params);
        }

        if (close) {
            form.parent().prev().find('.close').click();
        }

        return false;
    };

    // 将模态框中选定的 radio 值放到 input 中
    $.modalRadioValueToInput = function (radioName, inputName) {
        var value = $('input[name="' + radioName + '"]:checked').val();

        if ($._isEmpty(value)) {
            $.alert('请先选择数据');
            return null;
        }

        $('input[name="' + inputName + '"]').val(value).change();
        $('#show-page').find('.close').click();
    };

    // 将模态框中选定的 checkbox 值放到 input 中
    $.modalCheckboxValueToInput = function (checkboxName, inputName, split) {
        split = split || ',';
        var value = $.checkboxValues(checkboxName);

        if ($._isEmpty(value)) {
            $.alert('请先选择数据');
            return null;
        }

        $('input[name="' + inputName + '"]').val(value.join(split)).change();
        $('#show-page').find('.close').click();
    };

    // 生成标签
    $.createTag = function (options) {

        var tagContainer = $('div[name="' + options.containerName + '"]');
        var format = tagContainer.attr('format');

        var tagInfo;
        if (format.trim() !== '') {
            $.each(options.data, function (key, value) {
                format = format.replace(eval('/\{' + key + '\}/g'), value);
            });
            tagInfo = format;
        } else {
            tagInfo = $.param(options.data);
        }

        var field;
        var id = '';
        var input = '';

        if (options.data.id) {
            id = 'id="' + options.data.id + '" name="' + options.fieldName + '"';
        } else {
            input = '<input type="hidden" name="' + options.fieldNameNew + '[]" value="' + $.param(options.data) + '">';
        }
        var tpl = '' +
            '<span class="alert alert-info field-tag">' + input +
            '   <p class="tag">' + tagInfo + '</p>' +
            '   <span class="glyphicon glyphicon-trash remove" ' + id + ' aria-hidden="true"></span>' +
            '</span>';

        tagContainer.append(tpl);
    };

    // 删除预览附件/标签
    $.removeTag = function (removeSelector, deleteObjCallback) {
        body.on('click', removeSelector, function () {
            var id = $(this).attr('id');
            var name = $(this).attr('name');

            if (id && name) {
                var input = $('input[name="' + name + '"]');
                var ids = input.val().split(',').remove(id);
                input.val(ids.join(','));
            }

            deleteObjCallback($(this)).remove();
        });
    };

    $.removeTag('a.thumbnail span.remove', function (obj) {
        return obj.parent().parent().parent();
    });
    $.removeTag('span.field-tag span.remove', function (obj) {
        return obj.parent();
    });

    // ---

    // ajax 筛选
    $.ajaxFilterList = function (action) {
        body.on('click', '.filter button[type="submit"]', function (event) {
            event.preventDefault();

            var data = {};
            $.each($('form.filter').serializeArray(), function () {
                data[this.name] = this.value;
            });
            var url = baseUrl + '/?' + $.jsonToUrl(data);
            $.sendGetAsync(url, function (data) {
                $('#' + action).html(data.data.message);
            });
        });
    };

    // ajax 分页
    $.ajaxPageList = function (action) {
        body.on('click', '.pagination a', function (event) {
            event.preventDefault();

            var url = $(this).attr('href');
            $.sendGetAsync(url, function (data) {
                $('#' + action).html(data.data.message);
            });
        });
    };

    // 验证码手机号码
    $.checkPhone = function (phone) {
        if (!/^0?1[0-9]\d{9}$/.test(phone)) {
            $.alert('手机号码不正确', 'danger');
            return false;
        }
        return true;
    };

    // 获取验证码
    $('#get-captcha').click(function () {
        var phone = $('input[name="phone"]').val();

        if (!$.checkPhone(phone)) {
            return false;
        }

        // 组织请求数据
        var postData = {
            phone: phone,
            type: 1
        };
        postData[csrfKey] = csrfToken;

        $.sendPost(requestUrl + 'general/ajax-sms', postData, function (data) {
            $.alert(data.info, data.state ? 'success' : 'danger');
        });
    });

    // 登录功能
    $('form.form-signin input[type="button"]').click(function () {
        var phone = $('input[name="phone"]').val();
        var captcha = $('input[name="captcha"]').val();

        $.checkPhone(phone);

        if (captcha.length !== 8) {
            $.alert('验证码长度应为8位');
            return false;
        }

        // 组织请求数据
        var postData = {
            phone: phone,
            captcha: captcha
        };
        postData[csrfKey] = csrfToken;

        $.sendPost(requestUrl + 'login/ajax-login', postData, function (data) {
            if (!data.state) {
                $.alert(data.info, 'danger');
            } else {
                location.href = baseUrl;
            }
        });

        return false;
    });

    // 执行计划任务
    $('div.mission button, .mission-button').click(function () {

        var tag = $(this).attr('data-action-tag');
        var postData = {};
        postData[csrfKey] = csrfToken;

        $.placeModal({
            id: 'show-confirm',
            size: 'sm',
            message: '是否确定执行"' + $(this).text().trim() + '"操作?',
            yesCallback: function () {
                $.sendPost(requestUrl + 'mission/ajax-' + tag, postData, function (data) {
                    $.alert(data.info, data.state ? 'success' : 'danger');
                });
            }
        }).modal();
    });

    // 确认继续执行操作
    body.on('click', '.confirm-button', function (event) {
        event.preventDefault();

        var that = $(this);
        var info = that.attr('confirm-info');

        if (!info) {
            info = '是否确定执行"' + that.text().trim() + '"操作?';
        }

        $.placeModal({
            id: 'show-confirm',
            size: 'sm',
            message: info,
            yesCallback: function () {
                location.href = that.attr('href');
            }
        }).modal();
    });

    // 添加套餐 - 表单钩子
    $.package = function (record) {

        if ($._isEmpty(record.name)) {
            return '名称不能为空';
        }

        if (!$._isNumeric(record.price)) {
            return '价格必须为数字类型';
        }

        if (!$._isNumeric(record.purchase_limit)) {
            return '限购数量必须为数字类型';
        }

        if ($._isEmpty(record.info)) {
            return '简介不能为空';
        }

        return record;
    };

    // 拒绝理由 - 表单钩子
    $.instructions = function (record) {

        if ($._isEmpty(record.remark) || record.remark.length < 10) {
            return '请填写不少于 10 个字的备注';
        }

        var type = parseInt(record.type);
        var action;

        // 拒绝退款
        if (type === 1) {
            action = 'order-sub/refuse-refund';
        } else if (type === 2) { // 拒绝预约
            action = 'order-sub/refuse-order';
        }

        var postData = {
            order_sub_id: record.order_sub_id,
            remark: record.remark
        };
        postData[csrfKey] = csrfToken;

        $.sendRequest(requestUrl + action, postData);
    };

    // 产品分销时变更产品时自动填写开始销量
    $('.product_producer-product_id input, .product_producer-type select').change(function () {

        var productId = parseInt($('.product_producer-product_id input').val());
        var type = $('.product_producer-type select').val();

        if (isNaN(productId)) {
            $.alert('产品ID必须为正整数');
            return;
        }

        var url = requestUrl + 'product-producer/ajax-get-from-sales';
        $.sendGetAsync(url + '&product_id=' + productId + '&type=' + type, function (data) {
            if (data.state) {
                $('input[name="from_sales"]').val(data.data);
            } else {
                $.alert(data.info);
            }
        });
    });

    // 显示二维码
    $.showQrCode = function (url) {
        url = requestUrl + 'general/ajax-get-qr-code&url=' + encodeURIComponent(url);
        $.sendGetAsync(url, function (data) {
            $.placeModal({
                id: 'show-qr-code',
                size: 'sm',
                title: '扫描二维码',
                message: '<div style="text-align: center;">' + data.data + '</div>',
                yes: null,
                no: null
            }).modal();
        });
    };

    // 裁切图片
    $.crop = function (options) {

        var width = parseInt(options.width);
        var height = parseInt(options.height);

        var containerWidth = options.containerWidth || 500;
        var containerHeight = options.containerHeight || 400;

        var ratio = width / height;
        var submitBtn = $(options.submitBtn || '.crop-submit');
        var container = $(options.container || '#crop');
        var previewSelector = options.preview || '.crop-preview';

        var w, h;
        if (width > 300) {
            w = 300;
            h = (w / width) * height;
        } else {
            w = width;
            h = height;
        }

        $(previewSelector).css({
            width: w,
            height: h
        });

        container.cropper({
            aspectRatio: ratio,
            viewMode: 2,
            rotatable: false,
            minContainerWidth: containerWidth,
            minContainerHeight: containerHeight,
            preview: options.preview || '.crop-preview',
            ready: function () {
                $(this).cropper('setCropBoxData', {
                    left: 0,
                    top: 0,
                    width: w,
                    height: h
                });
            }
        });

        submitBtn.click(function () {
            var base64 = container.cropper('getCroppedCanvas', {
                width: width,
                height: height
            }).toDataURL();

            options.postData[csrfKey] = csrfToken;
            options.postData[options.base64Key || 'base64'] = base64;

            $.sendPost(requestUrl + 'general/ajax-save-crop', options.postData, function (data) {
                options.submitCallback(data);
                $('#crop-box').parent().prev().find('.close').click();
            });
        });
    };

    // 各字段综合排序
    $('span.sort-btn').click(function () {

        var index = ['natural', 'desc', 'asc'];
        var map = {
            natural: 'glyphicon-sort',
            desc: 'glyphicon-sort-by-alphabet-alt',
            asc: 'glyphicon-sort-by-alphabet'
        };

        var that = $(this);
        var sortIndex = parseInt(that.attr('sort-index')) || 0;
        var nextIndex = (sortIndex >= index.length - 1) ? 0 : (sortIndex + 1);
        that.attr('sort-index', nextIndex);

        var sortQuery = '';
        $('span.sort-btn').each(function () {
            var name = $(this).attr('sort-name');
            var sortNo = parseInt($(this).attr('sort-index'));
            var sort = index[sortNo];

            if (sortNo > 0) {
                sortQuery += ',' + name + ' ' + sort;
            }
        });

        sortQuery = encodeURI(sortQuery.substring(1));

        var url = location.href;
        sortQuery = sortQuery.trim() === '' ? '' : ('&sorter=' + sortQuery);

        if (url.indexOf('sorter=') !== -1) {
            url = url.replace(/[?|&]sorter=([^&]*)/, sortQuery)
        } else {
            url += sortQuery;
        }

        location.href = url;
    });
});