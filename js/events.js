var EVENTS = {
  state: {
    transfers: {},
    dotmailerCredentials: null
  },

  init: function () {
    SHARED.events.on('transferDistributionList', EVENTS.transferDistributionList);
    SHARED.storage.watch('dotmailerCredentials', EVENTS.setDotmailerCredentials);
  },

  // Keep the credentials in sync
  setDotmailerCredentials: function (creds) {
    EVENTS.state.dotmailerCredentials = creds;
  },

  // The purpose of this extension. It takes a Bullhorn distribution
  // list and sends its contacts to a dotmailer address book. (Because
  // of a hard limit of 500 on Bullhorn's api).
  transferDistributionList: function (params) {
    var list = params.distributionList;

    if (!list) {
      return;
    }

    // Only allow one transfer of a specific list at a time
    if (EVENTS.state.transfers[list.id]) {
      return;
    }

    // TODO it would be elegant to store the import guid here
    //      but that would be too late.
    EVENTS.state.transfers[list.id] = true;

    var BH = Bullhorn(params.config);
    var DM = Dotmailer();

    var notification = EVENTS.notifications.Transfer(list);
    notification.start();

    DM.authenticate(EVENTS.state.dotmailerCredentials)
      .fail(function (arg) {
        console.log('then', arg);
        return arg;
      })
      .fail(function (arg) {
        console.log('fail', arg);
        return arg;
      })
      .then(BH.fetchDistributionList.bind(null, list.id))
      .then(DM.updateAddressBookByName.bind(null, list.id))
      .then(notification.success)
      .fail(notification.error)
      .always(function () {
        delete EVENTS.state.transfers[list.id];
      })
  },

  notifications: {
    Transfer: function (list) {
      var id = 'transfer-' + list.id;

      return {
        id: id,
        start: function () {
          SHARED.notifications.create(id, {
            title: "Bullhorn to Dotmailer",
            message: "Transferring " + list.name,
          })
        },
        success: function () {
          SHARED.notifications.update(id, {
            message: "Transfer of " + list.name + " was successful.",
          })
        },
        error: function (reason) {
          SHARED.notifications.create(id, {
            message: "Transfer of " + list.name + " failed.",
            contextMessage: JSON.stringify(reason),
            title: "Bullhorn to Dotmailer",
            buttons: [{title: 'Retry'}],
          })
        }
      }
    }
  }
};
