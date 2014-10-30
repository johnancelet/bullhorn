// Saves options to chrome.storage
function saveOptions(event) {
  event.preventDefault();

  var username = $('#username').val();
  var password = $('#password').val();
  var status = $('#status');

  status.removeClass('negative positive');
  status.text('Busy...');

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
        status.text("You're all good to go now!");
        status.addClass('positive');
        status.removeClass('negative');
      });
    })
    .fail(function () {
      // chrome.storage.sync.remove('dotmailerCredentials');
      status.text("Something seems wrong with the credentials");
        status.addClass('negative');
        status.removeClass('positive');
    });

}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restoreOptions() {
  chrome.storage.sync.get({
    dotmailerCredentials: {}
  }, function (items) {
    $('#username').val(items.dotmailerCredentials.username || '');
    $('#password').val(items.dotmailerCredentials.password || '');
  });
}

$(restoreOptions);
$('#save').on('click', saveOptions);
