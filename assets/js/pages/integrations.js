$(document).ready(function() {
  $("#targetURL").on('input', function() {
    var urlGroup = document.getElementById("targertULRGroup");
    var data = $(this).val();
    var help = document.getElementById("helpBox");
    var button = document.getElementById("addIntegrationButton");
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

  $("#addIntegrationButton").click(function() {
    document.getElementById('addIntegrationButton').classList.add('disabled');

    var name = $("#name").val();
    var webhook = $("#targetURL").val();
    if (name == undefined || name == "") {
      swal("Uh-Oh!", "The integration name cannot be left blank.", "error");
    } else if (webhook == undefined || webhook == "") {
      swal("Uh-Oh!", "The webhook cannot be left blank.", "error");
    } else {
      var postObj = {
        name: name,
        webhook: webhook
      };

      $.ajax({
        type: 'POST',
        url: '/integration/new',
        data: postObj,
        success: function(data) {
          if (data.success == true) {
            window.location.reload();
          } else {
            swal("Uh-Oh!", "There was an error creating a new integration: " + data.message, "error");
          }
          document.getElementById('addIntegrationButton').classList.remove('disabled');
        },
        error: function(data) {
          swal("Uh-Oh!", "There was an error creating a new integration: " + data.message, "error");
          document.getElementById('addIntegrationButton').classList.remove('disabled');
        }
      });
    }
  });
});
