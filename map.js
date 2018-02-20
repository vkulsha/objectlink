"use strict";

function mapInit(map){
	L.EditControl = L.Control.extend({
		options: {
			position: 'topright',
			callback: null,
			kind: '',
			html: ''
		},
		onAdd: function (map) {
			var container = L.DomUtil.create('div', 'leaflet-control leaflet-bar');
			var link = L.DomUtil.create('a', '', container);
			link.href = '#';
			link.title = 'Создать объект ' + this.options.kind;
			link.innerHTML = this.options.html;
			L.DomEvent.on(link, 'click', L.DomEvent.stop)
					  .on(link, 'click', function () {
						currentEditingType = this.options.type;
						window.LAYER = this.options.callback.call(map.editTools);
					  }, this);
			
			return container;
		}
	});
	
	L.NewLineControl = L.EditControl.extend({
		options: {
			position: 'topright',
			callback: map.editTools.startPolyline,
			kind: 'линия',
			type: 'Polyline',
			html: '\\/\\'
		}
	});
	L.NewPolygonControl = L.EditControl.extend({
		options: {
			position: 'topright',
			callback: map.editTools.startPolygon,
			kind: 'полигон',
			type: 'Polygon',
			html: '▰'
		}
	});
	L.NewMarkerControl = L.EditControl.extend({
		options: {
			position: 'topright',
			callback: map.editTools.startMarker,
			kind: 'маркер',
			type: 'Marker',
			html: '🖈'
		}
	});
	L.NewCircleControl = L.EditControl.extend({
		options: {
			position: 'topright',
			callback: map.editTools.startCircle,
			kind: 'круг',
			type: 'Circle',
			html: '⬤'
		}
	});

	var mc = new L.NewMarkerControl();
	var lc = new L.NewLineControl();
	var pc = new L.NewPolygonControl();
	var cc = new L.NewCircleControl();

	L.NewMenuControl = L.Control.extend({
		options: {
			position: 'topright',
			callback: null,
			kind: 'Главное меню',
			imgsrc: 'images/logo.png'
		},
		onAdd: function (map) {
			var container = L.DomUtil.create('div', 'leaflet-control leaflet-bar');
			var link = L.DomUtil.create('a', '', container);
			link.href = '#';
			link.title = 'Главное меню';
			var img = cDom("IMG");
			img.src = this.options.imgsrc;
			img.style.width = "28px";
			link.appendChild(img);
			L.DomEvent.on(link, 'click', L.DomEvent.stop)
					  .on(link, 'click', function () {
						frmMainSetVisibleTrue();
					  }, this);
		
			return container;
		}
	});
	map.addControl(new L.NewMenuControl);

	L.NewPainLayersControl = L.Control.extend({
		options: {
			position: 'topright',
			callback: frmPaintLayers.setVisible,
			kind: 'Слои на карте',
			imgsrc: 'images/layers.png'
		},
		onAdd: function (map) {
			var container = L.DomUtil.create('div', 'leaflet-control leaflet-bar');
			var link = L.DomUtil.create('a', '', container);
			link.href = '#';
			link.title = 'Слои на карте';
			var img = cDom("IMG");
			img.src = this.options.imgsrc;
			img.style.width = "20px";
			link.appendChild(img);
			L.DomEvent.on(link, 'click', L.DomEvent.stop)
					  .on(link, 'click', function () {
						this.options.callback(true);
					  }, this);
		
			return container;
		}
	});
	map.addControl(new L.NewPainLayersControl);
	
	L.NewPaintControl = L.Control.extend({
		options: {
			position: 'topright',
			callback: enableControls,
			kind: 'рисование',
			imgsrc: 'images/paint.png'
		},
		onAdd: function (map) {
			var container = L.DomUtil.create('div', 'leaflet-control leaflet-bar');
			var link = L.DomUtil.create('a', '', container);
			link.href = '#';
			link.title = 'Режим редактирования';
			var img = cDom("IMG");
			img.src = this.options.imgsrc;
			img.style.width = "20px";
			link.appendChild(img);
			L.DomEvent.on(link, 'click', L.DomEvent.stop)
					  .on(link, 'click', function () {
						isPaintMode = !isPaintMode;
						this.options.callback(map, [mc, lc, pc, cc], isPaintMode);
						if (!isPaintMode && currentEditing) currentEditing.disableEdit();

					  }, this);
		
			return container;
		}
	});
	/*if (getPolicy(["cO","cL"]))*/ map.addControl(new L.NewPaintControl);
	
	return	[
	]
}

function enableControls(map, controls, enable){
	if (controls && controls.length){
		controls.forEach(function(ctrl){
			if (enable) {
				map.addControl(ctrl)
			} else {
				ctrl.remove()
			}
		})
	}
}