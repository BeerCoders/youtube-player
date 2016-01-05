/**
 * This file is part of the dashboard_tactic package.
 *
 * (c) Rafał Lorenz <vardius@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
(function () {
    'use strict';

    angular
        .module('youtube-player')
        .controller('YouTubeController', YouTubeController);

    YouTubeController.$inject = [
        '$scope',
        '$interval',
        'YT_event'
    ];

    function YouTubeController($scope, $interval, YT_event) {
        var vm = this;

        vm.progress = 0;
        vm.duration = 0;
        vm.interval = undefined;
        vm.YT_event = YT_event;
        vm.playerStatus = "NOT PLAYING";
        vm.currentTime = 0;

        vm.move = move;
        vm.sendControlEvent = sendControlEvent;

        $scope.$on(YT_event.STATUS_CHANGE, function (event, data) {
            var player = data.player;

            vm.playerStatus = data.message;
            vm.currentTime = player.getCurrentTime();

            showProgress(player);
        });

        $scope.$on(YT_event.PLAYER_READY, function (event, data) {
            vm.duration = data.duration;
        });

        function sendControlEvent(ctrlEvent, args) {
            if (args) {
                $scope.$broadcast(ctrlEvent, args);
            } else {
                $scope.$broadcast(ctrlEvent);
            }
        }

        function move(event) {
            var bar = event.target.className === 'progress-bar progress-bar-info'
                ? event.target.parentNode
                : event.target;

            var currentTime = event.offsetX / bar.offsetWidth * vm.duration;

            vm.progress = currentTime / vm.duration * 100;
            sendControlEvent(YT_event.MOVE, {currentTime: currentTime});
        }

        function showProgress(player) {
            if (vm.currentTime !== null) {
                vm.progress = vm.currentTime / vm.duration * 100;
            }
            if (vm.playerStatus === 'PLAYING') {
                vm.interval = $interval(function () {
                    vm.progress = player.getCurrentTime() / vm.duration * 100;
                }, 500);
            } else {
                if (angular.isDefined(vm.interval)) {
                    $interval.cancel(vm.interval);
                    vm.interval = undefined;
                }
            }
        }
    }
})();
