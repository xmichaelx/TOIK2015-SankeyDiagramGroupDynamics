"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Container = require("aurelia-dependency-injection").Container;

var _aureliaTemplating = require("aurelia-templating");

var ViewSlot = _aureliaTemplating.ViewSlot;
var ViewStrategy = _aureliaTemplating.ViewStrategy;

var Router = require("aurelia-router").Router;

var _aureliaMetadata = require("aurelia-metadata");

var Metadata = _aureliaMetadata.Metadata;
var Origin = _aureliaMetadata.Origin;

var RouterView = exports.RouterView = (function () {
  function RouterView(element, container, viewSlot, router) {
    _classCallCheck(this, RouterView);

    this.element = element;
    this.container = container;
    this.viewSlot = viewSlot;
    this.router = router;
    router.registerViewPort(this, element.getAttribute("name"));
  }

  _prototypeProperties(RouterView, {
    metadata: {
      value: function metadata() {
        return Metadata.customElement("router-view").noView();
      },
      writable: true,
      configurable: true
    },
    inject: {
      value: function inject() {
        return [Element, Container, ViewSlot, Router];
      },
      writable: true,
      configurable: true
    }
  }, {
    process: {
      value: function process(viewPortInstruction, waitToSwap) {
        var _this = this;

        var component = viewPortInstruction.component,
            viewStrategy = component.view,
            viewModelInfo = component.viewModelInfo,
            childContainer = component.childContainer,
            viewModel = component.executionContext;

        if (!viewStrategy && "getViewStrategy" in viewModel) {
          viewStrategy = viewModel.getViewStrategy();
        }

        if (viewStrategy) {
          viewStrategy = ViewStrategy.normalize(viewStrategy);
          viewStrategy.makeRelativeTo(Origin.get(component.router.container.viewModel.constructor).moduleId);
        }

        return viewModelInfo.type.load(childContainer, viewModelInfo.value, viewStrategy).then(function (behaviorType) {
          viewPortInstruction.behavior = behaviorType.create(childContainer, { executionContext: viewModel, suppressBind: true });

          if (waitToSwap) {
            return;
          }

          _this.swap(viewPortInstruction);
        });
      },
      writable: true,
      configurable: true
    },
    swap: {
      value: function swap(viewPortInstruction) {
        viewPortInstruction.behavior.view.bind(viewPortInstruction.behavior.executionContext);
        this.viewSlot.swap(viewPortInstruction.behavior.view);

        if (this.view) {
          this.view.unbind();
        }

        this.view = viewPortInstruction.behavior.view;
      },
      writable: true,
      configurable: true
    }
  });

  return RouterView;
})();

Object.defineProperty(exports, "__esModule", {
  value: true
});