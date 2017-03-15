$(document).ready(function() {
  $("#targetURL").on('input', function() {
    var urlGroup = document.getElementById("targertULRGroup");
    var data = $(this).val();
    var help = document.getElementById("helpBox");
    var button = document.getElementById("saveIntegration");
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

  $("#checkAll").click(function() {
    $("input:checkbox:not(:checked)").each(function() {
      $(this).prop("checked", true);
    });
  });

  $("#uncheckAll").click(function() {
    $("#checkboxes :checked").each(function() {
      $(this).prop("checked", false);
    });
  });

  $("#saveIntegration").click(function() {
    document.getElementById("saveIntegration").classList.add('disabled');

    var name = $("#name").val();
    var webhook = $("#targetURL").val();

    // Get all the checkboxes
    var allValues = [];
    $("#checkboxes :checked").each(function() {
      allValues.push($(this).val());
    });

    if (name == undefined || name == "") {
      swal("Uh-Oh!", "The integration name cannot be left blank.", "error");
    } else if (webhook == undefined || webhook == "") {
      swal("Uh-Oh!", "The webhook cannot be left blank.", "error");
    } else {
      var postObj = {
        name: name,
        webhook: webhook,
        monitors: allValues,
        integrationID: integrationID
      };
      $.ajax({
        type: 'POST',
        url: '/integration/edit',
        data: postObj,
        success: function(data) {
          if (data.success == true) {
            window.location.reload();
          } else {
            swal("Uh-Oh!", "There was an error saving the integration: " + data.message, "error");
          }
          document.getElementById('saveIntegration').classList.remove('disabled');
        },
        error: function(data) {
          swal("Uh-Oh!", "There was an error saving the integration: " + data.message, "error");
          document.getElementById('saveIntegration').classList.remove('disabled');
        }
      });
    }
  });

  $("#deleteIntegration").click(function() {
    document.getElementById('deleteIntegration').classList.add('disabled');
    swal({
        title: "Are you sure?",
        text: "You will not be able to recover this integration!",
        type: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
        closeOnConfirm: false
      },
      function() {
        var postObj = {
          integrationID: integrationID
        };

        $.ajax({
          type: 'POST',
          url: '/integration/delete',
          data: postObj,
          success: function(data) {
            if (data.success == true) {
              window.location.href = "/integrations";
            } else {
              swal("Uh-Oh!", "There was an error deleting the integration.", "error");
            }
          },
          error: function(data) {
            swal("Uh-Oh!", "There was an error deleting the integration.", "error");
          }
        });
        document.getElementById('deleteIntegration').classList.remove('disabled');
      });
  });
});
