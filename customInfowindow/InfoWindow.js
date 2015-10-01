define([
    "dojo/Evented",
    "dijit/registry",
    "dojo/parser",
    "dojo/on",
    "dojo/_base/declare",
    "dojo/dom-construct",
    "dojo/_base/array",
    "dojo/dom-style",
    "dojo/_base/lang",
    "dojo/dom-class",
    "dojo/fx/Toggler",
    "dojo/fx",
    "dojo/Deferred",
    "esri/domUtils",
    "esri/InfoWindowBase"

],
function(
    Evented,
    registry,
    parser,
    on,
    declare,
    domConstruct,
    array,
    domStyle,
    lang,
    domClass,
    Toggler,
    coreFx,
    Deferred,
    domUtils,
    InfoWindowBase
) {
    return declare([InfoWindowBase, Evented], {

        isContentShowing :false,

        constructor: function(parameters) {
            return;
        },
        setMap: function(map){
          this.inherited(arguments);
          map.on("pan-start", lang.hitch(this, function(){
            this.hide();
          }));
          map.on("zoom-start", lang.hitch(this, function(){
            this.hide();
          }));
         // map.on("zoom-start", //this, this.hide);

        },
        setTitle: function(title){
            //console.log("setTitle");
            this._title = title;
        },
        setContent: function(content){
            //console.log("setContent");
            this._content = content;
            if (content.indexOf("textarea") !== -1){
                this._showSaveButton = true;
            }

            else {
                this._showSaveButton = false;
            }
        },

        //gets the joypain status of the clicked feature (global :/)
        getJoyPain: function(){
            return storyFeature.attributes.Joy_Pain.toLowerCase();
        },

        show: function(location){
			var joy_or_pain = this.getJoyPain();
            if (this._showSaveButton){
            
				vex.dialog.buttons.NO.text = "Skip";
                this._buttons = [
                     vex.dialog.buttons.NO,
                     $.extend({}, vex.dialog.buttons.NO, {
                         id: "story-button",
                         className: 'vex-dialog-button-save-' + joy_or_pain,
                         text: 'Save',
                         click: function($vexContent, event) {
                             addStory(storyFeature);
                         }
						})
                 ];
            }
            else {
                this._buttons = [                    
					$.extend({}, vex.dialog.buttons.YES, {
					 className: 'vex-dialog-button-save-' + joy_or_pain,
					 text: 'OK'
					})
				];
            }

            vex.dialog.open({
                message: this._title,
                input: this._content,
                buttons: this._buttons
            });
            $(".vex-content").focus();
        },
        hide: function(){
            vex.close();
            $("#map").focus();
            return;
        },
        resize: function(width, height){
            return;

        },
        destroy: function(){
          domConstruct.destroy(this.domNode);
          this._closeButton = this._title = this._content = null;

        }


      });

});
