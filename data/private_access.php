<?php
header("Content-Type: application/json; charset=UTF-8");

require "../../pw_check.php";
require "../../db_access.php";

function throwError()
{
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

    if ($ent == 'church' && !in_array($col, ['__pk_id', 'name', 'denomination']))
        $col = '__pk_id';

    if ($ent == 'person' && !in_array($col, ['__pk_id', 'first_name', 'last_name']))
        $col = '__pk_id';

    if ($ent == 'church')
        $query = "SELECT __pk_id,name,denomination FROM church ORDER BY {$col} {$dir}, __pk_id ASC LIMIT ? OFFSET ?;";
    if ($ent == 'person')
        $query = "SELECT __pk_id,first_name,last_name FROM person ORDER BY {$col} {$dir}, __pk_id ASC LIMIT ? OFFSET ?;";
    $stmt = $mysqli->prepare($query);
    $stmt->bind_param("ii", $lim, $off);
    $stmt->execute();
    $stmt->bind_result($id, $var_1, $var_2);

    $table = "";
    if ($off == 0 && $ent == 'church')
        $table = "<table class='w3-table w3-striped w3-hoverable'>"
            . "<thead><tr class='w3-theme-l1'><th>id</th><th>name</th><th>denomination</th></tr></thead>";
    if ($off == 0 && $ent == 'person')
        $table = "<table class='w3-table w3-striped w3-hoverable'>"
            . "<thead><tr class='w3-theme-l1'><th>id</th><th>first name</th><th>last name</th></tr></thead>";
    while ($stmt->fetch())
        $table .= "<tr><th>{$id}</th><th>{$var_1}</th><th>{$var_2}</th></tr>";
    if ($off == 0) $table .= "</table>";

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

if ($q == 'fetch_info') {
    $cid = $_GET['id'];
    $ent = $_GET['ent'];
    $query = '';

    if ($ent == 'church') {
        $query = "SELECT __pk_id,name,denomination,visibility,note,bread_participating,bread_time,bread_note,"
            . "bread_add_line_1,bread_add_line_2,bread_add_suburb,bread_add_state,bread_add_post_code"
            . " FROM church WHERE __pk_id = ?;";
        $stmt = $mysqli->prepare($query);
        $stmt->bind_param("i", $cid);
        $stmt->execute();
        $stmt->bind_result($id, $name, $denomination, $visibility, $note, $bp, $bt, $bn, $bl1, $bl2, $bsu, $bst, $bpc);
        $stmt->fetch();
        $info_1 = [$id, $name, $denomination, $visibility, $note, $bp, $bt, $bn, $bl1, $bl2, $bsu, $bst, $bpc];
        $stmt->close();
    }
    if ($ent == 'person') {
        $query = "SELECT __pk_id,first_name,last_name,note FROM person WHERE __pk_id = ?;";
        $stmt = $mysqli->prepare($query);
        $stmt->bind_param("i", $cid);
        $stmt->execute();
        $stmt->bind_result($id, $fname, $lname, $note);
        $stmt->fetch();
        $info_1 = [$id, $fname, $lname, $note];
        $stmt->close();
    }

    if ($ent == 'church')
        $query = "SELECT pe.__pk_id,pe.first_name,pe.last_name,ro.type FROM person AS pe,role AS ro "
            . "WHERE ro._fk_church = ? AND ro._fk_person=pe.__pk_id ORDER BY pe.__pk_id ASC; ";
    if ($ent == 'person')
        $query = "SELECT ch.__pk_id,ch.name,ch.denomination,ro.type FROM church AS ch,role AS ro "
            . "WHERE ro._fk_person = ? AND ro._fk_church=ch.__pk_id ORDER BY ch.__pk_id ASC;";
    $stmt = $mysqli->prepare($query);
    $stmt->bind_param("i", $cid);
    $stmt->execute();
    $stmt->bind_result($id, $first, $last, $type);
    $info_2 = array();
    while ($stmt->fetch())
        $info_2[] = [$id, $first, $last, $type];
    $stmt->close();

    function basicSelect($par_mysqli, $par_table, $par_cols, $par_cid, $par_fk)
    {
        $query = "SELECT __pk_id,{$par_cols} FROM {$par_table} WHERE {$par_fk} = ? ORDER BY __pk_id ASC;";
        $par_stmt = $par_mysqli->prepare($query);
        $par_stmt->bind_param("i", $par_cid);
        $par_stmt->execute();
        $par_1 = '';
        $par_2 = '';
        $par_3 = '';
        $par_stmt->bind_result($par_1, $par_2, $par_3);
        $par_info = array();
        while ($par_stmt->fetch())
            $par_info[] = [$par_1, $par_2, $par_3];
        $par_stmt->close();

        return $par_info;
    }

    $fk = '';
    if ($ent == 'church') $fk = '_fk_church';
    if ($ent == 'person') $fk = '_fk_person';
    $ph_info = basicSelect($mysqli, "phone", "phone_number,type", $cid, $fk);
    $em_info = basicSelect($mysqli, "email", "email_address,type", $cid, $fk);
    $we_info = basicSelect($mysqli, "website", "url,type", $cid, $fk);

    if ($ent == 'church')
        $query = "SELECT __pk_id,line_1,line_2,suburb,state,post_code,type FROM address "
            . "WHERE _fk_church = ? ORDER BY __pk_id ASC;";
    if ($ent == 'person')
        $query = "SELECT __pk_id,line_1,line_2,suburb,state,post_code,type FROM address "
            . "WHERE _fk_person = ? ORDER BY __pk_id ASC;";
    $stmt = $mysqli->prepare($query);
    $stmt->bind_param("i", $cid);
    $stmt->execute();
    $stmt->bind_result($id, $line_1, $line_2, $suburb, $state, $post_code, $type);
    $ad_info = array();
    while ($stmt->fetch())
        $ad_info[] = [$id, $line_1, $line_2, $suburb, $state, $post_code, $type];
    $stmt->close();

    echo urlencode(json_encode(['q' => $q, 'info_1' => $info_1, 'info_2' => $info_2, 'ph_info' => $ph_info,
        'em_info' => $em_info, 'we_info' => $we_info, 'ad_info' => $ad_info]));
}

if ($q == 'put_info') {

    $ent = $_POST["ent"];
    $type = $_POST["type"];
    $con = explode(',', $_POST["con"]);
    $id = $_POST["id"];
    $success = false;

    $fk = '';
    if ($ent == "church")
        $fk = "_fk_church";
    else if ($ent == "person")
        $fk = "_fk_person";
    else throwError();

    function basicInsert($par_mysqli, $par_cols, $par_table, $par_id, $par_con)
    {
        $query = "INSERT INTO {$par_table} ({$par_cols}) VALUES (?,?,?)";
        $stmt = $par_mysqli->prepare($query);
        $stmt->bind_param("iss", $par_id, $par_con[0], $par_con[1]);
        $par_success = $stmt->execute();
        $stmt->close();

        return $par_success;
    }

    if (in_array($type, ['phone', 'email', 'website'])) {
        $cols = '';
        if ($type == 'phone') $cols = "{$fk},phone_number,type";
        if ($type == 'email') $cols = "{$fk},email_address,type";
        if ($type == 'website') $cols = "{$fk},url,type";
        $success = basicInsert($mysqli, $cols, $type, $id, $con);
    }

    if ($type == 'address') {
        $query = "INSERT INTO address ({$fk},line_1,line_2,suburb,state,post_code,type) VALUES (?,?,?,?,?,?,?)";
        $stmt = $mysqli->prepare($query);
        $stmt->bind_param("issssss", $id, $con[0], $con[1], $con[2], $con[3], $con[4], $con[5]);
        $success = $stmt->execute();
        $stmt->close();
    }

    if ($type == 'role') {
        $query = '';
        if ($ent == 'church') $query = 'INSERT INTO role (_fk_church,_fk_person,type) VALUES (?,?,?)';
        if ($ent == 'person') $query = 'INSERT INTO role (_fk_person,_fk_church,type) VALUES (?,?,?)';
        $stmt = $mysqli->prepare($query);
        $stmt->bind_param("iis", $id, $con[0], $con[1]);
        $success = $stmt->execute();
        $stmt->close();
    }

    if ($type == 'church') {
        $query = 'UPDATE church SET name=?,denomination=?,visibility=?,note=? WHERE __pk_id=?';
        $stmt = $mysqli->prepare($query);
        $stmt->bind_param("ssssi", $con[0], $con[1], $con[2], $con[3], $id);
        $success = $stmt->execute();
        $stmt->close();
    }

    if ($type == 'person') {
        $query = 'UPDATE person SET first_name=?,last_name=?,note=? WHERE __pk_id=?';
        $stmt = $mysqli->prepare($query);
        $stmt->bind_param("sssi", $con[0], $con[1], $con[2], $id);
        $success = $stmt->execute();
        $stmt->close();
    }

    if ($type == 'bread') {
        $query = 'UPDATE church SET bread_participating=?,bread_time=?,bread_add_line_1=?,bread_add_line_2=?,'
            . 'bread_add_suburb=?,bread_add_state=?,bread_add_post_code=?,bread_note=? WHERE __pk_id=?';
        $stmt = $mysqli->prepare($query);
        $stmt->bind_param("ssssssssi", $con[0], $con[1], $con[2], $con[3], $con[4], $con[5], $con[6], $con[7], $id);
        $success = $stmt->execute();
        $stmt->close();
    }

    echo json_encode(['q' => $q, 'success' => $success]);
}

if ($q == 'del_info') {
    $type = $_GET["type"];
    $id = $_GET["id"];
    $cid = $_GET["cid"];
    $success = false;

    function basicDelete($par_mysqli, $par_table, $par_id)
    {
        $query = "DELETE FROM {$par_table} WHERE __pk_id =?";
        $stmt = $par_mysqli->prepare($query);
        $stmt->bind_param("i", $par_id);
        $par_success = $stmt->execute();
        $stmt->close();

        return $par_success;
    }

    if (in_array($type, ['phone', 'email', 'website', 'address'])) {
        $success = basicDelete($mysqli, $type, $id);
    }

    if ($type == 'role') {
        $query = "DELETE FROM role WHERE _fk_person = ? AND _fk_church = ?";
        $stmt = $mysqli->prepare($query);
        $stmt->bind_param("ii", $id, $cid);
        $success = $stmt->execute();
        $stmt->close();
    }

    echo json_encode(['q' => $q, 'success' => $success]);
}

if ($q == 'create_new') {
    $ent = $_POST["ent"];
    $con = explode(',', $_POST["con"]);
    $query = '';
    $success = false;

    if ($ent == 'church') $query = "INSERT INTO church (name,denomination) VALUES (?,?)";
    if ($ent == 'person') $query = "INSERT INTO person (first_name,last_name) VALUES (?,?)";
    $stmt = $mysqli->prepare($query);
    $stmt->bind_param("ss", $con[0], $con[1]);
    $success = $stmt->execute();
    $stmt->close();

    if ($ent == 'church') $query = "SELECT MAX(__pk_id) FROM church;";
    if ($ent == 'person') $query = "SELECT MAX(__pk_id) FROM person;";
    $stmt = $mysqli->prepare($query);
    $stmt->bind_param("ss", $con[0], $con[1]);
    $stmt->execute();
    $stmt->bind_result($id);
    $stmt->fetch();
    $stmt->close();

    echo json_encode(['q' => $q, 'success' => $success, 'id' => $id]);
}

exit();