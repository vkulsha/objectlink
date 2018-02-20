"use strict";
var host = location.host;
var domain = "http://"+host+"/";
var currentUser = {uid:0, oid:0, cid:1};

function getWindowHeight(){
   return window.innerHeight||document.documentElement.clientHeight||document.body.clientHeight||0;
}	

function getWindowWidth(){
   return window.innerWidth||document.documentElement.clientWidth||document.body.clientWidth||0;
}	

function openWindow(url, title, params) {
	var w = window.open(url, title, params);
	w.onkeydown = function(e) {
		if (e.keyCode == 27) {
			w.close();
		}
	};
	return w;
}

function cDom(type, innerHTML, parentDom){
	var ret = document.createElement(type);
	if (innerHTML)
		ret.appendChild(typeof(innerHTML)=="object" ? innerHTML : document.createTextNode(innerHTML || ""));
	if (parentDom && ret) parentDom.appendChild(ret);
	return ret;
}

function gDom(id){
	return document.getElementById(id);
}

function cInp(type, innerHTML, parentDom) {
	var el = cDom("INPUT", innerHTML, parentDom);
	el.setAttribute("type", type);
	return el;
}

function orm(fName, fParams, func, funcparams, timeout){
	var ret = Object.create(null);
	var _func = func || function(result){ return result.params.data = result.data; };
	getXmlHttpReq(_func,"php/olp.php",{"f":fName,"p":JSON.stringify(fParams), "u" : currentUser.uid}, !!func, funcparams || ret, timeout || 10000);
	return ret.data;
}

function orma(fName, fParams, func, funcparams, timeout){
	//getXmlHttpReq(func,"php/olp.php",{"f":fName,"p":JSON.stringify(fParams), "u" : currentUser.uid}, true, funcparams);
	orm(fName, fParams, func, funcparams, timeout || 10000);
	return true;
}

function getXmlHttpReq(func, uri, postdata, async, funcparams, timeout, isjson, funcError, funcFinnaly) {
	if (async === undefined) async = true;
	if (isjson === undefined) isjson = true;
	timeout = timeout || 30000;
	var getpost = (uri.indexOf("?")>=0 && !postdata) ? "get" : "post";
	
	var req = null;
	if (window.XMLHttpRequest) {
		try {
			req = new XMLHttpRequest();
		} catch (e){}
	} else if (window.ActiveXObject) {
		try {
			req = new ActiveXObject('Msxml2.XMLHTTP');
		} catch (e){
			try {
				req = new ActiveXObject('Microsoft.XMLHTTP');
			} catch (e){}
		}
	}

	if (req) {
		var formData = new FormData();
		if (postdata){
			for ( var key in postdata ) {
				formData.append(key, postdata[key]);
			}
		}
		if (async) req.timeout = timeout;
		req.open(getpost, encodeURI(uri), async);
		req.onreadystatechange = function(){
			try {
			if (req.readyState == 4) {
				if (req.status == 200) {
					func((isjson ? JSON.parse(req.response) : req.response), funcparams);
				} else {
					console.log("timeout: "+timeout+"; Не удалось получить данные:\n"+req.statusText);
				}
			}
			} catch( e ) {
				if (funcError && typeof funcError == 'function') funcError(e);
			} finally {
				if (funcFinnaly && typeof funcFinnaly == 'function') funcFinnaly();
			}							
		};
		req.ontimeout = function(){ /*func( {data:null, params:{error:"timeout"}} )*/ }
		req.send(getpost=="post" ? formData : null);
	}
	
}

function $_GET(keyname, delimiter, uri){
	var searchline = uri || location.search;
	var search = searchline.split(delimiter || "?")
	search = search.length > 1 ? search[1] : "";
	var params = search.split("&");
	for (var i=0; i < params.length; i++){
		var param = params[i].split("=");
		if (param[0] == keyname){
			return param[1];
		}
	}
	return undefined;
}

