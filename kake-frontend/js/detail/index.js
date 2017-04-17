/**
 * 控制器 - 详情页
 */
app.controller('detail', function ($scope, $controller) {

    $controller('generic', {$scope: $scope});

});

$(document).ready(function(){
$('.classify-1-1').click(function(){
    $('.detail-hotel_1').css('display','block') ;
    $('.notice').css('display','none') ;
    $('.classify-1-1 span').addClass('cur-1');
    $('.classify-1-2 span').removeClass('cur-1');
});
    $('.classify-1-2').click(function(){
    $('.detail-hotel_1').css('display','none') ;
    $('.notice').css('display','block') ;
    $('.classify-1-1 span').removeClass('cur-1');
    $('.classify-1-2 span').addClass('cur-1');
});
});
