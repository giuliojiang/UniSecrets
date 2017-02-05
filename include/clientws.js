#include<hostname.js>

    var ws = new WebSocket(wshostname);

    ws.onopen = function()
    {
        console.log('Connection opened');
        
        $scope.wsonopen(ws);
    };

    ws.onmessage = function (evt)
    {
        var data = evt.data;
        console.log('Received ' + data);
        $scope.wsmessage(ws, data);
    };

    ws.onclose = function()
    {
        console.log('Closed websocket');
    };