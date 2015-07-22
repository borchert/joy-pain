  var map, joy_toolbar, pain_toolbar, drawing, showDeleteButton, 
  hideDeleteButton, deleteGraphic, toggleJoyPain, maxExtent,
  lineLayer, polygonLayer, joyFillColor, painFillColor,
  joyLineColor, painLineColor, polygonJoySymbol, polygonPainSymbol,
  lineJoySymbol, linePainSymbol, addStory, storyFeature;

  require([
    "esri/tasks/query",
	"dojo/dom",
    "esri/map", 
    "esri/layers/FeatureLayer",
    "esri/layers/WebTiledLayer",
    "esri/renderers/UniqueValueRenderer",
    "esri/toolbars/draw",
    "esri/toolbars/edit",
    "esri/graphic",
    "esri/geometry/Extent",
	"esri/dijit/InfoWindow",
<<<<<<< HEAD
	"esri/dijit/InfoWindowLite",
	"esri/InfoTemplate",
	"dijit/form/Textarea",
=======
	"esri/InfoTemplate",
>>>>>>> origin/master
    "esri/symbols/SimpleMarkerSymbol",
    "esri/symbols/SimpleLineSymbol",
    "esri/symbols/SimpleFillSymbol",
    "esri/dijit/LocateButton",
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
		Query,
		dom,
        Map,
        FeatureLayer,
        WebTiledLayer,
        UniqueValueRenderer,
        Draw,
        Edit, 
        Graphic, 
        Extent,
		InfoWindow,
<<<<<<< HEAD
		InfoWindowLite,
		InfoTemplate,
		Textarea,
=======
		InfoTemplate,
>>>>>>> origin/master
        SimpleMarkerSymbol, 
        SimpleLineSymbol, 
        SimpleFillSymbol,
        LocateButton,
        parser, 
        registry,
		domClass,
        on,
        dom,
        domStyle,
		domConstruct
        ) {

        parser.parse();

        var featureUrl = "http://services.arcgis.com/8df8p0NlLFEShl0r/ArcGIS/rest/services/Joy_Pain_Service/FeatureServer/"
        var pencilMapUrl = "http://${subDomain}.tiles.mapbox.com/v4/mmcfarlane83.lm01cdj5/${level}/${col}/${row}.png?" +
        "access_token=pk.eyJ1IjoianRyZWlua2UiLCJhIjoiaHF3VDZDMCJ9.vcDB3i-OmaAFJvOfpD6M_Q";
        var pencilMap = new WebTiledLayer(pencilMapUrl, {subDomains:["a","b","c","d"]});
		
<<<<<<< HEAD
		polygonLayer = new FeatureLayer(featureUrl + "1",
		{id: "polygonLayer"}
		);
		lineLayer = new FeatureLayer(featureUrl + "0",
		{id: "lineLayer"}
		);
		
		var infoWindow = new InfoWindow({domNode: domConstruct.create("div", null, dom.byId("infoWindowStyle"))});
		//domClass.add(infoWindow.domNode, "red");
=======
		var infoWindow = new InfoWindow({}, domConstruct.create("div"));
>>>>>>> origin/master
		infoWindow.startup();
		
        map = new Map("map", {
          center: [-93.17, 44.96],
          zoom: 12,
<<<<<<< HEAD
		  infoWindow: infoWindow
=======
<<<<<<< HEAD
		  infoWindow: infoWindow
=======
		  //infoWindow: infoWindow
>>>>>>> origin/master
>>>>>>> origin/master
      });

        var maxExtentParams = {
            "xmin":-10398523.528548198,
            "ymin":5603665.400915724,
            "xmax":-10354071.866091402,
            "ymax":5629615.772018506,
            "spatialReference":{"wkid":102100}
        };
        maxExtent = Extent(maxExtentParams);


        geoLocate = new LocateButton({
          map: map
      }, "LocateButton");
        geoLocate.startup();
		
<<<<<<< HEAD
		
=======
>>>>>>> origin/master
		// Symbology for selected feature when infowindow opens
        /* var slsHighlightSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([38, 38, 38, 0.7]), 2);
        var sms = new SimpleMarkerSymbol();
        sms.setPath("M21.5,21.5h-18v-18h18V21.5z M12.5,3V0 M12.5,25v-3 M25,12.5h-3M3,12.5H0");
        sms.setSize(45);
        sms.setOutline(slsHighlightSymbol);
        var infoWindow = new InfoWindow({markerSymbol: sms}, domConstruct.create("div"));		 */
		
<<<<<<< HEAD
		// InfoTemplate for feature layer
		var featureLayerInfoTemplate = new InfoTemplate();

		var infoTemplateContent = function(graphic){
			storyFeature = graphic;
			var story = graphic.attributes.Your_Story !== null ? graphic.attributes.Your_Story : "";
			return "<span id='storyDisplay' class=\"infoTemplateContentRowItem\">"+ 
                 story + 
            "</span><br/><textarea id='story-text'></textarea><br/>"+
			"<button onclick='addStory(storyFeature);' id='story-button' type= 'button'>\Submit\</button>";
		}
		
		addStory = function (feature) {
			var story_text = dom.byId("story-text").value;
			if (story_text.length > 1000){
				alert("Too long!");
				return;
			}
			var layer = feature.getLayer();
			var attributes = feature.attributes;
			attributes.Your_Story = story_text;
			layer.applyEdits(null,[feature],null);
			dom.byId("storyDisplay").innerHTML = story_text;
			
		};
		
		featureLayerInfoTemplate.setContent(infoTemplateContent);
		featureLayerInfoTemplate.setTitle("Your Story:");
		
=======
<<<<<<< HEAD
		// InfoTemplate for feature layer
		var featureLayerInfoTemplate = new InfoTemplate();
		var infoTemplateContent = 
            "<span class=\"infoTemplateContentRowItem\">"+ 
                "${Your_Story}"+
            "</span><br>";
        featureLayerInfoTemplate.setContent(infoTemplateContent);
		featureLayerInfoTemplate.setTitle("Your Story:");
		
=======
		// Dictionary objects to provide domain value lookup for fields in popups
		var joypainFieldDomainCodedValuesDict = {};
		
		/* // InfoTemplate for feature layer
		var featureLayerInfoTemplate = new InfoTemplate();
		var infoTemplateContent = 
            "<span class=\"infoTemplateContentRowItem\">"+ 
                "${Your_Story:requestJoyPainDomainLookup}"+
            "</span><br>";
        featureLayerInfoTemplate.setContent(infoTemplateContent); */
		
		// Formatting functions for infoTemplate
        requestJoyPainDomainLookup = function (value, key, data){
            return joypainFieldDomainCodedValuesDict[value];
        };	

>>>>>>> origin/master
>>>>>>> origin/master
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
                2
                );

            linePainSymbol = new SimpleLineSymbol(
                SimpleLineSymbol.STYLE_SHORTDOT,
                painLineColor,
                2
                );

            var polygonRenderer = new UniqueValueRenderer(null, "Joy_Pain");
            polygonRenderer.addValue("Joy", polygonJoySymbol);
            polygonRenderer.addValue("Pain", polygonPainSymbol);

            var lineRenderer = new UniqueValueRenderer(null, "Joy_Pain");
            lineRenderer.addValue("Joy", lineJoySymbol);
            lineRenderer.addValue("Pain", linePainSymbol);

<<<<<<< HEAD
            lineLayer = new FeatureLayer(featureUrl + "0", 
			{id: "lineLayer",infoTemplate: featureLayerInfoTemplate,
			outFields: ["*"],
			}); 
            lineLayer.setRenderer(lineRenderer);
            polygonLayer = new FeatureLayer(featureUrl + "1", 
			{id: "polygonLayer",infoTemplate: featureLayerInfoTemplate,
			outFields: ["*"],
			}); 
=======
<<<<<<< HEAD
            lineLayer = new FeatureLayer(featureUrl + "0", 
			{infoTemplate: featureLayerInfoTemplate,
			outFields: ["*"],
			}); 
            lineLayer.setRenderer(lineRenderer);
            polygonLayer = new FeatureLayer(featureUrl + "1", 
			{infoTemplate: featureLayerInfoTemplate,
			outFields: ["*"],
			}); 
=======
            lineLayer = new FeatureLayer(featureUrl + "0"); //add {infoTemplate: featureLayerInfoTemplate}
            lineLayer.setRenderer(lineRenderer);
            polygonLayer = new FeatureLayer(featureUrl + "1"); //add {infoTemplate: featureLayerInfoTemplate}
>>>>>>> origin/master
>>>>>>> origin/master
            polygonLayer.setRenderer(polygonRenderer);
            map.addLayers([lineLayer, polygonLayer]);

        };

        map.on("load", function(){
            createFeatureLayers();
            createToolbars(); 
          

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

            if (joy_pain_toggle_state === true){
				pain_toolbar.deactivate();
                joy_toolbar.activate(Draw[tool]);
            }
            else {
				joy_toolbar.deactivate();
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
                //if (!e.graphic && edit_toolbar.getCurrentState().graphic){
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
