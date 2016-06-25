(function () {
    'use strict';
    
    
    function registerController(app) {
        app.get('/task', function (req, res) {
            res.send('test');
        });
    }
    
    exports.register = registerController;
}());