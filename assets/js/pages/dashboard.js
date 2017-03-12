$(document).ready(function() {

  io.socket.on('connect', function socketConnected() {
    io.socket.on('dashboard', function(msg) {
      document.getElementById('healthyMonitors').innerHTML = msg.healthyMonitors.length;
      document.getElementById('rockyMonitors').innerHTML = msg.rockyMonitors.length;
      document.getElementById('sickMonitors').innerHTML = msg.sickMonitors.length;
      document.getElementById('offlineMonitors').innerHTML = msg.offlineMonitors.length;
    });
  });

});
