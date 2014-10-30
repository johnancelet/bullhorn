// Saves options to chrome.storage
function saveOptions() {
  var username = document.getElementById('username').value;
  var password = document.getElementById('password').value;

  var status = document.getElementById('status');

  status.textContent = 'Busy...';

  var creds = {
    username: username,
    password: password
  }

  Dotmailer()
    .authenticate(creds)
    .then(function () {
      chrome.storage.sync.set({
        dotmailerCredentials: creds
      }, function () {
        status.textContent = "You're all good to go now!";
      });
    })
    .fail(function () {
      // chrome.storage.sync.remove('dotmailerCredentials');
      status.textContent = "Something seems wrong with the credentials";
    });

}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restoreOptions() {
  console.log("RESTORE!")
  chrome.storage.sync.get({
    dotmailerCredentials: {}
  }, function (items) {
    document.getElementById('username').value = items.dotmailerCredentials.username || '';
    document.getElementById('password').value = items.dotmailerCredentials.password || '';
  });
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);
