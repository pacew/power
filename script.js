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

function canvas_update () {
    var width = $(canvas).width ();
    var height = $(canvas).height ();

    var max_val = 4.0;

    var use_secs = power_data_end - power_data_start - 1;
    if (use_secs <= 2)
	return;

    if (use_secs > width)
	use_secs = width;

    var end_secs = power_data_end;
    var start_secs = end_secs - use_secs;
    var left_secs = end_secs - width;

    var end_x = width;
    var start_x = width - use_secs;

    ctx.clearRect (0, 0, width, height);

    ctx.beginPath ();

    var need_moveto = 1;
    var ret = "";
    for (secs = start_secs; secs < end_secs; secs++) {
	x = secs - left_secs;

	val = power_data[secs];
	ret = ret + val + "   ";
	if (val) {
	    y = height - val / max_val * height;
	    y = y.toFixed (0);
	    if (y < 0)
		y = 0;
	    if (y > height - 1)
		y = height - 1;
	    
	    ret = ret + x+","+y+"  ";

	    if (need_moveto) {
		need_moveto = 0;
		ctx.moveTo (x, y);
	    } else {
		ctx.lineTo (x, y);
	    }
	}
    }


    ctx.stroke ();
}


$(function () {
	canvas_init ();
	power_setup ();
    });
