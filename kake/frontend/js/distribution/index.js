/**
 * 控制器 - 分销
 */
<<<<<<< Updated upstream
app.controller('distribution', function ($scope, $controller, $timeout) {
=======
app.controller('distribution', ['$scope', '$controller', '$timeout', function ($scope, $controller, $timeout) {

	$controller('generic', {$scope: $scope});
	
>>>>>>> Stashed changes
	$scope.isShowAni = true;
	$timeout(function(){
		$scope.isShowAni = false ;
	},5000)
}]);