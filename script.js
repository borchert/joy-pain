  var map, joy_toolbar, pain_toolbar, symbol, geomTask, drawing, editing,
  graphics_from_storage, showDeleteButton, hideDeleteButton, 
  deleteGraphic, toggleJoyPain, updateSessionStorage, maxExtent,
  lineLayer, polygonLayer, joyFillColor, painFillColor,
  joyLineColor, painLineColor, polygonJoySymbol, polygonPainSymbol,
  lineJoySymbol, linePainSymbol;

  require([

    "esri/map", 
    "esri/layers/FeatureLayer",
    "esri/layers/WebTiledLayer",
    "esri/renderers/UniqueValueRenderer",
    "esri/toolbars/draw",
    "esri/toolbars/edit",
    "esri/graphic",
    "esri/geometry/Extent",
    "esri/symbols/SimpleMarkerSymbol",
    "esri/symbols/SimpleLineSymbol",
    "esri/symbols/SimpleFillSymbol",
    "esri/dijit/LocateButton",
    "dojo/parser", 
    "dijit/registry",
    "dojo/on",
    "dojo/dom",
    "dojo/dom-style",
    "dijit/layout/BorderContainer", 
    "dijit/layout/ContentPane", 
    "dijit/form/ToggleButton",
    "dijit/form/Button", 
    "dijit/WidgetSet",
    "dojo/domReady!"

    ], function(
        Map,
        FeatureLayer,
        WebTiledLayer,
        UniqueValueRenderer,
        Draw,
        Edit, 
        Graphic, 
        Extent,
        SimpleMarkerSymbol, 
        SimpleLineSymbol, 
        SimpleFillSymbol,
        LocateButton,
        parser, 
        registry,
        on,
        dom,
        domStyle
        ) {

        parser.parse();

        var featureUrl = "http://services.arcgis.com/8df8p0NlLFEShl0r/ArcGIS/rest/services/Joy_Pain_Service/FeatureServer/"
        var pencilMapUrl = "http://${subDomain}.tiles.mapbox.com/v4/mmcfarlane83.lm01cdj5/${level}/${col}/${row}.png?" +
        "access_token=pk.eyJ1IjoianRyZWlua2UiLCJhIjoiaHF3VDZDMCJ9.vcDB3i-OmaAFJvOfpD6M_Q";
        var pencilMap = new WebTiledLayer(pencilMapUrl, {subDomains:["a","b","c","d"]});

        map = new Map("map", {
          center: [-93.17, 44.96],
          zoom: 12
      });

        var maxExtentParams = {
            "xmin":-10395523.528548198,
            "ymin":5603665.400915724,
            "xmax":-10344157.84554063,
            "ymax":5629615.772018506,
            "spatialReference":{"wkid":102100}
        };
        maxExtent = Extent(maxExtentParams);

        geoLocate = new LocateButton({
          map: map
      }, "LocateButton");
        geoLocate.startup();

        var createFeatureLayers = function(){
            joyFillColor = new esri.Color([177, 137, 4, 0.25]);
            joyLineColor = new esri.Color([177, 137, 4, 0.5]);
            painFillColor = new esri.Color([0, 0, 0, 0.3]);
            painLineColor = new esri.Color([0, 0, 0, 0.5]);

            polygonJoySymbol = new SimpleFillSymbol(
                SimpleFillSymbol.STYLE_SOLID,
                new SimpleLineSymbol(
                    SimpleLineSymbol.STYLE_SHORTDOT,
                    joyLineColor,
                    2
                    ),
                joyFillColor
                );
            polygonPainSymbol = new SimpleFillSymbol(
                SimpleFillSymbol.STYLE_SOLID,
                new SimpleLineSymbol(
                    SimpleLineSymbol.STYLE_SHORTDOT,
                    painLineColor,
                    2
                    ),
                painFillColor
                );

            lineJoySymbol = new SimpleLineSymbol(
                SimpleLineSymbol.STYLE_SHORTDOT,
                joyLineColor,
                3
                );

            linePainSymbol = new SimpleLineSymbol(
                SimpleLineSymbol.STYLE_SHORTDOT,
                painLineColor,
                3
                );


            var polygonRenderer = new UniqueValueRenderer(null, "Joy_Pain");
            polygonRenderer.addValue("Joy", polygonJoySymbol);
            polygonRenderer.addValue("Pain", polygonPainSymbol);

            var lineRenderer = new UniqueValueRenderer(null, "Joy_Pain");
            lineRenderer.addValue("Joy", lineJoySymbol);
            lineRenderer.addValue("Pain", linePainSymbol);

            lineLayer = new FeatureLayer(featureUrl + "0");
            lineLayer.setRenderer(lineRenderer);
            polygonLayer = new FeatureLayer(featureUrl + "1");
            polygonLayer.setRenderer(polygonRenderer);
            map.addLayers([lineLayer, polygonLayer]);

        };

        map.on("load", function(){
            createFeatureLayers();
            createToolbars(); 
            maxExtent = map.extent;

        });

        map.addLayer(pencilMap);

        registry.forEach(function(d) {
          if (d.declaredClass === "dijit.form.Button") {
            d.on("click", activateTool);
        }
    });

        function activateTool() {

            var tool = this.get("data-tool-name");
            if (!tool){
                console.log("bailin'");
                return;
            }

            var joy_pain_toggle_state = registry.byId("joy-pain-toggle").checked;

            if (joy_pain_toggle_state){
                joy_toolbar.activate(Draw[tool]);
            }
            else {
                pain_toolbar.activate(Draw[tool]);
            }

            map.hideZoomSlider();
        }

        showDeleteButton = function(){
            var b = registry.byId("delete-sketch-button").domNode;
            domStyle.set(b, "visibility", "visible");
        }

        hideDeleteButton = function(){
            var b = registry.byId("delete-sketch-button").domNode;
            domStyle.set(b, "visibility", "hidden");
        }

        deleteGraphic = function(){
            var graphic = edit_toolbar.getCurrentState().graphic;
            var layer = graphic.getLayer();
            layer.applyEdits(null,null,[graphic]);
            edit_toolbar.deactivate();
            hideDeleteButton();
        }

        toggleJoyPain = function(val, node){
            if (val === false){
                node.set('label','PAIN')
            } else {
                node.set('label', 'JOY')
            }
        } 

        function createEventListeners(){

            var activateEditing = function(e){
                if (!drawing) {
                    edit_toolbar.activate(Edit.MOVE | Edit.SCALE | Edit.ROTATE, e.graphic);
                    showDeleteButton();
                }
            }

            lineLayer.on("click", activateEditing);
            polygonLayer.on("click", activateEditing);

            map.on("click", function(e){
                if (!e.graphic && edit_toolbar.getCurrentState().graphic){
                    edit_toolbar.deactivate();
                }
            });

            map.on("extent-change", function(extent){
               if((map.extent.xmin < maxExtent.xmin) ||
                  (map.extent.ymin < maxExtent.ymin)  ||
                  (map.extent.xmax > maxExtent.xmax) ||
                  (map.extent.ymax > maxExtent.ymax) 
                  ) {
                  map.setExtent(maxExtent);
              console.log("max extent reached, rolling back to previous extent");
          }
      });


            edit_toolbar.on("graphic-move-stop, rotate-stop, scale-stop", function(e){
                var graphic = edit_toolbar.getCurrentState().graphic;
                var layer = graphic.getLayer();
                layer.applyEdits(null,[graphic],null);
                edit_toolbar.deactivate();
                hideDeleteButton();
            });

            var deleteKeyPress = map.on("key-down",function(e){
                if (edit_toolbar.getCurrentState().graphic === undefined){
                    return;
                }
                if (e.which === 8){
                    e.preventDefault();
                    e.stopPropagation();
                    deleteGraphic();
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
        var graphic;

        if (joy_or_pain === "joy"){
            joy_toolbar.deactivate();
        }
        else {
            pain_toolbar.deactivate();
        }

        map.showZoomSlider();

        if (evt.geometry.type == "polyline"){

            if (joy_or_pain === "joy"){
                graphic = new Graphic(evt.geometry, lineJoySymbol, {"Joy_Pain": "Joy"});
            }

            else {
                graphic = new Graphic(evt.geometry, linePainSymbol, {"Joy_Pain": "Pain"});
            }

            lineLayer.applyEdits([graphic]);
        }

        else {

            if (joy_or_pain === "joy"){
                graphic = new Graphic(evt.geometry, polygonJoySymbol, {"Joy_Pain": "Joy"});
            }

            else {
                graphic = new Graphic(evt.geometry, polygonPainSymbol, {"Joy_Pain": "Pain"});
            }

            polygonLayer.applyEdits([graphic]);
        }

    }

});
