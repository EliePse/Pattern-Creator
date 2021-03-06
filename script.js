$(function() {
	
	
	
	function c_info(v){console.info(v);}
	function c_error(v){console.error(v);}
	function c_warn(v){console.warn(v);}
	function c_log(v){console.log(v);}
	
	
	
	var canvas = document.getElementById('canvas'),
		ctx = canvas.getContext('2d'),
		$canvas = $('.frame-editor .panel-canvas canvas'),
		$brush = $('.frame-editor .panel-canvas .brush'),
		$colorPicker;
	
	var Main = {
		
		pattern : undefined,
		pencil: undefined
		
	};
	
	var KEYS = {
		ctrl: false
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
	
	var Brush = function(na, dr, di, up) {
		
		c_info(na)
		
		this.name = na;
		this.draw = dr;
		this.display = di;
		this.update = up;
		this.$;
		
		this.active = function (bol) {
			
			if(bol)
				this.$.addClass('active');
			else
				this.$.removeClass('active');
			
		};
		
		$('.frame-tools').append('<div name="'+ this.name +'">'+ this.name[0].toUpperCase() +'</div>');
		this.$ = $('.frame-tools > div[name='+ this.name +']');
		
		this.$.click(function(){
			
			Main.pencil.selectBrush($(this).attr('name'));
			
		});

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
			showPatternPreview = false;
		
		var layers = [],
			activeLayer;
		
		var history = {
			it: 0,
			steps: []
		};
		
		this.addHistory = function() {
			
			history.it = 0;
			
			history.steps.unshift({
				layer: activeLayer,
				data: activeLayer.getData(),
				preview: activeLayer.getPreviewLink()
			});
			
			if(history.steps.length > 10)
				history.steps.pop();
			
		}
		
		this.undo = function() {
			
			history.it++;
			
			if(history.it >= history.steps.length) return;
			
			var step = history.steps[history.it];
			
			step.layer.updatePreviewLink(step.preview);
			step.layer.setData(step.data);
			
			
		}
		
		this.addLayer = function(name, index) {
			
			if(name === '' || name === undefined)
				name = 'Calque ' + layers.length;
			
			index = (activeLayer === undefined) ? 0 : (activeLayer.index);
			
			context.clearRect(0, 0, width, height);
			var l = new Layer(name, index, context);
			
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
		
		this.moveLayer = function (a, b) { // élément A à la place de B
			
			var ia, ib, l_from, l_to;
			
			if(!isNaN(a) && !isNaN(b)) {
				
				ia = a;
				ib = b;
				
			}else {
				
				ia = (isNaN(b)) ? activeLayer.index : b;
				ib = (a === 'down') ? ia - 1 : ia + 1;
				
			}
			
			if(ia < 0 || ia >= layers.length ||
			   ib < 0 || ib >= layers.length)
				return;
			
			l_from = layers[ia];
			l_to = layers[ib];
			
			l_from.setIndex(ib);
			l_to.setIndex(ia);
			
			layers[ib] = l_from;
			layers[ia] = l_to;
			
			refreshLayersList();
			
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
			
			if(y === '++')
				height++;
			else if(y === '--' && height - 1 > 1)
				height--;
			else if(!isNaN(y) && y > 0)
				height = y;
			
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
			$('.frame-editor .layer-preview').css('background-size', (previewScale * width) + 'px');
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
		
		this.hidePatternPreview = function () {
			
			$('.layer-preview').hide();
			showPatternPreview = false;
			
		};
		this.showPatternPreview = function () {
			
			$('.layer-preview').show();
			showPatternPreview = true;
			
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
		this.isPreview = function () {return showPatternPreview;};
		this.previewAll = function () {
			
			for(i=0; i<layers.length; i++) {
				layers[i].preview();
			}
			
			this.addHistory();
			
		};
		this.getLayer = function (i) {
			return layers[i];
		};
		this.setActiveLayer = function (a) {
			
			if(a instanceof Layer) {
				
				activeLayer.hideActive();
				activeLayer = a;
				activeLayer.showActive();
				$canvas.css('z-index', activeLayer.index);
				
			}else if(!isNaN(a)) {
				
				activeLayer.hideActive();
				activeLayer = layers[a];
				activeLayer.showActive();
				$canvas.css('z-index', activeLayer.index);
				
			}
			
		};
		
		this.removeLayer = function (i) {
			
			if(layers.length === 1)
				return;
			
			var l = (i === undefined) ? activeLayer : layers[i],
				index = l.index,
				n_index = (index === 0) ? 1 : index - 1,
				t = [];
			
			l.remove();
			this.setActiveLayer(n_index);
			layers[index] = undefined;
			
			for(i=0; i<layers.length; i++)
				if(layers[i] !== undefined)
					t.push(layers[i]);
			
			layers = t;
					
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
			
			refreshLayersList();
			
		};
		
		this.renameLayer = function (i, name) {
			
			var l = (i === undefined) ? activeLayer : layers[i];
			l.rename(name);
			
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
			this.addHistory();
			
			$('.frame-editor .layer-preview').css('background-size', (previewScale * scale) + 'px');
			
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
			
			$('.frame-render').on('mousedown', function(e) {
				
				var nc = Main.pencil.color,
					lt = Main.pencil.latestColors,
					isNew = true;
				
				for(i=0; i<Main.pencil.latestColors.length; i++) {
					if(lt[i].getHexa() === nc.getHexa()) {
						
						isNew = false;
						
						if(i === 0) break;
						
						var tc = lt[i];
						
						for(j=i;j>0;j--) {
							var a = lt[j - 1];
							lt[j] = a;
						}
						
						lt[0] = tc;
						
						$('.color-grid[name="tools.brush.latest-color"] > div').remove();
						
						for(j=lt.length - 1;j>=0;j--)
							newColorCell('.color-grid[name="tools.brush.latest-color"]', lt[j], 15);
						
						break;
						
					}
				}
				
				if(isNew) {
					newColorCell('.color-grid[name="tools.brush.latest-color"]', nc, 15);
					lt.unshift(nc);
					if(lt.length >= 15)
						lt.pop();
				}
				
			});

			$(document).on('mouseup', function(e) {
				Main.pencil.state = -1;
				Main.pattern.previewAll();
			});
			
		}
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		function Layer(n, i, c) {
			
			this.name = n.replace(' ', '_');
			this.displayName = n;
			this.lock = false;
			this.visible = true;
			this.index = i;
			this.context = c;
			this.$lp; // Layer on panel
			this.$ep; // Layer on editor
			this.$pp; // Layer on preview
			
			var data = c.createImageData(width, height),
				previewLink = canvas.toDataURL();
			
			this.updatePixels = function () {
				data = c.getImageData(0, 0, width, height);
			};
			
			this.updatePreviewLink = function (link) {
				if(link)
					previewLink = link;
				else
					previewLink = canvas.toDataURL();
			};
			
			this.preview = function () {
				this.$lp.find('.preview').css('background-image', 'url('+ previewLink +')');
				this.$ep.attr('src', previewLink);
				if(showPatternPreview) 
					this.$pp.css('background-image', 'url('+ previewLink +')');
			};
			this.getPreviewLink = function () {
				return previewLink;
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
				this.$ep.removeAttr('src');
				
				var lpre = this.$lp.find('.preview'),
					si = {x:30,y:30};
				
				if(width / height >= 1)
					si.y = Math.round((height * si.x) / width);
				else
					si.x = Math.round((width * si.y) / height);
			
				lpre.css('background-image', '')
					.css('width', si.x + 'px')
					.css('height', si.y + 'px');
			
			};
			this.show = function () {
				this.visible = true;
				this.$pp.show();
				if(activeLayer === this) {
					this.$ep.hide();
					printIntoCanvas();
				}else {
					this.$ep.show();
				}
			};
			this.hide = function () {
				this.visible = false;
				this.$pp.hide();
				this.$ep.hide();
				if(activeLayer === this)
					context.clearRect(0,0, width, height);
			};
			this.printIntoPanel = function () {
				$('.panel[name=layers] .container').append('<div class="layer" name="' + this.name
					   + '" index="'+ this.index
					   + '"><input type="checkbox" checked autocomplete="off" />'
					   + '<div class="preview pixelated"></div><h6 class="title">'+ this.displayName
					   + '</h6></div>');
				this.$lp = $('.panel[name=layers] .container .layer[name='+ this.name +']');
				this.$lp.find('.preview').css('background-image', 'url('+ previewLink +')');
				this.$lp.find('input').click(function (e) {
					
					var $this = $(this);
					
					if($this.is(':checked'))
						Main.pattern.getLayer($this.parent().attr('index')).show();
					else
						Main.pattern.getLayer($this.parent().attr('index')).hide();
					
					e.stopPropagation();
					
				});
				this.$lp.click(function () {
					Main.pattern.setActiveLayer($(this).attr('index'));
				});
			};
			this.showActive = function () {
				this.$lp.addClass('active');
				this.$ep.hide();
				if(!this.visible)
					context.clearRect(0,0, width, height);
				else
					printIntoCanvas();
			};
			this.hideActive = function () {
				this.$lp.removeClass('active');
				if(!this.visible) return;
				this.$ep.show();
			};
			this.getData = function () { return data; };
			this.setData = function (d) {
				data = d;
				this.preview();
				if(activeLayer === this)
					printIntoCanvas();
			}
			this.remove = function () {
				context.clearRect(0,0, width, height);
				this.$pp.remove();
				this.$lp.find('.preview').remove();
				this.$ep.remove();
			};
			this.rename = function (n) {
				this.displayName = n;
				this.$lp.find('h6').html(n);
			};
			
			function printIntoCanvas() {
				context.putImageData(data, 0, 0);
			}
			
			$('.frame-editor .panel-canvas .container').append('<img class="layer pixelated" name="' + this.name + '" style="z-index:'+ this.index +';" />');
			$('.frame-editor .layer-preview').append('<div class="layer-'+ this.name +'" style="z-index:'+ this.index +';"></div>');
			
			this.$ep = $('.frame-editor .panel-canvas .container > img[name='+ this.name +']');
			this.$pp = $('.frame-editor .layer-preview .layer-'+ this.name);
			
		}
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		this.init();
		
	};
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	var Pencil = function (selector) {
		
		this.pos = {x:0, y:0};
		this.realPos = {x:0, y:0};
		this.color = new Color('00','00','00');
		this.alpha = '1';
		this.size = 1;
		this.brush;
		this.activeBrush;
		this.latestColors = [this.color];
		
		this.active = true;
		this.state = -1; // -1: released, 1: pressed
		
		var $this;
		this.$ = $this = $(selector);
		
		var brushes = {};
		
		this.draw = function() {
			
			if(!this.active || this.state != 1) return false;
			
			var l = Main.pattern.getCurrentLayer(),
				s = Main.pattern.getSize();
			
			if(!l.visible) return false;
			
			if(!(this.activeBrush instanceof Brush) )
				this.selectBrush('default');
			
			if(this.pos.x >= -this.size && this.pos.y >= -this.size && this.pos.x < s.x + this.size && this.pos.y < s.y + this.size) {
				
				this.activeBrush.draw(this, l);
				return true;
				
			}else {
				
				return false;
				
			}
			
		};
		
		this.display = function () {
			
			if(!this.active) return;
			
			var l = Main.pattern.getCurrentLayer();
			
			if(!l.visible) return false;
			
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
		
		this.addBrush = function (b) {
			
			brushes[b.name] = b;
			
		};
		
		this.setColor = function (c) {
			this.isColorChanged = true;
			this.color = c;
			this.activeBrush.update(this, Main.pattern.getScale());
			$('.frame-param .panel[name=colorPicker] .color-preview').css('background-color', '#' + this.color.getHexa());
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
			
			if(this.activeBrush !== undefined)
				this.activeBrush.active(false);
			
			if(brushes.hasOwnProperty(name)) {
				this.activeBrush = brushes[name];
				this.activeBrush.update(this, Main.pattern.getScale());
				$('.frame-tools > div[name='+ name +']').addClass('active');
				return true;
			}else {
				this.activeBrush = brushes['default'];
				this.activeBrush.update(this, Main.pattern.getScale());
				$('.frame-tools > div[name=default]').addClass('active');
				return false;
			}
			
		};
		
		
		
		
		
		this.addBrush(new Brush('default', function (pen, layer) {

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
			pen.$.css('background-color', '#' + pen.color.getHexa()).css('border', 'none');;
			
		}));
		
		this.selectBrush('default');
		this.activeBrush.update(this, Main.pattern.getScale());
		
		
		
		
		
	};
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	Main.pattern = new Pattern(canvas, 10, 10, 10);
	Main.pencil = new Pencil('.brush');
	
	
	
	
	
	
	
	
	
	
	
	
	
	Main.pencil.addBrush(new Brush('eraser', function (pen, layer) {

		var ct = layer.context;
		ct.clearRect(pen.pos.x, pen.pos.y, pen.size, pen.size);

	}, function (pen, scale) {

		pen.$.css('left', pen.pos.x * scale)
			 .css('top',  pen.pos.y * scale);

	}, function (pen, scale) {

		var size = pen.size * scale;
		pen.$.css('width', size + 'px').css('height', size + 'px');
		pen.$.css('background-color', '#fff').css('border', '1px dashed grey');

	}));

	Main.pencil.addBrush(new Brush('random', function (pen, layer) {

		var ct = layer.context;
		
		ct.beginPath();
		for(i=0; i<pen.size; i++) {
			
			ct.rect(pen.pos.x + Math.round(rand(pen.size + 1)), pen.pos.y + Math.round(rand(pen.size + 1)), 1, 1);
			
		}
		ct.fillStyle = '#' + pen.color.getHexa();
		ct.globalAlpha = pen.color.a;
		ct.fill();

		function rand(lim) {

			if(Math.random() < 0.5)
				return Math.random() * lim;
			else
				return -Math.random() * lim;

		}

	}, function (pen, scale) {

		pen.$.css('left', pen.pos.x * scale)
			 .css('top',  pen.pos.y * scale);

	}, function (pen, scale) {

		var size = pen.size * scale;
		pen.$.css('width', size + 'px').css('height', size + 'px');
		pen.$.css('background-color', '#000').css('border', 'none');

	}));
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	$(document).on('keydown', function(e) {
		
		keepKey(e.keyCode, true);
		
	});
	
	function keepKey(code, bool) {
		
		/* >>> cmd key !
			Firefox: 224
			Opera: 17
			WebKit (Safari/Chrome): 91 (Left Apple) or 93 (Right Apple)
			<<< */
		
		switch(code) {
			case 17:
				KEYS.ctrl = true;
				break;
		}
		
	}
	
	
	$(document).on('keyup', function(e){
		
		switch(e.keyCode) {
			case 66: // B
				Main.pencil.selectBrush('default');
				break;
			case 69: // E
				Main.pencil.selectBrush('eraser');
				break;
			case 90: // Z
				if(KEYS.ctrl) {
					Main.pattern.undo();
					e.preventDefault();
				}
				break;
		}
		
		keepKey(e.keyCode, false);
		
	});
	
	
	
	
	$('.frame-param .panel[name=layers] .tools > div[action=add]').click(function () {
		Main.pattern.addLayer();
	});
	
	$('.frame-param .panel[name=layers] .tools > div[action=delete]').click(function () {
		Main.pattern.removeLayer();
	});
	
	$('.frame-param .panel[name=layers] .tools > div[action=moveup]').click(function () {
		Main.pattern.moveLayer('up');
	});
	
	$('.frame-param .panel[name=layers] .tools > div[action=movedown]').click(function () {
		Main.pattern.moveLayer('down');
	});
	
	$('.frame-param .panel[name=layers] .tools > div[action=rename]').click(function () {
		var n = prompt('Choisissez un nouveau nom', Main.pattern.getCurrentLayer().name);
		if(n === null) return;
		Main.pattern.renameLayer(undefined, n);
	});
	
	$('.frame-param .parameter input').on('keydown', onChangeParameter);
	$('.frame-param .parameter input[type=checkbox]').on('mousedown', onChangeParameter);
	
	$colorPicker = $('#colorpicker').farbtastic(function(color) {
		
		var a = hexaToArray($(this).attr('color')),
			c = new Color(a.r, a.v, a.b, 1);
		
		Main.pencil.setColor(c);
		
	});
	
	$('.frame-param .panel > h3').click(function(){
		
		$(this).parent().toggleClass('fold');
		
	});
	
	$('.frame-param .panel[name=colorPicker] .color-grid .color-cell.new').click(function(){
		newColorCell('.frame-param .panel[name=colorPicker] .color-grid[name="tools.brush.color"]', Main.pencil.color, 45);
	});
	$('.frame-param .panel[name=colorPicker] .color-grid').on('click', '.color-cell:not(.new)', function() {
		
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
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	

	
	function newColorCell(sel, color, limit) {
		
		var $el = $(sel);
		
		if(!isNaN(limit) && limit > 0 && limit <= $el.find('div').length) {
			$el.find(':last-child').remove();
		}
		
		var cell = '<div class="color-cell" color="#' + color.getHexa() + '" style="background-color:#' + color.getHexa() + ';"></div>';
		$el.prepend(cell);
		
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
						case 'width':
							return {
								b: Main.pattern.setSize(val, undefined),
								v: Main.pattern.getSize().x
							};
							break;
						case 'height':
							return {
								b: Main.pattern.setSize(undefined, val),
								v: Main.pattern.getSize().y
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
						Main.pattern.showPatternPreview();
					else
						Main.pattern.hidePatternPreview();
						
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