<?php

function fix_target ($path) {
	$path = ereg_replace ("&", "&amp;", $path);
	return ($path);
}

function mail_link ($email) {
	if (trim ($email) == "")
		return ("");
	return (sprintf ("<a href='mailto:%s'>%s</a>",
			 urlencode($email), h($email)));
}


function h($val) {
	return (htmlentities ($val, ENT_QUOTES, 'UTF-8'));
}

function pstart () {
	global $header, $body, $footer, $tail, $js_vars;

	$header = "<meta http-equiv='Content-Type'"
		." content='text/html; charset=utf-8' />\n";

	$header .= "<title>power</title>\n";

	$header .= "<link rel='stylesheet' type='text/css'"
		." href='style.css' media='screen' />\n";

	$body = "";

	$footer = "";

	$tail .= "<script type='text/javascript' src='jquery-1.3.2.min.js'>"
		."</script>\n";
	$tail .= "<script type='text/javascript' src='script.js'>"
		."</script>\n";

	$js_vars = "";
}

function pfinish () {
	global $header, $body, $footer, $tail, $js_vars;

	echo ("<!DOCTYPE html PUBLIC"
	      ." '-//W3C//DTD XHTML 1.0 Transitional//EN'"
	      ." 'http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd'>\n");
	echo ("<html>\n");
	echo ("<head>\n");
	echo ($header);
	echo ("</head>\n");
	echo ("<body>\n");

	echo ("<div id='container'>\n");
	echo ("<div id='container-inner'>\n");
	echo ($body);

	echo ($footer);

	echo ("</div><!-- container-inner -->\n");
	echo ("</div><!-- container -->\n");

	echo ("<script type='text/javascript'>\n");
	echo (h($js_vars));
	echo ("</script>\n");

	echo ($tail);

	echo ("</body>\n");
	echo ("</html>\n");
	exit ();
}

?>
