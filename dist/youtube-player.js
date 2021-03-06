(function () {
    'use strict';

    angular
        .module('youtube-player', [])
        .constant('YT_event', {
            STOP: 0,
            PLAY: 1,
            PAUSE: 2,
            MOVE: 3,
            STATUS_CHANGE: 4,
            PLAYER_READY: 5
        })
        .directive('youtube', youtube)
        .controller('YouTubeController', YouTubeController)
    ;

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

    function youtube(YouTubeLoader, YT_event) {
        return {
            restrict: "E",
            templateUrl: '/src/views/youtube/video.view.html',
            controller: 'YouTubeController',
            controllerAs: 'vm',

            scope: {
                videoid: "@",
                height: "@",
                width: "@",
                currentTime: "@"
            },

            link: function (scope, element, attrs, $rootScope) {
                var tag = document.createElement('script');
                tag.src = "https://www.youtube.com/iframe_api";
                var firstScriptTag = document.getElementsByTagName('script')[0];
                firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

                var player;
                var playerElement = element.children()[0].getElementsByClassName("player")[0];

                YouTubeLoader.whenLoaded().then(function () {
                    player = new YT.Player(playerElement, {
                        playerVars: {
                            autoplay: 0,
                            html5: 1,
                            theme: "light",
                            modesbranding: 0,
                            color: "white",
                            iv_load_policy: 3,
                            showinfo: 0,
                            controls: 0
                        },

                        height: scope.height,
                        width: scope.width,
                        videoId: scope.videoid,
                        scenes: scope.scenes,

                        events: {
                            'onReady': function (event) {
                                var data = {
                                    duration: player.getDuration()
                                };

                                scope.$apply(function () {
                                    scope.$emit(YT_event.PLAYER_READY, data);
                                });
                            },
                            'onStateChange': function (event) {
                                var data = {
                                    message: "",
                                    player: player
                                };

                                switch (event.data) {
                                    case YT.PlayerState.PLAYING:
                                        data.message = "PLAYING";
                                        break;
                                    case YT.PlayerState.ENDED:
                                        data.message = "ENDED";
                                        break;
                                    case YT.PlayerState.UNSTARTED:
                                        data.message = "NOT PLAYING";
                                        break;
                                    case YT.PlayerState.PAUSED:
                                        data.message = "PAUSED";
                                        break;
                                }

                                scope.$apply(function () {
                                    scope.$emit(YT_event.STATUS_CHANGE, data);
                                });
                            }
                        }
                    });
                });

                scope.$watch('height + width', function (newValue, oldValue) {
                    if (newValue == oldValue) {
                        return;
                    }

                    player.setSize(scope.width, scope.height);
                });

                scope.$watch('videoid', function (newValue, oldValue) {
                    if (newValue == oldValue) {
                        return;
                    }

                    player.cueVideoById(scope.videoid);
                });

                scope.$watch('currentTime', function (newValue, oldValue) {
                    if (newValue == oldValue) {
                        return;
                    }

                    if (newValue !== null) {
                        player.seekTo(newValue);
                    }
                });

                scope.$on(YT_event.STOP, function () {
                    player.stopVideo();
                    scope.currentTime = 0;
                });

                scope.$on(YT_event.PLAY, function () {
                    player.playVideo();
                    scope.currentTime = null;
                });

                scope.$on(YT_event.PAUSE, function () {
                    player.pauseVideo();
                    scope.currentTime = player.getCurrentTime();
                });

                scope.$on(YT_event.MOVE, function (event, args) {
                    scope.currentTime = args.currentTime;
                });
            }
        }
    }

})();
