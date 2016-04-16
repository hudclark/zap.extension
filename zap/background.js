const FIREBASE_ROOT = "https://zap-extension.firebaseio.com";
const DEFAULT_IMG = "img/icon128.png";
const IMG_ENCODE = "data:image/png;base64,";
var root = new Firebase(FIREBASE_ROOT);
var notes = null;
var presence = null;
var icons = null;

window.onload = function() {
	Firebase.goOnline();
	// if already authed, start listening 
	var auth = root.getAuth();
	if (auth) {
		startListening(auth.uid);
	}
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if (request.action == "login") {
		login(request.user, request.pass);
	}
	else if (request.action == "logout") {
		logout();
	} 
	else if (request.action == "setView") {
		setView();
	}
});

function login(user, pass) {
	Firebase.goOnline();
	root.authWithPassword({
		email: user,
		password: pass 
	}, authHandler);
	sendMsg({action:"error", msg:""});
	sendMsg({action:"toggleLoader", loading:true});
}

function logout() {
	stopListening();
	if (root != null)
		root.unauth();
	sendMsg({action:"toggleLogin", loggedIn:false});
}

function authHandler(error, authData) {
	if (error) {
		sendMsg({action:"error", msg:error.message});
	} else {
		sendMsg({action:"toggleLogin", loggedIn:true});
		sendMsg({action:"setText", id:"user",
			text:"Logged in as " + authData.password.email});
		startListening(authData.uid);
	}
	sendMsg({action:"toggleLoader", loading:false});
}

function setView() {
	var auth = root.getAuth();
	if (auth) {
		sendMsg({action:"setText", id:"user", 
			text:"Logged in as " + auth.password.email});
		sendMsg({action:"toggleLogin", loggedIn:true});
	} else {
		sendMsg({action:"toggleLogin", loggedIn:false});
	}
}

function startListening(uid) {
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
	logout();
	sendMsg({action:"error", msg:"Error authenticating"});
	chrome.runtime.sendMessage({
		action: "logout",
		msg: "Error Authenticating"
	});
}

function sendMsg(params) {
	chrome.runtime.sendMessage(params);
}
