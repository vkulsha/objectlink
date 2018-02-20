<?php
require('DB.php');
require('ObjectLink.php');
require('SQL.php');
header('Content-Type: text/html; charset=utf-8');

$dbType = "mysql";
$conn = new DB($dbType, "localhost", "objectlink", "root", "Rekmif1983",0);
$db = $conn->db;
$sql = new SQL($db);
$objectlink = new ObjectLink($sql, "object", "link", $dbType);