function Form(isModal, closeFunc, zIndex, visible, opacity){
	var that = this;
	this.isModal = isModal == null ? true : isModal;
	this.closeFunc = closeFunc;
	this.zIndex = zIndex || 200000;
	this.opacity = opacity || "0.7";
	this.visible = visible;
	this.left = "0px";
	this.width = "0px";
	this.top = "0px";
	this.height = "0px";
	var parentDom = document.body;

	var dom = parentDom.appendChild(cDom("DIV"));
	dom.hidden = !visible;
	dom.style.position = "absolute";
	dom.style.zIndex = this.zIndex;
	dom.style.left = 0;
	dom.style.top = 0;
	dom.style.width = this.isModal ? "100%" : "300px";
	dom.style.height = "100%";
	dom.style.backgroundColor = "rgba(0,0,0,"+this.opacity+")";
	this.dom = dom;
	dom.pushed = false;
	dom.frm = this;
	dom.addEventListener("mousemove", function(e){
		var border = parseInt(getComputedStyle(this).width) - e.clientX;
		if ( border > 0 && border < 20 ){
			dom.style.cursor = "e-resize";
		} else {
			dom.style.cursor = "default";
		}
		if (this.pushed) {
			this.frm.setWidth(e.clientX+20+"px");
		}
	});
	dom.onmousedown = function(e){
		this.pushed = true && this.style.cursor == "e-resize";
	}
	dom.onmouseup = function(e){
		this.pushed = false;
	}
	
	var frm = dom.appendChild(cDom("DIV"));
	this.frm = frm;
	frm.style.overflowY = "scroll";
	frm.style.width = this.isModal ? "100%" : "auto";
	frm.style.height = "100%";
	var frmtb = frm.appendChild(cDom("TABLE"));
	frmtb.style.width = "100%";
	var tr = frmtb.appendChild(cDom("TR"));
	var tdH = tr.appendChild(cDom("TD"));
	var tb = tdH.appendChild(cDom("TABLE"));
	var tr = tb.appendChild(cDom("TR"));
	var td1 = tr.appendChild(cDom("TD"));
	var td2 = tr.appendChild(cDom("TD"));
	var td3 = tr.appendChild(cDom("TD"));
	this.head = tdH;
	
	var bback = td1.appendChild(cDom("BUTTON"));
	bback.innerHTML = "<<";
	bback.hidden = true;
	this.bback = bback;
	var bfront = td1.appendChild(cDom("BUTTON"));
	bfront.innerHTML = ">>";
	bfront.hidden = true;
	this.bfront = bfront;
	
	this.caption = td2.appendChild(cDom("DIV"));
	td2.style.width = "100%";
	td2.style.textAlign = "center";

	var bclose = td3.appendChild(cDom("BUTTON"));
	bclose.innerHTML = "&times";
	bclose.onclick = function() { that.setVisible(false); if (that.closeFunc) that.closeFunc(); }

	//var bminmax = td3.appendChild(cDom("BUTTON"));
	//bminmax.innerHTML = "[]";
	//bminmax.onclick = function() { that.setIsModal(!that.isModal); }
	
	var tr = frmtb.appendChild(cDom("TR"));
	var tdB = tr.appendChild(cDom("TD"));
	this.body = tdB;
	this.body.style.backgroundColor = "rgba(0,0,0,0)";
	this.body.style.margin = "auto";
	this.body.style.padding = "5px 5px 20px 5px";
	this.body.width = "100%";
	
	var tr = frmtb.appendChild(cDom("TR"));
	var tdF = tr.appendChild(cDom("TD"));
	this.foot = tdF;
	
	this.setCloseFunc = function(val) { that.closeFunc = val; return that;}
	this.setVisible = function(val) { that.visible = val; that.dom.hidden = !that.visible; }
	this.getBody = function() { return that.body; }
	this.getDom = function() { return that.frm; }
	this.setWidth = function(val) {	that.width = val; that.frm.style.width = val; if (!that.isModal) that.dom.style.width = val; }
	this.setHeight = function(val) { that.height = val; that.frm.style.height = val; if (!that.isModal) that.dom.style.height = val; }
	this.setTop = function(val) { that.top = val; that.frm.style.top = val; if (!this.isModal) that.dom.style.top = val; }
	this.setLeft = function(val) { that.left = val; that.frm.style.left = val; if (!that.isModal) that.dom.style.left = val; }
	this.getWidth = function(val) {	return (!that.isModal) ? that.dom.style.width : that.frm.style.width; }
	this.getHeight = function(val) { return (!that.isModal) ? that.dom.style.height : that.frm.style.height; }
	this.getTop = function(val) { return (!that.isModal) ? that.dom.style.top : that.frm.style.top; }
	this.getLeft = function(val) { return (!that.isModal) ? that.dom.style.left : that.frm.style.left;  }
	this.setZIndex = function(val) { that.dom.style.zIndex = val; }
	this.setBack = function(val) { bback.onclick = val; }
	this.getBack = function(val) { return bback; }
	this.setFront = function(val) { bfront.onclick = val; }
	this.getFront = function(val) { return bfront;  }
	this.setIsModal = function(val) { 
		that.isModal = val; 
		if (that.isModal) that.dom.style.left = "0px";
		that.dom.style.width = that.isModal ? "100%" : "300px"; 
		that.dom.style.height = "100%"; 
		that.frm.style.width = that.isModal ? "100%" : "auto"; 
		that.frm.style.height = "100%"; 
	}
	this.setCaption = function(val) { that.caption.innerHTML = ""; return that.caption.appendChild(val); }
	this.getCaption = function() { return that.caption; }
	//return that;
	
}

