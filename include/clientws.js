#include<hostname.js>

var wsaddress = 'ws://' + wshostname;

#ifdef HTTPS
wsaddress = 'wss://' + wshostname;
#endif

    var ws = undefined;
    var ws_unsent_messages = [];
    var ws_first_connection = true;
    var ws_send = undefined;
    
    var ws_make_connection = function() {
        ws = new WebSocket(wsaddress);

        ws_send = function(data) {
            ws.send(data);

            if (ws.bufferedAmount === 0) {
                // the data sent
            }
            else {
                ws_unsent_messages.push(data);
            }
        }

        ws.onopen = function()
        {
            console.log('Connection opened');

            // process unsent messages
            while (ws_unsent_messages.length > 0) {
                var head = ws_unsent_messages[0];
                
                // Try to send it
                try {
                    ws.send(head);
                } catch (err) {
                    // If not successful, just give up
                    return;
                }
                // If successful, remove head and send others
                ws_unsent_messages.shift();
            }
            
            if (ws_first_connection) {
                $scope.wsonopen(ws);
                ws_first_connection = false;
            }
            
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
            setTimeout(function(){ 
                ws_make_connection();
            }, 3000);
        };
        
        ws.onerror = function(err) {
            console.log('WEBSOCKET error!');
            console.log(err);
        };

    }
    
    ws_make_connection();

