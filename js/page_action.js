var PAGE_ACTION = {
  init: function() {
    $('#options').on('click', SHARED.tabs.open.bind(null, 'options.html'));
    $('#sandbox').on('click', SHARED.tabs.open.bind(null, 'sandbox.html'));
    $('#transfer-distribution-list').on('click', PAGE_ACTION.transferCurrentDistributionList);
    $('#get-bullhorn-params').on('click', SHARED.events.emit.bind(null, 'getBullhornParameters', null, null));
  },

  transferCurrentDistributionList: function () {
    SHARED.tabs.current(function (tab) {
      chrome.tabs.sendMessage(tab.id, {
        type: 'getBullhornParameters'
      }, function (params) {
        SHARED.events.emit('transferDistributionList', params)
      })
    })
  },

}

$(PAGE_ACTION.init);
