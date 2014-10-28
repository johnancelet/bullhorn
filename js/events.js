var EVENTS = {
  state: {},

  init: function () {
    SHARED.events.on('login', EVENTS.login);
    SHARED.events.on('logout', EVENTS.logout);
    SHARED.events.on('transferDistributionList', EVENTS.transferDistributionList);
    SHARED.storage.watch('dotmailerCredentials', EVENTS.setDotmailerCredentials);
  },

  // The purpose of this extension. It takes a Bullhorn distribution
  // list and sends its contacts to a dotmailer address book. (Because
  // of a hard limit of 500 on Bullhorn's api).
  transferDistributionList: function (params) {
    SHARED.notifications.create('transfer', {
      type: "progress",
      title: "Bullhorn to Dotmailer",
      message: "Transferring " + params.distributionList.name
    })

    Bullhorn(params.config)
      .fetchDistributionList(params.distributionList.id)
      .then(DM.updateAddressBookByName.bind(null, params.distributionList.id))
      .then(function () {
        SHARED.notifications.create('transfer', {
          type: "progress",
          title: "Bullhorn to Dotmailer",
          message: "Transfer of " + params.distributionList.name + " was successful.",
          progress: 100,
        })
      })
      .fail(function (reason) {
        SHARED.notifications.create('transfer', {
          message: "Transfer of " + params.distributionList.name + " failed. (" + reason + ")",
          title: "Bullhorn to Dotmailer",
          buttons: [{title: 'Retry'}],
        })
      })
   },

  // Dotmailer auth management
  //
  // The credentials are kept in local storage and synced with
  // the dotmailer singleton. The session is considered up as long
  // as they're there.
  login: function (creds) {
    chrome.storage.sync.set({dotmailerCredentials: creds});
  },
  logout: function () {
    chrome.storage.sync.remove('dotmailerCredentials');
  },
  setDotmailerCredentials: function (creds) {
    if (creds) {
      DM.login(creds).fail(EVENTS.logout);
    } else {
      DM.logout();
    }
  }

};
