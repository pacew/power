<?php

$last_mday = -1;
$inf = NULL;

while (1) {
  $mday = strftime ("%d");

  if ($mday != $last_mday) {
    if ($inf)
      fclose ($inf);
    $inf = NULL;
    
    $last_mday = $mday;
    $filename = strftime ("/var/power/pwr%Y-%m-%d");
  }

  if ($inf == NULL) {
    if (($inf = @fopen ($filename, "r")) == NULL) {
      sleep (5);
      continue;
    }
    $pos = filesize ($filename);
    $data = fread ($inf, $pos);
    
    $nlines = 0;
    while ($pos > 0) {
      if ($data[$pos - 1] == "\n") {
	$nlines++;
	if ($nlines > 10)
	  break;
      }
      $pos--;
    }
  }

  while (1) {
    $s = fstat ($inf);
    $size = $s['size'];
    if ($size <= $pos) {
      break;
    }

    fseek ($inf, $pos);
    $row = fgets ($inf);
    $len = strlen ($row);
    if ($len == 0)
      break;
    if ($row[$len-1] != "\n")
      break;
    echo ($row);
    echo ("<br/>\n");
    $pos += strlen ($row);
  }
  flush ();
  sleep (1);
  
}

?>
