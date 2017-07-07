/**
 * 控制器 - 分销
 */
app.controller('distribution', function ($scope, $controller, $timeout) {
	$scope.isShowAni = true;
	$timeout(function(){
		$scope.isShowAni = false ;
	},5000)
});