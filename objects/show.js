window.addEventListener("DOMContentLoaded", function load(event){

 var tmp;
 tmp=document.getElementById("nr");
 if (tmp) nr.innerHTML=data.length;

 tmp=document.getElementById("category");
 if (tmp) tmp.value=category;

 tmp=document.getElementById("region");
 if (tmp) tmp.value=region;

 $(".toggle").click(function(e){
  e.preventDefault();
  $(e.target).toggleClass("active");
 
  var id=e.target.id;
  var container_id=id+"_container";
  var container=$("#"+container_id);
  container.slideToggle("normal");
 });

 axis_tooltips=new ge.tooltips();

 axis_tooltips.positionToolTip=axis_tooltips.positionToolTip_nearMouse;

 axis_tooltips.get_tooltip=function(element)
 {
  var e=document.createElement("div");
  e.id="axis_tooltip";
  e.className="tooltip axis_tooltip";

  var content = document.getElementById("axis_tooltip_template").innerHTML;
  content=content.replace(/{AXIS}/g,element.id);
  
  e.innerHTML=content;
 
  return e;
 };

 if (document.getElementById("axis_tooltip_template")) axis_tooltips.start(".axis");


 

  var e=document.getElementById("toggle_brand");
 if (e) e.click();
  var e=document.getElementById("toggle_sensor_size");
 if (e) e.click();
  var e=document.getElementById("toggle_search");
 if (e) e.click();
 var e=document.getElementById("toggle_specs");
 if (e) e.click();
 var e=document.getElementById("toggle_video_resolution");
 if (e) e.click();
  var e=document.getElementById("toggle_memory_card_type");
 if (e) e.click();
});

// ----------------------------------------------------------------------------
// Functions
// ----------------------------------------------------------------------------

function change_region()
{
 var url=document.getElementById("region").value;
 if (url=="com") url="./";
 location.href=url;
}

function change_category()
{
 var new_category=document.getElementById("category").value;
 var url=location.href;
 url=url.replace(category,new_category);
 // alert (url);
 location.href=url;
}

function analyzeLimits(key,val)
{
 if (!data_limits[key])
 {
  data_limits[key]={
                    min: val,
                    max: val
                   };
 }
 else
 {
  if (val<data_limits[key].min) data_limits[key].min=val;
  if (val>data_limits[key].max) data_limits[key].max=val;
 }
}

function addNoUiSlider(id,start,range,step)
{
 var settings={
  start: start,
  range: range,
  format: {
           to:   function (value) { return Math.round(value*100)/100; },
           from: function (value) { return value; }
          }
 };

 if (step=="values") settings.snap=true;
 else                settings.step=step;

 $('#slider_'+id).noUiSlider(settings);
}

function getRangeValues(id,round)
{
 var values_in_keys={};
 for (var i=0;i<data.length;i++)
 {
  if (typeof(data[i][id])=="undefined") continue;
  values_in_keys[data[i][id]]=1;
 }

 var values=[];
 for (key in values_in_keys)
 {
  if (values_in_keys.hasOwnProperty(key))
  {
   var value=parseFloat(key);
   if (round=="floor") value=Math.floor(value);
   values.push(value);
  }
 }

 values.sort(function f(a,b) {return a-b;});

 return values;
}

function appendRangeValues(noUiRange,values)
{
 var step=100/(values.length-1);
 var perc=step;
 for (var i=1;i<values.length-1;i++)
 {
  noUiRange[perc+"%"]=values[i];
  perc+=step;
 }
}

function addSlider(id,range,step,round)
{
 step=step || 1;
 if (range=="max") min=Math.ceil (data_limits[id].min);
 else              min=Math.floor(data_limits[id].min);
 max=Math.ceil(data_limits[id].max);

 var start=[0];
 if (range=="range") start=[0,max];
 if (range=="max"  ) start=[max];

 noUiRange={};

 noUiRange['min']=min;

 if (step=="values")
 {
  var values=getRangeValues(id,round);
  appendRangeValues(noUiRange,values);
  max=values[values.length-1];
 }

 noUiRange['max']=max;

 addNoUiSlider(id,start,noUiRange,step);

 $("#slider_"+id).on(
 {
  change: function()
  {
   filter_change();
  }
 });

 if (range=="range" || range=="min")
 {
  $("#slider_"+id).Link('lower').to($("#"+id+"-min"));
 }
 if (range=="max")
 {
  $("#slider_"+id).Link('lower').to($("#"+id+"-max"));
 }
 if (range=="range")
 {
  $("#slider_"+id).Link('upper').to($("#"+id+"-max"));
 }
}

