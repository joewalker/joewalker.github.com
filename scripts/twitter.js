// JSON-P Twitter fetcher for Octopress
// (c) Brandon Mathis // MIT Lisence
function getTwitterFeed(user, count, replies) {
  var feed = new jXHR();

  feed.onerror = function(msg,url) {
    var loading = window.querySelector('#tweets li.loading');
    loading.classList.add('error');
    loading.innerHtml = 'Twitter\'s busted';
  };

  feed.onreadystatechange = function(data) {
    if (feed.readyState === 4) {
      var tweets = [];
      var i = 0;
      for (i in data) {
        if (tweets.length < count) {
          if (replies || data[i].in_reply_to_user_id == null) {
            tweets.push(data[i]);
          }
        }
      }
      showTwitterFeed(tweets, user);
    }
  };

  feed.open("GET", "http://twitter.com/statuses/user_timeline/"+user+".json?trim_user=true&count="+(parseInt(count)+60)+"&callback=?");
  feed.send();
}

function showTwitterFeed(tweets, twitter_user) {
  var timeline = document.getElementById('tweets');
  timeline.innerHTML='';
  for (t in tweets) {
    timeline.innerHTML+='<li>'+'<p>'+'<a href="http://twitter.com/'+twitter_user+'/status/'+tweets[t].id_str+'">'+prettyDate(tweets[t].created_at)+'</a>'+linkifyTweet(tweets[t].text.replace(/\n/g, '<br>'))+'</p>'+'</li>';
  }
}
function linkifyTweet(text) {
  return text.replace(/(https?:\/\/)([\w\-:;?&=+.%#\/]+)/gi, '<a href="$1$2">$2</a>')
    .replace(/(^|\W)@(\w+)/g, '$1<a href="http://twitter.com/$2">@$2</a>')
    .replace(/(^|\W)#(\w+)/g, '$1<a href="http://search.twitter.com/search?q=%23$2">#$2</a>');
}



//jXHR.js (JSON-P XHR)
//v0.1 (c) Kyle Simpson
//MIT License

(function(global){
var SETTIMEOUT = global.setTimeout, // for better compression
 doc = global.document,
 callback_counter = 0;

global.jXHR = function() {
 var script_url,
   script_loaded,
   jsonp_callback,
   scriptElem,
   publicAPI = null;

 function removeScript() { try { scriptElem.parentNode.removeChild(scriptElem); } catch (err) { } }

 function reset() {
   script_loaded = false;
   script_url = "";
   removeScript();
   scriptElem = null;
   fireReadyStateChange(0);
 }

 function ThrowError(msg) {
   try { publicAPI.onerror.call(publicAPI,msg,script_url); } catch (err) { throw new Error(msg); }
 }

 function handleScriptLoad() {
   if ((this.readyState && this.readyState!=="complete" && this.readyState!=="loaded") || script_loaded) { return; }
   this.onload = this.onreadystatechange = null; // prevent memory leak
   script_loaded = true;
   if (publicAPI.readyState !== 4) ThrowError("Script failed to load ["+script_url+"].");
   removeScript();
 }

 function fireReadyStateChange(rs,args) {
   args = args || [];
   publicAPI.readyState = rs;
   if (typeof publicAPI.onreadystatechange === "function") publicAPI.onreadystatechange.apply(publicAPI,args);
 }

 publicAPI = {
   onerror:null,
   onreadystatechange:null,
   readyState:0,
   open:function(method,url){
     reset();
     internal_callback = "cb"+(callback_counter++);
     (function(icb){
       global.jXHR[icb] = function() {
         try { fireReadyStateChange.call(publicAPI,4,arguments); }
         catch(err) {
           publicAPI.readyState = -1;
           ThrowError("Script failed to run ["+script_url+"].");
         }
         global.jXHR[icb] = null;
       };
     })(internal_callback);
     script_url = url.replace(/=\?/,"=jXHR."+internal_callback);
     fireReadyStateChange(1);
   },
   send:function(){
     SETTIMEOUT(function(){
       scriptElem = doc.createElement("script");
       scriptElem.setAttribute("type","text/javascript");
       scriptElem.onload = scriptElem.onreadystatechange = function(){handleScriptLoad.call(scriptElem);};
       scriptElem.setAttribute("src",script_url);
       doc.getElementsByTagName("head")[0].appendChild(scriptElem);
     },0);
     fireReadyStateChange(2);
   },
   setRequestHeader:function(){}, // noop
   getResponseHeader:function(){return "";}, // basically noop
   getAllResponseHeaders:function(){return [];} // ditto
 };

 reset();

 return publicAPI;
};
})(window);



/* Sky Slavin, Ludopoli. MIT license.  * based on JavaScript Pretty Date * Copyright (c) 2008 John Resig (jquery.com) * Licensed under the MIT license.  */

function prettyDate(time) {
  if (navigator.appName == 'Microsoft Internet Explorer') {
    return "<span>&infin;</span>"; // because IE date parsing isn't fun.
  };

  var say = {};
  say.just_now = " now",
  say.minute_ago = "1m",
  say.minutes_ago = "m",
  say.hour_ago = "1h",
  say.hours_ago = "h",
  say.yesterday = "1d",
  say.days_ago = "d",
  say.weeks_ago = "w";

  var current_date = new Date();
  current_date_time = current_date.getTime();
  current_date_full = current_date_time + (1 * 60000);
  var date = new Date(time);
  var diff = ((current_date_full - date.getTime()) / 1000);
  var day_diff = Math.floor(diff / 86400);

  if (isNaN(day_diff) || day_diff < 0) return "<span>&infin;</span>";

  return day_diff == 0 && (
    diff < 60 && say.just_now ||
    diff < 120 && say.minute_ago ||
    diff < 3600 && Math.floor(diff / 60) + say.minutes_ago ||
    diff < 7200 && say.hour_ago ||
    diff < 86400 && Math.floor(diff / 3600) + say.hours_ago) ||
    day_diff == 1 && say.yesterday ||
    day_diff < 7 && day_diff + say.days_ago ||
    day_diff > 7 && Math.ceil(day_diff / 7) + say.weeks_ago;
}