function getIconFile(filename){
	var iconFile = 
		(~filename.indexOf(".pdf")) ? "pdf.png" : 
		(~filename.indexOf(".doc")) ? "word.png" : 
		(~filename.indexOf(".docx")) ? "word.png" : 
		(~filename.indexOf(".xls")) ? "excel.png" : 
		(~filename.indexOf(".xlsx")) ? "excel.png" : 
		(~filename.indexOf(".jpg")) ? "jpg.png" : 
		(~filename.indexOf(".png")) ? "jpg.png" : 
		(~filename.indexOf(".bmp")) ? "jpg.png" : 
		(~filename.indexOf(".PDF")) ? "pdf.png" : 
		(~filename.indexOf(".DOC")) ? "word.png" : 
		(~filename.indexOf(".DOCX")) ? "word.png" : 
		(~filename.indexOf(".XLS")) ? "excel.png" : 
		(~filename.indexOf(".XLSX")) ? "excel.png" : 
		(~filename.indexOf(".JPG")) ? "jpg.png" : 
		(~filename.indexOf(".PNG")) ? "jpg.png" : 
		(~filename.indexOf(".BMP")) ? "jpg.png" : 
		"file.png";
	return "images/"+iconFile;
}

/***	
	return object or array from query-resultset depending on the @query and @type
		@query - string query to a current database through then script - "query2jtml.php"
		@type : ['row2object', 'col2object', 'all2object', 'row2array', 'rows2object', 'row2table', 'col2array', 'all2array']
***/
function getOrmObject(data, type) {
	if (type === undefined) type = null;
	var result = null;
	if (!data) return;
	var columns = data.columns;

	function rows2object() {
		result = [];
		for (var i = 0; i < data.data.length; i++) {
			var row = data.data[i];
			var obj = {};
			for (var j = 0; j < columns.length; j++) {
				var fieldName = columns[j];
				obj[fieldName] = row[columns.indexOf(fieldName)];
			}
			result.push(obj);
		}
	}

	function row2object() {
		result = {};
		
		var value = (data.data.length) ? data.data[0] : undefined;
		if (value) {
		
		for (var i = 0; i < columns.length; i++) {
			var fieldName = columns[i];
			result[fieldName] = value ? value[columns.indexOf(fieldName)] : undefined;
		}		
		} else {result = value};
		
	}
	
	function col2object() {
		result = {};

		data.data.forEach(function(value,ind) {
			result[value[0]] = {"id" : value[0], "ind" : ind};
		})
	}
	
	function all2object() {
		result = {"columns" : columns, "data" : data.data};
	}
	
	function row2array() {
		result = [];
		var value = data.data[0];

		for (var i = 0; i < columns.length; i++) {
			result.push(value[i]);
		}		
	}
	
	function row2table() {
		result = [];
		var value = data.data[0];

		for (var i = 0; i < columns.length; i++) {
			var col = columns[i]
			var val = value[i]
			result.push([col, val]);
		}		
	}

	function col2array(){
		result = [];
		data.data.forEach(function(value, ind) {
			result.push(value[0]);
		})
	}
	
	function all2array() {
		result = data.data;
	}
	
	function all2domtable(){
		result = document.createElement("TABLE");
		var thead = document.createElement("THEAD")
		var tr = document.createElement("TR");
		thead.appendChild(tr);
		
		for (var i=0; i < columns.length; i++){
			var th = document.createElement("TH");
			th.innerHTML = columns[i];
			tr.appendChild(th);
		}
		result.appendChild(thead);
		
		var tbody = document.createElement("TBODY")
		result.appendChild(tbody);

		for (var i=0; i < data.data.length; i++){
			var tr = document.createElement("TR");
			
			for (var j=0; j < data.data[i].length; j++){
				var td = document.createElement("TD");
				td.innerHTML = data.data[i][j];
				tr.appendChild(td);
			}
			tbody.appendChild(tr);
		}
	}
	
	if (type == 'col2array') {
		col2array();
	} else if (type == 'row2array') {
		row2array();
	} else if (type == 'col2object') {
		col2object();
	} else if (type == 'row2object') {
		row2object();
	} else if (type == 'rows2object') {
		rows2object();
	} else if (type == 'row2table') {
		row2table();
	} else if (type == 'all2array') {
		all2array();
	} else if (type == 'all2object') {
		all2object();
	} else if (type == 'all2domtable') {
		all2domtable();
	} else if (data.data.length == 0) {
		all2object();
	} else if (data.data.length == 1) {
		if (type == 'array'){
			row2array();
		} else {
			row2object();
		}
	} else if (columns.length == 1) {
		if (type == 'array'){
			col2array();
		} else {
			col2object();
		}
	} else if (columns.length > 1 && data.data.length > 1){
		if (type == 'array'){
			all2array();
		} else {
			all2object();
		}
	} else {
		result = {};
	}
	
	return result;
}

