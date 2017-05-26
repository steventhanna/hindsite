$(document).ready(function() {

  $("#createIncidentButton").click(function() {
    var title = $("#title").val();
    var option = document.getElementById('status');
    var selection = option.options[option.selectedIndex].value;
    var allMonitors = [];

    $("#checkboxes :checked").each(function() {
      allMonitors.push($(this).val());
    });

    var postObj = {
      title: title,
      status: selection,
      monitors: allMonitors
    };

    $.ajax({
      type: 'POST',
      url: '/incident/new',
      data: postObj,
      success: function(data) {
        if (data.success == true) {
          // swal("Success!", "The incident was succesfully created.", "success");
          window.location.reload();
        } else {
          swal("Uh-Oh!", "There was an error creating the incident.", "error");
        }
      },
      error: function(data) {
        swal("Uh-Oh!", "There was an error creating the incident.", "error");
      }
    });
  });

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

});
