/**
 * 控制器 - 列表页
 */
app.controller('items', function ($scope, $controller) {

    $controller('generic', {$scope: $scope});

    // TODO
    $scope.ajaxNextPage = function () {
        $(window).scroll(function () {
            if ($(document).scrollTop() < $(document).height() - $(window).height()) {
                return false;
            }

            var page = $('.recommend').attr('data-page');
            $scope.request({
                api: 'items/ajax-list',
                post: {
                    page: page
                },
                success: function (res) {
                    $('.recommend').append(res.data.html);
                    $('.recommend').attr('data-page', parseInt(page) + 1);
                }
            });
        });
    }
});

