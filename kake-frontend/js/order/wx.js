/**
 * 控制器 - 订单
 */
app.controller('order', function ($scope, $controller) {

    $controller('generic', {$scope: $scope});

    $scope.payment = function (data) {
        function onBridgeReady() {
            WeixinJSBridge.invoke('getBrandWCPayRequest', data, function (response) {
                    if (response.err_msg === 'get_brand_wcpay_request:ok') {

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
});