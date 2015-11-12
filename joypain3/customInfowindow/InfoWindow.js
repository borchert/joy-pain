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
            if (storyFeature){
                return storyFeature.attributes.Joy_Pain.toLowerCase();    
            }
            else {
                return "joy";
            }
        },

        getAfterOpen: function(){
            if (this._afteropen){
                return this._afteropen;
            }
            else {
                return null;
            }
        },

        setAfterOpen: function(after_open, features){
            if (after_open){
                this._afteropen = after_open;
                this._afteropen_features = features;
            }
            else {
                this._afteropen = null;
            }
        },

        show: function(location){
			var joy_or_pain = this.getJoyPain();
            var that = this;
            var afterOpen = this.getAfterOpen();
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
                appendLocation: "#joy-pain-map",
                message: this._title,
                input: this._content,
                afterOpen: afterOpen,
                buttons: this._buttons
            });
            $(".vex-content").focus();
        },
        hide: function(){
            this._content = this._title = null;
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
