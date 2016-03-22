/*
dhtmlxScheduler v.4.1.0 Stardard

This software is covered by GPL license. You also can obtain Commercial or Enterprise license to use it in non-GPL project - please contact sales@dhtmlx.com. Usage without proper license is prohibited.

(c) Dinamenta, UAB.
*/
function dtmlXMLLoaderObject(e,t,i,s){return this.xmlDoc="",this.async="undefined"!=typeof i?i:!0,this.onloadAction=e||null,this.mainObject=t||null,this.waitCall=null,this.rSeed=s||!1,this}function callerFunction(e,t){return this.handler=function(i){return i||(i=window.event),e(i,t),!0},this.handler}function getAbsoluteLeft(e){return getOffset(e).left}function getAbsoluteTop(e){return getOffset(e).top}function getOffsetSum(e){for(var t=0,i=0;e;)t+=parseInt(e.offsetTop),i+=parseInt(e.offsetLeft),e=e.offsetParent;
return{top:t,left:i}}function getOffsetRect(e){var t=e.getBoundingClientRect(),i=document.body,s=document.documentElement,n=window.pageYOffset||s.scrollTop||i.scrollTop,r=window.pageXOffset||s.scrollLeft||i.scrollLeft,a=s.clientTop||i.clientTop||0,d=s.clientLeft||i.clientLeft||0,o=t.top+n-a,l=t.left+r-d;return{top:Math.round(o),left:Math.round(l)}}function getOffset(e){return e.getBoundingClientRect?getOffsetRect(e):getOffsetSum(e)}function convertStringToBoolean(e){switch("string"==typeof e&&(e=e.toLowerCase()),e){case"1":case"true":case"yes":case"y":case 1:case!0:return!0;
default:return!1}}function getUrlSymbol(e){return-1!=e.indexOf("?")?"&":"?"}function dhtmlDragAndDropObject(){return window.dhtmlDragAndDrop?window.dhtmlDragAndDrop:(this.lastLanding=0,this.dragNode=0,this.dragStartNode=0,this.dragStartObject=0,this.tempDOMU=null,this.tempDOMM=null,this.waitDrag=0,window.dhtmlDragAndDrop=this,this)}function _dhtmlxError(){return this.catches||(this.catches=[]),this}function dhtmlXHeir(e,t){for(var i in t)"function"==typeof t[i]&&(e[i]=t[i]);return e}function dhtmlxEvent(e,t,i){e.addEventListener?e.addEventListener(t,i,!1):e.attachEvent&&e.attachEvent("on"+t,i)
}function dataProcessor(e){return this.serverProcessor=e,this.action_param="!nativeeditor_status",this.object=null,this.updatedRows=[],this.autoUpdate=!0,this.updateMode="cell",this._tMode="GET",this.post_delim="_",this._waitMode=0,this._in_progress={},this._invalid={},this.mandatoryFields=[],this.messages=[],this.styles={updated:"font-weight:bold;",inserted:"font-weight:bold;",deleted:"text-decoration : line-through;",invalid:"background-color:FFE0E0;",invalid_cell:"border-bottom:2px solid red;",error:"color:red;",clear:"font-weight:normal;text-decoration:none;"},this.enableUTFencoding(!0),dhtmlxEventable(this),this
}window.dhtmlXScheduler=window.scheduler={version:"4.1.0"},window.dhtmlx||(dhtmlx=function(e){for(var t in e)dhtmlx[t]=e[t];return dhtmlx}),dhtmlx.extend_api=function(e,t,i){var s=window[e];s&&(window[e]=function(e){var i;if(e&&"object"==typeof e&&!e.tagName){i=s.apply(this,t._init?t._init(e):arguments);for(var n in dhtmlx)t[n]&&this[t[n]](dhtmlx[n]);for(var n in e)t[n]?this[t[n]](e[n]):0===n.indexOf("on")&&this.attachEvent(n,e[n])}else i=s.apply(this,arguments);return t._patch&&t._patch(this),i||this
},window[e].prototype=s.prototype,i&&dhtmlXHeir(window[e].prototype,i))},dhtmlxAjax={get:function(e,t){var i=new dtmlXMLLoaderObject(!0);return i.async=arguments.length<3,i.waitCall=t,i.loadXML(e),i},post:function(e,t,i){var s=new dtmlXMLLoaderObject(!0);return s.async=arguments.length<4,s.waitCall=i,s.loadXML(e,!0,t),s},getSync:function(e){return this.get(e,null,!0)},postSync:function(e,t){return this.post(e,t,null,!0)}},dtmlXMLLoaderObject.count=0,dtmlXMLLoaderObject.prototype.waitLoadFunction=function(e){var t=!0;
return this.check=function(){if(e&&e.onloadAction&&(!e.xmlDoc.readyState||4==e.xmlDoc.readyState)){if(!t)return;t=!1,dtmlXMLLoaderObject.count++,"function"==typeof e.onloadAction&&e.onloadAction(e.mainObject,null,null,null,e),e.waitCall&&(e.waitCall.call(this,e),e.waitCall=null)}},this.check},dtmlXMLLoaderObject.prototype.getXMLTopNode=function(e,t){var i;if(this.xmlDoc.responseXML){var s=this.xmlDoc.responseXML.getElementsByTagName(e);if(0===s.length&&-1!=e.indexOf(":"))var s=this.xmlDoc.responseXML.getElementsByTagName(e.split(":")[1]);
i=s[0]}else i=this.xmlDoc.documentElement;if(i)return this._retry=!1,i;if(!this._retry&&_isIE){this._retry=!0;var t=this.xmlDoc;return this.loadXMLString(this.xmlDoc.responseText.replace(/^[\s]+/,""),!0),this.getXMLTopNode(e,t)}return dhtmlxError.throwError("LoadXML","Incorrect XML",[t||this.xmlDoc,this.mainObject]),document.createElement("DIV")},dtmlXMLLoaderObject.prototype.loadXMLString=function(e,t){if(_isIE)this.xmlDoc=new ActiveXObject("Microsoft.XMLDOM"),this.xmlDoc.async=this.async,this.xmlDoc.onreadystatechange=function(){},this.xmlDoc.loadXML(e);
else{var i=new DOMParser;this.xmlDoc=i.parseFromString(e,"text/xml")}t||(this.onloadAction&&this.onloadAction(this.mainObject,null,null,null,this),this.waitCall&&(this.waitCall(),this.waitCall=null))},dtmlXMLLoaderObject.prototype.loadXML=function(e,t,i,s){this.rSeed&&(e+=(-1!=e.indexOf("?")?"&":"?")+"a_dhx_rSeed="+(new Date).valueOf()),this.filePath=e,this.xmlDoc=!_isIE&&window.XMLHttpRequest?new XMLHttpRequest:new ActiveXObject("Microsoft.XMLHTTP"),this.async&&(this.xmlDoc.onreadystatechange=new this.waitLoadFunction(this)),this.xmlDoc.open(t?"POST":"GET",e,this.async),s?(this.xmlDoc.setRequestHeader("User-Agent","dhtmlxRPC v0.1 ("+navigator.userAgent+")"),this.xmlDoc.setRequestHeader("Content-type","text/xml")):t&&this.xmlDoc.setRequestHeader("Content-type","application/x-www-form-urlencoded"),this.xmlDoc.setRequestHeader("X-Requested-With","XMLHttpRequest"),this.xmlDoc.send(null||i),this.async||new this.waitLoadFunction(this)()
},dtmlXMLLoaderObject.prototype.destructor=function(){return this._filterXPath=null,this._getAllNamedChilds=null,this._retry=null,this.async=null,this.rSeed=null,this.filePath=null,this.onloadAction=null,this.mainObject=null,this.xmlDoc=null,this.doXPath=null,this.doXPathOpera=null,this.doXSLTransToObject=null,this.doXSLTransToString=null,this.loadXML=null,this.loadXMLString=null,this.doSerialization=null,this.xmlNodeToJSON=null,this.getXMLTopNode=null,this.setXSLParamValue=null,null},dtmlXMLLoaderObject.prototype.xmlNodeToJSON=function(e){for(var t={},i=0;i<e.attributes.length;i++)t[e.attributes[i].name]=e.attributes[i].value;
t._tagvalue=e.firstChild?e.firstChild.nodeValue:"";for(var i=0;i<e.childNodes.length;i++){var s=e.childNodes[i].tagName;s&&(t[s]||(t[s]=[]),t[s].push(this.xmlNodeToJSON(e.childNodes[i])))}return t},dhtmlDragAndDropObject.prototype.removeDraggableItem=function(e){e.onmousedown=null,e.dragStarter=null,e.dragLanding=null},dhtmlDragAndDropObject.prototype.addDraggableItem=function(e,t){e.onmousedown=this.preCreateDragCopy,e.dragStarter=t,this.addDragLanding(e,t)},dhtmlDragAndDropObject.prototype.addDragLanding=function(e,t){e.dragLanding=t
},dhtmlDragAndDropObject.prototype.preCreateDragCopy=function(e){return!e&&!window.event||2!=(e||event).button?window.dhtmlDragAndDrop.waitDrag?(window.dhtmlDragAndDrop.waitDrag=0,document.body.onmouseup=window.dhtmlDragAndDrop.tempDOMU,document.body.onmousemove=window.dhtmlDragAndDrop.tempDOMM,!1):(window.dhtmlDragAndDrop.dragNode&&window.dhtmlDragAndDrop.stopDrag(e),window.dhtmlDragAndDrop.waitDrag=1,window.dhtmlDragAndDrop.tempDOMU=document.body.onmouseup,window.dhtmlDragAndDrop.tempDOMM=document.body.onmousemove,window.dhtmlDragAndDrop.dragStartNode=this,window.dhtmlDragAndDrop.dragStartObject=this.dragStarter,document.body.onmouseup=window.dhtmlDragAndDrop.preCreateDragCopy,document.body.onmousemove=window.dhtmlDragAndDrop.callDrag,window.dhtmlDragAndDrop.downtime=(new Date).valueOf(),e&&e.preventDefault?(e.preventDefault(),!1):!1):void 0
},dhtmlDragAndDropObject.prototype.callDrag=function(e){e||(e=window.event);var t=window.dhtmlDragAndDrop;if(!((new Date).valueOf()-t.downtime<100)){if(!t.dragNode){if(!t.waitDrag)return t.stopDrag(e,!0);if(t.dragNode=t.dragStartObject._createDragNode(t.dragStartNode,e),!t.dragNode)return t.stopDrag();t.dragNode.onselectstart=function(){return!1},t.gldragNode=t.dragNode,document.body.appendChild(t.dragNode),document.body.onmouseup=t.stopDrag,t.waitDrag=0,t.dragNode.pWindow=window,t.initFrameRoute()
}if(t.dragNode.parentNode!=window.document.body&&t.gldragNode){var i=t.gldragNode;t.gldragNode.old&&(i=t.gldragNode.old),i.parentNode.removeChild(i);var s=t.dragNode.pWindow;if(i.pWindow&&i.pWindow.dhtmlDragAndDrop.lastLanding&&i.pWindow.dhtmlDragAndDrop.lastLanding.dragLanding._dragOut(i.pWindow.dhtmlDragAndDrop.lastLanding),_isIE){var n=document.createElement("Div");n.innerHTML=t.dragNode.outerHTML,t.dragNode=n.childNodes[0]}else t.dragNode=t.dragNode.cloneNode(!0);t.dragNode.pWindow=window,t.gldragNode.old=t.dragNode,document.body.appendChild(t.dragNode),s.dhtmlDragAndDrop.dragNode=t.dragNode
}t.dragNode.style.left=e.clientX+15+(t.fx?-1*t.fx:0)+(document.body.scrollLeft||document.documentElement.scrollLeft)+"px",t.dragNode.style.top=e.clientY+3+(t.fy?-1*t.fy:0)+(document.body.scrollTop||document.documentElement.scrollTop)+"px";var r;r=e.srcElement?e.srcElement:e.target,t.checkLanding(r,e)}},dhtmlDragAndDropObject.prototype.calculateFramePosition=function(e){if(window.name){for(var t=parent.frames[window.name].frameElement.offsetParent,i=0,s=0;t;)i+=t.offsetLeft,s+=t.offsetTop,t=t.offsetParent;
if(parent.dhtmlDragAndDrop){var n=parent.dhtmlDragAndDrop.calculateFramePosition(1);i+=1*n.split("_")[0],s+=1*n.split("_")[1]}if(e)return i+"_"+s;this.fx=i,this.fy=s}return"0_0"},dhtmlDragAndDropObject.prototype.checkLanding=function(e,t){e&&e.dragLanding?(this.lastLanding&&this.lastLanding.dragLanding._dragOut(this.lastLanding),this.lastLanding=e,this.lastLanding=this.lastLanding.dragLanding._dragIn(this.lastLanding,this.dragStartNode,t.clientX,t.clientY,t),this.lastLanding_scr=_isIE?t.srcElement:t.target):e&&"BODY"!=e.tagName?this.checkLanding(e.parentNode,t):(this.lastLanding&&this.lastLanding.dragLanding._dragOut(this.lastLanding,t.clientX,t.clientY,t),this.lastLanding=0,this._onNotFound&&this._onNotFound())
},dhtmlDragAndDropObject.prototype.stopDrag=function(e,t){var i=window.dhtmlDragAndDrop;if(!t){i.stopFrameRoute();var s=i.lastLanding;i.lastLanding=null,s&&s.dragLanding._drag(i.dragStartNode,i.dragStartObject,s,_isIE?event.srcElement:e.target)}i.lastLanding=null,i.dragNode&&i.dragNode.parentNode==document.body&&i.dragNode.parentNode.removeChild(i.dragNode),i.dragNode=0,i.gldragNode=0,i.fx=0,i.fy=0,i.dragStartNode=0,i.dragStartObject=0,document.body.onmouseup=i.tempDOMU,document.body.onmousemove=i.tempDOMM,i.tempDOMU=null,i.tempDOMM=null,i.waitDrag=0
},dhtmlDragAndDropObject.prototype.stopFrameRoute=function(e){e&&window.dhtmlDragAndDrop.stopDrag(1,1);for(var t=0;t<window.frames.length;t++)try{window.frames[t]!=e&&window.frames[t].dhtmlDragAndDrop&&window.frames[t].dhtmlDragAndDrop.stopFrameRoute(window)}catch(i){}try{parent.dhtmlDragAndDrop&&parent!=window&&parent!=e&&parent.dhtmlDragAndDrop.stopFrameRoute(window)}catch(i){}},dhtmlDragAndDropObject.prototype.initFrameRoute=function(e,t){e&&(window.dhtmlDragAndDrop.preCreateDragCopy(),window.dhtmlDragAndDrop.dragStartNode=e.dhtmlDragAndDrop.dragStartNode,window.dhtmlDragAndDrop.dragStartObject=e.dhtmlDragAndDrop.dragStartObject,window.dhtmlDragAndDrop.dragNode=e.dhtmlDragAndDrop.dragNode,window.dhtmlDragAndDrop.gldragNode=e.dhtmlDragAndDrop.dragNode,window.document.body.onmouseup=window.dhtmlDragAndDrop.stopDrag,window.waitDrag=0,!_isIE&&t&&(!_isFF||1.8>_FFrv)&&window.dhtmlDragAndDrop.calculateFramePosition());
try{parent.dhtmlDragAndDrop&&parent!=window&&parent!=e&&parent.dhtmlDragAndDrop.initFrameRoute(window)}catch(i){}for(var s=0;s<window.frames.length;s++)try{window.frames[s]!=e&&window.frames[s].dhtmlDragAndDrop&&window.frames[s].dhtmlDragAndDrop.initFrameRoute(window,!e||t?1:0)}catch(i){}},_isFF=!1,_isIE=!1,_isOpera=!1,_isKHTML=!1,_isMacOS=!1,_isChrome=!1,_FFrv=!1,_KHTMLrv=!1,_OperaRv=!1,-1!=navigator.userAgent.indexOf("Macintosh")&&(_isMacOS=!0),navigator.userAgent.toLowerCase().indexOf("chrome")>-1&&(_isChrome=!0),-1!=navigator.userAgent.indexOf("Safari")||-1!=navigator.userAgent.indexOf("Konqueror")?(_KHTMLrv=parseFloat(navigator.userAgent.substr(navigator.userAgent.indexOf("Safari")+7,5)),_KHTMLrv>525?(_isFF=!0,_FFrv=1.9):_isKHTML=!0):-1!=navigator.userAgent.indexOf("Opera")?(_isOpera=!0,_OperaRv=parseFloat(navigator.userAgent.substr(navigator.userAgent.indexOf("Opera")+6,3))):-1!=navigator.appName.indexOf("Microsoft")?(_isIE=!0,-1==navigator.appVersion.indexOf("MSIE 8.0")&&-1==navigator.appVersion.indexOf("MSIE 9.0")&&-1==navigator.appVersion.indexOf("MSIE 10.0")||"BackCompat"==document.compatMode||(_isIE=8)):"Netscape"==navigator.appName&&-1!=navigator.userAgent.indexOf("Trident")?_isIE=8:(_isFF=!0,_FFrv=parseFloat(navigator.userAgent.split("rv:")[1])),dtmlXMLLoaderObject.prototype.doXPath=function(e,t,i,s){if(_isKHTML||!_isIE&&!window.XPathResult)return this.doXPathOpera(e,t);
if(_isIE)return t||(t=this.xmlDoc.nodeName?this.xmlDoc:this.xmlDoc.responseXML),t||dhtmlxError.throwError("LoadXML","Incorrect XML",[t||this.xmlDoc,this.mainObject]),i&&t.setProperty("SelectionNamespaces","xmlns:xsl='"+i+"'"),"single"==s?t.selectSingleNode(e):t.selectNodes(e)||new Array(0);var n=t;t||(t=this.xmlDoc.nodeName?this.xmlDoc:this.xmlDoc.responseXML),t||dhtmlxError.throwError("LoadXML","Incorrect XML",[t||this.xmlDoc,this.mainObject]),-1!=t.nodeName.indexOf("document")?n=t:(n=t,t=t.ownerDocument);
var r=XPathResult.ANY_TYPE;"single"==s&&(r=XPathResult.FIRST_ORDERED_NODE_TYPE);var a=[],d=t.evaluate(e,n,function(){return i},r,null);if(r==XPathResult.FIRST_ORDERED_NODE_TYPE)return d.singleNodeValue;for(var o=d.iterateNext();o;)a[a.length]=o,o=d.iterateNext();return a},_dhtmlxError.prototype.catchError=function(e,t){this.catches[e]=t},_dhtmlxError.prototype.throwError=function(e,t,i){return this.catches[e]?this.catches[e](e,t,i):this.catches.ALL?this.catches.ALL(e,t,i):(window.alert("Error type: "+arguments[0]+"\nDescription: "+arguments[1]),null)
},window.dhtmlxError=new _dhtmlxError,dtmlXMLLoaderObject.prototype.doXPathOpera=function(e,t){var i=e.replace(/[\/]+/gi,"/").split("/"),s=null,n=1;if(!i.length)return[];if("."==i[0])s=[t];else{if(""!==i[0])return[];s=(this.xmlDoc.responseXML||this.xmlDoc).getElementsByTagName(i[n].replace(/\[[^\]]*\]/g,"")),n++}for(n;n<i.length;n++)s=this._getAllNamedChilds(s,i[n]);return-1!=i[n-1].indexOf("[")&&(s=this._filterXPath(s,i[n-1])),s},dtmlXMLLoaderObject.prototype._filterXPath=function(e,t){for(var i=[],t=t.replace(/[^\[]*\[\@/g,"").replace(/[\[\]\@]*/g,""),s=0;s<e.length;s++)e[s].getAttribute(t)&&(i[i.length]=e[s]);
return i},dtmlXMLLoaderObject.prototype._getAllNamedChilds=function(e,t){var i=[];_isKHTML&&(t=t.toUpperCase());for(var s=0;s<e.length;s++)for(var n=0;n<e[s].childNodes.length;n++)_isKHTML?e[s].childNodes[n].tagName&&e[s].childNodes[n].tagName.toUpperCase()==t&&(i[i.length]=e[s].childNodes[n]):e[s].childNodes[n].tagName==t&&(i[i.length]=e[s].childNodes[n]);return i},dtmlXMLLoaderObject.prototype.xslDoc=null,dtmlXMLLoaderObject.prototype.setXSLParamValue=function(e,t,i){i||(i=this.xslDoc),i.responseXML&&(i=i.responseXML);
var s=this.doXPath("/xsl:stylesheet/xsl:variable[@name='"+e+"']",i,"http://www.w3.org/1999/XSL/Transform","single");s&&(s.firstChild.nodeValue=t)},dtmlXMLLoaderObject.prototype.doXSLTransToObject=function(e,t){e||(e=this.xslDoc),e.responseXML&&(e=e.responseXML),t||(t=this.xmlDoc),t.responseXML&&(t=t.responseXML);var i;if(_isIE){i=new ActiveXObject("Msxml2.DOMDocument.3.0");try{t.transformNodeToObject(e,i)}catch(s){i=t.transformNode(e)}}else this.XSLProcessor||(this.XSLProcessor=new XSLTProcessor,this.XSLProcessor.importStylesheet(e)),i=this.XSLProcessor.transformToDocument(t);
return i},dtmlXMLLoaderObject.prototype.doXSLTransToString=function(e,t){var i=this.doXSLTransToObject(e,t);return"string"==typeof i?i:this.doSerialization(i)},dtmlXMLLoaderObject.prototype.doSerialization=function(e){if(e||(e=this.xmlDoc),e.responseXML&&(e=e.responseXML),_isIE)return e.xml;var t=new XMLSerializer;return t.serializeToString(e)},dhtmlxEventable=function(obj){obj.attachEvent=function(e,t,i){return e="ev_"+e.toLowerCase(),this[e]||(this[e]=new this.eventCatcher(i||this)),e+":"+this[e].addEvent(t)
},obj.callEvent=function(e,t){return e="ev_"+e.toLowerCase(),this[e]?this[e].apply(this,t):!0},obj.checkEvent=function(e){return!!this["ev_"+e.toLowerCase()]},obj.eventCatcher=function(obj){var dhx_catch=[],z=function(){for(var e=!0,t=0;t<dhx_catch.length;t++)if(dhx_catch[t]){var i=dhx_catch[t].apply(obj,arguments);e=e&&i}return e};return z.addEvent=function(ev){return"function"!=typeof ev&&(ev=eval(ev)),ev?dhx_catch.push(ev)-1:!1},z.removeEvent=function(e){dhx_catch[e]=null},z},obj.detachEvent=function(e){if(e){var t=e.split(":");
this[t[0]].removeEvent(t[1])}},obj.detachAllEvents=function(){for(var e in this)0===e.indexOf("ev_")&&(this.detachEvent(e),this[e]=null)},obj=null},window.dhtmlx||(window.dhtmlx={}),function(){function e(e,t){var s=e.callback;i(!1),e.box.parentNode.removeChild(e.box),c=e.box=null,s&&s(t)}function t(t){if(c){t=t||event;var i=t.which||event.keyCode;return dhtmlx.message.keyboard&&((13==i||32==i)&&e(c,!0),27==i&&e(c,!1)),t.preventDefault&&t.preventDefault(),!(t.cancelBubble=!0)}}function i(e){i.cover||(i.cover=document.createElement("DIV"),i.cover.onkeydown=t,i.cover.className="dhx_modal_cover",document.body.appendChild(i.cover));
document.body.scrollHeight;i.cover.style.display=e?"inline-block":"none"}function s(e,t,i){var s=i?i:e||"",n="dhtmlx_"+s.toLowerCase().replace(/ /g,"_")+"_button";return"<div class='dhtmlx_popup_button "+n+"' result='"+t+"' ><div>"+e+"</div></div>"}function n(e){u.area||(u.area=document.createElement("DIV"),u.area.className="dhtmlx_message_area",u.area.style[u.position]="5px",document.body.appendChild(u.area)),u.hide(e.id);var t=document.createElement("DIV");return t.innerHTML="<div>"+e.text+"</div>",t.className="dhtmlx-info dhtmlx-"+e.type,t.onclick=function(){u.hide(e.id),e=null
},"bottom"==u.position&&u.area.firstChild?u.area.insertBefore(t,u.area.firstChild):u.area.appendChild(t),e.expire>0&&(u.timers[e.id]=window.setTimeout(function(){u.hide(e.id)},e.expire)),u.pull[e.id]=t,t=null,e.id}function r(t,i,n){var r=document.createElement("DIV");r.className=" dhtmlx_modal_box dhtmlx-"+t.type,r.setAttribute("dhxbox",1);var a="";if(t.width&&(r.style.width=t.width),t.height&&(r.style.height=t.height),t.title&&(a+='<div class="dhtmlx_popup_title">'+t.title+"</div>"),a+='<div class="dhtmlx_popup_text"><span>'+(t.content?"":t.text)+'</span></div><div  class="dhtmlx_popup_controls">',i){var d=t.ok||scheduler.locale.labels.message_ok;
void 0===d&&(d="OK"),a+=s(d,!0,"ok")}if(n){var o=t.cancel||scheduler.locale.labels.message_cancel;void 0===o&&(o="Cancel"),a+=s(o,!1,"cancel")}if(t.buttons)for(var l=0;l<t.buttons.length;l++)a+=s(t.buttons[l],l);if(a+="</div>",r.innerHTML=a,t.content){var h=t.content;"string"==typeof h&&(h=document.getElementById(h)),"none"==h.style.display&&(h.style.display=""),r.childNodes[t.title?1:0].appendChild(h)}return r.onclick=function(i){i=i||event;var s=i.target||i.srcElement;if(s.className||(s=s.parentNode),"dhtmlx_popup_button"==s.className.split(" ")[0]){var n=s.getAttribute("result");
n="true"==n||("false"==n?!1:n),e(t,n)}},t.box=r,(i||n)&&(c=t),r}function a(e,s,n){var a=e.tagName?e:r(e,s,n);e.hidden||i(!0),document.body.appendChild(a);var d=Math.abs(Math.floor(((window.innerWidth||document.documentElement.offsetWidth)-a.offsetWidth)/2)),o=Math.abs(Math.floor(((window.innerHeight||document.documentElement.offsetHeight)-a.offsetHeight)/2));return a.style.top="top"==e.position?"-3px":o+"px",a.style.left=d+"px",a.onkeydown=t,a.focus(),e.hidden&&dhtmlx.modalbox.hide(a),a}function d(e){return a(e,!0,!1)
}function o(e){return a(e,!0,!0)}function l(e){return a(e)}function h(e,t,i){return"object"!=typeof e&&("function"==typeof t&&(i=t,t=""),e={text:e,type:t,callback:i}),e}function _(e,t,i,s){return"object"!=typeof e&&(e={text:e,type:t,expire:i,id:s}),e.id=e.id||u.uid(),e.expire=e.expire||u.expire,e}var c=null;document.attachEvent?document.attachEvent("onkeydown",t):document.addEventListener("keydown",t,!0),dhtmlx.alert=function(){var e=h.apply(this,arguments);return e.type=e.type||"confirm",d(e)},dhtmlx.confirm=function(){var e=h.apply(this,arguments);
return e.type=e.type||"alert",o(e)},dhtmlx.modalbox=function(){var e=h.apply(this,arguments);return e.type=e.type||"alert",l(e)},dhtmlx.modalbox.hide=function(e){for(;e&&e.getAttribute&&!e.getAttribute("dhxbox");)e=e.parentNode;e&&(e.parentNode.removeChild(e),i(!1))};var u=dhtmlx.message=function(e){e=_.apply(this,arguments),e.type=e.type||"info";var t=e.type.split("-")[0];switch(t){case"alert":return d(e);case"confirm":return o(e);case"modalbox":return l(e);default:return n(e)}};u.seed=(new Date).valueOf(),u.uid=function(){return u.seed++
},u.expire=4e3,u.keyboard=!0,u.position="top",u.pull={},u.timers={},u.hideAll=function(){for(var e in u.pull)u.hide(e)},u.hide=function(e){var t=u.pull[e];t&&t.parentNode&&(window.setTimeout(function(){t.parentNode.removeChild(t),t=null},2e3),t.className+=" hidden",u.timers[e]&&window.clearTimeout(u.timers[e]),delete u.pull[e])}}(),dataProcessor.prototype={setTransactionMode:function(e,t){this._tMode=e,this._tSend=t},escape:function(e){return this._utf?encodeURIComponent(e):escape(e)},enableUTFencoding:function(e){this._utf=convertStringToBoolean(e)
},setDataColumns:function(e){this._columns="string"==typeof e?e.split(","):e},getSyncState:function(){return!this.updatedRows.length},enableDataNames:function(e){this._endnm=convertStringToBoolean(e)},enablePartialDataSend:function(e){this._changed=convertStringToBoolean(e)},setUpdateMode:function(e,t){this.autoUpdate="cell"==e,this.updateMode=e,this.dnd=t},ignore:function(e,t){this._silent_mode=!0,e.call(t||window),this._silent_mode=!1},setUpdated:function(e,t,i){if(!this._silent_mode){var s=this.findRow(e);
i=i||"updated";var n=this.obj.getUserData(e,this.action_param);n&&"updated"==i&&(i=n),t?(this.set_invalid(e,!1),this.updatedRows[s]=e,this.obj.setUserData(e,this.action_param,i),this._in_progress[e]&&(this._in_progress[e]="wait")):this.is_invalid(e)||(this.updatedRows.splice(s,1),this.obj.setUserData(e,this.action_param,"")),t||this._clearUpdateFlag(e),this.markRow(e,t,i),t&&this.autoUpdate&&this.sendData(e)}},_clearUpdateFlag:function(){},markRow:function(e,t,i){var s="",n=this.is_invalid(e);if(n&&(s=this.styles[n],t=!0),this.callEvent("onRowMark",[e,t,i,n])&&(s=this.styles[t?i:"clear"]+s,this.obj[this._methods[0]](e,s),n&&n.details)){s+=this.styles[n+"_cell"];
for(var r=0;r<n.details.length;r++)n.details[r]&&this.obj[this._methods[1]](e,r,s)}},getState:function(e){return this.obj.getUserData(e,this.action_param)},is_invalid:function(e){return this._invalid[e]},set_invalid:function(e,t,i){i&&(t={value:t,details:i,toString:function(){return this.value.toString()}}),this._invalid[e]=t},checkBeforeUpdate:function(){return!0},sendData:function(e){return!this._waitMode||"tree"!=this.obj.mytype&&!this.obj._h2?(this.obj.editStop&&this.obj.editStop(),"undefined"==typeof e||this._tSend?this.sendAllData():this._in_progress[e]?!1:(this.messages=[],!this.checkBeforeUpdate(e)&&this.callEvent("onValidationError",[e,this.messages])?!1:void this._beforeSendData(this._getRowData(e),e))):void 0
},_beforeSendData:function(e,t){return this.callEvent("onBeforeUpdate",[t,this.getState(t),e])?void this._sendData(e,t):!1},serialize:function(e,t){if("string"==typeof e)return e;if("undefined"!=typeof t)return this.serialize_one(e,"");var i=[],s=[];for(var n in e)e.hasOwnProperty(n)&&(i.push(this.serialize_one(e[n],n+this.post_delim)),s.push(n));return i.push("ids="+this.escape(s.join(","))),dhtmlx.security_key&&i.push("dhx_security="+dhtmlx.security_key),i.join("&")},serialize_one:function(e,t){if("string"==typeof e)return e;
var i=[];for(var s in e)e.hasOwnProperty(s)&&i.push(this.escape((t||"")+s)+"="+this.escape(e[s]));return i.join("&")},_sendData:function(e,t){if(e){if(!this.callEvent("onBeforeDataSending",t?[t,this.getState(t),e]:[null,null,e]))return!1;t&&(this._in_progress[t]=(new Date).valueOf());var i=new dtmlXMLLoaderObject(this.afterUpdate,this,!0),s=this.serverProcessor+(this._user?getUrlSymbol(this.serverProcessor)+["dhx_user="+this._user,"dhx_version="+this.obj.getUserData(0,"version")].join("&"):"");"POST"!=this._tMode?i.loadXML(s+(-1!=s.indexOf("?")?"&":"?")+this.serialize(e,t)):i.loadXML(s,!0,this.serialize(e,t)),this._waitMode++
}},sendAllData:function(){if(this.updatedRows.length){this.messages=[];for(var e=!0,t=0;t<this.updatedRows.length;t++)e&=this.checkBeforeUpdate(this.updatedRows[t]);if(!e&&!this.callEvent("onValidationError",["",this.messages]))return!1;if(this._tSend)this._sendData(this._getAllData());else for(var t=0;t<this.updatedRows.length;t++)if(!this._in_progress[this.updatedRows[t]]){if(this.is_invalid(this.updatedRows[t]))continue;if(this._beforeSendData(this._getRowData(this.updatedRows[t]),this.updatedRows[t]),this._waitMode&&("tree"==this.obj.mytype||this.obj._h2))return
}}},_getAllData:function(){for(var e={},t=!1,i=0;i<this.updatedRows.length;i++){var s=this.updatedRows[i];this._in_progress[s]||this.is_invalid(s)||this.callEvent("onBeforeUpdate",[s,this.getState(s)])&&(e[s]=this._getRowData(s,s+this.post_delim),t=!0,this._in_progress[s]=(new Date).valueOf())}return t?e:null},setVerificator:function(e,t){this.mandatoryFields[e]=t||function(e){return""!==e}},clearVerificator:function(e){this.mandatoryFields[e]=!1},findRow:function(e){var t=0;for(t=0;t<this.updatedRows.length&&e!=this.updatedRows[t];t++);return t
},defineAction:function(e,t){this._uActions||(this._uActions=[]),this._uActions[e]=t},afterUpdateCallback:function(e,t,i,s){var n=e,r="error"!=i&&"invalid"!=i;if(r||this.set_invalid(e,i),this._uActions&&this._uActions[i]&&!this._uActions[i](s))return delete this._in_progress[n];"wait"!=this._in_progress[n]&&this.setUpdated(e,!1);var a=e;switch(i){case"inserted":case"insert":t!=e&&(this.obj[this._methods[2]](e,t),e=t);break;case"delete":case"deleted":return this.obj.setUserData(e,this.action_param,"true_deleted"),this.obj[this._methods[3]](e),delete this._in_progress[n],this.callEvent("onAfterUpdate",[e,i,t,s])
}"wait"!=this._in_progress[n]?(r&&this.obj.setUserData(e,this.action_param,""),delete this._in_progress[n]):(delete this._in_progress[n],this.setUpdated(t,!0,this.obj.getUserData(e,this.action_param))),this.callEvent("onAfterUpdate",[a,i,t,s])},afterUpdate:function(e,t,i,s,n){if(n.getXMLTopNode("data"),n.xmlDoc.responseXML){for(var r=n.doXPath("//data/action"),a=0;a<r.length;a++){var d=r[a],o=d.getAttribute("type"),l=d.getAttribute("sid"),h=d.getAttribute("tid");e.afterUpdateCallback(l,h,o,d)}e.finalizeUpdate()
}},finalizeUpdate:function(){this._waitMode&&this._waitMode--,("tree"==this.obj.mytype||this.obj._h2)&&this.updatedRows.length&&this.sendData(),this.callEvent("onAfterUpdateFinish",[]),this.updatedRows.length||this.callEvent("onFullSync",[])},init:function(e){this.obj=e,this.obj._dp_init&&this.obj._dp_init(this)},setOnAfterUpdate:function(e){this.attachEvent("onAfterUpdate",e)},enableDebug:function(){},setOnBeforeUpdateHandler:function(e){this.attachEvent("onBeforeDataSending",e)},setAutoUpdate:function(e,t){e=e||2e3,this._user=t||(new Date).valueOf(),this._need_update=!1,this._loader=null,this._update_busy=!1,this.attachEvent("onAfterUpdate",function(e,t,i,s){this.afterAutoUpdate(e,t,i,s)
}),this.attachEvent("onFullSync",function(){this.fullSync()});var i=this;window.setInterval(function(){i.loadUpdate()},e)},afterAutoUpdate:function(e,t){return"collision"==t?(this._need_update=!0,!1):!0},fullSync:function(){return this._need_update===!0&&(this._need_update=!1,this.loadUpdate()),!0},getUpdates:function(e,t){return this._update_busy?!1:(this._update_busy=!0,this._loader=this._loader||new dtmlXMLLoaderObject(!0),this._loader.async=!0,this._loader.waitCall=t,void this._loader.loadXML(e))
},_v:function(e){return e.firstChild?e.firstChild.nodeValue:""},_a:function(e){for(var t=[],i=0;i<e.length;i++)t[i]=this._v(e[i]);return t},loadUpdate:function(){var e=this,t=this.obj.getUserData(0,"version"),i=this.serverProcessor+getUrlSymbol(this.serverProcessor)+["dhx_user="+this._user,"dhx_version="+t].join("&");i=i.replace("editing=true&",""),this.getUpdates(i,function(){var t=e._loader.doXPath("//userdata");e.obj.setUserData(0,"version",e._v(t[0]));var i=e._loader.doXPath("//update");if(i.length){e._silent_mode=!0;
for(var s=0;s<i.length;s++){var n=i[s].getAttribute("status"),r=i[s].getAttribute("id"),a=i[s].getAttribute("parent");switch(n){case"inserted":e.callEvent("insertCallback",[i[s],r,a]);break;case"updated":e.callEvent("updateCallback",[i[s],r,a]);break;case"deleted":e.callEvent("deleteCallback",[i[s],r,a])}}e._silent_mode=!1}e._update_busy=!1,e=null})}},window.dhtmlXGridObject&&(dhtmlXGridObject.prototype._init_point_connector=dhtmlXGridObject.prototype._init_point,dhtmlXGridObject.prototype._init_point=function(){var e=function(e){return e=e.replace(/(\?|\&)connector[^\f]*/g,""),e+(-1!=e.indexOf("?")?"&":"?")+"connector=true"+(this.hdr.rows.length>0?"&dhx_no_header=1":"")
},t=function(t){return e.call(this,t)+(this._connector_sorting||"")+(this._connector_filter||"")},i=function(e,i,s){return this._connector_sorting="&dhx_sort["+i+"]="+s,t.call(this,e)},s=function(e,i,s){for(var n=0;n<i.length;n++)i[n]="dhx_filter["+i[n]+"]="+encodeURIComponent(s[n]);return this._connector_filter="&"+i.join("&"),t.call(this,e)};this.attachEvent("onCollectValues",function(e){return this._con_f_used[e]?"object"==typeof this._con_f_used[e]?this._con_f_used[e]:!1:!0}),this.attachEvent("onDynXLS",function(){return this.xmlFileUrl=t.call(this,this.xmlFileUrl),!0
}),this.attachEvent("onBeforeSorting",function(e,t,s){if("connector"==t){var n=this;return this.clearAndLoad(i.call(this,this.xmlFileUrl,e,s),function(){n.setSortImgState(!0,e,s)}),!1}return!0}),this.attachEvent("onFilterStart",function(e,t){return this._con_f_used.length?(this.clearAndLoad(s.call(this,this.xmlFileUrl,e,t)),!1):!0}),this.attachEvent("onXLE",function(e,t,i,s){}),this._init_point_connector&&this._init_point_connector()},dhtmlXGridObject.prototype._con_f_used=[],dhtmlXGridObject.prototype._in_header_connector_text_filter=function(e,t){return this._con_f_used[t]||(this._con_f_used[t]=1),this._in_header_text_filter(e,t)
},dhtmlXGridObject.prototype._in_header_connector_select_filter=function(e,t){return this._con_f_used[t]||(this._con_f_used[t]=2),this._in_header_select_filter(e,t)},dhtmlXGridObject.prototype.load_connector=dhtmlXGridObject.prototype.load,dhtmlXGridObject.prototype.load=function(){var e=[].concat(arguments);if(!this._colls_loaded&&this.cellType){for(var t=[],i=0;i<this.cellType.length;i++)(0===this.cellType[i].indexOf("co")||2==this._con_f_used[i])&&t.push(i);t.length&&(e[0]+=(-1!=e[0].indexOf("?")?"&":"?")+"connector=true&dhx_colls="+t.join(","))
}return this.load_connector.apply(this,e)},dhtmlXGridObject.prototype._parseHead_connector=dhtmlXGridObject.prototype._parseHead,dhtmlXGridObject.prototype._parseHead=function(){if(this._parseHead_connector.apply(this,arguments),!this._colls_loaded){for(var e=this.xmlLoader.doXPath("./coll_options",arguments[0]),t=0;t<e.length;t++){var i=e[t].getAttribute("for"),s=[],n=null;"combo"==this.cellType[i]&&(n=this.getColumnCombo(i)),0===this.cellType[i].indexOf("co")&&(n=this.getCombo(i));for(var r=this.xmlLoader.doXPath("./item",e[t]),a=0;a<r.length;a++){var d=r[a].getAttribute("value");
if(n){var o=r[a].getAttribute("label")||d;n.addOption?n.addOption([[d,o]]):n.put(d,o),s[s.length]=o}else s[s.length]=d}this._con_f_used[1*i]&&(this._con_f_used[1*i]=s)}this._colls_loaded=!0}}),window.dataProcessor&&(dataProcessor.prototype.init_original=dataProcessor.prototype.init,dataProcessor.prototype.init=function(e){this.init_original(e),e._dataprocessor=this,this.setTransactionMode("POST",!0),this.serverProcessor+=(-1!=this.serverProcessor.indexOf("?")?"&":"?")+"editing=true"}),dhtmlxError.catchError("LoadXML",function(e,t,i){i[0].status&&window.alert(i[0].responseText)
}),dhtmlxEventable(scheduler),scheduler._detachDomEvent=function(e,t,i){e.removeEventListener?e.removeEventListener(t,i,!1):e.detachEvent&&e.detachEvent("on"+t,i)},scheduler._init_once=function(){function e(){return{w:window.innerWidth||document.documentElement.clientWidth,h:window.innerHeight||document.documentElement.clientHeight}}function t(e,t){return e.w==t.w&&e.h==t.h}var i=e();dhtmlxEvent(window,"resize",function(){var s=e();t(i,s)||(window.clearTimeout(scheduler._resize_timer),scheduler._resize_timer=window.setTimeout(function(){scheduler.callEvent("onSchedulerResize",[])&&(scheduler.update_view(),scheduler.callEvent("onAfterSchedulerResize",[]))
},100)),i=s}),scheduler._init_once=function(){}},scheduler.init=function(e,t,i){t=t||scheduler._currentDate(),i=i||"week",this._obj&&this.unset_actions(),this._obj="string"==typeof e?document.getElementById(e):e,this._skin_init&&scheduler._skin_init(),scheduler.date.init(),this._els=[],this._scroll=!0,this._quirks=_isIE&&"BackCompat"==document.compatMode,this._quirks7=_isIE&&-1==navigator.appVersion.indexOf("MSIE 8"),this.get_elements(),this.init_templates(),this.set_actions(),this._init_once(),this._init_touch_events(),this.set_sizes(),scheduler.callEvent("onSchedulerReady",[]),this.setCurrentView(t,i)
},scheduler.xy={min_event_height:40,scale_width:50,scroll_width:18,scale_height:20,month_scale_height:20,menu_width:25,margin_top:0,margin_left:0,editor_width:140,month_head_height:22},scheduler.keys={edit_save:13,edit_cancel:27},scheduler.set_sizes=function(){var e=this._x=this._obj.clientWidth-this.xy.margin_left,t=this._y=this._obj.clientHeight-this.xy.margin_top,i=this._table_view?0:this.xy.scale_width+this.xy.scroll_width,s=this._table_view?-1:this.xy.scale_width;this.set_xy(this._els.dhx_cal_navline[0],e,this.xy.nav_height,0,0),this.set_xy(this._els.dhx_cal_header[0],e-i,this.xy.scale_height,s,this.xy.nav_height+(this._quirks?-1:1));
var n=this._els.dhx_cal_navline[0].offsetHeight;n>0&&(this.xy.nav_height=n);var r=this.xy.scale_height+this.xy.nav_height+(this._quirks?-2:0);this.set_xy(this._els.dhx_cal_data[0],e,t-(r+2),0,r+2)},scheduler.set_xy=function(e,t,i,s,n){e.style.width=Math.max(0,t)+"px",e.style.height=Math.max(0,i)+"px",arguments.length>3&&(e.style.left=s+"px",e.style.top=n+"px")},scheduler.get_elements=function(){for(var e=this._obj.getElementsByTagName("DIV"),t=0;t<e.length;t++){var i=e[t].className||"",s=e[t].getAttribute("name")||"";
i&&(i=i.split(" ")[0]),this._els[i]||(this._els[i]=[]),this._els[i].push(e[t]);var n=scheduler.locale.labels[s||i];"string"!=typeof n&&s&&!e[t].innerHTML&&(n=s.split("_")[0]),n&&(e[t].innerHTML=n)}},scheduler.unset_actions=function(){for(var e in this._els)if(this._click[e])for(var t=0;t<this._els[e].length;t++)this._els[e][t].onclick=null;this._obj.onselectstart=null,this._obj.onmousemove=null,this._obj.onmousedown=null,this._obj.onmouseup=null,this._obj.ondblclick=null,this._obj.oncontextmenu=null
},scheduler.set_actions=function(){for(var e in this._els)if(this._click[e])for(var t=0;t<this._els[e].length;t++)this._els[e][t].onclick=scheduler._click[e];this._obj.onselectstart=function(){return!1},this._obj.onmousemove=function(e){scheduler._temp_touch_block||scheduler._on_mouse_move(e||event)},this._obj.onmousedown=function(e){scheduler._ignore_next_click||scheduler._on_mouse_down(e||event)},this._obj.onmouseup=function(e){scheduler._ignore_next_click||scheduler._on_mouse_up(e||event)},this._obj.ondblclick=function(e){scheduler._on_dbl_click(e||event)
},this._obj.oncontextmenu=function(e){var t=e||event,i=t.target||t.srcElement,s=scheduler.callEvent("onContextMenu",[scheduler._locate_event(i),t]);return s}},scheduler.select=function(e){this._select_id!=e&&(this.editStop(!1),this.unselect(),this._select_id=e,this.updateEvent(e))},scheduler.unselect=function(e){if(!e||e==this._select_id){var t=this._select_id;this._select_id=null,t&&this.getEvent(t)&&this.updateEvent(t)}},scheduler.getState=function(){return{mode:this._mode,date:new Date(this._date),min_date:new Date(this._min_date),max_date:new Date(this._max_date),editor_id:this._edit_id,lightbox_id:this._lightbox_id,new_event:this._new_event,select_id:this._select_id,expanded:this.expanded,drag_id:this._drag_id,drag_mode:this._drag_mode}
},scheduler._click={dhx_cal_data:function(e){if(scheduler._ignore_next_click)return e.preventDefault&&e.preventDefault(),e.cancelBubble=!0,scheduler._ignore_next_click=!1,!1;var t=e?e.target:event.srcElement,i=scheduler._locate_event(t);if(e=e||event,i){if(!scheduler.callEvent("onClick",[i,e])||scheduler.config.readonly)return}else scheduler.callEvent("onEmptyClick",[scheduler.getActionData(e).date,e]);if(i&&scheduler.config.select){scheduler.select(i);var s=t.className;-1!=s.indexOf("_icon")&&scheduler._click.buttons[s.split(" ")[1].replace("icon_","")](i)
}else scheduler._close_not_saved(),scheduler.unselect()},dhx_cal_prev_button:function(){scheduler._click.dhx_cal_next_button(0,-1)},dhx_cal_next_button:function(e,t){scheduler.setCurrentView(scheduler.date.add(scheduler.date[scheduler._mode+"_start"](scheduler._date),t||1,scheduler._mode))},dhx_cal_today_button:function(){scheduler.callEvent("onBeforeTodayDisplayed",[])&&scheduler.setCurrentView(scheduler._currentDate())},dhx_cal_tab:function(){var e=this.getAttribute("name"),t=e.substring(0,e.search("_tab"));
scheduler.setCurrentView(scheduler._date,t)},buttons:{"delete":function(e){var t=scheduler.locale.labels.confirm_deleting;scheduler._dhtmlx_confirm(t,scheduler.locale.labels.title_confirm_deleting,function(){scheduler.deleteEvent(e)})},edit:function(e){scheduler.edit(e)},save:function(){scheduler.editStop(!0)},details:function(e){scheduler.showLightbox(e)},cancel:function(){scheduler.editStop(!1)}}},scheduler._dhtmlx_confirm=function(e,t,i){if(!e)return i();var s={text:e};t&&(s.title=t),i&&(s.callback=function(e){e&&i()
}),dhtmlx.confirm(s)},scheduler.addEventNow=function(e,t,i){var s={};e&&null!==e.constructor.toString().match(/object/i)&&(s=e,e=null);var n=6e4*(this.config.event_duration||this.config.time_step);e||(e=s.start_date||Math.round(scheduler._currentDate().valueOf()/n)*n);var r=new Date(e);if(!t){var a=this.config.first_hour;a>r.getHours()&&(r.setHours(a),e=r.valueOf()),t=e.valueOf()+n}var d=new Date(t);r.valueOf()==d.valueOf()&&d.setTime(d.valueOf()+n),s.start_date=s.start_date||r,s.end_date=s.end_date||d,s.text=s.text||this.locale.labels.new_event,s.id=this._drag_id=this.uid(),this._drag_mode="new-size",this._loading=!0,this.addEvent(s),this.callEvent("onEventCreated",[this._drag_id,i]),this._loading=!1,this._drag_event={},this._on_mouse_up(i)
},scheduler._on_dbl_click=function(e,t){if(t=t||e.target||e.srcElement,!this.config.readonly){var i=(t.className||"").split(" ")[0];switch(i){case"dhx_scale_holder":case"dhx_scale_holder_now":case"dhx_month_body":case"dhx_wa_day_data":if(!scheduler.config.dblclick_create)break;this.addEventNow(this.getActionData(e).date,null,e);break;case"dhx_cal_event":case"dhx_wa_ev_body":case"dhx_agenda_line":case"dhx_grid_event":case"dhx_cal_event_line":case"dhx_cal_event_clear":var s=this._locate_event(t);if(!this.callEvent("onDblClick",[s,e]))return;
this.config.details_on_dblclick||this._table_view||!this.getEvent(s)._timed||!this.config.select?this.showLightbox(s):this.edit(s);break;case"dhx_time_block":case"dhx_cal_container":return;default:var n=this["dblclick_"+i];if(n)n.call(this,e);else if(t.parentNode&&t!=this)return scheduler._on_dbl_click(e,t.parentNode)}}},scheduler._get_column_index=function(e){var t=0;if(this._cols){for(var i=0,s=0;s<this._cols.length&&!i;s++)i=this._cols[s];if(t=i?e/i:0,this._ignores)for(var s=0;t>=s;s++)this._ignores[s]&&t++
}return t},scheduler._week_indexes_from_pos=function(e){if(this._cols){var t=this._get_column_index(e.x);return e.x=Math.min(this._cols.length-1,Math.max(0,Math.ceil(t)-1)),e.y=Math.max(0,Math.ceil(60*e.y/(this.config.time_step*this.config.hour_size_px))-1)+this.config.first_hour*(60/this.config.time_step),e}return e},scheduler._mouse_coords=function(e){var t,i=document.body,s=document.documentElement;t=_isIE||!e.pageX&&!e.pageY?{x:e.clientX+(i.scrollLeft||s.scrollLeft||0)-i.clientLeft,y:e.clientY+(i.scrollTop||s.scrollTop||0)-i.clientTop}:{x:e.pageX,y:e.pageY},t.x-=getAbsoluteLeft(this._obj)+(this._table_view?0:this.xy.scale_width),t.y-=getAbsoluteTop(this._obj)+this.xy.nav_height+(this._dy_shift||0)+this.xy.scale_height-this._els.dhx_cal_data[0].scrollTop,t.ev=e;
var n=this["mouse_"+this._mode];if(n)return n.call(this,t);if(this._table_view){var r=this._get_column_index(t.x);if(!this._cols||!this._colsS)return t;var a=0;for(a=1;a<this._colsS.heights.length&&!(this._colsS.heights[a]>t.y);a++);t.y=Math.ceil(24*(Math.max(0,r)+7*Math.max(0,a-1))*60/this.config.time_step),(scheduler._drag_mode||"month"==this._mode)&&(t.y=24*(Math.max(0,Math.ceil(r)-1)+7*Math.max(0,a-1))*60/this.config.time_step),"move"==this._drag_mode&&scheduler._ignores_detected&&scheduler.config.preserve_length&&(t._ignores=!0,this._drag_event._event_length||(this._drag_event._event_length=this._get_real_event_length(this._drag_event.start_date,this._drag_event.end_date,{x_step:1,x_unit:"day"}))),t.x=0
}else t=this._week_indexes_from_pos(t);return t},scheduler._close_not_saved=function(){if((new Date).valueOf()-(scheduler._new_event||0)>500&&scheduler._edit_id){var e=scheduler.locale.labels.confirm_closing;scheduler._dhtmlx_confirm(e,scheduler.locale.labels.title_confirm_closing,function(){scheduler.editStop(scheduler.config.positive_closing)})}},scheduler._correct_shift=function(e,t){return e-=6e4*(new Date(scheduler._min_date).getTimezoneOffset()-new Date(e).getTimezoneOffset())*(t?-1:1)},scheduler._on_mouse_move=function(e){if(this._drag_mode){var t=this._mouse_coords(e);
if(!this._drag_pos||t.force_redraw||this._drag_pos.x!=t.x||this._drag_pos.y!=t.y){var i,s;if(this._edit_id!=this._drag_id&&this._close_not_saved(),this._drag_pos=t,"create"==this._drag_mode){if(this._close_not_saved(),this.unselect(this._select_id),this._loading=!0,i=this._get_date_from_pos(t).valueOf(),!this._drag_start){var n=this.callEvent("onBeforeEventCreated",[e,this._drag_id]);if(!n)return;return void(this._drag_start=i)}s=i,s==this._drag_start;var r=new Date(this._drag_start),a=new Date(s);
"day"!=this._mode&&"week"!=this._mode||r.getHours()!=a.getHours()||r.getMinutes()!=a.getMinutes()||(a=new Date(this._drag_start+1e3)),this._drag_id=this.uid(),this.addEvent(r,a,this.locale.labels.new_event,this._drag_id,t.fields),this.callEvent("onEventCreated",[this._drag_id,e]),this._loading=!1,this._drag_mode="new-size"}var d,o=this.getEvent(this._drag_id);if("move"==this._drag_mode)i=this._min_date.valueOf()+6e4*(t.y*this.config.time_step+24*t.x*60-(scheduler._move_pos_shift||0)),!t.custom&&this._table_view&&(i+=1e3*this.date.time_part(o.start_date)),i=this._correct_shift(i),t._ignores&&this.config.preserve_length&&this._table_view?(this.matrix&&(d=this.matrix[this._mode]),d=d||{x_step:1,x_unit:"day"},s=1*i+this._get_fictional_event_length(i,this._drag_event._event_length,d)):s=o.end_date.valueOf()-(o.start_date.valueOf()-i);
else{if(i=o.start_date.valueOf(),s=o.end_date.valueOf(),this._table_view){var l=this._min_date.valueOf()+t.y*this.config.time_step*6e4+(t.custom?0:864e5);if("month"==this._mode)if(l=this._correct_shift(l,!1),this._drag_from_start){var h=864e5;l<=scheduler.date.date_part(new Date(s+h-1)).valueOf()&&(i=l-h)}else s=l;else t.resize_from_start?i=l:s=l}else s=this.date.date_part(new Date(o.end_date.valueOf()-1)).valueOf()+t.y*this.config.time_step*6e4,this._els.dhx_cal_data[0].style.cursor="s-resize",("week"==this._mode||"day"==this._mode)&&(s=this._correct_shift(s));
if("new-size"==this._drag_mode)if(s<=this._drag_start){var _=t.shift||(this._table_view&&!t.custom?864e5:0);i=s-(t.shift?0:_),s=this._drag_start+(_||6e4*this.config.time_step)}else i=this._drag_start;else i>=s&&(s=i+6e4*this.config.time_step)}var c=new Date(s-1),u=new Date(i);if(scheduler.config.limit_drag_out&&(+u<+scheduler._min_date||+s>+scheduler._max_date)){var f=s-u;+u<+scheduler._min_date?(u=new Date(scheduler._min_date),s=new Date(+u+f)):(s=new Date(scheduler._max_date),u=new Date(+s-f));
var c=new Date(s-1)}if(!this._table_view&&(t.x!=this._get_event_sday({start_date:new Date(s),end_date:new Date(s)})||new Date(s).getHours()>=this.config.last_hour)){var f=s-u,h=this._min_date.valueOf()+24*t.x*60*6e4;s=scheduler.date.date_part(new Date(h)),s.setHours(this.config.last_hour),c=new Date(s-1),"move"==this._drag_mode&&(u=new Date(+s-f))}if(this._table_view||c.getDate()==u.getDate()&&c.getHours()<this.config.last_hour||scheduler._allow_dnd)if(o.start_date=u,o.end_date=new Date(s),this.config.update_render){var g=scheduler._els.dhx_cal_data[0].scrollTop;
this.update_view(),scheduler._els.dhx_cal_data[0].scrollTop=g}else this.updateEvent(this._drag_id);this._table_view&&this.for_rendered(this._drag_id,function(e){e.className+=" dhx_in_move"}),this.callEvent("onEventDrag",[this._drag_id,this._drag_mode,e])}}else if(scheduler.checkEvent("onMouseMove")){var v=this._locate_event(e.target||e.srcElement);this.callEvent("onMouseMove",[v,e])}},scheduler._on_mouse_down=function(e,t){if(2!=e.button&&!this.config.readonly&&!this._drag_mode){t=t||e.target||e.srcElement;
var i=t.className&&t.className.split(" ")[0];switch(i){case"dhx_cal_event_line":case"dhx_cal_event_clear":this._table_view&&(this._drag_mode="move");break;case"dhx_event_move":case"dhx_wa_ev_body":this._drag_mode="move";break;case"dhx_event_resize":this._drag_mode="resize",scheduler._drag_from_start=(t.className||"").indexOf("dhx_event_resize_end")<0?!0:!1;break;case"dhx_scale_holder":case"dhx_scale_holder_now":case"dhx_month_body":case"dhx_matrix_cell":case"dhx_marked_timespan":this._drag_mode="create";
break;case"":if(t.parentNode)return scheduler._on_mouse_down(e,t.parentNode);break;default:if((!scheduler.checkEvent("onMouseDown")||scheduler.callEvent("onMouseDown",[i]))&&t.parentNode&&t!=this&&"dhx_body"!=i)return scheduler._on_mouse_down(e,t.parentNode);this._drag_mode=null,this._drag_id=null}if(this._drag_mode){var s=this._locate_event(t);this.config["drag_"+this._drag_mode]&&this.callEvent("onBeforeDrag",[s,this._drag_mode,e])?(this._drag_id=s,this._drag_event=scheduler._lame_clone(this.getEvent(this._drag_id)||{})):this._drag_mode=this._drag_id=0
}this._drag_start=null}},scheduler._get_private_properties=function(e){var t={};for(var i in e)0===i.indexOf("_")&&(t[i]=!0);return t},scheduler._clear_temporary_properties=function(e,t){var i=this._get_private_properties(e),s=this._get_private_properties(t);for(var n in s)i[n]||delete t[n]},scheduler._on_mouse_up=function(e){if(!e||2!=e.button||!scheduler.config.touch){if(this._drag_mode&&this._drag_id){this._els.dhx_cal_data[0].style.cursor="default";var t=this.getEvent(this._drag_id);if(this._drag_event._dhx_changed||!this._drag_event.start_date||t.start_date.valueOf()!=this._drag_event.start_date.valueOf()||t.end_date.valueOf()!=this._drag_event.end_date.valueOf()){var i="new-size"==this._drag_mode;
if(this.callEvent("onBeforeEventChanged",[t,e,i,this._drag_event])){var s=this._drag_id,n=this._drag_mode;if(this._drag_id=this._drag_mode=null,i&&this.config.edit_on_create){if(this.unselect(),this._new_event=new Date,this._table_view||this.config.details_on_create||!this.config.select)return scheduler.callEvent("onDragEnd",[s,n,e]),this.showLightbox(s);this._drag_pos=!0,this._select_id=this._edit_id=s}else this._new_event||this.callEvent(i?"onEventAdded":"onEventChanged",[s,this.getEvent(s)])}else i?this.deleteEvent(t.id,!0):(this._drag_event._dhx_changed=!1,this._clear_temporary_properties(t,this._drag_event),scheduler._lame_copy(t,this._drag_event),this.updateEvent(t.id))
}this._drag_pos&&this.render_view_data(),scheduler.callEvent("onDragEnd",[this._drag_id,this._drag_mode,e])}this._drag_id=null,this._drag_mode=null,this._drag_pos=null}},scheduler._trigger_dyn_loading=function(){return this._load_mode&&this._load()?(this._render_wait=!0,!0):!1},scheduler.update_view=function(){var e=this[this._mode+"_view"];return e?e(!0):this._reset_scale(),this._trigger_dyn_loading()?!0:void this.render_view_data()},scheduler.isViewExists=function(e){return!!(scheduler[e+"_view"]||scheduler.date[e+"_start"]&&scheduler.templates[e+"_date"]&&scheduler.templates[e+"_scale_date"])
},scheduler.updateView=function(e,t){e=e||this._date,t=t||this._mode;var i="dhx_cal_data";this._mode?this._obj.className=this._obj.className.replace("dhx_scheduler_"+this._mode,"dhx_scheduler_"+t):this._obj.className+=" dhx_scheduler_"+t;var s=this._mode==t&&this.config.preserve_scroll?this._els[i][0].scrollTop:!1;this[this._mode+"_view"]&&t&&this._mode!=t&&this[this._mode+"_view"](!1),this._close_not_saved();var n="dhx_multi_day";this._els[n]&&(this._els[n][0].parentNode.removeChild(this._els[n][0]),this._els[n]=null),this._mode=t,this._date=e,this._table_view="month"==this._mode,this._dy_shift=0;
var r=this._els.dhx_cal_tab;if(r)for(var a=0;a<r.length;a++){var d=r[a].className;d=d.replace(/ active/g,""),r[a].getAttribute("name")==this._mode+"_tab"&&(d+=" active"),r[a].className=d}this.update_view(),"number"==typeof s&&(this._els[i][0].scrollTop=s)},scheduler.setCurrentView=function(e,t){this.callEvent("onBeforeViewChange",[this._mode,this._date,t||this._mode,e||this._date])&&(this.updateView(e,t),this.callEvent("onViewChange",[this._mode,this._date]))},scheduler._render_x_header=function(e,t,i,s){var n=document.createElement("DIV");
n.className="dhx_scale_bar",this.templates[this._mode+"_scalex_class"]&&(n.className+=" "+this.templates[this._mode+"_scalex_class"](i));var r=this._cols[e]-1;"month"==this._mode&&0===e&&this.config.left_border&&(n.className+=" dhx_scale_bar_border",t+=1),this.set_xy(n,r,this.xy.scale_height-2,t,0),n.innerHTML=this.templates[this._mode+"_scale_date"](i,this._mode),s.appendChild(n)},scheduler._get_columns_num=function(e,t){var i=7;if(!scheduler._table_view){var s=scheduler.date["get_"+scheduler._mode+"_end"];
s&&(t=s(e)),i=Math.round((t.valueOf()-e.valueOf())/864e5)}return i},scheduler._get_timeunit_start=function(){return this.date[this._mode+"_start"](new Date(this._date.valueOf()))},scheduler._get_view_end=function(){var e=this._get_timeunit_start(),t=scheduler.date.add(e,1,this._mode);if(!scheduler._table_view){var i=scheduler.date["get_"+scheduler._mode+"_end"];i&&(t=i(e))}return t},scheduler._calc_scale_sizes=function(e,t,i){var s=e,n=this._get_columns_num(t,i);this._process_ignores(t,n,"day",1);
for(var r=n-this._ignores_detected,a=0;n>a;a++)this._ignores[a]?(this._cols[a]=0,r++):this._cols[a]=Math.floor(s/(r-a)),s-=this._cols[a],this._colsS[a]=(this._cols[a-1]||0)+(this._colsS[a-1]||(this._table_view?0:this.xy.scale_width+2)),this._colsS.col_length=n;this._colsS[n]=this._cols[n-1]+this._colsS[n-1]},scheduler._set_scale_col_size=function(e,t,i){var s=this.config;this.set_xy(e,t-1,s.hour_size_px*(s.last_hour-s.first_hour),i+this.xy.scale_width+1,0)},scheduler._render_scales=function(e,t){var i=new Date(scheduler._min_date),s=new Date(scheduler._max_date),n=this.date.date_part(scheduler._currentDate()),r=parseInt(e.style.width,10),a=new Date(this._min_date),d=this._get_columns_num(i,s);
this._calc_scale_sizes(r,i,s);var o=0;e.innerHTML="";for(var l=0;d>l;l++){if(this._ignores[l]||this._render_x_header(l,o,a,e),!this._table_view){var h=document.createElement("DIV"),_="dhx_scale_holder";a.valueOf()==n.valueOf()&&(_="dhx_scale_holder_now"),this._ignores_detected&&this._ignores[l]&&(_+=" dhx_scale_ignore"),h.className=_+" "+this.templates.week_date_class(a,n),this._set_scale_col_size(h,this._cols[l],o),t.appendChild(h),this.callEvent("onScaleAdd",[h,a])}o+=this._cols[l],a=this.date.add(a,1,"day")
}},scheduler._reset_scale=function(){if(this.templates[this._mode+"_date"]){var e=this._els.dhx_cal_header[0],t=this._els.dhx_cal_data[0],i=this.config;e.innerHTML="",t.innerHTML="";var s=(i.readonly||!i.drag_resize?" dhx_resize_denied":"")+(i.readonly||!i.drag_move?" dhx_move_denied":"");t.className="dhx_cal_data"+s,this._scales={},this._cols=[],this._colsS={height:0},this._dy_shift=0,this.set_sizes();var n,r,a=this._get_timeunit_start(),d=scheduler._get_view_end();if(n=r=this._table_view?scheduler.date.week_start(a):a,this._min_date=n,this._els.dhx_cal_date[0].innerHTML=this.templates[this._mode+"_date"](a,d,this._mode),this._max_date=d,scheduler._render_scales(e,t),this._table_view)this._reset_month_scale(t,a,r);
else if(this._reset_hours_scale(t,a,r),i.multi_day){var o="dhx_multi_day";this._els[o]&&(this._els[o][0].parentNode.removeChild(this._els[o][0]),this._els[o]=null);var l=this._els.dhx_cal_navline[0],h=l.offsetHeight+this._els.dhx_cal_header[0].offsetHeight+1,_=document.createElement("DIV");_.className=o,_.style.visibility="hidden",this.set_xy(_,this._colsS[this._colsS.col_length]+this.xy.scroll_width,0,0,h),t.parentNode.insertBefore(_,t);var c=_.cloneNode(!0);c.className=o+"_icon",c.style.visibility="hidden",this.set_xy(c,this.xy.scale_width,0,0,h),_.appendChild(c),this._els[o]=[_,c],this._els[o][0].onclick=this._click.dhx_cal_data
}}},scheduler._reset_hours_scale=function(e){var t=document.createElement("DIV");t.className="dhx_scale_holder";for(var i=new Date(1980,1,1,this.config.first_hour,0,0),s=1*this.config.first_hour;s<this.config.last_hour;s++){var n=document.createElement("DIV");n.className="dhx_scale_hour",n.style.height=this.config.hour_size_px-(this._quirks?0:1)+"px";var r=this.xy.scale_width;this.config.left_border&&(r-=1,n.className+=" dhx_scale_hour_border"),n.style.width=r+"px",n.innerHTML=scheduler.templates.hour_scale(i),t.appendChild(n),i=this.date.add(i,1,"hour")
}e.appendChild(t),this.config.scroll_hour&&(e.scrollTop=this.config.hour_size_px*(this.config.scroll_hour-this.config.first_hour))},scheduler._currentDate=function(){return scheduler.config.now_date?new Date(scheduler.config.now_date):new Date},scheduler._process_ignores=function(e,t,i,s,n){this._ignores={},this._ignores_detected=0;var r=scheduler["ignore_"+this._mode];if(r)for(var a=new Date(e),d=0;t>d;d++)r(a)&&(this._ignores_detected+=1,this._ignores[d]=!0,n&&t++),a=scheduler.date.add(a,s,i)},scheduler._render_month_scale=function(e,t,i){function s(e){var t=scheduler._colsS.height;
return void 0!==scheduler._colsS.heights[e+1]&&(t=scheduler._colsS.heights[e+1]-(scheduler._colsS.heights[e]||0)),t}var n=scheduler.date.add(t,1,"month"),r=new Date(i),a=scheduler._currentDate();this.date.date_part(a),this.date.date_part(i);for(var d=Math.ceil(Math.round((n.valueOf()-i.valueOf())/864e5)/7),o=[],l=0;7>=l;l++){var h=(this._cols[l]||0)-1;0===l&&this.config.left_border&&(h-=1),o[l]=" style='width:"+h+"px;"}for(var _=0,c="<table cellpadding='0' cellspacing='0'>",u=[],l=0;d>l;l++){c+="<tr>";
for(var f=Math.max(s(l)-scheduler.xy.month_head_height,0),g=0;7>g;g++){c+="<td";var v="";t>i?v="dhx_before":i>=n?v="dhx_after":i.valueOf()==a.valueOf()&&(v="dhx_now"),this._ignores_detected&&this._ignores[g]&&(v+=" dhx_scale_ignore"),c+=" class='"+v+" "+this.templates.month_date_class(i,a)+"' >";var m="dhx_month_body",p="dhx_month_head";0===g&&this.config.left_border&&(m+=" dhx_month_body_border",p+=" dhx_month_head_border"),this._ignores_detected&&this._ignores[g]?c+="<div></div><div></div>":(c+="<div class='"+p+"'>"+this.templates.month_day(i)+"</div>",c+="<div class='"+m+"' "+o[g]+";height:"+f+"px;'></div></td>"),u.push(i);
var x=i.getDate();i=this.date.add(i,1,"day"),i.getDate()-x>1&&(i=new Date(i.getFullYear(),i.getMonth(),x+1,12,0))}c+="</tr>",scheduler._colsS.heights[l]=_,_+=s(l)}c+="</table>",this._min_date=r,this._max_date=i,e.innerHTML=c,this._scales={};for(var b=e.getElementsByTagName("div"),l=0;l<u.length;l++){var e=b[2*l+1],y=u[l];this._scales[+y]=e}for(var l=0;l<u.length;l++){var y=u[l];this.callEvent("onScaleAdd",[this._scales[+y],y])}return this._max_date},scheduler._reset_month_scale=function(e,t,i){var s=scheduler.date.add(t,1,"month"),n=scheduler._currentDate();
this.date.date_part(n),this.date.date_part(i);var r=Math.ceil(Math.round((s.valueOf()-i.valueOf())/864e5)/7),a=Math.floor(e.clientHeight/r)-this.xy.month_head_height;return this._colsS.height=a+this.xy.month_head_height,this._colsS.heights=[],scheduler._render_month_scale(e,t,i)},scheduler.getLabel=function(e,t){for(var i=this.config.lightbox.sections,s=0;s<i.length;s++)if(i[s].map_to==e)for(var n=i[s].options,r=0;r<n.length;r++)if(n[r].key==t)return n[r].label;return""},scheduler.updateCollection=function(e,t){var i=scheduler.serverList(e);
return i?(i.splice(0,i.length),i.push.apply(i,t||[]),scheduler.callEvent("onOptionsLoad",[]),scheduler.resetLightbox(),!0):!1},scheduler._lame_clone=function(e,t){var i,s,n;for(t=t||[],i=0;i<t.length;i+=2)if(e===t[i])return t[i+1];if(e&&"object"==typeof e){for(n={},s=[Array,Date,Number,String,Boolean],i=0;i<s.length;i++)e instanceof s[i]&&(n=i?new s[i](e):new s[i]);t.push(e,n);for(i in e)Object.prototype.hasOwnProperty.apply(e,[i])&&(n[i]=scheduler._lame_clone(e[i],t))}return n||e},scheduler._lame_copy=function(e,t){for(var i in t)t.hasOwnProperty(i)&&(e[i]=t[i]);
return e},scheduler._get_date_from_pos=function(e){var t=this._min_date.valueOf()+6e4*(e.y*this.config.time_step+24*(this._table_view?0:e.x)*60);return new Date(this._correct_shift(t))},scheduler.getActionData=function(e){var t=this._mouse_coords(e);return{date:this._get_date_from_pos(t),section:t.section}},scheduler._focus=function(e,t){e&&e.focus&&(this.config.touch?window.setTimeout(function(){e.focus()},100):(t&&e.select&&e.select(),e.focus()))},scheduler._get_real_event_length=function(e,t,i){var s,n=t-e,r=i._start_correction+i._end_correction||0,a=this["ignore_"+this._mode],d=0;
for(i.render?(d=this._get_date_index(i,e),s=this._get_date_index(i,t)):s=Math.round(n/60/60/1e3/24);s>d;){var o=scheduler.date.add(t,-i.x_step,i.x_unit);n-=a&&a(t)?t-o:r,t=o,s--}return n},scheduler._get_fictional_event_length=function(e,t,i,s){var n=new Date(e),r=s?-1:1;if(i._start_correction||i._end_correction){var a;a=s?60*n.getHours()+n.getMinutes()-60*(i.first_hour||0):60*(i.last_hour||0)-(60*n.getHours()+n.getMinutes());var d=60*(i.last_hour-i.first_hour),o=Math.ceil((t/6e4-a)/d);t+=o*(1440-d)*60*1e3
}var l,h=new Date(1*e+t*r),_=this["ignore_"+this._mode],c=0;for(i.render?(c=this._get_date_index(i,n),l=this._get_date_index(i,h)):l=Math.round(t/60/60/1e3/24);l*r>=c*r;){var u=scheduler.date.add(n,i.x_step*r,i.x_unit);_&&_(n)&&(t+=(u-n)*r,l+=r),n=u,c+=r}return t},scheduler._get_section_view=function(){return this.matrix&&this.matrix[this._mode]?this.matrix[this._mode]:this._props&&this._props[this._mode]?this._props[this._mode]:null},scheduler._get_section_property=function(){return this.matrix&&this.matrix[this._mode]?this.matrix[this._mode].y_property:this._props&&this._props[this._mode]?this._props[this._mode].map_to:null
},scheduler._is_initialized=function(){var e=this.getState();return this._obj&&e.date&&e.mode},scheduler._is_lightbox_open=function(){var e=this.getState();return null!==e.lightbox_id&&void 0!==e.lightbox_id},scheduler.date={init:function(){for(var e=scheduler.locale.date.month_short,t=scheduler.locale.date.month_short_hash={},i=0;i<e.length;i++)t[e[i]]=i;for(var e=scheduler.locale.date.month_full,t=scheduler.locale.date.month_full_hash={},i=0;i<e.length;i++)t[e[i]]=i},date_part:function(e){return e.setHours(0),e.setMinutes(0),e.setSeconds(0),e.setMilliseconds(0),0!==e.getHours()&&e.setTime(e.getTime()+36e5*(24-e.getHours())),e
},time_part:function(e){return(e.valueOf()/1e3-60*e.getTimezoneOffset())%86400},week_start:function(e){var t=e.getDay();return scheduler.config.start_on_monday&&(0===t?t=6:t--),this.date_part(this.add(e,-1*t,"day"))},month_start:function(e){return e.setDate(1),this.date_part(e)},year_start:function(e){return e.setMonth(0),this.month_start(e)},day_start:function(e){return this.date_part(e)},_add_days:function(e,t){var i=new Date(e.valueOf());return i.setDate(i.getDate()+t),!e.getHours()&&i.getHours()&&i.setTime(i.getTime()+36e5*(24-i.getHours())),i
},add:function(e,t,i){var s=new Date(e.valueOf());switch(i){case"day":s=scheduler.date._add_days(s,t);break;case"week":s=scheduler.date._add_days(s,7*t);break;case"month":s.setMonth(s.getMonth()+t);break;case"year":s.setYear(s.getFullYear()+t);break;case"hour":s.setHours(s.getHours()+t);break;case"minute":s.setMinutes(s.getMinutes()+t);break;default:return scheduler.date["add_"+i](e,t,i)}return s},to_fixed:function(e){return 10>e?"0"+e:e},copy:function(e){return new Date(e.valueOf())},date_to_str:function(e,t){return e=e.replace(/%[a-zA-Z]/g,function(e){switch(e){case"%d":return'"+scheduler.date.to_fixed(date.getDate())+"';
case"%m":return'"+scheduler.date.to_fixed((date.getMonth()+1))+"';case"%j":return'"+date.getDate()+"';case"%n":return'"+(date.getMonth()+1)+"';case"%y":return'"+scheduler.date.to_fixed(date.getFullYear()%100)+"';case"%Y":return'"+date.getFullYear()+"';case"%D":return'"+scheduler.locale.date.day_short[date.getDay()]+"';case"%l":return'"+scheduler.locale.date.day_full[date.getDay()]+"';case"%M":return'"+scheduler.locale.date.month_short[date.getMonth()]+"';case"%F":return'"+scheduler.locale.date.month_full[date.getMonth()]+"';
case"%h":return'"+scheduler.date.to_fixed((date.getHours()+11)%12+1)+"';case"%g":return'"+((date.getHours()+11)%12+1)+"';case"%G":return'"+date.getHours()+"';case"%H":return'"+scheduler.date.to_fixed(date.getHours())+"';case"%i":return'"+scheduler.date.to_fixed(date.getMinutes())+"';case"%a":return'"+(date.getHours()>11?"pm":"am")+"';case"%A":return'"+(date.getHours()>11?"PM":"AM")+"';case"%s":return'"+scheduler.date.to_fixed(date.getSeconds())+"';case"%W":return'"+scheduler.date.to_fixed(scheduler.date.getISOWeek(date))+"';
default:return e}}),t&&(e=e.replace(/date\.get/g,"date.getUTC")),new Function("date",'return "'+e+'";')},str_to_date:function(e,t){for(var i="var temp=date.match(/[a-zA-Z]+|[0-9]+/g);",s=e.match(/%[a-zA-Z]/g),n=0;n<s.length;n++)switch(s[n]){case"%j":case"%d":i+="set[2]=temp["+n+"]||1;";break;case"%n":case"%m":i+="set[1]=(temp["+n+"]||1)-1;";break;case"%y":i+="set[0]=temp["+n+"]*1+(temp["+n+"]>50?1900:2000);";break;case"%g":case"%G":case"%h":case"%H":i+="set[3]=temp["+n+"]||0;";break;case"%i":i+="set[4]=temp["+n+"]||0;";
break;case"%Y":i+="set[0]=temp["+n+"]||0;";break;case"%a":case"%A":i+="set[3]=set[3]%12+((temp["+n+"]||'').toLowerCase()=='am'?0:12);";break;case"%s":i+="set[5]=temp["+n+"]||0;";break;case"%M":i+="set[1]=scheduler.locale.date.month_short_hash[temp["+n+"]]||0;";break;case"%F":i+="set[1]=scheduler.locale.date.month_full_hash[temp["+n+"]]||0;"}var r="set[0],set[1],set[2],set[3],set[4],set[5]";return t&&(r=" Date.UTC("+r+")"),new Function("date","var set=[0,0,1,0,0,0]; "+i+" return new Date("+r+");")
},getISOWeek:function(e){if(!e)return!1;var t=e.getDay();0===t&&(t=7);var i=new Date(e.valueOf());i.setDate(e.getDate()+(4-t));var s=i.getFullYear(),n=Math.round((i.getTime()-new Date(s,0,1).getTime())/864e5),r=1+Math.floor(n/7);return r},getUTCISOWeek:function(e){return this.getISOWeek(this.convert_to_utc(e))},convert_to_utc:function(e){return new Date(e.getUTCFullYear(),e.getUTCMonth(),e.getUTCDate(),e.getUTCHours(),e.getUTCMinutes(),e.getUTCSeconds())}},scheduler.locale={date:{month_full:["January","February","March","April","May","June","July","August","September","October","November","December"],month_short:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],day_full:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],day_short:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]},labels:{dhx_cal_today_button:"Today",day_tab:"Day",week_tab:"Week",month_tab:"Month",new_event:"New event",icon_save:"Save",icon_cancel:"Cancel",icon_details:"Details",icon_edit:"Edit",icon_delete:"Delete",confirm_closing:"",confirm_deleting:"Event will be deleted permanently, are you sure?",section_description:"Description",section_time:"Time period",full_day:"Full day",confirm_recurring:"Do you want to edit the whole set of repeated events?",section_recurring:"Repeat event",button_recurring:"Disabled",button_recurring_open:"Enabled",button_edit_series:"Edit series",button_edit_occurrence:"Edit occurrence",agenda_tab:"Agenda",date:"Date",description:"Description",year_tab:"Year",week_agenda_tab:"Agenda",grid_tab:"Grid",drag_to_create:"Drag to create",drag_to_move:"Drag to move",message_ok:"OK",message_cancel:"Cancel"}},scheduler.config={default_date:"%j %M %Y",month_date:"%F %Y",load_date:"%Y-%m-%d",week_date:"%l",day_date:"%D, %F %j",hour_date:"%H:%i",month_day:"%d",xml_date:"%m/%d/%Y %H:%i",api_date:"%d-%m-%Y %H:%i",preserve_length:!0,time_step:5,start_on_monday:1,first_hour:0,last_hour:24,readonly:!1,drag_resize:1,drag_move:1,drag_create:1,dblclick_create:1,edit_on_create:1,details_on_create:0,resize_month_events:!1,resize_month_timed:!1,cascade_event_display:!1,cascade_event_count:4,cascade_event_margin:30,multi_day:!0,multi_day_height_limit:0,drag_lightbox:!0,preserve_scroll:!0,select:!0,server_utc:!1,touch:!0,touch_tip:!0,touch_drag:500,quick_info_detached:!0,positive_closing:!1,drag_highlight:!0,limit_drag_out:!1,icons_edit:["icon_save","icon_cancel"],icons_select:["icon_details","icon_edit","icon_delete"],buttons_left:["dhx_save_btn","dhx_cancel_btn"],buttons_right:["dhx_delete_btn"],lightbox:{sections:[{name:"description",height:200,map_to:"text",type:"textarea",focus:!0},{name:"time",height:72,type:"time",map_to:"auto"}]},highlight_displayed_event:!0,left_border:!1},scheduler.templates={},scheduler.init_templates=function(){var e=scheduler.locale.labels;
e.dhx_save_btn=e.icon_save,e.dhx_cancel_btn=e.icon_cancel,e.dhx_delete_btn=e.icon_delete;var t=scheduler.date.date_to_str,i=scheduler.config,s=function(e,t){for(var i in t)e[i]||(e[i]=t[i])};s(scheduler.templates,{day_date:t(i.default_date),month_date:t(i.month_date),week_date:function(e,t){return scheduler.templates.day_date(e)+" &ndash; "+scheduler.templates.day_date(scheduler.date.add(t,-1,"day"))},day_scale_date:t(i.default_date),month_scale_date:t(i.week_date),week_scale_date:t(i.day_date),hour_scale:t(i.hour_date),time_picker:t(i.hour_date),event_date:t(i.hour_date),month_day:t(i.month_day),xml_date:scheduler.date.str_to_date(i.xml_date,i.server_utc),load_format:t(i.load_date,i.server_utc),xml_format:t(i.xml_date,i.server_utc),api_date:scheduler.date.str_to_date(i.api_date),event_header:function(e,t){return scheduler.templates.event_date(e)+" - "+scheduler.templates.event_date(t)
},event_text:function(e,t,i){return i.text},event_class:function(){return""},month_date_class:function(){return""},week_date_class:function(){return""},event_bar_date:function(e){return scheduler.templates.event_date(e)+" "},event_bar_text:function(e,t,i){return i.text},month_events_link:function(e,t){return"<a>View more("+t+" events)</a>"},drag_marker_class:function(){return""},drag_marker_content:function(){return""}}),this.callEvent("onTemplatesReady",[])},scheduler.uid=function(){return this._seed||(this._seed=(new Date).valueOf()),this._seed++
},scheduler._events={},scheduler.clearAll=function(){this._events={},this._loaded={},this.clear_view(),this.callEvent("onClearAll",[])},scheduler.addEvent=function(e,t,i,s,n){if(!arguments.length)return this.addEventNow();var r=e;1!=arguments.length&&(r=n||{},r.start_date=e,r.end_date=t,r.text=i,r.id=s),r.id=r.id||scheduler.uid(),r.text=r.text||"","string"==typeof r.start_date&&(r.start_date=this.templates.api_date(r.start_date)),"string"==typeof r.end_date&&(r.end_date=this.templates.api_date(r.end_date));
var a=6e4*(this.config.event_duration||this.config.time_step);r.start_date.valueOf()==r.end_date.valueOf()&&r.end_date.setTime(r.end_date.valueOf()+a),r._timed=this.isOneDayEvent(r);var d=!this._events[r.id];return this._events[r.id]=r,this.event_updated(r),this._loading||this.callEvent(d?"onEventAdded":"onEventChanged",[r.id,r]),r.id},scheduler.deleteEvent=function(e,t){var i=this._events[e];(t||this.callEvent("onBeforeEventDelete",[e,i])&&this.callEvent("onConfirmedBeforeEventDelete",[e,i]))&&(i&&(this._select_id=null,delete this._events[e],this.event_updated(i)),this.callEvent("onEventDeleted",[e,i]))
},scheduler.getEvent=function(e){return this._events[e]},scheduler.setEvent=function(e,t){t.id||(t.id=e),this._events[e]=t},scheduler.for_rendered=function(e,t){for(var i=this._rendered.length-1;i>=0;i--)this._rendered[i].getAttribute("event_id")==e&&t(this._rendered[i],i)},scheduler.changeEventId=function(e,t){if(e!=t){var i=this._events[e];i&&(i.id=t,this._events[t]=i,delete this._events[e]),this.for_rendered(e,function(e){e.setAttribute("event_id",t)}),this._select_id==e&&(this._select_id=t),this._edit_id==e&&(this._edit_id=t),this.callEvent("onEventIdChange",[e,t])
}},function(){for(var e=["text","Text","start_date","StartDate","end_date","EndDate"],t=function(e){return function(t){return scheduler.getEvent(t)[e]}},i=function(e){return function(t,i){var s=scheduler.getEvent(t);s[e]=i,s._changed=!0,s._timed=this.isOneDayEvent(s),scheduler.event_updated(s,!0)}},s=0;s<e.length;s+=2)scheduler["getEvent"+e[s+1]]=t(e[s]),scheduler["setEvent"+e[s+1]]=i(e[s])}(),scheduler.event_updated=function(e){this.is_visible_events(e)?this.render_view_data():this.clear_event(e.id)
},scheduler.is_visible_events=function(e){var t=e.start_date<this._max_date&&this._min_date<e.end_date;if(t){var i=e.end_date.getHours()>=this.config.first_hour&&e.end_date.getHours()<this.config.last_hour||e.start_date.getHours()>=this.config.first_hour&&e.start_date.getHours()<this.config.last_hour;if(i)return!0;var s=(e.end_date.valueOf()-e.start_date.valueOf())/36e5,n=24-(this.config.last_hour-this.config.first_hour);return s>n}return!1},scheduler.isOneDayEvent=function(e){var t=e.end_date.getDate()-e.start_date.getDate();
return t?(0>t&&(t=Math.ceil((e.end_date.valueOf()-e.start_date.valueOf())/864e5)),1==t&&!e.end_date.getHours()&&!e.end_date.getMinutes()&&(e.start_date.getHours()||e.start_date.getMinutes())):e.start_date.getMonth()==e.end_date.getMonth()&&e.start_date.getFullYear()==e.end_date.getFullYear()},scheduler.get_visible_events=function(e){var t=[];for(var i in this._events)this.is_visible_events(this._events[i])&&(!e||this._events[i]._timed)&&this.filter_event(i,this._events[i])&&t.push(this._events[i]);
return t},scheduler.filter_event=function(e,t){var i=this["filter_"+this._mode];return i?i(e,t):!0},scheduler._is_main_area_event=function(e){return!!e._timed},scheduler.render_view_data=function(e,t){if(!e){if(this._not_render)return void(this._render_wait=!0);this._render_wait=!1,this.clear_view(),e=this.get_visible_events(!(this._table_view||this.config.multi_day))}for(var i=0,s=e.length;s>i;i++)this._recalculate_timed(e[i]);if(this.config.multi_day&&!this._table_view){for(var n=[],r=[],i=0;i<e.length;i++)this._is_main_area_event(e[i])?n.push(e[i]):r.push(e[i]);
this._rendered_location=this._els.dhx_multi_day[0],this._table_view=!0,this.render_data(r,t),this._table_view=!1,this._rendered_location=this._els.dhx_cal_data[0],this._table_view=!1,this.render_data(n,t)}else this._rendered_location=this._els.dhx_cal_data[0],this.render_data(e,t)},scheduler._view_month_day=function(e){var t=scheduler.getActionData(e).date;scheduler.callEvent("onViewMoreClick",[t])&&scheduler.setCurrentView(t,"day")},scheduler._render_month_link=function(e){for(var t=this._rendered_location,i=this._lame_clone(e),s=e._sday;s<e._eday;s++){i._sday=s,i._eday=s+1;
var n=scheduler.date,r=scheduler._min_date;r=n.add(r,i._sweek,"week"),r=n.add(r,i._sday,"day");var a=scheduler.getEvents(r,n.add(r,1,"day")).length,d=this._get_event_bar_pos(i),o=d.x2-d.x,l=document.createElement("div");l.onclick=function(e){scheduler._view_month_day(e||event)},l.className="dhx_month_link",l.style.top=d.y+"px",l.style.left=d.x+"px",l.style.width=o+"px",l.innerHTML=scheduler.templates.month_events_link(r,a),this._rendered.push(l),t.appendChild(l)}},scheduler._recalculate_timed=function(e){if(e){var t;
t="object"!=typeof e?this._events[e]:e,t&&(t._timed=scheduler.isOneDayEvent(t))}},scheduler.attachEvent("onEventChanged",scheduler._recalculate_timed),scheduler.attachEvent("onEventAdded",scheduler._recalculate_timed),scheduler.render_data=function(e,t){e=this._pre_render_events(e,t);for(var i=0;i<e.length;i++)if(this._table_view)if("month"!=scheduler._mode)this.render_event_bar(e[i]);else{var s=scheduler.config.max_month_events;s!==1*s||e[i]._sorder<s?this.render_event_bar(e[i]):void 0!==s&&e[i]._sorder==s&&scheduler._render_month_link(e[i])
}else this.render_event(e[i])},scheduler._pre_render_events=function(e,t){var i=this.xy.bar_height,s=this._colsS.heights,n=this._colsS.heights=[0,0,0,0,0,0,0],r=this._els.dhx_cal_data[0];if(e=this._table_view?this._pre_render_events_table(e,t):this._pre_render_events_line(e,t),this._table_view)if(t)this._colsS.heights=s;else{var a=r.firstChild;if(a.rows){for(var d=0;d<a.rows.length;d++){n[d]++;var o=this._colsS.height-this.xy.month_head_height;if(n[d]*i>o){var l=a.rows[d].cells,h=o;1*this.config.max_month_events!==this.config.max_month_events||n[d]<=this.config.max_month_events?h=n[d]*i:(this.config.max_month_events+1)*i>o&&(h=(this.config.max_month_events+1)*i);
for(var _=0;_<l.length;_++)l[_].childNodes[1].style.height=h+"px";n[d]=(n[d-1]||0)+l[0].offsetHeight}n[d]=(n[d-1]||0)+a.rows[d].cells[0].offsetHeight}if(n.unshift(0),a.parentNode.offsetHeight<a.parentNode.scrollHeight&&!scheduler._colsS.scroll_fix&&scheduler.xy.scroll_width){var c=scheduler._colsS,u=c[c.col_length],f=c.heights.slice();u-=scheduler.xy.scroll_width||0,this._calc_scale_sizes(u,this._min_date,this._max_date),scheduler._colsS.heights=f,this.set_xy(this._els.dhx_cal_header[0],u,this.xy.scale_height),scheduler._render_scales(this._els.dhx_cal_header[0]),scheduler._render_month_scale(this._els.dhx_cal_data[0],this._get_timeunit_start(),this._min_date),c.scroll_fix=!0
}}else if(e.length||"visible"!=this._els.dhx_multi_day[0].style.visibility||(n[0]=-1),e.length||-1==n[0]){var g=(a.parentNode.childNodes,(n[0]+1)*i+1),v=g,m=g+"px";this.config.multi_day_height_limit&&(v=Math.min(g,this.config.multi_day_height_limit),m=v+"px"),r.style.top=this._els.dhx_cal_navline[0].offsetHeight+this._els.dhx_cal_header[0].offsetHeight+v+"px",r.style.height=this._obj.offsetHeight-parseInt(r.style.top,10)-(this.xy.margin_top||0)+"px";var p=this._els.dhx_multi_day[0];p.style.height=m,p.style.visibility=-1==n[0]?"hidden":"visible";
var x=this._els.dhx_multi_day[1];x.style.height=m,x.style.visibility=-1==n[0]?"hidden":"visible",x.className=n[0]?"dhx_multi_day_icon":"dhx_multi_day_icon_small",this._dy_shift=(n[0]+1)*i,n[0]=0,v!=g&&(r.style.top=parseInt(r.style.top)+2+"px",p.style.overflowY="auto",p.style.width=parseInt(p.style.width)-2+"px",x.style.position="fixed",x.style.top="",x.style.left="")}}return e},scheduler._get_event_sday=function(e){return Math.floor((e.start_date.valueOf()-this._min_date.valueOf())/864e5)},scheduler._get_event_mapped_end_date=function(e){var t=e.end_date;
if(this.config.separate_short_events){var i=(e.end_date-e.start_date)/6e4;i<this._min_mapped_duration&&(t=this.date.add(t,this._min_mapped_duration-i,"minute"))}return t},scheduler._pre_render_events_line=function(e,t){e.sort(function(e,t){return e.start_date.valueOf()==t.start_date.valueOf()?e.id>t.id?1:-1:e.start_date>t.start_date?1:-1});var i=[],s=[];this._min_mapped_duration=Math.ceil(60*this.xy.min_event_height/this.config.hour_size_px);for(var n=0;n<e.length;n++){var r=e[n],a=r.start_date,d=r.end_date,o=a.getHours(),l=d.getHours();
if(r._sday=this._get_event_sday(r),this._ignores[r._sday])e.splice(n,1),n--;else{if(i[r._sday]||(i[r._sday]=[]),!t){r._inner=!1;for(var h=i[r._sday];h.length;){var _=h[h.length-1],c=this._get_event_mapped_end_date(_);if(!(c.valueOf()<=r.start_date.valueOf()))break;h.splice(h.length-1,1)}for(var u=h.length,f=!1,g=0;g<h.length;g++){var _=h[g],c=this._get_event_mapped_end_date(_);if(c.valueOf()<=r.start_date.valueOf()){f=!0,r._sorder=_._sorder,u=g,r._inner=!0;break}}if(h.length&&(h[h.length-1]._inner=!0),!f)if(h.length)if(h.length<=h[h.length-1]._sorder){if(h[h.length-1]._sorder)for(g=0;g<h.length;g++){for(var v=!1,m=0;m<h.length;m++)if(h[m]._sorder==g){v=!0;
break}if(!v){r._sorder=g;break}}else r._sorder=0;r._inner=!0}else{var p=h[0]._sorder;for(g=1;g<h.length;g++)h[g]._sorder>p&&(p=h[g]._sorder);r._sorder=p+1,r._inner=!1}else r._sorder=0;h.splice(u,u==h.length?0:1,r),h.length>(h.max_count||0)?(h.max_count=h.length,r._count=h.length):r._count=r._count?r._count:1}(o<this.config.first_hour||l>=this.config.last_hour)&&(s.push(r),e[n]=r=this._copy_event(r),o<this.config.first_hour&&(r.start_date.setHours(this.config.first_hour),r.start_date.setMinutes(0)),l>=this.config.last_hour&&(r.end_date.setMinutes(0),r.end_date.setHours(this.config.last_hour)),r.start_date>r.end_date||o==this.config.last_hour)&&(e.splice(n,1),n--)
}}if(!t){for(var n=0;n<e.length;n++)e[n]._count=i[e[n]._sday].max_count;for(var n=0;n<s.length;n++)s[n]._count=i[s[n]._sday].max_count}return e},scheduler._time_order=function(e){e.sort(function(e,t){return e.start_date.valueOf()==t.start_date.valueOf()?e._timed&&!t._timed?1:!e._timed&&t._timed?-1:e.id>t.id?1:-1:e.start_date>t.start_date?1:-1})},scheduler._pre_render_events_table=function(e,t){this._time_order(e);for(var i,s=[],n=[[],[],[],[],[],[],[]],r=this._colsS.heights,a=this._cols.length,d={},o=0;o<e.length;o++){var l=e[o],h=l.id;
d[h]||(d[h]={first_chunk:!0,last_chunk:!0});var _=d[h],c=i||l.start_date,u=l.end_date;c<this._min_date&&(_.first_chunk=!1,c=this._min_date),u>this._max_date&&(_.last_chunk=!1,u=this._max_date);var f=this.locate_holder_day(c,!1,l);if(l._sday=f%a,!this._ignores[l._sday]||!l._timed){var g=this.locate_holder_day(u,!0,l)||a;l._eday=g%a||a,l._length=g-f,l._sweek=Math.floor((this._correct_shift(c.valueOf(),1)-this._min_date.valueOf())/(864e5*a));var v,m=n[l._sweek];for(v=0;v<m.length&&!(m[v]._eday<=l._sday);v++);if(l._sorder&&t||(l._sorder=v),l._sday+l._length<=a)i=null,s.push(l),m[v]=l,r[l._sweek]=m.length-1,l._first_chunk=_.first_chunk,l._last_chunk=_.last_chunk;
else{var p=this._copy_event(l);p.id=l.id,p._length=a-l._sday,p._eday=a,p._sday=l._sday,p._sweek=l._sweek,p._sorder=l._sorder,p.end_date=this.date.add(c,p._length,"day"),p._first_chunk=_.first_chunk,_.first_chunk&&(_.first_chunk=!1),s.push(p),m[v]=p,i=p.end_date,r[l._sweek]=m.length-1,o--}}}return s},scheduler._copy_dummy=function(){var e=new Date(this.start_date),t=new Date(this.end_date);this.start_date=e,this.end_date=t},scheduler._copy_event=function(e){return this._copy_dummy.prototype=e,new this._copy_dummy
},scheduler._rendered=[],scheduler.clear_view=function(){for(var e=0;e<this._rendered.length;e++){var t=this._rendered[e];t.parentNode&&t.parentNode.removeChild(t)}this._rendered=[]},scheduler.updateEvent=function(e){var t=this.getEvent(e);this.clear_event(e),t&&this.is_visible_events(t)&&this.filter_event(e,t)&&(this._table_view||this.config.multi_day||t._timed)&&(this.config.update_render?this.render_view_data():this.render_view_data([t],!0))},scheduler.clear_event=function(e){this.for_rendered(e,function(e,t){e.parentNode&&e.parentNode.removeChild(e),scheduler._rendered.splice(t,1)
})},scheduler._y_from_date=function(e){var t=60*e.getHours()+e.getMinutes();return Math.round((60*t*1e3-60*this.config.first_hour*60*1e3)*this.config.hour_size_px/36e5)%(24*this.config.hour_size_px)},scheduler._calc_event_y=function(e,t){t=t||0;var i=60*e.start_date.getHours()+e.start_date.getMinutes(),s=60*e.end_date.getHours()+e.end_date.getMinutes()||60*scheduler.config.last_hour,n=this._y_from_date(e.start_date),r=Math.max(t,(s-i)*this.config.hour_size_px/60);return{top:n,height:r}},scheduler.render_event=function(e){var t=scheduler.xy.menu_width,i=this.config.use_select_menu_space?0:t;
if(!(e._sday<0)){var s=scheduler.locate_holder(e._sday);if(s){var n=this._calc_event_y(e,scheduler.xy.min_event_height),r=n.top,a=n.height,d=e._count||1,o=e._sorder||0,l=Math.floor((s.clientWidth-i)/d),h=o*l+1;if(e._inner||(l*=d-o),this.config.cascade_event_display){var _=this.config.cascade_event_count,c=this.config.cascade_event_margin;h=o%_*c;var u=e._inner?(d-o-1)%_*c/2:0;l=Math.floor(s.clientWidth-i-h-u)}var f=this._render_v_bar(e,i+h,r,l,a,e._text_style,scheduler.templates.event_header(e.start_date,e.end_date,e),scheduler.templates.event_text(e.start_date,e.end_date,e));
if(this._rendered.push(f),s.appendChild(f),h=h+parseInt(s.style.left,10)+i,this._edit_id==e.id){f.style.zIndex=1,l=Math.max(l-4,scheduler.xy.editor_width),f=document.createElement("DIV"),f.setAttribute("event_id",e.id),this.set_xy(f,l,a-20,h,r+14),f.className="dhx_cal_event dhx_cal_editor";var g=scheduler.templates.event_class(e.start_date,e.end_date,e);g&&(f.className+=" "+g);var v=document.createElement("DIV");this.set_xy(v,l-6,a-26),v.style.cssText+=";margin:2px 2px 2px 2px;overflow:hidden;",f.appendChild(v),this._els.dhx_cal_data[0].appendChild(f),this._rendered.push(f),v.innerHTML="<textarea class='dhx_cal_editor'>"+e.text+"</textarea>",this._quirks7&&(v.firstChild.style.height=a-12+"px"),this._editor=v.firstChild,this._editor.onkeydown=function(e){if((e||event).shiftKey)return!0;
var t=(e||event).keyCode;t==scheduler.keys.edit_save&&scheduler.editStop(!0),t==scheduler.keys.edit_cancel&&scheduler.editStop(!1)},this._editor.onselectstart=function(e){return(e||event).cancelBubble=!0,!0},scheduler._focus(v.firstChild,!0),this._els.dhx_cal_data[0].scrollLeft=0}if(0!==this.xy.menu_width&&this._select_id==e.id){this.config.cascade_event_display&&this._drag_mode&&(f.style.zIndex=1);for(var m=this.config["icons_"+(this._edit_id==e.id?"edit":"select")],p="",x=e.color?"background-color: "+e.color+";":"",b=e.textColor?"color: "+e.textColor+";":"",y=0;y<m.length;y++)p+="<div class='dhx_menu_icon "+m[y]+"' style='"+x+b+"' title='"+this.locale.labels[m[y]]+"'></div>";
var w=this._render_v_bar(e,h-t+1,r,t,20*m.length+26-2,"","<div style='"+x+b+"' class='dhx_menu_head'></div>",p,!0);w.style.left=h-t+1,this._els.dhx_cal_data[0].appendChild(w),this._rendered.push(w)}this.config.drag_highlight&&this._drag_id==e.id&&this.highlightEventPosition(e)}}},scheduler._render_v_bar=function(e,t,i,s,n,r,a,d,o){var l=document.createElement("DIV"),h=e.id,_=o?"dhx_cal_event dhx_cal_select_menu":"dhx_cal_event",c=scheduler.templates.event_class(e.start_date,e.end_date,e);c&&(_=_+" "+c);
var u=e.color?"background:"+e.color+";":"",f=e.textColor?"color:"+e.textColor+";":"",g='<div event_id="'+h+'" class="'+_+'" style="position:absolute; top:'+i+"px; left:"+t+"px; width:"+(s-4)+"px; height:"+n+"px;"+(r||"")+'"></div>';l.innerHTML=g;var v=l.cloneNode(!0).firstChild;if(!o&&scheduler.renderEvent(v,e,s,n,a,d))return v;v=l.firstChild;var m='<div class="dhx_event_move dhx_header" style=" width:'+(s-6)+"px;"+u+'" >&nbsp;</div>';m+='<div class="dhx_event_move dhx_title" style="'+u+f+'">'+a+"</div>",m+='<div class="dhx_body" style=" width:'+(s-(this._quirks?4:14))+"px; height:"+(n-(this._quirks?20:30)+1)+"px;"+u+f+'">'+d+"</div>";
var p="dhx_event_resize dhx_footer";return o&&(p="dhx_resize_denied "+p),m+='<div class="'+p+'" style=" width:'+(s-8)+"px;"+(o?" margin-top:-1px;":"")+u+f+'" ></div>',v.innerHTML=m,v},scheduler.renderEvent=function(){return!1},scheduler.locate_holder=function(e){return"day"==this._mode?this._els.dhx_cal_data[0].firstChild:this._els.dhx_cal_data[0].childNodes[e]},scheduler.locate_holder_day=function(e,t){var i=Math.floor((this._correct_shift(e,1)-this._min_date)/864e5);return t&&this.date.time_part(e)&&i++,i
},scheduler._get_dnd_order=function(e,t,i){if(!this._drag_event)return e;this._drag_event._orig_sorder?e=this._drag_event._orig_sorder:this._drag_event._orig_sorder=e;for(var s=t*e;s+t>i;)e--,s-=t;return e=Math.max(e,0)},scheduler._get_event_bar_pos=function(e){var t=this._colsS[e._sday],i=this._colsS[e._eday];i==t&&(i=this._colsS[e._eday+1]);var s=this.xy.bar_height,n=e._sorder;if(e.id==this._drag_id){var r=this._colsS.heights[e._sweek+1]-this._colsS.heights[e._sweek]-this.xy.month_head_height;n=scheduler._get_dnd_order(n,s,r)
}var a=n*s,d=this._colsS.heights[e._sweek]+(this._colsS.height?this.xy.month_scale_height+2:2)+a;return{x:t,x2:i,y:d}},scheduler.render_event_bar=function(e){var t=this._rendered_location,i=this._get_event_bar_pos(e),s=i.y,n=i.x,r=i.x2,a="";if(r){var d=scheduler.config.resize_month_events&&"month"==this._mode&&(!e._timed||scheduler.config.resize_month_timed),o=document.createElement("DIV"),l=e.hasOwnProperty("_first_chunk")&&e._first_chunk,h=e.hasOwnProperty("_last_chunk")&&e._last_chunk,_=d&&(e._timed||l),c=d&&(e._timed||h),u="dhx_cal_event_clear";
(!e._timed||d)&&(u="dhx_cal_event_line"),l&&(u+=" dhx_cal_event_line_start"),h&&(u+=" dhx_cal_event_line_end"),_&&(a+="<div class='dhx_event_resize dhx_event_resize_start'></div>"),c&&(a+="<div class='dhx_event_resize dhx_event_resize_end'></div>");var f=scheduler.templates.event_class(e.start_date,e.end_date,e);f&&(u+=" "+f);var g=e.color?"background:"+e.color+";":"",v=e.textColor?"color:"+e.textColor+";":"",m=["position:absolute","top:"+s+"px","left:"+n+"px","width:"+(r-n-15)+"px",v,g,e._text_style||""].join(";"),p='<div event_id="'+e.id+'" class="'+u+'" style="'+m+'">';
d&&(p+=a),"month"==scheduler.getState().mode&&(e=scheduler.getEvent(e.id)),e._timed&&(p+=scheduler.templates.event_bar_date(e.start_date,e.end_date,e)),p+=scheduler.templates.event_bar_text(e.start_date,e.end_date,e)+"</div>",p+="</div>",o.innerHTML=p,this._rendered.push(o.firstChild),t.appendChild(o.firstChild)}},scheduler._locate_event=function(e){for(var t=null;e&&!t&&e.getAttribute;)t=e.getAttribute("event_id"),e=e.parentNode;return t},scheduler.edit=function(e){this._edit_id!=e&&(this.editStop(!1,e),this._edit_id=e,this.updateEvent(e))
},scheduler.editStop=function(e,t){if(!t||this._edit_id!=t){var i=this.getEvent(this._edit_id);i&&(e&&(i.text=this._editor.value),this._edit_id=null,this._editor=null,this.updateEvent(i.id),this._edit_stop_event(i,e))}},scheduler._edit_stop_event=function(e,t){this._new_event?(t?this.callEvent("onEventAdded",[e.id,e]):e&&this.deleteEvent(e.id,!0),this._new_event=null):t&&this.callEvent("onEventChanged",[e.id,e])},scheduler.getEvents=function(e,t){var i=[];for(var s in this._events){var n=this._events[s];
n&&(!e&&!t||n.start_date<t&&n.end_date>e)&&i.push(n)}return i},scheduler.getRenderedEvent=function(e){if(e){for(var t=scheduler._rendered,i=0;i<t.length;i++){var s=t[i];if(s.getAttribute("event_id")==e)return s}return null}},scheduler.showEvent=function(e,t){var i="number"==typeof e||"string"==typeof e?scheduler.getEvent(e):e;if(t=t||scheduler._mode,i&&(!this.checkEvent("onBeforeEventDisplay")||this.callEvent("onBeforeEventDisplay",[i,t]))){var s=scheduler.config.scroll_hour;scheduler.config.scroll_hour=i.start_date.getHours();
var n=scheduler.config.preserve_scroll;scheduler.config.preserve_scroll=!1;var r=i.color,a=i.textColor;scheduler.config.highlight_displayed_event&&(i.color=scheduler.config.displayed_event_color,i.textColor=scheduler.config.displayed_event_text_color),scheduler.setCurrentView(new Date(i.start_date),t),i.color=r,i.textColor=a,scheduler.config.scroll_hour=s,scheduler.config.preserve_scroll=n,scheduler.matrix&&scheduler.matrix[t]&&(scheduler._els.dhx_cal_data[0].scrollTop=getAbsoluteTop(scheduler.getRenderedEvent(i.id))-getAbsoluteTop(scheduler._els.dhx_cal_data[0])-20),scheduler.callEvent("onAfterEventDisplay",[i,t])
}},scheduler._append_drag_marker=function(e){if(!e.parentNode){var t=scheduler._els.dhx_cal_data[0],i=t.lastChild;i.className&&i.className.indexOf("dhx_scale_holder")<0&&i.previousSibling&&(i=i.previousSibling),i&&0===i.className.indexOf("dhx_scale_holder")&&i.appendChild(e)}},scheduler._update_marker_position=function(e,t){var i=scheduler._calc_event_y(t,0);e.style.top=i.top+"px",e.style.height=i.height+"px"},scheduler.highlightEventPosition=function(e){var t=document.createElement("div");t.setAttribute("event_id",e.id),this._rendered.push(t),this._update_marker_position(t,e);
var i=this.templates.drag_marker_class(e.start_date,e.end_date,e),s=this.templates.drag_marker_content(e.start_date,e.end_date,e);t.className="dhx_drag_marker",i&&(t.className+=" "+i),s&&(t.innerHTML=s),this._append_drag_marker(t)},scheduler._loaded={},scheduler._load=function(e,t){if(e=e||this._load_url){e+=(-1==e.indexOf("?")?"?":"&")+"timeshift="+(new Date).getTimezoneOffset(),this.config.prevent_cache&&(e+="&uid="+this.uid());var i;if(t=t||this._date,this._load_mode){var s=this.templates.load_format;
for(t=this.date[this._load_mode+"_start"](new Date(t.valueOf()));t>this._min_date;)t=this.date.add(t,-1,this._load_mode);i=t;for(var n=!0;i<this._max_date;)i=this.date.add(i,1,this._load_mode),this._loaded[s(t)]&&n?t=this.date.add(t,1,this._load_mode):n=!1;var r=i;do i=r,r=this.date.add(i,-1,this._load_mode);while(r>t&&this._loaded[s(r)]);if(t>=i)return!1;for(dhtmlxAjax.get(e+"&from="+s(t)+"&to="+s(i),function(e){scheduler.on_load(e)});i>t;)this._loaded[s(t)]=!0,t=this.date.add(t,1,this._load_mode)
}else dhtmlxAjax.get(e,function(e){scheduler.on_load(e)});return this.callEvent("onXLS",[]),!0}},scheduler.on_load=function(e){var t;t=this._process&&"xml"!=this._process?this[this._process].parse(e.xmlDoc.responseText):this._magic_parser(e),scheduler._process_loading(t),this.callEvent("onXLE",[])},scheduler._process_loading=function(e){this._loading=!0,this._not_render=!0;for(var t=0;t<e.length;t++)this.callEvent("onEventLoading",[e[t]])&&this.addEvent(e[t]);this._not_render=!1,this._render_wait&&this.render_view_data(),this._loading=!1,this._after_call&&this._after_call(),this._after_call=null
},scheduler._init_event=function(e){e.text=e.text||e._tagvalue||"",e.start_date=scheduler._init_date(e.start_date),e.end_date=scheduler._init_date(e.end_date)},scheduler._init_date=function(e){return e?"string"==typeof e?scheduler.templates.xml_date(e):new Date(e):null},scheduler.json={},scheduler.json.parse=function(data){"string"==typeof data&&(scheduler._temp=eval("("+data+")"),data=scheduler._temp?scheduler._temp.data||scheduler._temp.d||scheduler._temp:[]),data.dhx_security&&(dhtmlx.security_key=data.dhx_security);
var collections=scheduler._temp&&scheduler._temp.collections?scheduler._temp.collections:{},collections_loaded=!1;for(var key in collections)if(collections.hasOwnProperty(key)){collections_loaded=!0;var collection=collections[key],arr=scheduler.serverList[key];if(!arr)continue;arr.splice(0,arr.length);for(var j=0;j<collection.length;j++){var option=collection[j],obj={key:option.value,label:option.label};for(var option_key in option)if(option.hasOwnProperty(option_key)){if("value"==option_key||"label"==option_key)continue;
obj[option_key]=option[option_key]}arr.push(obj)}}collections_loaded&&scheduler.callEvent("onOptionsLoad",[]);for(var evs=[],i=0;i<data.length;i++){var event=data[i];scheduler._init_event(event),evs.push(event)}return evs},scheduler.parse=function(e,t){this._process=t,this.on_load({xmlDoc:{responseText:e}})},scheduler.load=function(e,t){"string"==typeof t&&(this._process=t,t=arguments[2]),this._load_url=e,this._after_call=t,this._load(e,this._date)},scheduler.setLoadMode=function(e){"all"==e&&(e=""),this._load_mode=e
},scheduler.serverList=function(e,t){return t?(this.serverList[e]=t.slice(0),this.serverList[e]):(this.serverList[e]=this.serverList[e]||[],this.serverList[e])},scheduler._userdata={},scheduler._magic_parser=function(e){var t;if(!e.getXMLTopNode){var i=e.xmlDoc.responseText;e=new dtmlXMLLoaderObject(function(){}),e.loadXMLString(i)}if(t=e.getXMLTopNode("data"),"data"!=t.tagName)return[];var s=t.getAttribute("dhx_security");s&&(dhtmlx.security_key=s);for(var n=e.doXPath("//coll_options"),r=0;r<n.length;r++){var a=n[r].getAttribute("for"),d=this.serverList[a];
if(d){d.splice(0,d.length);for(var o=e.doXPath(".//item",n[r]),l=0;l<o.length;l++){for(var h=o[l],_=h.attributes,c={key:o[l].getAttribute("value"),label:o[l].getAttribute("label")},u=0;u<_.length;u++){var f=_[u];"value"!=f.nodeName&&"label"!=f.nodeName&&(c[f.nodeName]=f.nodeValue)}d.push(c)}}}n.length&&scheduler.callEvent("onOptionsLoad",[]);for(var g=e.doXPath("//userdata"),r=0;r<g.length;r++){var v=this._xmlNodeToJSON(g[r]);this._userdata[v.name]=v.text}var m=[];t=e.doXPath("//event");for(var r=0;r<t.length;r++){var p=m[r]=this._xmlNodeToJSON(t[r]);
scheduler._init_event(p)}return m},scheduler._xmlNodeToJSON=function(e){for(var t={},i=0;i<e.attributes.length;i++)t[e.attributes[i].name]=e.attributes[i].value;for(var i=0;i<e.childNodes.length;i++){var s=e.childNodes[i];1==s.nodeType&&(t[s.tagName]=s.firstChild?s.firstChild.nodeValue:"")}return t.text||(t.text=e.firstChild?e.firstChild.nodeValue:""),t},scheduler.attachEvent("onXLS",function(){if(this.config.show_loading===!0){var e;e=this.config.show_loading=document.createElement("DIV"),e.className="dhx_loading",e.style.left=Math.round((this._x-128)/2)+"px",e.style.top=Math.round((this._y-15)/2)+"px",this._obj.appendChild(e)
}}),scheduler.attachEvent("onXLE",function(){var e=this.config.show_loading;e&&"object"==typeof e&&(this._obj.removeChild(e),this.config.show_loading=!0)}),scheduler.ical={parse:function(e){var t=e.match(RegExp(this.c_start+"[^\f]*"+this.c_end,""));if(t.length){t[0]=t[0].replace(/[\r\n]+(?=[a-z \t])/g," "),t[0]=t[0].replace(/\;[^:\r\n]*:/g,":");for(var i,s=[],n=RegExp("(?:"+this.e_start+")([^\f]*?)(?:"+this.e_end+")","g");null!==(i=n.exec(t));){for(var r,a={},d=/[^\r\n]+[\r\n]+/g;null!==(r=d.exec(i[1]));)this.parse_param(r.toString(),a);
a.uid&&!a.id&&(a.id=a.uid),s.push(a)}return s}},parse_param:function(e,t){var i=e.indexOf(":");if(-1!=i){var s=e.substr(0,i).toLowerCase(),n=e.substr(i+1).replace(/\\\,/g,",").replace(/[\r\n]+$/,"");"summary"==s?s="text":"dtstart"==s?(s="start_date",n=this.parse_date(n,0,0)):"dtend"==s&&(s="end_date",n=this.parse_date(n,0,0)),t[s]=n}},parse_date:function(e,t,i){var s=e.split("T");s[1]&&(t=s[1].substr(0,2),i=s[1].substr(2,2));var n=s[0].substr(0,4),r=parseInt(s[0].substr(4,2),10)-1,a=s[0].substr(6,2);
return scheduler.config.server_utc&&!s[1]?new Date(Date.UTC(n,r,a,t,i)):new Date(n,r,a,t,i)},c_start:"BEGIN:VCALENDAR",e_start:"BEGIN:VEVENT",e_end:"END:VEVENT",c_end:"END:VCALENDAR"},scheduler._lightbox_controls={},scheduler.formSection=function(e){var t=this.config.lightbox.sections,i=0;for(i;i<t.length&&t[i].name!=e;i++);var s=t[i];scheduler._lightbox||scheduler.getLightbox();var n=document.getElementById(s.id),r=n.nextSibling,a={section:s,header:n,node:r,getValue:function(e){return scheduler.form_blocks[s.type].get_value(r,e||{},s)
},setValue:function(e,t){return scheduler.form_blocks[s.type].set_value(r,e,t||{},s)}},d=scheduler._lightbox_controls["get_"+s.type+"_control"];return d?d(a):a},scheduler._lightbox_controls.get_template_control=function(e){return e.control=e.node,e},scheduler._lightbox_controls.get_select_control=function(e){return e.control=e.node.getElementsByTagName("select")[0],e},scheduler._lightbox_controls.get_textarea_control=function(e){return e.control=e.node.getElementsByTagName("textarea")[0],e},scheduler._lightbox_controls.get_time_control=function(e){return e.control=e.node.getElementsByTagName("select"),e
},scheduler.form_blocks={template:{render:function(e){var t=(e.height||"30")+"px";return"<div class='dhx_cal_ltext dhx_cal_template' style='height:"+t+";'></div>"},set_value:function(e,t){e.innerHTML=t||""},get_value:function(e){return e.innerHTML||""},focus:function(){}},textarea:{render:function(e){var t=(e.height||"130")+"px";return"<div class='dhx_cal_ltext' style='height:"+t+";'><textarea></textarea></div>"},set_value:function(e,t){e.firstChild.value=t||""},get_value:function(e){return e.firstChild.value
},focus:function(e){var t=e.firstChild;scheduler._focus(t,!0)}},select:{render:function(e){for(var t=(e.height||"23")+"px",i="<div class='dhx_cal_ltext' style='height:"+t+";'><select style='width:100%;'>",s=0;s<e.options.length;s++)i+="<option value='"+e.options[s].key+"'>"+e.options[s].label+"</option>";return i+="</select></div>"},set_value:function(e,t,i,s){var n=e.firstChild;!n._dhx_onchange&&s.onchange&&(n.onchange=s.onchange,n._dhx_onchange=!0),"undefined"==typeof t&&(t=(n.options[0]||{}).value),n.value=t||""
},get_value:function(e){return e.firstChild.value},focus:function(e){var t=e.firstChild;scheduler._focus(t,!0)}},time:{render:function(e){e.time_format||(e.time_format=["%H:%i","%d","%m","%Y"]),e._time_format_order={};var t=e.time_format,i=scheduler.config,s=this.date.date_part(scheduler._currentDate()),n=1440,r=0;scheduler.config.limit_time_select&&(n=60*i.last_hour+1,r=60*i.first_hour,s.setHours(i.first_hour));for(var a="",d=0;d<t.length;d++){var o=t[d];switch(d>0&&(a+=" "),o){case"%Y":e._time_format_order[3]=d,a+="<select>";
for(var l=s.getFullYear()-5,h=0;10>h;h++)a+="<option value='"+(l+h)+"'>"+(l+h)+"</option>";a+="</select> ";break;case"%m":e._time_format_order[2]=d,a+="<select>";for(var h=0;12>h;h++)a+="<option value='"+h+"'>"+this.locale.date.month_full[h]+"</option>";a+="</select>";break;case"%d":e._time_format_order[1]=d,a+="<select>";for(var h=1;32>h;h++)a+="<option value='"+h+"'>"+h+"</option>";a+="</select>";break;case"%H:%i":e._time_format_order[0]=d,a+="<select>";var h=r,_=s.getDate();for(e._time_values=[];n>h;){var c=this.templates.time_picker(s);
a+="<option value='"+h+"'>"+c+"</option>",e._time_values.push(h),s.setTime(s.valueOf()+60*this.config.time_step*1e3);var u=s.getDate()!=_?1:0;h=24*u*60+60*s.getHours()+s.getMinutes()}a+="</select>"}}return"<div style='height:30px;padding-top:0px;font-size:inherit;' class='dhx_section_time'>"+a+"<span style='font-weight:normal; font-size:10pt;'> &nbsp;&ndash;&nbsp; </span>"+a+"</div>"},set_value:function(e,t,i,s){function n(e,t,i){for(var n=s._time_values,r=60*i.getHours()+i.getMinutes(),a=r,d=!1,o=0;o<n.length;o++){var h=n[o];
if(h===r){d=!0;break}r>h&&(a=h)}e[t+l[0]].value=d?r:a,d||a||(e[t+l[0]].selectedIndex=-1),e[t+l[1]].value=i.getDate(),e[t+l[2]].value=i.getMonth(),e[t+l[3]].value=i.getFullYear()}var r,a,d=scheduler.config,o=e.getElementsByTagName("select"),l=s._time_format_order;if(d.full_day){if(!e._full_day){var h="<label class='dhx_fullday'><input type='checkbox' name='full_day' value='true'> "+scheduler.locale.labels.full_day+"&nbsp;</label></input>";scheduler.config.wide_form||(h=e.previousSibling.innerHTML+h),e.previousSibling.innerHTML=h,e._full_day=!0
}var _=e.previousSibling.getElementsByTagName("input")[0];_.checked=0===scheduler.date.time_part(i.start_date)&&0===scheduler.date.time_part(i.end_date),o[l[0]].disabled=_.checked,o[l[0]+o.length/2].disabled=_.checked,_.onclick=function(){if(_.checked){var t={};scheduler.form_blocks.time.get_value(e,t,s),r=scheduler.date.date_part(t.start_date),a=scheduler.date.date_part(t.end_date),(+a==+r||+a>=+r&&(0!==i.end_date.getHours()||0!==i.end_date.getMinutes()))&&(a=scheduler.date.add(a,1,"day"))}o[l[0]].disabled=_.checked,o[l[0]+o.length/2].disabled=_.checked,n(o,0,r||i.start_date),n(o,4,a||i.end_date)
}}if(d.auto_end_date&&d.event_duration)for(var c=function(){r=new Date(o[l[3]].value,o[l[2]].value,o[l[1]].value,0,o[l[0]].value),a=new Date(r.getTime()+60*scheduler.config.event_duration*1e3),n(o,4,a)},u=0;4>u;u++)o[u].onchange=c;n(o,0,i.start_date),n(o,4,i.end_date)},get_value:function(e,t,i){var s=e.getElementsByTagName("select"),n=i._time_format_order;return t.start_date=new Date(s[n[3]].value,s[n[2]].value,s[n[1]].value,0,s[n[0]].value),t.end_date=new Date(s[n[3]+4].value,s[n[2]+4].value,s[n[1]+4].value,0,s[n[0]+4].value),t.end_date<=t.start_date&&(t.end_date=scheduler.date.add(t.start_date,scheduler.config.time_step,"minute")),{start_date:new Date(t.start_date),end_date:new Date(t.end_date)}
},focus:function(e){scheduler._focus(e.getElementsByTagName("select")[0])}}},scheduler.showCover=function(e){if(e){e.style.display="block";var t=window.pageYOffset||document.body.scrollTop||document.documentElement.scrollTop,i=window.pageXOffset||document.body.scrollLeft||document.documentElement.scrollLeft,s=window.innerHeight||document.documentElement.clientHeight;e.style.top=t?Math.round(t+Math.max((s-e.offsetHeight)/2,0))+"px":Math.round(Math.max((s-e.offsetHeight)/2,0)+9)+"px",e.style.left=document.documentElement.scrollWidth>document.body.offsetWidth?Math.round(i+(document.body.offsetWidth-e.offsetWidth)/2)+"px":Math.round((document.body.offsetWidth-e.offsetWidth)/2)+"px"
}this.show_cover()},scheduler.showLightbox=function(e){if(e){if(!this.callEvent("onBeforeLightbox",[e]))return void(this._new_event&&(this._new_event=null));var t=this.getLightbox();this.showCover(t),this._fill_lightbox(e,t),this.callEvent("onLightbox",[e])}},scheduler._fill_lightbox=function(e,t){var i=this.getEvent(e),s=t.getElementsByTagName("span");scheduler.templates.lightbox_header?(s[1].innerHTML="",s[2].innerHTML=scheduler.templates.lightbox_header(i.start_date,i.end_date,i)):(s[1].innerHTML=this.templates.event_header(i.start_date,i.end_date,i),s[2].innerHTML=(this.templates.event_bar_text(i.start_date,i.end_date,i)||"").substr(0,70));
for(var n=this.config.lightbox.sections,r=0;r<n.length;r++){var a=n[r],d=document.getElementById(a.id).nextSibling,o=this.form_blocks[a.type],l=void 0!==i[a.map_to]?i[a.map_to]:a.default_value;o.set_value.call(this,d,l,i,a),n[r].focus&&o.focus.call(this,d)}scheduler._lightbox_id=e},scheduler._lightbox_out=function(e){for(var t=this.config.lightbox.sections,i=0;i<t.length;i++){var s=document.getElementById(t[i].id);s=s?s.nextSibling:s;var n=this.form_blocks[t[i].type],r=n.get_value.call(this,s,e,t[i]);
"auto"!=t[i].map_to&&(e[t[i].map_to]=r)}return e},scheduler._empty_lightbox=function(e){{var t=scheduler._lightbox_id,i=this.getEvent(t);this.getLightbox()}this._lame_copy(i,e),this.setEvent(i.id,i),this._edit_stop_event(i,!0),this.render_view_data()},scheduler.hide_lightbox=function(){this.hideCover(this.getLightbox()),this._lightbox_id=null,this.callEvent("onAfterLightbox",[])},scheduler.hideCover=function(e){e&&(e.style.display="none"),this.hide_cover()},scheduler.hide_cover=function(){this._cover&&this._cover.parentNode.removeChild(this._cover),this._cover=null
},scheduler.show_cover=function(){if(!this._cover){this._cover=document.createElement("DIV"),this._cover.className="dhx_cal_cover";var e=void 0!==document.height?document.height:document.body.offsetHeight,t=document.documentElement?document.documentElement.scrollHeight:0;this._cover.style.height=Math.max(e,t)+"px",document.body.appendChild(this._cover)}},scheduler.save_lightbox=function(){var e=this._lightbox_out({},this._lame_copy(this.getEvent(this._lightbox_id)));(!this.checkEvent("onEventSave")||this.callEvent("onEventSave",[this._lightbox_id,e,this._new_event]))&&(this._empty_lightbox(e),this.hide_lightbox())
},scheduler.startLightbox=function(e,t){this._lightbox_id=e,this._custom_lightbox=!0,this._temp_lightbox=this._lightbox,this._lightbox=t,this.showCover(t)},scheduler.endLightbox=function(e,t){this._edit_stop_event(scheduler.getEvent(this._lightbox_id),e),e&&scheduler.render_view_data(),this.hideCover(t),this._custom_lightbox&&(this._lightbox=this._temp_lightbox,this._custom_lightbox=!1),this._temp_lightbox=this._lightbox_id=null},scheduler.resetLightbox=function(){scheduler._lightbox&&!scheduler._custom_lightbox&&scheduler._lightbox.parentNode.removeChild(scheduler._lightbox),scheduler._lightbox=null
},scheduler.cancel_lightbox=function(){this.callEvent("onEventCancel",[this._lightbox_id,this._new_event]),this.endLightbox(!1),this.hide_lightbox()},scheduler._init_lightbox_events=function(){this.getLightbox().onclick=function(e){var t=e?e.target:event.srcElement;if(t.className||(t=t.previousSibling),t&&t.className)switch(t.className){case"dhx_save_btn":scheduler.save_lightbox();break;case"dhx_delete_btn":var i=scheduler.locale.labels.confirm_deleting;scheduler._dhtmlx_confirm(i,scheduler.locale.labels.title_confirm_deleting,function(){scheduler.deleteEvent(scheduler._lightbox_id),scheduler._new_event=null,scheduler.hide_lightbox()
});break;case"dhx_cancel_btn":scheduler.cancel_lightbox();break;default:if(t.getAttribute("dhx_button"))scheduler.callEvent("onLightboxButton",[t.className,t,e]);else{var s,n,r;-1!=t.className.indexOf("dhx_custom_button")&&(-1!=t.className.indexOf("dhx_custom_button_")?(s=t.parentNode.getAttribute("index"),r=t.parentNode.parentNode):(s=t.getAttribute("index"),r=t.parentNode,t=t.firstChild)),s&&(n=scheduler.form_blocks[scheduler.config.lightbox.sections[s].type],n.button_click(s,t,r,r.nextSibling))
}}},this.getLightbox().onkeydown=function(e){switch((e||event).keyCode){case scheduler.keys.edit_save:if((e||event).shiftKey)return;scheduler.save_lightbox();break;case scheduler.keys.edit_cancel:scheduler.cancel_lightbox()}}},scheduler.setLightboxSize=function(){var e=this._lightbox;if(e){var t=e.childNodes[1];t.style.height="0px",t.style.height=t.scrollHeight+"px",e.style.height=t.scrollHeight+scheduler.xy.lightbox_additional_height+"px",t.style.height=t.scrollHeight+"px"}},scheduler._init_dnd_events=function(){dhtmlxEvent(document.body,"mousemove",scheduler._move_while_dnd),dhtmlxEvent(document.body,"mouseup",scheduler._finish_dnd),scheduler._init_dnd_events=function(){}
},scheduler._move_while_dnd=function(e){if(scheduler._dnd_start_lb){document.dhx_unselectable||(document.body.className+=" dhx_unselectable",document.dhx_unselectable=!0);var t=scheduler.getLightbox(),i=e&&e.target?[e.pageX,e.pageY]:[event.clientX,event.clientY];t.style.top=scheduler._lb_start[1]+i[1]-scheduler._dnd_start_lb[1]+"px",t.style.left=scheduler._lb_start[0]+i[0]-scheduler._dnd_start_lb[0]+"px"}},scheduler._ready_to_dnd=function(e){var t=scheduler.getLightbox();scheduler._lb_start=[parseInt(t.style.left,10),parseInt(t.style.top,10)],scheduler._dnd_start_lb=e&&e.target?[e.pageX,e.pageY]:[event.clientX,event.clientY]
},scheduler._finish_dnd=function(){scheduler._lb_start&&(scheduler._lb_start=scheduler._dnd_start_lb=!1,document.body.className=document.body.className.replace(" dhx_unselectable",""),document.dhx_unselectable=!1)},scheduler.getLightbox=function(){if(!this._lightbox){var e=document.createElement("DIV");e.className="dhx_cal_light",scheduler.config.wide_form&&(e.className+=" dhx_cal_light_wide"),scheduler.form_blocks.recurring&&(e.className+=" dhx_cal_light_rec"),/msie|MSIE 6/.test(navigator.userAgent)&&(e.className+=" dhx_ie6"),e.style.visibility="hidden";
for(var t=this._lightbox_template,i=this.config.buttons_left,s=0;s<i.length;s++)t+="<div class='dhx_btn_set dhx_left_btn_set "+i[s]+"_set'><div dhx_button='1' class='"+i[s]+"'></div><div>"+scheduler.locale.labels[i[s]]+"</div></div>";i=this.config.buttons_right;for(var s=0;s<i.length;s++)t+="<div class='dhx_btn_set dhx_right_btn_set "+i[s]+"_set' style='float:right;'><div dhx_button='1' class='"+i[s]+"'></div><div>"+scheduler.locale.labels[i[s]]+"</div></div>";t+="</div>",e.innerHTML=t,scheduler.config.drag_lightbox&&(e.firstChild.onmousedown=scheduler._ready_to_dnd,e.firstChild.onselectstart=function(){return!1
},e.firstChild.style.cursor="pointer",scheduler._init_dnd_events()),document.body.insertBefore(e,document.body.firstChild),this._lightbox=e;var n=this.config.lightbox.sections;t="";for(var s=0;s<n.length;s++){var r=this.form_blocks[n[s].type];if(r){n[s].id="area_"+this.uid();var a="";n[s].button&&(a="<div class='dhx_custom_button' index='"+s+"'><div class='dhx_custom_button_"+n[s].button+"'></div><div>"+this.locale.labels["button_"+n[s].button]+"</div></div>"),this.config.wide_form&&(t+="<div class='dhx_wrap_section'>");
var d=this.locale.labels["section_"+n[s].name];"string"!=typeof d&&(d=n[s].name),t+="<div id='"+n[s].id+"' class='dhx_cal_lsection'>"+a+d+"</div>"+r.render.call(this,n[s]),t+="</div>"}}for(var o=e.getElementsByTagName("div"),s=0;s<o.length;s++){var l=o[s];if("dhx_cal_larea"==l.className){l.innerHTML=t;break}}this.setLightboxSize(),this._init_lightbox_events(this),e.style.display="none",e.style.visibility="visible"}return this._lightbox},scheduler._lightbox_template="<div class='dhx_cal_ltitle'><span class='dhx_mark'>&nbsp;</span><span class='dhx_time'></span><span class='dhx_title'></span></div><div class='dhx_cal_larea'></div>",scheduler._init_touch_events=function(){"force"!=this.config.touch&&(this.config.touch=this.config.touch&&(-1!=navigator.userAgent.indexOf("Mobile")||-1!=navigator.userAgent.indexOf("iPad")||-1!=navigator.userAgent.indexOf("Android")||-1!=navigator.userAgent.indexOf("Touch"))),this.config.touch&&(this.xy.scroll_width=0,window.navigator.msPointerEnabled?(this._touch_events(["MSPointerMove","MSPointerDown","MSPointerUp"],function(e){return e.pointerType==e.MSPOINTER_TYPE_MOUSE?null:e
},function(e){return!e||e.pointerType==e.MSPOINTER_TYPE_MOUSE}),this._obj.ondblclick=function(){}):this._touch_events(["touchmove","touchstart","touchend"],function(e){return e.touches&&e.touches.length>1?null:e.touches[0]?{target:e.target,pageX:e.touches[0].pageX,pageY:e.touches[0].pageY}:e},function(){return!1}))},scheduler._touch_events=function(e,t,i){function s(e,t,i){dhtmlxEvent(e,t,function(e){return scheduler._is_lightbox_open()?!0:i(e)})}function n(e,t,i){if(e&&t){var s=Math.abs(e.pageY-t.pageY),n=Math.abs(e.pageX-t.pageX);
n>i&&(!s||n/s>3)&&(e.pageX>t.pageX?scheduler._click.dhx_cal_next_button():scheduler._click.dhx_cal_prev_button())}}function r(e){scheduler._hide_global_tip(),l&&(scheduler._on_mouse_up(t(e||event)),scheduler._temp_touch_block=!1),scheduler._drag_id=null,scheduler._drag_mode=null,scheduler._drag_pos=null,clearTimeout(o),l=_=!1,h=!0}var a,d,o,l,h,_,c=-1!=navigator.userAgent.indexOf("Android")&&-1!=navigator.userAgent.indexOf("WebKit"),u=0;s(document.body,e[0],function(e){if(!i(e)){if(l)return scheduler._on_mouse_move(t(e)),scheduler._update_global_tip(),e.preventDefault&&e.preventDefault(),e.cancelBubble=!0,!1;
if(d&&c&&n(d,t(e),0),d=t(e),_)return d?void((a.target!=d.target||Math.abs(a.pageX-d.pageX)>5||Math.abs(a.pageY-d.pageY)>5)&&(h=!0,clearTimeout(o))):void(h=!0)}}),s(this._els.dhx_cal_data[0],"scroll",r),s(this._els.dhx_cal_data[0],"touchcancel",r),s(this._els.dhx_cal_data[0],"contextmenu",function(e){return _?(e&&e.preventDefault&&e.preventDefault(),(e||event).cancelBubble=!0,!1):void 0}),s(this._els.dhx_cal_data[0],e[1],function(e){if(!i(e)){var s;if(l=h=!1,_=!0,scheduler._temp_touch_block=!0,s=d=t(e),!s)return void(h=!0);
var n=new Date;if(!h&&!l&&250>n-u)return scheduler._click.dhx_cal_data(s),window.setTimeout(function(){scheduler._on_dbl_click(s)},50),e.preventDefault&&e.preventDefault(),e.cancelBubble=!0,scheduler._block_next_stop=!0,!1;u=n,h||l||!scheduler.config.touch_drag||(o=setTimeout(function(){l=!0;var e=a.target;if(e&&e.className&&-1!=e.className.indexOf("dhx_body")&&(e=e.previousSibling),scheduler._on_mouse_down(a,e),scheduler._drag_mode&&"create"!=scheduler._drag_mode){var t=-1;if(scheduler.for_rendered(scheduler._drag_id,function(e,i){t=e.getBoundingClientRect().top,e.style.display="none",scheduler._rendered.splice(i,1)
}),t>=0){var i=scheduler.config.time_step;scheduler._move_pos_shift=i*Math.round(60*(s.pageY-t)/(scheduler.config.hour_size_px*i))}}scheduler.config.touch_tip&&scheduler._show_global_tip(),scheduler._on_mouse_move(a)},scheduler.config.touch_drag),a=s)}}),s(this._els.dhx_cal_data[0],e[2],function(e){return i(e)?void 0:(l||n(a,d,200),l&&(scheduler._ignore_next_click=!0),r(e),scheduler._block_next_stop?(scheduler._block_next_stop=!1,e.preventDefault&&e.preventDefault(),e.cancelBubble=!0,!1):void 0)}),dhtmlxEvent(document.body,e[2],r)
},scheduler._show_global_tip=function(){scheduler._hide_global_tip();var e=scheduler._global_tip=document.createElement("DIV");e.className="dhx_global_tip",scheduler._update_global_tip(1),document.body.appendChild(e)},scheduler._update_global_tip=function(e){var t=scheduler._global_tip;if(t){var i="";if(scheduler._drag_id&&!e){var s=scheduler.getEvent(scheduler._drag_id);s&&(i="<div>"+(s._timed?scheduler.templates.event_header(s.start_date,s.end_date,s):scheduler.templates.day_date(s.start_date,s.end_date,s))+"</div>")
}t.innerHTML="create"==scheduler._drag_mode||"new-size"==scheduler._drag_mode?(scheduler.locale.drag_to_create||"Drag to create")+i:(scheduler.locale.drag_to_move||"Drag to move")+i}},scheduler._hide_global_tip=function(){var e=scheduler._global_tip;e&&e.parentNode&&(e.parentNode.removeChild(e),scheduler._global_tip=0)},scheduler._dp_init=function(e){e._methods=["_set_event_text_style","","changeEventId","_dp_hook_delete"],this._dp_hook_delete=function(e){return this.deleteEvent(e,!0)},this.attachEvent("onEventAdded",function(t){!this._loading&&this._validId(t)&&e.setUpdated(t,!0,"inserted")
}),this.attachEvent("onConfirmedBeforeEventDelete",function(t){if(this._validId(t)){var i=e.getState(t);return"inserted"==i||this._new_event?(e.setUpdated(t,!1),!0):"deleted"==i?!1:"true_deleted"==i?!0:(e.setUpdated(t,!0,"deleted"),!1)}}),this.attachEvent("onEventChanged",function(t){!this._loading&&this._validId(t)&&e.setUpdated(t,!0,"updated")}),e._getRowData=function(e){var t=this.obj.getEvent(e),i={};for(var s in t)0!==s.indexOf("_")&&(i[s]=t[s]&&t[s].getUTCFullYear?this.obj.templates.xml_format(t[s]):t[s]);
return i},e._clearUpdateFlag=function(){},e.attachEvent("insertCallback",scheduler._update_callback),e.attachEvent("updateCallback",scheduler._update_callback),e.attachEvent("deleteCallback",function(e,t){this.obj.setUserData(t,this.action_param,"true_deleted"),this.obj.deleteEvent(t)})},scheduler._validId=function(){return!0},scheduler.setUserData=function(e,t,i){e?this.getEvent(e)[t]=i:this._userdata[t]=i},scheduler.getUserData=function(e,t){return e?this.getEvent(e)[t]:this._userdata[t]},scheduler._set_event_text_style=function(e,t){this.for_rendered(e,function(e){e.style.cssText+=";"+t
});var i=this.getEvent(e);i._text_style=t,this.event_updated(i)},scheduler._update_callback=function(e){var t=scheduler._xmlNodeToJSON(e.firstChild);t.text=t.text||t._tagvalue,t.start_date=scheduler.templates.xml_date(t.start_date),t.end_date=scheduler.templates.xml_date(t.end_date),scheduler.addEvent(t)},scheduler._skin_settings={fix_tab_position:[1,0],use_select_menu_space:[1,0],wide_form:[1,0],hour_size_px:[44,42],displayed_event_color:["#ff4a4a","ffc5ab"],displayed_event_text_color:["#ffef80","7e2727"]},scheduler._skin_xy={lightbox_additional_height:[90,50],nav_height:[59,22],bar_height:[24,20]},scheduler._configure=function(e,t,i){for(var s in t)"undefined"==typeof e[s]&&(e[s]=t[s][i])
},scheduler._skin_init=function(){if(!scheduler.skin)for(var e=document.getElementsByTagName("link"),t=0;t<e.length;t++){var i=e[t].href.match("dhtmlxscheduler_([a-z]+).css");if(i){scheduler.skin=i[1];break}}var s=0;if(!scheduler.skin||"classic"!==scheduler.skin&&"glossy"!==scheduler.skin||(s=1),this._configure(scheduler.config,scheduler._skin_settings,s),this._configure(scheduler.xy,scheduler._skin_xy,s),!s){var n=scheduler.config.minicalendar;n&&(n.padding=14),scheduler.templates.event_bar_date=function(e){return"• <b>"+scheduler.templates.event_date(e)+"</b> "
},scheduler.attachEvent("onTemplatesReady",function(){var e=scheduler.date.date_to_str("%d");scheduler.templates._old_month_day||(scheduler.templates._old_month_day=scheduler.templates.month_day);var t=scheduler.templates._old_month_day;if(scheduler.templates.month_day=function(i){if("month"==this._mode){var s=e(i);return 1==i.getDate()&&(s=scheduler.locale.date.month_full[i.getMonth()]+" "+s),+i==+scheduler.date.date_part(new Date)&&(s=scheduler.locale.labels.dhx_cal_today_button+" "+s),s}return t.call(this,i)
},scheduler.config.fix_tab_position){for(var i=scheduler._els.dhx_cal_navline[0].getElementsByTagName("div"),s=null,n=211,r=0;r<i.length;r++){var a=i[r],d=a.getAttribute("name");if(d)switch(a.style.right="auto",d){case"day_tab":a.style.left="14px",a.className+=" dhx_cal_tab_first";break;case"week_tab":a.style.left="75px";break;case"month_tab":a.style.left="136px",a.className+=" dhx_cal_tab_last";break;default:a.style.left=n+"px",a.className+=" dhx_cal_tab_standalone",n=n+14+a.offsetWidth}else 0===(a.className||"").indexOf("dhx_minical_icon")&&a.parentNode==scheduler._els.dhx_cal_navline[0]&&(s=a)
}s&&(s.style.left=n+"px")}scheduler.skin&&"flat"===scheduler.skin&&(scheduler.xy.scale_height=35,scheduler.templates.hour_scale=function(e){var t=e.getMinutes();t=10>t?"0"+t:t;var i="<span class='dhx_scale_h'>"+e.getHours()+"</span><span class='dhx_scale_m'>&nbsp;"+t+"</span>";return i})}),scheduler._skin_init=function(){}}},window.jQuery&&!function(e){var t=[];e.fn.dhx_scheduler=function(i){if("string"!=typeof i){var s=[];return this.each(function(){if(this&&this.getAttribute&&!this.getAttribute("dhxscheduler")){for(var e in i)"data"!=e&&(scheduler.config[e]=i[e]);
this.getElementsByTagName("div").length||(this.innerHTML='<div class="dhx_cal_navline"><div class="dhx_cal_prev_button">&nbsp;</div><div class="dhx_cal_next_button">&nbsp;</div><div class="dhx_cal_today_button"></div><div class="dhx_cal_date"></div><div class="dhx_cal_tab" name="day_tab" style="right:204px;"></div><div class="dhx_cal_tab" name="week_tab" style="right:140px;"></div><div class="dhx_cal_tab" name="month_tab" style="right:76px;"></div></div><div class="dhx_cal_header"></div><div class="dhx_cal_data"></div>',this.className+=" dhx_cal_container"),scheduler.init(this,scheduler.config.date,scheduler.config.mode),i.data&&scheduler.parse(i.data),s.push(scheduler)
}}),1===s.length?s[0]:s}return t[i]?t[i].apply(this,[]):void e.error("Method "+i+" does not exist on jQuery.dhx_scheduler")}}(jQuery);
//# sourceMappingURL=sources/dhtmlxscheduler.js.map
/*
dhtmlxScheduler v.4.1.0 Stardard

This software is covered by GPL license. You also can obtain Commercial or Enterprise license to use it in non-GPL project - please contact sales@dhtmlx.com. Usage without proper license is prohibited.

(c) Dinamenta, UAB.
*/
scheduler.config.active_link_view="day",scheduler._active_link_click=function(e){var t=e.target||event.srcElement,c=t.getAttribute("jump_to"),i=scheduler.date.str_to_date(scheduler.config.api_date);return c?(scheduler.setCurrentView(i(c),scheduler.config.active_link_view),e&&e.preventDefault&&e.preventDefault(),!1):void 0},scheduler.attachEvent("onTemplatesReady",function(){var e=function(e,t){t=t||e+"_scale_date",scheduler.templates["_active_links_old_"+t]||(scheduler.templates["_active_links_old_"+t]=scheduler.templates[t]);
var c=scheduler.templates["_active_links_old_"+t],i=scheduler.date.date_to_str(scheduler.config.api_date);scheduler.templates[t]=function(e){return"<a jump_to='"+i(e)+"' href='#'>"+c(e)+"</a>"}};if(e("week"),e("","month_day"),this.matrix)for(var t in this.matrix)e(t);this._detachDomEvent(this._obj,"click",scheduler._active_link_click),dhtmlxEvent(this._obj,"click",scheduler._active_link_click)});
//# sourceMappingURL=../sources/ext/dhtmlxscheduler_active_links.js.map
/*
dhtmlxScheduler v.4.1.0 Stardard

This software is covered by GPL license. You also can obtain Commercial or Enterprise license to use it in non-GPL project - please contact sales@dhtmlx.com. Usage without proper license is prohibited.

(c) Dinamenta, UAB.
*/
scheduler.xy.map_date_width=188,scheduler.xy.map_description_width=400,scheduler.config.map_resolve_event_location=!0,scheduler.config.map_resolve_user_location=!0,scheduler.config.map_initial_position=new google.maps.LatLng(48.724,8.215),scheduler.config.map_error_position=new google.maps.LatLng(15,15),scheduler.config.map_infowindow_max_width=300,scheduler.config.map_type=google.maps.MapTypeId.ROADMAP,scheduler.config.map_zoom_after_resolve=15,scheduler.locale.labels.marker_geo_success="It seems you are here.",scheduler.locale.labels.marker_geo_fail="Sorry, could not get your current position using geolocation.",scheduler.templates.marker_date=scheduler.date.date_to_str("%Y-%m-%d %H:%i"),scheduler.templates.marker_text=function(e,t,s){return"<div><b>"+s.text+"</b><br/><br/>"+(s.event_location||"")+"<br/><br/>"+scheduler.templates.marker_date(e)+" - "+scheduler.templates.marker_date(t)+"</div>"
},scheduler.dblclick_dhx_map_area=function(){!this.config.readonly&&this.config.dblclick_create&&this.addEventNow({start_date:scheduler._date,end_date:scheduler.date.add(scheduler._date,scheduler.config.time_step,"minute")})},scheduler.templates.map_time=function(e,t,s){return s._timed?this.day_date(s.start_date,s.end_date,s)+" "+this.event_date(e):scheduler.templates.day_date(e)+" &ndash; "+scheduler.templates.day_date(t)},scheduler.templates.map_text=function(e,t,s){return s.text},scheduler.date.map_start=function(e){return e
},scheduler.date.add_map=function(e){return new Date(e.valueOf())},scheduler.templates.map_date=function(){return""},scheduler._latLngUpdate=!1,scheduler.attachEvent("onSchedulerReady",function(){function e(e){if(e){var t=scheduler.locale.labels;scheduler._els.dhx_cal_header[0].innerHTML="<div class='dhx_map_line' style='width: "+(scheduler.xy.map_date_width+scheduler.xy.map_description_width+2)+"px;' ><div class='headline_date' style='width: "+scheduler.xy.map_date_width+"px;'>"+t.date+"</div><div class='headline_description' style='width: "+scheduler.xy.map_description_width+"px;'>"+t.description+"</div></div>",scheduler._table_view=!0,scheduler.set_sizes()
}}function t(){scheduler._selected_event_id=null,scheduler.map._infowindow.close();var e=scheduler.map._markers;for(var t in e)e.hasOwnProperty(t)&&(e[t].setMap(null),delete scheduler.map._markers[t],scheduler.map._infowindows_content[t]&&delete scheduler.map._infowindows_content[t])}function s(){var e=scheduler.get_visible_events();e.sort(function(e,t){return e.start_date.valueOf()==t.start_date.valueOf()?e.id>t.id?1:-1:e.start_date>t.start_date?1:-1});for(var t="<div class='dhx_map_area'>",s=0;s<e.length;s++){var r=e[s],a=r.id==scheduler._selected_event_id?"dhx_map_line highlight":"dhx_map_line",i=r.color?"background:"+r.color+";":"",n=r.textColor?"color:"+r.textColor+";":"";
t+="<div class='"+a+"' event_id='"+r.id+"' style='"+i+n+(r._text_style||"")+" width: "+(scheduler.xy.map_date_width+scheduler.xy.map_description_width+2)+"px;'><div style='width: "+scheduler.xy.map_date_width+"px;' >"+scheduler.templates.map_time(r.start_date,r.end_date,r)+"</div>",t+="<div class='dhx_event_icon icon_details'>&nbsp</div>",t+="<div class='line_description' style='width:"+(scheduler.xy.map_description_width-25)+"px;'>"+scheduler.templates.map_text(r.start_date,r.end_date,r)+"</div></div>"
}t+="<div class='dhx_v_border' style='left: "+(scheduler.xy.map_date_width-2)+"px;'></div><div class='dhx_v_border_description'></div></div>",scheduler._els.dhx_cal_data[0].scrollTop=0,scheduler._els.dhx_cal_data[0].innerHTML=t,scheduler._els.dhx_cal_data[0].style.width=scheduler.xy.map_date_width+scheduler.xy.map_description_width+1+"px";var d=scheduler._els.dhx_cal_data[0].firstChild.childNodes;scheduler._els.dhx_cal_date[0].innerHTML=scheduler.templates[scheduler._mode+"_date"](scheduler._min_date,scheduler._max_date,scheduler._mode),scheduler._rendered=[];
for(var s=0;s<d.length-2;s++)scheduler._rendered[s]=d[s]}function r(e){var t=document.getElementById(e),s=scheduler._y-scheduler.xy.nav_height;0>s&&(s=0);var r=scheduler._x-scheduler.xy.map_date_width-scheduler.xy.map_description_width-1;0>r&&(r=0),t.style.height=s+"px",t.style.width=r+"px",t.style.marginLeft=scheduler.xy.map_date_width+scheduler.xy.map_description_width+1+"px",t.style.marginTop=scheduler.xy.nav_height+2+"px"}scheduler._isMapPositionSet=!1;var a=document.createElement("div");a.className="dhx_map",a.id="dhx_gmap",a.style.dispay="none";
var i=scheduler._obj;i.appendChild(a),scheduler._els.dhx_gmap=[],scheduler._els.dhx_gmap.push(a),r("dhx_gmap");var n={zoom:scheduler.config.map_inital_zoom||10,center:scheduler.config.map_initial_position,mapTypeId:scheduler.config.map_type||google.maps.MapTypeId.ROADMAP},d=new google.maps.Map(document.getElementById("dhx_gmap"),n);d.disableDefaultUI=!1,d.disableDoubleClickZoom=!scheduler.config.readonly,google.maps.event.addListener(d,"dblclick",function(e){if(!scheduler.config.readonly&&scheduler.config.dblclick_create){var t=e.latLng;
geocoder.geocode({latLng:t},function(e,s){s==google.maps.GeocoderStatus.OK&&(t=e[0].geometry.location,scheduler.addEventNow({lat:t.lat(),lng:t.lng(),event_location:e[0].formatted_address,start_date:scheduler._date,end_date:scheduler.date.add(scheduler._date,scheduler.config.time_step,"minute")}))})}});var l={content:""};scheduler.config.map_infowindow_max_width&&(l.maxWidth=scheduler.config.map_infowindow_max_width),scheduler.map={_points:[],_markers:[],_infowindow:new google.maps.InfoWindow(l),_infowindows_content:[],_initialization_count:-1,_obj:d},geocoder=new google.maps.Geocoder,scheduler.config.map_resolve_user_location&&navigator.geolocation&&(scheduler._isMapPositionSet||navigator.geolocation.getCurrentPosition(function(e){var t=new google.maps.LatLng(e.coords.latitude,e.coords.longitude);
d.setCenter(t),d.setZoom(scheduler.config.map_zoom_after_resolve||10),scheduler.map._infowindow.setContent(scheduler.locale.labels.marker_geo_success),scheduler.map._infowindow.position=d.getCenter(),scheduler.map._infowindow.open(d),scheduler._isMapPositionSet=!0},function(){scheduler.map._infowindow.setContent(scheduler.locale.labels.marker_geo_fail),scheduler.map._infowindow.setPosition(d.getCenter()),scheduler.map._infowindow.open(d),scheduler._isMapPositionSet=!0})),google.maps.event.addListener(d,"resize",function(){a.style.zIndex="5",d.setZoom(d.getZoom())
}),google.maps.event.addListener(d,"tilesloaded",function(){a.style.zIndex="5"}),a.style.display="none",scheduler.attachEvent("onSchedulerResize",function(){return"map"==this._mode?(this.map_view(!0),!1):!0});var o=scheduler.render_data;scheduler.render_data=function(){if("map"!=this._mode)return o.apply(this,arguments);s();for(var e=scheduler.get_visible_events(),t=0;t<e.length;t++)scheduler.map._markers[e[t].id]||h(e[t],!1,!1)},scheduler.map_view=function(a){scheduler.map._initialization_count++;
var i,n=scheduler._els.dhx_gmap[0];if(scheduler._els.dhx_cal_data[0].style.width=scheduler.xy.map_date_width+scheduler.xy.map_description_width+1+"px",scheduler._min_date=scheduler.config.map_start||scheduler._currentDate(),scheduler._max_date=scheduler.config.map_end||scheduler.date.add(scheduler._currentDate(),1,"year"),scheduler._table_view=!0,e(a),a){t(),s(),n.style.display="block",r("dhx_gmap"),i=scheduler.map._obj.getCenter();for(var d=scheduler.get_visible_events(),l=0;l<d.length;l++)scheduler.map._markers[d[l].id]||h(d[l])
}else n.style.display="none";google.maps.event.trigger(scheduler.map._obj,"resize"),0===scheduler.map._initialization_count&&i&&scheduler.map._obj.setCenter(i),scheduler._selected_event_id&&_(scheduler._selected_event_id)};var _=function(e){scheduler.map._obj.setCenter(scheduler.map._points[e]),scheduler.callEvent("onClick",[e])},h=function(e,t,s){var r=scheduler.config.map_error_position;e.lat&&e.lng&&(r=new google.maps.LatLng(e.lat,e.lng));var a=scheduler.templates.marker_text(e.start_date,e.end_date,e);
scheduler._new_event||(scheduler.map._infowindows_content[e.id]=a,scheduler.map._markers[e.id]&&scheduler.map._markers[e.id].setMap(null),scheduler.map._markers[e.id]=new google.maps.Marker({position:r,map:scheduler.map._obj}),google.maps.event.addListener(scheduler.map._markers[e.id],"click",function(){scheduler.map._infowindow.setContent(scheduler.map._infowindows_content[e.id]),scheduler.map._infowindow.open(scheduler.map._obj,scheduler.map._markers[e.id]),scheduler._selected_event_id=e.id,scheduler.render_data()
}),scheduler.map._points[e.id]=r,t&&scheduler.map._obj.setCenter(scheduler.map._points[e.id]),s&&scheduler.callEvent("onClick",[e.id]))};scheduler.attachEvent("onClick",function(e){if("map"==this._mode){scheduler._selected_event_id=e;for(var t=0;t<scheduler._rendered.length;t++)scheduler._rendered[t].className="dhx_map_line",scheduler._rendered[t].getAttribute("event_id")==e&&(scheduler._rendered[t].className+=" highlight");scheduler.map._points[e]&&scheduler.map._markers[e]&&(scheduler.map._obj.setCenter(scheduler.map._points[e]),google.maps.event.trigger(scheduler.map._markers[e],"click"))
}return!0});var c=function(e){e.event_location&&geocoder?geocoder.geocode({address:e.event_location,language:scheduler.uid().toString()},function(t,s){var r={};s!=google.maps.GeocoderStatus.OK?(r=scheduler.callEvent("onLocationError",[e.id]),r&&r!==!0||(r=scheduler.config.map_error_position)):r=t[0].geometry.location,e.lat=r.lat(),e.lng=r.lng(),scheduler._selected_event_id=e.id,scheduler._latLngUpdate=!0,scheduler.callEvent("onEventChanged",[e.id,e]),h(e,!0,!0)}):h(e,!0,!0)},u=function(e){e.event_location&&geocoder&&geocoder.geocode({address:e.event_location,language:scheduler.uid().toString()},function(t,s){var r={};
s!=google.maps.GeocoderStatus.OK?(r=scheduler.callEvent("onLocationError",[e.id]),r&&r!==!0||(r=scheduler.config.map_error_position)):r=t[0].geometry.location,e.lat=r.lat(),e.lng=r.lng(),scheduler._latLngUpdate=!0,scheduler.callEvent("onEventChanged",[e.id,e])})},v=function(e,t,s,r){setTimeout(function(){var r=e.apply(t,s);return e=t=s=null,r},r||1)};scheduler.attachEvent("onEventChanged",function(e){if(this._latLngUpdate)this._latLngUpdate=!1;else{var t=scheduler.getEvent(e);t.start_date<scheduler._min_date&&t.end_date>scheduler._min_date||t.start_date<scheduler._max_date&&t.end_date>scheduler._max_date||t.start_date.valueOf()>=scheduler._min_date&&t.end_date.valueOf()<=scheduler._max_date?(scheduler.map._markers[e]&&scheduler.map._markers[e].setMap(null),c(t)):(scheduler._selected_event_id=null,scheduler.map._infowindow.close(),scheduler.map._markers[e]&&scheduler.map._markers[e].setMap(null))
}return!0}),scheduler.attachEvent("onEventIdChange",function(e,t){var s=scheduler.getEvent(t);return(s.start_date<scheduler._min_date&&s.end_date>scheduler._min_date||s.start_date<scheduler._max_date&&s.end_date>scheduler._max_date||s.start_date.valueOf()>=scheduler._min_date&&s.end_date.valueOf()<=scheduler._max_date)&&(scheduler.map._markers[e]&&(scheduler.map._markers[e].setMap(null),delete scheduler.map._markers[e]),scheduler.map._infowindows_content[e]&&delete scheduler.map._infowindows_content[e],c(s)),!0
}),scheduler.attachEvent("onEventAdded",function(e,t){return scheduler._dataprocessor||(t.start_date<scheduler._min_date&&t.end_date>scheduler._min_date||t.start_date<scheduler._max_date&&t.end_date>scheduler._max_date||t.start_date.valueOf()>=scheduler._min_date&&t.end_date.valueOf()<=scheduler._max_date)&&(scheduler.map._markers[e]&&scheduler.map._markers[e].setMap(null),c(t)),!0}),scheduler.attachEvent("onBeforeEventDelete",function(e){return scheduler.map._markers[e]&&scheduler.map._markers[e].setMap(null),scheduler._selected_event_id=null,scheduler.map._infowindow.close(),!0
}),scheduler._event_resolve_delay=1500,scheduler.attachEvent("onEventLoading",function(e){return scheduler.config.map_resolve_event_location&&e.event_location&&!e.lat&&!e.lng&&(scheduler._event_resolve_delay+=1500,v(u,this,[e],scheduler._event_resolve_delay)),!0}),scheduler.attachEvent("onEventCancel",function(e,t){return t&&(scheduler.map._markers[e]&&scheduler.map._markers[e].setMap(null),scheduler.map._infowindow.close()),!0})});
//# sourceMappingURL=../sources/ext/dhtmlxscheduler_map_view.js.map
/*
dhtmlxScheduler v.4.1.0 Stardard

This software is covered by GPL license. You also can obtain Commercial or Enterprise license to use it in non-GPL project - please contact sales@dhtmlx.com. Usage without proper license is prohibited.

(c) Dinamenta, UAB.
*/
scheduler.templates.calendar_month=scheduler.date.date_to_str("%F %Y"),scheduler.templates.calendar_scale_date=scheduler.date.date_to_str("%D"),scheduler.templates.calendar_date=scheduler.date.date_to_str("%d"),scheduler.config.minicalendar={mark_events:!0},scheduler._synced_minicalendars=[],scheduler.renderCalendar=function(e,t,s){var a=null,r=e.date||scheduler._currentDate();if("string"==typeof r&&(r=this.templates.api_date(r)),t)a=this._render_calendar(t.parentNode,r,e,t),scheduler.unmarkCalendar(a);
else{var d=e.container,n=e.position;if("string"==typeof d&&(d=document.getElementById(d)),"string"==typeof n&&(n=document.getElementById(n)),n&&"undefined"==typeof n.left){var i=getOffset(n);n={top:i.top+n.offsetHeight,left:i.left}}d||(d=scheduler._get_def_cont(n)),a=this._render_calendar(d,r,e),a.onclick=function(e){e=e||event;var t=e.target||e.srcElement;if(-1!=t.className.indexOf("dhx_month_head")){var s=t.parentNode.className;if(-1==s.indexOf("dhx_after")&&-1==s.indexOf("dhx_before")){var a=scheduler.templates.xml_date(this.getAttribute("date"));
a.setDate(parseInt(t.innerHTML,10)),scheduler.unmarkCalendar(this),scheduler.markCalendar(this,a,"dhx_calendar_click"),this._last_date=a,this.conf.handler&&this.conf.handler.call(scheduler,a,this)}}}}if(scheduler.config.minicalendar.mark_events)for(var l=scheduler.date.month_start(r),o=scheduler.date.add(l,1,"month"),_=this.getEvents(l,o),h=this["filter_"+this._mode],c=0;c<_.length;c++){var u=_[c];if(!h||h(u.id,u)){var f=u.start_date;for(f.valueOf()<l.valueOf()&&(f=l),f=scheduler.date.date_part(new Date(f.valueOf()));f<u.end_date&&(this.markCalendar(a,f,"dhx_year_event"),f=this.date.add(f,1,"day"),!(f.valueOf()>=o.valueOf())););}}return this._markCalendarCurrentDate(a),a.conf=e,e.sync&&!s&&this._synced_minicalendars.push(a),a
},scheduler._get_def_cont=function(e){return this._def_count||(this._def_count=document.createElement("DIV"),this._def_count.className="dhx_minical_popup",this._def_count.onclick=function(e){(e||event).cancelBubble=!0},document.body.appendChild(this._def_count)),this._def_count.style.left=e.left+"px",this._def_count.style.top=e.top+"px",this._def_count._created=new Date,this._def_count},scheduler._locateCalendar=function(e,t){if("string"==typeof t&&(t=scheduler.templates.api_date(t)),+t>+e._max_date||+t<+e._min_date)return null;
for(var s=e.childNodes[2].childNodes[0],a=0,r=new Date(e._min_date);+this.date.add(r,1,"week")<=+t;)r=this.date.add(r,1,"week"),a++;var d=scheduler.config.start_on_monday,n=(t.getDay()||(d?7:0))-(d?1:0);return s.rows[a].cells[n].firstChild},scheduler.markCalendar=function(e,t,s){var a=this._locateCalendar(e,t);a&&(a.className+=" "+s)},scheduler.unmarkCalendar=function(e,t,s){if(t=t||e._last_date,s=s||"dhx_calendar_click",t){var a=this._locateCalendar(e,t);a&&(a.className=(a.className||"").replace(RegExp(s,"g")))
}},scheduler._week_template=function(e){for(var t=e||250,s=0,a=document.createElement("div"),r=this.date.week_start(scheduler._currentDate()),d=0;7>d;d++)this._cols[d]=Math.floor(t/(7-d)),this._render_x_header(d,s,r,a),r=this.date.add(r,1,"day"),t-=this._cols[d],s+=this._cols[d];return a.lastChild.className+=" dhx_scale_bar_last",a},scheduler.updateCalendar=function(e,t){e.conf.date=t,this.renderCalendar(e.conf,e,!0)},scheduler._mini_cal_arrows=["&nbsp","&nbsp"],scheduler._render_calendar=function(e,t,s,a){var r=scheduler.templates,d=this._cols;
this._cols=[];var n=this._mode;this._mode="calendar";var i=this._colsS;this._colsS={height:0};var l=new Date(this._min_date),o=new Date(this._max_date),_=new Date(scheduler._date),h=r.month_day,c=this._ignores_detected;this._ignores_detected=0,r.month_day=r.calendar_date,t=this.date.month_start(t);var u,f=this._week_template(e.offsetWidth-1-this.config.minicalendar.padding);if(a?u=a:(u=document.createElement("DIV"),u.className="dhx_cal_container dhx_mini_calendar"),u.setAttribute("date",this.templates.xml_format(t)),u.innerHTML="<div class='dhx_year_month'></div><div class='dhx_year_week'>"+f.innerHTML+"</div><div class='dhx_year_body'></div>",u.childNodes[0].innerHTML=this.templates.calendar_month(t),s.navigation)for(var v=function(e,t){var s=scheduler.date.add(e._date,t,"month");
scheduler.updateCalendar(e,s),scheduler._date.getMonth()==e._date.getMonth()&&scheduler._date.getFullYear()==e._date.getFullYear()&&scheduler._markCalendarCurrentDate(e)},g=["dhx_cal_prev_button","dhx_cal_next_button"],m=["left:1px;top:2px;position:absolute;","left:auto; right:1px;top:2px;position:absolute;"],p=[-1,1],x=function(e){return function(){if(s.sync)for(var t=scheduler._synced_minicalendars,a=0;a<t.length;a++)v(t[a],e);else v(u,e)}},y=0;2>y;y++){var b=document.createElement("DIV");b.className=g[y],b.style.cssText=m[y],b.innerHTML=this._mini_cal_arrows[y],u.firstChild.appendChild(b),b.onclick=x(p[y])
}u._date=new Date(t),u.week_start=(t.getDay()-(this.config.start_on_monday?1:0)+7)%7;var w=u._min_date=this.date.week_start(t);u._max_date=this.date.add(u._min_date,6,"week"),this._reset_month_scale(u.childNodes[2],t,w);for(var E=u.childNodes[2].firstChild.rows,k=E.length;6>k;k++){var D=E[E.length-1];E[0].parentNode.appendChild(D.cloneNode(!0));var M=parseInt(D.childNodes[D.childNodes.length-1].childNodes[0].innerHTML);M=10>M?M:0;for(var N=0;N<E[k].childNodes.length;N++)E[k].childNodes[N].className="dhx_after",E[k].childNodes[N].childNodes[0].innerHTML=scheduler.date.to_fixed(++M)
}return a||e.appendChild(u),u.childNodes[1].style.height=u.childNodes[1].childNodes[0].offsetHeight-1+"px",this._cols=d,this._mode=n,this._colsS=i,this._min_date=l,this._max_date=o,scheduler._date=_,r.month_day=h,this._ignores_detected=c,u},scheduler.destroyCalendar=function(e,t){!e&&this._def_count&&this._def_count.firstChild&&(t||(new Date).valueOf()-this._def_count._created.valueOf()>500)&&(e=this._def_count.firstChild),e&&(e.onclick=null,e.innerHTML="",e.parentNode&&e.parentNode.removeChild(e),this._def_count&&(this._def_count.style.top="-1000px"))
},scheduler.isCalendarVisible=function(){return this._def_count&&parseInt(this._def_count.style.top,10)>0?this._def_count:!1},scheduler._attach_minical_events=function(){dhtmlxEvent(document.body,"click",function(){scheduler.destroyCalendar()}),scheduler._attach_minical_events=function(){}},scheduler.attachEvent("onTemplatesReady",function(){scheduler._attach_minical_events()}),scheduler.templates.calendar_time=scheduler.date.date_to_str("%d-%m-%Y"),scheduler.form_blocks.calendar_time={render:function(){var e="<input class='dhx_readonly' type='text' readonly='true'>",t=scheduler.config,s=this.date.date_part(scheduler._currentDate()),a=1440,r=0;
t.limit_time_select&&(r=60*t.first_hour,a=60*t.last_hour+1),s.setHours(r/60),e+=" <select>";for(var d=r;a>d;d+=1*this.config.time_step){var n=this.templates.time_picker(s);e+="<option value='"+d+"'>"+n+"</option>",s=this.date.add(s,this.config.time_step,"minute")}e+="</select>";scheduler.config.full_day;return"<div style='height:30px;padding-top:0; font-size:inherit;' class='dhx_section_time'>"+e+"<span style='font-weight:normal; font-size:10pt;'> &nbsp;&ndash;&nbsp; </span>"+e+"</div>"},set_value:function(e,t,s){function a(e,t,s){l(e,t,s),e.value=scheduler.templates.calendar_time(t),e._date=scheduler.date.date_part(new Date(t))
}var r,d,n=e.getElementsByTagName("input"),i=e.getElementsByTagName("select"),l=function(e,t,s){e.onclick=function(){scheduler.destroyCalendar(null,!0),scheduler.renderCalendar({position:e,date:new Date(this._date),navigation:!0,handler:function(t){e.value=scheduler.templates.calendar_time(t),e._date=new Date(t),scheduler.destroyCalendar(),scheduler.config.event_duration&&scheduler.config.auto_end_date&&0===s&&c()}})}};if(scheduler.config.full_day){if(!e._full_day){var o="<label class='dhx_fullday'><input type='checkbox' name='full_day' value='true'> "+scheduler.locale.labels.full_day+"&nbsp;</label></input>";
scheduler.config.wide_form||(o=e.previousSibling.innerHTML+o),e.previousSibling.innerHTML=o,e._full_day=!0}var _=e.previousSibling.getElementsByTagName("input")[0],h=0===scheduler.date.time_part(s.start_date)&&0===scheduler.date.time_part(s.end_date);_.checked=h,i[0].disabled=_.checked,i[1].disabled=_.checked,_.onclick=function(){if(_.checked===!0){var t={};scheduler.form_blocks.calendar_time.get_value(e,t),r=scheduler.date.date_part(t.start_date),d=scheduler.date.date_part(t.end_date),(+d==+r||+d>=+r&&(0!==s.end_date.getHours()||0!==s.end_date.getMinutes()))&&(d=scheduler.date.add(d,1,"day"))
}var l=r||s.start_date,o=d||s.end_date;a(n[0],l),a(n[1],o),i[0].value=60*l.getHours()+l.getMinutes(),i[1].value=60*o.getHours()+o.getMinutes(),i[0].disabled=_.checked,i[1].disabled=_.checked}}if(scheduler.config.event_duration&&scheduler.config.auto_end_date){var c=function(){r=scheduler.date.add(n[0]._date,i[0].value,"minute"),d=new Date(r.getTime()+60*scheduler.config.event_duration*1e3),n[1].value=scheduler.templates.calendar_time(d),n[1]._date=scheduler.date.date_part(new Date(d)),i[1].value=60*d.getHours()+d.getMinutes()
};i[0].onchange=c}a(n[0],s.start_date,0),a(n[1],s.end_date,1),l=function(){},i[0].value=60*s.start_date.getHours()+s.start_date.getMinutes(),i[1].value=60*s.end_date.getHours()+s.end_date.getMinutes()},get_value:function(e,t){var s=e.getElementsByTagName("input"),a=e.getElementsByTagName("select");return t.start_date=scheduler.date.add(s[0]._date,a[0].value,"minute"),t.end_date=scheduler.date.add(s[1]._date,a[1].value,"minute"),t.end_date<=t.start_date&&(t.end_date=scheduler.date.add(t.start_date,scheduler.config.time_step,"minute")),{start_date:new Date(t.start_date),end_date:new Date(t.end_date)}
},focus:function(){}},scheduler.linkCalendar=function(e,t){var s=function(){var s=scheduler._date,a=new Date(s.valueOf());return t&&(a=t(a)),a.setDate(1),scheduler.updateCalendar(e,a),!0};scheduler.attachEvent("onViewChange",s),scheduler.attachEvent("onXLE",s),scheduler.attachEvent("onEventAdded",s),scheduler.attachEvent("onEventChanged",s),scheduler.attachEvent("onAfterEventDelete",s),s()},scheduler._markCalendarCurrentDate=function(e){var t=scheduler._date,s=scheduler._mode,a=scheduler.date.month_start(new Date(e._date)),r=scheduler.date.add(a,1,"month");
if("day"==s||this._props&&this._props[s])a.valueOf()<=t.valueOf()&&r>t&&scheduler.markCalendar(e,t,"dhx_calendar_click");else if("week"==s)for(var d=scheduler.date.week_start(new Date(t.valueOf())),n=0;7>n;n++)a.valueOf()<=d.valueOf()&&r>d&&scheduler.markCalendar(e,d,"dhx_calendar_click"),d=scheduler.date.add(d,1,"day")},scheduler.attachEvent("onEventCancel",function(){scheduler.destroyCalendar(null,!0)});
//# sourceMappingURL=../sources/ext/dhtmlxscheduler_minical.js.map
/*
dhtmlxScheduler v.4.1.0 Stardard

This software is covered by GPL license. You also can obtain Commercial or Enterprise license to use it in non-GPL project - please contact sales@dhtmlx.com. Usage without proper license is prohibited.

(c) Dinamenta, UAB.
*/
scheduler._get_serializable_data=function(){var e={};for(var t in this._events){var r=this._events[t];-1==r.id.toString().indexOf("#")&&(e[r.id]=r)}return e},scheduler.data_attributes=function(){var e=[],t=scheduler.templates.xml_format,r=this._get_serializable_data();for(var s in r){var a=r[s];for(var n in a)"_"!=n.substr(0,1)&&e.push([n,"start_date"==n||"end_date"==n?t:null]);break}return e},scheduler.toXML=function(e){var t=[],r=this.data_attributes(),s=this._get_serializable_data();for(var a in s){var n=s[a];
t.push("<event>");for(var i=0;i<r.length;i++)t.push("<"+r[i][0]+"><![CDATA["+(r[i][1]?r[i][1](n[r[i][0]]):n[r[i][0]])+"]]></"+r[i][0]+">");t.push("</event>")}return(e||"")+"<data>"+t.join("\n")+"</data>"},scheduler._serialize_json_value=function(e){return null===e||"boolean"==typeof e?e=""+e:(e||0===e||(e=""),e='"'+e.toString().replace(/\n/g,"").replace(/\\/g,"\\\\").replace(/\"/g,'\\"')+'"'),e},scheduler.toJSON=function(){var e=[],t="",r=this.data_attributes(),s=this._get_serializable_data();for(var a in s){for(var n=s[a],i=[],d=0;d<r.length;d++)t=r[d][1]?r[d][1](n[r[d][0]]):n[r[d][0]],i.push(' "'+r[d][0]+'": '+this._serialize_json_value(t));
e.push("{"+i.join(",")+"}")}return"["+e.join(",\n")+"]"},scheduler.toICal=function(e){var t="BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//dhtmlXScheduler//NONSGML v2.2//EN\nDESCRIPTION:",r="END:VCALENDAR",s=scheduler.date.date_to_str("%Y%m%dT%H%i%s"),a=scheduler.date.date_to_str("%Y%m%d"),n=[],i=this._get_serializable_data();for(var d in i){var l=i[d];n.push("BEGIN:VEVENT"),n.push(l._timed&&(l.start_date.getHours()||l.start_date.getMinutes())?"DTSTART:"+s(l.start_date):"DTSTART:"+a(l.start_date)),n.push(l._timed&&(l.end_date.getHours()||l.end_date.getMinutes())?"DTEND:"+s(l.end_date):"DTEND:"+a(l.end_date)),n.push("SUMMARY:"+l.text),n.push("END:VEVENT")
}return t+(e||"")+"\n"+n.join("\n")+"\n"+r};
//# sourceMappingURL=../sources/ext/dhtmlxscheduler_serialize.js.map
/*
dhtmlxScheduler v.4.1.0 Stardard

This software is covered by GPL license. You also can obtain Commercial or Enterprise license to use it in non-GPL project - please contact sales@dhtmlx.com. Usage without proper license is prohibited.

(c) Dinamenta, UAB.
*/
scheduler._temp_matrix_scope=function(){function e(){for(var e=scheduler.get_visible_events(),t=[],r=0;r<this.y_unit.length;r++)t[r]=[];t[s]||(t[s]=[]);for(var r=0;r<e.length;r++){for(var s=this.order[e[r][this.y_property]],a=0;this._trace_x[a+1]&&e[r].start_date>=this._trace_x[a+1];)a++;for(;this._trace_x[a]&&e[r].end_date>this._trace_x[a];)t[s][a]||(t[s][a]=[]),t[s][a].push(e[r]),a++}return t}function t(e,t,r){var s=0,a=r._step,n=r.round_position,i=0,d=t?e.end_date:e.start_date;d.valueOf()>scheduler._max_date.valueOf()&&(d=scheduler._max_date);
var l=d-scheduler._min_date_timeline;if(l>0){var _=scheduler._get_date_index(r,d);scheduler._ignores[_]&&(n=!0);for(var o=0;_>o;o++)s+=scheduler._cols[o];var c=scheduler.date.add(scheduler._min_date_timeline,scheduler.matrix[scheduler._mode].x_step*_,scheduler.matrix[scheduler._mode].x_unit);n?+d>+c&&t&&(i=scheduler._cols[_]):(l=d-c,r.first_hour||r.last_hour?(l-=r._start_correction,0>l&&(l=0),i=Math.round(l/a),i>scheduler._cols[_]&&(i=scheduler._cols[_])):i=Math.round(l/a))}return s+=t?0===l||n?i-14:i-12:i+1
}function r(e,t){var r=scheduler._get_date_index(this,e),s=this._trace_x[r];return t&&+e!=+this._trace_x[r]&&(s=this._trace_x[r+1]?this._trace_x[r+1]:scheduler.date.add(this._trace_x[r],this.x_step,this.x_unit)),new Date(s)}function s(e){var t="";if(e&&"cell"!=this.render){e.sort(this.sort||function(e,t){return e.start_date.valueOf()==t.start_date.valueOf()?e.id>t.id?1:-1:e.start_date>t.start_date?1:-1});for(var s=[],a=e.length,n=0;a>n;n++){var i=e[n];i._inner=!1;var d=this.round_position?r.apply(this,[i.start_date,!1]):i.start_date;
for(this.round_position?r.apply(this,[i.end_date,!0]):i.end_date;s.length;){var l=s[s.length-1];if(!(l.end_date.valueOf()<=d.valueOf()))break;s.splice(s.length-1,1)}for(var _=!1,o=0;o<s.length;o++){var c=s[o];if(c.end_date.valueOf()<=d.valueOf()){_=!0,i._sorder=c._sorder,s.splice(o,1),i._inner=!0;break}}if(s.length&&(s[s.length-1]._inner=!0),!_)if(s.length)if(s.length<=s[s.length-1]._sorder){if(s[s.length-1]._sorder)for(var h=0;h<s.length;h++){for(var u=!1,v=0;v<s.length;v++)if(s[v]._sorder==h){u=!0;
break}if(!u){i._sorder=h;break}}else i._sorder=0;i._inner=!0}else{for(var f=s[0]._sorder,g=1;g<s.length;g++)s[g]._sorder>f&&(f=s[g]._sorder);i._sorder=f+1,i._inner=!1}else i._sorder=0;s.push(i),s.length>(s.max_count||0)?(s.max_count=s.length,i._count=s.length):i._count=i._count?i._count:1}for(var p=0;p<e.length;p++)e[p]._count=s.max_count;for(var m=0;a>m;m++)t+=scheduler.render_timeline_event.call(this,e[m],!1)}return t}function a(t){var r="<table style='table-layout:fixed;' cellspacing='0' cellpadding='0'>",a=[];
if(scheduler._load_mode&&scheduler._load(),"cell"==this.render)a=e.call(this);else for(var n=scheduler.get_visible_events(),i=this.order,d=0;d<n.length;d++){var l=n[d],_=l[this.y_property],o=this.order[_];if(this.show_unassigned&&!_){for(var c in i)if(i.hasOwnProperty(c)){o=i[c],a[o]||(a[o]=[]);var h=scheduler._lame_copy({},l);h[this.y_property]=c,a[o].push(h)}}else a[o]||(a[o]=[]),a[o].push(l)}for(var u=0,v=0;v<scheduler._cols.length;v++)u+=scheduler._cols[v];var f=new Date,g=scheduler._cols.length-scheduler._ignores_detected;
f=(scheduler.date.add(f,this.x_step*g,this.x_unit)-f-(this._start_correction+this._end_correction)*g)/u,this._step=f,this._summ=u;var p=scheduler._colsS.heights=[];this._events_height={},this._section_height={};for(var v=0;v<this.y_unit.length;v++){var m=this._logic(this.render,this.y_unit[v],this);scheduler._merge(m,{height:this.dy}),this.section_autoheight&&(this.y_unit.length*m.height<t.offsetHeight&&(m.height=Math.max(m.height,Math.floor((t.offsetHeight-1)/this.y_unit.length))),this._section_height[this.y_unit[v].key]=m.height),scheduler._merge(m,{tr_className:"",style_height:"height:"+m.height+"px;",style_width:"width:"+(this.dx-1)+"px;",td_className:"dhx_matrix_scell"+(scheduler.templates[this.name+"_scaley_class"](this.y_unit[v].key,this.y_unit[v].label,this.y_unit[v])?" "+scheduler.templates[this.name+"_scaley_class"](this.y_unit[v].key,this.y_unit[v].label,this.y_unit[v]):""),td_content:scheduler.templates[this.name+"_scale_label"](this.y_unit[v].key,this.y_unit[v].label,this.y_unit[v]),summ_width:"width:"+u+"px;",table_className:""});
var y=s.call(this,a[v]);if(this.fit_events){var x=this._events_height[this.y_unit[v].key]||0;m.height=x>m.height?x:m.height,m.style_height="height:"+m.height+"px;",this._section_height[this.y_unit[v].key]=m.height}if(r+="<tr class='"+m.tr_className+"' style='"+m.style_height+"'><td class='"+m.td_className+"' style='"+m.style_width+" height:"+(m.height-1)+"px;'>"+m.td_content+"</td>","cell"==this.render)for(var d=0;d<scheduler._cols.length;d++)r+=scheduler._ignores[d]?"<td></td>":"<td class='dhx_matrix_cell "+scheduler.templates[this.name+"_cell_class"](a[v][d],this._trace_x[d],this.y_unit[v])+"' style='width:"+(scheduler._cols[d]-1)+"px'><div style='width:"+(scheduler._cols[d]-1)+"px'>"+scheduler.templates[this.name+"_cell_value"](a[v][d],this._trace_x[d],this.y_unit[v])+"</div></td>";
else{r+="<td><div style='"+m.summ_width+" "+m.style_height+" position:relative;' class='dhx_matrix_line'>",r+=y,r+="<table class='"+m.table_className+"' cellpadding='0' cellspacing='0' style='"+m.summ_width+" "+m.style_height+"' >";for(var d=0;d<scheduler._cols.length;d++)r+=scheduler._ignores[d]?"<td></td>":"<td class='dhx_matrix_cell "+scheduler.templates[this.name+"_cell_class"](a[v],this._trace_x[d],this.y_unit[v])+"' style='width:"+(scheduler._cols[d]-1)+"px'><div style='width:"+(scheduler._cols[d]-1)+"px'></div></td>";
r+="</table>",r+="</div></td>"}r+="</tr>"}r+="</table>",this._matrix=a,t.innerHTML=r,scheduler._rendered=[];for(var b=scheduler._obj.getElementsByTagName("DIV"),v=0;v<b.length;v++)b[v].getAttribute("event_id")&&scheduler._rendered.push(b[v]);this._scales={};for(var v=0;v<t.firstChild.rows.length;v++){p.push(t.firstChild.rows[v].offsetHeight);var w=this.y_unit[v].key,k=this._scales[w]=scheduler._isRender("cell")?t.firstChild.rows[v]:t.firstChild.rows[v].childNodes[1].getElementsByTagName("div")[0];
scheduler.callEvent("onScaleAdd",[k,w])}}function n(e){var t=scheduler.xy.scale_height,r=this._header_resized||scheduler.xy.scale_height;scheduler._cols=[],scheduler._colsS={height:0},this._trace_x=[];var s=scheduler._x-this.dx-scheduler.xy.scroll_width,a=[this.dx],n=scheduler._els.dhx_cal_header[0];n.style.width=a[0]+s+"px",scheduler._min_date_timeline=scheduler._min_date;var d=scheduler.config.preserve_scale_length,l=scheduler._min_date;scheduler._process_ignores(l,this.x_size,this.x_unit,this.x_step,d);
var _=this.x_size+(d?scheduler._ignores_detected:0);_!=this.x_size&&(scheduler._max_date=scheduler.date.add(scheduler._min_date,_*this.x_step,this.x_unit));for(var o=_-scheduler._ignores_detected,h=0;_>h;h++)this._trace_x[h]=new Date(l),l=scheduler.date.add(l,this.x_step,this.x_unit),scheduler._ignores[h]?(scheduler._cols[h]=0,o++):scheduler._cols[h]=Math.floor(s/(o-h)),s-=scheduler._cols[h],a[h+1]=a[h]+scheduler._cols[h];if(e.innerHTML="<div></div>",this.second_scale){for(var u=this.second_scale.x_unit,v=[this._trace_x[0]],f=[],g=[this.dx,this.dx],p=0,m=0;m<this._trace_x.length;m++){var y=this._trace_x[m],x=i(u,y,v[p]);
x&&(++p,v[p]=y,g[p+1]=g[p]);var b=p+1;f[p]=scheduler._cols[m]+(f[p]||0),g[b]+=scheduler._cols[m]}e.innerHTML="<div></div><div></div>";var w=e.firstChild;w.style.height=r+"px";var k=e.lastChild;k.style.position="relative";for(var E=0;E<v.length;E++){var D=v[E],N=scheduler.templates[this.name+"_second_scalex_class"](D),M=document.createElement("DIV");M.className="dhx_scale_bar dhx_second_scale_bar"+(N?" "+N:""),scheduler.set_xy(M,f[E]-1,r-3,g[E],0),M.innerHTML=scheduler.templates[this.name+"_second_scale_date"](D),w.appendChild(M)
}}scheduler.xy.scale_height=r,e=e.lastChild;for(var C=0;C<this._trace_x.length;C++)if(!scheduler._ignores[C]){l=this._trace_x[C],scheduler._render_x_header(C,a[C],l,e);var O=scheduler.templates[this.name+"_scalex_class"](l);O&&(e.lastChild.className+=" "+O)}scheduler.xy.scale_height=t;var L=this._trace_x;e.onclick=function(e){var t=c(e);t&&scheduler.callEvent("onXScaleClick",[t.x,L[t.x],e||event])},e.ondblclick=function(e){var t=c(e);t&&scheduler.callEvent("onXScaleDblClick",[t.x,L[t.x],e||event])
}}function i(e,t,r){switch(e){case"hour":return t.getHours()!=r.getHours()||i("day",t,r);case"day":return!(t.getDate()==r.getDate()&&t.getMonth()==r.getMonth()&&t.getFullYear()==r.getFullYear());case"week":return!(scheduler.date.getISOWeek(t)==scheduler.date.getISOWeek(r)&&t.getFullYear()==r.getFullYear());case"month":return!(t.getMonth()==r.getMonth()&&t.getFullYear()==r.getFullYear());case"year":return!(t.getFullYear()==r.getFullYear());default:return!1}}function d(e){if(e){scheduler.set_sizes(),scheduler._init_matrix_tooltip();
var t=scheduler._min_date;n.call(this,scheduler._els.dhx_cal_header[0]),a.call(this,scheduler._els.dhx_cal_data[0]),scheduler._min_date=t,scheduler._els.dhx_cal_date[0].innerHTML=scheduler.templates[this.name+"_date"](scheduler._min_date,scheduler._max_date),scheduler._mark_now&&scheduler._mark_now()}l()}function l(){scheduler._tooltip&&(scheduler._tooltip.style.display="none",scheduler._tooltip.date="")}function _(e,t,r){if("cell"==e.render){var s=t.x+"_"+t.y,a=e._matrix[t.y][t.x];if(!a)return l();
if(a.sort(function(e,t){return e.start_date>t.start_date?1:-1}),scheduler._tooltip){if(scheduler._tooltip.date==s)return;scheduler._tooltip.innerHTML=""}else{var n=scheduler._tooltip=document.createElement("DIV");n.className="dhx_year_tooltip",document.body.appendChild(n),n.onclick=scheduler._click.dhx_cal_data}for(var i="",d=0;d<a.length;d++){var _=a[d].color?"background-color:"+a[d].color+";":"",o=a[d].textColor?"color:"+a[d].textColor+";":"";i+="<div class='dhx_tooltip_line' event_id='"+a[d].id+"' style='"+_+o+"'>",i+="<div class='dhx_tooltip_date'>"+(a[d]._timed?scheduler.templates.event_date(a[d].start_date):"")+"</div>",i+="<div class='dhx_event_icon icon_details'>&nbsp;</div>",i+=scheduler.templates[e.name+"_tooltip"](a[d].start_date,a[d].end_date,a[d])+"</div>"
}scheduler._tooltip.style.display="",scheduler._tooltip.style.top="0px",scheduler._tooltip.style.left=document.body.offsetWidth-r.left-scheduler._tooltip.offsetWidth<0?r.left-scheduler._tooltip.offsetWidth+"px":r.left+t.src.offsetWidth+"px",scheduler._tooltip.date=s,scheduler._tooltip.innerHTML=i,scheduler._tooltip.style.top=document.body.offsetHeight-r.top-scheduler._tooltip.offsetHeight<0?r.top-scheduler._tooltip.offsetHeight+t.src.offsetHeight+"px":r.top+"px"}}function o(e){for(var t=e.parentNode.childNodes,r=0;r<t.length;r++)if(t[r]==e)return r;
return-1}function c(e){e=e||event;for(var t=e.target?e.target:e.srcElement;t&&"DIV"!=t.tagName;)t=t.parentNode;if(t&&"DIV"==t.tagName){var r=t.className.split(" ")[0];if("dhx_scale_bar"==r)return{x:o(t),y:-1,src:t,scale:!0}}}scheduler.matrix={},scheduler._merge=function(e,t){for(var r in t)"undefined"==typeof e[r]&&(e[r]=t[r])},scheduler.createTimelineView=function(e){scheduler._skin_init(),scheduler._merge(e,{section_autoheight:!0,name:"matrix",x:"time",y:"time",x_step:1,x_unit:"hour",y_unit:"day",y_step:1,x_start:0,x_size:24,y_start:0,y_size:7,render:"cell",dx:200,dy:50,event_dy:scheduler.xy.bar_height-5,event_min_dy:scheduler.xy.bar_height-5,resize_events:!0,fit_events:!0,show_unassigned:!1,second_scale:!1,round_position:!1,_logic:function(e,t,r){var s={};
return scheduler.checkEvent("onBeforeSectionRender")&&(s=scheduler.callEvent("onBeforeSectionRender",[e,t,r])),s}}),e._original_x_start=e.x_start,"day"!=e.x_unit&&(e.first_hour=e.last_hour=0),e._start_correction=e.first_hour?60*e.first_hour*60*1e3:0,e._end_correction=e.last_hour?60*(24-e.last_hour)*60*1e3:0,scheduler.checkEvent("onTimelineCreated")&&scheduler.callEvent("onTimelineCreated",[e]);var t=scheduler.render_data;scheduler.render_data=function(r,s){if(this._mode!=e.name)return t.apply(this,arguments);
if(s&&!e.show_unassigned&&"cell"!=e.render)for(var a=0;a<r.length;a++)this.clear_event(r[a]),this.render_timeline_event.call(this.matrix[this._mode],r[a],!0);else scheduler._renderMatrix.call(e,!0,!0)},scheduler.matrix[e.name]=e,scheduler.templates[e.name+"_cell_value"]=function(e){return e?e.length:""},scheduler.templates[e.name+"_cell_class"]=function(){return""},scheduler.templates[e.name+"_scalex_class"]=function(){return""},scheduler.templates[e.name+"_second_scalex_class"]=function(){return""
},scheduler.templates[e.name+"_scaley_class"]=function(){return""},scheduler.templates[e.name+"_scale_label"]=function(e,t){return t},scheduler.templates[e.name+"_tooltip"]=function(e,t,r){return r.text},scheduler.templates[e.name+"_date"]=function(e,t){return e.getDay()==t.getDay()&&864e5>t-e||+e==+scheduler.date.date_part(new Date(t))||+scheduler.date.add(e,1,"day")==+t&&0===t.getHours()&&0===t.getMinutes()?scheduler.templates.day_date(e):e.getDay()!=t.getDay()&&864e5>t-e?scheduler.templates.day_date(e)+" &ndash; "+scheduler.templates.day_date(t):scheduler.templates.week_date(e,t)
},scheduler.templates[e.name+"_scale_date"]=scheduler.date.date_to_str(e.x_date||scheduler.config.hour_date),scheduler.templates[e.name+"_second_scale_date"]=scheduler.date.date_to_str(e.second_scale&&e.second_scale.x_date?e.second_scale.x_date:scheduler.config.hour_date),scheduler.date["add_"+e.name]=function(t,r){var s=scheduler.date.add(t,(e.x_length||e.x_size)*r*e.x_step,e.x_unit);if("minute"==e.x_unit||"hour"==e.x_unit){var a=e.x_length||e.x_size,n="hour"==e.x_unit?60*e.x_step:e.x_step;if(n*a%1440)if(+scheduler.date.date_part(new Date(t))==+scheduler.date.date_part(new Date(s)))e.x_start+=r*a;
else{var i=1440/(a*n)-1,d=Math.round(i*a);e.x_start=r>0?e.x_start-d:d+e.x_start}}return s},scheduler.date[e.name+"_start"]=function(t){var r=scheduler.date[e.x_unit+"_start"]||scheduler.date.day_start,s=r.call(scheduler.date,t);return s=scheduler.date.add(s,e.x_step*e.x_start,e.x_unit)},scheduler.callEvent("onOptionsLoad",[e]),scheduler[e.name+"_view"]=function(){scheduler._renderMatrix.apply(e,arguments)};{var s=new Date;scheduler.date.add(s,e.x_step,e.x_unit).valueOf()-s.valueOf()}scheduler["mouse_"+e.name]=function(t){var s=this._drag_event;
this._drag_id&&(s=this.getEvent(this._drag_id),this._drag_event._dhx_changed=!0),t.x-=e.dx;var a,n,i=0,d=0;for(d;d<=this._cols.length-1;d++)if(n=this._cols[d],i+=n,i>t.x){a=(t.x-(i-n))/n,a=0>a?0:a;break}if(e.round_position){var l=1;scheduler.getState().drag_mode&&"move"!=scheduler.getState().drag_mode&&(l=.5),a>=l&&d++,a=0}if(0===d&&this._ignores[0])for(d=1,a=0;this._ignores[d];)d++;else if(d==this._cols.length&&this._ignores[d-1]){for(d=this._cols.length-1,a=0;this._ignores[d];)d--;d++}t.x=0,t.force_redraw=!0,t.custom=!0;
var _;if(d>=e._trace_x.length)_=scheduler.date.add(e._trace_x[e._trace_x.length-1],e.x_step,e.x_unit),e._end_correction&&(_=new Date(_-e._end_correction));else{var o=a*n*e._step+e._start_correction;_=new Date(+e._trace_x[d]+o)}if("move"==this._drag_mode&&this._drag_id&&this._drag_event){var s=this.getEvent(this._drag_id),c=this._drag_event;if(t._ignores=this._ignores_detected||e._start_correction||e._end_correction,c._move_delta||(c._move_delta=(s.start_date-_)/6e4,this.config.preserve_length&&t._ignores&&(c._move_delta=this._get_real_event_length(s.start_date,_,e),c._event_length=this._get_real_event_length(s.start_date,s.end_date,e))),this.config.preserve_length&&t._ignores){var h=(c._event_length,this._get_fictional_event_length(_,c._move_delta,e,!0));
_=new Date(_-h)}else _=scheduler.date.add(_,c._move_delta,"minute")}if("resize"==this._drag_mode&&s&&(this._drag_from_start&&+_>+s.end_date?this._drag_from_start=!1:!this._drag_from_start&&+_<+s.start_date&&(this._drag_from_start=!0),t.resize_from_start=this._drag_from_start),e.round_position)switch(this._drag_mode){case"move":this.config.preserve_length||(_=r.call(e,_,!1),"day"==e.x_unit&&(t.custom=!1));break;case"resize":this._drag_event&&((null===this._drag_event._resize_from_start||void 0===this._drag_event._resize_from_start)&&(this._drag_event._resize_from_start=t.resize_from_start),t.resize_from_start=this._drag_event._resize_from_start,_=r.call(e,_,!this._drag_event._resize_from_start))
}return this._resolve_timeline_section(e,t),t.section&&this._update_timeline_section({pos:t,event:this.getEvent(this._drag_id),view:e}),t.y=Math.round((_-this._min_date)/(6e4*this.config.time_step)),t.shift=this.config.time_step,t}},scheduler._get_timeline_event_height=function(e,t){var r=e[t.y_property],s=t.event_dy;return"full"==t.event_dy&&(s=t.section_autoheight?t._section_height[r]-6:t.dy-3),t.resize_events&&(s=Math.max(Math.floor(s/e._count),t.event_min_dy)),s},scheduler._get_timeline_event_y=function(e,t){var r=e,s=2+r*t+(r?2*r:0);
return scheduler.config.cascade_event_display&&(s=2+r*scheduler.config.cascade_event_margin+(r?2*r:0)),s},scheduler.render_timeline_event=function(e,r){var s=e[this.y_property];if(!s)return"";var a=e._sorder,n=t(e,!1,this),i=t(e,!0,this),d=scheduler._get_timeline_event_height(e,this),l=d-2;e._inner||"full"!=this.event_dy||(l=(l+2)*(e._count-a)-2);var _=scheduler._get_timeline_event_y(e._sorder,d),o=d+_+2;(!this._events_height[s]||this._events_height[s]<o)&&(this._events_height[s]=o);var c=scheduler.templates.event_class(e.start_date,e.end_date,e);
c="dhx_cal_event_line "+(c||"");var h=e.color?"background:"+e.color+";":"",u=e.textColor?"color:"+e.textColor+";":"",v=scheduler.templates.event_bar_text(e.start_date,e.end_date,e),f='<div event_id="'+e.id+'" class="'+c+'" style="'+h+u+"position:absolute; top:"+_+"px; height: "+l+"px; left:"+n+"px; width:"+Math.max(0,i-n)+"px;"+(e._text_style||"")+'">';if(scheduler.config.drag_resize&&!scheduler.config.readonly){var g="dhx_event_resize";f+="<div class='"+g+" "+g+"_start' style='height: "+l+"px;'></div><div class='"+g+" "+g+"_end' style='height: "+l+"px;'></div>"
}if(f+=v+"</div>",!r)return f;var p=document.createElement("DIV");p.innerHTML=f;var m=this.order[s],y=scheduler._els.dhx_cal_data[0].firstChild.rows[m].cells[1].firstChild;scheduler._rendered.push(p.firstChild),y.appendChild(p.firstChild)},scheduler._matrix_tooltip_handler=function(e){var t=scheduler.matrix[scheduler._mode];if(t&&"cell"==t.render){if(t){{var r=scheduler._locate_cell_timeline(e),e=e||event;e.target||e.srcElement}if(r)return _(t,r,getOffset(r.src))}l()}},scheduler._init_matrix_tooltip=function(){scheduler._detachDomEvent(scheduler._els.dhx_cal_data[0],"mouseover",scheduler._matrix_tooltip_handler),dhtmlxEvent(scheduler._els.dhx_cal_data[0],"mouseover",scheduler._matrix_tooltip_handler)
},scheduler._renderMatrix=function(e,t){if(t||(scheduler._els.dhx_cal_data[0].scrollTop=0),scheduler._min_date=scheduler.date[this.name+"_start"](scheduler._date),scheduler._max_date=scheduler.date.add(scheduler._min_date,this.x_size*this.x_step,this.x_unit),scheduler._table_view=!0,this.second_scale&&(e&&!this._header_resized&&(this._header_resized=scheduler.xy.scale_height,scheduler.xy.scale_height*=2,scheduler._els.dhx_cal_header[0].className+=" dhx_second_cal_header"),!e&&this._header_resized)){scheduler.xy.scale_height/=2,this._header_resized=!1;
var r=scheduler._els.dhx_cal_header[0];r.className=r.className.replace(/ dhx_second_cal_header/gi,"")}d.call(this,e)},scheduler._locate_cell_timeline=function(e){e=e||event;for(var t=e.target?e.target:e.srcElement,r={},s=scheduler.matrix[scheduler._mode],a=scheduler.getActionData(e),n=0;n<s._trace_x.length-1&&!(+a.date<s._trace_x[n+1]);n++);r.x=n,r.y=s.order[a.section];var i=scheduler._isRender("cell")?1:0;r.src=s._scales[a.section]?s._scales[a.section].getElementsByTagName("td")[n+i]:null;for(var d=!1;0===r.x&&"dhx_cal_data"!=t.className&&t.parentNode;){if("dhx_matrix_scell"==t.className.split(" ")[0]){d=!0;
break}t=t.parentNode}return d&&(r.x=-1,r.src=t,r.scale=!0),r};var h=scheduler._click.dhx_cal_data;scheduler._click.dhx_marked_timespan=scheduler._click.dhx_cal_data=function(e){var t=h.apply(this,arguments),r=scheduler.matrix[scheduler._mode];if(r){var s=scheduler._locate_cell_timeline(e);s&&(s.scale?scheduler.callEvent("onYScaleClick",[s.y,r.y_unit[s.y],e||event]):scheduler.callEvent("onCellClick",[s.x,s.y,r._trace_x[s.x],(r._matrix[s.y]||{})[s.x]||[],e||event]))}return t},scheduler.dblclick_dhx_matrix_cell=function(e){var t=scheduler.matrix[scheduler._mode];
if(t){var r=scheduler._locate_cell_timeline(e);r&&(r.scale?scheduler.callEvent("onYScaleDblClick",[r.y,t.y_unit[r.y],e||event]):scheduler.callEvent("onCellDblClick",[r.x,r.y,t._trace_x[r.x],(t._matrix[r.y]||{})[r.x]||[],e||event]))}};var u=scheduler.dblclick_dhx_marked_timespan||function(){};scheduler.dblclick_dhx_marked_timespan=function(e){var t=scheduler.matrix[scheduler._mode];return t?scheduler.dblclick_dhx_matrix_cell(e):u.apply(this,arguments)},scheduler.dblclick_dhx_matrix_scell=function(e){return scheduler.dblclick_dhx_matrix_cell(e)
},scheduler._isRender=function(e){return scheduler.matrix[scheduler._mode]&&scheduler.matrix[scheduler._mode].render==e},scheduler.attachEvent("onCellDblClick",function(e,t,r,s,a){if(!this.config.readonly&&("dblclick"!=a.type||this.config.dblclick_create)){var n=scheduler.matrix[scheduler._mode],i={};i.start_date=n._trace_x[e],i.end_date=n._trace_x[e+1]?n._trace_x[e+1]:scheduler.date.add(n._trace_x[e],n.x_step,n.x_unit),n._start_correction&&(i.start_date=new Date(1*i.start_date+n._start_correction)),n._end_correction&&(i.end_date=new Date(i.end_date-n._end_correction)),i[n.y_property]=n.y_unit[t].key,scheduler.addEventNow(i,null,a)
}}),scheduler.attachEvent("onBeforeDrag",function(){return!scheduler._isRender("cell")}),scheduler.attachEvent("onEventChanged",function(e,t){t._timed=this.isOneDayEvent(t)});var v=scheduler._render_marked_timespan;scheduler._render_marked_timespan=function(e,r,s,a,n){if(!scheduler.config.display_marked_timespans)return[];if(scheduler.matrix&&scheduler.matrix[scheduler._mode]){if(scheduler._isRender("cell"))return;var i=scheduler._lame_copy({},scheduler.matrix[scheduler._mode]);i.round_position=!1;
var d=[],l=[],_=[],o=e.sections?e.sections.units||e.sections.timeline:null;if(s)_=[r],l=[s];else{var c=i.order;if(o)c.hasOwnProperty(o)&&(l.push(o),_.push(i._scales[o]));else for(var h in c)c.hasOwnProperty(h)&&(l.push(h),_.push(i._scales[h]))}var a=a?new Date(a):scheduler._min_date,n=n?new Date(n):scheduler._max_date,u=[];if(e.days>6){var f=new Date(e.days);scheduler.date.date_part(new Date(a))<=+f&&+n>=+f&&u.push(f)}else u.push.apply(u,scheduler._get_dates_by_index(e.days));for(var g=e.zones,p=scheduler._get_css_classes_by_config(e),m=0;m<l.length;m++){r=_[m],s=l[m];
for(var y=0;y<u.length;y++)for(var x=u[y],b=0;b<g.length;b+=2){var w=g[b],k=g[b+1],E=new Date(+x+60*w*1e3),D=new Date(+x+60*k*1e3);if(D>a&&n>E){var N=scheduler._get_block_by_config(e);N.className=p;var M=t({start_date:E},!1,i)-1,C=t({start_date:D},!1,i)-1,O=Math.max(1,C-M-1),L=i._section_height[s]-1;N.style.cssText="height: "+L+"px; left: "+M+"px; width: "+O+"px; top: 0;",r.insertBefore(N,r.firstChild),d.push(N)}}}return d}return v.apply(scheduler,[e,r,s])};var f=scheduler._append_mark_now;scheduler._append_mark_now=function(e,t){if(scheduler.matrix&&scheduler.matrix[scheduler._mode]){var r=scheduler._currentDate(),s=scheduler._get_zone_minutes(r),a={days:+scheduler.date.date_part(r),zones:[s,s+1],css:"dhx_matrix_now_time",type:"dhx_now_time"};
return scheduler._render_marked_timespan(a)}return f.apply(scheduler,[e,t])},scheduler.attachEvent("onScaleAdd",function(e,t){var r=scheduler._marked_timespans;if(r&&scheduler.matrix&&scheduler.matrix[scheduler._mode])for(var s=scheduler._mode,a=scheduler._min_date,n=scheduler._max_date,i=r.global,d=scheduler.date.date_part(new Date(a));n>d;d=scheduler.date.add(d,1,"day")){var l=+d,_=d.getDay(),o=[],c=i[l]||i[_];if(o.push.apply(o,scheduler._get_configs_to_render(c)),r[s]&&r[s][t]){var h=[],u=scheduler._get_types_to_render(r[s][t][_],r[s][t][l]);
h.push.apply(h,scheduler._get_configs_to_render(u)),h.length&&(o=h)}for(var v=0;v<o.length;v++){var f=o[v],g=f.days;7>g?(g=l,scheduler._render_marked_timespan(f,e,t,d,scheduler.date.add(d,1,"day")),g=_):scheduler._render_marked_timespan(f,e,t,d,scheduler.date.add(d,1,"day"))}}}),scheduler._resolve_timeline_section=function(e,t){var r=0,s=0;for(r;r<this._colsS.heights.length&&(s+=this._colsS.heights[r],!(s>t.y));r++);e.y_unit[r]||(r=e.y_unit.length-1),this._drag_event&&!this._drag_event._orig_section&&(this._drag_event._orig_section=e.y_unit[r].key),t.fields={},r>=0&&e.y_unit[r]&&(t.section=t.fields[e.y_property]=e.y_unit[r].key)
},scheduler._update_timeline_section=function(e){var t=e.view,r=e.event,s=e.pos;if(r){if(r[t.y_property]!=s.section){var a=this._get_timeline_event_height(r,t);r._sorder=this._get_dnd_order(r._sorder,a,t._section_height[s.section])}r[t.y_property]=s.section}},scheduler._get_date_index=function(e,t){for(var r=0,s=e._trace_x;r<s.length-1&&+t>=+s[r+1];)r++;return r},scheduler.attachEvent("onBeforeTodayDisplayed",function(){for(var e in scheduler.matrix){var t=scheduler.matrix[e];t.x_start=t._original_x_start
}return!0}),scheduler.attachEvent("onOptionsLoad",function(){for(var e in scheduler.matrix){var t=scheduler.matrix[e];t.order={},scheduler.callEvent("onOptionsLoadStart",[]);for(var e=0;e<t.y_unit.length;e++)t.order[t.y_unit[e].key]=e;scheduler.callEvent("onOptionsLoadFinal",[]),scheduler._date&&t.name==scheduler._mode&&scheduler.setCurrentView(scheduler._date,scheduler._mode)}}),scheduler.attachEvent("onSchedulerResize",function(){if(scheduler.matrix[this._mode]){var e=scheduler.matrix[this._mode];
return scheduler._renderMatrix.call(e,!0,!0),!1}return!0}),scheduler.attachEvent("onBeforeDrag",function(e,t,r){if("resize"==t){var s=r.target||r.srcElement;scheduler._drag_from_start=(s.className||"").indexOf("dhx_event_resize_end")<0?!0:!1}return!0})},scheduler._temp_matrix_scope();
//# sourceMappingURL=../sources/ext/dhtmlxscheduler_timeline.js.map
/*
dhtmlxScheduler v.4.1.0 Stardard

This software is covered by GPL license. You also can obtain Commercial or Enterprise license to use it in non-GPL project - please contact sales@dhtmlx.com. Usage without proper license is prohibited.

(c) Dinamenta, UAB.
*/
window.dhtmlXTooltip=scheduler.dhtmlXTooltip=window.dhtmlxTooltip={},dhtmlXTooltip.config={className:"dhtmlXTooltip tooltip",timeout_to_display:50,timeout_to_hide:50,delta_x:15,delta_y:-20},dhtmlXTooltip.tooltip=document.createElement("div"),dhtmlXTooltip.tooltip.className=dhtmlXTooltip.config.className,dhtmlXTooltip.show=function(e,t){if(!scheduler.config.touch||scheduler.config.touch_tooltip){var r=dhtmlXTooltip,s=this.tooltip,a=s.style;r.tooltip.className=r.config.className;var i=this.position(e),n=e.target||e.srcElement;
if(!this.isTooltip(n)){var d=i.x+(r.config.delta_x||0),l=i.y-(r.config.delta_y||0);a.visibility="hidden",a.removeAttribute?(a.removeAttribute("right"),a.removeAttribute("bottom")):(a.removeProperty("right"),a.removeProperty("bottom")),a.left="0",a.top="0",this.tooltip.innerHTML=t,document.body.appendChild(this.tooltip);var o=this.tooltip.offsetWidth,_=this.tooltip.offsetHeight;document.body.offsetWidth-d-o<0?(a.removeAttribute?a.removeAttribute("left"):a.removeProperty("left"),a.right=document.body.offsetWidth-d+2*(r.config.delta_x||0)+"px"):a.left=0>d?i.x+Math.abs(r.config.delta_x||0)+"px":d+"px",document.body.offsetHeight-l-_<0?(a.removeAttribute?a.removeAttribute("top"):a.removeProperty("top"),a.bottom=document.body.offsetHeight-l-2*(r.config.delta_y||0)+"px"):a.top=0>l?i.y+Math.abs(r.config.delta_y||0)+"px":l+"px",a.visibility="visible",this.tooltip.onmouseleave=function(e){for(var t=scheduler.dhtmlXTooltip,r=e.relatedTarget;r!=scheduler._obj&&r;)r=r.parentNode;
r!=scheduler._obj&&t.delay(t.hide,t,[],t.config.timeout_to_hide)},scheduler.callEvent("onTooltipDisplayed",[this.tooltip,this.tooltip.event_id])}}},dhtmlXTooltip._clearTimeout=function(){this.tooltip._timeout_id&&window.clearTimeout(this.tooltip._timeout_id)},dhtmlXTooltip.hide=function(){if(this.tooltip.parentNode){var e=this.tooltip.event_id;this.tooltip.event_id=null,this.tooltip.onmouseleave=null,this.tooltip.parentNode.removeChild(this.tooltip),scheduler.callEvent("onAfterTooltip",[e])}this._clearTimeout()
},dhtmlXTooltip.delay=function(e,t,r,s){this._clearTimeout(),this.tooltip._timeout_id=setTimeout(function(){var s=e.apply(t,r);return e=t=r=null,s},s||this.config.timeout_to_display)},dhtmlXTooltip.isTooltip=function(e){var t=!1;for("dhtmlXTooltip"==e.className.split(" ")[0];e&&!t;)t=e.className==this.tooltip.className,e=e.parentNode;return t},dhtmlXTooltip.position=function(e){if(e=e||window.event,e.pageX||e.pageY)return{x:e.pageX,y:e.pageY};var t=window._isIE&&"BackCompat"!=document.compatMode?document.documentElement:document.body;
return{x:e.clientX+t.scrollLeft-t.clientLeft,y:e.clientY+t.scrollTop-t.clientTop}},scheduler.attachEvent("onMouseMove",function(e,t){var r=window.event||t,s=r.target||r.srcElement,a=dhtmlXTooltip,i=a.isTooltip(s),n=a.isTooltipTarget&&a.isTooltipTarget(s);if(e||i||n){var d;if(e||a.tooltip.event_id){var l=scheduler.getEvent(e)||scheduler.getEvent(a.tooltip.event_id);if(!l)return;if(a.tooltip.event_id=l.id,d=scheduler.templates.tooltip_text(l.start_date,l.end_date,l),!d)return a.hide()}n&&(d="");var o;
if(_isIE){o={pageX:void 0,pageY:void 0,clientX:void 0,clientY:void 0,target:void 0,srcElement:void 0};for(var _ in o)o[_]=r[_]}if(!scheduler.callEvent("onBeforeTooltip",[e])||!d)return;a.delay(a.show,a,[o||r,d])}else a.delay(a.hide,a,[],a.config.timeout_to_hide)}),scheduler.attachEvent("onBeforeDrag",function(){return dhtmlXTooltip.hide(),!0}),scheduler.attachEvent("onEventDeleted",function(){return dhtmlXTooltip.hide(),!0}),scheduler.templates.tooltip_date_format=scheduler.date.date_to_str("%Y-%m-%d %H:%i"),scheduler.templates.tooltip_text=function(e,t,r){return"<b>Event:</b> "+r.text+"<br/><b>Start date:</b> "+scheduler.templates.tooltip_date_format(e)+"<br/><b>End date:</b> "+scheduler.templates.tooltip_date_format(t)
};
//# sourceMappingURL=../sources/ext/dhtmlxscheduler_tooltip.js.map
/*
dhtmlxScheduler v.4.1.0 Stardard

This software is covered by GPL license. You also can obtain Commercial or Enterprise license to use it in non-GPL project - please contact sales@dhtmlx.com. Usage without proper license is prohibited.

(c) Dinamenta, UAB.
*/
scheduler._props={},scheduler.createUnitsView=function(e,t,r,s,a,i){"object"==typeof e&&(r=e.list,t=e.property,s=e.size||0,a=e.step||1,i=e.skip_incorrect,e=e.name),scheduler._props[e]={map_to:t,options:r,step:a,position:0},s>scheduler._props[e].options.length&&(scheduler._props[e]._original_size=s,s=0),scheduler._props[e].size=s,scheduler._props[e].skip_incorrect=i||!1,scheduler.date[e+"_start"]=scheduler.date.day_start,scheduler.templates[e+"_date"]=function(e){return scheduler.templates.day_date(e)
},scheduler._get_unit_index=function(e,t){var r=e.position||0,s=Math.floor((scheduler._correct_shift(+t,1)-+scheduler._min_date)/864e5);return r+s},scheduler.templates[e+"_scale_text"]=function(e,t,r){return r.css?"<span class='"+r.css+"'>"+t+"</span>":t},scheduler.templates[e+"_scale_date"]=function(t){var r=scheduler._props[e],s=r.options;if(!s.length)return"";var a=scheduler._get_unit_index(r,t),i=s[a];return scheduler.templates[e+"_scale_text"](i.key,i.label,i)},scheduler.date["add_"+e]=function(e,t){return scheduler.date.add(e,t,"day")
},scheduler.date["get_"+e+"_end"]=function(t){return scheduler.date.add(t,scheduler._props[e].size||scheduler._props[e].options.length,"day")},scheduler.attachEvent("onOptionsLoad",function(){for(var t=scheduler._props[e],r=t.order={},s=t.options,a=0;a<s.length;a++)r[s[a].key]=a;t._original_size&&0===t.size&&(t.size=t._original_size,delete t.original_size),t.size>s.length?(t._original_size=t.size,t.size=0):t.size=t._original_size||t.size,scheduler._date&&scheduler._mode==e&&scheduler.setCurrentView(scheduler._date,scheduler._mode)
}),scheduler["mouse_"+e]=function(e){var t=scheduler._props[this._mode];if(t){e=this._week_indexes_from_pos(e),this._drag_event||(this._drag_event={}),this._drag_id&&this._drag_mode&&(this._drag_event._dhx_changed=!0);var r=Math.min(e.x+t.position,t.options.length-1);e.section=(t.options[r]||{}).key,e.x=0;var s=this.getEvent(this._drag_id);this._update_unit_section({view:t,event:s,pos:e})}return e.force_redraw=!0,e},scheduler.callEvent("onOptionsLoad",[])},scheduler._update_unit_section=function(e){var t=e.view,r=e.event,s=e.pos;
r&&(r[t.map_to]=s.section)},scheduler.scrollUnit=function(e){var t=scheduler._props[this._mode];t&&(t.position=Math.min(Math.max(0,t.position+e),t.options.length-t.size),this.update_view())},function(){var e=function(e){var t=scheduler._props[scheduler._mode];if(t&&t.order&&t.skip_incorrect){for(var r=[],s=0;s<e.length;s++)"undefined"!=typeof t.order[e[s][t.map_to]]&&r.push(e[s]);e.splice(0,e.length),e.push.apply(e,r)}return e},t=scheduler._pre_render_events_table;scheduler._pre_render_events_table=function(r,s){return r=e(r),t.apply(this,[r,s])
};var r=scheduler._pre_render_events_line;scheduler._pre_render_events_line=function(t,s){return t=e(t),r.apply(this,[t,s])};var s=function(e,t){if(e&&"undefined"==typeof e.order[t[e.map_to]]){var r=scheduler,s=864e5,a=Math.floor((t.end_date-r._min_date)/s);return t[e.map_to]=e.options[Math.min(a+e.position,e.options.length-1)].key,!0}},a=scheduler._reset_scale,i=scheduler.is_visible_events;scheduler.is_visible_events=function(e){var t=i.apply(this,arguments);if(t){var r=scheduler._props[this._mode];
if(r&&r.size){var s=r.order[e[r.map_to]];if(s<r.position||s>=r.size+r.position)return!1}}return t},scheduler._reset_scale=function(){var e=scheduler._props[this._mode],t=a.apply(this,arguments);if(e){this._max_date=this.date.add(this._min_date,1,"day");for(var r=this._els.dhx_cal_data[0].childNodes,s=0;s<r.length;s++)r[s].className=r[s].className.replace("_now","");if(e.size&&e.size<e.options.length){var i=this._els.dhx_cal_header[0],n=document.createElement("DIV");e.position&&(n.className="dhx_cal_prev_button",n.style.cssText="left:1px;top:2px;position:absolute;",n.innerHTML="&nbsp;",i.firstChild.appendChild(n),n.onclick=function(){scheduler.scrollUnit(-1*e.step)
}),e.position+e.size<e.options.length&&(n=document.createElement("DIV"),n.className="dhx_cal_next_button",n.style.cssText="left:auto; right:0px;top:2px;position:absolute;",n.innerHTML="&nbsp;",i.lastChild.appendChild(n),n.onclick=function(){scheduler.scrollUnit(e.step)})}}return t};var n=scheduler._get_event_sday;scheduler._get_event_sday=function(e){var t=scheduler._props[this._mode];return t?(s(t,e),t.order[e[t.map_to]]-t.position):n.call(this,e)};var d=scheduler.locate_holder_day;scheduler.locate_holder_day=function(e,t,r){var a=scheduler._props[this._mode];
return a&&r?(s(a,r),1*a.order[r[a.map_to]]+(t?1:0)-a.position):d.apply(this,arguments)};var l=scheduler._time_order;scheduler._time_order=function(e){var t=scheduler._props[this._mode];t?e.sort(function(e,r){return t.order[e[t.map_to]]>t.order[r[t.map_to]]?1:-1}):l.apply(this,arguments)},scheduler.attachEvent("onEventAdded",function(e,t){if(this._loading)return!0;for(var r in scheduler._props){var s=scheduler._props[r];"undefined"==typeof t[s.map_to]&&(t[s.map_to]=s.options[0].key)}return!0}),scheduler.attachEvent("onEventCreated",function(e,t){var r=scheduler._props[this._mode];
if(r&&t){var a=this.getEvent(e),i=this._mouse_coords(t);this._update_unit_section({view:r,event:a,pos:i}),s(r,a),this.event_updated(a)}return!0})}();
//# sourceMappingURL=../sources/ext/dhtmlxscheduler_units.js.map
/*
dhtmlxScheduler v.4.1.0 Stardard

This software is covered by GPL license. You also can obtain Commercial or Enterprise license to use it in non-GPL project - please contact sales@dhtmlx.com. Usage without proper license is prohibited.

(c) Dinamenta, UAB.
*/
scheduler.config.year_x=4,scheduler.config.year_y=3,scheduler.xy.year_top=0,scheduler.templates.year_date=function(e){return scheduler.date.date_to_str(scheduler.locale.labels.year_tab+" %Y")(e)},scheduler.templates.year_month=scheduler.date.date_to_str("%F"),scheduler.templates.year_scale_date=scheduler.date.date_to_str("%D"),scheduler.templates.year_tooltip=function(e,t,r){return r.text},function(){var e=function(){return"year"==scheduler._mode};scheduler.dblclick_dhx_month_head=function(t){if(e()){var r=t.target||t.srcElement;
if(-1!=r.parentNode.className.indexOf("dhx_before")||-1!=r.parentNode.className.indexOf("dhx_after"))return!1;var s=this.templates.xml_date(r.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.getAttribute("date"));s.setDate(parseInt(r.innerHTML,10));var a=this.date.add(s,1,"day");!this.config.readonly&&this.config.dblclick_create&&this.addEventNow(s.valueOf(),a.valueOf(),t)}};var t=scheduler.changeEventId;scheduler.changeEventId=function(){t.apply(this,arguments),e()&&this.year_view(!0)
};var r=scheduler.render_data,s=scheduler.date.date_to_str("%Y/%m/%d"),a=scheduler.date.str_to_date("%Y/%m/%d");scheduler.render_data=function(t){if(!e())return r.apply(this,arguments);for(var s=0;s<t.length;s++)this._year_render_event(t[s])};var d=scheduler.clear_view;scheduler.clear_view=function(){if(!e())return d.apply(this,arguments);var t=scheduler._year_marked_cells,r=null;for(var s in t)t.hasOwnProperty(s)&&(r=t[s],r.className="dhx_month_head",r.setAttribute("date",""));scheduler._year_marked_cells={}
},scheduler._hideToolTip=function(){this._tooltip&&(this._tooltip.style.display="none",this._tooltip.date=new Date(9999,1,1))},scheduler._showToolTip=function(e,t,r,s){if(this._tooltip){if(this._tooltip.date.valueOf()==e.valueOf())return;this._tooltip.innerHTML=""}else{var a=this._tooltip=document.createElement("DIV");a.className="dhx_year_tooltip",document.body.appendChild(a),a.onclick=scheduler._click.dhx_cal_data}for(var d=this.getEvents(e,this.date.add(e,1,"day")),n="",i=0;i<d.length;i++){var l=d[i];
if(this.filter_event(l.id,l)){var _=l.color?"background:"+l.color+";":"",o=l.textColor?"color:"+l.textColor+";":"";n+="<div class='dhx_tooltip_line' style='"+_+o+"' event_id='"+d[i].id+"'>",n+="<div class='dhx_tooltip_date' style='"+_+o+"'>"+(d[i]._timed?this.templates.event_date(d[i].start_date):"")+"</div>",n+="<div class='dhx_event_icon icon_details'>&nbsp;</div>",n+=this.templates.year_tooltip(d[i].start_date,d[i].end_date,d[i])+"</div>"}}this._tooltip.style.display="",this._tooltip.style.top="0px",this._tooltip.style.left=document.body.offsetWidth-t.left-this._tooltip.offsetWidth<0?t.left-this._tooltip.offsetWidth+"px":t.left+s.offsetWidth+"px",this._tooltip.date=e,this._tooltip.innerHTML=n,this._tooltip.style.top=document.body.offsetHeight-t.top-this._tooltip.offsetHeight<0?t.top-this._tooltip.offsetHeight+s.offsetHeight+"px":t.top+"px"
},scheduler._year_view_tooltip_handler=function(t){if(e()){var t=t||event,r=t.target||t.srcElement;"a"==r.tagName.toLowerCase()&&(r=r.parentNode),-1!=(r.className||"").indexOf("dhx_year_event")?scheduler._showToolTip(a(r.getAttribute("date")),getOffset(r),t,r):scheduler._hideToolTip()}},scheduler._init_year_tooltip=function(){scheduler._detachDomEvent(scheduler._els.dhx_cal_data[0],"mouseover",scheduler._year_view_tooltip_handler),dhtmlxEvent(scheduler._els.dhx_cal_data[0],"mouseover",scheduler._year_view_tooltip_handler)
},scheduler.attachEvent("onSchedulerResize",function(){return e()?(this.year_view(!0),!1):!0}),scheduler._get_year_cell=function(e){var t=e.getMonth()+12*(e.getFullYear()-this._min_date.getFullYear())-this.week_starts._month,r=this._els.dhx_cal_data[0].childNodes[t],e=this.week_starts[t]+e.getDate()-1;return r.childNodes[2].firstChild.rows[Math.floor(e/7)].cells[e%7].firstChild},scheduler._year_marked_cells={},scheduler._mark_year_date=function(e,t){var r=s(e),a=this._get_year_cell(e),d=this.templates.event_class(t.start_date,t.end_date,t);
scheduler._year_marked_cells[r]||(a.className="dhx_month_head dhx_year_event",a.setAttribute("date",r),scheduler._year_marked_cells[r]=a),a.className+=d?" "+d:""},scheduler._unmark_year_date=function(e){this._get_year_cell(e).className="dhx_month_head"},scheduler._year_render_event=function(e){var t=e.start_date;for(t=t.valueOf()<this._min_date.valueOf()?this._min_date:this.date.date_part(new Date(t));t<e.end_date;)if(this._mark_year_date(t,e),t=this.date.add(t,1,"day"),t.valueOf()>=this._max_date.valueOf())return
},scheduler.year_view=function(e){var t;if(e&&(t=scheduler.xy.scale_height,scheduler.xy.scale_height=-1),scheduler._els.dhx_cal_header[0].style.display=e?"none":"",scheduler.set_sizes(),e&&(scheduler.xy.scale_height=t),scheduler._table_view=e,!this._load_mode||!this._load())if(e){if(scheduler._init_year_tooltip(),scheduler._reset_year_scale(),scheduler._load_mode&&scheduler._load())return void(scheduler._render_wait=!0);scheduler.render_view_data()}else scheduler._hideToolTip()},scheduler._reset_year_scale=function(){this._cols=[],this._colsS={};
var e=[],t=this._els.dhx_cal_data[0],r=this.config;t.scrollTop=0,t.innerHTML="";var s=Math.floor(parseInt(t.style.width)/r.year_x),a=Math.floor((parseInt(t.style.height)-scheduler.xy.year_top)/r.year_y);190>a&&(a=190,s=Math.floor((parseInt(t.style.width)-scheduler.xy.scroll_width)/r.year_x));for(var d=s-11,n=0,i=document.createElement("div"),l=this.date.week_start(scheduler._currentDate()),_=0;7>_;_++)this._cols[_]=Math.floor(d/(7-_)),this._render_x_header(_,n,l,i),l=this.date.add(l,1,"day"),d-=this._cols[_],n+=this._cols[_];
i.lastChild.className+=" dhx_scale_bar_last";for(var o=this.date[this._mode+"_start"](this.date.copy(this._date)),c=o,h=null,_=0;_<r.year_y;_++)for(var u=0;u<r.year_x;u++){h=document.createElement("DIV"),h.style.cssText="position:absolute;",h.setAttribute("date",this.templates.xml_format(o)),h.innerHTML="<div class='dhx_year_month'></div><div class='dhx_year_week'>"+i.innerHTML+"</div><div class='dhx_year_body'></div>",h.childNodes[0].innerHTML=this.templates.year_month(o);for(var v=this.date.week_start(o),f=this._reset_month_scale(h.childNodes[2],o,v),p=h.childNodes[2].firstChild.rows,g=p.length;6>g;g++){p[0].parentNode.appendChild(p[0].cloneNode(!0));
for(var m=0,y=p[g].childNodes.length;y>m;m++)p[g].childNodes[m].className="dhx_after",p[g].childNodes[m].firstChild.innerHTML=scheduler.templates.month_day(f),f=scheduler.date.add(f,1,"day")}t.appendChild(h),h.childNodes[1].style.height=h.childNodes[1].childNodes[0].offsetHeight+"px";var x=Math.round((a-190)/2);h.style.marginTop=x+"px",this.set_xy(h,s-10,a-x-10,s*u+5,a*_+5+scheduler.xy.year_top),e[_*r.year_x+u]=(o.getDay()-(this.config.start_on_monday?1:0)+7)%7,o=this.date.add(o,1,"month")}this._els.dhx_cal_date[0].innerHTML=this.templates[this._mode+"_date"](c,o,this._mode),this.week_starts=e,e._month=c.getMonth(),this._min_date=c,this._max_date=o
};var n=scheduler.getActionData;scheduler.getActionData=function(t){if(!e())return n.apply(scheduler,arguments);var r=t?t.target:event.srcElement,s=scheduler._get_year_month_date(r),a=scheduler._get_year_month_cell(r),d=scheduler._get_year_day_indexes(a);return d&&s?(s=scheduler.date.add(s,d.week,"week"),s=scheduler.date.add(s,d.day,"day")):s=null,{date:s,section:null}},scheduler._get_year_day_indexes=function(e){var t=scheduler._locate_year_month_table(e);if(!t)return null;for(var r=0,s=0,r=0,a=t.rows.length;a>r;r++){for(var d=t.rows[r].getElementsByTagName("td"),s=0,n=d.length;n>s&&d[s]!=e;s++);if(n>s)break
}return a>r?{day:s,week:r}:null},scheduler._get_year_month_date=function(e){var e=scheduler._locate_year_month_root(e);if(!e)return null;var t=e.getAttribute("date");return t?scheduler.date.week_start(scheduler.templates.xml_date(t)):null},scheduler._locate_year_month_day=function(e){return e.className&&-1!=e.className.indexOf("dhx_year_event")&&e.hasAttribute&&e.hasAttribute("date")};var i=scheduler._locate_event;scheduler._locate_event=function(e){var t=i.apply(scheduler,arguments);if(!t){var r=scheduler._get_year_el_node(e,scheduler._locate_year_month_day);
if(!r||!r.hasAttribute("date"))return null;var s=scheduler.templates.xml_date(r.getAttribute("date")),a=scheduler.getEvents(s,scheduler.date.add(s,1,"day"));if(!a.length)return null;t=a[0].id}return t},scheduler._locate_year_month_cell=function(e){return"td"==e.nodeName.toLowerCase()},scheduler._locate_year_month_table=function(e){return"table"==e.nodeName.toLowerCase()},scheduler._locate_year_month_root=function(e){return e.hasAttribute&&e.hasAttribute("date")},scheduler._get_year_month_cell=function(e){return this._get_year_el_node(e,this._locate_year_month_cell)
},scheduler._get_year_month_table=function(e){return this._get_year_el_node(e,this._locate_year_month_table)},scheduler._get_year_month_root=function(e){return this._get_year_el_node(this._get_year_month_table(e),this._locate_year_month_root)},scheduler._get_year_el_node=function(e,t){for(;e&&!t(e);)e=e.parentNode;return e}}();
//# sourceMappingURL=../sources/ext/dhtmlxscheduler_year_view.js.map
(function ($, Routing) {
    $.fn.scheduler = function (resourceData, eventData, settings, options) {
        // Defaults
        resourceData = $.extend({
            group: [],
            category: [],
            resource: []
        }, resourceData);

        if (typeof eventData == 'undefined') {
            eventData = [];
        }

        settings = $.extend({
            resourceJump: 6,
            resourceCount: 6,
            markPastEvents: false,
            startHour: 8,
            endHour: 19,
            viewHour: 8,
            confirmationPrompt: true,
            timeslotMinutes: 15,
            timeslotHeight: 2,
            defaultView: 'month',
            autoRefreshMinutes: 5,
            allowClashes: false,
            readOnly: false
        }, settings);

        options = $.extend({
            resourceNavigationSelector: '',
            shedulerNavigationSelector: '',
            fileMaker: false
        }, options);

        this.each(function () {
            var dp = null,
                init = false,
                id = this.id,
                lastResources,
                lastFilterType,
                lastFilterId,
                timelineSettings = {
                    type: 'Bar',
                    unit: 'minute',
                    date: '%H:%i',
                    step: 30,
                    size: 24,
                    start: 16,
                    length: 48
                };

            function reloadEvents(filterType, filterId) {
                scheduler.clearAll();
                scheduler.load(Routing.generate('api_scheduler_schedules', { filterType: filterType, filterId: filterId }), 'json');
            }

            function confirmChanges(event, isNew) {
                if (settings.confirmationPrompt) {
                    if (!confirm('Confirm these changes?')) {
                        return false;
                    }
                }

                var response = true;

                if (!settings.allowClashes && event.resources) {
                    $.each(event.resources.toString().split(','), function (index, resource) {
                        var clashes = null,
                            dateTimeToStr = scheduler.date.date_to_str("%Y-%m-%d %H:%i:%s");

                        $.ajax(
                            Routing.generate('api_scheduler_clashes', {
                                resource: resource,
                                newStartDate: dateTimeToStr(event.start_date),
                                newEndDate: dateTimeToStr(event.end_date)
                            }), {
                                method: 'GET',
                                async: false,
                                success: function (data) {
                                    clashes = data;
                                }
                            }
                        );

                        if (isNew && clashes.length) {
                            response = confirm('Clashes with other schedules. Override?');
                        } else {
                            for (var i in clashes) {
                                if (clashes[i].id != event.id) {
                                    response = confirm('Clashes with other schedules. Override?');
                                }
                            }
                        }
                    });
                }

                return response;
            }

            function initScheduler(resources, filterType, filterId) {
                resources = typeof resources === 'undefined' ? lastResources : resources;
                filterType = typeof filterType === 'undefined' ? lastFilterType : filterType;
                filterId = typeof filterId === 'undefined' ? lastFilterId : filterId;

                lastFilterType = filterType;
                lastFilterId = filterId;
                lastResources = resources;

                var initHash = false;

                // Event handlers
                if (!init) {
                    var baseFunctions = {
                        render_event: scheduler.render_event
                    };

                    scheduler.render_event = function (event) {
                        if (this._mode == 'unit') {
                            var resourceEvent = $.extend(true, {}, event);

                            if (resourceEvent.schedules) {
                                $.each(resourceEvent.schedules, function (index, schedule) {
                                    if (schedule.event && schedule.resource.id == resourceEvent.resources) {
                                        $.each(eventData, function (index, scheduleEvent) {
                                            if (scheduleEvent.key == schedule.event.id) {
                                                resourceEvent.color = scheduleEvent.backgroundColor;
                                                resourceEvent.textColor = scheduleEvent.color;
                                                resourceEvent.event = scheduleEvent.key;
                                                resourceEvent.event_text = scheduleEvent.label;
                                            }
                                        });
                                    }
                                });
                            }

                            baseFunctions.render_event.call(this, resourceEvent);
                        } else {
                            baseFunctions.render_event.call(this, event);
                        }
                    };

                    scheduler.attachEvent('onClearAll', function () {
                        $.each(scheduler.map._markers, function (index, marker) {
                            if (marker) {
                                marker.setMap(null);
                            }
                        });

                        scheduler.map._markers = [];
                    });

                    scheduler.attachEvent('onBeforeViewChange', function (oldMode, oldDate, newMode, newDate) {
                        var hashData = getHashData();

                        if (!initHash) {
                            initHash = true;

                            if (hashData.date || hashData.mode) {
                                try {
                                    this.setCurrentView(hashData.date ? strToDate(hashData.date) : null, hashData.mode || null);
                                } catch (e) {
                                    this.setCurrentView(hashData.date ? strToDate(hashData.date) : null, newMode);
                                }

                                return false;
                            }
                        }

                        hashData.date = dateToStr(newDate || oldDate);
                        hashData.mode = newMode || oldMode;

                        setHashData(hashData);

                        if (newMode == 'unit') {
                            scheduler.xy.scale_height = 45;
                        } else if (newMode == 'year') {
                            scheduler.xy.scale_height = 21;
                        } else {
                            scheduler.xy.scale_height = 35;
                        }

                        $('a[data-mode]', options.schedulerNavigationSelector).removeClass('active');
                        $('a[data-mode="' + newMode + '"]', options.schedulerNavigationSelector).addClass('active');

                        return true;
                    });

                    scheduler.attachEvent('onBeforeEventChanged', function (event, e, isNew) {
                        return confirmChanges(event, isNew);
                    });

                    scheduler.attachEvent('onEventSave', function (id, event, isNew) {
                        return confirmChanges(scheduler.getEvent(id), isNew);
                    });

                    scheduler.attachEvent('onBeforeLightbox', function (id) {
                        event = scheduler.getEvent(id);

                        if (!event.event) {
                            scheduler.config.buttons_left = ['dhx_save_btn'];
                        } else {
                            scheduler.config.buttons_left = ['dhx_save_btn', 'dhx_cancel_btn'];
                        }

                        return true;
                    });
                }

                // Configuration
                scheduler.skin = 'flat';
                scheduler.config.xml_date = '%Y-%m-%d %H:%i';
                scheduler.config.show_loading = true;
                scheduler.config.multi_day = true;
                scheduler.config.mark_now = true;
                scheduler.config.default_date = '%D, %M %d %Y';
                scheduler.config.hour_date = '%g:%i %A';
                scheduler.config.dblclick_create = false;
                scheduler.config.drag_create = true;
                scheduler.config.edit_on_create = true;
                scheduler.config.icons_select = ['icon_details', 'icon_delete'];
                scheduler.config.full_day = true;
                scheduler.config.multisection = true;

                scheduler.config.first_hour = settings.startHour;
                scheduler.config.last_hour = settings.endHour;
                scheduler.config.scroll_hour = settings.viewHour;
                scheduler.config.hour_size_px = (60 / settings.timeslotMinutes) * (settings.timeslotHeight * 11);

                scheduler.config.map_start = new Date(2014, 1, 1);
                scheduler.config.map_end = new Date(2015, 1, 1);
                scheduler.config.map_inital_zoom = 8;
                scheduler.config.map_resolve_user_location = false;

                var strToDate = scheduler.date.str_to_date("%Y-%m-%d"),
                    dateToStr = scheduler.date.date_to_str("%Y-%m-%d");

                if (settings.readOnly) {
                    scheduler.config.readonly = true;
                    scheduler.config.details_on_dblclick = false;
                } else {
                    scheduler.config.details_on_dblclick = true;

                    scheduler.attachEvent('onDblClick', function (id) {
                        var event = this.getEvent(id);

                        return event['private'] != 'Private';
                    });
                }

                scheduler.locale.labels.unit_tab = 'Resource';
                scheduler.locale.labels.section_location = 'Location';
                scheduler.locale.labels.year_tab = 'Year';

                scheduler.setLoadMode('month');

                dhtmlXTooltip.config.className = 'dhtmlXTooltip tooltip';
                dhtmlXTooltip.config.timeout_to_display = 10;
                dhtmlXTooltip.config.delta_x = 15;
                dhtmlXTooltip.config.delta_y = -20;

                scheduler.createUnitsView({
                    name: 'unit',
                    property: 'resources',
                    list: resources,
                    size: settings.resourceCount,
                    step: settings.resourceJump,
                    skip_incorrect: true
                });

                scheduler.createTimelineView({
                    name: 'multiday',
                    x_unit: 'day',
                    x_date: '%D <br /> %d %M',
                    x_step: 1,
                    x_size: 30,
                    y_unit: resources,
                    y_property: 'resources'
                });

                scheduler.createTimelineView({
                    name: 'timeline',
                    x_unit:	timelineSettings.unit,
                    x_date:	timelineSettings.date,
                    x_step:	timelineSettings.step,
                    x_size: timelineSettings.size,
                    x_start: timelineSettings.start,
                    x_length: timelineSettings.length,
                    y_unit:	resources,
                    y_property:	'resources',
                    dx: 200,
                    dy: 50,
                    render: timelineSettings.type,
                    event_dy: 'full'
                });

                scheduler.attachEvent('onTemplatesReady', function () {
                    scheduler.templates.timeline_scale_date = function (date) {
                        var template = scheduler.date.date_to_str(timelineSettings.date || scheduler.config.hour_date);
                        return template(date);
                    };

                    scheduler.templates.event_text = function (start, end, event) {
                        if (event.event) {
                            return event.event_text + ': ' + event.text;
                        } else {
                            return event.text;
                        }
                    };

                    if (settings.markPastEvents) {
                        scheduler.templates.event_class = function (startDate, endDate, event) {
                            if (endDate < (new Date())) {
                                return 'past_event';
                            }

                            return '';
                        };
                    }

                    var format = scheduler.date.date_to_str("%Y-%m-%d %H:%i");
                    scheduler.templates.tooltip_text = function (start, end, event) {
                        if (scheduler.getState().mode === 'year') {
                            return false;
                        }

                        var text = '<b>Booked for:</b> ' + event.text + '<br />' +
                            '<b>Start date:</b> ' + format(start) + '<br />' +
                            '<b>End date:</b> ' + format(end);

                        if (event.schedules) {
                            var resourceNames = [];

                            $.each(event.schedules, function (index, schedule) {
                                resourceNames.push(schedule.resource.name + (schedule.event ? ' (' + schedule.event.type + ')' : ''));
                            });

                            text += '<br /><b>Resources:</b> ' + resourceNames.join(', ');
                        }

                        return text;
                    };

                    scheduler.templates.hour_scale = function (date) {
                        var hours = date.getHours();
                        var minutes = date.getMinutes();
                        var ampm = hours >= 12 ? 'pm' : 'am';

                        hours = hours % 12;
                        hours = hours ? hours : 12;
                        minutes = minutes < 10 ? '0' + minutes : minutes;

                        return "<span class='dhx_scale_h'>" + hours + "</span>" +
                            "<span class='dhx_scale_m'>&nbsp;"+ minutes +"</span>" +
                            "<span class='dhx_scale_ampm'>"+ ampm +"</span>";
                    };

                    scheduler.form_blocks.resources = {
                        render: function () {
                            return '<div id="scheduler_resources"><a class="btn btn-link">Add resource</a><table><thead><tr><th>Category</th><th>Name</th><th>Event</th><th></th></tr></thead><tbody></tbody></table></div>';
                        },
                        set_value: function (element, value, event) {
                            var $table = $('tbody', element).empty();

                            function setLightboxHeight() {
                                $('.dhx_cal_light').height(214 + $(options.resourceNavigationSelector).height());
                                $('.dhx_cal_larea').height(122 + $(options.resourceNavigationSelector).height());
                            }

                            function addResourceRow(schedule) {
                                var $row = $('<tr><td></td><td></td><td></td><td></td></tr>').data('event', event.id).appendTo($table),
                                    $category = $('<select></select>').appendTo($('td:nth-child(1)', $row)),
                                    $resource = $('<select></select>').appendTo($('td:nth-child(2)', $row)),
                                    $event = $('<select><option value=""></option></select>').appendTo($('td:nth-child(3)', $row)),
                                    $delete = $('<a class="btn btn-xs btn-danger"><i class="fa fa-trash-o"></i></a>').appendTo($('td:nth-child(4)', $row));

                                if (schedule) {
                                    $row.data('schedule', schedule.id);
                                }

                                $.each(resourceData.category, function (index, category) {
                                    $category.append('<option value="' + category.key + '">' + category.label + '</option>');
                                });

                                $category.on('change', function () {
                                    var categoryId = $(this).val();

                                    $resource.empty();
                                    $event.empty();

                                    $.each(resourceData.resource, function (index, resource) {
                                        if (resource.category_id == categoryId) {
                                            $resource.append('<option value="' + resource.key + '">' + resource.label + '</option>');
                                        }
                                    });

                                    $.each(eventData, function (index, event) {
                                        if (event.category == categoryId) {
                                            $('<option value="' + event.key + '">' + event.label + '</option>')
                                                .data('label', event.label)
                                                .css('color', event.color)
                                                .data('color', event.color)
                                                .css('background-color', event.backgroundColor)
                                                .data('background-color', event.backgroundColor)
                                                .appendTo($event);
                                        }
                                    });
                                });

                                $delete.on('click', function () {
                                    if ($row.data('schedule')) {
                                        event.schedules = $.grep(event.schedules, function (schedule) {
                                            return schedule.id != $row.data('schedule');
                                        });
                                    }

                                    $row.remove();

                                    setLightboxHeight();
                                });

                                $event.on('change', function () {
                                    var $row = $('tbody tr', element).last(),
                                        $event = $('td:nth-child(3) select', $row);

                                    event.event = $event.val();
                                    event.event_text = $event.find('option:selected').data('label');
                                    event.textColor = $event.find('option:selected').data('color');
                                    event.color = $event.find('option:selected').data('background-color');
                                });

                                if (schedule) {
                                    $category.val(schedule.resource.category.id).change();

                                    if (schedule.event) {
                                        $event.val(schedule.event.id).change();
                                    }

                                    $resource.val(schedule.resource.id).change();
                                } else {
                                    $category.change();
                                }

                                setLightboxHeight();
                            }

                            $('a', element).off('click').on('click', function () {
                                addResourceRow();
                            });

                            if (event.schedules) {
                                $.each(event.schedules, function (index, schedule) {
                                    addResourceRow(schedule);
                                });
                            } else {
                                event.schedules = [];
                            }
                        },
                        get_value: function (element) {
                            $($('tbody tr', element).get().reverse()).each(function () {
                                var $row = $(this),
                                    $category = $('td:nth-child(1) select', $row),
                                    $resource = $('td:nth-child(2) select', $row),
                                    $event = $('td:nth-child(3) select', $row),
                                    event = scheduler.getEvent($row.data('event')),
                                    resourceIds = [];

                                if ($row.data('schedule')) {
                                    $.each(event.schedules, function (index, schedule) {
                                        if (schedule.id == $row.data('schedule')) {
                                            schedule.event.id = $event.val();
                                            schedule.resource.id = $resource.val();
                                            schedule.resource.category.id = $category.val();
                                        }
                                    });
                                } else {
                                    event.schedules.push({
                                        id: '',
                                        event: { id: $event.val() },
                                        resource: { id: $resource.val(), category: { id: $category.val() } }
                                    });
                                }

                                $.each(event.schedules, function (index, schedule) {
                                    resourceIds.push(schedule.resource.id);
                                });

                                event.resources = resourceIds.join(',');
                            });
                        },
                        focus: function () {}
                    };

                    scheduler.config.lightbox.sections = [
                        { name: 'description', height: 60, map_to: 'text', type: 'textarea', focus: true },
                        { name: 'resources', type: 'resources', map_to: 'auto' },
                        { name: 'time', height: 32, type: 'time', map_to: 'auto' }
                    ];

                    scheduler.locale.labels.section_resources = 'Resources';
                });

                var defaultView = settings.defaultView.toLowerCase();

                if (defaultView == 'resource') {
                    defaultView = 'unit';
                }

                var schedulerDate = scheduler.getState().date;

                if (!schedulerDate || isNaN(schedulerDate.getTime())) {
                    schedulerDate = new Date();
                }

                if (!init) {
                    scheduler.init(id, schedulerDate, scheduler.getState().mode ? scheduler.getState().mode : defaultView);
                }

                reloadEvents(filterType, filterId);

                if (!init) {
                    dp = new dataProcessor(Routing.generate('api_scheduler_process'));
                    dp.init(scheduler);

                    dp.attachEvent('onBeforeDataSending', function (id, action, data) {
                        $.each(data, function (id, serializedEvent) {
                            var schedule = scheduler.getEvent(id),
                                action = serializedEvent['!nativeeditor_status'];

                            delete serializedEvent.color;
                            delete serializedEvent.event;
                            delete serializedEvent.event_text;
                            delete serializedEvent.textColor;

                            if (action == 'updated') {
                                var serializedSchedules = [];
                                var existingResourceIds = [];

                                if (serializedEvent.resources) {
                                    $.each(serializedEvent.resources.toString().split(','), function (index, resourceId) {
                                        existingResourceIds.push(resourceId);
                                    });
                                }

                                $.each(serializedEvent.schedules, function (index, schedule) {
                                    schedule.resource.id = existingResourceIds[index];
                                    serializedSchedules.push(schedule.id + '-' + schedule.resource.id + '-' + (schedule.event ? schedule.event.id : ''));
                                });

                                serializedEvent.schedules = serializedSchedules.join(',');

                                delete serializedEvent.resources;
                            } else if (action == 'inserted') {
                                var defaultEventId = null,
                                    categoryId = null;

                                $.each(resourceData.resource, function (index, resource) {
                                    if (resource.key == schedule.resources) {
                                        categoryId = resource.category_id;
                                        return false;
                                    }
                                });

                                $.each(eventData, function (index, event) {
                                    if (event.category == categoryId) {
                                        defaultEventId = event.key;
                                        return false;
                                    }
                                });

                                schedule.schedules = [
                                    {
                                        id: '',
                                        event: { id: defaultEventId },
                                        resource: { id: schedule.resources, category: { id: categoryId } }
                                    }
                                ];
                            } else if (action == 'deleted') {
                                delete serializedEvent.start_date;
                                delete serializedEvent.end_date;
                                delete serializedEvent.text;
                                delete serializedEvent.resources;
                                delete serializedEvent.lat;
                                delete serializedEvent.lng;
                                delete serializedEvent.location;
                                delete serializedEvent.schedules;
                            }
                        });

                        return true;
                    });

                    dp.attachEvent('onAfterUpdate', function(sid, action, tid, data) {
                        var event = scheduler.getEvent(tid);

                        if (action != 'deleted') {
                            if ($(data).attr('scheduleIds')) {
                                $.each($(data).attr('scheduleIds').split(','), function (index, scheduleId) {
                                    event.schedules[index].id = scheduleId;
                                });
                            }
                        }

                        if (action == 'inserted') {
                            if (scheduler._mode != 'timeline') {
                                scheduler.showLightbox(tid);
                            }
                        }

                        $('.dhx_loading').remove();
                    });
                }

                init = true;
            }

            function getHashData() {
                if (!document.location.hash && !window.localStorage.getItem('scheduler_hash')) {
                    return {};
                }

                var items, data = {};

                if (document.location.hash) {
                    items = document.location.hash.replace('#','').split(',');
                } else {
                    items = window.localStorage.getItem('scheduler_hash').replace('#','').split(',');
                }

                $.each(items, function (index, item) {
                    var splitItem = item.split('=');
                    data[splitItem[0]] = splitItem[1];
                });

                return data;
            }

            function setHashData(hashData) {
                var hash = '#';

                $.each(hashData, function (index, item) {
                    hash += index + '=' + item + ',';
                });

                hash = hash.substr(0, hash.length - 1);

                document.location.hash = hash;
                window.localStorage.setItem('scheduler_hash', hash);
            }

            function getResources(category, key, resourceData) {
                return $.grep(resourceData.resource, function (resource) {
                    if (category == 'resource') {
                        if (key == 'all') {
                            return true;
                        }

                        return resource.key == key;
                    }

                    if (category == 'category') {
                        return resource.category_id == key;
                    }

                    if (category == 'group') {
                        return $.inArray(parseInt(key), resource.group_ids) !== -1;
                    }

                    return false;
                });
            }

            function setFilter(filter, resourceData, settings) {
                var i = filter.indexOf('-'),
                    category = filter.slice(0, i),
                    key = filter.slice(i + 1);

                initScheduler(getResources(category, key, resourceData), category, key);

                var hashData = getHashData();
                hashData.filter = filter;

                setHashData(hashData);
            }

            // TODO: Create timeline selection element and apply timeline settings

            // Initialize resource navigation
            $.each(resourceData, function (type, list) {
                var listElement = $('.' + type, options.resourceNavigationSelector);

                $.each(list, function (index, entity) {
                    $('<option value="' + type + '-' + entity.key + '">' + entity.label + '</option>').appendTo(listElement);
                });
            });

            $(options.resourceNavigationSelector).on('change', function () {
                setFilter($(this).val(), resourceData);
            });

            $('a[data-mode]', options.schedulerNavigationSelector).on('click', function (e) {
                e.preventDefault();
                scheduler.setCurrentView(scheduler._date, $(this).data('mode'));
            });

            $('a.today', options.schedulerNavigationSelector).on('click', function (e) {
                e.preventDefault();
                scheduler._click.dhx_cal_today_button();
            });

            $('a[data-step]', options.schedulerNavigationSelector).on('click', function (e) {
                e.preventDefault();
                scheduler._click.dhx_cal_next_button(0, $(this).data('step'));
            });

            // Init
            var hashData = getHashData();

            if (typeof hashData.filter !== 'undefined') {
                $('#resourceSearch').val(hashData.filter);
            }

            setFilter($(options.resourceNavigationSelector).val(), resourceData, settings);

            $(options.resourceNavigationSelector).chosen({
                disable_search_threshold: 10,
                search_contains: true
            });

            // Auto-refresh
            if (settings.autoRefreshMinutes) {
                setInterval(function () {
                    if (!$(scheduler.getLightbox()).is(':visible')) {
                        initScheduler();
                    }
                }, settings.autoRefreshMinutes * 60 * 1000);
            }

            // Print
            $('.print', options.schedulerNavigationSelector).click(function (e) {
                e.preventDefault();

                var formatDate = scheduler.date.date_to_str("%Y-%m-%d");

                window.location.href = Routing.generate('scheduler_print_resource', {
                    filterType: lastFilterType,
                    filterId: lastFilterId,
                    date: formatDate(scheduler.getState().date)
                });
            });

            $('.refresh', options.resourceNavigationSelector).click(function (e) {
                initScheduler();
            });

            // Calendar
            var calendar = null;

            function destroyCalendar() {
                if (calendar !== null) {
                    scheduler.destroyCalendar(calendar);
                    calendar = null;
                }
            }

            $('.calendar', options.resourceNavigationSelector).on('click', function (e) {
                e.stopPropagation();

                if (calendar === null) {
                    calendar = scheduler.renderCalendar({
                        container: "scheduler_calendar",
                        navigation: true,
                        handler: function(date){
                            scheduler.setCurrentView(date, scheduler._mode);
                            destroyCalendar();
                        }
                    });
                } else {
                    destroyCalendar()
                }
            });

            $('#scheduler_calendar').on('click', function (e) {
                e.stopPropagation();
            });

            $(':not(#scheduler_calendar)').not('#nav .calendar').on('click', function () {
                destroyCalendar();
            });

            $(options.resourceNavigationSelector).trigger('chosen:updated');
        });

        return this;
    };
}(jQuery, Routing));
