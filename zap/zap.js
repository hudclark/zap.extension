var ref = new Firebase("https://zap-extension.firebaseio.com");

window.onload = function() {
	document.getElementById("logout-btn").addEventListener("click", logout);
	document.getElementById("login-btn").addEventListener("click", login);
	var auth = ref.getAuth();
	if (auth) {
		console.log("user is logged in");
		hide("login");
	} else {
		hide("logout-btn");
	}
};

function authHandler(error, authData) {
	if (error) {
		console.log("Login failed", error);
	} else {
		console.log("Authed");
		hide("login");
		show("logout-btn");
		chrome.extension.getBackgroundPage().startListening(authData.uid);
	}
}

function login() {
	console.log("Logging in...");
	ref.authWithPassword({
		email: getText("email"),
		password: getText("password")
	}, authHandler);
}

function logout() {
	ref.unauth();
	chrome.extension.getBackgroundPage().stopListening();
	hide("logout-btn");
	show("login");
}

function hide(id) {
	document.getElementById(id).style.display = 'none';
}

function show(id) {
	document.getElementById(id).style.display = 'block';
}

function getText(id) {
	return document.getElementById(id).value;
}
