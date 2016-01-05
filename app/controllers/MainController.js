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
        .module('MainCtr')
        .controller('MainController', MainController);

    function MainController() {
        var vm = this;

        vm.width = 345;
        vm.height = 190;
        vm.video = {
            name: 'video1',
            currentTime: 0,
            videoid: 'M7lc1UVf-VE',
            views: 123000
        };
    }

})();
