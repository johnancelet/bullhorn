var EVENTS = {
  state: {
    transfers: {},
  },

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
    var list = params.distributionList;

    if (!list) {
      return;
    }

    var notification = 'transfer-' + list.id;

    // Only allow one transfer of a specific list at a time
    if (EVENTS.state.transfers[list.id]) {
      return;
    }

    // TODO it would be elegant to store the import guid here
    //      but that would be too late.
    EVENTS.state.transfers[list.id] = true;

    SHARED.notifications.create(notification, {
      type: "progress",
      title: "Bullhorn to Dotmailer",
      message: "Transferring " + list.name,
      iconUrl: "images/spinner.gif",
    })

    var flip = true;

    Bullhorn(params.config)
      .fetchDistributionList(list.id)
      .then(DM.updateAddressBookByName.bind(null, list.id))
      .progress(function () {
        SHARED.notifications.update(notification, {
          iconUrl: flip ? 'images/foo.png' : 'images/spinner.gif',
        })
        flip = !flip;
      })
      .then(function (report) {
        SHARED.notifications.update(notification, {
          type: "progress",
          title: "Bullhorn to Dotmailer",
          message: "Transfer of " + list.name + " was successful.",
          contextMessage: JSON.stringify(report),
          iconUrl: "images/foo.png",
          progress: 100,
        })
      })
      .fail(function (reason) {
        SHARED.notifications.create(notification, {
          message: "Transfer of " + list.name + " failed.",
          contextMessage: JSON.stringify(reason),
          title: "Bullhorn to Dotmailer",
          iconUrl: "images/foo.png",
          buttons: [{title: 'Retry'}],
        })
      })
      .always(function () {
        delete EVENTS.state.transfers[list.id];
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
