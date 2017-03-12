$(document).ready(function() {
  $("#saveIntegrations").click(function() {
    document.getElementById('saveIntegrations').classList.add('disabled');
    var slackWebhook = $("#slackWebhook").val();
    var twitterAPIKey = $("#twitterAPIKey").val();
    var postObj = {
      slackWebhook: slackWebhook,
      twitterAPIKey: twitterAPIKey
    };

    $.ajax({
      type: 'POST',
      url: '/integrations/edit',
      data: postObj,
      success: function(data) {
        if (data.success == true) {
          window.location.reload();
        } else {
          swal("Uh-Oh!", "There was an error saving the integration: " + data.message, "error");
        }
      },
      error: function(data) {
        swal("Uh-Oh!", "There was an error saving the integration: " + data.message, "error");
      }
    });
    document.getElementById('saveIntegrations').classList.remove('disabled');
  });
});
