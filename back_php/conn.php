<?php
require('DB.php');
require('ObjectLink.php');
require('SQL.php');
header('Content-Type: text/html; charset=utf-8');

function getDbPrefix($arr, $host){
	return isset($arr[$host]) ? $arr[$host] : "";
	
};

$arr = array(
	"explguov.ru" => "ih162624_",
	"185.117.155.80" => "",
	"localhost" => ""
);

$host = $_SERVER['SERVER_NAME'];
$prefix = getDbPrefix($arr, $host);
$dbType = ($host == "kulsha.ru") ? "pgsql" : "mysql";
$conn = new DB($dbType, "localhost",$prefix."absoluteobjectlink",$prefix."root","Rekmif1983",0);;
$db = $conn->db;
//$explDbType = $explDb->getAttribute(PDO::ATTR_DRIVER_NAME);
$sql = new SQL($db);
$objectlink = new ObjectLink($sql, "object", "link", $dbType);