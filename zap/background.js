const FIREBASE_ROOT = "https://zap-extension.firebaseio.com";
const DEFAULT_IMG = "img/icon128.png"
const IMG_ENCODE = "data:image/png;base64,";
var notes = null
var presence = null
var icons = null

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
		}
	});
	icons = new Firebase(FIREBASE_ROOT + "/icons");
	notes = new Firebase(FIREBASE_ROOT + "/notifications/" + uid);
	notes.on("child_added", newData, dataError);
}

function stopListening() {
	if (notes != null) notes.off("child_added");
	if (presence != null) presence.remove();
	icons = null;
	Firebase.goOffline();
}

function newData(snapshot, prevChildKey) {
	var val = snapshot.val();
	snapshot.ref().remove(); // delete notification from filebase
	var title = val.title;
	var text = val.text;
	if (icons != null) {
		icons.child(val.app).on("value", function(snap) {
			if (snap.exists()) {
				notify(title, text, getImage(snap.val()));
			} else {
				notify(title, text);
			}
		});
	} else {
		notify(title, text);
	}
}

function notify(title, text, img = DEFAULT_IMG) {
	var opt = {
		type: "basic", 
		title: title,
		message: text,
		iconUrl: img
	}
	chrome.notifications.create(opt);
}

function getImage(string) {
	if (string == "") return DEFAULT_IMG;
	return  IMG_ENCODE + string;
}

function dataError(errorObject) {
	console.log(errorObject.message);
	new Firebase(FIREBASE_ROOT).unauth();
	stopListening(); // disconnects from firebase.
}
