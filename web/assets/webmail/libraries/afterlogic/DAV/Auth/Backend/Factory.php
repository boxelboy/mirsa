<?php

namespace afterlogic\DAV\Auth\Backend;

use afterlogic\DAV\Server;

class Factory
{
	public static function getBackend($dBPrefix = '')
	{
		$oBackend = null;
		if (\afterlogic\DAV\Constants::DAV_DIGEST_AUTH)	
		{
			$oBackend = new Digest($dBPrefix);
		}
		else
		{
			$oBackend = new Basic($dBPrefix);
		}
		return $oBackend;
	}
}