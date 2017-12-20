const request = require('request');
const url = require('url');;

let lastCookies = {};

function browserCookieToRequest(cookies){
  if(cookies instanceof Array)
    return cookies.map(function (cookie){
      return cookie.name+'='+cookie.value;
    }).join('; ');
  else
    return ''
}

const UserAgent = 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.84 Safari/537.36';

const wdOpts = {
  desiredCapabilities: {
    browserName: 'phantomjs',
    'phantomjs.page.settings.userAgent': UserAgent,
    'phantomjs.page.settings.javascriptEnabled': true,
    'phantomjs.page.settings.loadImages': false,
    'phantomjs.page.settings.webSecurityEnabled': false,
   // 'phantomjs.page.settings.resourceTimeout': '1',
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

var phantomjs = require('phantomjs-prebuilt');
var webdriverio = require('webdriverio');
var phantomRunner;
phantomRunner = phantomjs.run('--webdriver=4444');
phantomRunner.catch(function (e){
  throw Error("Can not start phantomjs, pls reinstall it by: npm i phantomjs-prebuilt: "+e);
});

function getCloudFlareCookie(urlToGet, callback) {
  const parseURL = url.parse(urlToGet,true);
  const hostname = parseURL.hostname;
  if(!lastCookies[hostname]) lastCookies[hostname] = [];
  if(!phantomRunner) {
    callback('Phantomjs closed');
    return
  }
  phantomRunner.then(function (program) {
    let browser = webdriverio.remote(wdOpts).init();
    browser.url(urlToGet).deleteCookie().then(function (){
      waitForUrlToChange(browser, function (){
        browser //pause(7000)
        /* .saveScreenshot("page.png")
        .getSource().then(function (s){
          console.log(s)
        }) */.then(function (){
          return browser.getCookie()
        }).then(function (cookies){
          lastCookies[hostname] = cookies;
          callback(null, browserCookieToRequest(cookies));
          browser.end(); 
        }).catch(function (e){
          callback('getCookie: '+e);
          browser.end(); 
        });
      });
    }).catch(function (e){
      callback('goToUrl: '+e);
      browser.end(); 
    });
  });
}

function requestCaller(options, callback) {
  let args = arguments;
  let self = this;
  if(typeof(options) === "string") options = {
    url: options
  };
  const parseURL = url.parse(options['url']);
  const hostname = parseURL.hostname;
  let requesOptions = Object.assign({},options);
  requesOptions = Object.assign(requesOptions, {
    'headers': {
      'Cookie': browserCookieToRequest(lastCookies[hostname]),
      'User-Agent': UserAgent,
      'Accept-Language': 'en-US,en;q=0.5',
      'DNT': '1',
      'Upgrade-Insecure-Requests': '1'
    },
    gzip: true
  });
  requesOptions['headers']['Referer'] = requesOptions['url'];
  request(requesOptions, function(e,r,b) {
    if(~b.indexOf('id="challenge-form"') && ~b.indexOf('id="jschl-answer"')){
      getCloudFlareCookie(requesOptions['url'], function (e, cookie){
        if(e){
          return callback('Error, cant get cloudflare cookie: '+ e);
        }
        requestCaller.apply(self,args);
      });
      return
    }
    return callback.apply(callback, arguments);
  });
}

requestCaller.getUa = function () {
  return UserAgent;
};

requestCaller.getUserAgent = function () {
  return UserAgent;
};

requestCaller.getCookie = function (domain) {
  return requestCaller.getCookies(domain);
};
requestCaller.getCookies = function (domain) {
  if(typeof(domain) === 'undefined') {
    let cookies = {};
    for(domain in lastCookies) {
      cookies[domain] = browserCookieToRequest(lastCookies[domain]);
    }
    return cookies;
  }
  return browserCookieToRequest(lastCookies[domain]);
};

requestCaller.closePhantomjs = function () {
  if(phantomRunner)
  phantomRunner.then(function (program) {
    program.kill();
    phantomRunner = null;
  });
};

module.exports = requestCaller;
