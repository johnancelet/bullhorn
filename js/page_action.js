var PAGE_ACTION = {
  init: function() {
    $('#options').on('click', SHARED.tabs.open.bind(null, 'options.html'));
    $('#transfer-distribution-list').on('click', PAGE_ACTION.transferCurrentDistributionList);
    $('#get-bullhorn-params').on('click', SHARED.events.emit.bind(null, 'getBullhornParameters', null, null));

    // The parameters are only fetched once. Just reopen the popup
    // to refresh them.
    SHARED.tabs.current(function (tab) {
      chrome.tabs.sendMessage(tab.id, {
        type: 'getBullhornParameters'
      }, PAGE_ACTION.updateBullhornParameters)
    });

    // Keep track of dotmailer credentials to reflect on popup
    // whether the user needs to enter them.
    SHARED.storage.watch('dotmailerCredentials', PAGE_ACTION.updateDotmailerCredentials);

    PAGE_ACTION.updateView();
  },

  transitionTo: function (name) {
    $('.view').hide();
    $('.view.' + name).show();
  },

  transferCurrentDistributionList: function () {
    SHARED.events.emit('transferDistributionList', PAGE_ACTION.params);
    SHARED.tabs.current(function (tab) {
      chrome.pageAction.hide(tab.id);
    });
  },

  // Update the view according to dotmailer and bullhorn state
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

  updateDotmailerCredentials: function (creds) {
    PAGE_ACTION.creds = creds;
    PAGE_ACTION.updateView();
  },

  // Populate the transfer view with bullhorn parameters
  updateBullhornParameters: function (params) {
    PAGE_ACTION.params = params;
    if (params.distributionList !== undefined) {
      $('#distribution-list-name').html(params.distributionList.name);
    }
    PAGE_ACTION.updateView();
  }

}

$(PAGE_ACTION.init);
