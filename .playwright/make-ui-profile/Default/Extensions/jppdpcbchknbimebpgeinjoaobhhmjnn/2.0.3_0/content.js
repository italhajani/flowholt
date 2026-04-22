try {
  // console.log("content script...", cp_imgSrc, cp_width, cp_height);

  var pageClicked = false;
  var cp_initialSet = false;
  var cp_initialX = 1.0;
  var cp_initialY = 1.0;
  var cp_htmlElement = document.documentElement;
  var cp_bodyElement = cp_htmlElement.getElementsByTagName("body")[0];
  var cp_Root = document.createElement('cp-root');

  // Status area
  var cp_statusColorArea = document.createElement('div');
  // cp_statusColorArea.id = 'cp-status-area';
  const cp_statStyle = cp_statusColorArea.style;
  cp_statStyle.width = "180px";
  cp_statStyle.height = "70px";
  cp_statStyle.lineHeight = "65px"; /* align text vertically in div - same as height! */
  cp_statStyle.position = "absolute";
  cp_statStyle.display = 'flex';
  cp_statStyle.top = 0;
  cp_statStyle.right = 0;
  cp_statStyle.border = "2px solid #fff";
  cp_statStyle.borderColor = "SlateGrey";
  cp_statStyle.borderRadius = '6px';
  cp_statStyle.zIndex = 999999;

  var cp_color = document.createElement('div');
  cp_color.id = 'color';
  cp_color.style.width = "70px";

  var cp_stat = document.createElement('div');
  cp_stat.id = 'status';
  cp_stat.style.backgroundColor = "#333";
  cp_stat.style.width = '110px';
  cp_stat.style.overflow = 'hidden';
  cp_stat.style.padding = '4px';
  cp_stat.style.color = 'white';
  cp_stat.style.fontSize = '24px';
  cp_stat.style.fontFamily = "Roboto-Regular, Arial, helvetica, sans-serif";

  cp_statusColorArea.appendChild(cp_color);
  cp_statusColorArea.appendChild(cp_stat);
  
  cp_Root.appendChild(cp_statusColorArea);

  var cp_growl = document.createElement('div');
  cp_growl.id = 'growl-notice';
  cp_growl.style.display = 'none';
  cp_growl.style.fontFamily = "Roboto-Regular, Arial, helvetica, sans-serif";
  cp_growl.style.width = '350px';
  cp_growl.style.height = '55px';
  cp_growl.style.padding = '5px 10px';
  cp_growl.style.borderLeft = "6px solid black";
  cp_growl.style.borderRadius = '4px';
  cp_growl.style.opacity = 0.97;
  cp_growl.style.fontSize = '14px';
  cp_growl.style.color = '#fff';
  cp_growl.style.lineHeight = '50px';
  // cp_growl.style.backgroundColor = '#BF0025';
  cp_growl.style.backgroundColor = '#333';
  cp_growl.style.position = 'fixed';
  cp_growl.style.right = '10px';
  // cp_growl.style.bottom = '34px';
  cp_growl.style.top = '34px';
  cp_growl.style.zIndex = 9999999;

  // document.body.insertAdjacentElement('afterbegin', cp_Root);
  document.body.insertAdjacentElement('beforebegin', cp_Root);
  const cp_canvas = document.createElement('canvas');

  cp_canvas.width = cp_width;
  cp_canvas.height = cp_height;
  cp_canvas.style.position = "absolute";
  cp_canvas.style.top = 0;
  cp_canvas.style.left = 0;
  // cp_canvas.style.cursor = 'url("https://linangdata.com/css/cursors/target.png"), crosshair';
  cp_canvas.style.zIndex = 99999;

  var ctx = cp_canvas.getContext("2d");

  function fadeIn(el, time) {
    el.style.opacity = 0;
    el.style.display = 'block';
    var last = +new Date();
    var tick = function() {
      el.style.opacity = +el.style.opacity + (new Date() - last) / time;
      last = +new Date();
  
      if (+el.style.opacity < 1) {
        (window.requestAnimationFrame && requestAnimationFrame(tick)) || setTimeout(tick, 16);
      }
    };
  
    tick();
  }

/*   function getPosition(obj) {
    var curleft = 0,
      curtop = 0;
    if (obj.offsetParent) {
      do {
        curleft += obj.offsetLeft;
        curtop += obj.offsetTop;
      } while (obj = obj.offsetParent);
      return {
        x: curleft,
        y: curtop
      };
    }
    return undefined;
  } */
  
  function cp_displayGrowl(message, onTimedOut) {
    cp_growl.innerHTML = '<img src="https://linangdata.com/color-picker/css/icons/38x38.png" /> <span>' + message + '</span>';
    fadeIn(cp_growl, 500);
    setTimeout(function(){ 
      onTimedOut(cp_bodyElement, cp_htmlElement);
    }, 2000);
  }
  
  function cp_copyToClipBoard(str, mimetype) {
    document.oncopy = function(event) {
        event.clipboardData.setData(mimetype, str);
        event.preventDefault();
    };
    try {
        var successful = document.execCommand("Copy", false, null);
        
        // var msg = successful ? 'successful' : 'unsuccessful';
        // console.log('Copying text command was ' + msg);
    } catch (err) {
    // console.log('Oops, unable to copy');
    }
  };

  function cp_hideCanvasShowBody(cp_bodyElement, cp_htmlElement) {
    //Show body
    cp_bodyElement.style.display = "block";

    //Remove cp-root    
    cp_htmlElement.removeChild(document.getElementsByTagName("cp-root")[0]);

  }

  function cp_rgbToHex(r, g, b) {
    if (r > 255 || g > 255 || b > 255)
      throw "Invalid color component";
    return ((r << 16) | (g << 8) | b).toString(16).toUpperCase();
  }

  function cp_drawImageFromWebUrl(sourceurl) {
    var img = new Image();

    img.addEventListener("load", function () {
      // The image can be drawn from any source
      cp_canvas.getContext("2d").drawImage(img, 0, 0, img.width, img.height, 0, 0, cp_width, cp_height);
    });

    img.setAttribute("src", sourceurl);

    //hide body
    cp_bodyElement.style.display = "none";
  }

  cp_canvas.addEventListener("click", function (e) {
    try {

      if (pageClicked) {
        return;
      }

      pageClicked = true;
      // console.log(e)
      var x = e.pageX || 1.0;
      var y = e.pageY || 1.0;
      // var coord = "x=" + x + ", y=" + y;
      // var c = this.getContext('2d');
      var p = ctx.getImageData(x, y, 1, 1).data;

      // If transparency on the image
      /* if ((p[0] == 0) && (p[1] == 0) && (p[2] == 0) && (p[3] == 0)) {
        coord += " (Transparent color detected, cannot be converted to HEX)";
      } */
      var hex = "#" + ("000000" + cp_rgbToHex(p[0], p[1], p[2])).slice(-6);

      // console.log('Color selected: ', hex);
      cp_copyToClipBoard(hex, 'text/plain');

      // Post to background 
      chrome.runtime.sendMessage({hex}, function(response) { /* console.log(response);  */});

      cp_displayGrowl(hex + " has been copied to the clipboard...", cp_hideCanvasShowBody);

      hex;
    } catch (err) {
      console.log(err)
    }
  });

  cp_canvas.addEventListener('mouseenter', function (mousePos) {
    if (cp_initialSet) {
      return;
    }
    cp_initialSet = true;
    // console.log(mousePos);
    cp_initialX = mousePos.pageX;
    cp_initialY = mousePos.pageY;

    cp_canvas.dispatchEvent(new Event('mousemove'));
  })

  cp_canvas.addEventListener("mousemove", function (e) {
    try {
      if (pageClicked) {
        return;
      }
      // console.log(e)
      // Don't need parent offset as cp_canvas loaded outside <body>
      // var pos = getPosition(this);
      // var x = e.pageX - pos.x;
      // var y = e.pageY - pos.y; 

      var x = e.pageX || cp_initialX;
      var y = e.pageY || cp_initialY;
      // var coord = "x=" + x + ", y=" + y;
      // var c = this.getContext('2d');
      var p = ctx.getImageData(x, y, 1, 1).data;
      var hex = "#" + ("000000" + cp_rgbToHex(p[0], p[1], p[2])).slice(-6);

      // console.log('coord', coord, e.offsetX, e.offsetY )
      // Set color and status and adjust position of status div
      cp_stat.innerHTML = hex;
      cp_color.style.backgroundColor = hex;

      cp_statusColorArea.style.left = (x + 40) + 'px';
      cp_statusColorArea.style.top = (y - 22) + 'px';

    } catch (err) {
      console.error(err)
    }
    
  }, false);

  cp_drawImageFromWebUrl(cp_imgSrc);

  cp_Root.appendChild(cp_canvas);
  cp_Root.appendChild(cp_growl);
  
} catch (error) {
  console.error("colorPicker", error)
}
