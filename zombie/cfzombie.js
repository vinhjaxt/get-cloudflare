const Zombie = require('zombie');
var request = require('request');
const url = require('url');
const fs = require('fs');
var FileCookieStore = require('tough-cookie-filestore');
/**
// Need your improve or not?
var tough = require('tough-cookie');
var Cookie = tough.Cookie;
*/


function requestCaller(options, callback) {
  let self = requestCaller;
  if(this instanceof requestCaller){
    self = this;
  }
  if(typeof(options) === "string") options = {
    url: options
  }
  if(!self.configed) {
    self.getCloudflareCookie = function (urlToGet, callback) {
      let browser = new Zombie({
        userAgent: self.opts.userAgent,
        loadCSS: false,
        runScripts: true,
        headers: {
          'User-Agent': self.opts.userAgent,
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          'Referer': urlToGet,
          'DNT': '1',
          'Upgrade-Insecure-Requests': '1'
        }
      });
      const parseURL = url.parse(urlToGet,true);
      const hostname = parseURL.hostname;

      browser.visit(urlToGet)
      .then(function() {
        browser.tabs.closeAll();
      })
      .catch(function(error) {
        // code 502 is expected
        let html = browser.html();
        if(~html.indexOf('id="challenge-form"') && ~html.indexOf('id="jschl-answer"')){
          browser.wait({ duration: 6000 }, function () {
            browser.tabs.closeAll()
          });
        }else{
          callback(error, html);
          browser.tabs.closeAll()
        }
      });
      browser.on('redirect', function(req, res) {
        res.text().then(function(content){
         
          browser.cookies.map(function (cookie){
            try{
              if(cookie){
                // Improve here or not?
                // let tgCookie = Cookie.fromJSON(cookie.toJSON());
                self.requestJar.setCookie(cookie, urlToGet);
              }
            }catch(e){}
            return '';
          });
          callback(null, self.getCookies(urlToGet));
          browser.tabs.closeAll()
        }).catch(function(e){
          callback(e, null);
          browser.tabs.closeAll()
        });
      });
    };
    self.opts = {
        cookieFile: __dirname+'/cookies.json',
        userAgent: 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.84 Safari/537.36'
      };
    self.config = function (options, url) {
      let opts = typeof(options) === 'object' ? options : {};
      let cookies;
      if(opts['cookies']){
        cookies = JSON.parse(JSON.stringify(opts['cookies']));
        delete opts['cookies'];
      }
      self.opts = Object.assign(self.opts, opts);
      try{
        if(!fs.existsSync(self.opts.cookieFile)) fs.writeFileSync(self.opts.cookieFile,'','utf8');
        self.requestJar = request.jar(new FileCookieStore(self.opts.cookieFile));
      }catch(e){
        self.requestJar = request.jar();
      }
      self.realRequest = request.defaults({ jar : self.requestJar });
      if(cookies) {
        cookies.split(/\s*\;\s*/g).map(function (cookie){
          if(!cookie) return '';
          try{
            self.requestJar.setCookie(self.realRequest.cookie(cookie), url);
          }catch(e){
          }
        });
        return '';
      }
      self.configed = true;
    };

    self.getUa = function () {
      return self.opts.userAgent;
    };

    self.getUserAgent = function () {
      return self.opts.userAgent;
    };

    self.getCookie = function (url) {
      return self.getCookies(url);
    };
    
    self.getCookies = function (url) {
      return self.requestJar.getCookieString(url);
    };

    self.request = function (options, callback){
      // Main
      let args = arguments;
      if(typeof(options) === "string") options = {
        url: options
      }
      const parseURL = url.parse(options['url']);
      const hostname = parseURL.hostname;
      let requesOptions = Object.assign({
        'headers': {
          'Accept-Language': 'en-US,en;q=0.5',
          'DNT': '1',
          'Upgrade-Insecure-Requests': '1',
          'Referer': options['url'],
        },
        gzip: true
      },options);
      requesOptions = Object.assign(requesOptions, {
        'headers': {
          'User-Agent': self.opts.userAgent,
        }
      });
      self.realRequest(requesOptions, function(e,r,b) {
        if(~b.indexOf('id="challenge-form"') && ~b.indexOf('id="jschl-answer"')){
          self.getCloudflareCookie(requesOptions['url'], function (e, cookie){
            if(e){
              return callback('Error, cant get cloudflare cookie: '+ e);
            }
            self.request.apply(self,args);
          });
          return
        }
        return callback.apply(callback, arguments);
      });
    };
    if(arguments.length > 0)
      self.config(options, options['url']);
  }

  if(arguments.length > 0) {
    self.request.apply(self,arguments);
  }

}

module.exports = requestCaller;
