/*
* name: onTypeFinished
* desc: executes a function after determining whether the user has stopped typing
* how: computes the speed the user is typing with and when a delay longer than twice 
* 	   the speed average occurs, the event is triggered and your callback function is called
* url: http://blog.another-d-mention.ro/programming/java-script/on-typing-complete-jquery-plugin/
*/
$.fn.onTypeFinished = function(func) {
     var T = undefined, S = 0, D = 1000;
     $(this).on("keyup", onKeyPress).on("focusout", onTimeOut);
     function onKeyPress() {
        clearTimeout(T);
        if (S == 0) { S = new Date().getTime(); D = 1000; T = setTimeout(onTimeOut, 1000); return; }
        var t = new Date().getTime();
        D = (D + (t - S)) / 2; S = t; T = setTimeout(onTimeOut, D * 2);
     }
 
      function onTimeOut() {
           func.apply(); S = 0;
      }
      return this;
   };