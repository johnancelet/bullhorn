
var message = {
  event: "pushData"
};

$('#foo').click(function () {
  chrome.runtime.sendMessage(message, function(response) {
    console.log(response.farewell);
  });
});


