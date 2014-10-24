var BH = {};

BH.config = {
  host: 'https://cls2.bullhornstaffing.com',
  restToken: null,
  privateLabel: null,
  pageSize: 25
};

BH.ajax = function (method, path, options) {
  if (BH.config.restToken === undefined) {
    throw new Error("No rest token present!");
  }

  if (options === undefined) {
    options = {};
  }

  if (options.data === undefined) {
    options.data = {}
  }

  options.method = method;
  options.url = BH.config.host + path;

  options.data.BhRestToken = BH.config.restToken;

  console.log('BH.ajax', options);

  return $.ajax(options);
}

BH.ajaxPaginated = function (method, path, options, start, count, buffer) {
  if (start === undefined) {
    start = 0;
  }

  if (count === undefined) {
    count = BH.config.pageSize;
  }

  if (options === undefined) {
    options = {};
  }

  if (options.data === undefined) {
    options.data = {};
  }

  if (buffer === undefined) {
    buffer = [];
  }

  options.data.start = start;
  options.data.count = count;

  var dfd = $.Deferred();

  options.success = function (data) {
    Array.prototype.push.apply(buffer, data.data);

    console.log(data);

    if (data.total === undefined || data.start + data.count >= data.total) {
      dfd.resolve(buffer);
    } else {
      dfd.resolve(BH.ajaxPaginated(method, path, options, start + count, count, buffer));
    }
  }

  options.error = function (xhr, ajaxOptions, thrownError) {
    alert(xhr.status);
    alert(thrownError);
    dfd.reject(xhr.status);
  }

  BH.ajax(method, path, options);

  return dfd.promise();
}

// Return a promise of an entire paginated resource
// and fetch it iteratively
BH.fetchDistributionList = function (listId) {
  var data = {
    // privateLabelId: BH.config.privateLabel,
    fields: 'email',
    orderBy: 'name',
    where: 'isDeleted=false AND ' + listId + ' MEMBER OF distributionLists',
    showTotalMatched: 'true',
    showLabels: 'true'
  }

  console.log({data: data});

  return BH.ajaxPaginated('GET', '/core/query/Person', {data: data});
}
