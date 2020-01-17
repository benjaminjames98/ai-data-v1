<?php
header("Content-Type: application/json; charset=UTF-8");

require "../../db_access.php";

function throwError() {
    echo json_encode(["a" => "0"]);
    exit();
}

$mysqli = getMysqli();
if ($mysqli == -1) throwError();

/*---- preparation ----*/

// input sanitation

$col = $_GET['col'];
$dir = $_GET['dir'];
$lim = $_GET['lim'];
$off = $_GET['off'];

$query = '';
if (!in_array($dir, ['ASC', 'DESC']))
    $dir = 'ASC';

if (!in_array($col, ['__pk_id', 'name', 'denomination']))
    $col = '__pk_id';

// fetch table and construct

$query = "SELECT __pk_id,name,denomination FROM church WHERE visibility='public' ORDER BY {$col} {$dir}, __pk_id ASC LIMIT ? OFFSET ?;";
$stmt = $mysqli->prepare($query);
$stmt->bind_param("ii", $lim, $off);
$stmt->execute();
$stmt->bind_result($id, $name, $denomination);

$table = "";
if ($off == 0) $table = "<table class='w3-table w3-striped w3-hoverable'>"
    . "<thead><tr class='w3-theme-l1'><th>id</th><th>name</th><th>denomination</th></tr></thead>";

while ($stmt->fetch())
    $table .= "<tr><th>{$id}</th><th>{$name}</th><th>{$denomination}</th></tr>";
if ($off == 0) $table .= "</table>";

$query = "SELECT COUNT(`__pk_id`) FROM church;";
$stmt = $mysqli->prepare($query);
$stmt->execute();
$stmt->bind_result($count);
$stmt->fetch();
$stmt->close();

$table = urlencode($table);
echo json_encode(['table' => $table, 'count' => $count]);

exit();