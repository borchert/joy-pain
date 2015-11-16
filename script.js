var jp = {},
  joy_pain_map,
  joy_toolbar,
  pain_toolbar,
  drawing,
  showDeleteButton,
  hideDeleteButton,
  deleteGraphic,
  toggleJoyPain,
  maxExtent,
  lineLayer,
  polygonLayer,
  joyFillColor,
  painFillColor,
  joyLineColor,
  painLineColor,
  drawingColor,
  polygonJoySymbol,
  polygonPainSymbol,
  lineJoySymbol,
  linePainSymbol,
  addStory,
  storyFeature,
  nullInfoWindow,
  buildInfoWindow,
  showInfoWindow,
  feature_picker,
  queryFeatureOverlap,
  queried_feature_layer,
  highlight_symbol_line,
  highlight_symbol_polygon,
  activate_edit_toolbar,
  point_to_extent,
  get_features_from_click,
  after_open,
  preview_maps = {};

  require([
    "dojo/_base/array",
    "customInfowindow/InfoWindow",
    //"esri/basemaps",
    //"esri/dijit/BasemapLayer",
    //"esri/dijit/BasemapToggle",
    "esri/Color",
    "esri/tasks/query",    
    "esri/graphic",
    "esri/layers/GraphicsLayer",
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
        array,
        InfoWindow,
        //esriBasemaps,
        //BasemapLayer,
        //BasemapToggle,
        Color,
        Query,
        Graphic,
        GraphicsLayer,
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
		
        highlight_symbol_line = new SimpleLineSymbol(
            SimpleLineSymbol.STYLE_SOLID,
            new Color([255, 251, 108, 0.75]),
            7
        );

        highlight_symbol_polygon = new SimpleFillSymbol(
            SimpleFillSymbol.STYLE_SOLID,
            highlight_symbol_line,
            new Color([255, 251, 108, 0.6])
        );

		joy_toggle_state = true;
		$('#joy-pain-toggle-joy_label').addClass("joy-button-active");
		$('#joy-pain-toggle-pain_label').addClass("joy-pain-button-inactive");

        var featureUrl = "http://services.arcgis.com/8df8p0NlLFEShl0r/ArcGIS/rest/services/Joy_Pain_Service/FeatureServer/";
        var basemapUrl = "http://${subDomain}.tiles.mapbox.com/v4/mmcfarlane83.lm01cdj5/${level}/${col}/${row}.png?" +
            "access_token=pk.eyJ1IjoianRyZWlua2UiLCJhIjoiaHF3VDZDMCJ9.vcDB3i-OmaAFJvOfpD6M_Q";

        var basemap = new WebTiledLayer(basemapUrl, {subDomains:["a","b","c","d"]});

        var infoWindow = new InfoWindow({domNode: domConstruct.create("div", null, dom.byId("infoWindowStyle"))});

        //infoWindow.startup();

        /*
        var joy_pain_basemap = new BasemapLayer({
            subDomains:["a","b","c","d"],
            templateUrl: basemapUrl,
            type: "WebTiledLayer",
            copyright: "&copy;Mapbox"
        });
        
        esriBasemaps.joy_pain = {

          baseMapLayers: [joy_pain_basemap],
          thumbnailUrl: "http://borchert.github.io/joy-pain/img/thumbnail.jpg",
          title: "Joy/Pain"     
        };
        */

        joy_pain_map = new Map("joy-pain-map", {
            //basemap: "joy_pain",
            center: [-93.17, 44.96],
            zoom: 12,
            infoWindow: infoWindow,
            smartNavigation: false,
            minZoom:12
        });

        
        
        /*
        basemap_toggle = new BasemapToggle({
            map: joy_pain_map,
            basemaps: ["hybrid", esriBasemaps.joy_pain],
            basemap: esriBasemaps.joy_pain
          }, "BasemapToggle");
        basemap_toggle.startup();
        */

        var maxExtentParams = {
            "xmin":-10408523.528548198,
            "ymin":5588665.400915724,
            "xmax":-10330071.866091402,
            "ymax":5643615.772018506,
            "spatialReference":{"wkid":102100}
        };
        maxExtent = Extent(maxExtentParams);

        after_open = function($vex_content){
            var features = joy_pain_map.infoWindow._afteropen_features;
            var feature, feature_layer;
            var $map_divs = $vex_content.find("div[id^=\"preview-map\"]");
            $map_divs.each(function(a,div){
                var obj = +div.getAttribute("data-objectid");
                feature = array.filter(features, function(feature){
                    if (feature.attributes.OBJECTID === obj){
                        return feature;
                    }
                });
                if (feature.length === 1){
                    feature = feature[0];
                }
                else {
                    console.log("could not identify single feature");                    
                }

                //get_features_from_layer_by_id(queried_feature_layer, [obj]).then(function(results){
                //feature = results.features[0];

                var map_id = div.id;
                preview_maps[obj] = new Map(map_id, {
                    slider:false, 
                    nav:false,
                    extent: feature._extent,
                    logo: false
                });
                preview_maps[obj].on("load",function(e){
                    e.map.disableMapNavigation();
                });
                
                preview_maps[obj].feature = feature;

                var gra = new GraphicsLayer();
                var fcopy = feature.toJson();
                var g = new Graphic(fcopy);
                feature_layer = feature.getLayer();

                if (feature.attributes.Joy_Pain === "Joy"){
                    if (feature_layer.name === "Polylines"){
                        g.setSymbol(lineJoySymbol);
                    }
                    else {
                        g.setSymbol(polygonJoySymbol);
                    }
                    
                }
                else {
                    if (feature_layer.name === "Polylines"){
                        g.setSymbol(linePainSymbol);
                    }
                    else {
                        g.setSymbol(polygonPainSymbol);
                    }
                }
                gra.spatialReference = g.geometry.spatialReference;    
                gra.add(g);
                gra.on("click", function(e){
                    joy_pain_map.graphics.remove(joy_pain_map.graphics.graphics[0]);
                    vex.close();
                    activate_edit_toolbar(preview_maps[e.graphic.attributes.OBJECTID].feature);
                    buildInfoWindow(preview_maps[e.graphic.attributes.OBJECTID].feature);
                    joy_pain_map.infoWindow.show();
                })

                gra.on("mouse-over", function(e){
                
                    var g = new Graphic(e.graphic.geometry);
                    if (e.graphic.symbol.hasOwnProperty("outline")){
                         g.setSymbol(highlight_symbol_polygon);
                    }
                    else {
                        g.setSymbol(highlight_symbol_line);
                    }
                   
                    joy_pain_map.graphics.add(g);
                });
                gra.on("mouse-out", function(e){
                    joy_pain_map.graphics.remove(joy_pain_map.graphics.graphics[0]);
                });
                preview_maps[obj].addLayer(gra);

                //});
               
                
            })
        };

        var geoLocate = new LocateButton({
            map: joy_pain_map
        }, "LocateButton");
        geoLocate.startup();


        buildInfoWindow = function(graphic){
            var content = infoTemplateContent(graphic);
            var title = infoTemplateTitle(graphic);
            var class_name;
            title === "Share your story: " ? class_name = "vex-theme-flat-attack dialog-empty" : class_name = "vex-theme-flat-attack dialog-with-story";
            joy_pain_map.infoWindow.setClass(class_name);
            joy_pain_map.infoWindow.setContent(content);
            joy_pain_map.infoWindow.setTitle(title);
        };

        feature_picker = function(features){
            edit_toolbar.deactivate();
            var content = '', m;
            var row_template = '<li class="row"><span class="feature-preview-geom">{{preview}}</span>';
            for (var i = 0; i < features.length; i++){
                content = content + row_template.replace("{{preview}}", 
                    "<div data-objectid=" + features[i].attributes.OBJECTID +" id=preview-map" + i.toString() + "></div>");
  
            }
            joy_pain_map.infoWindow.setContent(content);
            joy_pain_map.infoWindow.setTitle("Which one?");
            joy_pain_map.infoWindow.setClass("vex-theme-flat-attack dialog-feature-picker");
            joy_pain_map.infoWindow.setAfterOpen(after_open, features);
            joy_pain_map.infoWindow.show();
        }

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

        var htmlMap = { '&': '&amp;',
                    '<': '&lt;',
                    '>': '&gt;',
                    '"': '&quot;',
                    "'": '&#39;'
        };

        get_features_from_click = function(click_extent){
            var filtered_graphics_lines = array.filter(lineLayer.graphics, function(graphic) {
                return click_extent.intersects(graphic.geometry);
            });
            var filtered_graphics_poly = array.filter(polygonLayer.graphics, function(graphic) {
                return click_extent.intersects(graphic.geometry);
            });

            return filtered_graphics_lines.concat(filtered_graphics_poly);
        }

        point_to_extent = function(map, point, toleranceInPixel) {
            //from http://blogs.esri.com/esri/arcgis/2010/02/08/find-graphics-under-a-mouse-click-with-the-arcgis-api-for-javascript/
          //calculate map coords represented per pixel
          var pixelWidth = map.extent.getWidth() / map.width;
          //calculate map coords for tolerance in pixel
          var toleraceInMapCoords = toleranceInPixel * pixelWidth;
          //calculate & return computed extent
          return new esri.geometry.Extent( point.x - toleraceInMapCoords,
                       point.y - toleraceInMapCoords,
                       point.x + toleraceInMapCoords,
                       point.y + toleraceInMapCoords,
                       map.spatialReference );
        }

        addStory = function (feature) {
            var story_text = dom.byId("story-text").value;
            story_text = escapeHTML(story_text);

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
            joy_pain_map.infoWindow.hide();
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
                6.5
                );

            linePainSymbol = new SimpleLineSymbol(
                SimpleLineSymbol.STYLE_SHORTDOT,
                painLineColor,
                6.5
                );

            var polygonRenderer = new UniqueValueRenderer(null, "Joy_Pain");
            polygonRenderer.addValue("Joy", polygonJoySymbol);
            polygonRenderer.addValue("Pain", polygonPainSymbol);

            var lineRenderer = new UniqueValueRenderer(null, "Joy_Pain");
            lineRenderer.addValue("Joy", lineJoySymbol);
            lineRenderer.addValue("Pain", linePainSymbol);

            lineLayer = new FeatureLayer(featureUrl + "0",
            {
           //     infoTemplate: featureLayerInfoTemplate,
                 outFields: ["Date", "Joy_Pain", "Your_Story", "OBJECTID"],
                 mode: FeatureLayer.MODE_SNAPSHOT
            });
            lineLayer.setRenderer(lineRenderer);

            polygonLayer = new FeatureLayer(featureUrl + "1",
            {
            //    infoTemplate: featureLayerInfoTemplate,
                 outFields: ["Date", "Joy_Pain", "Your_Story", "OBJECTID"],
                 mode: FeatureLayer.MODE_SNAPSHOT
            });
            polygonLayer.setRenderer(polygonRenderer);
            joy_pain_map.addLayers([lineLayer, polygonLayer]);

        };

        joy_pain_map.on("load", function(){
            createFeatureLayers();
            createToolbars();
        });

        joy_pain_map.addLayer(basemap);

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

            joy_pain_map.hideZoomSlider();
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
            joy_pain_map.infoWindow.hide();
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

        get_features_from_layer_by_id = function(feature_layer, feature_ids){
            var q = Query();
            q.objectIds = feature_ids;
            return feature_layer.queryFeatures(q, function(r){
                return r.features;
            })

        };

        activate_edit_toolbar = function(feature){
            edit_toolbar.activate(Edit.MOVE | Edit.SCALE | Edit.ROTATE, feature);
            showDeleteButton();
        };

        function createEventListeners(){

            var activateEditing = function(e){
                var features = queryFeatureOverlap(e);
                if (features.length === 1){
                    if (!drawing) {
                        activate_edit_toolbar(features[0]);
                    }
                    buildInfoWindow(features[0]);
                    joy_pain_map.infoWindow.show();
                    
                }
                else if (features.length > 1){
                    feature_picker(features);
                }
                else {
                    edit_toolbar.deactivate();
                    hideDeleteButton();
                    joy_pain_map.infoWindow.hide();
                }
                /*
                queryFeatureOverlap(e).then(
                    function(feature_ids){
                        get_features_from_layer_by_id(queried_feature_layer, feature_ids).then(
                            function(results){
                                if (results.features.length === 1){
                                    if (!drawing) {
                                        activate_edit_toolbar(e.graphic);
                                    }
                                    buildInfoWindow(results.features[0]);
                                    joy_pain_map.infoWindow.show();
                                    
                                }
                                else if (results.features.length > 1){
                                    feature_picker(results.features);
                                }
                            }
                        );
                    },
                    function(){
                        console.log("error");
                    }
                );
                */
            };
            /*
            lineLayer.on("click", activateEditing);
            polygonLayer.on("click", activateEditing);
            */
            joy_pain_map.on("click", activateEditing);

            queryFeatureOverlap = function(e){
                var ext = point_to_extent(joy_pain_map, e.mapPoint, 10);
                var features = get_features_from_click(ext);
                return features;
                /*var executeQuery = function(e){

                    //TODO replace with purely client side version
                    //from http://blogs.esri.com/esri/arcgis/2010/02/08/find-graphics-under-a-mouse-click-with-the-arcgis-api-for-javascript/
                    queried_feature_layer = e.graphic.getLayer();
                    var query = new Query();
                    query.returnGeometry = true;
                    query.distance = 5;
                    query.units = "meters";
                    query.spatialRelationship = Query.SPATIAL_REL_INTERSECTS;
                    query.geometry = e.mapPoint;
                    return queried_feature_layer.queryIds(query, function(results){

                        console.log(results.length + " features live here!");
                        return results;
                    });    
                }
                return executeQuery(e);*/
            }

            
     
          

            joy_pain_map.on("extent-change", function(e){

                if(!maxExtent.contains(e.extent.getCenter()) ){
                    joy_pain_map.setExtent(maxExtent);
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

            joy_toolbar = new Draw(joy_pain_map);
            pain_toolbar = new Draw(joy_pain_map);
            edit_toolbar = new Edit(joy_pain_map);

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

        joy_pain_map.showZoomSlider();

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
        joy_pain_map.infoWindow.setContent("<textarea id='story-text'></textarea><br/>");
        joy_pain_map.infoWindow.setTitle("Share your story:")
        joy_pain_map.infoWindow.show();

    }

    var escapeHTML = function(s,forAttribute){
            return s.replace(forAttribute ? /[&<>'"]/g : /[&<>]/g, function(c) {
                return htmlMap[c];
            });
    };

});