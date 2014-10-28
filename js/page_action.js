var PAGE_ACTION = {
  init: function() {
    $('#options').on('click', SHARED.tabs.open.bind(null, 'options.html'));
    $('#sandbox').on('click', SHARED.tabs.open.bind(null, 'sandbox.html'));
    $('#transfer-distribution-list').on('click', PAGE_ACTION.transferCurrentDistributionList);
    $('#get-bullhorn-params').on('click', SHARED.events.emit.bind(null, 'getBullhornParameters', null, null));

    SHARED.tabs.current(function (tab) {
      chrome.tabs.sendMessage(tab.id, {
        type: 'getBullhornParameters'
      }, PAGE_ACTION.updateTransferView)
    });

    SHARED.storage.watch('dotmailerCredentials', PAGE_ACTION.updateCredentials);

    updateView();
  },

  transitionTo: function (name) {
    $('.view').hide();
    $('.view.' + name).show();
  },

  transferCurrentDistributionList: function () {
    SHARED.events.emit('transferDistributionList', PAGE_ACTION.params);
  },

  // Update the view according to dotmailer credentials
  updateView: function () {
    if (PAGE_ACTION.creds) {
      if (PAGE_ACTION.params && PAGE_ACTION.params.distributionList) {
        PAGE_ACTION.transitionTo('transfer');
      } else {
        PAGE_ACTION.transitionTo('idle');
      }
    } else {
      PAGE_ACTION.transitionTo('login');
    }
  },

  updateCredentials: function (creds) {
    PAGE_ACTION.creds = creds;
    PAGE_ACTION.updateView();
  },

  // Populate the transfer view with bullhorn parameters
  updateTransferView: function (params) {
    PAGE_ACTION.params = params;
    if (params.distributionList !== undefined) {
      $('#distribution-list-name').html(params.distributionList.name);
    }
    PAGE_ACTION.updateView();
  }

}

$(PAGE_ACTION.init);
