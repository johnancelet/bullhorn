var EVENTS = {

  init: function () {
    SHARED.events.on('login', EVENTS.login);
    SHARED.events.on('logout', EVENTS.logout);
    SHARED.events.on('transferDistributionList', EVENTS.transferDistributionList);
    SHARED.storage.watch('dotmailerCredentials', EVENTS.setDotmailerCredentials);

    SHARED.notifications.create('hi', {
      title: "Hello",
      message: "Hi!"
    });
  },

  login: function (creds) {
    chrome.storage.sync.set({dotmailerCredentials: creds});
  },

  logout: function () {
    chrome.storage.sync.remove('dotmailerCredentials');
  },

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

  setDotmailerCredentials: function (creds) {
    if (creds) {
      DM.login(creds).fail(EVENTS.logout);
    } else {
      DM.logout();
    }
  }

};