function itemCleaner()
{
 for (var i=0;i<chart.data.length;i++)
 {
  if (chart.data[i].hidden)
  {
   var e=document.getElementById("id"+i);
   e.style.display="none";
  }
 }
 positioner.newData();
 setTimeout(itemAdder,1000);
}

function itemAdder()
{
 for (var i=0;i<chart.data.length;i++)
 {
  if (!chart.data[i].hidden)
  {
   var e=document.getElementById("id"+i);
   e.style.display="block";
   e.style.opacity=1;
  }
 }
}

function createAxisData(axis,str)
{
 var parts=str.split('_per_');
 var v=parts[0];
 var v_by=parts[1];
 
 for (var i=0;i<data.length;i++)
 {
  var the_value=0;
  the_value =data[i][v];
  if (v_by) the_value/=data[i][v_by];
  // if (isNaN(the_value)) the_value=0;
  if (axis=="x-axis") data[i].axis_x_value=the_value;
  else                data[i].axis_y_value=the_value;
 }
 hideAxisNaN();
}

function hideAxisNaN()
{
 for (var i=0;i<data.length;i++)
 {
  if ( isNaN(data[i]['axis_x_value']) || isNaN(data[i]['axis_y_value']) )
  {
   if (typeof(chart)!="undefined")
   {
    setItemHidden(i,true);
   }
   else
   {
    if (isNaN(data[i]['axis_x_value'])) data[i]['axis_x_value']=0;
    if (isNaN(data[i]['axis_y_value'])) data[i]['axis_y_value']=0;
   }
  }
 }
}

function changeAxisName(axis,str)
{
 var name=axis_names[str];
 document.getElementById(axis+"-label").innerHTML=name;
}

function changeAxis(axis,str)
{
 applyFilters(); // otherwise items hidden doe to a previeous changeAxis will not return
 createAxisData(axis,str);
 positioner.newData();
 changeAxisName(axis,str);
 setTimeout(itemAdder,1000);
}

function filter_change()
{
 applyFilters();
 hideAxisNaN();
 setTimeout(itemCleaner,1000);
}


function setItemHidden(i,hidden)
{
  var e=document.getElementById("id"+i);
  if (hidden)
	{
		e.style.opacity=0;
    chart.data[i].hidden=true;
	}
  else
  {
   if (chart.data[i].hidden)
   {
   }
   chart.data[i].hidden=false;
  }
}

function testFilters(i,filters)
{
 for (var f=0;f<filters.max.length;f++)
 {
  var fa=filters.max[f]['attribute'];
  var fv=filters.max[f]['value'];
  if (parseFloat(data[i][fa])>fv) return true;
  if (isNaN(data[i][fa]))         return true;
 }

 for (var f=0;f<filters.min.length;f++)
 {
  var fa=filters.min[f]['attribute'];
  var fv=filters.min[f]['value'];
  var value=parseFloat(data[i][fa]);
  if (!value) value=0;
  if (value<fv) return true;
 }
 return false;
}

function getFiltersFromForm()
{
 var settings=document.getElementsByClassName("att");
 var r={
         min: [],
         max: []
        };
 for (var i in settings)
 {
  if (typeof(settings[i].id)!="undefined")
  {
   var setting=settings[i].id;
   var value=settings[i].innerHTML;
   var tmp=setting.split("-");
   var id   = tmp[0];
   var type = tmp[1];
	 if (parseFloat(value)>0)
   {
    if (type=="max" && value<data_limits[id].max) r.max.push({attribute: id,value: value});
    if (type=="min" && value>data_limits[id].min) r.min.push({attribute: id,value: value});
   }
  }
 }
 return r;
}

function getMultipleChoiceFilter(id)
{
 var selector="#toggle_"+id+"_container input:checkbox:checked";
 return $(selector).map(function () { return this.value.toLowerCase(); }).get();
}

function testMultipleChoiceFilters(id,filters)
{
 for (filter in filters) 
 {
  if (filters[filter].length==0) continue;
  if (typeof(data[id][''+filter])=="undefined") return true;
  if (filters[filter].indexOf(data[id][''+filter].toLowerCase())==-1) return true;
 }
 return false; 
}