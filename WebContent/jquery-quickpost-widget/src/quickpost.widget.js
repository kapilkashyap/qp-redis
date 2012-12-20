/*
 * jQuery Quick Post UI Widget 1.0
 * Copyright (c) 2012 Kapil Kashyap
 *
 * Depends:
 *   - jQuery 1.6+
 *   - jQuery UI 1.8 widget factory
 *   - jQuery paginateddropdown widget
 *   - jQuery Filter Json plugin // optional
 *
 * Dual licensed under the MIT and GPL licenses:
 *   - http://www.opensource.org/licenses/mit-license.php
 *   - http://www.gnu.org/licenses/gpl.html
 */
(function($) {
	$.widget( "kk.quickpost", $.kk.paginateddropdown, {
		// default options
	    options: {
	    	triggerOn: "@",
	    	identifierProperty: "id",
	    	autoHeight: true,
	    	increaseHeightAfter: 75, // characters
	    	deltaHeight: 20 // increase or decrease by 20 pixels
	    },
	    _create: function() {
	    	var wrapper = null,
	    		hiddenInputElement = null,
	    		ipp = null,
	    		ddw = 0;

	    	// set widget properties
	    	this._setWidgetProperties();

	    	// create a wrapper for the target element
	    	wrapper = $( "<div></div>" ).addClass( this.wp.widgetBaseClass + this.wp.hyphen + this.wp.wrapperLabel );
	    	// wrap the element with the wrapper
	    	this.element.wrap( wrapper.width(this.element.width()));

	    	// set widget state
	    	this._setWidgetState();

	    	// add widget base class
	    	this.element.addClass( this.wp.widgetBaseClass );

	        // if dropdown width is specified use that, else calculate dropdown width dynamically.
	        if(this.options.dropdownWidth) {
	        	ddw = parseInt(this.options.dropdownWidth, 10);
	        	this.options.dropdownWidth = ddw ? ddw : 0;
	        }

	        ipp = parseInt(this.options.itemsPerPage, 10);
	        if(!ipp || ipp <= 0) {
	        	this.options.itemsPerPage = 10;
	        }

	        // create a hidden input element
	        hiddenInputElement = $( "<input></input>", {
    				"type": "hidden",
    				"value": "",
    				"name": "x_" + this.wp.widgetBaseClass + "_hidden_input",
    				"class": "x-" + this.wp.widgetBaseClass + "-hidden-input"
    			});

	        // append the hidden input element to the wrapper
	        this.element.parent().append(hiddenInputElement);

        	// bind various events to the element
        	this._bindEvents();

        	// create a template for the paginated drop down footer
        	this._constructPaginationFooterTemplate();
	    },
	    _setWidgetProperties: function() {
	    	if(this.options.customEventPrefix) {
	    		this.widgetEventPrefix = this.options.customEventPrefix;
	    	}
	    	this.wp = {};
	    	this.wp.widgetBaseClass 		= "quickpost";
	    	this.wp.selectedItemClass 		= "selected-item";
	    	this.wp.space 					= " ";
	    	this.wp.hyphen 					= "-";
	    	// labels
	    	this.wp.ofLabel 				= "of"; // This should be internationalised
	    	this.wp.wrapperLabel 			= "wrapper";
	    	this.wp.containerLabel 			= "container";
	    	this.wp.itemLabel 				= "item";
	    	this.wp.footerLabel 			= "footer";
	    	this.wp.footerContentLabel 		= "footer-content";
	    	this.wp.footerInfoLabel 		= "footer-info";
	    	this.wp.footerLeftNavLabel 		= "footer-left-nav";
	    	this.wp.footerRightNavLabel 	= "footer-right-nav";
	    	this.wp.closeBtnLabel 			= "close-button";
	    	// custom events
	    	this.wp.itemSelectedEvent 		= "itemselected";
	    	// regular expressions for firing ajax call
	    	this.wp.fireAjaxRegEx 			= new RegExp( "\\s" + this.options.triggerOn + "\\w+" ); 
	    	this.wp.fireAjaxRegEx2 			= new RegExp( this.options.triggerOn + "\\w+" ); 
	    	// regular expressions to update the hidden input field
	    	this.wp.contentEditableRegEx 	= new RegExp("\\s?contenteditable=(\"false\"|false)\\s?", "ig"); // replace with empty string ""
	    	this.wp.breakLineRegEx 			= new RegExp("<br>", "ig"); // replace with empty string ""
	    	this.wp.openingTagRegEx 		= new RegExp("\\<button\\s?|\\<b\\s?", "ig"); // replace with empty string ""
	    	this.wp.closingTagRegEx 		= new RegExp("</button>|</b>", "ig"); // replace with "]"
	    	this.wp.pidRegEx 				= new RegExp("\s?pid=\"", "ig"); // replace with "@["
	    	this.wp.nbspRegEx 				= new RegExp("&nbsp;", "g"); // replace with space " "
	    	this.wp.delimeterRegEx 			= new RegExp("\">", "g"); // replace with ":"
	    	this.wp.typeRegEx 				= new RegExp("\\s?type=submit\\s?", "ig"); // replace with empty string ""
	    	this.wp.spanRegEx 				= new RegExp("<span contenteditable=(\"true\"|true)>|</span>", "ig"); // replace with empty string ""
	    	// regular expressions for removing the mailto link in IE8 and below
	    	this.wp.mailToPrefixRegEx		= new RegExp("<a href=\"mailto:\\w+\\.?(\\w+)?\\@\\w+\">", "ig"); // replace with empty string ""
	    	this.wp.mailToSuffixRegEx		= new RegExp("</a>", "ig"); // replace with empty string ""
	    	// labels for regular expressions replacements
	    	this.wp.emptyString 			= "";
	    	this.wp.enclosurePrefix 		= "@[";
	    	this.wp.enclosureDelimeter		= ":";
	    	this.wp.enclosureSuffix 		= "]";
        	// keep track of the elements original height
	    	this.wp.elOriginalHeight 		= this.element.height();
	    },
	    _bindEvents: function() {
	    	var self = this,
	    		el = self.element,
		    	selection = null;

			el.keydown(function( event ) {
				self._keyNavigations( event );
				// fix for mozilla.
				// When the highlighted node is selected, backspace and delete button misbehave
				if($.browser.mozilla) {
					if(event.keyCode == 8 || event.keyCode == 46) {
						selection = document.getSelection();
						if(selection && selection.toString() != "") {
							if(event.keyCode == 8) {
								event.preventDefault();
							}
							selection.deleteFromDocument();
							self._updateHiddenInput();
							el.focus();
						}
					}
				}
				if(self.options.autoHeight) {
					self._setElHeight(el.text().length);
				}
			});

			el.keypress(function( event ) {
				if(event.keyCode == 13) {
					event.preventDefault();
    				if($( el.parent().find( "." + self.wp.selectedItemClass ) ).length > 0) {
    					self._itemSelection(event);
    				}
    				return;
				}
			});

    		el.keyup(function( event ) {
    			var range = null,
    				_value = el.text();

    			// clean up the dropdown and return, if input element is empty or Esc key is pressed.
    			if(_value == "" || event.keyCode == 27) {
    				if(_value == "" || !self.options.persistState) {
    					if(_value == "") {
    						el.siblings( ".x-" + self.wp.widgetBaseClass + "-hidden-input" ).val( "" );
    						el.html( "" );
    					}
    					self._resetWidgetState();
    				}
    				self._cleanup();
    				return;
    			}

    			// pro-actively update the hidden field
    			self._updateHiddenInput();

    			if(_value.match( self.wp.fireAjaxRegEx ) || _value.search( self.wp.fireAjaxRegEx2 ) != -1) {
	    			var offset = 0,
	    				preCaretTextRange = null,
	    				subString = "",
	    				triggerIndex = -1,
	    				query = "",
	    				getOffset = function(o, previousSibling) {
	    					if(!previousSibling) {
	    						return o;
	    					}

	    					if(previousSibling.innerText || previousSibling.innerHTML) {
	    						o = o + (previousSibling.innerText || previousSibling.innerHTML).length;
	    					}
	    					else if(previousSibling.data) {
	    						o = o + previousSibling.data.length;
	    					}
	    					return getOffset(o, previousSibling.previousSibling);
	    				};

	    		    if(window.getSelection) { // non IE Browsers
	    		        range = window.getSelection().getRangeAt(0);
	    		        offset = getOffset(range.startOffset, range.endContainer.previousSibling);
	    		    }
	    		    else if(document.selection) { // IE
	    		        range = document.selection.createRange();
	    		        preCaretTextRange = document.body.createTextRange();
	    		        preCaretTextRange.moveToElementText(this);
	    		        preCaretTextRange.setEndPoint("EndToEnd", range);
	    		        offset = preCaretTextRange.text.length;
	    		    }

	    		    subString = _value.substring(0, offset),
	    			triggerIndex = subString.lastIndexOf( self.options.triggerOn ),
	    			query = triggerIndex != -1 ? subString.substring(triggerIndex + 1) : "";
	    			if(query != "") {
    					self._fetchData(query);
    				}
    				else {
    					self._cleanup();
    				}
	    		}
	    		else {
	    			self._cleanup();
	    		}
    		});
			// remove the dropdown and clean up the dom.
			el.blur(function( event ) {
				setTimeout(function() {
					if(el.is(":focus")) {
						return false;
					}
					self._resetWidgetState();
					self._cleanup();
				}, 200);
			});
			// Fix for IE9
			el.click(function( event ) {
				// Refer - http://stackoverflow.com/questions/12659608/how-to-prevent-converting-ab-to-a-mailto-link-in-contenteditable-div-in-ie
				if($.browser.msie) {
					try {
						document.execCommand("AutoUrlDetect", false, false);
					}
					catch( e ) {
						// will fail because IE8 and less do not support 'AutoUrlDetect'
						// and I did not want to do version specific checks.
					}
				}
			});
	    },
	    _setElHeight: function(contentLength) {
			var calculatedHeight = null,
				multiple = null;

			if(contentLength > 1) {
				multiple = Math.floor(contentLength / this.options.increaseHeightAfter);
				calculatedHeight = this.wp.elOriginalHeight + (multiple * this.options.deltaHeight);
				if(calculatedHeight != this.element.height()) {
					this.element.height( calculatedHeight );
				}
			}
			else if(contentLength == 0) {
				this.element.height( this.wp.elOriginalHeight );
			}
	    },
	    _updateContent: function(o) {
	    	var self = this,
	    		el = self.element,
	    		queryTemplate = this.options.triggerOn + self._getWidgetState().query,
	    		elValue = el.html(),
	    		queryTemplateIndex = elValue.indexOf( queryTemplate ),
		    	updatedElValue = null;

	    	elValue = $.trim( elValue );
	    	if($.browser.mozilla) {
	    		// Fix for deleting content using backspace in FireFox
	    		// Refer: http://stackoverflow.com/questions/2239821
	    		updatedElValue = elValue.replace(queryTemplate, "<button pid=\"" + o[self.options.identifierProperty] + "\" contentEditable=\"false\"><span contenteditable=\"true\">" + o[self.options.valueProperty] + "</span></button>&nbsp;");
	    	}
	    	else {
	    		// Fix for a strange issue seen only in Internet Explorer.
	    		// issue: in the value returned by jQuery.html the trailing space
	    		// gets truncated rather than getting converted to '&nbsp;'
	    		if($.browser.msie) {
	    			if(elValue.charAt(queryTemplateIndex - 1) == " ") {
	    				elValue = elValue.substring(0, queryTemplateIndex - 1) + "&nbsp;" + elValue.substring(queryTemplateIndex, elValue.length + 6);
	    			}
	    		}
	    		updatedElValue = elValue.replace(queryTemplate, "<button pid=\"" + o[self.options.identifierProperty] + "\" contentEditable=\"false\">" + o[self.options.valueProperty] + "</button>&nbsp;") + (!$.browser.msie ? "<br>" : "");
	    	}
	    	el.html( updatedElValue );
	    	self._updateHiddenInput(o[self.options.valueProperty]);
	    	el.focus();
	    },
	    _updateHiddenInput: function(insertedText) {
	    	var hiddenInput = this.element.siblings( ".x-" + this.wp.widgetBaseClass + "-hidden-input" ),
	    		elValue = this.element.html(),
	    		transformedElValue = null,
	    		caretPosition = insertedText ? (this.element.text().indexOf(insertedText) + insertedText.length + 1) : 0;

	    	// fix for IE8 and below versions
	    	// Refer - http://stackoverflow.com/questions/12659608/how-to-prevent-converting-ab-to-a-mailto-link-in-contenteditable-div-in-ie
			if($.browser.msie && parseInt($.browser.version, 10) <= 8) {
				elValue = elValue.replace( this.wp.mailToPrefixRegEx, this.wp.emptyString ).replace( this.wp.mailToSuffixRegEx, this.wp.emptyString );
			}
	    	transformedElValue = elValue.replace( this.wp.spanRegEx, this.wp.emptyString )
								    	.replace( this.wp.typeRegEx, this.wp.emptyString )
								    	.replace( this.wp.breakLineRegEx, this.wp.emptyString )
	    								.replace( this.wp.contentEditableRegEx, this.wp.emptyString )
	    								.replace( this.wp.pidRegEx, this.wp.enclosurePrefix )
	    								.replace( this.wp.delimeterRegEx, this.wp.enclosureDelimeter )
	    								.replace( this.wp.openingTagRegEx, this.wp.emptyString )
	    								.replace( this.wp.closingTagRegEx, this.wp.enclosureSuffix )
	    								.replace( this.wp.nbspRegEx, this.wp.space );

	    	hiddenInput.val( $( "<div></div>" ).html( transformedElValue ).text() );
	    	caretPosition > 0 && (this._setCaretPositionAfter( insertedText, caretPosition ));
	    },
	    _setCaretPositionAfter: function(insertedText, caretPosition) {
			var range = null,
				childNodes = null,
				startPosition = 0,
				selectedNode = null,
				preCaretTextRange = null,
				selection = null;

			this.element.focus();
		    if(window.getSelection) { // IE9 and other Browsers
		    	selection = window.getSelection();
		        range = selection.getRangeAt(0);
		        childNodes = this.element[0].childNodes;
		        if(childNodes.length > 0) {
		        	$.each(childNodes, function(index, node) {
		        		if(node.textContent && insertedText == node.textContent) {
		        			startPosition = index;
		        		}
		        	});
		        	try {
		        		range.setStart(childNodes[startPosition + 1], 1);
		        		range.collapse(true);
		        		selection.removeAllRanges();
		        		selection.addRange(range);
		        	}
		        	catch( e ) {
		        		if(window.console) {
		        			console.error( e );
		        		}
		        	}
		        }
		    }
	    },
	    destroy: function() {
	    	this.element.siblings(".x-" + this.wp.widgetBaseClass + "-hidden-input").remove();
	    	if(this.options.autoHeight) {
				this.element.height( this.wp.elOriginalHeight );
			}
	    	// calling paginated drop down widgets destroy
	    	$.kk.paginateddropdown.prototype.destroy.call( this );
	    }
	});

	// extend the paginated drop down default options
	$.extend($.kk.quickpost.prototype.options, $.kk.paginateddropdown.prototype.options);
}(jQuery));