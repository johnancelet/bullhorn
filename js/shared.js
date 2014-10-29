// A collection of light wrappers around the chrome api
// to enforce behaviour across the extension.
var SHARED = {

  // Named event interface
  events: {

    emit: function (type, data, callback) {
      chrome.runtime.sendMessage({type: type, data: data}, callback);
    },

    on: function (type, callback) {
      chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
        if (message.type === type) {
          callback(message.data, sender, sendResponse);
        }
      })
    }
  },

  storage: {

    // Specifiy a callback to call for the current value
    // of a storage entry and any future changes.
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

    // Very light wrapper to set a single value in local storage.
    // Mainly there to allow for easy creating by key stored in a variable.
    set: function (key, value) {
      var params = {};
      params[key] = value;
      chrome.storage.sync.set(params);
    }
  },


  tabs: {

    // Call the callback with the current tab as its single argument
    current: function (callback) {
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        callback(tabs[0]);
      });
    },

    // Open an extension page (like options.html)
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

  },


  notifications: {
    create: function (name, options, callback) {
      options         = options || {};
      options.iconUrl = options.iconUrl || "images/foo.png";
      options.type    = options.type || "basic";
      options.title   = options.title || "Needs title!";
      options.message = options.message || "Needs message!";
      callback = callback || function (id) {}
      return chrome.notifications.create(name, options, callback);
    },

    update: function (name, options, callback) {
     callback = callback || function (id) {}
      return chrome.notifications.update(name, options, callback);
    },

  }


}
