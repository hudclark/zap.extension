var ref = new Firebase("https://zap-extension.firebaseio.com");

window.onload = function() {
	document.getElementById("logout-btn").addEventListener("click", logout);
	document.getElementById("login-btn").addEventListener("click", login);
	document.getElementById("password").addEventListener("keypress", function(e) {
		if (e.keyCode == 13) { login(); }
	});
	var auth = ref.getAuth();
	if (auth) {
		setText('user', "Logged in as " + auth.password.email);
		toggleLoginView(true);
	} else {
		toggleLoginView(false);
	}
};

function authHandler(error, authData) {
	if (error) {
		setText('error', error.message);
	} else {
		toggleLoginView(true);
		setText('user', "Logged in as " + authData.password.email);
		chrome.extension.getBackgroundPage().startListening(authData.uid);
	}
	toggleLoader(false);
}

function login() {
	ref.authWithPassword({
		email: getText('email'),
		password: getText('password')
	}, authHandler);
	setText('error', '');
	toggleLoader(true);
}

function logout() {
	chrome.extension.getBackgroundPage().stopListening();
	ref.unauth();
	toggleLoginView(false);
}

// --------- ui helper methods ------------------------

function hide(id) {
	document.getElementById(id).style.display = 'none';
}

function show(id) {
	document.getElementById(id).style.display = 'block';
}

function setText(id, msg) {
	document.getElementById(id).innerHTML = msg;
}

function getText(id) {
	return document.getElementById(id).value;
}

function toggleLoader(loading) {
	if (loading) {
		show('loader');
		hide('login-btn'); 
	} else {
		hide('loader');
		show('login-btn'); 
	}
}

function toggleLoginView(loggedIn) {
	if (loggedIn) {
		hide('logged-in');
		show('logged-out');
	} else {
		show('logged-in');
		hide('logged-out');
	}
}
