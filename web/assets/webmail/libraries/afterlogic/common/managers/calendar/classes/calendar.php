<?php

/*
 * Copyright (C) 2002-2013 AfterLogic Corp. (www.afterlogic.com)
 * Distributed under the terms of the license described in LICENSE
 *
 */

/**
 * @package Calendar
 * @subpackage Classes
 */
class CCalendar
{
	public $Id;
	public $Url;
	public $IsDefault;
	public $DisplayName;
	public $CTag;
	public $ETag;
	public $Description;
	public $Color;
	public $Order;
	public $Shared;
	public $Owner;
	public $Principals;
	public $Access;
	public $Shares;
	public $IsPublic;
	public $PubHash;
	public $RealUrl;

	function __construct($sId, $sDisplayName = null, $sCTag = null, $sETag = null, $sDescription = null,
			$sColor = null, $sOrder = null)
	{
		$this->Id = rtrim(urldecode($sId), '/');
		$this->IsDefault = (basename($sId) === \afterlogic\DAV\Constants::ADDRESSBOOK_DEFAULT_NAME);
		$this->DisplayName = $sDisplayName;
		$this->CTag = $sCTag;
		$this->ETag = $sETag;
		$this->Description = $sDescription;
		$this->Color = $sColor;
		$this->Order = $sOrder;
		$this->Shared = false;
		$this->Owner = '';
		$this->Principals = array();
		$this->Access = ECalendarPermission::Write;
		$this->Shares = array();
		$this->IsPublic = false;
		$this->PubHash = null;
	}
	
	public function GetMainPrincipalUrl()
	{
		$sResult = '';
		if (is_array($this->Principals) && count($this->Principals) > 0)
		{
			$sResult = str_replace('/calendar-proxy-read', '', rtrim($this->Principals[0], '/'));
			$sResult = str_replace('/calendar-proxy-write', '', $sResult);
//			$sResult = rtrim($sResult, "/user");
		}
		return $sResult;
	}
	
}