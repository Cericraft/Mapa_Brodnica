<?php
 session_start();
 $host = 'localhost';
 $dbname = 'mapa_zabytkow';
 $user = 'root';
 $pass = '';
 
 try {
     $pdo = new PDO("mysql:host=$host;dbname=$dbname", $user, $pass, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
 } catch (PDOException $e) {
     die("Błąd połączenia: " . $e->getMessage());
 }
 ?>