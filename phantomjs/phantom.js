var phantomjs = require('phantomjs-prebuilt')
var webdriverio = require('webdriverio')
var wdOpts = {
  desiredCapabilities: {
    browserName: 'phantomjs',
    'phantomjs.cli.args': [
        '--ignore-ssl-errors=true',
        '--ssl-protocol=any', // tlsv1
        '--web-security=false',
        '--load-images=false',
        '--debug=false',
        //'--webdriver-logfile=webdriver.log',
        //'--webdriver-loglevel=DEBUG',
      ],
    javascriptEnabled: true,
    // logLevel: 'verbose'
  }
}
/**
 * @name waitForUrlToChangeTo
 * @description Wait until the URL changes to match a provided regex
 * @param {RegExp} urlRegex wait until the URL changes to match this regex
 * @returns {!webdriver.promise.Promise} Promise
 */
function waitForUrlToChangeTo(urlRegex) {
  var currentUrl;

  return browser.getCurrentUrl().then(function storeCurrentUrl(url) {
    currentUrl = url;
  }).then(function waitForUrlToChangeTo() {
    return browser.waitUntil(function waitForUrlToChangeTo() {
      return browser.getUrl().then(function compareCurrentUrl(url) {
        return urlRegex.test(url);
      });
    });
  });
}

function waitForUrlToChange(browser, callback){
  var currentUrl;
  var changedToUrl;
  browser.getUrl().then(function(url) {
      currentUrl = url;
  }).then(function() {
    return browser.waitUntil(function() {
      return browser.getUrl().then((url) => {
        changedToUrl = url;
        return url !== currentUrl;
      });
    }, 6000);
  }).then(function () {
      // continue testing
      callback(currentUrl, changedToUrl);
  }).catch(function (e){
      callback(currentUrl, null, e);
  });
}

function getCloudFlareCookie(urlToGet, callback) {
  phantomjs.run('--webdriver=4444').then(function (program) {
    let browser = webdriverio.remote(wdOpts).init();
    browser.url('https://socket.bittrex.com/').deleteCookie().then(function (){
      waitForUrlToChange(browser, function (){
        browser //pause(7000)
        .saveScreenshot("page.png")
        .getSource().then(function (s){
          //console.log(s)
        }).then(function (){
          return browser.getCookie()
        }).then(function (cookies){
          console.log(cookies)
          callback(null, cookies);
        });
      });
    });
  });
}
