# jQuery Quick Post Widget

This widget extends the Paginated Drop Down Widget and provides a Facebook or Google+ like input area where in you can include profiles/pages using a trigger character ('@' is default) to create a drop down of
matching profiles/pages. On selection of a profile or page from the drop down, the text is highlighted. Also a hidden field is kept updated with a special construct so that the back-end code can create direct 
links to the profile or page selected.

This Widget has all the features of Paginated Drop Down as well as other features like specifying the trigger character, auto height increase or decrease, increase height after certain number of characters and more.

This Widget has dependencies on jQuery-1.6+, jQuery UI Widget Factory 1.8+, jQuery Paginated Drop Down Widget and jQuery filterJSON plugin (also developed by me). The filterJSON plugin is a utility which allows you 
to filter the JSON based on properties. You can explore filterJSON under my repositories. However, using filterJSON plugin is not mandatory and can be completely ignored.

Supports IE7+, FF 3.6+, Opera 12+, Safari 5+ and Chrome.

### Known Issues

For this Widget to work in IE7 and below with filterJSON property set as true, you will have to include JSON2.

You can use: http://ajax.cdnjs.com/ajax/libs/json2/20110223/json2.js

### Licence

Copyright (c) 2012 Kapil Kashyap.
Dual licensed under MIT License and GPL License.