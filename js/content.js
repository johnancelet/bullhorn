var CONTENT = {
  initialize: function () {
    CONTENT.storage.watch('BhRestToken', function (token) {
      SHARED.storage.set('restToken', token);
    }

    CONTENT.storage.watch('PrivateLabel', function (label) {
      SHARED.storage.set('privateLabel', label);
    }

    CONTENT.storage.watch('PersonList', function (data) {
      SHARED.storage.set('lastDistributionList', data.distributionList)
    }

    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
      if (request.event === 'bullhornParameters') {
        JSON.parse(localStorage['restToken'])
        JSON.parse(localStorage['privateLabel'])
        // TODO error handling
        distributionList: JSON.parse(localStorage['PersonList']).distributionList;
      }
    })
  },

  storage: {
    // Watch json values in local storage
    watch: function (key, callback, useCapture) {
      function wrappedCallback(value) {
        callback(JSON.parse(value));
      }

      window.addEventListener('storage', function (event) {
        if (event.key !== key) {
          return;
        }
        wrappedCallback(event.newValue);
      }, useCapture);
      wrappedCallback(localStorage[key]);
    }
  }
}
