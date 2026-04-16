(function () {
  var SCRIPT_NAME = "flowholt-chat-widget.js";

  function normalizeBaseUrl(baseUrl) {
    return String(baseUrl || window.location.origin || "").replace(/\/$/, "");
  }

  function buildIframeUrl(options) {
    var baseUrl = normalizeBaseUrl(options.baseUrl);
    var params = new URLSearchParams();
    params.set("embed", "1");
    if (options.mode === "inline") {
      params.set("widget_mode", "inline");
    }
    return baseUrl + "/chat/" + encodeURIComponent(options.workspaceId) + "/" + encodeURIComponent(options.workflowId) + "?" + params.toString();
  }

  function createFrame(options) {
    var iframe = document.createElement("iframe");
    iframe.src = buildIframeUrl(options);
    iframe.title = options.title || "FlowHolt Chat";
    iframe.loading = "lazy";
    iframe.referrerPolicy = "strict-origin-when-cross-origin";
    iframe.allow = "clipboard-write";
    iframe.style.width = "100%";
    iframe.style.height = "100%";
    iframe.style.border = "0";
    iframe.style.background = "transparent";
    iframe.style.borderRadius = options.mode === "inline" ? "24px" : "24px 24px 20px 20px";
    return iframe;
  }

  function mountInline(options) {
    var target = options.containerSelector ? document.querySelector(options.containerSelector) : null;
    if (!target && options.script && options.script.parentElement) {
      target = options.script.parentElement;
    }
    if (!target) {
      console.error("FlowHolt widget: inline mode requires a container element.");
      return null;
    }

    var wrapper = document.createElement("div");
    wrapper.style.width = options.width || "100%";
    wrapper.style.height = options.height || "680px";
    wrapper.style.border = "1px solid rgba(15, 23, 42, 0.12)";
    wrapper.style.borderRadius = "24px";
    wrapper.style.overflow = "hidden";
    wrapper.style.boxShadow = "0 24px 60px rgba(15, 23, 42, 0.18)";
    wrapper.style.background = "#0f172a";
    wrapper.appendChild(createFrame(options));
    target.appendChild(wrapper);
    return {
      destroy: function () {
        wrapper.remove();
      },
      open: function () {},
      close: function () {},
      toggle: function () {},
    };
  }

  function mountPopup(options) {
    var accent = options.accentColor || "#0ea5e9";
    var root = document.createElement("div");
    root.style.position = "fixed";
    root.style.zIndex = "2147483000";
    root.style.right = options.position === "left" ? "auto" : "24px";
    root.style.left = options.position === "left" ? "24px" : "auto";
    root.style.bottom = "24px";
    root.style.fontFamily = "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

    var panel = document.createElement("div");
    panel.style.width = options.width || "420px";
    panel.style.height = options.height || "680px";
    panel.style.marginBottom = "14px";
    panel.style.borderRadius = "24px";
    panel.style.overflow = "hidden";
    panel.style.border = "1px solid rgba(15, 23, 42, 0.12)";
    panel.style.boxShadow = "0 28px 70px rgba(15, 23, 42, 0.28)";
    panel.style.background = "#0f172a";
    panel.style.display = options.openByDefault ? "block" : "none";
    panel.appendChild(createFrame(options));

    var button = document.createElement("button");
    button.type = "button";
    button.textContent = options.buttonLabel || options.title || "Chat";
    button.setAttribute("aria-expanded", options.openByDefault ? "true" : "false");
    button.style.display = "inline-flex";
    button.style.alignItems = "center";
    button.style.justifyContent = "center";
    button.style.gap = "10px";
    button.style.minWidth = "64px";
    button.style.height = "56px";
    button.style.padding = "0 22px";
    button.style.border = "0";
    button.style.borderRadius = "999px";
    button.style.cursor = "pointer";
    button.style.background = accent;
    button.style.color = "#f8fafc";
    button.style.fontSize = "14px";
    button.style.fontWeight = "700";
    button.style.boxShadow = "0 20px 40px rgba(14, 165, 233, 0.28)";

    function setOpen(nextOpen) {
      panel.style.display = nextOpen ? "block" : "none";
      button.setAttribute("aria-expanded", nextOpen ? "true" : "false");
    }

    button.addEventListener("click", function () {
      setOpen(panel.style.display === "none");
    });

    root.appendChild(panel);
    root.appendChild(button);
    document.body.appendChild(root);

    return {
      destroy: function () {
        root.remove();
      },
      open: function () {
        setOpen(true);
      },
      close: function () {
        setOpen(false);
      },
      toggle: function () {
        setOpen(panel.style.display === "none");
      },
    };
  }

  function resolveOptions(rawOptions, script) {
    var dataset = (script && script.dataset) || {};
    return {
      workspaceId: rawOptions.workspaceId || dataset.workspaceId,
      workflowId: rawOptions.workflowId || dataset.workflowId,
      baseUrl: rawOptions.baseUrl || dataset.baseUrl || window.location.origin,
      mode: rawOptions.mode || dataset.mode || "popup",
      containerSelector: rawOptions.containerSelector || dataset.container,
      title: rawOptions.title || dataset.title || "FlowHolt Chat",
      buttonLabel: rawOptions.buttonLabel || dataset.buttonLabel,
      accentColor: rawOptions.accentColor || dataset.accentColor,
      width: rawOptions.width || dataset.width,
      height: rawOptions.height || dataset.height,
      position: rawOptions.position || dataset.position || "right",
      openByDefault: Boolean(rawOptions.openByDefault || dataset.open === "true"),
      script: script || null,
    };
  }

  function mount(rawOptions, script) {
    var options = resolveOptions(rawOptions || {}, script || null);
    if (!options.workspaceId || !options.workflowId) {
      console.error("FlowHolt widget: workspaceId and workflowId are required.");
      return null;
    }
    return options.mode === "inline" ? mountInline(options) : mountPopup(options);
  }

  window.FlowHoltChatWidget = {
    mount: function (options) {
      return mount(options || {}, null);
    },
  };

  var currentScript = document.currentScript;
  if (currentScript && currentScript.src && currentScript.src.indexOf(SCRIPT_NAME) >= 0) {
    mount({}, currentScript);
  }
})();