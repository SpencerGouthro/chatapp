
/*	ENTER YOUR APP'S JAVASCRIPT CODE HERE!	*/

// this function fires at the ready state, which is when the DOM is
// ready for Javascript to execute
$(document).ready(function() {

  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyBK9xZ1TYhvzQf6USnMdYSm5B_lF1RMAj0",
    authDomain: "chat-app-52e09.firebaseapp.com",
    databaseURL: "https://chat-app-52e09.firebaseio.com",
    storageBucket: "chat-app-52e09.appspot.com",
    messagingSenderId: "1008358731168"
  };
  firebase.initializeApp(config);


// some firebase variables
  var facebookProvider = new firebase.auth.FacebookAuthProvider();
  var twitterProvider = new firebase.auth.TwitterAuthProvider();
  var githubProvider = new firebase.auth.GithubAuthProvider();
  var auth = new firebase.auth();
  var database = new firebase.database();
  var loggedUser = {};
  var profileRef = database.ref('/profiles');

  // event listener for the login button
  $(".fb-login").click(function() {

    // sign in via popup
    // PRO TIP: remember, .then usually indicates a promise!
    auth.signInWithPopup(facebookProvider).then(function(result) {

      $(".logged-out-screen").hide();
      $(".logged-in-screen").show();         
      $("#login-modal").modal("hide");
      $(".messages-logged-out").hide();
      $(".messages-logged-in").show();
 

      // check for your profile
      profileRef.once("value").then(function(snapshot) {

        // get the snapshot value
        var snapshotValue = snapshot.val();

        // if no values present, just add the user
        if (snapshotValue == undefined || snapshotValue == null) {
          loggedUser = addNewUser(result, profileRef);
        }
        else {

          // iterate through the object, and determine if the
          // profile is present
          var keys = Object.keys(snapshotValue);
          var found = false;
          for (var i = 0; i < keys.length; i++) {

            // accessing objects:
            // way 1: objectname.objectvalue
            // way 2: objectname['objectvalue']
            if (snapshotValue[keys[i]].email == result.user.email) {
              
              // found the profile, access it
              loggedUser = snapshotValue[keys[i]];
              loggedUser.id = keys[i];
              found = true;
            }
          }      

          // profile is not found, add a new one
          if (!found) {
            loggedUser = addNewUser(result, profileRef);
          }
        } 

        // listen for todos and update on the fly
        var messageRef = database.ref('/messages/'+loggedUser.id);
        messageRef.on('value', function(snapshot) {

          var snapshotValue = snapshot.val();
          if (snapshotValue == undefined || snapshotValue == null) {
            $(".messages-logged-in").html(`

            `);
          }
          else {
            var keys = Object.keys(snapshotValue); 

            // populate the div with the class 'todo-list'
            $(".messages-logged-in").html("");
            for (var i = 0; i < keys.length; i++) {
              $(".messages-logged-in").append(`
                  <div class="col-sm-12 message-item">
                    ${snapshotValue[keys[i]]}
                  </div>
              `);
            }
          }
        }); 

      });

    }, function(error) {
      console.log("Oops! There was an error");
      console.log(error);
      });
  });    


  $(".gh-login").click(function() {

      auth.signInWithPopup(githubProvider).then(function(result) {

      $(".logged-out-screen").hide();
      $(".logged-in-screen").show();  
      $("#login-modal").modal("hide");
      $(".messages-logged-out").hide();
      $(".messages-logged-in").show();


      // check for your profile
      profileRef.once("value").then(function(snapshot) {

        // get the snapshot value
        var snapshotValue = snapshot.val();

        // if no values present, just add the user
        if (snapshotValue == undefined || snapshotValue == null) {
          loggedUser = addNewUser(result, profileRef);
        }
        else {

          // iterate through the object, and determine if the
          // profile is present
          var keys = Object.keys(snapshotValue);
          var found = false;
          for (var i = 0; i < keys.length; i++) {

            // accessing objects:
            // way 1: objectname.objectvalue
            // way 2: objectname['objectvalue']
            if (snapshotValue[keys[i]].email == result.user.email) {
              
              // found the profile, access it
              loggedUser = snapshotValue[keys[i]];
              loggedUser.id = keys[i];
              found = true;
            }
          }      

          // profile is not found, add a new one
          if (!found) {
            loggedUser = addNewUser(result, profileRef);
          }
        } 

        // listen for todos and update on the fly
        var messageRef = database.ref('/messages/'+loggedUser.id);
        messageRef.on('value', function(snapshot) {

          var snapshotValue = snapshot.val();
          if (snapshotValue == undefined || snapshotValue == null) {
            $(".messages-logged-in").html(`

            `);
          }
          else {
            var keys = Object.keys(snapshotValue); 

            // populate the div with the class 'todo-list'
            $(".messages-logged-in").html("");
            for (var i = 0; i < keys.length; i++) {
              $(".messages-logged-in").append(`
                  <div class="col-sm-12 message-item">
                    ${snapshotValue[keys[i]]}
                  </div>
              `);
              console.log(snapshotValue[keys[i]]);
            }
          }
        }); 

      });

    }, function(error) {
      console.log("Oops! There was an error");
      console.log(error);
      });
  });

   
  // adds message
  $("#send-btn").click(function() {

    if (Object.keys(loggedUser).length > 0) { 

      var messageRef = database.ref('/messages/'+loggedUser.id);

      // make sure the new message isn't blank
      if ($("#chat-entertexthere").val() != "") {

        // add the message and update the values. finally close the modal
        //messageRef.push($("#chat-entertexthere").val());
        messageRef.push(
          {
            'message': $("#chat-entertexthere").val(),
            'user_id': loggedUser.id
        }
        );
        $("#chat-entertexthere").val("");
      }
    }
  else {
   $("#login-modal").modal();
  }

  });


/*
  $("#btn-expand").click(function() {

    // check the state of the sidebar's data-toggle
    if ($(".sidebar-wrapper").data('toggle') == "expand") {

      // it's expanded, collapse it
      $(".sidebar-wrapper").data('toggle', 'collapse');
      $(".sidebar-wrapper").animate({
        width: "-=200px"
      }, 500, function() {
        
      });
    }
    else {

      // it's collapsed, expand it
      $(".sidebar-wrapper").data('toggle', 'expand');
      $(".sidebar-wrapper").animate({
        width: "+=200px"
      }, 500, function() {
        
      });
    }
  });
*/


  $(".btn-logout").click(function() {

    auth.signOut().then(function() {
      $(".logged-in-screen").hide();
      $(".logged-out-screen").show(); 
      loggedUser={};
      $(".messages-logged-in").hide();
      $(".messages-logged-out").show();
    }, function(error) {
        alert("Oops!  Couldn't log you out.  Here's why: "+error);
    });
  });


}); 


// function to add a new user
// (this isn't in document ready because it doesn't need to be initialized)
function addNewUser(result, ref) {
  var user = {
    name: result.user.displayName,
    email: result.user.email
  };

  var newUser = ref.push(user);
  user.id = newUser.key;
  return user;
}


	// @NOTE: it's probably a good idea to place your event 
	//		  listeners in here :)


