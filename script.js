  var map, joy_toolbar, pain_toolbar, symbol, geomTask, drawing, graphics_from_storage;

  require([

    "esri/map", 
    "esri/layers/WebTiledLayer",
    "esri/toolbars/draw",
    "esri/toolbars/edit",
    "esri/graphic",
    "esri/symbols/SimpleMarkerSymbol",
    "esri/symbols/SimpleLineSymbol",
    "esri/symbols/SimpleFillSymbol",
    "esri/dijit/LocateButton",
    "dojo/parser", 
    "dijit/registry",
    "dijit/layout/BorderContainer", 
    "dijit/layout/ContentPane", 
    "dijit/form/ToggleButton",
    "dijit/form/Button", 
    "dijit/WidgetSet", 
    "dojo/domReady!"

  ], function(
    Map,
    WebTiledLayer,
    Draw,
    Edit, 
    Graphic, 
    SimpleMarkerSymbol, 
    SimpleLineSymbol, 
    SimpleFillSymbol,
    LocateButton,
    parser, 
    registry

  ) {

parser.parse();

var pencilMapUrl = "http://${subDomain}.tiles.mapbox.com/v4/mmcfarlane83.lm01cdj5/${level}/${col}/${row}.png?access_token=pk.eyJ1IjoianRyZWlua2UiLCJhIjoiaHF3VDZDMCJ9.vcDB3i-OmaAFJvOfpD6M_Q";
var pencilMap = new WebTiledLayer(pencilMapUrl, {subDomains:["a","b","c","d"]});
//var pencilMap = new WebTiledLayer("https://api.tiles.mapbox.com/v4/mmcfarlane83.lm01cdj5/${level}/${col}/${row}.png?access_token=pk.eyJ1IjoibW1jZmFybGFuZTgzIiwiYSI6InNQb1ZRQ0UifQ.WkcsZoP_C7A9i1FK7ScKUg#15/44.9683/-93.2567")//

map = new Map("map", {
  center: [-93.17, 44.96],
  zoom: 12
})

geoLocate = new LocateButton({
  map: map
  }, "LocateButton");
geoLocate.startup();

map.on("load", createToolbars);
map.addLayer(pencilMap);

if (!window.sessionStorage.getItem("joy-pain-stored")){
    window.sessionStorage.setItem("joy-pain-stored", "[]");
}

else {
     graphics_from_storage = JSON.parse(window.sessionStorage.getItem("joy-pain-stored"));

    for (i=0; i< graphics_from_storage.length; i++){
        map.graphics.add(new Graphic(graphics_from_storage[i]));
    }
}
   
    
    


// loop through all dijits, connect onClick event
// listeners for buttons to activate drawing tools
registry.forEach(function(d) {
  // d is a reference to a dijit
  // could be a layout container or a button
  if ( d.declaredClass === "dijit.form.Button" ) {
    d.on("click", activateTool);
  }
});

function activateTool() {
  var tool = this.get("data-tool-name");
  var joy_pain_toggle_state = registry.byId("joy-pain-toggle").checked;
 
//trial switch statement
switch(joy_pain_toggle_state) {
case true:
joy_toolbar.activate(Draw[tool]);
break;
case false:
pain_toolbar.activate(Draw[tool]);
break;
}  
  map.hideZoomSlider();
}


function createEventListeners(){

   var edit_listener = map.graphics.on("click", function(e){
      if (!drawing) {
        edit_toolbar.activate(Edit.MOVE | Edit.SCALE | Edit.ROTATE, e.graphic);
      }
  });

  joy_toolbar.on("activate", function(e){
    console.log("joy: draw starting");
    drawing = true;
  });
  pain_toolbar.on("activate", function(e){
    console.log("pain: draw starting");
    drawing = true;
  });

  joy_toolbar.on("draw-end", function(e){
    console.log("joy: done drawing");
    drawing = false;
    addToMap(e,"joy");
  });
  pain_toolbar.on("draw-end", function(e){
    console.log("pain: done drawing");
    drawing = false;
    addToMap(e,"pain")
  });

}

function createToolbars() {
 
  joy_toolbar = new Draw(map);
  pain_toolbar = new Draw(map);
  edit_toolbar = new Edit(map);
  
  createEventListeners();
 
}

function addToMap(evt,joy_or_pain) {
  var symbol;

  if (joy_or_pain === "joy"){
    joy_toolbar.deactivate();
  }
  else {
    pain_toolbar.deactivate();
  }
  
  map.showZoomSlider();

  switch (evt.geometry.type) {
    
    case "polyline":

      if (joy_or_pain ==="joy"){
        symbol = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SHORTDOT,
          new esri.Color([177,137,4]), 3);
      } 

      else {
        symbol = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SHORTDOT,
          new esri.Color([0,0,0]), 3);
      }
      break;

    default:
      if (joy_or_pain ==="joy"){
        symbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID,
			    new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SHORTDOT,
				  new esri.Color([177,137,4]), 2),
				  new esri.Color([177,137,4,0.25]));
      } 

      else {
        symbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID,
          new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SHORTDOT,
          new esri.Color([0,0,0]), 2),
          new esri.Color([0,0,0,0.25]));
      }
      break;
  }
  var graphic = new Graphic(evt.geometry, symbol);

  map.graphics.add(graphic);
  var number_graphics = map.graphics.graphics.length;
  var graphics_json = JSON.parse(window.sessionStorage.getItem("joy-pain-stored"));
  graphics_json.push(graphic.toJson());
  
  window.sessionStorage.setItem("joy-pain-stored",JSON.stringify(graphics_json));
}


});
