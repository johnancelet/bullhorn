var restToken;

if (jQuery) {
  chrome.runtime.onMessage.addListener( function (message, MessageSender, sendReponse) {
    if (message.event === "restToken") {
      restToken = message.data.token;
    }
    else if (message.event === "pushData") {
      var params = 'fields=email&start=0&count=25&orderBy=name&where=isDeleted=false AND 3178 MEMBER OF distributionLists&showTotalMatched=true&showLabels=true&BhRestToken=' + restToken + '&privateLabelId=5845';
      $.ajax({
        url: 'https://cls2.bullhornstaffing.com/core/query/Person',
        type: 'GET',
        data: params,
        success: function(data) {
          var firstOne = data.data[0];
          alert("Grabbed the data! Here\'s the first one: " + JSON.stringify(firstOne.email + " Now we can send this to DotMailer"));
        },
        error: function (xhr, ajaxOptions, thrownError) {
          alert(xhr.status);
          alert(thrownError);
        }
      });
    }
  });
}



