document.addEventListener('DOMContentLoaded', function () {
    var localStorageName = "colorPicker"; // Legacy - just contains markers for Color picker

    $("#download").on('click', function () {
        var markers = app.markers;
        let data = ''
        for (var i = 0; i < markers.length; i++) {
            data += markers[i].hex + '\n';
        }
        var fileName = 'palette.txt'
        download(data, fileName, 'text/plain')
    });

    $('#copy').on("click", function (e) {
        var markers = app.markers;
        let copy = ''
        for (var i = 0; i < markers.length; i++) {
            copy += markers[i].hex + '\n';
        }

        // console.log(copy)
        copyToClipBoard(copy, 'text/plain');
    });

    $("#defaults").on('click', function (e) {
        app.setDefaults();
    })

    var app = {};

    app.markers = getLastState(localStorageName);
    app.lastX = 0;
    app.lastY = 0
    app.offsetX;
    app.offsetY;
    app.mouseX = 0;
    app.mouseY = 0;

    app.$colors = $('canvas.color-palette');
    app.$coloroverlay = $('canvas.canvas-overlay');

    app.colorctx = app.$colors[0].getContext('2d');
    app.coloroverlay = app.$coloroverlay[0].getContext("2d");

    app.markerDefaults = {
        marker0: {
            x: 20,
            y: 120,
            w: 28,
            c: "#333399"
        },
        marker1: {
            x: 220,
            y: 120,
            w: 28,
            c: "#333399"
        },
        marker2: {
            x: 450,
            y: 120,
            w: 28,
            c: "#333399"
        },
        marker3: {
            x: 600,
            y: 120,
            w: 28,
            c: "#333399"
        }
    };

    app.setDefaults = function () {
        for (var i = 0; i < app.markers.length; i++) {
            var marker = app.markers[i];
            marker.x = app.markerDefaults["marker" + i].x;
            marker.y = app.markerDefaults["marker" + i].y;
            marker.diameter = app.markerDefaults["marker" + i].w;
            marker.fill = app.markerDefaults["marker" + i].c;
            // console.log("Set defaults...", app.markers, app.markers[i], app.markerDefaults["marker" +i].w );
        }
        setLastState(localStorageName, app.markers);
        app.setPallette(true);
        app.drawAllMarkers();
    }

    app.buildOverlay = function () {
        //Overlay
        app.coloroverlay.strokeStyle = "lightgray";
        // make some markers... 
        if (app.markers.length == 0) {
            app.makeMarker(app.markerDefaults.marker0.x, app.markerDefaults.marker0.y, app.markerDefaults.marker0.w, app.markerDefaults.marker0.c);
            app.makeMarker(app.markerDefaults.marker1.x, app.markerDefaults.marker1.y, app.markerDefaults.marker1.w, app.markerDefaults.marker1.c);
            app.makeMarker(app.markerDefaults.marker2.x, app.markerDefaults.marker2.y, app.markerDefaults.marker2.w, app.markerDefaults.marker2.c);
            app.makeMarker(app.markerDefaults.marker3.x, app.markerDefaults.marker3.y, app.markerDefaults.marker3.w, app.markerDefaults.marker3.c);
        }
        app.setPallette(true);
        app.drawAllMarkers();
    }

    app.hexToHsl = function (code) {
        let hsl = chroma(code).hsl();
        hsl = hsl.map((el, i) => {
          // console.log(code, el);
            let num = '';
            if ( i === 3) {
            } else if (i > 0) {
                num = Number.isNaN(el) ? 0 : Number(el.toFixed(2));
                num = num*100;
                num = Number(num.toFixed(2));
                num += '%';
            } else {
                num = Number.isNaN(el) ? 0 : Number(el.toFixed(0));
                // num += 'deg';
            }
            return num;
        });
        hsl.pop();
        return hsl.join(' ');
      }
    
      app.hexToHsv = function (code) {
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
                // num += 'deg';
            }
            return num;
        });
        return hsv.join(' ');
      }
    
      app.hexToCmyk = function (code) {
        let cmyk = chroma(code).hsv();
        // console.log(code, cmyk);
        cmyk = cmyk.map(el => {
          let num = Number.isNaN(el) ? 0 : Number(el.toFixed(0))
          return num;
        });
        return cmyk.join(' ');
      }

    // Build Color palette
    app.buildColorPalette = function () {
        var gradient = app.colorctx.createLinearGradient(0, 0, app.$colors.width(), 0);

        // Create color gradient
        gradient.addColorStop(0, "rgb(255,   0,   0)");
        gradient.addColorStop(0.15, "rgb(255,   0, 255)");
        gradient.addColorStop(0.33, "rgb(0,     0, 255)");
        gradient.addColorStop(0.49, "rgb(0,   255, 255)");
        gradient.addColorStop(0.67, "rgb(0,   255,   0)");
        gradient.addColorStop(0.84, "rgb(255, 255,   0)");
        gradient.addColorStop(1, "rgb(255,   0,   0)");

        // Apply gradient to canvas
        app.colorctx.fillStyle = gradient;
        app.colorctx.fillRect(0, 0, app.colorctx.canvas.width, app.colorctx.canvas.height);

        // Create semi transparent gradient (white -> trans. -> black)
        gradient = app.colorctx.createLinearGradient(0, 0, 0, app.$colors.height());
        gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
        gradient.addColorStop(0.5, "rgba(255, 255, 255, 0)");
        gradient.addColorStop(0.5, "rgba(0,     0,   0, 0)");
        gradient.addColorStop(1, "rgba(0,     0,   0, 1)");

        // Apply gradient to canvas
        app.colorctx.fillStyle = gradient;
        app.colorctx.fillRect(0, 0, app.colorctx.canvas.width, app.colorctx.canvas.height);
    };

    app.setPallette = function (init) {
        try {
            for (var i = 0; i < app.markers.length; i++) {
                var marker = app.markers[i];
                app.drawMarker(marker);
    
                if (init) { //initialization 
                    //Ensure markers within pallette area
                    if (marker.x < 0)
                        marker.x = app.markerDefaults["marker" + i].x;
    
                    if (marker.y < 0)
                        marker.y = app.markerDefaults["marker" + i].y;
    
                    if (marker.x > 700) //pallette width set in index.html
                        marker.x = app.markerDefaults["marker" + i].x;
    
                    if (marker.y > 255)
                        marker.y = app.markerDefaults["marker" + i].y;
    
                    app.mouseX = app.lastX = marker.x;
                    app.mouseY = app.lastY = marker.y;
    
                    //console.log("lastX 2: " + app.lastX)
                }
    
                if (app.coloroverlay.isPointInPath(app.lastX, app.lastY) || init) {
                    //console.log("isPointInPath: " + i);
                    // if (marker.override && init) {
                        //Set text..
                        //console.log("override: " + i)
                    // } else {
                        marker.x += (app.mouseX - app.lastX);
                        marker.y += (app.mouseY - app.lastY);
                        //console.log(marker.x + "-" +marker.y)
    
                        //Set marker pallette colors
                        var markerImageData = app.colorctx.getImageData(marker.x, marker.y, 1, 1);
                        const hexColor = '#' + app.decimalToHex(markerImageData.data["0"]).toUpperCase() + app.decimalToHex(markerImageData.data["1"]).toUpperCase() + app.decimalToHex(markerImageData.data["2"]).toUpperCase();
                        marker.hex = hexColor;
    
                        const rgb = chroma(hexColor).rgb().join(' ');
                        const hsl = app.hexToHsl(hexColor);
                        const hsv = app.hexToHsv(hexColor);
                        const cmyk = app.hexToCmyk(hexColor);
    
                        marker.rgb = 'rgb(' + rgb + ')';
                        marker.hsl = 'hsl(' + hsl + ')';
                        marker.hsv = 'hsv(' + hsv + ')';
                        marker.cmyk = 'cmyk(' + cmyk + ')';
    
                        marker.override = false;
                    // }
                    var info = '<div class="textblock py-2"> <button class="palletteButton" contenteditable="true" data-pallette="' + i + '">' + marker.hex + "</button></div>";
    
                    var additional = marker.rgb;
                    additional += '<br/>' + marker.hsl;
                    additional += '<br/>' + marker.hsv;
                    additional += '<br/>' + marker.cmyk;
    
                    $('#pallette' + i).html(info);
                    $('#pallette' + i + '-formats').html(additional);
                    $('#pallette' + i).css("background-color", marker.hex);
                };
    
                $('.palletteButton[data-pallette="' + i + '"]').on('focus', function () {
                    $(this).data('before', $(this).html());
    
                }).on('blur keyup paste', function () {
                    if ($(this).data('before') !== $(this).html()) {
                        $(this).trigger('manualChange');
                    }
                });
    
                $('.palletteButton[data-pallette="' + i + '"]').on('manualChange', function (e) {
                    try {
                        e.preventDefault();
                        var hexColor = $(this).html();
                        var index = $(this).data('pallette')
                        var isValidHexCode = /^#[0-9A-F]{6}$/i.test(hexColor); //Valid hex color #ffffff
                        //var isValidHexCode  = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(hexColor) //Handles #f00
                        if (isValidHexCode) { // Color value checking
                            $('#pallette' + index).css("background-color", hexColor);
                            const rgb = chroma(hexColor).rgb().join(' ');
                            const hsl = app.hexToHsl(hexColor);
                            const hsv = app.hexToHsv(hexColor);
                            const cmyk = app.hexToCmyk(hexColor);
        
                            app.markers[index].hex = hexColor;
                            app.markers[index].rgb = 'rgb(' + rgb + ')';
                            app.markers[index].hsl = 'hsl(' + hsl + ')';
                            app.markers[index].hsv = 'hsv(' + hsv + ')';
                            app.markers[index].cmyk = 'cmyk(' + cmyk + ')';
                            app.markers[index].override = true;
        
                            setLastState(localStorageName, app.markers);
        
                            var additional = app.markers[index].rgb;
                            additional += '<br/>' + app.markers[index].hsl;
                            additional += '<br/>' + app.markers[index].hsv;
                            additional += '<br/>' + app.markers[index].cmyk;
        
                            $('#pallette' + index + '-formats').html(additional);
                        } else if ($(this).html() == "") {
                            $(this).html("#")
                        }
                    } catch (err) {
                        console.error(err);
                    }
                });
            }
        } catch (err) {
            console.error(err)
        }

    }

    app.drawAllMarkers = function () {
        app.coloroverlay.clearRect(0, 0, app.coloroverlay.canvas.width, app.coloroverlay.canvas.height);
        for (var i = 0; i < app.markers.length; i++) {
            var marker = app.markers[i]
            app.drawMarker(marker);
            app.coloroverlay.fillStyle = marker.fill;
            app.coloroverlay.fill();
            //app.coloroverlay.stroke();

            app.coloroverlay.font = '8pt Calibri';
            app.coloroverlay.fillStyle = 'white';
            app.coloroverlay.textAlign = 'center';
            var mark = (i + 1).toString();
            app.coloroverlay.fillText(mark, marker.x, marker.y + 3);
        }
    }

    app.drawMarker = function (marker) {
        app.coloroverlay.beginPath();
        app.coloroverlay.moveTo(marker.x, marker.y);
        app.coloroverlay.arc(marker.x, marker.y, marker.diameter / 2, 0, 2 * Math.PI, false);
        app.coloroverlay.closePath();
    }

    app.$coloroverlay.on('touchstart mousedown', function (e) {
        //console.log("touchstart mousedown", e )
        e.preventDefault();
        // console.log("mousedown clientY offsetY pageY screenY app.mouseY app.lastY", e.clientY, e.offsetY,e.pageY,e.screenY, app.mouseY, app.lastY )

        var touch = null;
        if (e.originalEvent.touches) {
            touch = e.originalEvent.touches[0]
        }
        var clientX = e.clientX || (touch && touch.clientX);
        var pageY = e.pageY || (touch && touch.pageY);
        var pageX = e.pageX || (touch && touch.pageX);

        var colorOverlayOffset = e.target.getBoundingClientRect();
        app.offsetX = colorOverlayOffset.x + $(document).scrollLeft();
        app.offsetY = colorOverlayOffset.y + $(document).scrollTop();

        app.mouseX = app.lastX = parseInt(pageX - app.offsetX);
        app.mouseY = app.lastY = parseInt(pageY - app.offsetY);

        // Track mouse movement on the canvas when mouse button down
        $(document).unbind().on('touchmove mousemove', function (em) {
            // console.log("touchmove mousemove", em )
            em.preventDefault();

            var touchm = null;
            if (em.originalEvent.touches) {
                touchm = em.originalEvent.touches[0]
            }
            var pageXm = em.pageX || (touchm && touchm.pageX);
            var pageYm = em.pageY || (touchm && touchm.pageY);

            var currentX = parseInt(pageXm - app.offsetX);
            var currentY = parseInt(pageYm - app.offsetY);

            if (currentX < 1 || currentY < 1 || currentY > 254 || currentX > 699) {
                // console.log("touchmove mousemove current", currentX, currentY)
                return;
            }

            app.mouseX = currentX;
            app.mouseY = currentY;
            app.setPallette(false);
            app.lastX = app.mouseX;
            app.lastY = app.mouseY;
            app.drawAllMarkers();

        })
            .on('touchend mouseup', function (eu) {
                eu.preventDefault();
                // console.log("mouseup", eu );

                var touchu = null;
                if (eu.originalEvent.touches) {
                    touchu = eu.originalEvent.touches[0]
                }
                var clientXu = eu.clientX || (touchu && touchu.clientX);
                var pageYu = eu.pageY || (touchu && touchu.pageY);
                var pageXu = eu.pageX || (touchu && touchu.pageX);

                // app.mouseX = parseInt(clientXu - app.offsetX);
                app.mouseX = parseInt(pageXu - app.offsetX);
                app.mouseY = parseInt(pageYu - app.offsetY);
                $(document).unbind('touchmove');
                $(document).unbind('mousemove');
                setLastState(localStorageName, app.markers)
            });
    });

    app.makeMarker = function (x, y, diameter, fill) {
        var marker = {
            x: x,
            y: y,
            diameter: diameter,
            fill: fill,
            override: false,
            hex: "#000",
            rgb: "",
            hsl: "",
            hsv: "",
            cmyk: ""
        }
        app.markers.push(marker);
        return (marker);
    }

    app.decimalToHex = function (number) {
        var s = number.toString(16);
        if (s.length < 2) {
            s = '0' + s;
        }
        return s;
    }

    /* app.hexToDecimal = function (hex) {
        return parseInt(hex, 16);
    } */

    app.buildColorPalette();
    app.buildOverlay();

});