function getOrmObjectFromQuery(uri, type) {
	if (type === undefined) type = null;
	var result = null;
	try {
	getQueryJson(uri, function(dataJSON) {
		var data = JSON.parse(dataJSON);
		result = getOrmObject(data, type);
	}, false);
	} catch (e){ 
		result = {} 

	} finally {
		return result;
		
	}
};

function obj4arr(arr){//return the object with fields and values from array
	var result = {};
	for (var i = 0; i < arr.length; i++) {
		if (typeof(arr[i]) == 'object') {
			result[arr[i][0]] = arr[i];
		} else {
			result[arr[i]] = arr[i];
		}
	}		
	return result;
}

function hash4arr(arr){//return the object with fields and values from array
	var result = {};
	for (var i = 0; i < arr.length; i++) {
		result[arr[i][0]] = arr[i][1];
	}		
	return result;
}

function decorateArr(arr, decorator1, decorator2){//return the object with fields and values from array
	decorator2 = decorator2 || decorator1;
	return (decorator1+arr.join(decorator2+"|"+decorator1)+decorator2).split("|");
}

function arroundArr(arr, pattern) {
	var ret = [];
	for (var i = 0; i < arr.length; i++) {
		ret.push(pattern.split("$").join(arr[i]));
	}
	return ret;
}

