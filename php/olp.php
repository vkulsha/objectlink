<?php
	require('conn.php');
	header('Content-Type: text/html; charset=utf-8');
	header('Access-Control-Allow-Origin: *');

	set_error_handler("warning_handler", E_WARNING);

	function warning_handler($errno, $errstr) {
		throw new ErrorException();
	}
	
	try {
		if (isset($_GET['f'])) {
			$f = $_GET['f'];
			$p = isset($_GET['p']) ? $_GET['p'] : 0;
			$u = isset($_GET['u']) ? $_GET['u'] : 0;
		} else if (isset($_POST['f'])) {
			$f = $_POST['f'];
			$p = isset($_POST['p']) ? $_POST['p'] : 0;
			$u = isset($_POST['u']) ? $_POST['u'] : 0;
		};
		$func = array($objectlink, $f);
		$ret = $func(json_decode($p));
		echo json_encode($ret, JSON_UNESCAPED_UNICODE);

	} catch (Exception $e) {
		echo json_encode(null, JSON_UNESCAPED_UNICODE);
		
	}
?>