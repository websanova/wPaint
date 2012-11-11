<?php

echo $_POST['image'];

$image = imagecreatefrompng($_POST['image']);

imagealphablending($image, false);
imagesavealpha($image, true);
imagepng($image, 'uploads/wPaint.png');
