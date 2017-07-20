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
            $scope.message('请先上传照片');
            return null;
        }

        if (data.story.length <= 0 || data.story.length > 100) {
            $scope.message('故事内容控制在 0 ~ 100 字之间');
            return null;
        }

        $scope.request({
            api: 'activity/ajax-story',
            post: data,
            success: function () {

                var pos = {
                    w: document.body.offsetWidth,
                    h: document.body.offsetHeight
                };

                setTimeout(function () {
                    html2canvas(document.body, {
                        allowTaint: true,
                        useCORS: true,
                        taintTest: false,
                        width: pos.w,
                        height: pos.h,
                        onrendered: function (canvas) {
                            $scope.message('提交成功，长按可保存图片');

                            var base64 = canvas.toDataURL('image/jpeg', .1);

                             var img = new Image(pos.w, pos.h);
                             img.src = base64;
                             img.classList.add('screen-shot');

                             console.log('Length: ' + base64.length);
                             $('body').append(img);
                        }
                    });
                }, 1000);
            }
        });
    };
}]);