/**
 * 控制器 - 活动
 */
app.controller('activity', ['$scope', '$controller', function ($scope, $controller) {

    $controller('generic', {$scope: $scope});

    // 上传后处理
    $scope.handleUpload = function (data) {
        $('#preview').attr('src', data.url).attr('data-id', data.id);
    };

    // 提交我的故事
    $scope.submitStory = function () {
        var data = {
            attachment: $('#preview').attr('data-id'),
            story: $('textarea').val()
        };

        if (!parseInt(data.attachment)) {
            $scope.factory.message = '请先上传照片';
            return null;
        }

        if (data.story.length <= 0 || data.story.length > 100) {
            $scope.factory.message = '故事内容控制在 0 ~ 100 字之间';
            return null;
        }

        $scope.request({
            api: 'activity/ajax-story',
            post: data,
            success: function (data) {
                html2canvas(document.body, {
                    onrendered: function (canvas) {

                        $scope.factor.message = '提交成功';

                        var img = Canvas2Image.saveAsPNG(canvas, true);
                        console.log(img);
                    }
                });
            }
        });
    };
}]);