import aur = require("aurelia-router");

export class App {
  static inject = [aur.Router];

  constructor(private router: aur.Router) {
    this.router.configure((config) => {
      config.title = "Graph dynamics visualisation";
      config.map([
          { route: "visualisation",    moduleId: "views/visualisation",               nav: false,  title: "Visualisation" },
          { route: ["", "computing"],          moduleId: "views/computing",  nav: true,  title: "Computing" }
      ]);
    });
  }
}