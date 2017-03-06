$(document).ready(function() {
  $("#createAccountButton").click(function() {
    $(this).addClass('disabled');

    var email = $("#email").val();
    var firstName = $("#firstName").val();
    var lastName = $("#lastName").val();
    var password = $("#password").val();
    var confirmPassword = $("#confirmPassword").val();
    var secretKey = $("#secretKey").val();

    if (password !== confirmPassword) {
      swal("Uh-Oh!", "Try confirming your password again.", "error");
    } else if (firstName == undefined || lastName == undefined || password == undefined || secretKey == undefined) {
      swal("Uh-Oh!", "You can't leave anything blank.", "error");
    } else if (!validateEmail(email)) {
      swal("Uh-Oh!", "That is not a valid email address.", "error");
    } else {
      var postObj = {
        email: email,
        firstName: firstName,
        lastName: lastName,
        password: password,
        signupkey: secretKey
      }

      $.ajax({
        type: 'POST',
        url: '/user/signup',
        data: postObj,
        success: function(data) {
          if (data.success == true) {
            window.location.href = "/dashboard"
          } else {
            swal("Uh-Oh!", "There was an error creating the account: " + data.message, "error");
          }
          document.getElementById('createAccountButton').classList.remove('disabled');
        },
        error: function(data) {
          swal("Uh-Oh!", "There was an error creating the account: " + data.message, "error");
          document.getElementById('createAccountButton').classList.remove('disabled');
        }
      });
    }
  });

  var passwordGood = false;

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
      passwordGood = true;
      canCreate();
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

  var emailGood = false;

  $("#email").on('input', function() {
    var email = $(this).val();
    var emailGroup = document.getElementById('emailGroup');
    var emailHelp = document.getElementById('emailHelp');
    var button = document.getElementById('createAccountButton');
    if (validateEmail(email)) {
      emailGroup.classList.remove('has-error');
      emailGroup.classList.add("has-success");
      emailHelp.innerHTML = "Email is a valid address";
      emailGood = true;
      canCreate();
    } else {
      emailGroup.classList.remove("has-success");
      emailGroup.classList.add("has-error");
      emailHelp.innerHTML = "Email is not a valid address";
      button.classList.add('disabled');
    }
  });

  function canCreate() {
    if (emailGood && passwordGood) {
      var button = document.getElementById('createAccountButton');
      button.classList.remove('disabled');
    }
  }

  function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }
});
