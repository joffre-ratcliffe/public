<?php

$store = array ();

function eduard ($enn) {
    if ($enn==0) {return 0;}
    else if ($enn ==1 || $enn == 2) {return 1;}
    if (isset($store[$enn])) {return $store[$enn];}
    return $store[$enn] = (eduard($enn-1) + eduard($enn-2));
}