function isArraysIntersect(arr1,arr2) {
	var idx = null;
	for (var i = 0; i < arr2.length; i++) {
		idx = arr1.indexOf(arr2[i]);
		if (idx >= 0) return true;
	}
	return false;
}

function compareObjectArrays(obj1, obj2){
	return ( JSON.stringify(obj1) == JSON.stringify(obj2) );
}

function splitObjectArray(obj1, obj2){
	var result = {};
	var keyOther = "";
	if (!obj1) return result;
	obj2 = obj2 || {"other" : []};
	
	for (var key2 in obj2) {
		result[key2] = [];
		keyOther = (!obj2[key2].length) ? key2 : "";
		for (var i=0; i < obj2[key2].length; i++){
			var key2InObj1 = obj2[key2][i] in obj1;
			if (key2InObj1) {
				for (var j=0; j < obj1[obj2[key2][i]].length; j++ ) {
					result[key2].push(obj1[obj2[key2][i]][j]);
				}
			}
		}
	}
	
	if (keyOther) {
		var keysObj2 = [];
		for (var key2 in obj2) {
			for (var i=0; i < obj2[key2].length; i++ ) {
				keysObj2.push(obj2[key2][i]);
			}
		}
		
		for (var key1 in obj1) {
			if (keysObj2.indexOf(key1)==-1) {
				for (var i=0; i < obj1[key1].length; i++ ) {
					result[keyOther].push(obj1[key1][i]);
				}
			}
		}
	}
	
	return result;
}

/*
Return matrix array as [[1,2,3],[4,5,6]] from line array as [1,2,3,4,5,6]
*/
function lineArray2matrixArray(arr, rows, cols, fill){
	var result = [];
	if (!arr || arr.length == 0) return result;
	
	var ind = 0;
	for (var i=0; i < rows; i++) {
		result[i] = [];
		for (var j=0; j < cols; j++) {
			if (arr[ind])
				result[i].push(arr[ind++])
			else
				result[i].push(fill);
		}
	}
	
	return result;
}

function isObject(val) {
	return val instanceof Object;
}

function isDOM(val) {
	return isObject(val) && val.toString().indexOf('HTML') > 0;
}

function export2Excel(domTable){
	var dom = domTable.cloneNode(true);
	$(dom).find("IMG, DIV.other").each(function(){
		this.remove();
	})
	$(dom).find("TEXTAREA").each(function(){
		this.parentNode.innerHTML = this.innerHTML;
	})
	window.open('data:application/vnd.ms-excel,' + '\uFEFF' + encodeURIComponent(dom.outerHTML));
}

function rgb(r,g,b)
{
	var color = "";
	var aRGB = [r, g, b];

	if(aRGB) {
		for (var i=0;  i<=2; i++) {
			color += aRGB[i].toString(16);
		}
	} 
	color = "#"+color;

	return color;
}

////////////codedecode charset
var t = {};

