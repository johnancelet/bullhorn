// Saves options to chrome.storage
function saveOptions() {
  var username = document.getElementById('username').value;
  var password = document.getElementById('password').value;

  chrome.storage.sync.set({
    dotmailerCredentials: {
      username: username,
      password: password
    }
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restoreOptions() {
  chrome.storage.sync.get({
    dotmailerCredentials: {}
  }, function(items) {
    document.getElementById('username').value = items.dotmailerCredentials.username || '';
    document.getElementById('password').value = items.dotmailerCredentials.password || '';
  });
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);
