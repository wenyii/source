/**
 * Created by apple on 17/4/19.
 */
/**
 * 购物车数量加减
 */
var app = angular.module('kkApp', []);
app.controller('myCtrl', function ($scope) {
    $scope.count = 1;
    $scope.add = function () {
        $scope.count = Math.min(++$scope.count, 3);
    }
    $scope.reduce = function () {
        $scope.count = Math.max(--$scope.count, 0);
    }
});

/**
 * 套餐点击展开
 */
$(document).ready(function () {
    $('.combo ul li .combo-1').on("touchstart", function () {
        $(".combo-1 span").css('color', '');
        $(".combo-1 b").css('background-color', '');
        $('.combo-2').css('display', 'none');
        $(this).next().css('display', 'block');
        $(this).find("span").css('color', '#ffcc00');
        $(this).find("b").css('background-color', '#ffcc00');
    });
});