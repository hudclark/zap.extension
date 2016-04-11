var notes = null
var presence = null

window.onload = function() {
	var ref = new Firebase('https://zap-extension.firebaseio.com');
	var auth = ref.getAuth();
	if (auth) {
		startListening(auth.uid);
	}
}

function startListening(uid) {
	Firebase.goOnline();
	var connected = new Firebase('https://zap-extension.firebaseio.com/.info/connected');
	presence = new Firebase('https://zap-extension.firebaseio.com/presence/' + uid);
	connected.on('value', function(snapshot) {
		if (snapshot.val()) {
			presence.onDisconnect().remove();
			presence.set(true);
		}
	});

	notes = new Firebase("https://zap-extension.firebaseio.com/notifications/"
			+ uid);
	notes.on("child_added", newData, dataError);
}

function stopListening() {
	if (notes != null) notes.off("child_added");
	if (presence != null) presence.remove();
	Firebase.goOffline();
}

function newData(snapshot, prevChildKey) {
	var val = snapshot.val();
	snapshot.ref().remove();
	var opt = {
		type: "basic", 
		title: val.title,
		message: val.text,
		iconUrl: "icon.png"
	}
	chrome.notifications.create(opt, function(id) {
		timer = setTimeout(function(){
			chrome.notifications.clear(id);
		}, 2500);
	});
}

function dataError(errorObject) {
	console.log(errorObject.code)
}
