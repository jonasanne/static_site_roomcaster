<?php

header('Content-Type: application/json');

try {
  $room = isset($_GET['room']) ? $_GET['room'] : "";
  $day = isset($_GET['day']) ? $_GET['day'] : "";

  $data = json_decode(file_get_contents("./" . strtolower($day) . ".json"), true);

  if (empty($room)) {
    // If no room is provided, return the entire JSON data
    echo json_encode($data);
    exit;
  }

  if (!isset($data[$room])) {
    echo json_encode(["error" => "Kamer niet gevonden"]);
    exit;
  }

  echo json_encode($data[$room]);
} catch (\Throwable $th) {
  echo json_encode(["error" => "An error occurred", "details" => $th->getMessage()]);
}