"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Behavior = require("aurelia-templating").Behavior;

var InnerHTML = exports.InnerHTML = (function () {
  function InnerHTML(element) {
    _classCallCheck(this, InnerHTML);

    this.element = element;
    this.sanitizer = InnerHTML.defaultSanitizer;
  }

  _prototypeProperties(InnerHTML, {
    metadata: {
      value: function metadata() {
        return Behavior.attachedBehavior("inner-html").withOptions().and(function (x) {
          x.withProperty("value", "valueChanged");
          x.withProperty("sanitizer");
        });
      },
      writable: true,
      configurable: true
    },
    defaultSanitizer: {
      value: function defaultSanitizer(text) {
        var SCRIPT_REGEX = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;

        while (SCRIPT_REGEX.test(text)) {
          text = text.replace(SCRIPT_REGEX, "");
        }

        return text;
      },
      writable: true,
      configurable: true
    },
    inject: {
      value: function inject() {
        return [Element];
      },
      writable: true,
      configurable: true
    }
  }, {
    bind: {
      value: function bind() {
        this.setElementInnerHTML(this.value);
      },
      writable: true,
      configurable: true
    },
    valueChanged: {
      value: function valueChanged(newValue) {
        this.setElementInnerHTML(newValue);
      },
      writable: true,
      configurable: true
    },
    setElementInnerHTML: {
      value: function setElementInnerHTML(text) {
        text = this.sanitizer(text);
        this.element.innerHTML = text;
      },
      writable: true,
      configurable: true
    }
  });

  return InnerHTML;
})();

Object.defineProperty(exports, "__esModule", {
  value: true
});