
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

    auth.signInWithPopup(facebookProvider).then(function(result) {
      sign_in(profileRef, result, database);
 
    }, function(error) {
      console.log("Oops! There was an error");
      console.log(error);
      });
  });    


  $(".gh-login").click(function() {

      auth.signInWithPopup(githubProvider).then(function(result) {
        sign_in(profileRef, result, database);

    }, function(error) {
      console.log("Oops! There was an error");
      console.log(error);
      });
  });

   
  $("#send-btn").click(function() {
    send_message();
  });

  $("#chat-entertexthere").keypress(function(e) {
    if(e.keyCode == 13) {
        send_message();
    }
});


  var gameInfo = {
    '1': {
          'name': 'Grand Theft Auto V',
          'events': 'Specter car show meetup this Saturday at 3pm EST.'
          },

    '2': {
          'name': 'Star Wars Battlefront',
          'events': 'Rogue One ingame discussion, all day Sunday. WARNING: SPOILERS!'
          },

    '3': {
          'name': 'Call of Duty',
          'events': 'Free for All tournament soon. Contact Johnny for entry.'
 
          },
    '4': {
          'name': 'Minecraft',
          'events': 'New update out now.'
          },
    '5': {
          'name': 'Rocket League',
          'events': 'Tournament finals this weekend. Streaming on Twitch.'
          }
  }

  $(".btn-channel").click(function() { 
    var channelID = $(this).data('channelId'); // declares the variable by getting the channel id data attribute
    $("#send-btn").data("currentChannel", channelID); // Adds the data attribute and value to the send button
    
    load_channel_messages(loggedUser.id, database);
    $("#game-title").text(gameInfo[channelID]['name']);
    $("#game-events").text(gameInfo[channelID]['events']);

});
  

  $(".btn-sidebar").click(function() {

    var sidebar = $(".sidebar-wrapper");
    sidebar.toggle();

  });

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


// function to add a new user
// (this isn't in document ready because it doesn't need to be initialized)
function addNewUser(result, ref) {
  var user = {
    name: result.user.displayName,
    email: result.user.email,
    photo_url: result.user.photoURL
  };

  var newUser = ref.push(user);
  user.id = newUser.key;
  return user;
}

function load_channel_messages(logged_user_id, database){


  var current_channel = $("#send-btn").data('currentChannel');

  // listen for todos and update on the fly
  var messageRef = database.ref('/messages/').child(current_channel);

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
          <div class="row each-message">
            <div class="col-sm-3">
              <img class="responsive-img profile-pic" src="${snapshotValue[keys[i]]['photo_url']}"/>
            </div>
            <div class="username">
              ${snapshotValue[keys[i]]['name']}
            </div>
            <div class="time">
              ${snapshotValue[keys[i]]['timestamp']}
            </div>
            <div class="col-sm-9 message-item">
              ${snapshotValue[keys[i]]['message']}
            </div>
          </div>  
        `);
      }
    }
  }); 

}


function send_message() {
   if (Object.keys(loggedUser).length > 0) { 

      var current_channel = $("#send-btn").data('currentChannel');

      var messageRef = database.ref('/messages/').child(current_channel);

      // make sure the new message isn't blank
      if ($("#chat-entertexthere").val() != "") {

        // add the message and update the values. finally close the modal
        
        //messageRef.push($("#chat-entertexthere").val());

                // Create a new JavaScript Date object based on the timestamp

        messageRef.push(
          {
            "message": $("#chat-entertexthere").val(),
            "photo_url": loggedUser.photo_url,
            "name": loggedUser.name,
            "timestamp": Date()
          }
        );


        $("#chat-entertexthere").val("");

      }
    }
  else {
   $("#login-modal").modal();
  }
}


function sign_in(profileRef, result, database){
  $(".logged-out-screen").hide();
  $(".logged-in-screen").show();         
  $("#login-modal").modal("hide");
  $(".messages-logged-out").hide();
  $(".messages-logged-in").show(); 
  $("#sidebar-channel-names").show();

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

    load_channel_messages(loggedUser.id, database);

  });

}

  //Check to see if the window is top if not then display button
  $(window).scroll(function(){
    if ($(this).scrollTop() > 100) {
      $('.scrollToTop').fadeIn();
    } else {
      $('.scrollToTop').fadeOut();
    }
  });
  
  //Click event to scroll to top
  $('.scrollToTop').click(function(){
    $('html, body').animate({scrollTop : 0},800);
    return false;
  });

}); 

	// @NOTE: it's probably a good idea to place your event 
	//		  listeners in here :)


