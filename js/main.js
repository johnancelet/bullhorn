// We keep a lastDistributionList in localStorage, which matches
// the last distribution list viewed on the web page.
// When the user clicks the 'transfer' button, the information
// of this list is transferred to dotmailer.
var MAIN = {
  lastDistributionList: undefined,

  initialize: function() {
    $('#login-form').on('submit', MAIN.submitLoginForm);
    $('#logout-button').on('click', MAIN.logout);
    $('#submit-distribution-list').on('click', MAIN.submitLastDistributionList);

    SHARED.storage.watch('lastDistributionList', MAIN.setLastDistributionList);

    // TODO
    //DM.events.on('401', MAIN.logout)
  },

  transitionTo: function (view) {
    $('view').hide();
    $('view ' + view).show();
  },

  // Initialize and watch a key in chrome local storage and call
  // the callback with the new value.
  syncedLocalValue: function (name, callback) {
    function wrappedCallback(hash) {
      if (!hash.hasOwnProperty(name)) {
        return;
      }
      callback(hash[name]);
    }
    chrome.storage.sync.get(name, wrappedCallback);
    chrome.storage.onChanged.addListener(wrappedCallback);
  },

  setLastDistributionList: function (list) {
    $('#distribution-list-name').html(list === undefined ? 'nothing' : list.name);
    MAIN.lastDistributionList = list;
  },
  submitLastDistributionList: function () {
    if (MAIN.lastDistributionList === undefined) {
      throw new Error("No distribution list set!");
    }
    SHARED.events.emit('transferDistributionList', {
      distributionList: MAIN.lastDistributionList
    });
  },

  // XXX this is a little tangled up, might want to revisit when
  //     things are running.
  submitLoginForm: function (event) {
    MAIN.login({
      username: $('login-username').val(),
      password: $('login-password').val()
    });
    event.preventDefault();
  },
  login: function (creds) {
    chrome.storage.sync.set({dotmailerCredentials: creds});
  },
  logout: function () {
    chrome.storage.sync.remove('dotmailerCredentials');
  }

}

$(MAIN.initialize);

chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  chrome.tabs.sendMessage(tabs[0].id, {greeting: "hello"}, function(response) {
    console.log(response.farewell);
  });
});
SHARED.withCurrentTabId(function (id) {
  chrome.tabs.sendMessage(id, '')
})