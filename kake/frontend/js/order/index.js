/**
 * 控制器 - 订单中心
 */
app.controller('order', ['$scope', '$controller', function ($scope, $controller) {

    $controller('generic', {$scope: $scope});

    $scope.f5 = function () {
        setTimeout(function () {
            history.go(0);
        }, 2500);
    };

    $scope.refund = [];
    $scope.order = [];
    $scope.bill = [];

    // 微信吊起支付
    $scope.wxPayment = function (data, orderNumber) {
        function onBridgeReady() {
            WeixinJSBridge.invoke('getBrandWCPayRequest', data, function (response) {
                    if (response.err_msg === 'get_brand_wcpay_request:ok') {
                        var url = requestUrl + 'order/pay-result&order_number=' + orderNumber
                        url = $scope.service.supplyParams(url, ['channel']);

                        location.href = url;
                    }
                }
            );
        }

        if (typeof WeixinJSBridge === 'undefined') {
            if (document.addEventListener) {
                document.addEventListener('WeixinJSBridgeReady', onBridgeReady, false);
            } else if (document.attachEvent) {
                document.attachEvent('WeixinJSBridgeReady', onBridgeReady);
                document.attachEvent('onWeixinJSBridgeReady', onBridgeReady);
            }
        } else {
            onBridgeReady();
        }
    };

    // 轮询订单是否完成（支付宝专用）
    $scope.pollOrder = function (orderNumber, userId, time) {
        $scope.request({
            api: 'order/ajax-poll-order',
            loading: false,
            post: {
                order_number: orderNumber,
                user_id: userId,
                time: time,
                channel: $scope.service.parseQueryString().channel
            },
            success: function (res) {
                location.href = res.data;
            },
            fail: function () {
                setTimeout(function () {
                    $scope.pollOrder(orderNumber, userId, time);
                }, 3000);
            }
        });
    };

    // 立即付款
    $scope.paymentAgain = function (paymentMethod, orderNumber) {
        $scope.request({
            api: 'order/ajax-payment-again',
            post: {
                payment_method: paymentMethod,
                order_number: orderNumber
            },
            success: function (res) {
                location.href = res.data;
            }
        });
    };

    // 取消订单
    $scope.cancelOrder = function (orderNumber) {

        var result = confirm('确定取消该订单吗?');
        if (!result) {
            return null;
        }

        $scope.request({
            api: 'order/ajax-cancel-order',
            post: {
                order_number: orderNumber
            },
            success: $scope.f5
        });
    };

    // 申请退款
    $scope.applyRefund = function (id) {

        var refund = $scope.refund[id];

        if (!refund || $scope.service.isEmpty(refund.remark)) {
            return $scope.message('请填写退款申请原因');
        }

        refund.id = id;
        $scope.request({
            api: 'order/ajax-apply-refund',
            post: refund,
            success: $scope.f5
        });
    };

    // 申请预约
    $scope.applyOrder = function (id) {

        var order = $scope.order[id];

        if (!order || $scope.service.isEmpty(order.name)) {
            return $scope.message('请填写入住人姓名');
        }

        if (!order || $scope.service.isEmpty(order.phone) || !$scope.service.check(order.phone, 'phone')) {
            return $scope.message('请填写正确的入住人联系方式');
        }

        if (!order || $scope.service.isEmpty(order.date)) {
            return $scope.message('请选择入住日期');
        }

        order.id = id;
        order.time = order.date.format('yyyy-MM-dd');

        $scope.request({
            api: 'order/ajax-apply-order',
            post: order,
            success: $scope.f5
        });
    };

    // 我已入住
    $scope.completed = function (id) {
        var result = confirm('确定已入住酒店?');
        if (!result) {
            return null;
        }

        $scope.request({
            api: 'order/ajax-completed',
            post: {
                id: id
            },
            success: $scope.f5
        });
    };

    // 申请发票
    $scope.applyBill = function (id) {

        var bill = $scope.bill[id];

        if (!bill || bill.company && $scope.service.isEmpty(bill.company_name)) {
            return $scope.message('请填写发票抬头公司名称');
        }

        if (!bill || $scope.service.isEmpty(bill.address)) {
            return $scope.message('请填写发票的邮寄地址');
        }

        bill.id = id;
        $scope.request({
            api: 'order/ajax-apply-bill',
            post: bill,
            success: $scope.f5
        });
    };
}]);

