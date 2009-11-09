function dbg (str) {
	try {
		if (console && console.log) {
			console.log (str + "\n");
		}
	} catch (e) {
	}
}

var req;
var last_response_text_size;
var req_time;

function power_setup () {
    if (window.XMLHttpRequest) {
	req = new window.XMLHttpRequest ();
    } else {
	req = new window.ActiveXObject ("MSXML2.XMLHTTP.3.0");
    }

    var url = "power-data.php?ts=" + new Date().getTime();

    req.open ("GET", url, true);
    req.onreadystatechange = req_callback;

    last_response_text_size = 0;
    req_time = new Date ();

    req.send (null);

    
}

var power_data = [];
var power_data_start = -1;
var power_data_end = -1;

function req_callback () {
    if (req.responseText) {
	var len, newdata;

	len = req.responseText.length;
	var newdata = req.responseText.substring (last_response_text_size);
	last_response_text_size = len;

	var rows = newdata.split ("\n");
	var i;
	for (i = 0; i < rows.length; i++) {
	    var cols = rows[i].split (" ");
	    if (cols.length == 2) {
		var secs = parseInt (cols[0]);
		var kw = Number (cols[1]);
		power_data[secs] = kw;

		if (power_data_start == -1 || secs < power_data_start)
		    power_data_start = secs;
		if (secs > power_data_end)
		    power_data_end = secs;
	    }
	}

	canvas_update ();

	if (new Date () - req_time > 60 * 1000) {
	    last_response_text_size = 0;
	    req.abort ();
	    req = null;
	    power_setup ();
	}
    }
}

var canvas, ctx;

function canvas_init () {
    canvas = document.getElementById ('power_graph');
    ctx = canvas.getContext ('2d');

}

var left_secs, right_secs;
var canvas_width, canvas_height;

var kw_min, kw_max;

function secs_to_x (secs) {
    var x = (secs - left_secs) / (right_secs - left_secs) * canvas_width;
    x = Math.floor (x);
    if (x < 0)
	x = 0;
    if (x > canvas_width)
	x = canvas_width;
    return (x);
}

function x_to_secs (x) {
    var secs = (right_secs - left_secs) / canvas_width * x + left_secs;
    secs = Math.floor (secs);
    if (secs < 0)
	secs = 0;
    return (secs);
}

function kw_to_y (kw) {
    var y = (kw - kw_min) / (kw_max - kw_min) * canvas_height;
    y = Math.floor (y);
    y = canvas_height - y;
    if (y < 0)
	y = 0;
    if (y >= canvas_height)
	y = canvas_height - 1;
    return (y);
}

function canvas_update () {
    canvas_width = $(canvas).width ();
    canvas_height = $(canvas).height ();

    kw_min = 1000;
    kw_max = 0;

    x = canvas_width;
    while (x >= 0) {
	var secs = x_to_secs (x);
	kw = power_data[secs];
	if (kw) {
	    if (kw > kw_max)
		kw_max = kw;
	    if (kw < kw_min)
		kw_min = kw;
	}
	x--;
    }
    
    kw_min = Math.floor (kw_min);
    kw_max = Math.floor (kw_max + 1);

    ctx.clearRect (0, 0, canvas_width, canvas_height);

    right_secs = power_data_end;
    left_secs = right_secs - (canvas_width * 1);

    ctx.strokeStyle = "#444444";
    ctx.lineWidth = 1;
    ctx.beginPath ();

    x = canvas_width;
    while (x >= 0) {
	var secs = x_to_secs (x);
	kw = power_data[secs];
	if (kw) {
	    ctx.moveTo (x, kw_to_y (kw));
	    break;
	}
	x--;
    }
    
    while (x >= 0) {
	var secs = x_to_secs (x);
	kw = power_data[secs];
	if (kw) {
	    y = kw_to_y (kw);
	    ctx.lineTo (x, y);
	}

	x--;
    }
	
    ctx.stroke ();

    canvas_grid ();
}

function canvas_grid () {
    var grid_spacing = 60;

    ctx.lineWidth = .25;

    secs = Math.floor (left_secs / grid_spacing) * grid_spacing;
    while (secs < right_secs) {
	x = secs_to_x (secs);

	ctx.strokeStyle = "#cccccc";

	if (x > 0) {
	    var ampm = "";
	    var hours = Math.floor (secs / 3600);
	    var s1 = secs - hours * 3600;
	    var minutes = Math.floor (s1 / 60);

	    if (minutes % 5 == 0) {
		ctx.strokeStyle = "#444444";
		if (hours == 0)
		    hours = 12;
		if (hours >= 12) {
		    ampm = "p";
		    if (hours > 12)
			hours -= 12;
		}
		
		var t = hours + ":";
		if (minutes < 10)
		    t += "0";
		t += minutes;
		t += ampm;
		
		ctx.save ();
		ctx.translate (x + 2, canvas_height - 30);
		ctx.mozDrawText (t);
		ctx.restore ();
	    }
	}

	ctx.beginPath ();
	ctx.moveTo (x, 0);
	ctx.lineTo (x, canvas_height);
	ctx.stroke ();


	secs += grid_spacing;
    }
    
    kw = kw_min;

    incr = 1;
    if (kw_max - kw_min <= 4)
	incr = .5;

    while (kw < kw_max) {
	y = kw_to_y (kw);

	ctx.beginPath ();
	ctx.moveTo (0, y);
	ctx.lineTo (canvas_width, y);
	ctx.stroke ();

	ctx.save ();
	ctx.translate (5, y - 5);

	text = kw;
	if (kw == kw_min)
	    text += " kw";

	ctx.mozDrawText (text);
	ctx.restore ();

	kw += incr;
    }


}


$(function () {
	canvas_init ();
	power_setup ();
    });