t['%D0%B0']='%E0';t['%D0%B1']='%E1';t['%D0%B2']='%E2';t['%D0%B3']='%E3';t['%D0%B4']='%E4';
t['%D0%B5']='%E5';t['%D1%91']='%B8';t['%D0%B6']='%E6';t['%D0%B7']='%E7';t['%D0%B8']='%E8';
t['%D0%B9']='%E9';t['%D0%BA']='%EA';t['%D0%BB']='%EB';t['%D0%BC']='%EC';t['%D0%BD']='%ED';
t['%D0%BE']='%EE';t['%D0%BF']='%EF';t['%D1%80']='%F0';t['%D1%81']='%F1';t['%D1%82']='%F2';
t['%D1%83']='%F3';t['%D1%84']='%F4';t['%D1%85']='%F5';t['%D1%86']='%F6';t['%D1%87']='%F7';
t['%D1%88']='%F8';t['%D1%89']='%F9';t['%D1%8C']='%FC';t['%D1%8B']='%FB';t['%D1%8A']='%FA';
t['%D1%8D']='%FD';t['%D1%8E']='%FE';t['%D1%8F']='%FF';t['%D0%90']='%C0';t['%D0%91']='%C1';
t['%D0%92']='%C2';t['%D0%93']='%C3';t['%D0%94']='%C4';t['%D0%95']='%C5';t['%D0%81']='%A8';
t['%D0%96']='%C6';t['%D0%97']='%C7';t['%D0%98']='%C8';t['%D0%99']='%C9';t['%D0%9A']='%CA';
t['%D0%9B']='%CB';t['%D0%9C']='%CC';t['%D0%9D']='%CD';t['%D0%9E']='%CE';t['%D0%9F']='%CF';
t['%D0%A0']='%D0';t['%D0%A1']='%D1';t['%D0%A2']='%D2';t['%D0%A3']='%D3';t['%D0%A4']='%D4';
t['%D0%A5']='%D5';t['%D0%A6']='%D6';t['%D0%A7']='%D7';t['%D0%A8']='%D8';t['%D0%A9']='%D9';
t['%D0%AC']='%DC';t['%D0%AB']='%DB';t['%D0%AA']='%DA';t['%D0%AD']='%DD';t['%D0%AE']='%DE';
t['%D0%AF']='%DF';

var rt = {};

rt['%E0']='%D0%B0';rt['%E1']='%D0%B1';rt['%E2']='%D0%B2';rt['%E3']='%D0%B3';rt['%E4']='%D0%B4';
rt['%E5']='%D0%B5';rt['%B8']='%D1%91';rt['%E6']='%D0%B6';rt['%E7']='%D0%B7';rt['%E8']='%D0%B8';
rt['%E9']='%D0%B9';rt['%EA']='%D0%BA';rt['%EB']='%D0%BB';rt['%EC']='%D0%BC';rt['%ED']='%D0%BD';
rt['%EE']='%D0%BE';rt['%EF']='%D0%BF';rt['%F0']='%D1%80';rt['%F1']='%D1%81';rt['%F2']='%D1%82';
rt['%F3']='%D1%83';rt['%F4']='%D1%84';rt['%F5']='%D1%85';rt['%F6']='%D1%86';rt['%F7']='%D1%87';
rt['%F8']='%D1%88';rt['%F9']='%D1%89';rt['%FC']='%D1%8C';rt['%FB']='%D1%8B';rt['%FA']='%D1%8A';
rt['%FD']='%D1%8D';rt['%FE']='%D1%8E';rt['%FF']='%D1%8F';rt['%C0']='%D0%90';rt['%C1']='%D0%91';
rt['%C2']='%D0%92';rt['%C3']='%D0%93';rt['%C4']='%D0%94';rt['%C5']='%D0%95';rt['%A8']='%D0%81';
rt['%C6']='%D0%96';rt['%C7']='%D0%97';rt['%C8']='%D0%98';rt['%C9']='%D0%99';rt['%CA']='%D0%9A';
rt['%CB']='%D0%9B';rt['%CC']='%D0%9C';rt['%CD']='%D0%9D';rt['%CE']='%D0%9E';rt['%CF']='%D0%9F';
rt['%D0']='%D0%A0';rt['%D1']='%D0%A1';rt['%D2']='%D0%A2';rt['%D3']='%D0%A3';rt['%D4']='%D0%A4';
rt['%D5']='%D0%A5';rt['%D6']='%D0%A6';rt['%D7']='%D0%A7';rt['%D8']='%D0%A8';rt['%D9']='%D0%A9';
rt['%DC']='%D0%AC';rt['%DB']='%D0%AB';rt['%DA']='%D0%AA';rt['%DD']='%D0%AD';rt['%DE']='%D0%AE';
rt['%DF']='%D0%AF';

