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

/*---- $q ----*/

if ($q == 'pw_check') echo json_encode(['pass' => true]);

if ($q == 'den') {
    $query = "SELECT DISTINCT denomination FROM church ORDER BY denomination";
    $result = $mysqli->query($query);
    $html = "";
    while ($row = $result->fetch_assoc())
        if ($row['denomination'] != '')
            $html .= "<input type='checkbox' value='" . $row['denomination'] . "'>" . $row['denomination'] . "<br>";

    echo json_encode(['html' => $html]);
}

if ($q == 'ema') {
    $pc = $_GET['pc'];
    $vi = $_GET['vi'];
    $bb = $_GET['bb'];
    $dn = $_GET['dn'];
    $sc = $_GET['sc'];
    $query = '';
    $emails = '';

    for ($i = 0; $i < 2; $i++) {
        if ($i == 0) {
            $query = <<<MYSQL
SELECT e.email_address, a.post_code, c.visibility, c.bread_participating, c.denomination
FROM church AS c, email AS e, address AS a
WHERE c.__pk_id = e._fk_church AND a._fk_church = c.__pk_id;
MYSQL;
        } else if ($i == 1 && $sc == 'everyone') {
            $query = <<<MYSQL
SELECT e.email_address, a.post_code, c.visibility, c.bread_participating, c.denomination 
FROM church AS c, email AS e, address AS a, person AS p, role AS r 
WHERE a._fk_church = c.__pk_id AND c.__pk_id = r._fk_church AND r._fk_person = p.__pk_id AND p.__pk_id = e._fk_person;
MYSQL;
        } else continue;

        $stmt = $mysqli->prepare($query);
        $stmt->execute();
        $stmt->bind_result($_ea, $_pc, $_vi, $_bb, $_dn);

        while ($stmt->fetch()) {
            if ($pc != '' && strpos($pc, $_pc) === false)
                continue;
            if ($dn != 'any' && strpos($dn, $_dn) === false)
                continue;
            if ($vi != 'any' && $vi != $_vi)
                continue;
            if ($bb != 'any' && $bb != $_bb)
                continue;
            if (strpos($emails, $_ea) !== false)
                continue;

            if ($emails == '') {
                $emails .= $_ea;
            } else {
                $emails .= '; ' . $_ea;
            }
        }
    }

    if ($emails == '') $emails = '-';
    $emails = urlencode($emails);
    echo json_encode(['emails' => $emails]);
}