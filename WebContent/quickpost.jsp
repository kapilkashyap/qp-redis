<!DOCTYPE html>
<html>
	<head>
		<title>Quick Post Widget - Implementation</title>
		<script type="text/javascript" src="jquery/jquery-1.6.min.js"></script>
		<script type="text/javascript" src="jquery/jquery-ui-1.8.0.min.js"></script>

		<script type="text/javascript" src="jquery-quickpost-widget/demos/assets/filterJSON.plugin.js"></script>
		<script type="text/javascript" src="jquery-quickpost-widget/src/paginated.dropdown.widget.js"></script>
		<script type="text/javascript" src="jquery-quickpost-widget/src/quickpost.widget.js"></script>

		<link rel="stylesheet" type="text/css" href="jquery-quickpost-widget/demos/assets/style.css" />
		<link rel="stylesheet" type="text/css" href="jquery-quickpost-widget/style/quickpost.widget.css" />
		<style type="text/css">
			body {
				background-color: #FFFFFF;
				color: #000;
			}
			.vertical-align-top {
				vertical-align: top;
			}
			.x-message-container {
				margin: 25px 0;
			}
			.x-message {
				background-color: #9FBAE9;
				padding: 3px 0px 3px 1px;
				margin: 0 0 1px 0;
			}
			.x-comment {
				background-color: #E0ECFF;
				padding: 2px 2px 2px 5px;
				margin: 0 1px 1px 1px;
			}
			.comment-container {
				margin: 0;
			}
			.hidden {
				display: none;
			}
			.quick-post-label {
				background-color: #5378B9;
				color: white;
				padding: 3px 2px;
				margin: 0 0 1px 0;
			}
			.input-row button {
				background: #9FBAE9;
				color: white;
				border: 1px solid #728FC2;
				cursor: pointer;
			}
			.input-row button:hover {
				background: #728FC2;
				color: white;
				border: 1px solid #728FC2;
				cursor: pointer;
			}
			.profile-link {
				color: #103F92 !important;
			}
			#updatePosts {
				cursor: pointer;
			}
			#resetRedis {
				cursor: pointer;
				display: none;
			}
			.marginLR5px {
				margin: 0 5px 0 5px;
			}
		</style>
	</head>

	<body id="body">
		<div>
			<div class="floatRight"><span id="resetRedis">Reset</span></div>
			<div class="floatRight marginLR5px"><span id="updatePosts">Update</span></div>
		</div>
		<br/>
		<div>
			<div class="marginT10px vertical-align-top" style="margin: 0px auto; padding: 5px; width: 402px;">
				<div class="quick-post-label">Quick Post...</div>
				<div id="x-post-demo" class="x-quickpost width400px height30px" contentEditable="true" dir="LTR"></div>
				<div class="btn-container input-row" style="display: none; margin: 1px 0 0 0; padding: 0 !important;">
					<button id="post" class="floatRight">Post</button>
				</div><br/>
				<div id="msg-container"></div>
			</div>
		</div>
	</body>

	<script type="text/javascript">
		var focused = false;
			fn = function(o, prepend) {
			var $post = $( "<div></div>", {"id": o.id, "class": "x-message-container", "html": "<div class='x-message'>" + o.post + "</div>"}),
		 		$commentContainer = $( "<div></div>", {"class": "comment-container"} ),
		 		$commentBox = $( "<div></div>", {
		 				"class": "x-quickpost",
		 				"contentEditable": "true",
		 				"dir": "LTR" 
		 			}).width( 400 ).height( 20 ),
				$btnContainer = $( "<div></div>", {
					"class": "btn-container input-row hidden",
					"style": "margin: 1px 0 0 0; padding: 0 !important;",
					"html": $( "<button></button>", {
						"class": "floatRight",
						"html": "Comment"
					 }).click(function( event ) {
						var $parent = $( this ).parent(),
							$cqpw = $parent.siblings( ".quickpost-wrapper" );
	
						$.ajax({
							url: "/qp-redis/Service/Comment",
							data: {"id": $commentContainer.parent().attr( "id" ), "comment": $cqpw.find( "input[type='hidden']" ).val()},
							success: function(data, textStatus, jqXHR) {
								$parent.siblings( ".comment-container" ).append( $( "<div></div>", {"class": "x-comment", "html": data.comment}) );
								$cqpw.find( ".quickpost" ).html( "" ).keydown().keyup();
							}
						});
					})
				});

			if(o.comments && o.comments.length > 0) {
				$.each(o.comments, function(k2,o2) {
					$commentContainer.append( $( "<div></div>", {"class": "x-comment", "html": o2}) );
				});
			}

			$post.append( $commentContainer ).append( $commentBox ).append( $btnContainer );

			$commentBox.quickpost({
				url: "jquery-quickpost-widget/demos/assets/cricketers.json",
				valueProperty: "name",
				itemTemplate: "<div title=\"{@:email}\"><div>{@:name}</div></div>",
				filterJSON: {startsWith: true},
				increaseHeightAfter: 50,
				deltaHeight: 10
			}).bind( "quickpostitemselected", function( event, data ) {
				if(window.console) {
					/*console.log("callback - quickpostitemselected");
					console.log(event);
					console.log(data);*/
				}
		    }).bind( "keyup", function( event ) {
		    	if($( this ).text() != "") {
		    		$( this ).parent().siblings( ".btn-container" ).show();
		    	}
		    	else {
		    		$( this ).parent().siblings( ".btn-container" ).hide();
		    	}
		    });

			if(!prepend) {
				$( "#msg-container" ).append( $post );
			}
			else {
				$( "#msg-container" ).prepend( $post );
			}
		};

		$( document ).ready(function() {
			if(window.location.host.match("localhost") != null) {
				$( "#resetRedis" ).show();
			}

			$( "#x-post-demo" ).quickpost({
				url: "jquery-quickpost-widget/demos/assets/cricketers.json",
				valueProperty: "name",
				itemTemplate: "<div title=\"{@:email}\"><div>{@:name}</div></div>",
				filterJSON: {startsWith: true}
			}).bind( "quickpostitemselected", function( event, data ) {
				if(window.console) {
					/*console.log("callback - quickpostitemselected");
					console.log(event);
					console.log(data);*/
				}
		    }).bind( "keyup", function( event ) {
		    	if($( this ).text() != "") {
		    		$( this ).parent().siblings( ".btn-container" ).show();
		    	}
		    	else {
		    		$( this ).parent().siblings( ".btn-container" ).hide();
		    	}
		    });

			$.ajax({
				url: "/qp-redis/Service/Fetch",
				data: {"pattern": "qp:post:*"},
				success: function(data, textStatus, jqXHR) {
					$.each(data, function(k,o) {
						fn(o);
					});
				}
			});
		});

		$( "#post" ).click(function( event ) {
			var $qpw = $( this ).parent().siblings( ".quickpost-wrapper" );
			$.ajax({
				url: "/qp-redis/Service/Post",
				data: {"post": $qpw.find( "input[type='hidden']" ).val()},
				success: function(data, textStatus, jqXHR) {
					fn(data.resp, true);
				}
			});
			$qpw.find( ".quickpost" ).html( "" ).keydown().keyup();
		});
		
		$( "#updatePosts" ).click(function( event ) {
			var fetchBeforeId = $( "#msg-container" ).find( "div.x-message-container:first" ).attr("id");
			$.ajax({
				url: "/qp-redis/Service/UpdatePosts",
				data: {"pattern": "qp:post:*", "fetchBeforeId": fetchBeforeId},
				success: function(data, textStatus, jqXHR) {
					//$( "#msg-container" ).empty();
					$.each(data, function(k,o) {
						fn(o, true);
					});
				}
			});
		});
		$( "#resetRedis" ).click(function( event ) {
			if(window.location.host.match("localhost") != null) {
				$.ajax({
					url: "/qp-redis/Service/ResetRedis",
					success: function(data, textStatus, jqXHR) {
						window.location = "/qp-redis";
					}
				});
			}
		});

		$( window ).focus( function( event ) {
			if(!focused) {
				focused = true;
				event.stopPropagation();
				var fetchBeforeId = $( "#msg-container" ).find( "div.x-message-container:first" ).attr("id");
				$.ajax({
					url: "/qp-redis/Service/UpdatePosts",
					data: {"pattern": "qp:post:*", "fetchBeforeId": fetchBeforeId},
					success: function(data, textStatus, jqXHR) {
						//$( "#msg-container" ).empty();
						console.log("focused...");
						$.each(data, function(k,o) {
							fn(o, true);
						});
						focused = false;
					}
				});
			}
		});

	</script>
</html>
