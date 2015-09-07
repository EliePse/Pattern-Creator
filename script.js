$(function() {
	
	
	
	function c_info(v){console.info(v);}
	function c_error(v){console.error(v);}
	function c_warn(v){console.warn(v);}
	function c_log(v){console.log(v);}
	
	
	
	var canvas = document.getElementById('canvas'),
		ctx = canvas.getContext('2d'),
		$canvas = $('.frame-render .panel-canvas canvas'),
		$brush = $('.frame-render .panel-canvas .brush'),
		$colorPicker;
	
	
	
	
	
	
	
	
	
	var Main = {
		
		pattern : undefined,
		pencil: undefined
		
	};
	
	
	
	
	
	
	
	
	var Pixel = function(c, a) {
		this.color = c;
		this.alpha = a;
	}
	
	var Color = function(r, v, b, a) {
		
		this.r = r;
		this.v = v;
		this.b = b;
		this.a = (a !== undefined && a > 0 && a < 1) ? a : 1;
		
		this.getHexa = function () {
			var hexa = '';
			return hexa.concat(this.r, this.v, this.b);
			
		};
		
	}
	
	var Brush = function(dr, di, up) {

		this.draw = dr;
		this.display = di;
		this.update = up;

	}
	
	
	
	
	
	
	
	
	
	
	
	
	var Pattern = function(c, w, h, s) {
		
		var width = w,
			height = h,
			scale = s,
			previewScale = s,
			canvas = c,
			context = canvas.getContext('2d'),
			$canvas = $(c),
			$lContainer = $canvas.parent();
		
		this.active = true;
		var showEditor = true,
			showPreview = true;
		
		var layers = [],
			activeLayer;
		
		this.addLayer = function(name, index) {
			
			if(name === '' || name === undefined)
				name = 'Calque ' + layers.length;
			
			index = (activeLayer === undefined) ? 0 : (activeLayer.index);
			
			var l = new Layer(name, index, context);
			context.clearRect(0, 0, width, height);
			
			if(layers[index] instanceof Layer) {
				
				layers.push(l);
				
				layers.sort(function (a,b){
					if(a.index < b.index)
						return -1;
					else if(a.index > b.index)
						return 1;
					else
						return 0;
				});
				
				for(i=0; i<layers.length; i++)
					layers[i].setIndex(i);
				
			} else {
				
				layers[index] = l;
				
			}
			
			if(activeLayer)
				activeLayer.hideActive();
			activeLayer = l;
			
			refreshLayersList();
			
			activeLayer.showActive();
			$canvas.css('z-index', activeLayer.index);
			
		};
		
		this.getCurrentLayer = function () { return activeLayer; };
		this.getScale = function () { return scale; };
		this.getCanvas = function () { return $canvas; };
		this.getSize = function () { return {x: width, y: height}; };
		this.getPreviewScale = function () { return previewScale; };
		
		this.setSize = function (x, y) {
			
			var tSize = {x:width, y:height};
			
			if(x === '++')
				width++;
			else if(x === '--' && width - 1 > 1)
				width--;
			else if(!isNaN(x) && x > 0)
				width = x;
			else
				return false;
			
			if(y === '++')
				height++;
			else if(y === '--' && height - 1 > 1)
				height--;
			else if(!isNaN(y) && y > 0)
				height = y;
			else
				return false;
			
			if(tSize.x === width && tSize.y === height) return false;
			
			$canvas.attr('width', width).attr('height', height);
			this.updateEditorScale();
			this.updatePreviewScale();
			this.reset();
			
			return true;
			
		};
		this.setScale = function (s) {
			
			if(s === '++')
				scale++;
			else if(s === '--' && scale - 1 > 0)
				scale--;
			else if(!isNaN(s) && s > 0)
				scale = s;
			else
				return false;
			
			this.updateEditorScale();
			
			return true;
			
		};
		this.setPreviewScale = function (s) {
			
			if(s === '++')
				previewScale++;
			else if(s === '--' && previewScale - 1 > 0)
				previewScale--;
			else if(!isNaN(s) && s > 0)
				previewScale = s;
			else
				return false;
			
			this.updatePreviewScale();
			return true;
			
		};
		this.updatePreviewScale = function () {
			$('.frame-render .layer-preview').css('background-size', (previewScale * width) + 'px');
		};
		this.updateEditorScale = function () {
			$canvas.parent().parent().css('width', (width * scale) + 'px').css('height', (height * scale) + 'px');
			Main.pencil.updateDisplay();
		};
		
		this.reset = function () {
			
			for(i=0; i<layers.length; i++) {
				layers[i].reset();
			}
			
		};
		
		this.hidePreview = function () {
			
			$('.layer-preview').hide();
			showPreview = false;
			
		};
		this.showPreview = function () {
			
			$('.layer-preview').show();
			showPreview = true;
			
		};
		this.hideEditor = function () {
			
			$canvas.parent().parent().hide();
			showEditor = false;
			
		};
		this.showEditor = function () {
			
			$canvas.parent().parent().show();
			showEditor = true;
			
		};
		
		this.isEditor = function () {return showEditor;};
		this.isPreview = function () {return showPreview;};
		this.previewAll = function () {
			
			if(!showPreview) return;
			
			for(i=0; i<layers.length; i++) {
				layers[i].preview();
			}
			
		};
		
		this.setActiveLayer = function (a) {
			
			if(a instanceof Layer) {
				
				activeLayer.hideActive();
				activeLayer = a;
				activeLayer.showActive();
				$canvas.css('z-index', activeLayer.index);
				context.putImageData(activeLayer.getData(), 0, 0);
				
			}else if(!isNaN(a)) {
				
				activeLayer.hideActive();
				activeLayer = layers[a];
				activeLayer.showActive();
				$canvas.css('z-index', activeLayer.index);
				context.putImageData(activeLayer.getData(), 0, 0);
				
			}
			
		};
		
		function refreshLayersList() {
			
			var cont = $('.panel[name=layers] .container');
			cont.html('');
			
			for(var i=layers.length - 1; i>=0; i--) {
				var l = layers[i];
				l.printIntoPanel();
				if(l == activeLayer)
					l.showActive();
			}
			
		}
		
		this.init = function () {
			
			this.addLayer('Calque 0', context);
			activeLayer = layers[0];
			
			$('.frame-render .layer-preview').css('background-size', (previewScale * scale) + 'px');
			
			$canvas.on('mouseenter', function(e) {	
				Main.pencil.$.show();
			});
			
			$canvas.on('mouseleave', function(e) {	
				Main.pencil.$.hide();
			});
			
			$canvas.on('mousemove', function(e) {	
				Main.pencil.updatePos(e);
				if( Main.pencil.draw() ) {
					activeLayer.updatePixels();
					activeLayer.updatePreviewLink();
				}
				Main.pencil.display();
			});

			$(document).on('mousedown', function(e) {
				Main.pencil.state = 1;
				Main.pencil.updatePos(e);
				if( Main.pencil.draw() ) {
					activeLayer.updatePixels();
					activeLayer.updatePreviewLink();
				}
				Main.pencil.display();
			});

			$(document).on('mouseup', function(e) {
				Main.pencil.state = -1;
				Main.pattern.previewAll();
			});
			
		}
		
		
		
		
		
		
		function Layer(n, i, c) {
			
			this.name = n.replace(' ', '_');
			this.lock = false;
			this.visible = true;
			this.index = i;
			this.context = c;
			this.$lp; // Layer on panel
			this.$ep; // Layer on editor
			this.$pp; // Layer on preview
			
			var data = c.getImageData(0, 0, width, height),
				previewLink;
			
			this.updatePixels = function () {
				data = c.getImageData(0, 0, width, height);
			};
			
			this.updatePreviewLink = function () {
				previewLink = canvas.toDataURL();
			};
			
			this.preview = function () {
				this.$lp.find('.preview').css('background-image', 'url('+ previewLink +')');
				this.$ep.attr('src', previewLink);
				this.$pp.css('background-image', 'url('+ previewLink +')');
			};
			
			this.setIndex = function (i) {
				this.index = i;
				this.$pp.css('z-index', i);
				this.$ep.css('z-index', i);
			};
			this.reset = function () {
				this.updatePixels();
				previewLink = undefined;
				this.$pp.css('background-image', '');
			};
			this.printIntoPanel = function () {
				$('.panel[name=layers] .container').append('<div class="layer" name="' + this.name
														   + '" index="'+ this.index
														   +'"><div class="preview pixelated"></div><h6 class="title">'+ this.name
														   +'</h6></div>');
				this.$lp = $('.panel[name=layers] .container .layer[name='+ this.name +']');
				this.$lp.find('.preview').css('background-image', 'url('+ previewLink +')');
				this.$lp.click(function () {
					Main.pattern.setActiveLayer($(this).attr('index'));
				});
			};
			this.showActive = function () {
				this.$lp.addClass('active');
				this.$ep.hide();
			};
			this.hideActive = function () {
				this.$lp.removeClass('active');
				this.$ep.show();
			};
			this.getData = function () { return data; };
			
			$('.frame-render .panel-canvas .container').append('<img class="layer pixelated" name="' + this.name + '" style="z-index:'+ this.index +';" />');
			$('.frame-render .layer-preview').append('<div class="layer-'+ this.name +'" style="z-index:'+ this.index +';"></div>');
			
			this.$ep = $('.frame-render .panel-canvas .container > img[name='+ this.name +']');
			this.$pp = $('.frame-render .layer-preview .layer-'+ this.name);
			
		}
		
		
		
		
		this.init();
		
	};
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	var Pencil = function (selector) {
		
		this.pos = {x:0, y:0};
		this.realPos = {x:0, y:0};
		this.color = new Color(0,0,0);
		this.alpha = '1';
		this.size = 1;
		this.brush;
		this.activeBrush;
		
		this.active = true;
		this.state = -1; // -1: released, 1: pressed
		
		var $this;
		this.$ = $this = $(selector);
		
		var brushes = {};
		
		this.draw = function() {
			
			if(!this.active || this.state != 1) return false;
			
			var l = Main.pattern.getCurrentLayer(),
				s = Main.pattern.getSize();
			
			if(!(this.activeBrush instanceof Brush) )
				this.selectBrush('default');
			
			if(this.pos.x >= 0 && this.pos.y >= 0 && this.pos.x < s.x && this.pos.y < s.y) {
				
				this.activeBrush.draw(this, l);
				return true;
				
			}else {
				
				return false;
				
			}
			
		};
		
		this.display = function () {
			
			if(!this.active) return;
			
			var l = Main.pattern.getCurrentLayer();
			
			if(!(this.activeBrush instanceof Brush))
				this.selectBrush('default');
			
			this.activeBrush.display(this, Main.pattern.getScale());
			
		};
		
		this.updateDisplay = function () {
			
			this.activeBrush.update(this, Main.pattern.getScale());
			
		};
		
		this.updatePos = function (e) {
			
			var scale = Main.pattern.getScale(),
				p_pos = Main.pattern.getCanvas().offset(),
				mouse = {x:0, y:0},
				realmouse = {x:0, y:0};

			mouse.x = e.pageX - (scale * Main.pencil.size / 2);
			mouse.y = e.pageY - (scale * Main.pencil.size / 2);

			this.pos.x = Math.round((mouse.x - p_pos.left) / scale);
			this.pos.y = Math.round((mouse.y - p_pos.top) / scale);
			
			this.realPos.x = (e.pageX - p_pos.left);
			this.realPos.y = (e.pageY - p_pos.top);
			
		};
		
		this.addBrush = function (name, b) {
			
			if(name === 'default')
				return false;
			
			brushes[name] = b;
			
		};
		
		this.setColor = function (c) {
			this.color = c;
			this.activeBrush.update(this, Main.pattern.getScale());
			$('.frame-tools .panel[name=colorPicker] .color-preview').css('background-color', '#' + this.color.getHexa());
		};
		this.setSize = function (s) {
			
			c_info(s)
			
			if(s === '++')
				this.size++;
			else if(s === '--' && this.size - 1 > 0) {
				this.size--;
				
			}else if(!isNaN(s) && s > 0)
				this.size = s;
			else
				return false;
			
			this.activeBrush.update(this, Main.pattern.getScale());
			return true;
			
		};
		this.setPos = function (x, y) {
			pos.x = x;
			pos.y = y;
		};
		
		this.selectBrush = function (name) {
			
			if(brushes.hasOwnProperty(name)) {
				this.activeBrush = brushes[name];
				this.activeBrush.update(this, Main.pattern.getScale());
				return true;
			}else {
				this.activeBrush = brushes['default'];
				this.activeBrush.update(this, Main.pattern.getScale());
				return false;
			}
			
		};
		
		
		
		
		
		brushes['default'] = new Brush(function (pen, layer) {

			var ct = layer.context;

			ct.beginPath();
			ct.rect(pen.pos.x, pen.pos.y, pen.size, pen.size);
			ct.fillStyle = '#' + pen.color.getHexa();
			ct.globalAlpha = pen.color.a;
			ct.fill();

		}, function (pen, scale) {

			pen.$.css('left', pen.pos.x * scale)
				 .css('top',  pen.pos.y * scale);

		}, function (pen, scale) {
			
			var size = pen.size * scale;
			pen.$.css('width', size + 'px').css('height', size + 'px');
			pen.$.css('background-color', '#' + pen.color.getHexa());
			
		});
		
		this.activeBrush = brushes['default'];
		
		this.activeBrush.update(this, Main.pattern.getScale());
		
		
		
		
		
	};
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	Main.pattern = new Pattern(canvas, 10, 10, 10);
	Main.pencil = new Pencil('.brush');
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	$('.frame-tools .panel[name=layers] .tools > div[action=add]').click(function () {
		Main.pattern.addLayer();
	});
	
	$('.frame-tools .parameter input').on('keydown', onChangeParameter);
	$('.frame-tools .parameter input[type=checkbox]').on('mousedown', onChangeParameter);
	
	$colorPicker = $('#colorpicker').farbtastic(function(color) {
		
		var a = hexaToArray($(this).attr('color')),
			c = new Color(a.r, a.v, a.b, 1);
		
		Main.pencil.setColor(c);
		
	});
	
	$('.frame-tools .panel > h3').click(function(){
		
		$(this).parent().toggleClass('fold');
		
	});
	
	$('.frame-tools .panel[name=colorPicker] .color-grid .color-cell.new').click(newColorCell);
	$('.frame-tools .panel[name=colorPicker] .color-grid').on('click', '.color-cell:not(.new)', function() {
		
		var a = hexaToArray($(this).attr('color')),
			c = new Color(a.r, a.v, a.b, 1);
		
		$.farbtastic($colorPicker).setColor('#' + c.getHexa());
		Main.pencil.setColor(c);
		
	});
	
	
	var button = document.getElementById('btn-download');
	
	button.addEventListener('click', function (e) {
		
		var dataURL = canvas.toDataURL('image/png');
		button.href = dataURL;
		
	});
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	

	
	function newColorCell() {
		
		var cell = '<div class="color-cell" color="#' + Main.pencil.color.getHexa() + '" style="background-color:#' + Main.pencil.color.getHexa() + ';"></div>';
		$('.frame-tools .panel[name=colorPicker] .color-grid').prepend(cell);
		
	}
	
	function hexaToArray(hexa) {
		
		var h = hexa,
			c = {r:0, v:0, b:0, a:0};
		
		if(hexa[0] = "#")
			h = hexa.substr(1);
		
		c.r = h.substr(0, 2);
		c.v = h.substr(2, 2);
		c.b = h.substr(4, 2);
		
		return c;
		
	}
	
	
	
	
	
	function onChangeParameter(e) {
		
		var $this = $(this),
			real_path = $this.parent().attr('name'),
			path = real_path.split('.'),
			value = $this.val(),
			param;
		
		if($this.parent().is('[disabled]'))
			abort();
		
		
		if(e.keyCode === 38) {
			
			value = '++';
			
		}else if(e.keyCode === 40) {
			
			value = '--';
			
		}else if($this.attr('type') === "checkbox") {
			
			value = $this.is(':checked');
			
		}else {
			
			setTimeout(function() {
				
				value = $this.val();
				var rtn = modifyParameter(real_path, value);
				if(!rtn) abort();
				$this.val(value);
				
			}, 10);
			
			return;
			
		}
		
		var rtn = modifyParameter(real_path, value);
		
		if(!rtn.b) abort();
		
		$this.val(rtn.v);
		
		function abort() {
			$this.val(rtn.v);
			c_error(rtn.v);
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
							return {
								b: Main.pattern.setSize(val, val),
								v: Main.pattern.getSize().x
							};
							break;
						case 'scale':
							return {
								b: Main.pattern.setScale(val),
								v: Main.pattern.getScale()
							}
							break;
					}
				
				}else if(path[2] === 'preview') {
					
					switch(path[3]) {
						case 'scale':
							return {
								b: Main.pattern.setPreviewScale(val),
								v: Main.pattern.getPreviewScale()
							}
							break;
					}
					
				}else if(path[2] === 'showEditor') {
					
					if(val)
						Main.pattern.showEditor();
					else
						Main.pattern.hideEditor();
						
					return {
						b: true,
						v: Main.pattern.isEditor()
					}
					
				}else if(path[2] === 'showPreview') {
					
					if(val)
						Main.pattern.showPreview();
					else
						Main.pattern.hidePreview();
						
					return {
						b: true,
						v: Main.pattern.isPreview()
					}
					
				}
				
			} else if(path[1] === 'brush') {
				
				
				switch(path[2]) {
					case 'size':
						return {
							b: Main.pencil.setSize(val),
							v: Main.pencil.size
						}
						break;
				}
				
			}
			
		}
		
		return true;
		
	}
	
	
});