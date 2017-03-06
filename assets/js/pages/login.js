$(document).ready(function() {
  $("#loginButton").click(function() {
    $(this).addClass('disabled');

    var email = $("#email").val();
    var password = $("#password").val();

    if (email == undefined || !validateEmail(email)) {
      swal("Uh-Oh!", "The email entered is not a valid email.", "error");
    } else if (password == undefined || password.length == 0) {
      swal("Uh-Oh!", "The password can not be empty.", "error");
    } else {
      var postObj = {
        username: email,
        password: password
      };

      $.ajax({
        type: 'POST',
        url: '/user/login',
        data: postObj,
        success: function(data) {
          if (data.success == true) {
            window.location.href = "/dashboard";
          } else {
            swal("Uh-Oh!", "There was an error loggin in: " + data.message, "error");
          }
        },
        error: function(data) {
          swal("Uh-Oh!", "There was an error logging in", "error");
          document.getElementById('loginButton').classList.remove('disabled');
          // $(this).classList.remove('disabled');
        }
      })
    }
  });

  function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }
});
