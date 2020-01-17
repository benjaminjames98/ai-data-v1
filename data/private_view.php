<?php
header("Content-Type: application/json; charset=UTF-8");

require "../../pw_check.php";
require "../../db_access.php";

function throwError() {
    echo json_encode(["a" => "0"]);
    exit();
}

$mysqli = getMysqli();
if ($mysqli == -1) throwError();

/*---- preparation ----*/

if ($_SERVER['REQUEST_METHOD'] == 'POST')
    $pw_check = checkPassword($_POST['pw']);
else if ($_SERVER['REQUEST_METHOD'] == 'GET')
    $pw_check = checkPassword($_GET['pw']);
else
    $pw_check = false;

if (!$pw_check) throwError();

/*---- password check ----*/

$q = null;
if ($_SERVER['REQUEST_METHOD'] == 'POST')
    $q = $_POST['q'];
else if ($_SERVER['REQUEST_METHOD'] == 'GET')
    $q = $_GET['q'];
else throwError();

/*---- algorithms ----*/

if ($q == 'pw_check') echo json_encode(['pass' => true]);

if ($q == 'fetch_table') {
    $ent = $_GET['ent'];
    $col = $_GET['col'];
    $dir = $_GET['dir'];
    $lim = $_GET['lim'];
    $off = $_GET['off'];
    $query = '';
    if (!in_array($dir, ['ASC', 'DESC']))
        $dir = 'ASC';

    if ($ent == 'church' && !in_array($col, ['__pk_id', 'name', 'denomination', 'visibility', 'bread_participating',
            'bread_fk_route', 'bread_delivered', 'post_code']))
        $col = '__pk_id';

    if ($ent == 'person' && !in_array($col, ['__pk_id', 'first_name', 'last_name']))
        $col = '__pk_id';

    // get column names
    $table = "";
    if ($off == 0) {
        $table = "<table class='w3-table w3-striped w3-hoverable'><thead><tr class='w3-theme-l1'>";
        if ($ent == 'church') {
            $table .= "<th>__pk_id</th><th>name</th><th>denomination</th><th>visibility</th>";
            $table .= "<th>bread_participating</th><th>bread_fk_route</th><th>bread_delivered</th><th>note</th>";
            $table .= "<th>email</th><th>phone</th><th>website</th><th>postcode</th><th>address</th>";
        }
        if ($ent == 'person') {
            $table .= "<th>__pk_id</th><th>first_name</th><th>last_name</th><th>note</th>";
        }
        $table .= '</tr></thead>';

    }

    // get info
    if ($ent == 'church') {
        // basic info
        $query = <<<MYSQL
SELECT
  church.__pk_id,
  church.name,
  church.denomination,
  church.visibility,
  church.bread_participating,
  church.bread_fk_route,
  church.bread_delivered,
  church.note,
  email.email_address,
  phone.phone_number,
  website.url,
  address.post_code,
  CONCAT_WS(', ', address.line_1, address.line_2, address.suburb, address.state, address.post_code)
FROM church
  LEFT JOIN email ON church.__pk_id = email._fk_church AND email.type = 'primary'
  LEFT JOIN phone ON church.__pk_id = phone._fk_church AND phone.type = 'primary'
  LEFT JOIN website ON church.__pk_id = website._fk_church AND website.type = 'primary'
  LEFT JOIN address ON church.__pk_id = address._fk_church AND address.type = 'primary'
ORDER BY {$col} {$dir}, church.__pk_id ASC
LIMIT ?
OFFSET ?;
MYSQL;
        $stmt = $mysqli->prepare($query);
        $stmt->bind_param("ii", $lim, $off);
        $stmt->execute();
        $stmt->bind_result($id, $na, $de, $vi, $bp, $bf, $bd, $no, $ea, $pn, $ur, $pc, $ad);

        while ($stmt->fetch()) {
            $table .= "<tr>";
            $table .= "<th>{$id}</th><th>{$na}</th><th>{$de}</th><th>{$vi}</th><th>{$bp}</th>";
            $table .= "<th>{$bf}</th><th>{$bd}</th><th>{$no}</th><th>{$ea}</th><th>{$pn}</th>";
            $table .= "<th>{$ur}</th><th>{$pc}</th><th>{$ad}</th>";
            $table .= "</tr>";
        }
    }
    if ($ent == 'person') {
        $query = <<<MYSQL
SELECT
  person.__pk_id,
  person.first_name,
  person.last_name,
  person.note
FROM person
ORDER BY {$col} {$dir}, person.__pk_id ASC
LIMIT ?
OFFSET ?;
MYSQL;

        $stmt = $mysqli->prepare($query);
        $stmt->bind_param("ii", $lim, $off);
        $stmt->execute();
        $stmt->bind_result($id, $fn, $ln, $no);

        while ($stmt->fetch()) {
            $table .= "<tr>";
            $table .= "<th>{$id}</th><th>{$fn}</th><th>{$ln}</th><th>{$no}</th>";
            $table .= "</tr>";
        }
    }
    if ($off == 0) $table .= "</table>";

// conclusion
    if ($ent == 'church') $query = "SELECT COUNT(`__pk_id`) FROM church;";
    if ($ent == 'person') $query = "SELECT COUNT(`__pk_id`) FROM person;";
    $stmt = $mysqli->prepare($query);
    $stmt->execute();
    $stmt->bind_result($count);
    $stmt->fetch();

    $stmt->close();
    $table = urlencode($table);
    echo json_encode(['q' => $q, 'table' => $table, 'count' => $count]);
}

if ($q == 'fetch_emails') {
    $pcs = $_GET['pcs'];

    $query = <<<MYSQL
SELECT e.email_address, a.post_code
FROM church AS c, email AS e, address AS a
WHERE c.__pk_id = e._fk_church AND c.__pk_id = a._fk_church AND a.type = 'primary';
MYSQL;

    $stmt = $mysqli->prepare($query);
    $stmt->execute();
    $stmt->bind_result($ea, $pc);
    $emails = '';
    while ($stmt->fetch()) {
        if ($pcs == '' || strpos($pcs, $pc) !== false) {
            if ($emails == '') {
                $emails .= $ea;
            } else {
                $emails .= ';' . $ea;
            }
        }
    }

    $emails = urlencode($emails);
    echo json_encode(['emails' => $emails]);
}

exit();