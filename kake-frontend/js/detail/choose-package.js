/**
 * Created by apple on 17/4/19.
 */
/**
 * 购物车数量加减
 */
var app = angular.module('kkApp', []);
app.controller('myCtrl', function ($scope) {
    $scope.count = 0;
    $scope.add = function(){
    	$scope.count = Math.min(++$scope.count,3);
    }
    $scope.reduce = function(){
    	 $scope.count = Math.max(--$scope.count,0);
    }
});

/**
 * 套餐点击展开
 */
$(document).ready(function () {
    $('.combo_1').on("touchstart", function () {
        $('.combo_1 .combo-2').css('display', 'block');
        $('.combo_1 b').css('background-color', '#ffcc00');
        $('.combo_1 .combo-1 span').css('color', '#ffcc00');
    });
    $('.combo_2').on("touchstart", function () {
        $('.combo_2 .combo-2').css('display', 'block');
        $('.combo_2 b').css('background-color', '#ffcc00');
        $('.combo_2 .combo-1 span').css('color', '#ffcc00');
    });
});