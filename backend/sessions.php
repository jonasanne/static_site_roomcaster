<?php
header('Content-Type: application/json');

try {
  $room = isset($_GET['room']) ? $_GET['room'] : "";
  $day = isset($_GET['day']) ? $_GET['day'] : "";

  $data = json_decode(file_get_contents("./" . strtolower($day) . ".json"), true);

  if (!isset($data[$room])) {
    echo json_encode(["error" => "Kamer niet gevonden"]);
    exit;
  }

  echo json_encode($data[$room]);
} catch (\Throwable $th) {
  throw $th;
}
