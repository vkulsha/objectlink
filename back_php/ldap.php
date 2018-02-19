<?php
	error_reporting(E_ERROR);//error_reporting(E_ERROR | E_WARNING | E_PARSE | E_NOTICE);
	header('Content-Type: text/html; charset=utf-8');
	$username = $_GET['p1'];
    $login = $_GET['p1']."@".$_GET['p3'];
    $password = $_GET['p2'];
    //подсоединяемся к LDAP серверу
    $ldap = ldap_connect($_GET['p3']) or die(0);
    //Включаем LDAP протокол версии 3
    ldap_set_option($ldap, LDAP_OPT_PROTOCOL_VERSION, 3);
 
    if ($ldap) {
        // Пытаемся войти в LDAP при помощи введенных логина и пароля
		$bind = ldap_bind($ldap,$login,$password);
 
        if ($bind) {
			echo 1;
			
        } else {
			echo 0;
        }
		ldap_close($ldap);
    }

?>