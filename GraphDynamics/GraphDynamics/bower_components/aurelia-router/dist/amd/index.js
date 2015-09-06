define(["exports", "./router", "./app-router", "./pipeline-provider", "./navigation-commands", "./route-loading", "./router-configuration", "./navigation-plan", "./route-filters"], function (exports, _router, _appRouter, _pipelineProvider, _navigationCommands, _routeLoading, _routerConfiguration, _navigationPlan, _routeFilters) {
  "use strict";

  exports.Router = _router.Router;
  exports.AppRouter = _appRouter.AppRouter;
  exports.PipelineProvider = _pipelineProvider.PipelineProvider;
  exports.Redirect = _navigationCommands.Redirect;
  exports.RouteLoader = _routeLoading.RouteLoader;
  exports.RouterConfiguration = _routerConfiguration.RouterConfiguration;
  exports.NO_CHANGE = _navigationPlan.NO_CHANGE;
  exports.INVOKE_LIFECYCLE = _navigationPlan.INVOKE_LIFECYCLE;
  exports.REPLACE = _navigationPlan.REPLACE;
  exports.RouteFilterContainer = _routeFilters.RouteFilterContainer;
  exports.createRouteFilterStep = _routeFilters.createRouteFilterStep;
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
});