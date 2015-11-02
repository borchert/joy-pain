var map, joy_toolbar, pain_toolbar, drawing, showDeleteButton,
  hideDeleteButton, deleteGraphic, toggleJoyPain, maxExtent,
  lineLayer, polygonLayer, joyFillColor, painFillColor,
  joyLineColor, painLineColor, drawingColor, polygonJoySymbol, polygonPainSymbol,
  lineJoySymbol, linePainSymbol, addStory, storyFeature;

  require([
    "customInfowindow/InfoWindow",
    "esri/Color",
    "esri/tasks/query",
    "esri/map",
    "esri/layers/FeatureLayer",
    "esri/layers/WebTiledLayer",
    "esri/renderers/UniqueValueRenderer",
    "esri/toolbars/draw",
    "esri/toolbars/edit",
    "esri/graphic",
    "esri/geometry/Extent",
    "esri/InfoTemplate",
    "dijit/form/Textarea",
    "esri/symbols/SimpleMarkerSymbol",
    "esri/symbols/SimpleLineSymbol",
    "esri/symbols/SimpleFillSymbol",
    "esri/dijit/LocateButton",
    "esri/tasks/query",
    "esri/tasks/QueryTask",
    //"esri/tasks/FeatureSet",
    "dojo/parser",
    "dijit/registry",
    "dojo/dom-class",
    "dojo/on",
    "dojo/dom",
    "dojo/dom-style",
    "dojo/dom-construct",
    "dijit/layout/BorderContainer",
    "dijit/layout/ContentPane",
    "dijit/form/ToggleButton",
    "dijit/form/Button",
    "dijit/WidgetSet",
    "dojo/domReady!"

    ], function(
        InfoWindow,
        Color,
        Query,
        Map,
        FeatureLayer,
        WebTiledLayer,
        UniqueValueRenderer,
        Draw,
        Edit,
        Graphic,
        Extent,
        InfoTemplate,
        Textarea,
        SimpleMarkerSymbol,
        SimpleLineSymbol,
        SimpleFillSymbol,
        LocateButton,
        Query,
        QueryTask,
        //FeatureSet,
        parser,
        registry,
        domClass,
        on,
        dom,
        domStyle,
        domConstruct
        ) {

        parser.parse();
		
		joy_toggle_state = true;
		$('#joy-pain-toggle-joy_label').addClass("joy-button-active");
		$('#joy-pain-toggle-pain_label').addClass("joy-pain-button-inactive");

        var featureUrl = "http://services.arcgis.com/8df8p0NlLFEShl0r/ArcGIS/rest/services/Joy_Pain_Service/FeatureServer/";
        var basemapUrl = "http://${subDomain}.tiles.mapbox.com/v4/mmcfarlane83.lm01cdj5/${level}/${col}/${row}.png?" +
            "access_token=pk.eyJ1IjoianRyZWlua2UiLCJhIjoiaHF3VDZDMCJ9.vcDB3i-OmaAFJvOfpD6M_Q";

        var basemap = new WebTiledLayer(basemapUrl, {subDomains:["a","b","c","d"]});

        var infoWindow = new InfoWindow({domNode: domConstruct.create("div", null, dom.byId("infoWindowStyle"))});

        //infoWindow.startup();

        map = new Map("map", {
            center: [-93.17, 44.96],
            zoom: 12,
            infoWindow: infoWindow,
            minZoom:12
        });

        var maxExtentParams = {
            "xmin":-10398523.528548198,
            "ymin":5603665.400915724,
            "xmax":-10354071.866091402,
            "ymax":5629615.772018506,
            "spatialReference":{"wkid":102100}
        };
        maxExtent = Extent(maxExtentParams);


        var geoLocate = new LocateButton({
            map: map
        }, "LocateButton");
        geoLocate.startup();


        var infoTemplateContent = function(graphic){
            storyFeature = graphic;
            if (graphic.attributes.Your_Story && graphic.attributes.Your_Story.length > 0){
                return "<span id='storyDisplay' class=\"infoTemplateContentRowItem\">"+
                    graphic.attributes.Your_Story +
                    "</span>";
            }
            else {
                return "<textarea id='story-text'></textarea><br/>";
            }
        };
        
        var infoTemplateTitle = function(graphic) {
            var epochDate = new Date(graphic.attributes.Date);
            var localtimeDate = epochDate.toLocaleDateString();
            if (graphic.attributes.Your_Story && graphic.attributes.Your_Story.length > 0){
                return "Shared on: " + localtimeDate;
            }
            else {
                return "Share your story: ";
            }
        };
        var featureLayerInfoTemplate = new InfoTemplate(infoTemplateTitle, infoTemplateContent);

        addStory = function (feature) {
            var story_text = dom.byId("story-text").value;

            if (story_text.length > 1000){
                alert("Exceeded maximum length, please shorten by at least " +
                    story_text.length - 1000 +
                    " characters.");
                return;
            }

            var layer = feature.getLayer();
            var attributes = feature.attributes;
            attributes.Your_Story = story_text;
            layer.applyEdits(null,[feature],null);
            map.infoWindow.hide();
            edit_toolbar.deactivate();

        };



        var createFeatureLayers = function(){
            joyFillColor = new Color([177, 137, 4, 0.35]);
            joyLineColor = new Color([177, 137, 4, 0.55]);
            painFillColor = new Color([0, 0, 0, 0.3]);
            painLineColor = new Color([0, 0, 0, 0.5]);
            drawingColor = new Color([0,65,106]);

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
                3.5
                );

            linePainSymbol = new SimpleLineSymbol(
                SimpleLineSymbol.STYLE_SHORTDOT,
                painLineColor,
                3.5
                );

            var polygonRenderer = new UniqueValueRenderer(null, "Joy_Pain");
            polygonRenderer.addValue("Joy", polygonJoySymbol);
            polygonRenderer.addValue("Pain", polygonPainSymbol);

            var lineRenderer = new UniqueValueRenderer(null, "Joy_Pain");
            lineRenderer.addValue("Joy", lineJoySymbol);
            lineRenderer.addValue("Pain", linePainSymbol);

            lineLayer = new FeatureLayer(featureUrl + "0",
            {
                infoTemplate: featureLayerInfoTemplate,
                 outFields: ["*"]
            });
            lineLayer.setRenderer(lineRenderer);

            polygonLayer = new FeatureLayer(featureUrl + "1",
            {
                infoTemplate: featureLayerInfoTemplate,
                 outFields: ["*"]
            });
            polygonLayer.setRenderer(polygonRenderer);
            map.addLayers([lineLayer, polygonLayer]);

        };

        map.on("load", function(){
            createFeatureLayers();
            createToolbars();
        });

        map.addLayer(basemap);

        registry.forEach(function(d) {
          if (d.declaredClass === "dijit.form.Button" && d.attr("data-tool-name")) {
              d.on("click", activateTool);
        }
    });

        function activateTool() {

            var tool = this.get("data-tool-name");

            if (!tool){
                return;
            }
			
            if (joy_toggle_state === true){
                pain_toolbar.deactivate();
                joy_toolbar.activate(Draw[tool]);
            }
            
            else if (pain_toggle_state === true){
                joy_toolbar.deactivate();
                pain_toolbar.activate(Draw[tool]);
            }

            map.hideZoomSlider();
        }

        showDeleteButton = function(){
            var b = registry.byId("delete-sketch-button").domNode;
            domStyle.set(b, "visibility", "visible");
        };


        hideDeleteButton = function(){
            var b = registry.byId("delete-sketch-button").domNode;
            domStyle.set(b, "visibility", "hidden");
        };


        deleteGraphic = function(){
            var graphic = edit_toolbar.getCurrentState().graphic;
            var layer = graphic.getLayer();
            layer.applyEdits(null,null,[graphic]);
            edit_toolbar.deactivate();
            hideDeleteButton();
            map.infoWindow.hide();
        };


		toggleJoyPain = function(joy_or_pain){
			
			if (joy_or_pain === "joy"){
				joy_toggle_state = true;
				pain_toggle_state = false;
				domClass.add('joy-pain-toggle-joy_label','joy-button-active');
				domClass.remove('joy-pain-toggle-joy_label','joy-pain-button-inactive');
				domClass.remove('joy-pain-toggle-pain_label','pain-button-active');
				domClass.add('joy-pain-toggle-pain_label','joy-pain-button-inactive');
			}
			else {
				pain_toggle_state = true;
				joy_toggle_state = false;
				domClass.add('joy-pain-toggle-pain_label','pain-button-active');
				domClass.remove('joy-pain-toggle-pain_label','joy-pain-button-inactive');
				domClass.remove('joy-pain-toggle-joy_label','joy-button-active');
				domClass.add('joy-pain-toggle-joy_label','joy-pain-button-inactive');
			}
			
			
		};


        function createEventListeners(){

            var activateEditing = function(e){
                if (!drawing) {
                    edit_toolbar.activate(Edit.MOVE | Edit.SCALE | Edit.ROTATE, e.graphic);
                    showDeleteButton();
                }
            };

            lineLayer.on("click", activateEditing);
            polygonLayer.on("click", activateEditing);

            var queryFeatureOverlap = function(e){

                var executeQueryTask = function(e){
                    var queryTask = new QueryTask(featureUrl + "1");
                    var query = new Query();
                    query.returnGeometry = true;
                    query.spatialRelationship = Query.SPATIAL_REL_INTERSECTS;
                    query.outFields = ["Date_", "Joy_Pain"];
                    query.geometry = e.mapPoint;
                    queryTask.execute(query, function(results){

                        var resultFeatures = results.features;
                        console.log(resultFeatures.length + " features live here!");
                        for (var i=0; i < resultFeatures.length; i++) {
                            var graphic = resultFeatures[i];
                            console.log(graphic.attributes);
                        }
                    });
                   //console.log(query.geometry);
                    //var infoTemplateQ = new InfoTemplate("${Date_}", "Date : ${Date_}<br/> Emotion : ${Joy_Pain}");
                }
                /*var showQueryResults = function(featureSet) {
                    map.graphics.clear();
                    var resultFeatures = featureSet.features;
                    console.log("Let's do this!");
                    console.log("Returned features : " + featureSet);*/
                   /* for (var i=0, il=resultFeatures.length; i<il; i++) {
                        var graphic = resultFeatures[i];
                        graphic.setSymbol(symbol);
                        graphic.setInfoTemplate(infoTemplate);
                        map.graphics.add(graphic);
                    }*/
                //}
                executeQueryTask(e);
            }

            polygonLayer.on("click", queryFeatureOverlap);
            


            map.on("click", function(e){
                if (!e.graphic){
                    edit_toolbar.deactivate();
                    hideDeleteButton();
                    map.infoWindow.hide();
                }
            });

            map.on("extent-change", function(e){

                if(!maxExtent.contains(e.extent.getCenter()) ){
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



            joy_toolbar.on("activate", function(e){
                console.log("joy: draw starting");
                drawing = true;
                storyFeature = null;
                edit_toolbar.deactivate();
				var lineSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new esri.Color([0,65,106]),2);
				var fillSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, lineSymbol, new esri.Color([0,65,106,0.5]));
				joy_toolbar.setLineSymbol(lineSymbol);
				joy_toolbar.setFillSymbol(fillSymbol);
            });

            pain_toolbar.on("activate", function(e){
                console.log("pain: draw starting");
                drawing = true;
                storyFeature = null;
                edit_toolbar.deactivate();
				var lineSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new esri.Color([0,65,106]),2);
				var fillSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, lineSymbol, new esri.Color([0,65,106,0.5]));
				pain_toolbar.setLineSymbol(lineSymbol);
				pain_toolbar.setFillSymbol(fillSymbol);
            });

            joy_toolbar.on("draw-end", function(e){
                console.log("joy: done drawing");
                drawing = false;
                addToMap(e,"joy");
            });
            pain_toolbar.on("draw-end", function(e){
                console.log("pain: done drawing");
                drawing = false;
                addToMap(e,"pain");
            });

        }

        function createToolbars() {

            joy_toolbar = new Draw(map);
            pain_toolbar = new Draw(map);
            edit_toolbar = new Edit(map);

            //change color of drawing in progress from red to indigo
            var line_symbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([0,65,106]),5);
            var fill_symbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, line_symbol, new Color([0,65,106,0.5]));
            joy_toolbar.setLineSymbol(line_symbol);
            joy_toolbar.setFillSymbol(fill_symbol);
            pain_toolbar.setLineSymbol(line_symbol);
            pain_toolbar.setFillSymbol(fill_symbol);

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

        storyFeature = graphic;
        map.infoWindow.setContent("<textarea id='story-text'></textarea><br/>");
        map.infoWindow.setTitle("Share your story:")
        map.infoWindow.show();

    }

});