/**
 * 控制器 - 分销
 */
app.controller('distribution', ['$scope', '$controller', '$timeout', function ($scope, $controller, $timeout) {

    $controller('generic', {$scope: $scope});

    $scope.Car = function (car, direction, cls) {

        this.target = car;
        this.direction = direction || 'right';

        cls = cls || {};
        this.boxEntity = this.target.find('.' + (cls.box || 'box'));
        this.gasEntity = this.boxEntity.find('.' + (cls.gas || 'gas'));

        this.anIgnition = cls.anIgnition || 'an-shake';
        this.anGas = cls.anGas || 'an-gas';
        this.anBrake = cls.anBrake || 'an-brake';

        var that = this;

        // 点火
        this.ignition = function (time) {
            var deferred = new $.Deferred();

            this.target.addClass(this.anIgnition);
            this.gasEntity.addClass(this.anGas);

            setTimeout(function () {
                that.target.removeClass(that.anIgnition);
                that.gasEntity.removeClass(that.anGas);
                deferred.resolve();
            }, time);

            return deferred.promise();
        };

        // 移动
        this.move = function (distance, time) {
            var deferred = new $.Deferred();

            time = time || 2000;

            var css = {};
            css[this.direction] = distance;
            this.target.animate(css, time, 'linear', function () {
                deferred.resolve();
            });

            return deferred.promise();
        };

        // 加速
        this.speedUp = function (distance, begin, end, framesPx) {
            var deferred = new $.Deferred();

            var frames = 200;
            framesTime = 10000 / frames;
            var now = parseInt(this.target.css(this.direction));
            if (now >= parseInt(distance)) {
                deferred.resolve();
            } else {

                framesPx = framesPx || ((distance - now) / frames);
                begin = framesPx + begin;
                if (begin >= end) {
                    begin = end;
                }

                var css = {};
                css[this.direction] = now + begin;

                this.move(now + begin, framesTime).then(function () {
                    return that.speedUp(distance, begin, end, framesPx);
                }).then(function () {
                    deferred.resolve();
                });
            }

            return deferred.promise();
        };

        // 刹车
        this.brake = function (distance, time) {
            var deferred = new $.Deferred();

            this.boxEntity.addClass(this.anBrake);
            this.move(distance, time).then(function () {
                setTimeout(function () {
                    that.boxEntity.removeClass(that.anBrake);
                    deferred.resolve();
                }, 500);
            });

            return deferred.promise();
        };

        // 停车事宜
        this.stop = function (time) {
            var deferred = new $.Deferred();

            setTimeout(function () {
                deferred.resolve();
            }, time);

            return deferred.promise();
        };

        // 睡眠
        this.sleep = function (time) {
            var start = new Date();
            while (new Date() - start < time) {
            }
        };
    };

    $scope.service.imageLoaded($('.distri_ani'), function () {

        var car = new $scope.Car($('.box-false'));
        car.sleep(1500);
        car.move(-60, 300).then(function () {
            return car.brake(-10, 200);
        }).then(function () {
            console.log('车将停留 3 秒...');
            $('.people').fadeIn(1500);
            console.log('请游客下车');
            return car.stop(3000);
        }).then(function () {
            console.log('点火');
            return car.ignition(500);
        }).then(function () {
            console.log('车已启动');
            return car.speedUp(1500, 0, 300);
        }).then(function () {
            console.log('车已经离开...');
            car.sleep(1200);
            var o = $(".distri_ani").fadeOut().promise();
            o.done(function () {
                $(this).remove();
                $('.distri_content').removeClass('hidden').fadeIn(500);
            });
        });
    });

}]);