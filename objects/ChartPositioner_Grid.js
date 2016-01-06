"use strict";

window.ChartPositioner_Grid=function (chart)
{

this.showItems=function()
{
 for (var column=0;column<this.columns;column++)
 {
  for (var row=0;row<this.rows;row++)
  {
   var item_id=this.grid[column][row];
   if (typeof(item_id)=='undefined') continue;

   var x=(0+column) *(100/(this.columns));
   var y=100-(row+1)*(100/(this.rows));
  
   this.chart.data[item_id].display_x=x;
   this.chart.data[item_id].display_y=y;

   var e=document.getElementById("id"+item_id);
   e.style.left=x+"%";
   e.style.top =y+"%";
  }
 }
}

this.findClosestSlot=function(x,y)
{
 var r={x: null, y:null, dist: Number.MAX_VALUE};
 for (var rx=0;rx<this.columns;rx++)
 {
  for (var ry=0;ry<this.rows;ry++)
  {
   if (typeof (this.grid[rx][ry])=="undefined")
   {
    var dx=rx-x;
    var dy=ry-y;
    var dist=Math.sqrt(dx*dx+dy*dy);
    if (dist<r.dist)
    {
     r.x=rx;
     r.y=ry;
     r.dist=dist;
    }
   }
  }
 }
 return r;
}

this.positionItem=function(item,item_id)
{
 // First, we have to find out where the preferred position of the item in the grid would be:
 var rx=item.x-this.chart.area.min_x;
 var ry=item.y-this.chart.area.min_y;

 rx=rx/this.chart.area.range_x*(this.columns-1);
 ry=ry/this.chart.area.range_y*(this.rows-1);

 var pos=this.findClosestSlot(rx,ry);

 this.grid[pos.x][pos.y]=item_id;
}

this.resizeItems=function()
{
 var item_width =this.chart.container.clientWidth /(this.columns+3);
 var item_height=this.chart.container.clientHeight/(this.rows   +3);
 if (item_width<item_height) item_height=item_width;
 else                        item_width =item_height;
 $(".item").width(item_width);
 $(".item").height(item_height);
}


this.swapLeftMaybe=function(x,y)
{
 var id  =this.grid[x  ][y];
 var id_l=this.grid[x-1][y];

 if (this.chart.data[id].x>this.chart.data[id_l].x) return false;

 if (this.chart.data[id].x<this.chart.data[id_l].x)
 {
  this.grid[x  ][y]=id_l;
  this.grid[x-1][y]=id;
  return true;
 }

 if (id<id_l)
 {
  this.grid[x  ][y]=id_l;
  this.grid[x-1][y]=id;
  return true;
 }

 return false;
}

this.swapUpMaybe=function(x,y)
{
 var id  =this.grid[x][y  ];
 var id_d=this.grid[x][y-1];

 if (this.chart.data[id].y>this.chart.data[id_d].y) return false;

 if (this.chart.data[id].y<this.chart.data[id_d].y)
 {
  this.grid[x][y  ]=id_d;
  this.grid[x][y-1]=id;
  return true;
 }

 if (id<id_d)
 {
  this.grid[x][y  ]=id_d;
  this.grid[x][y-1]=id;
  return true;
 }

 return false;
}

this.movearound=function()
{
 for (var rx=1;rx<this.columns;rx++)
 {
  for (var ry=1;ry<this.rows;ry++)
  {
   if (typeof (this.grid[rx  ][ry])=="undefined") continue;
   if (typeof (this.grid[rx-1][ry])!="undefined")
   {
    if (this.swapLeftMaybe(rx,ry)) continue;
   }
   if (typeof (this.grid[rx][ry-1])!="undefined")
   {
    if (this.swapUpMaybe(rx,ry)) continue;
   }
  }
 }
}

this.setRowsAndColumns=function(nr_items)
{
 this.rows   =30;
 this.columns=40;

 if (this.chart.visible_items.length<201)
 {
  this.rows   =20;
  this.columns=40;
 }

 if (this.chart.visible_items.length<100)
 {
  this.rows   =10;
  this.columns=20;
 }

 if (this.chart.visible_items.length<10)
 {
  this.rows   =5;
  this.columns=10;
 }
}

this.createTheGrid=function()
{
 this.setRowsAndColumns();
 this.grid=Array(this.columns); 
 for (var column=0;column<this.columns;column++)
 {
  this.grid[column]=Array(this.rows);
 }
}

/*
this.countVisibleItems=function()
{
 var r=0;
 for (var i=0;i<this.chart.data.length;i++)
 {
  if (!this.chart.data[i].hidden) r++;
 }
 return r;
}
*/

this.positionVisibleItems=function()
{
 for (var i=0; i<this.chart.data.length; i++)
 {
  if (!this.chart.data[i].hidden) this.positionItem(this.chart.data[i],i);
 }
}

this.positionItems=function()
{
// var nr_items=this.countVisibleItems();
// this.createTheGrid(nr_items);
 this.createTheGrid();
 this.resizeItems();
 this.positionVisibleItems();
 this.movearound();
 this.movearound();
 this.movearound();
 this.movearound();
}

this.newData=function()
{
 this.chart.newData();
 this.positionItems();
 this.showItems();
}

this.chart=chart;

var me=this;
window.addEventListener('resize', function () {me.resizeItems()});


}