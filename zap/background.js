const FIREBASE_ROOT = "https://zap-extension.firebaseio.com";
var notes = null
var presence = null

window.onload = function() {
	// if already authed, start listening
	var ref = new Firebase(FIREBASE_ROOT);
	var auth = ref.getAuth();
	if (auth) {
		startListening(auth.uid);
	}
}

function startListening(uid) {
	Firebase.goOnline();
	var presence = new Firebase(FIREBASE_ROOT + "/presence/" + uid);
	var connected = new Firebase(FIREBASE_ROOT + '/.info/connected');
	connected.on('value', function(snapshot) {
		if (snapshot.val() === true) {
			presence.onDisconnect().remove();
			presence.set(true);
			notes = new Firebase(FIREBASE_ROOT + "/notifications/" + uid);
			notes.on("child_added", newData, dataError);
		}
	});
}

function stopListening() {
	if (notes != null) notes.off("child_added");
	if (presence != null) presence.remove();
	Firebase.goOffline();
}

function newData(snapshot, prevChildKey) {
	var val = snapshot.val();
	snapshot.ref().remove(); // delete notification from filebase
	var opt = {
		type: "basic", 
		title: val.title,
		message: val.text,
		iconUrl: "img/icon128.png"
	}
	chrome.notifications.create(opt);
}

function dataError(errorObject) {
	console.log(errorObject.message);
	new Firebase(FIREBASE_ROOT).unauth();
	stopListening(); // disconnects from firebase.
}
