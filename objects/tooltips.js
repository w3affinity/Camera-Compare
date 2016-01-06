/********************************************************************************
*
* ge.tooltips 3 - a sweet tootltip object
*
* TODO: load jquery
*
* At first I tried several jQuery toolkit plugins (tootlip,qtip,cluetip) but didnt
* like any of them so I wrote my own tooltip code.
* 
* Compared to tooltips.js, this doesn't use html string input for the tooltip but
* uses a clone of an given element.
* 
* Usage: 
* 
*  ge.tooltips.get_tooltip=function(element) { return document.getElementById('myTooltip'); };
*  ge.tooltips.start("a");
*
********************************************************************************/

if (typeof(ge)=="undefined") ge=new function() {};

// helper to keep track of 'lost' mouse.
// in FF, when the mouse enters a embedded plugin, all
// events get redirected to this plugin so we don't 
// know if elements are hovered anymore. 
// ge.mouse.is_lost can be used to query if the mouse 
// is in such unknown areas.
// ge.mouse.found(..) attaches a handler that is fired
// once if the mouse becomes known again.
ge.mouse=new function()
{
 this.is_lost=false;
 this.foundHandler=false;
 this.found=function(foundHandler)
 {
  this.foundHandler=foundHandler;
 }
 
 $('body').hover(
  function(event)
  { 
   ge.mouse.is_lost=false;
   if(ge.mouse.foundHandler) ge.mouse.foundHandler();
   ge.mouse.foundHandler=false;
  },
  function(event)
  { 
   ge.mouse.is_lost=true;
  }
 );
}

ge.tooltips=function()
{
 this.border_x=30;
 this.border_y=30;
 this.mouse_offset_x=4;
 this.mouse_offset_y=4;

 this.get_tooltip=function(element)
 {
  return element;
 }

 this.tip_over=function()
 {
  clearTimeout(timerID);
 }

 // special tip out handler using ge.mouse
 // to keep track of a lost mouse (may happen with FF on embedded plugins)
 this.tip_out_handler=function(e)
 {
  var handler=function() 
  {      
   if(ge.mouse.is_lost) 
   {
    // the mouse is lost. we install a handler 
    // to keep on going if it is found again.
    ge.mouse.found(
     function()
     {
      // recall this handler if the mouse left the unknown
      timerID=setTimeout(handler,1000);
     }
    );
    return;
   }
   this.tip_out();
  };
 
  timerID=setTimeout(handler.bind(this),1000);
 }

 this.tip_out=function()
 {
   tooltip.status="fading_out";
   tooltip.fadeOut("slow"); 
 }

 this.positionToolTip=function(event,element)
 {
  var pos=$(element).offset();
  pos.top -=tooltip.height();
  pos.left+=$(element).width();
  var scrollX=$(window).scrollLeft();
  if (pos.left+tooltip.outerWidth()-scrollX > $(window).width())
   pos.left-=tooltip.outerWidth()+$(element).width();
  var scrollY=$(window).scrollTop();
  if (pos.top-scrollY < 0)
   pos.top+=tooltip.outerHeight()+$(element).height();
  return pos;
 }

 this.positionToolTip_nearMouse=function(event,element)
 {
//  var pos=$(element).offset();
  var pos={};
  pos.top =event.clientY;
  pos.left=event.clientX+8;
  pos.top -=tooltip.height();
/*
  var scrollX=$(window).scrollLeft();
  if (pos.left+tooltip.outerWidth()-scrollX > $(window).width())
   pos.left-=tooltip.outerWidth()+$(element).width();
  var scrollY=$(window).scrollTop();
  if (pos.top-scrollY < 0)
   pos.top+=tooltip.outerHeight()+$(element).height();
*/
  return pos;
 }

 this.handle_mouseover=function(event,element)
 {
  if (typeof(timerID)!="undefined") clearTimeout(timerID);
  
  if (typeof(tooltip)!="undefined") // always true except for the 1st invocation of a tooltip
  {
   var old_stuff=tooltip.html();
   var new_tip=$(this.get_tooltip(element));
   var new_stuff=new_tip.html();
   if ((old_stuff==new_stuff) && (tooltip.status=="active")) return;
   tooltip.remove();
   tooltip=new_tip;
  }
  else
  {
   tooltip=$(this.get_tooltip(element));
  }

  tooltip.appendTo(document.body);

	var pos=this.positionToolTip(event,element);
  tooltip.css({left: pos.left, top: pos.top});

  tooltip.status="active";
  tooltip.hover(this.tip_over.bind(this),this.tip_out_handler.bind(this));
 }

 this.handle_mouseout=function(e)
 {
  this.startFadeout();
 }

 this.startFadeout=function()
 {
  if (typeof(timerID)!="undefined") clearTimeout(timerID);
  timerID=setTimeout(function () { tooltip.status="fading_out";tooltip.fadeOut("slow"); },500);
 }

 this.addSelector=function(selector)
 {
  var me=this;
  $(selector).hover(function(event) {me.handle_mouseover(event,this)},
                    function()      {me.handle_mouseout()});
 }

 this.document_click=function(e)
 {
  if (typeof(tooltip)=="undefined") return;

  // strangely, this doesnt work:
  if (tooltip.has(e.target).length>0) return; // click inside the tooltip

  if (typeof(timerID)!="undefined") clearTimeout(timerID);

  tooltip.status="removed";  
  tooltip.remove();
 }

 this.start=function(selector,no_styles)
 {
  this.addSelector(selector);

  var me=this;

  // this doesnt work on ipad
  $(document).bind("click",function (e) {me.document_click(e)});
  // this works on ipad:
  $(document).bind("touchstart",function (e) {me.document_click(e)});

 }
}