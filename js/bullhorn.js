function Bullhorn(config) {
  var defaults = {
    host: 'https://cls2.bullhornstaffing.com',
    restToken: null,
    privateLabel: null,
    pageSize: 25
  };

  var BH = {};

  BH.config = $.extend({}, defaults, config);

  BH.ajax = function (method, path, options) {
    if (BH.config.restToken === undefined) {
      return $.Deferred().reject(Bullhorn.errors.restTokenMissing).promise();
    }
    options        = options || {};
    options.method = method;
    options.url    = BH.config.host + path;
    options.data   = options.data || {};
    options.data.BhRestToken = BH.config.restToken;
    return $.ajax(options);
  }

  // Return a promise of an entire paginated resource in a 'reduce-y' fashion
  BH.ajaxPaginated = function (method, path, options, start, count, buffer) {
    start              = start || 0;
    count              = count || BH.config.pageSize;
    options            = options || {};
    options.data       = options.data || {};
    options.data.start = start;
    options.data.count = count;
    buffer             = buffer || [];

    return BH
      .ajax(method, path, options)
      .then(function (data) {
        Array.prototype.push.apply(buffer, data.data);
        if (data.total === undefined || data.start + data.count >= data.total) {
          return $.Deferred().resolve(buffer).promise();
        } else {
          return BH.ajaxPaginated(method, path, options, start + count, count, buffer);
        }
      })
      .fail(function (xhr, ajaxOptions, thrownError) {
        return xhr.status
      });
  }

  BH.fetchDistributionList = function (listId) {
    var data = {
      // privateLabelId: BH.config.privateLabel,
      where:            'isDeleted=false AND ' + listId + ' MEMBER OF distributionLists',
      fields:           'email',
      orderBy:          'name',
      showLabels:       'true',
      showTotalMatched: 'true'
    }

    return BH.ajaxPaginated('GET', '/core/query/Person', {data: data});
  }

  return BH;
}

Bullhorn.errors = {
  restTokenMissing: 'rest token missing'
}