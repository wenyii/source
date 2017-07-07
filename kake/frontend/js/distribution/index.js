/**
 * 控制器 - 分销
 */
app.controller('distribution', ['$scope', '$controller', '$timeout', function ($scope, $controller, $timeout) {

	$controller('generic', {$scope: $scope});
	
	$scope.isShowAni = true;
	$timeout(function(){
		$scope.isShowAni = false ;
	},5000)
}]);