(function () {
  function getLocalSafe(key) {
    try {
      return JSON.parse(localStorage[key]);
    } catch(err) {
      return null;
    }
  }

  function getBullhornParameters() {
    return {
      distributionList: (getLocalSafe('PersonList') || {}).distributionList,
      config: {
        privateLabel: getLocalSafe('PrivateLabel'),
        restToken: getLocalSafe('BhRestToken'),
      }
    }
  }

  SHARED.events.on('getBullhornParameters', function (data, sender, sendResponse) {
    console.log(getBullhornParameters());
    sendResponse(getBullhornParameters());
  })
})();
