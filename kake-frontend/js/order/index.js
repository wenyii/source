/**
 * 控制器 - 订单中心
 */
app.controller('order', function ($scope, $controller) {

    $controller('generic', {$scope: $scope});

    $scope.bill = [];

    // 申请发票
    $scope.applyBill = function (id) {

        var service = $scope.service;
        var factory = $scope.factory;
        var bill = $scope.bill[id];

        if (bill.company && service.isEmpty(bill.company_name)) {
            factory.message = '请填写发票抬头公司名称';
            return null;
        }

        if (service.isEmpty(bill.address)) {
            factory.message = '请填写发票的邮寄地址';
            return null;
        }

        bill.id = id;
        $scope.request({
            api: 'order/ajax-apply-bill',
            post: bill,
            success: function () {
                setTimeout(function () {
                    history.go(0);
                }, 3000);
            }
        });
    };
});

