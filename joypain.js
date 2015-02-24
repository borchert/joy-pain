//to add drawing toolbar///
 var map, toolbar, symbol, geomTask;

 
require(["esri/map", 
	"esri/toolbars/draw",
    "esri/symbols/SimpleMarkerSymbol",
	"esri/symbols/SimpleLineSymbol",
	"esri/symbols/PictureFillSymbol", 
	"esri/symbols/CartographicLineSymbol", 
    "esri/graphic", 
    "esri/Color", 
	"dojo/dom", 
	"dojo/on", 
	"dojo/domReady!"],
	
	function(
        Map, Draw, Graphic,
        SimpleMarkerSymbol, SimpleLineSymbol, SimpleFillSymbol,
        parser, registry
      ) {
        parser.parse();

        map.on("load", createToolbar);

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
          var tool = this.label.toUpperCase().replace(/ /g, "_");
          toolbar.activate(Draw[tool]);
          map.hideZoomSlider();
        }

        function createToolbar(themap) {
          toolbar = new Draw(map);
          toolbar.on("draw-end", addToMap);
        }

        function addToMap(evt) {
          var symbol;
          toolbar.deactivate();
          map.showZoomSlider();
          switch (evt.geometry.type) {
            case "point":
            case "multipoint":
              symbol = new SimpleMarkerSymbol();
              break;
            case "polyline":
              symbol = new SimpleLineSymbol();
              break;
            default:
              symbol = new SimpleFillSymbol();
              break;
          }
          var graphic = new Graphic(evt.geometry, symbol);
          map.graphics.add(graphic);
        }
		
	 {var map = new Map ();
	var toolbar = new Draw(map);
	});
