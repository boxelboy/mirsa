<?php
use Symfony\Component\HttpFoundation\Request;

// Default PHP configuration (for Synergize on OSX)
date_default_timezone_set('UTC');

// Initialize Symfony
$loader = require_once __DIR__.'/../app/bootstrap.php.cache';
require_once __DIR__.'/../app/AppKernel.php';

$kernel = new AppKernel('prod', true);
$kernel->loadClassCache();

Request::enableHttpMethodParameterOverride();
$request = Request::createFromGlobals();
Request::setTrustedProxies(array($request->server->get('REMOTE_ADDR')));

$response = $kernel->handle($request);
$response->send();

$kernel->terminate($request, $response);
