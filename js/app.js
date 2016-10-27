
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

   
  // adds message
  $("#send-btn").click(function() {

    if (Object.keys(loggedUser).length > 0) { 

      var current_channel = $(this).data('currentChannel');

      var messageRef = database.ref('/messages/').child(current_channel);

      // make sure the new message isn't blank
      if ($("#chat-entertexthere").val() != "") {

        // add the message and update the values. finally close the modal
        
        //messageRef.push($("#chat-entertexthere").val());

        messageRef.push(
          {
            "message": $("#chat-entertexthere").val(),
            "photo_url": loggedUser.photo_url,
            "name": loggedUser.name
          }
        );


        $("#chat-entertexthere").val("");
      }
    }
  else {
   $("#login-modal").modal();
  }

  });


  var gameInfo = {
    '1': {
          'name': 'Grand Theft Auto V',
          'description': "Grand Theft Auto V is a third and first person open world action-adventure game developed by Rockstar Games. It is available for PS4, Xbox One, and PC. It is set within \'Los Santos\' which is a fictional representation of Los Angles, California. The single-player follows three criminals as they live their life robbing banks. It also comes with a massively popular Online counterpart.",
          'links': {
            'wikipedia': 'https://en.wikipedia.org/wiki/Grand_Theft_Auto_V',
            'official': 'http://www.rockstargames.com/V/',
            'trailer': 'https://www.youtube.com/watch?v=QkkoHAzjnUs'
            },
          },

    '2': {
          'name': 'Fallout 4',
          'description': "Fallout 4 is a third and first person action role-playing video game developed by Bethesda Softworks. It is available for PS4, Xbox One, and PC. The game is set within an open world post-apocalyptic environment that encompasses the city of Boston and the surrounding Massachusetts region known as \'The Commonwealth\'. The main story takes place in the year 2287, 210 years after \'The Great War\' that caused catastrophic nuclear devastation across the United States.",
          'links': {
            'wikipedia': 'https://en.wikipedia.org/wiki/Fallout_4',
            'official': 'https://www.fallout4.com/',
            'trailer': 'https://www.youtube.com/watch?v=X5aJfebzkrM'
            }
          },

    '3': {
          'name': 'Red Dead Redemption',
          'description': "Red Dead Redemption 2 is a third person open world western action-adventure video game developed by Rockstar Games. Red Dead Redemption 2 is an upcoming sequel to Red Dead Redemption 1, being released in Fall of 2017 and will be available for PS4 and Xbox One. Red Dead Redemption 1, which is available for PS3 and Xbox 360, is set during the decline of the American Frontier in the year 1911 and takes place on the border between Southern United States and Northern Mexico.",
          'links': {
            'wikipedia': 'https://en.wikipedia.org/wiki/Red_Dead_Redemption_2',
            'official': 'http://www.rockstargames.com/reddeadredemption/',
            'trailer': 'https://www.youtube.com/watch?v=gmA6MrX81z4'
            }
          }
  }

  $(".btn-channel").click(function() { 
    var channelID = $(this).data('channelId'); // declares the variable by getting the channel id data attribute
    $("#send-btn").data("currentChannel", channelID); // Adds the data attribute and value to the send button
    
    load_channel_messages(loggedUser.id, database);
    $("#game-title").text(gameInfo[channelID]['name']);
    $("#game-desc").text(gameInfo[channelID]['description']);
    $("#wiki-link").attr('href', gameInfo[channelID]['links']['wikipedia']);
    $("#trailer-link").attr('href', gameInfo[channelID]['links']['trailer']);
    $("#gamesite-link").attr('href', gameInfo[channelID]['links']['official']);

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
            <div class="col-sm-9 message-item">
              ${snapshotValue[keys[i]]['message']}
            </div>
          </div>  
        `);
      }
    }
  }); 

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


