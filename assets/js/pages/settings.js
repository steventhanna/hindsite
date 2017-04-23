$(document).ready(function() {

  $("#confirmPassword").on('input', function() {
    var password = $("#password").val();
    var passwordConfirmation = $(this).val();
    var passwordGroup = document.getElementById('passwordGroup');
    var confirmationGroup = document.getElementById('confirmationGroup');
    var helpBox = document.getElementById('helpBox');
    var button = document.getElementById('createAccountButton');

    if (password === passwordConfirmation && password != "") {
      // Color them both green
      passwordGroup.classList.add("has-success");
      confirmationGroup.classList.add("has-success");
      passwordGroup.classList.remove("has-error");
      confirmationGroup.classList.remove("has-error");
      helpBox.innerHTML = "Passwords match!";
      button.classList.remove("disabled");
    } else {
      // Color them red
      passwordGroup.classList.add("has-error");
      confirmationGroup.classList.add("has-error");
      passwordGroup.classList.remove("has-success");
      confirmationGroup.classList.remove("has-success");
      if (password == undefined || password.length == 0) {
        helpBox.innerHTML = "Uh-Oh! Passwords cannot be empty.";
      } else {
        helpBox.innerHTML = "Uh-Oh! Passwords must match.";
      }
      button.classList.add("disabled");
    }
  });

  $("#generalSaveButton").click(function() {
    $(this).addClass('disabled');

    var email = $("#email").val();
    var firstName = $("#firstName").val();
    var lastName = $("#lastName").val();
    var password = $("#password").val();
    var confirmPassword = $("#confirmPassword").val();

    if (email != undefined && email != "" && !validateEmail(email)) {
      swal("Uh-Oh!", "That is not a valid email address.", "error");
    } else {
      var postObj = {
        username: email,
        firstName: firstName,
        lastName: lastName,
        password: password
      };

      $.ajax({
        type: 'POST',
        url: '/user/edit',
        data: postObj,
        success: function(data) {
          if (data.success == true) {
            window.location.reload();
          } else {
            swal("Uh-Oh!", "There was an error updating the account information: " + data.message, "error");
          }
          $(this).removeClass('disabled');
        }
      });
    }
  });

  $("#appSaveButton").click(function() {
    $(this).addClass('disabled');

    var name = $("#appName").val();
    var signupkey = $("#secretKey").val();
    var frontend = document.getElementById('frontend').checked;
    var textArea = $("#trackingCode").val();
    var postObj = {
      name: name,
      signupkey: signupkey,
      frontend: frontend,
      trackingCode: trackingCode
    };

    $.ajax({
      type: 'POST',
      url: '/dash/edit',
      data: postObj,
      success: function(data) {
        if (data.success == true) {
          window.location.reload();
        } else {
          swal("Uh-Oh!", "There was an error updating the app information: " + data.message, "error");
        }
        $(this).removeClass('disabled');
      }
    });

  });

  function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }


});
