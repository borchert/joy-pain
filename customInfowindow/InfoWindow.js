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
          lang.mixin(this, parameters);


          domClass.add(this.domNode, "myInfoWindow");

          this._closeButton = domConstruct.create("div",{"class": "close", "title": "Close"}, this.domNode);
          this._title = domConstruct.create("div",{"class": "title"}, this.domNode);
          this._content = domConstruct.create("div",{"class": "content"}, this.domNode);

          this._toggleButton = domConstruct.create("div",{"class": "toggleOpen", "title": "Toggle"}, this.domNode);

          var toggler = new  Toggler({
            "node": this._content,
            showFunc: coreFx.wipeIn,
            hideFunc: coreFx.wipeOut
          });
          toggler.hide();

          on(this._closeButton, "click", lang.hitch(this, function(){
            //hide the content when the info window is toggled close.
            this.hide();
            if(this.isContentShowing){
              toggler.hide();
              this.isContentShowing = false;
              domClass.remove(this._toggleButton);
              domClass.add(this._toggleButton, "toggleOpen");
            }
          }));
          on(this._toggleButton, "click", lang.hitch(this, function(){
            //animate the content display
              if(this.isContentShowing){

                toggler.hide();
                this.isContentShowing = false;
                domClass.remove(this._toggleButton);
                domClass.add(this._toggleButton,"toggleOpen");

              }else{
                toggler.show();
                this.isContentShowing=true;
                domClass.remove(this._toggleButton);
                domClass.add(this._toggleButton,"toggleClose");
              }

          }));
          //hide initial display
          domUtils.hide(this.domNode);
          this.isShowing = false;

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
            console.log("setTitle");
            this._title = title;
        },
        setContent: function(content){
            console.log("setContent");
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

            if (this._showSaveButton){
                var joy_or_pain = this.getJoyPain();
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
                this._buttons = [vex.dialog.buttons.YES];
            }

            vex.dialog.open({
                message: this._title,
                input: this._content,
                buttons: this._buttons
            });
        },
        hide: function(){
            vex.close();
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
