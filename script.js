$(function() {
	
	
	
	
	
	
	
	
	var canvas = document.getElementById('canvas'),
		ctx = canvas.getContext('2d'),
		$canvas = $('.frame-render .panel-canvas canvas'),
		$brush = $('.frame-render .panel-canvas .brush');
	
	var TOOLS = {
		
		format: {
			
			preview: {
				scale: 1
			},
			pattern: {
				size: 10,
				scale: 10
			},
			showEditor : true
			
		},
		
		brush : {
			pos : {x: 0, y: 0},
			color: '#000000'
		}
	};
	
		var PATTERN = [
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
				x: e.pageX - (TOOLS.format.pattern.scale / 2),
				y: e.pageY - (TOOLS.format.pattern.scale / 2)
			},
			t_pos_parent = $canvas.offset();
		
		TOOLS.brush.pos.x = Math.round((t_mouse.x - t_pos_parent.left) / TOOLS.format.pattern.scale);
		TOOLS.brush.pos.y = Math.round((t_mouse.y - t_pos_parent.top) / TOOLS.format.pattern.scale);
		
		$brush.css('left', TOOLS.brush.pos.x * TOOLS.format.pattern.scale)
			.css('top', TOOLS.brush.pos.y * TOOLS.format.pattern.scale);
		
		console.log()
		
	});
	
	$canvas.on('mouseleave', function(e) {
		$brush.hide();
	});
	
	$canvas.on('mouseenter', function(e) {
		$brush.show();
	});
	
	$canvas.on('click', function(e) {
		
		PATTERN[TOOLS.brush.pos.y][TOOLS.brush.pos.x] = TOOLS.brush.color;
		
		drawPointInContext(ctx,
						   TOOLS.brush.pos.x,
						   TOOLS.brush.pos.y,
						   TOOLS.brush.color,
						   TOOLS.format.pattern.scale);
		
		previewPattern(PATTERN);
		
	});
	
	$('.frame-tools .parameter input').on('keydown', onChangeParameter);
	$('.frame-tools .parameter input[type=checkbox]').on('mousedown', onChangeParameter);
	
	$('#colorpicker').farbtastic(function (color) {
		
		console.log(color)
		
		TOOLS.brush.color = color;
		$('.frame-tools .panel[name=colorPicker] .color-preview').css('background-color', color);
		$brush.css('background-color', color);
		
	});
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	function drawPointInContext(ct, x, y, color, scale) {
		
		ct.beginPath();
		ct.rect(x * scale, y * scale, scale, scale);
		ct.fillStyle = color;
		ct.fill();
		
	}
	
	
	
	function previewPattern(pattern) {
		
		var w = pattern[0].length,
			h = pattern.length;
		
		var $ca = $('#process-canvas'),
			ca = document.getElementById('process-canvas'),
			ct = ca.getContext('2d');
		
		$ca.attr('width', w * TOOLS.format.preview.scale)
			.attr('height', h * TOOLS.format.preview.scale);
		
		for(var y=0; y<h; y++) {
			for(var x=0; x<w; x++) {
				var px = pattern[y][x];
				if(px === 0) continue;
				drawPointInContext(ct, x, y, px, TOOLS.format.preview.scale);
			}
		}
		
		$('.layer-preview').css('background-image', 'url('+ ca.toDataURL() +')');
		
		console.info('Preview Updated');
		
	}
	
	
	
	function onChangeParameter(e) {
		
		var $this = $(this),
			real_path = $this.parent().attr('name'),
			path = real_path.split('.'),
			value = $this.val(),
			param;
		
		var node = TOOLS;
		
		for(var i=1; i<path.length; i++) {
			
			node = node[path[i]];
			
		}
		
		if(e.keyCode === 38) {
			
			value++;
			
		}else if(e.keyCode === 40) {
			
			value--;
			
		}else if($this.attr('type') === "checkbox") {
			
			value = $this.is(':checked');
			
		}else
			abort();
		
		var rtn = modifyParameter(real_path, value);
		
		if(!rtn) abort();
		
		$this.val(value);
		
		function abort() {
			value = node;
			e.preventDefault();
			return;
		}
		
	}
	
	
	
	function modifyParameter(path, val) {
		
		var path = path.split('.');
		
		if(path[0] === 'tools') {
			
			if(path[1] === 'format') {
				
				if(path[2] === 'pattern') {
					
					switch(path[3]) {
						case 'size':
							if(val < 2) return false;
							TOOLS.format.pattern.size = val;
							resizeCanvas(false);
							break;
						case 'scale':
							if(val < 1) return false;
							TOOLS.format.pattern.scale = val;
							resizeCanvas(true);
							break;
					}
				
				}else if(path[2] === 'preview') {
					
					switch(path[3]) {
						case 'scale':
							if(val < 1) return false;
							TOOLS.format.preview.scale = val;
							previewPattern(PATTERN);
							break;
					}
					
				}else if(path[2] === 'showEditor') {
					
					TOOLS.format.showEditor = val;
					if(val)
						$('.panel-canvas').show();
					else
						$('.panel-canvas').hide();
					
				}
				
			}
			
		}
		
		return true;
		
	}
	
	
	
	function resizeCanvas(is_scale) {
		
		var size = TOOLS.format.pattern.size,
			scale = TOOLS.format.pattern.scale;
		
		$canvas.attr('width', size * scale)
			.attr('height', size * scale);
		
		$('.panel-canvas').css('width', (size * scale) + 'px')
			.css('height', (size * scale) + 'px');
		
		console.log(TOOLS.format.pattern)
		
		if(is_scale) {
			
			var w = PATTERN[0].length,
				h = PATTERN.length;
			
			for(var y=0; y<h; y++) {
				for(var x=0; x<w; x++) {
					var px = PATTERN[y][x];
					if(px === 0) continue;
					drawPointInContext(ctx, x, y, px, scale);
				}
			}
			
			$brush.css('width', scale + 'px').css('height', scale + 'px');
			
			previewPattern(PATTERN);
			
			return;
			
		}
		
		var nc = [];
		
		for(var y=0; y<size; y++) {
			nc[y] = [];
			for(var x=0; x<size; x++) {
				nc[y][x] = 0;
			}
		}
		
		PATTERN = nc;
		
		previewPattern(nc);
		
	}
	
});