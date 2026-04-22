
// Function to download data to a file
function download(data, filename, type) {
  // console.log("download", data)
  var file = new Blob([data], { type: type });
  if (window.navigator.msSaveOrOpenBlob) // IE10+
    window.navigator.msSaveOrOpenBlob(file, filename);
  else { // Others
    var a = document.createElement("a"),
      url = URL.createObjectURL(file);
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 0);
  }
}

function copyToClipBoard(str, mimetype) {
  document.oncopy = function (event) {
    event.clipboardData.setData(mimetype, str);
    event.preventDefault();
  };
  try {
    var successful = document.execCommand("Copy", false, null);
    var msg = successful ? 'successful' : 'unsuccessful';

    if (successful) {
      displayGrowl(str + " copied to the clipboard...", null);
    }
    console.log('Copying text command was ' + msg);
  } catch (err) {
    //console.log('Oops, unable to copy');
  }
};

document.addEventListener('DOMContentLoaded', function () {

  try {
    $.get("https://linangdata.com/servedcontent/dynamiclinks.php?source=color-picker", function (data) {
      $("#links").html(data);

      $(".navopentab").unbind().on("click", function (e) {
        e.preventDefault();
        var link = $(this).attr('href');
        chrome.tabs.create({ url: link });
      })
    });
    $.get("https://linangdata.com/servedcontent/bannertop.php?source=color-picker", function (data) {
      if (data) {
        $("#banner-top").html(data).removeClass('hidden');
      }

      $(".navopentab").unbind().on("click", function (e) {
        e.preventDefault();
        var link = $(this).attr('href');
        chrome.tabs.create({ url: link });
      })
    });
    $.get("https://linangdata.com/servedcontent/bannerbottom.php?source=color-picker", function (data) {
      if (data) {
        $("#banner-bottom").html(data).removeClass('hidden');
      }

      $(".navopentab").unbind().on("click", function (e) {
        e.preventDefault();
        var link = $(this).attr('href');
        chrome.tabs.create({ url: link });
      })
    });
  } catch (err) { }

  $('#linangdata,.btn ').tooltip();
  $("#linangdata").click(function () {
    chrome.tabs.create({ url: "https://linangdata.com" });
  });
  $(".home").on("click", function (e) {
    chrome.tabs.create({ url: "https://linangdata.com/" });
  })

  $(".navopentab").on("click", function (e) {
    e.preventDefault();
    var link = $(this).attr('href');
    chrome.tabs.create({ url: link });
  })

  $(".navopenfullpage").on("click", function (e) {
    e.preventDefault();

    var params = $("#url").val() ? ('?url=' + $("#url").val()) : '';
    var link = $(this).attr('href') + params;
    chrome.tabs.create({ url: link });
  })

  getLastState = function (name) {
    var localStorageState = localStorage.getItem(name);
    if (localStorageState) {
      //console.log('localStorageState: ', JSON.parse(localStorageState));    
      return $.parseJSON(localStorageState);
    } else {
      return [];
    }
  };

  setLastState = function (name, state) {
    //console.log(localStorage)
    localStorage.setItem(name, JSON.stringify(state));
  };
  // let's set defaults for all color pickers
  jscolor.presets.default = {
    width: 400,               // make the picker a little narrower
    height: 300,               // make the picker a little narrower
    position: 'right',        // position it to the right of the target
    previewPosition: 'right', // display color preview on the right
    previewSize: 40,          // make the color preview bigger
    palette: [
      '#000000', '#7d7d7d', '#870014', '#ec1c23', '#ff7e26',
      '#fef100', '#22b14b', '#00a1e7', '#3f47cc', '#a349a4',
      '#ffffff', '#c3c3c3', '#b87957', '#feaec9', '#ffc80d',
      '#eee3af', '#b5e61d', '#99d9ea', '#7092be', '#c8bfe7',
    ],
  };

  // https://colorbrewer2.org/#type=qualitative&scheme=Accent&n=3

  var localStorageName2 = "colorPicker2"; // JSON structure for future properties

  var lastState = getLastState(localStorageName2);
  const { tabPaneId: tp, rangeLength: rl, startColor: sc, endColor: ec, rangeMode: rm, medianColor: mc, medianCheckbox: mcb, blenderMode: mm, blenderFirstColor: mfc, blenderLastColor: mlc } = lastState || {};

  let rangeLength = rl || $("#range").val();
  let startColor = sc || '#fafa6e';
  let endColor = ec || '#2A4858';
  let medianColor = mc || '#D8D8D8';
  let medianCheckbox = mcb || false;
  let rangeMode = rm || 'rgb';
  let rangeResult = null;
  let tabPaneId = tp || 'nav-palette-tab';

  let blenderMode = mm || 'multiply';
  let blenderResult = null;
  let blenderFirstColor = mfc || '#fafa6e';
  let blenderLastColor = mlc || '#2A4858';

  let firstBlender = null;
  let lastBlender = null;

  let eyeDropperHistory = [];

  makeLSState = function () {
    //console.log(localStorage)
    const colorPicker2State = {
      rangeLength,
      startColor,
      endColor,
      medianColor,
      medianCheckbox,
      rangeMode,
      blenderMode,
      blenderFirstColor,
      blenderLastColor,
      tabPaneId,
    }
    setLastState(localStorageName2, colorPicker2State);
  };

  setDefaults = function () {
    $("#range").val(5)
    rangeLength = $("#range").val();
    startColor = '#fafa6e';
    endColor = '#2A4858';
    medianColor = '#D8D8D8';
    medianCheckbox = false;
    rangeMode = 'rgb';

    $('#medianCheckbox').prop('checked', medianCheckbox);
    document.querySelector('#medianColor').jscolor.fromString(medianColor);
    $('#color-mode').val(rangeMode);
    $('#range').val(rangeLength).trigger("input");
    makeLSState();
  }

  setBlenderDefaults = function () {
    try {
      blenderMode = 'multiply';
      blenderFirstColor = '#fafa6e';
      blenderLastColor = '#2A4858';
      console.log(firstBlender)
      firstBlender.fromString(blenderFirstColor);
      lastBlender.fromString(blenderLastColor);
      $('#blender-mode').val(blenderMode);
      handleBlenderColorChange();
    } catch (err) {
      console.error(err)
    }
  }

  eyeDropper = function () {
    try {
      console.log('eyeDropper');

      // close popup
      window.close();

      // Post to background script to trigger eyedropper
      chrome.runtime.sendMessage({ eyedropper: true }, response => {
        console.log(response);
      });
    } catch (err) {
      console.error(err)
    }
  }

  displayGrowl = function (message, onTimedOut) {
    $('#growl-notice').html('<img src="https://linangdata.com/color-picker/css/icons/38x38.png" /> <span>' + message + '</span>')
    $("#growl-notice").fadeIn("slow", function () {
      // Animation complete
    });
    setTimeout(function () {
      $("#growl-notice").fadeOut("slow", function () {
        // Animation complete
      });
    }, 2000);
  }

  function chromaScale() {
    // const result = chroma.scale([startColor, endColor]).mode(rangeMode).colors(rangeLength).correctLightness();
    let scale = [startColor, endColor];

    if (medianCheckbox) {
      scale = [startColor, medianColor, endColor];
    }

    return chroma.scale(scale).mode(rangeMode).colors(rangeLength);;
  }

  function chromaBlend() {
    /*       
    * Blends two colors using RGB channel-wise blend functions. Valid blend modes are multiply, darken, lighten, screen, overlay, burn (default), and dodge.
    */
    return chroma.blend(blenderFirstColor.substring(1), blenderLastColor.substring(1), blenderMode).hex();
  }

  /* Listen for messages */
  chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    console.log("popup onMessage....", request);
    if (request && request.hex) {
      console.log("hex", request.hex);
      // Save to local storage for use on eyedropper tab
      // sendResponse({ message: 'success' });
    }
    return true;
  });

  $("#downloadRange").on('click', function () {
    let data = '';
    // rangeResult = chroma.scale([startColor, endColor]).mode(rangeMode).colors(rangeLength).correctLightness();
    rangeResult = chromaScale();
    // console.log('rangeResult', rangeResult);
    for (let index = 0; index < rangeResult.length; index++) {
      data += rangeResult[index] + '\n';
    }
    console.log(data)
    var fileName = 'ColorScale.txt'
    download(data, fileName, 'text/plain')
  });

  $("#downloadBlender").on('click', function () {
    var fileName = 'ColorBlender.txt'
    download(`${blenderFirstColor}\n${blenderResult}\n${blenderLastColor}`, fileName, 'text/plain')
  });

  $('#copyRange').on("click", function (e) {
    let copy = '';
    rangeResult = chromaScale();
    // console.log('rangeResult', rangeResult);
    for (let index = 0; index < rangeResult.length; index++) {
      copy += rangeResult[index] + '\n';
    }
    console.log(copy)
    copyToClipBoard(copy, 'text/plain');
  });

  $('#copyBlender').on("click", function (e) {
    copyToClipBoard(`${blenderFirstColor}\n${blenderResult}\n${blenderLastColor}`, 'text/plain');
  });

  $('#color-mode').on("change", function (e) {
    console.log('#color-mode', $(this).val());
    rangeMode = $(this).val();
    $('#range').val(rangeLength).trigger("input");
  });

  $('#medianCheckbox').on("change", function (e) {
    console.log('#medianCheckbox', this.checked);
    medianCheckbox = this.checked;
    $('#range').val(rangeLength).trigger("input");
  });

  $('#medianColor').on("change", function (e) {
    console.log('#medianColor', $(this).val());
    medianColor = $(this).val();
    $('#range').val(rangeLength).trigger("input");
  });

  $('#blender-mode').on("change", function (e) {
    // console.log('#blender-mode', $(this).val());
    blenderMode = $(this).val();
    handleBlenderColorChange();
  });

  $("#defaults-scale").on('click', function (e) {
    setDefaults();
  });

  $("#defaults-blender").on('click', function (e) {
    setBlenderDefaults();
  });

  $("#eyedropper").on('click', function (e) {
    eyeDropper();
  });


  const handleColorChange = function () {
    $("#paletteStartInput, #paletteEndInput").unbind().on('change', function (e) {
      const newColor = $(this).val();
      const id = e.target.id;
      if (id === 'paletteStartInput') {
        startColor = newColor;
        console.log('startColor', startColor);
      } else {
        endColor = newColor;
      }
      rangeResult = chromaScale();
      // console.log('rangeResult', rangeResult);
      for (let index = 1; index < rangeResult.length - 1; index++) {
        const element = rangeResult[index];
        $('#colorcard-' + index).css('background-color', element);
        $('#colorcard-label-' + index).html(element);
      }
      makeLSState();
    });
    makeLSState();
  };

  const handleBlenderColorChange = function () {
    blenderResult = chromaBlend();
    // console.log('handleBlenderColorChange', blenderFirstColor, blenderLastColor, blenderMode, blenderResult);
    $('#colorcard-b').css('background-color', blenderResult);
    $('#colorcard-label-b').html(blenderResult);
    makeLSState();
  };

  $("#range").on('input', function (e) {
    rangeLength = $(this).val();

    $(this).next().val(rangeLength);

    // console.log('rangeLength', rangeLength)
    $("#cardColors").empty();
    // $("#paletteLabels").empty();
    rangeResult = chromaScale();

    $("#cardColors").append('<div id="cardrow-0" class="cardrow d-flex flex-column"></div>')
    $("#cardrow-0").append('<button id="paletteStartcolorcard" class="colorcard jscolor jscolor-active mx-1"></button>');
    $("#cardrow-0").append('<input id="paletteStartInput" value="fafa6e" autocomplete="off" class="mx-auto">');
    const paletteStartcolorcardPicker = new JSColor('#paletteStartcolorcard', { valueElement: "#paletteStartInput", value: startColor, position: 'right', uppercase: false, hash: true });

    for (let index = 1; index < rangeResult.length - 1; index++) {
      const element = rangeResult[index];
      $("#cardColors").append('<div id="cardrow-' + index + '" class="cardrow d-flex flex-column"></div>')
      $("#cardrow-" + index).append('<div id="colorcard-' + index + '" class="colorcard mx-1" style="background-color: ' + element + '"></div>');
      $("#cardrow-" + index).append('<p id="colorcard-label-' + index + '" class="p-1 mx-auto">' + element + '</p>');
    }

    $("#cardColors").append('<div id="cardrow-' + rangeResult.length + '" class="cardrow d-flex flex-column"></div>')
    $("#cardrow-" + rangeResult.length).append('<button id="paletteEndcolorcard" class="colorcard jscolor jscolor-active mx-1"></button>');
    $("#cardrow-" + rangeResult.length).append('<input id="paletteEndInput" value="2A4858" autocomplete="off" class="mx-auto">');
    const paletteEndcolorcardPicker = new JSColor('#paletteEndcolorcard', { valueElement: "#paletteEndInput", value: endColor, position: 'left', uppercase: false, hash: true });

    handleColorChange();
  });

  const buildblenderCards = function () {
    $("#blenderCardColors").empty();
    blenderResult = chromaBlend();
    // console.log(blenderResult);
    $("#blenderCardColors").append('<div id="blender-cardrow-f" class="cardrow d-flex flex-column flex-grow-1"></div>')
    $("#blender-cardrow-f").append('<button id="blenderFirstcolorcard" class="colorcard jscolor jscolor-active mx-1"></button>');
    $("#blender-cardrow-f").append('<input id="blenderFirstInput" value="fafa6e" autocomplete="off" class="mx-auto">');
    firstBlender = new JSColor('#blenderFirstcolorcard', { valueElement: "#blenderFirstInput", value: blenderFirstColor, position: 'right', uppercase: false, hash: true });

    $("#blenderCardColors").append('<div id="cardrow-b" class="cardrow d-flex flex-column flex-grow-1"></div>')
    $("#cardrow-b").append('<div id="colorcard-b" class="colorcard mx-1" style="background-color: ' + blenderResult + '"></div>');
    $("#cardrow-b").append('<p id="colorcard-label-b" class="m-1 mx-auto">' + blenderResult + '</p>');

    $("#blenderCardColors").append('<div id="blender-cardrow-l" class="cardrow d-flex flex-column flex-grow-1"></div>')
    $("#blender-cardrow-l").append('<button id="blenderLastcolorcard" class="colorcard jscolor jscolor-active mx-1"></button>');
    $("#blender-cardrow-l").append('<input id="blenderLastInput" value="fafa6e" autocomplete="off" class="mx-auto">');
    lastBlender = new JSColor('#blenderLastcolorcard', { valueElement: "#blenderLastInput", value: blenderLastColor, position: 'left', uppercase: false, hash: true });

    handleBlenderColorChange();
  };

  const hexToHsl = function (code) {
    let hsl = chroma(code).hsl();
    // console.log('hsl', hsl);
    hsl = hsl.map((el, i) => {
      
      let num = '';
      if ( i === 3) {
      } else if (i > 0) {
        num = Number.isNaN(el) ? 0 : Number(el.toFixed(2));
        num = num*100;
        num = Number(num.toFixed(2));
        num += '%';
      } else {
        num = Number.isNaN(el) ? 0 : Number(el.toFixed(0));
        //num += 'deg';
      }
      return num;
    });
    hsl.pop();
    return hsl.join(' ');
  }

  const hexToHsv = function (code) {
    let hsv = chroma(code).hsv();
    hsv = hsv.map((el, i) => {
      // console.log(code, el);
      let num = '';
      if (i > 0) {
        num = Number.isNaN(el) ? 0 : Number(el.toFixed(2));
        num = num*100;
        num = Number(num.toFixed(2));
        num += '%';
      } else {
        num = Number.isNaN(el) ? 0 : Number(el.toFixed(0));
        //num += 'deg';
      }
      return num;
    });
    return hsv.join(' ');
  }

  const hexToCmyk = function (code) {
    let cmyk = chroma(code).hsv();
    // console.log(code, cmyk);
    cmyk = cmyk.map(el => {
      let num = Number.isNaN(el) ? 0 : Number(el.toFixed(0))
      return num;
    });
    return cmyk.join(' ');
  }

  const getEyedropperHistory = function () {
    chrome.storage.sync.get({
      eyedropperHistory: [],
    }, function (items) {
      eyedropperHistory = items.eyedropperHistory;
      // console.log("eyedropperHistory", eyedropperHistory);

      $('#eyedropperCardColors').empty();

      if (eyedropperHistory && eyedropperHistory.length) {
        for (let index = 0; index < eyedropperHistory.length; index++) {
          const eyeDItem = eyedropperHistory[index];
          // console.log("eyedropperHistory", eyeDItem);
          $('#eyedropperCardColors').append(`<div class="eyedropper-card m-1" style="background-color: ${eyeDItem};cursor: pointer" data-code= ${eyeDItem} ></div>`);
        }
      }

      $(".eyedropper-card").unbind().on("click", function (e) {
        e.preventDefault();
        const copyPlus = '<i class="bi bi-clipboard-plus btn text-white" style="cursor:pointer" title="Copy to clipboard"></i>';
        const infoDiv = '<div class="d-flex justify-content-between clipboard-copy-info ">';
        const infoDivEnd = '</div>'
        const code = $(this).data("code");

        const rgb = chroma(code).rgb().join(' ');
        const hsl = hexToHsl(code);
        const hsv = hexToHsv(code);
        const cmyk = hexToCmyk(code);

        $('#eyedropper-info').html(`${infoDiv}<span class="info-span">${code}</span>${copyPlus}${infoDivEnd}${infoDiv}<span class="info-span">rgb(${rgb})</span>${copyPlus}${infoDivEnd}${infoDiv}<span class="info-span">hsl(${hsl})</span>${copyPlus}${infoDivEnd}${infoDiv}<span class="info-span">hsv(${hsv})</span>${copyPlus}${infoDivEnd}${infoDiv}<span class="info-span">cmyk(${cmyk})</span>${copyPlus}${infoDivEnd}`);

        $(".eyedropper-card").removeClass("selected-card");
        $(this).addClass("selected-card");

        $('.clipboard-copy-info').unbind().on("click", function (e) {
          const copy = $(this).find('.info-span').text();
          // console.log(this)
          copyToClipBoard(copy, 'text/plain');
        });
      })

      if (eyedropperHistory && eyedropperHistory.length) {
        $(".eyedropper-card:first").trigger('click');
        $(".eyedropper-card:first").addClass("selected-card");
      }

    });
  };

  // console.log(rangeMode);
  $('#medianCheckbox').prop('checked', medianCheckbox);
  document.querySelector('#medianColor').jscolor.fromString(medianColor);
  $('#color-mode').val(rangeMode);
  $('#range').val(rangeLength).trigger("input");
  $('#blender-mode').val(blenderMode);

  try {
    if (tabPaneId) {
      $(`#${tabPaneId}`).trigger('click');
    }

    $('button[data-bs-toggle="tab"]').on('shown.bs.tab', function (e) {
      tabPaneId = $(e.target).attr('id');
      // console.log (tabPaneId);
      // console.log ($(e.target).attr('data-bs-target'));
      makeLSState();
    });
  } catch (err) { console.error(err) }

  buildblenderCards();

  $("#blenderFirstInput, #blenderLastInput").on('change', function (e) {
    const newColor = $(this).val();
    const id = e.target.id;
    if (id === 'blenderFirstInput') {
      blenderFirstColor = newColor;
      console.log('blenderFirstColor', blenderFirstColor);
    } else {
      blenderLastColor = newColor;
    }
    blenderResult = chromaBlend();
    console.log('#blenderFirstInput, #blenderLastInput', blenderFirstColor, blenderLastColor, blenderMode, blenderResult)
    $('#colorcard-b').css('background-color', blenderResult);
    $('#colorcard-label-b').html(blenderResult);

    // console.log('blenderResult', blenderResult);
    makeLSState();
  });

  getEyedropperHistory();

});
