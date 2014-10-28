var EVENTS = {
  init: function () {
    SHARED.events.on('login', EVENTS.login)
    SHARED.events.on('logout', EVENTS.logout)
    SHARED.events.on('transferDistributionList', EVENTS.transferDistributionList)
    SHARED.storage.watch('dotmailerCredentials', EVENTS.setDotmailerCredentials)
  },
  login: function (creds) {
    chrome.storage.sync.set({dotmailerCredentials: creds});
  },
  logout: function () {
    chrome.storage.sync.remove('dotmailerCredentials');
  },
  transferDistributionList: function (params) {
    Bullhorn(params.config)
      .fetchDistributionList(params.distributionList.id)
      .then(DM.updateAddressBookByName.bind(null, params.distributionList.id))
  },
  setDotmailerCredentials: function (creds) {
    if (creds) {
      DM.login(creds).fail(EVENTS.logout);
    } else {
      DM.logout();
    }
  }
}
