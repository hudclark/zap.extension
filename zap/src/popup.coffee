window.onload = ->
	sendMsg {action:"setView"}
	document.getElementById("logout-btn").addEventListener("click", ->
		sendMsg {action:"logout"})
	document.getElementById("login-btn").addEventListener("click", startLogin)
	document.getElementById("toggle-notifications").addEventListener("click", toggleNotifications)
	document.getElementById("password").addEventListener("keypress", (e) ->
		if e.keyCode is 13 then startLogin())

window.addEventListener("click", (e) ->
	if e.target.href? then chrome.tabs.create {url:e.target.href})

chrome.runtime.onMessage.addListener((request, sender, sendResponse) ->
	switch request.action
		when "setText" then setText request.id, request.text
		when "error" then setText "error", request.msg
		when "hide" then toggleVisibilty request.id, false
		when "show" then toggleVisibility request.id, true
		when "toggleLoader" then toggleLoader request.loading
		when "toggleLogin" then toggleLogin request.loggedIn
		when "toggleSwitch" then toggleSwitch request.on
)

toggleNotifications = ->
	sendMsg {action:"toggleNotifications", notify:document.getElementById("toggle-notifications").checked}

startLogin = -> sendMsg {action:"login", user:getText("email"), pass:getText("password")}

sendMsg = (params) -> chrome.runtime.sendMessage params

#---------------- ui helpers --------------------------------------

setText = (id, msg) -> document.getElementById(id).innerHTML = msg

getText = (id) -> document.getElementById(id).value

toggleVisibilty = (id, visible) ->
	document.getElementById(id).style.display = if visible then "block" else "none"

toggleLoader = (loading) ->
	toggleVisibilty "loader", loading
	toggleVisibilty "login-btn", not loading

toggleLogin = (loggedIn) ->
	toggleVisibilty "logged-in", not loggedIn
	toggleVisibilty "logged-out", loggedIn
	if loggedIn
		setHeight "242px"
	else
		setHeight "356px"
		toggleSwitch true

setHeight = (height) ->
	document.documentElement.style.height = height
	document.body.style.height = height

toggleSwitch = (isOn) ->
	if isOn
		document.querySelector('#toggle-notifications').parentElement.MaterialSwitch.on()
	else
		document.querySelector('#toggle-notifications').parentElement.MaterialSwitch.off()
