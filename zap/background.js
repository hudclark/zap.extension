var notes = null
function startListening(uid) {
	Firebase.goOnline();
	var connected = new Firebase('https://zap-extension.firebaseio.com/.info/connected');
	var presence = new Firebase('https://zap-extension.firebaseio.com/presence/' + uid);
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
	chrome.notifications.create(opt);
}

function dataError(errorObject) {
	console.log(errorObject.code)
}
