FIREBASE_ROOT = "https://zap-extension.firebaseio.com"
DEFAULT_IMG = "img/icon128.png"
IMG_ENCODE = "data:image/png;base64,"
root = new Firebase(FIREBASE_ROOT)
notes = null
presence = null
icons = null
listening = false

window.onLoad = ->
	auth = getAuth()
	if auth then startListening auth.uid

chrome.runtime.onMessage.addListener((request, sender, sendResponse) ->
	switch request.action
		when "login" then login request.user, request.pass
		when "logout" then logout()
		when "setView" then setView()
		when "toggleNotifications"
			if request.notify then startListening root.getAuth().uid else stopListening()
)

chrome.notifications.onClicked.addListener((id) -> chrome.notifications.clear(id))

login = (user, pass) ->
	root.authWithPassword {email:user, password:pass}, authHandler
	sendMsg {action:"error", msg:""}
	sendMsg {action:"toggleLoader", loading:true}
	
logout = ->
	stopListening()
	root?.unauth()
	sendMsg {action:"toggleLogin", loggedIn:false}

authHandler = (error, authData) ->
	if error then sendMsg {action:"error", msg:error.message}
	else
		sendMsg {action:"toggleLogin", loggedIn:true}
		sendMsg {action:"setText", id:"user", text:"Logged in as #{authData.password.email}"}
		startListening authData.uid
	sendMsg {action:"toggleLoader", loading:false}

setView = ->
	auth = root.getAuth()
	if auth
		sendMsg {action:"toggleLogin", loggedIn:true}
		sendMsg {action:"setText", id:"user", text:"Logged in as #{auth.password.email}"}
		if not listening then sendMsg {action:"toggleSwitch", on:false}
	else sendMsg {action:"toggleLogin", loggedIn:false}

startListening = (uid) ->
	presence = new Firebase("#{FIREBASE_ROOT}/presence/#{uid}")
	connected = new Firebase("#{FIREBASE_ROOT}/.info/connected")
	connected.on "value", (snapshot) ->
		if snapshot.val()
			presence.onDisconnect().remove()
			presence.set true
	icons = new Firebase("#{FIREBASE_ROOT}/icons")
	notes = new Firebase("#{FIREBASE_ROOT}/notifications/#{uid}")
	notes.on "child_added", newData, dataError
	listening = true

stopListening = ->
	notes?.off "child_added"
	presence?.remove()
	listening = false

newData = (snapshot, prevChildKey) ->
	val = snapshot.val()
	snapshot.ref().remove()
	title = val.title
	text = val.text
	if icons? then icons.child(val.app).on "value", (snap) ->
		if snap.exists() then notify(title, text, getImage snap.val())
		else notify(title, text)
	else notify(title, text)

notify = (title, text, img = DEFAULT_IMG) ->
	opt = {type:"basic", title:title, message:text, iconUrl:img}
	chrome.notifications.create opt

getImage = (string) ->
	if string is "" then return DEFAULT_IMG
	else return IMG_ENCODE + string

dataError = (errorObject) ->
	console.log errorObject.message
	logout()
	sendMsg {action:error, msg:"Error authenticating"}
	
sendMsg = (params) -> chrome.runtime.sendMessage params
