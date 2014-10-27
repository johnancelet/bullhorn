var SHARED = {
  events: {
    emit: function (name, data) {
      chrome.runtime.sendMessage({event: name, data: data});
    }
    on: function (name, callback) {
      chrome.runtime.onMessage.addListener(function (message, sender, sendReponse) {
        if (message.event === name) {
          callback(message.data, sender, sendResponse);
        }
      })
    }
  },
  storage: {
    watch: function (name, callback) {
      function wrappedCallback(hash) {
        if (!hash.hasOwnProperty(name)) {
          return;
        }
        callback(hash[name]);
      }
      chrome.storage.sync.get(name, wrappedCallback);
      chrome.storage.onChanged.addListener(wrappedCallback);
    },
    set: function (key, value) {
      var params = {};
      params[key] = value;
      chrome.storage.sync.set(params);;
    }
  },
  withCurrentTabId: function (callback) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      callback(tabs[0].id);
    });
  }
}
