"use strict";

window.Chart=function (data,container,geometry)
{

this.createItem=function(o,item_id)
{
 var e=null;
 if (typeof(chart_item_template)!="undefined")
 {
  var s=chart_item_template;
  s=s.replace('{ID}',o.id); 
  s=s.replace('{URL}',o.url); 
  s=s.replace('{ATT_BASE_NAME_e}',encodeURIComponent(o.att_base_name)); 
  e=$(s)[0];
 }
 else
 {
  e=document.createElement("a");
  e.className="item";
  e.target="_blank";
  e.href=o.url;
 }
 e.id="id"+item_id;
 this.container.appendChild(e);
}

this.positionItem=function(item,item_id)
{
 var e=document.getElementById("id"+item_id);
 var x=-10+Math.pow(item.x,0.44)*8.5;
 var y=100-item.y*30;

 data[item_id].display_x=x;
 data[item_id].display_y=y;

 for (var i=0;i<item_id;i++)
 {
  var dx=data[i].display_x-x;
  var dy=data[i].display_y-y;
  var dist=Math.sqrt(dx*dx+dy*dy);
  if (dist<3) e.style.border="4px solid green";
 }

 e.style.left=x+"%";
 e.style.top =y+"%";
}

this.positionItems=function()
{
 this.data.map(this.positionItem,this);
}

this.addPaddingToArea=function()
{
 if (this.visible_items.length>21) return;
 var factor=6;
 if (this.visible_items.length< 8) factor= 3;
 
 this.area.min_x-=this.area.range_x/factor;
 this.area.max_x+=this.area.range_x/factor;
 this.area.min_y-=this.area.range_y/factor;
 this.area.max_y+=this.area.range_y/factor;
 this.area.range_x=this.area.max_x-this.area.min_x;
 this.area.range_y=this.area.max_y-this.area.min_y;
 
}

/*
this.addRank=function(data, prop)
{
 data.sort(function(a,b) {return parseInt(a[prop])>parseInt(b[prop])});
 return data.map(function (datum, idx)
 {
  datum[prop+"_rank"] = idx;
  return datum;
 });
}
*/

this.addRank=function(data, prop)
{
 data.sort(function(a,b) {return parseFloat(a[prop])-parseFloat(b[prop])});
 var rank=0;
 var value=data[0][prop];
 for (var i=0;i<data.length;i++)
 {
  if (data[i][prop]!==value) rank++;
  data[i][prop+"_rank"]=rank;
  value=data[i][prop];
 }
}

this.analyzeItems=function()
{
 this.area  =
 {
  min_x:  Number.MAX_VALUE,
  max_x: -Number.MAX_VALUE,
  min_y:  Number.MAX_VALUE,
  max_y: -Number.MAX_VALUE,
  range_x: null,
  range_y: null
 }

 // this.nr_visible_items=0;
 this.visible_items=[];
 for (var i=0; i<this.data.length; i++)
 {
	if (!this.data[i].hidden)
  {
   data[i].x=data[i].axis_x_value;
   data[i].y=data[i].axis_y_value;
   this.visible_items.push(this.data[i]);
  }
 }

 if (this.geometry.rank)
 {
  this.addRank(this.visible_items,"x");
  this.addRank(this.visible_items,"y");
  for (var i=0; i<this.visible_items.length; i++)
  {
    this.visible_items[i].x=1+this.visible_items[i].x_rank;
    this.visible_items[i].y=1+this.visible_items[i].y_rank;
  }
 }

 for (var i=0; i<this.visible_items.length; i++) this.analyzeItem(this.visible_items[i],i);

 if (this.area.min_x==this.area.max_x)
 {
  this.area.min_x--;
  this.area.max_x++;
 }
 if (this.area.min_y==this.area.max_y)
 {
  this.area.min_y--;
  this.area.max_y++;
 }
 this.area.range_x=this.area.max_x-this.area.min_x;
 this.area.range_y=this.area.max_y-this.area.min_y;

 this.addPaddingToArea();
}

this.analyzeItem=function(item)
{
 item.x=Math.pow(item.x,this.geometry.powX);
 item.y=Math.pow(item.y,this.geometry.powY);

 if (item.x>this.area.max_x) this.area.max_x=item.x;
 if (item.y>this.area.max_y) this.area.max_y=item.y;
 if (item.x<this.area.min_x) this.area.min_x=item.x;
 if (item.y<this.area.min_y) this.area.min_y=item.y;
}

this.enlightenTime=200;

this.enlightenNextItem=function()
{
 	for (var i=0; i<this.data.length; i++)
	{
   var e=document.getElementById("id"+i);
   if(!e.style.backgroundImage)
   {
    e.style.backgroundImage="url("+this.data[i].image+")";
    this.enlightenTime/=1.25;
    setTimeout(this.enlightenNextItem.bind(this),this.enlightenTime);
    return;
   }
	}
}

this.newData=function()
{
 this.analyzeItems();
}

var default_geometry={powX: 0.2, powY: 1};

this.data     =data;
this.container=container;
this.geometry =geometry || default_geometry;

// this.data.forEach(this.createItem,this); // ie8 does not support forEach
for (var i=0; i<this.data.length; i++) this.createItem(this.data[i],i);

if (location.search.indexOf("no_images")==-1) this.enlightenNextItem();

}


