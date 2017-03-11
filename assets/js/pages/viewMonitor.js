$(document).ready(function() {
  $("#targetURL").on('input', function() {
    var urlGroup = document.getElementById("targertULRGroup");
    var data = $(this).val();
    var help = document.getElementById("helpBox");
    var button = document.getElementById("editMonitorButton");
    if (validateURL(data)) {
      button.classList.remove('disabled');
      urlGroup.classList.remove("has-error");
      urlGroup.classList.add("has-success");
      help.innerHTML = "The URL is valid";
    } else {
      button.classList.add('disabled');
      urlGroup.classList.add("has-error");
      urlGroup.classList.remove("has-success");
      help.innerHTML = "The URL is not valid";
    }
  });

  function validateURL(url) {
    var pattern = new RegExp(/[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi);
    return pattern.test(url);
  }

  $("#editMonitorButton").click(function() {
    document.getElementById('editMonitorButton').classList.add('disabled');
    var name = $("#name").val();
    var targetURL = $("#targetURL").val();
    var cron = $("#cron").cron("value");
    var healthyRange = $("#healthyRange").val();
    var rockyRange = $("#rockyRange").val();
    var movingAverageWindow = $("#movingAverageWindow").val();
    if (!validateURL(targetURL)) {
      swal("Uh-Oh", "The target URL is not valid.", "error");
    } else {
      var postObj = {
        name: name,
        targetURL: targetURL,
        frequency: cron,
        monitorID: monitorID,
        healthyRange: healthyRange,
        rockyRange: rockyRange,
        movingAverageWindow: movingAverageWindow
      };

      $.ajax({
        type: 'POST',
        url: '/monitor/edit',
        data: postObj,
        success: function(data) {
          if (data.success == true) {
            window.location.reload();
          } else {
            swal("Uh-Oh!", "There was an error editing the monitor: " + data.message, "error");
          }
          document.getElementById('editMonitorButton').classList.remove('disabled');
        },
        error: function(data) {
          swal("Uh-Oh!", "There was an error creating the monitor: " + data.message, "error");
          document.getElementById('editMonitorButton').classList.remove('disabled');
        }
      });
    }
  });

  // var labels = [];
  var chart;
  var labels;
  var d;

  io.socket.on('connect', function socketConnected() {
    io.socket.get('/socket/watch/monitor/' + monitorID, function(data, jwers) {
      var ctx = document.getElementById("pingChart");
      labels = data.pings.map(function(a) {
        return a.createdAt;
      }).reverse();
      d = data.pings.map(function(a) {
        return a.elapsedTime;
      }).reverse();
      chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: "Pings",
            data: d
          }]
        }
      });
    });

    io.socket.on(monitorID, function(msg) {
      // Update the DOM
      var currentHealth = document.getElementById('currentHealth');
      var builder = "";
      switch (msg.currentHealth) {
        case "Healthy":
          builder += '<span class="has-success">';
          break;
        case "Rocky":
          builder += '<span class="has-danger">';
          break;
        default:
          builder += '<span class="has-error">';
          break;
      }
      currentHealth.innerHTML = builder + msg.currentHealth + '</span>';
      document.getElementById('averageResponseTime').innerHTML = msg.averageResponseTime;
      // Update the data
      io.socket.get('/monitors/data/' + monitorID + '/lastPing', function(data, jwers) {
        // Remove the first element
        d.splice(0, 1);
        labels.splice(0, 1);
        d.push(data.ping.elapsedTime);
        labels.push(data.ping.createdAt);
        chart.update();
      });
    });
  });
});
