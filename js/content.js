var restToken = localStorage.getItem('BhRestToken');
restToken = restToken.replace(/["]/g,'');

var sendToken = {
  event: 'restToken',
  data: {
    token: restToken
  }
};
chrome.runtime.sendMessage(sendToken, function(response) {
  console.log(response.farewell);
});