function convert_to_cp1251(str) {
	var ret='';

	var l=str.length;
	var i=0;
	while (i<l) {

		var f=0;
		for (var keyVar in t) {
			if (str.substring(i,i+6)==keyVar) {ret+=t[keyVar];i+=6;f=1;}
			}

		if (!f) {ret+=str.substring(i,i+1);i++;}
		}

	return ret;
	}

function convert_from_cp1251(str) {
	var ret='';

	var l=str.length;
	var i=0;
	while (i<l) {

		var f=0;
		for (var keyVar in rt) {
			if (str.substring(i,i+3)==keyVar) {ret+=rt[keyVar];i+=3;f=1;}
			}

		if (!f) {ret+=str.substring(i,i+1);i++;}
		}

	return ret;
	}

function urlencode(str) {
    str = (str + '').toString();

    return encodeURIComponent(str).replace(/!/g, '%21').replace(/'/g, '%27').replace(/\(/g, '%28').
    replace(/\)/g, '%29').replace(/\*/g, '%2A');//.replace(/%20/g, '+');
	}

function urldecode (str) {
	var ret;
	try {ret=decodeURIComponent((str + '').replace(/\+/g, '%20'));}
	catch (e) {}
	return ret;
	}
	
function url2cp1251(str) {
	if (str) {
		var arr = str.split("/");
		var val = arr[arr.length-1];
		val = convert_to_cp1251(urlencode(val));
		arr[arr.length-1] = val;
		return (host == "kulsha.ru") ? arr.join("/") : str;
	} else {
		return str;
	}
}
////////

function d2str(d) {
	var dt = d.getFullYear() + ("0"+(d.getMonth()+1)).slice(-2) + ("0" + d.getDate()).slice(-2) + ("0" + d.getHours()).slice(-2) + ("0" + d.getMinutes()).slice(-2) + ("0" + d.getSeconds()).slice(-2);
	return dt
}

function innerTrim(str) {//10K=16ms !!!without defects full clean with first and last spaces
	var s = "";
	var c = "";

	for (var i=0; i < str.length; i++) {
		var isSpace = (str[i] == String.fromCharCode(32) || str[i] == String.fromCharCode(9));
		
		if (isSpace) {
			c = " ";
			if (!s) c = "";
		} else {
			c += str[i];
			s += c;
			c = "";
		}
	}
	
	return s;
}

function findObjVal(obj,val){
	for (var key in obj) {
		if (obj[key] == val) return key;
	}
	
}

function objects2domButtonsTable(arr, func, params){
	var tb = cDom("TABLE");
	for (var i=0; i < arr.length; i++){
		var tr = cDom("TR",null,tb);
		var td = cDom("TD",null,tr);
		var but = cDom("BUTTON");
		td.appendChild(cell);
		func(but, arr[i], params);
	}
	return tb;
}

function clone(obj) {
	if (!Object.assign) {
	  Object.defineProperty(Object, 'assign', {
		enumerable: false,
		configurable: true,
		writable: true,
		value: function(target) {
		  'use strict';
		  if (target === undefined || target === null) {
			throw new TypeError('Cannot convert first argument to object');
		  }

		  var to = Object(target);
		  for (var i = 1; i < arguments.length; i++) {
			var nextSource = arguments[i];
			if (nextSource === undefined || nextSource === null) {
			  continue;
			}
			nextSource = Object(nextSource);

			var keysArray = Object.keys(nextSource);
			for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
			  var nextKey = keysArray[nextIndex];
			  var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
			  if (desc !== undefined && desc.enumerable) {
				to[nextKey] = nextSource[nextKey];
			  }
			}
		  }
		console.log(1);
		  return to;
		}
	  });
	} else {
		return Object.assign({}, obj)
	}
}

function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

