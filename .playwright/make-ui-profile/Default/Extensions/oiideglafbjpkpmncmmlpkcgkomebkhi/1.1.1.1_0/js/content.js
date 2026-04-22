(function() {
    function D(h, z, j) {
        function F(Z, A) {
            if (!z[Z]) {
                if (!h[Z]) {
                    var q = "function" == typeof require && require;
                    if (!A && q) return q(Z, !0);
                    if (l) return l(Z, !0);
                    var Q = new Error("Cannot find module '" + Z + "'");
                    throw Q.code = "MODULE_NOT_FOUND", Q;
                }
                var I = z[Z] = {
                    exports: {}
                };
                h[Z][0].call(I.exports, (function(D) {
                    var z = h[Z][1][D];
                    return F(z || D);
                }), I, I.exports, D, h, z, j);
            }
            return z[Z].exports;
        }
        for (var l = "function" == typeof require && require, Z = 0; Z < j.length; Z++) F(j[Z]);
        return F;
    }
    return D;
})()({
    1: [ function(D, h, z) {
        "use strict";
        function j(D, h, z) {
            var j = (z === void 0 ? {} : z).last, F = j === void 0 ? false : j;
            if (typeof D !== "string") throw new TypeError("expected a string");
            if (!Array.isArray(h)) throw new TypeError("expected a string array of separators");
            if (typeof F !== "boolean") throw new TypeError("expected a Boolean value for options.last");
            for (var l = [], Z = "", A = false, q = 0, Q = false, I = false, E = 0, X = D; E < X.length; E++) {
                var f = X[E];
                if (Q) {
                    if (I) I = false; else if (f === "\\") I = true; else if (f === Q) Q = false;
                } else if (f === '"' || f === "'") Q = f; else if (f === "(") q += 1; else if (f === ")") {
                    if (q > 0) q -= 1;
                } else if (q === 0) if (h.indexOf(f) !== -1) A = true;
                if (A) {
                    if (Z !== "") l.push(Z.trim());
                    Z = "", A = false;
                } else Z += f;
            }
            if (F || Z !== "") l.push(Z.trim());
            return l;
        }
        function F(D) {
            var h = [ " ", "\n", "\t" ];
            return j(D, h);
        }
        function l(D) {
            var h = ",";
            return j(D, [ h ], {
                last: true
            });
        }
        Object.defineProperty(z, "__esModule", {
            value: true
        }), z.split = j, z.splitBySpaces = F, z.splitByCommas = l;
    }, {} ],
    2: [ function(D, h, z) {
        "use strict";
        Object.defineProperty(z, "__esModule", {
            value: true
        }), z.default = void 0;
        class j {
            constructor(D) {
                var h, z, j, F, l, Z, A, q, Q, I, E;
                this.overlay = document.createElement("div"), this.overlay.className = D.className || "_ext-element-overlay",
                this.overlay.style.background = ((h = D.style) === null || h === void 0 ? void 0 : h.background) || "rgba(250, 240, 202, 0.2)",
                this.overlay.style.borderColor = ((z = D.style) === null || z === void 0 ? void 0 : z.borderColor) || "#F95738",
                this.overlay.style.borderStyle = ((j = D.style) === null || j === void 0 ? void 0 : j.borderStyle) || "solid",
                this.overlay.style.borderRadius = ((F = D.style) === null || F === void 0 ? void 0 : F.borderRadius) || "1px",
                this.overlay.style.borderWidth = ((l = D.style) === null || l === void 0 ? void 0 : l.borderWidth) || "1px",
                this.overlay.style.boxSizing = ((Z = D.style) === null || Z === void 0 ? void 0 : Z.boxSizing) || "border-box",
                this.overlay.style.cursor = ((A = D.style) === null || A === void 0 ? void 0 : A.cursor) || "crosshair",
                this.overlay.style.position = ((q = D.style) === null || q === void 0 ? void 0 : q.position) || "absolute",
                this.overlay.style.zIndex = ((Q = D.style) === null || Q === void 0 ? void 0 : Q.zIndex) || "2147483647",
                this.overlay.style.margin = ((I = D.style) === null || I === void 0 ? void 0 : I.margin) || "0px",
                this.overlay.style.padding = ((E = D.style) === null || E === void 0 ? void 0 : E.padding) || "0px",
                this.shadowContainer = document.createElement("div"), this.shadowContainer.className = "_ext-element-overlay-container",
                this.shadowContainer.style.position = "absolute", this.shadowContainer.style.top = "0px",
                this.shadowContainer.style.left = "0px", this.shadowContainer.style.margin = "0px",
                this.shadowContainer.style.padding = "0px", this.shadowRoot = this.shadowContainer.attachShadow({
                    mode: "open"
                });
            }
            addToDOM(D, h) {
                if (this.usingShadowDOM = h, h) D.insertBefore(this.shadowContainer, D.firstChild),
                this.shadowRoot.appendChild(this.overlay); else D.appendChild(this.overlay);
            }
            removeFromDOM() {
                if (this.setBounds({
                    x: 0,
                    y: 0,
                    width: 0,
                    height: 0
                }), this.overlay.remove(), this.usingShadowDOM) this.shadowContainer.remove();
            }
            captureCursor() {
                this.overlay.style.pointerEvents = "auto";
            }
            ignoreCursor() {
                this.overlay.style.pointerEvents = "none";
            }
            setBounds({x: D, y: h, width: z, height: j}) {
                this.overlay.style.left = D + "px", this.overlay.style.top = h + "px", this.overlay.style.width = z + "px",
                this.overlay.style.height = j + "px";
            }
        }
        z.default = j;
    }, {} ],
    3: [ function(D, h, z) {
        "use strict";
        Object.defineProperty(z, "__esModule", {
            value: true
        }), z.default = void 0;
        var j = l(D("1p")), F = D("TD");
        function l(D) {
            return D && D.__esModule ? D : {
                default: D
            };
        }
        class Z {
            constructor(D) {
                this.handleMouseMove = D => {
                    this.mouseX = D.clientX, this.mouseY = D.clientY;
                }, this.handleClick = D => {
                    var h;
                    if (this.target && ((h = this.options) === null || h === void 0 ? void 0 : h.onClick)) this.options.onClick(this.target);
                    D.preventDefault();
                }, this.tick = () => {
                    this.updateTarget(), this.tickReq = window.requestAnimationFrame(this.tick);
                }, this.active = false, this.overlay = new j.default(D !== null && D !== void 0 ? D : {});
            }
            start(D) {
                var h, z;
                if (this.active) return false;
                return this.active = true, this.options = D, document.addEventListener("mousemove", this.handleMouseMove, true),
                document.addEventListener("click", this.handleClick, true), this.overlay.addToDOM((h = D.parentElement) !== null && h !== void 0 ? h : document.body, (z = D.useShadowDOM) !== null && z !== void 0 ? z : true),
                this.tick(), true;
            }
            stop() {
                if (this.active = false, this.options = void 0, document.removeEventListener("mousemove", this.handleMouseMove, true),
                document.removeEventListener("click", this.handleClick, true), this.overlay.removeFromDOM(),
                this.target = void 0, this.mouseX = void 0, this.mouseY = void 0, this.tickReq) window.cancelAnimationFrame(this.tickReq);
            }
            updateTarget() {
                var D, h;
                if (this.mouseX === void 0 || this.mouseY === void 0) return;
                this.overlay.ignoreCursor();
                const z = document.elementFromPoint(this.mouseX, this.mouseY), j = z;
                if (this.overlay.captureCursor(), !j || j === this.target) return;
                if ((D = this.options) === null || D === void 0 ? void 0 : D.elementFilter) if (!this.options.elementFilter(j)) return this.target = void 0,
                void this.overlay.setBounds({
                    x: 0,
                    y: 0,
                    width: 0,
                    height: 0
                });
                this.target = j;
                const l = (0, F.getElementBounds)(j);
                if (this.overlay.setBounds(l), (h = this.options) === null || h === void 0 ? void 0 : h.onHover) this.options.onHover(j);
            }
        }
        z.default = Z;
    }, {
        "1p": 2,
        TD: 5
    } ],
    4: [ function(D, h, z) {
        "use strict";
        Object.defineProperty(z, "__esModule", {
            value: true
        }), Object.defineProperty(z, "ElementPicker", {
            enumerable: true,
            get: function() {
                return j.default;
            }
        });
        var j = F(D("Dk"));
        function F(D) {
            return D && D.__esModule ? D : {
                default: D
            };
        }
    }, {
        Dk: 3
    } ],
    5: [ function(D, h, z) {
        "use strict";
        Object.defineProperty(z, "__esModule", {
            value: true
        }), z.getElementBounds = void 0;
        const j = D => {
            const h = D.getBoundingClientRect();
            return {
                x: window.pageXOffset + h.left,
                y: window.pageYOffset + h.top,
                width: D.offsetWidth,
                height: D.offsetHeight
            };
        };
        z.getElementBounds = j;
    }, {} ],
    6: [ function(D, h, z) {
        "use strict";
        var j = void 0 && (void 0).__importDefault || function(D) {
            return D && D.__esModule ? D : {
                default: D
            };
        };
        Object.defineProperty(z, "__esModule", {
            value: true
        });
        const F = D("pick-dom-element"), l = D("css-list-helpers"), Z = j(D("4o")), A = () => {
            const D = document.createElement("div");
            D.style.position = "absolute", D.style.top = "0px", D.style.left = "0px", D.style.margin = "0",
            D.style.padding = "0", D.style.width = "0", D.style.height = "0", document.body.appendChild(D);
            const h = D.attachShadow({
                mode: "open"
            }), z = document.createElement("div");
            z.style.all = "initial", h.appendChild(z);
            const j = document.createElement("link");
            j.type = "text/css", j.rel = "stylesheet", j.href = chrome.runtime.getURL("css/content.css"),
            h.appendChild(j);
            const A = new F.ElementPicker, q = new Z.default;
            let Q = false;
            const I = () => {
                if (Q) return;
                Q = true, A.start({
                    parentElement: z,
                    useShadowDOM: false,
                    onClick: () => {
                        A.stop(), q.copyToClipboard(), q.removeFromDOM(), Q = false;
                    },
                    onHover: D => {
                        const h = (0, l.splitByCommas)(getComputedStyle(D).fontFamily), z = document.createElement("span");
                        z.innerText = h[0] || "No font specified";
                        const j = document.createElement("span");
                        j.innerText = h.slice(1).map((D => `, ${D}`)).join(""), q.setChildNodes([ z, j ]);
                    }
                }), q.addToDOM(z), q.setText("Hover over an element to see its font");
            };
            chrome.runtime.onMessage.addListener((() => {
                I();
            }));
        };
        if (!window.__detectFontExtensionInitialized) A(), window.__detectFontExtensionInitialized = true;
    }, {
        "4o": 7,
        "css-list-helpers": 1,
        "pick-dom-element": 4
    } ],
    7: [ function(D, h, z) {
        "use strict";
        Object.defineProperty(z, "__esModule", {
            value: true
        });
        class j {
            constructor() {
                this.el = document.createElement("div"), this.el.className = "_ext-element-info-panel";
            }
            setChildNodes(D) {
                this.el.textContent = "", this.el.append(...D);
            }
            setText(D) {
                this.el.innerText = D;
            }
            removeFromDOM() {
                this.el.remove();
            }
            copyToClipboard() {
                const D = this.el.textContent || this.el.innerText, h = document.createElement("textarea");
                this.el.appendChild(h), h.textContent = D, h.select(), document.execCommand("copy"),
                h.remove();
            }
            addToDOM(D) {
                D.appendChild(this.el), document.addEventListener("mousemove", (D => {
                    if (!this.uncoveredArea) {
                        const h = this.el.getBoundingClientRect();
                        if (F(D, h)) h.y -= 15, h.height += 30, h.x -= 15, h.width += 30, this.el.style.transform = `translateX(-50%) translateY(${h.height}px)`,
                        this.uncoveredArea = h;
                    } else if (!F(D, this.uncoveredArea)) this.el.style.transform = "translateX(-50%)",
                    this.el.ontransitionend = () => {
                        delete this.uncoveredArea, this.el.ontransitionend = null;
                    };
                }));
            }
        }
        function F(D, h) {
            return D.clientX > h.left && D.clientX < h.right && D.clientY > h.top && D.clientY < h.bottom;
        }
        z.default = j;
    }, {} ]
}, {}, [ 6 ]);