# Goal

Visualisation of social network dynamics with aid of D3.js library based on Sankey Diagrams plugin (http://bost.ocks.org/mike/sankey/).

# Functional requirements

- loading data in file format produced by Cfinder
- calculating graph dynamics from community data
- (optional) exporting graph dynamics data from application
- displaying graph dynamics using Sankey Diagrams plugin
- selecting time of range displayed on the diagram
- zooming & panning diagram
- viewing community info on diagram as well as info about transitions (merges, splits, continuations)

# Input data format

Input data format is one generated by Cfinder. Cfinder uses algorithm called clicque percolation to find communities in existings graph. Cfinder run on a single graph produces a slew of directories and files. One directory for each possible value of k, which controls clicque size used in the algorithm. Each such folder contains many files, most important from point of view of the graph dynamics is the **communities** file. It contains communities found along with their members. Each such file has communities listed in the following format (one per each line, community_id going ascending from 0):

    <community_id>: <first_member_id> <second_member_id> ... <nth_member_id>

As the purpose of the project is to track graph dynamics in addition to different values of k parameters we will have different graphs for each period of time.

To begin analysis we need to:

1. Pick a clicque size k and copy its community files from each graph 
2. Rename those files to 0,1,2 and so forth according to their order in temporal domain
3. When loading files to application we select those files and upload them

# Sample data

Two sample datasets we're provided by tutor. One containing facebook data and the other with dblp coauthorship data. For testing purposes the latter was selected. The dblp computer science bibliography is the on-line reference for open bibliographic information on computer science journals and proceedings. From that communities of coauthors were extracted for k=9. Test data is available in sample data folder <TODO!>


# Graph dynamics

In order to analyze graph dynamics following measures from "An Event-Based Framework for Characterizing the Evolutionary Behavior of Interaction Graphs" ASUR, PARTHASARATHY, UCAR  were used:
- merge (parts of two communities merging together into a new community)
- split (community splitting and parts of it are present in two or more new communities)
- continuation (community has a continuation in next time step = identical community exists in next time step)

For precise definitions of used measures (and more measures) please check mentioned publication. Measures were parametrized with kappa value 0.5 (controlling the overlapping factor of the communities).

Graph dynamics algorithms were implemented in JavaScript and can be found in worker.js file. Since mentioned measures require a lot of computation they were done in separate worker threads in the browser (more in the technology stack).


# Intermediate data format

After computing graph dynamic properties, they are stored in an intermediate json format and available for download (through Export button).

Intermediate format is a list of following objects:

    {
        "start" : <time id>, 
        "end" : <time id, should be greater than start>
        // start and end determine between which two time periods there following data will be computed
        "cont" : { { "prev": <community_id>, "next": <community_id>}, (...), { "prev": <community_id>, "next": <community_id>}},
        "split" : {{ "prev": <community_id>, "next": <community_id>}, (...), { "prev": <community_id>, "next": <community_id>}},
        "merge" : {{ "prev": <community_id>, "next": <community_id>}, (...), { "prev": <community_id>, "next": <community_id>}}
    } 

Based on this format application computes sankey diagram.

# Visualisation

Using sankey diagrams to visualise graph dynamics was one of the main project requirements. Major improvement over the original example was introduction of slider allowing for selection of a portion of time range. Panning and zooming critical for diagram readability was also added. Unfortunately plugin provided to d3 wasn't designed for displaying large diagrams so a number of small changes was required to adopt it to given scenario.

Currently hover over diagram nodes shows properties of communities such as their size, time and id. Hovering over edges in sankey diagram show transition and transition type (which is also highlighted by the edge color).

# Technology stack

Visual Studio 2015 was used as IDE for the project as it has excelent TypeScript support. Application is written purely for web browser with no additional REST controllers required. Used browser technologies:

- LocalStorage - for persisting data between page refreshes
- FileApi - for loading files into the app and reading their contents browser-side
- WebWorkers - for fester computing graph dynamics in background threads without blocking UI
- Promises - for managing asynchronous code

Application was written mainly in TypeScript with minor parts done in pure JS. TypeScript allowed to organize and annotate code with type information. It also provided many improvements over JS syntax and integrated nicely with Aurelia.

Aurelia was the framework used to write the application. It is an alternative to well known Angular.js. Aurelia provides in default bundle:

- data-binding - binding created model to view using html markup, 
- dependency injection - Aurelia promotes modular application design, as such modules have their dependencies which are automatically injected by Aurelia, currently only supported injection pattern is constructor injection, by default (which may be confusing for people using other DI mechanisms) injection is done is singleton scope
- views lifecycle management - aurelia manages life cycle of views, their activation, attaching relavant html and destroing view once it's not used anymore

## Dependency injection in Aurelia 

Aurelia provides ability to inject dependencies via constructor DI and look like this:

    import {inject} from 'aurelia-framework';
    import {HttpClient} from 'aurelia-fetch-client';

    @inject(HttpClient)
        export class CustomerDetail{
        constructor(http){
            this.http = http;
        }
    }

Default scope is singleton, but adding `@transient()` attribute can change the scope so that new instance is created for every injection.

# Application architecture

Application is divided into two main views each realised as an component with its own lifecycle managed by Aurelia:

- computing
- visualisation

As the view names suggest they handle two stages of analysis of graph dynamics.

## Computing 

Computing takes care of  extracting graph dynamics data from a set of loaded files. After being loaded use can inspect basic properties of loaded community data. After inspection user can press Compute button and begin. Data is parsed from text files and piece of it is transfer to each webworker. When the job is finished option for visualisation of the data is activated. 

## Visualisation

Visualisation takes computed graph dynamics and transforms them into a graph than can be directly visualised by D3 and sankey diagrams plugin. Whole diagram is created at once. But only small portion of it is extracted and presented to the user. User can then adjust what portion of the graph is visible using range slider. 

## Architecture diagram


# Similar projects

A lot of popular environments (Gephi, Cytoscape) for analyzing graph data have some support for analyzing network group dynamics. Mostly they present snapshot of a graph at given timestamp with nodes belonging to the same group coloured using the same colour.

Sankey Diagram is an aggregated approach to this issue and it should yield a better visualisation or networks that aggregate well (relatively few groups at each timestamp) and exchange individuals in large batches (minimizing edge number between groups). Of course that assumption won't hold for all networks.


# Deployment

As application compiles to pure JS/HTML/CSS without any dependencies on backend services it can be be run locally or deployed as a website by copying files. Before deployment it is important to make sure that all TypeScripts files were compiled to JS files.


# Screenshots

![](https://raw.githubusercontent.com/xmichaelx/TOIK2015-SankeyDiagramGroupDynamics/master/docs/screen1.png)
![](https://raw.githubusercontent.com/xmichaelx/TOIK2015-SankeyDiagramGroupDynamics/master/docs/screen2.png)


