
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
  var auth = new firebase.auth();
  var database = new firebase.database();
  var loggedUser = {};
  var profileRef = database.ref('/profiles');

  // event listener for the login button
  $("#btn-login").click(function() {

    // sign in via popup
    // PRO TIP: remember, .then usually indicates a promise!
    auth.signInWithPopup(facebookProvider).then(function(result) {

      $(".login-window").hide();
      $(".main-window").show();

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
            $(".chat-body").html(`
                 <div class="col-sm-7">
                    <p class="message">No messages yet.</p>
                  </div>
            `);
          }
          else {
            var keys = Object.keys(snapshotValue); 

            // populate the div with the class 'todo-list'
            $(".chat-body").html("");
            for (var i = 0; i < keys.length; i++) {
              $(".chat-body").append(`
                  <div class="col-sm-2">
                    <input class="message" data-id="${keys[i]}">
                  </div>
                  <div class="col-sm-10">
                    ${snapshotValue[keys[i]]}
                  </div>
              `);
            }

                  /*
            // complete a to-do, listens on the checkbox
            $(".todo-done").click(function() {
              var deleteID = $(this).data("id");
              var delTodoRef = database.ref('/todos/'+loggedUser.id+'/'+deleteID);

              delTodoRef.remove(); 
 
            }); */
          }
        }); 
      });

    }, function(error) {
      console.log("Oops! There was an error");
      console.log(error);
    });
  });                 

  // opens a modal to add a new todo
  //$("#btn-add-todo-window").click(function() {
  //});
   
  // actually adds the todo
  $("#send-btn").click(function() {

    var messageRef = database.ref('/messages/'+loggedUser.id);

    // make sure the new todo isn't blank
    if ($("#chat-messages").val() != "") {

      // add the todo and update the values. finally close the modal
      messageRef.push($("#chat-messages").val());
      $("#chat-messages").val("");
    }
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


