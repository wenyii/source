/**
 * 控制器 - 首页
 */
app.controller('site', function ($scope, $controller) {

    $controller('generic', {$scope: $scope});

});



var windowHeight = $(window).height(),
          $body = $("body");
      $body.css("height", windowHeight); //重要代码
	var oHeader=$('header');
    var  obody=$('.body');
		$("body").on("touchstart", function(e) {
    startX = e.originalEvent.changedTouches[0].pageX,
    startY = e.originalEvent.changedTouches[0].pageY;
});
$("body").on("touchmove", function(e) {
    moveEndX = e.originalEvent.changedTouches[0].pageX,
    moveEndY = e.originalEvent.changedTouches[0].pageY,
    X = moveEndX - startX,
    Y = moveEndY - startY;
   if ( Math.abs(Y) > Math.abs(X) && Y > 0) {
       oHeader.addClass('active');
        obody.addClass('top');
    }
    else if ( Math.abs(Y) > Math.abs(X) && Y < 0 ) {
        oHeader.removeClass('active');
       obody.removeClass('top');
    }

});