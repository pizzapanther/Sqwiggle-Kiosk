var Kiosk = {
  storageKey: "sqwiggle-info",
  info: {},
  triedLogin: false
};

Kiosk.get_data = function () {
  chrome.storage.local.get(Kiosk.storageKey, function (obj) {
    if (obj && obj[Kiosk.storageKey]) {
      Kiosk.info = JSON.parse(obj[Kiosk.storageKey]);
      $("#loginButton").css('display', 'inline-block');
      $(".user").css('display', 'block');
      $("#buttons label").html('Logged in as: ' + Kiosk.info.email);
    }
  });
};

Kiosk.show_form = function () {
  $("#buttons").css('display', 'none');
  $("#loginForm").css('display', 'block');
};

Kiosk.show_buttons = function () {
  $("#buttons").css('display', 'block');
  $("#loginForm").css('display', 'none');
};

Kiosk.save = function () {
  Kiosk.info = {
    email: $("#input_email").val(),
    password: $("#input_password").val(),
    company: $("#input_company").val(),
    room: $("#input_room").val()
  };
  
  var obj = {};
  obj[Kiosk.storageKey] = JSON.stringify(Kiosk.info);
  
  chrome.storage.local.set(obj, function () {
    Kiosk.login();
  });
};

Kiosk.login = function () {
  $("#mainWrapper").html('<webview id="sqwiggleView" name="sqwiggle" src="https://app.sqwiggle.com/login" autosize="on"></webview>');
  
  setTimeout(function () {
    Kiosk.set_webview_events();
  }, 100);
};

Kiosk.load_stop = function (event) {
  console.log(Kiosk.webview.src);
  
  if (Kiosk.webview.src == 'https://app.sqwiggle.com/login') {
    if (!Kiosk.triedLogin) {
      var email = Kiosk.info.email.replace('"', '\\"');
      var password = Kiosk.info.password.replace('"', '\\"');
      
      Kiosk.webview.executeScript({code: 'document.querySelector("#email").value = "' + email + '";'});
      Kiosk.webview.executeScript({code: 'document.querySelector("#password").value = "' + password + '";'});
      Kiosk.webview.executeScript({code: 'document.querySelector("input[type=\'submit\']").click();'});
      
      Kiosk.triedLogin = true;
    }
  }
};

Kiosk.set_webview_events = function () {
  Kiosk.webview = document.querySelector('webview');
  
  Kiosk.webview.addEventListener('permissionrequest', function(e) {
    if (e.permission === 'media') {
      e.request.allow();
    }
  });
  
  Kiosk.webview.addEventListener('loadstop', Kiosk.load_stop);
  
  var url = 'https://app.sqwiggle.com/' + Kiosk.info.company;
  if (Kiosk.info.room) {
    url += "/" + Kiosk.info.room;
  }
  
  //Only available in Dev channel right now, should be stable soon
  if (Kiosk.webview.clearData) {
    Kiosk.webview.clearData({since: 0}, {cookies: true, passwords: true},
      function() {
        Kiosk.webview.src = url;
      }
    );
  }
  
  else {
    Kiosk.webview.src = url;
  }
};

Kiosk.resize_webview = function () {
  var h = $("#mainWrapper").height();
  var w = $("#mainWrapper").width();
  
  $("webview").height(h);
  $("webview").width(w);
};

$(document).ready(function () {
  Kiosk.get_data();
  
  $("#changeButton").click(Kiosk.show_form);
  $("#cancelButton").click(Kiosk.show_buttons);
  $("#saveButton").click(Kiosk.save);
  $("#loginButton").click(Kiosk.login);
  
  window.addEventListener('resize', function(event) {
    Kiosk.resize_webview();
  });
});
