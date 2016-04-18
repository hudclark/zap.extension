window.onload = function() {
	// should probably show a spinner while this is happening.
	sendMsg({action:"setView"});
	document.getElementById("logout-btn").addEventListener("click", function() {
		sendMsg({action:"logout"});
	});
	document.getElementById("login-btn").addEventListener("click", startLogin);
	document.getElementById("password").addEventListener("keypress", function(e) {
		if (e.keyCode == 13) { startLogin(); }
	});
	document.getElementById("toggle-notifications").addEventListener("click", toggleNotifications);
};
window.addEventListener('click', function(e) {
	if (e.target.href !== undefined) {
		chrome.tabs.create({url:e.target.href});
	}
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if (request.action == "setText") {
		setText(request.id, request.text);
	}
	if (request.action == "error") {
		setText('error', request.msg);
	}
	else if (request.action == "hide") {
		hide(request.id);
	}
	else if (request.action == "show") {
		show(request.id);
	}
	else if (request.action == "toggleLoader") {
		toggleLoader(request.loading);
	}
	else if (request.action == "toggleLogin") {
		toggleLogin(request.loggedIn);
	}
	else if (request.action == "toggleSwitch") {
		toggleSwitch(request.on);
	}
});

function toggleNotifications() {
	var toggle = document.getElementById("toggle-notifications");
	if (toggle.checked) {
		sendMsg({action:"toggleNotifications", notify:true});
	} else {
		sendMsg({action:"toggleNotifications", notify:false});
	}
}

function startLogin() {
	sendMsg({action:"login", user:getText('email'), pass:getText('password')});
}

function sendMsg(params) {
	chrome.runtime.sendMessage(params);
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

function toggleLogin(loggedIn) {
	if (loggedIn) {
		setHeight('242px');
		hide('logged-in');
		show('logged-out');
	} else {
		setHeight('356px');
		show('logged-in');
		hide('logged-out');
		toggleSwitch(true);
	}
}

function setHeight(height) {
	document.documentElement.style.height = height;
	document.body.style.height = height;
}

function toggleSwitch(on) {
	if (on) {
		document.querySelector('#toggle-notifications').parentElement.MaterialSwitch.on();
	}
	else {
		document.querySelector('#toggle-notifications').parentElement.MaterialSwitch.off();
	}
}
