var SHARED = {

  events: {

    emit: function (type, data, callback) {
      console.log('events.emit', type, data, !!callback);
      chrome.runtime.sendMessage({type: type, data: data}, callback);
    },

    on: function (type, callback) {
      console.log('events.on', type, callback);
      chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
        console.log('LISTENERED')
        if (message.type === type) {
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
      chrome.storage.sync.set(params);
    }
  },


  tabs: {

    current: function (callback) {
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        callback(tabs[0]);
      });
    },

    // Open an extension page
    open: function (url) {
      var url = chrome.extension.getURL(url);
      chrome.tabs.query({url: url}, function(results) {
        if (results.length) {
          chrome.tabs.update(results[0].id, {active:true});
        } else {
          chrome.tabs.create({url: url});
        }
      })
    }

  }


}
