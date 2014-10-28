var CONTENT = {
  init: function () {
    SHARED.events.on('getBullhornParameters', function (data, sender, sendResponse) {
      sendResponse(CONTENT.getBullhornParameters());
    })
  },

  // TODO guard against parsing errors
  getBullhornParameters: function () {
    var params = {
      config: {}
    }

    if (localStorage.PersonList) {
      params.distributionList = JSON.parse(localStorage.PersonList).distributionList;
    }

    if (localStorage.PrivateLabel) {
      params.config.privateLabel = JSON.parse(localStorage.PrivateLabel);
    }

    if (localStorage.BhRestToken) {
      params.config.restToken = JSON.parse(localStorage.BhRestToken);
    }

    return params;
  }
}

$(CONTENT.init);
