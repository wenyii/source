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
                        location.href = requestUrl + 'order/wx-pay-result&order_number=' + orderNumber
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
    
    // 立即付款
    $scope.paymentAgain = function ($paymentMethod, $orderNumber) {
        $scope.request({
            api: 'order/payment-again',
            post: {
                payment_method: $paymentMethod,
                order_number: $orderNumber
            },
            success: function (res) {
                location.href = res.data;
            }
        });
    };

    // 取消订单
    $scope.cancelOrder = function ($orderNumber) {

        var result = confirm('确定取消该订单吗?');
        if (!result) {
            return null;
        }

        $scope.request({
            api: 'order/cancel-order',
            post: {
                order_number: $orderNumber
            },
            success: $scope.f5
        });
    };

    // 申请退款
    $scope.applyRefund = function (id) {

        var refund = $scope.refund[id];

        if (!refund || $scope.service.isEmpty(refund.remark)) {
            $scope.factory.message = '请填写退款申请原因';
            return null;
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
            $scope.factory.message = '请填写入住人姓名';
            return null;
        }

        if (!order || $scope.service.isEmpty(order.phone) || !$scope.service.check(order.phone, 'phone')) {
            $scope.factory.message = '请填写正确的入住人联系方式';
            return null;
        }

        if (!order || $scope.service.isEmpty(order.date)) {
            $scope.factory.message = '请选择入住日期';
            return null;
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
            $scope.factory.message = '请填写发票抬头公司名称';
            return null;
        }

        if (!bill || $scope.service.isEmpty(bill.address)) {
            $scope.factory.message = '请填写发票的邮寄地址';
            return null;
        }

        bill.id = id;
        $scope.request({
            api: 'order/ajax-apply-bill',
            post: bill,
            success: $scope.f5
        });
    };
}]);

