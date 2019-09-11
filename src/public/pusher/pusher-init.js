// Sockets now
(function(glob) {
  // Enable pusher logging - don't include this in production
  const _isDev = window.location.port.indexOf('3000') > -1;
  console.log(`>>>> is dev? '${_isDev}'`)
  Pusher.logToConsole = _isDev ? true : false;

  var pusher = new Pusher(_isDev? "b9f4a0b1a86c48004210" : "e9f98b03d8e53fb54c93", {
    cluster: "eu",
    encrypted: true,
    forceTLS: true
  });
  pusher.connection.bind("connected", function() {
    console.log("Pusher connection successful");
    console.log(pusher.connection);
  });
  pusher.connection.bind("error", function(err) {
    if (err.error.data.code === 4004) {
      alert("Pusher detected limit error. We can't connect you now.");
      location.href = "/";
    }
  });
  glob.pusher = pusher;
  glob.channel = null;
  glob.gameChannel = null;
})(this); // 'this' will be 'window' or 'module' or ... depending on the client
