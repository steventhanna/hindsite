$(document).ready(function() {
  $("#targetURL").on('input', function() {
    var urlGroup = document.getElementById("targertULRGroup");
    var data = $(this).val();
    var help = document.getElementById("helpBox");
    var button = document.getElementById("addMonitorButton");
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

  $("#addMonitorButton").click(function() {
    document.getElementById('addMonitorButton').classList.add('disabled');
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
        healthyRange: healthyRange,
        rockyRange: rockyRange,
        movingAverageWindow: movingAverageWindow
      };

      $.ajax({
        type: 'POST',
        url: '/monitor/new',
        data: postObj,
        success: function(data) {
          if (data.success == true) {
            window.location.reload();
          } else {
            swal("Uh-Oh!", "There was an error creating the monitor: " + data.message, "error");
          }
          document.getElementById('addMonitorButton').classList.remove('disabled');
        },
        error: function(data) {
          swal("Uh-Oh!", "There was an error creating the monitor: " + data.message, "error");
          document.getElementById('addMonitorButton').classList.remove('disabled');
        }
      });
    }
  });

  $("#cron").cron();
});
