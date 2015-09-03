$(function() {
	
	var canvas = document.getElementById('canvas'),
		ctx = canvas.getContext('2d'),
		$canvas = $('.frame-render .panel-canvas canvas'),
		$brush = $('.frame-render .panel-canvas .brush');
	
	var TOOLS = {
			brush : {
				pos : {x: 0, y: 0}
			}
		},
		VIEW = {
			scale : 10
		},
		PATTERN = [
			[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
		];
	
	$canvas.on('mousemove', function(e){
		
		var t_mouse = {
				x: e.pageX - 5,
				y: e.pageY - 5
			},
			t_pos_parent = $canvas.offset();
		
		TOOLS.brush.pos.x = Math.round((t_mouse.x - t_pos_parent.left) / VIEW.scale);
		TOOLS.brush.pos.y = Math.round((t_mouse.y - t_pos_parent.top) / VIEW.scale);
		
		$brush.css('left', TOOLS.brush.pos.x * VIEW.scale).css('top', TOOLS.brush.pos.y * VIEW.scale);
		
	});
	
	$canvas.on('mouseleave', function(e) {
		$brush.hide();
	});
	
	$canvas.on('mouseenter', function(e) {
		$brush.show();
	});
	
	$canvas.on('click', function(e) {
		
		PATTERN[TOOLS.brush.pos.y][TOOLS.brush.pos.x] = 1;
		
		ctx.rect(TOOLS.brush.pos.x * VIEW.scale, TOOLS.brush.pos.y * VIEW.scale, VIEW.scale, VIEW.scale);
		ctx.fillStyle = '#000';
		ctx.fill();
		
		previewPattern(PATTERN);
		
	})
	
	function previewPattern(pattern) {
		
		var w = pattern[0].length,
			h = pattern.length;
		
		var $ca = $('#process-canvas'),
			ca = document.getElementById('process-canvas'),
			ct = ca.getContext('2d');
		
		$ca.attr('width', w).attr('height', h);
		
		ct.clearRect(0, 0, w, h);
		
		for(var y=0; y<h; y++) {
			
			for(var x=0; x<w; x++) {
				
				var px = pattern[y][x];
				
				if(px === 0) continue;
				
				ct.rect(x, y, 1, 1);
				ct.fillStyle = '#000';
				ct.fill();
				
			}
			
		}
		
		$('.layer-preview').css('background-image', 'url('+ ca.toDataURL() +')');
		
	}
	
});