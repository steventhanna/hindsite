$(document).ready(function() {
  io.socket.on('connect', function socketConnected() {
    io.socket.get('/socket/watch/monitors/dash', function(data, jwers) {
      var ctx = document.getElementById('chart');
      console.log(data);
      console.log(data.pingData);
    });
  });
});
