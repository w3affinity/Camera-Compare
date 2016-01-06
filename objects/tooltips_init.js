item_tooltips=new ge.tooltips();

item_tooltips.get_tooltip=function(e)
{
 return get_tooltip(e);
};

item_tooltips.start(".item");

// ----------------------------------------------------------------------------
// Functions
// ----------------------------------------------------------------------------

function get_tooltip(e)
{
 e.style.zIndex=max_z_index;
 max_z_index++;

 var item_id=e.id;

 var item_id=e.id.substring(2);
 r=create_tooltip(data[item_id],item_id)

 return r;
};

function dismiss(i)
{
 var e=document.getElementById("id"+i);
 $(e).removeClass("highlighted");
 $(e).toggleClass("dismissed");
 $(".dismiss").toggleClass("dismissed");
 $(".highlight").removeClass("highlighted");
 tooltip.status="fading_out";tooltip.fadeOut("400");
}

function highlight(i)
{
 var e=document.getElementById("id"+i);
 $(e).removeClass("dismissed");
 $(e).toggleClass("highlighted");
 $(".highlight").toggleClass("highlighted");
 $(".dismiss").removeClass("dismissed");
 tooltip.status="fading_out";tooltip.fadeOut("400");
}

function create_tooltip(o,i)
{

 if (o.needs_update=="1")
 {
  raw=$.ajax({type: "GET",
                  url: "../item_update?id="+o.id,
                  async: false
                 }).responseText;

  new_data=JSON.parse(raw);
	
	o.needs_update=new_data.needs_update;
  o.last_update =new_data.last_update;
  o.price       =new_data.price;
 }

 var e=document.createElement("div");
 e.id="tooltip_id"+i;
 e.className="tooltip";

 o.gb_per_price=Math.round(o.storage/o.price*100)/100;

 var hclass="highlight";
 var dclass="dismiss";

 var the_item=document.getElementById("id"+i);
 if ($(the_item).hasClass("highlighted")) hclass+=" highlighted";
 if ($(the_item).hasClass("dismissed"))   dclass+=" dismissed";

 var content = tooltip_template;

 content=content.replace("{HCLASS}",hclass,"g");
 content=content.replace("{DCLASS}",dclass,"g");
 content=content.replace(/\{I\}/g,i); // in chrome and ie, the g flag only works with regex
 content=content.replace(/\{BASE_NAME_e\}/g,encodeURIComponent(o.base_name)); // in chrome and ie, the g flag only works with regex
 
 for (var i in o)
 {
  // content=content.replace("{"+i.toUpperCase()+"}",o[i],"g");
  content=content.split("{"+i.toUpperCase()+"}").join(o[i]);
 }

 content=content.replace(/{[a-z0-9_-]+}/gi,'?',content);
 content=content.replace(/\? x \?/gi,"unknown",content); // resolution ? x ?
 content=content.replace(/\? pounds/gi,"unknown",content); // resolution ? x ?

 e.innerHTML=content;

 return e;
}


