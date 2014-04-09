
chrome.app.runtime.onLaunched.addListener(launch_main_window);

function launch_main_window () {
  var width = screen.availWidth - 64;
  var height = screen.availHeight - 64;
  
  chrome.app.window.create('main.html', {
    'resizable': true,
    'state': 'fullscreen',
    'bounds': {
      'width': width,
      'height': height
    }
  });
}
