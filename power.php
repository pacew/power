<?php

require ("common.php");

pstart ();

$width = 0 + @$_REQUEST['width'];
$height = 0 + @$_REQUEST['height'];

if ($width == 0 || $height == 0) {
	$width = 640;
	$height = 480;
}

$body .= "<form action='power.php'>\n";
$body .= sprintf ("width: <input type='text' name='width' value='%d' />\n",
		  $width);
$body .= sprintf ("width: <input type='text' name='height' value='%d' />\n",
		  $height);
$body .= "<input type='submit' value='Set' />\n";
$body .= "</form>\n";

$body .= "<canvas id='power_graph' width='$width' height='$height'></canvas>\n";

pfinish ();
?>
