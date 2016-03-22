<?php

/*
 * Copyright (C) 2002-2013 AfterLogic Corp. (www.afterlogic.com)
 * Distributed under the terms of the license described in LICENSE
 *
 */

/**
 * @package Calendar
 */
class CApiCalendarSabredavStorage extends CApiCalendarStorage
{
	/**
	 * @var array
	 */
	public $Principal;

	/*
	 * @var CAccount
	 */
	public $Account;

	/*
	 * @var array
	 */
	protected $CacheUserCalendars;

	/*
	 * @var array
	 */
	protected $CacheSharedCalendars;

	/**
	 * @var \afterlogic\DAV\Server
	 */
	protected $Server;

	/**
	 * @param CApiGlobalManager $oManager
	 */
	public function __construct(CApiGlobalManager &$oManager)
	{
		parent::__construct('sabredav', $oManager);

		$this->Account = null;
		$this->Server = new \afterlogic\DAV\Server();
		$this->Principal = array();

		$this->CacheUserCalendars = array();
		$this->CacheSharedCalendars = array();
	}

	/**
	 * @param CAccount $oAccount
	 */
	public function Init($oAccount)
	{
		if ($oAccount != null && $this->Account == null || $this->Account->Email != $oAccount->Email)
		{
			$this->Server->getPlugin('auth')->setCurrentAccount($oAccount);
			\afterlogic\DAV\Auth\Backend\Helper::CheckPrincipals($oAccount->Email);

			$this->Account = $oAccount;

			$oPrincipals = $this->Server->tree->getNodeForPath('principals');
			if ($oPrincipals->childExists($oAccount->Email))
			{
				$oPrincipal = $oPrincipals->getChild($oAccount->Email);
				if (isset($oPrincipal))
				{
					$this->Principal = $oPrincipal->getProperties(array('uri', 'id'));
				}
			}
		}
	}

	public function GetCalendarAccess($oAccount, $sCalendarId)
	{
		$mResult = ECalendarPermission::Read;
		$oCalendar = $this->GetCalendar($oAccount, $sCalendarId);
		if ($oCalendar)
		{
			if ($oCalendar->Shared)
			{
				$mResult = $oCalendar->Access;
			}
			else
			{
				$mResult = ECalendarPermission::Full;
			}

		}
		return $mResult;
	}

    /**
     * Returns a single calendar, by name
     *
     * @param string $sCalendarId
     * @return \Sabre\CalDAV\Calendar
     */	
	protected function GetServerCalendar($sCalendarId)
	{
		$oCalendar = false;
		$bDelegated = false;

		$sCalendarId = basename($sCalendarId);
		if (is_numeric($sCalendarId))
		{
			$sCalendarId = (int)$sCalendarId;
			$bDelegated = true;
		}

		$oCalendars = null;
		if (!$bDelegated)
		{
			$oCalendars = new \Sabre\CalDAV\UserCalendars($this->Server->GetCaldavBackend(), $this->Principal);
		}
		else
		{
			$oCalendars = new \afterlogic\DAV\Delegates\DelegatedCalendars($this->Server->GetPrincipalBackend(),
					$this->Server->GetCaldavBackend(), $this->Server->GetDelegatesBackend(), $this->Principal);
		}
		if (isset($oCalendars) && $oCalendars->childExists($sCalendarId))
		{
			$oCalendar = $oCalendars->getChild($sCalendarId);
		}
		return $oCalendar;
	}

    /**
     * @param \Sabre\CalDAV\Calendar $oServerCalendar
     * @return \CCalendar
     */	
	public function GetCalendarObject($oServerCalendar)
	{
		if (!($oServerCalendar instanceof \Sabre\CalDAV\Calendar))
		{
			return false;
		}
		$aProps = $oServerCalendar->getProperties(array(
			'id',
			'uri',
			'principaluri',
			'{DAV:}displayname',
			'{'.\Sabre\CalDAV\Plugin::NS_CALENDARSERVER.'}getctag',
			'{'.\Sabre\CalDAV\Plugin::NS_CALDAV.'}calendar-description',
			'{http://apple.com/ns/ical/}calendar-color',
			'{http://apple.com/ns/ical/}calendar-order'
		));

		$sCalendaId = '';
		if ($oServerCalendar instanceof \afterlogic\DAV\Delegates\Calendar)
		{
			$sCalendaId = $aProps['id'];
		}
		else if ($oServerCalendar instanceof \Sabre\CalDAV\Calendar)
		{
			$sCalendaId = $aProps['uri'];
		}
		$oCalendar = new CCalendar($sCalendaId);

		if ($oServerCalendar instanceof \afterlogic\DAV\Delegates\Calendar)
		{
			$oCalendar->Shared = true;
			$oCalendar->Access = (int)$oServerCalendar->GetMode();
		}

		if (isset($aProps['{DAV:}displayname']))
		{
			$oCalendar->DisplayName = $aProps['{DAV:}displayname'];
		}
		if (isset($aProps['{'.\Sabre\CalDAV\Plugin::NS_CALENDARSERVER.'}getctag']))
		{
			$oCalendar->CTag = $aProps['{'.\Sabre\CalDAV\Plugin::NS_CALENDARSERVER.'}getctag'];
		}
		if (isset($aProps['{'.\Sabre\CalDAV\Plugin::NS_CALDAV.'}calendar-description']))
		{
			$oCalendar->Description = $aProps['{'.\Sabre\CalDAV\Plugin::NS_CALDAV.'}calendar-description'];
		}
		if (isset($aProps['{http://apple.com/ns/ical/}calendar-color']))
		{
			$oCalendar->Color = $aProps['{http://apple.com/ns/ical/}calendar-color'];
		}
		if (isset($aProps['{http://apple.com/ns/ical/}calendar-order']))
		{
			$oCalendar->Order = $aProps['{http://apple.com/ns/ical/}calendar-order'];
		}
		$oCalendar->Principals = array($aProps['principaluri']);

		$sPrincipal = $oCalendar->GetMainPrincipalUrl();
		$sEmail = basename(urldecode($sPrincipal));

		if(strcasecmp($sEmail, $this->Account->Email) === 0)
		{
			$oCalendar->Shared = false;
			$oCalendar->Url = '/calendars/'.$this->Account->Email.'/'.$oCalendar->Id;
			$oCalendar->Owner = $this->Account->Email;
		}
		else
		{
			$oCalendar->Shared = true;
			$oCalendar->Url = '/delegation/'.$oCalendar->Id.'/calendar';
			$oCalendar->Owner = (!empty($sEmail)) ? $sEmail : $this->Account->Email;
		}
		
		$oCalendar->RealUrl = 'calendars/'.$oCalendar->Owner.'/'.$aProps['uri'];

		return $oCalendar;
	}

	/**
	 * @param CAccount $oAccount
	 * @param string $sCalendarId
	 */
	public function GetCalendar($oAccount, $sCalendarId)
	{
		$this->Init($oAccount);

		$oServerCalendar = null;
		$oCalendar = false;
		if (count($this->CacheUserCalendars) > 0 && isset($this->CacheUserCalendars[$sCalendarId]))
		{
			$oCalendar = $this->CacheUserCalendars[$sCalendarId];
		}
		else if (count($this->CacheSharedCalendars) > 0 && isset($this->CacheSharedCalendars[$sCalendarId]))
		{
			$oCalendar = $this->CacheSharedCalendars[$sCalendarId];
		}
		else
		{
			$oServerCalendar = $this->GetServerCalendar($sCalendarId);
			if ($oServerCalendar)
			{
				$oCalendar = $this->GetCalendarObject($oServerCalendar);
			}
		}
		return $oCalendar;
	}

	public function GetPublicUser()
	{
		return $this->Server->GetPrincipalBackend()->getOrCreatePublicPrincipal();
	}

	/*
	 * @param string $sCalendarId
	 */
	public function GetPublicCalendarHash($oAccount, $sCalendarId)
	{
		$mResult = false;
		$this->Init($oAccount);

		$iCalendarId = $this->Server->GetDelegatesBackend()->getCalendarForUser($oAccount->Email, $sCalendarId);
		if ($iCalendarId !== false)
		{
			$mResult = \CApi::EncodeKeyValues(array(
				'Id' => $iCalendarId
			));
		}
		return $mResult;
	}

	/**
	 * @param CAccount $oAccount
	 */
	public function GetCalendars($oAccount)
	{
		$this->Init($oAccount);

		$aCalendars = array();
		if (count($this->CacheUserCalendars) > 0)
		{
			$aCalendars = $this->CacheUserCalendars;
		}
		else
		{
			$oCalendars = new \Sabre\CalDAV\UserCalendars($this->Server->GetCaldavBackend(), $this->Principal);

			foreach ($oCalendars->getChildren() as $oServerCalendar)
			{
				$oCalendar = $this->GetCalendarObject($oServerCalendar);
				if ($oCalendar)
				{
					$aCalendars[$oCalendar->Id] = $oCalendar;
				}
			}

			$this->CacheUserCalendars = $aCalendars;
		}
 		return $aCalendars;
	}

	/**
	 * @param CAccount $oAccount
	 */
	public function GetCalendarsShared($oAccount)
	{
		$this->Init($oAccount);

		$aCalendars = array();
		if (count($this->CacheSharedCalendars) > 0)
		{
			$aCalendars = $this->CacheSharedCalendars;
		}
		else
		{
			$oCalendars = new \afterlogic\DAV\Delegates\DelegatedCalendars($this->Server->GetPrincipalBackend(),
					$this->Server->GetCaldavBackend(), $this->Server->GetDelegatesBackend(), $this->Principal);

			foreach ($oCalendars->getChildren() as $oServerCalendar)
			{
				$oCalendar = $this->GetCalendarObject($oServerCalendar);
				if($oCalendar)
				{
					$aCalendars[$oCalendar->Id] = $oCalendar;
				}
			}
			$this->CacheSharedCalendars = $aCalendars;
		}

		return $aCalendars;
	}

	/**
	 * @param CAccount $oAccount
	 * @param string $sName
	 * @param string $sDescription
	 * @param int $iOrder
	 * @param string $sColor
	 */
	public function CreateCalendar($oAccount, $sName, $sDescription, $iOrder, $sColor)
	{
		$this->Init($oAccount);

		$oCalendars = new \Sabre\CalDAV\UserCalendars($this->Server->GetCaldavBackend(), $this->Principal);

		$sSystemName = \Sabre\DAV\UUIDUtil::getUUID();
		$oCalendars->createExtendedCollection($sSystemName, 
				array(
					'{DAV:}collection',
					'{urn:ietf:params:xml:ns:caldav}calendar'
				), 
				array(
					'{DAV:}displayname' => $sName,
					'{'.\Sabre\CalDAV\Plugin::NS_CALENDARSERVER.'}getctag' => 1,
					'{'.\Sabre\CalDAV\Plugin::NS_CALDAV.'}calendar-description' => $sDescription,
					'{http://apple.com/ns/ical/}calendar-color' => $sColor,
					'{http://apple.com/ns/ical/}calendar-order' => $iOrder
				)
		);
		return $sSystemName;
	}

	/**
	 * @param CAccount $oAccount
	 * @param string $sCalendarId
	 * @param string $sName
	 * @param string $sDescription
	 * @param int $iOrder
	 * @param string $sColor
	 */
	public function UpdateCalendar($oAccount, $sCalendarId, $sName, $sDescription, $iOrder, $sColor)
	{
		$this->Init($oAccount);

		$oCalendars = new \Sabre\CalDAV\UserCalendars($this->Server->GetCaldavBackend(), $this->Principal);
		if ($oCalendars->childExists($sCalendarId))
		{
			$oCalendar = $oCalendars->getChild($sCalendarId);
			if ($oCalendar)
			{
				$oCalendar->updateProperties(array(
					'{DAV:}displayname' => $sName,
					'{'.\Sabre\CalDAV\Plugin::NS_CALDAV.'}calendar-description' => $sDescription,
					'{http://apple.com/ns/ical/}calendar-color' => $sColor,
					'{http://apple.com/ns/ical/}calendar-order' => $iOrder
				));
				return true;
			}
		}
		return false;
	}

	/**
	 * @param CAccount $oAccount
	 * @param string $sCalendarId
	 * @param string $sColor
	 */
	public function UpdateCalendarColor($oAccount, $sCalendarId, $sColor)
	{
		$this->Init($oAccount);

		$oCalendars = new \Sabre\CalDAV\UserCalendars($this->Server->GetCaldavBackend(), $this->Principal);
		if ($oCalendars->childExists($sCalendarId))
		{
			$oCalendar = $oCalendars->getChild($sCalendarId);
			if ($oCalendar)
			{
				$oCalendar->updateProperties(array(
					'{http://apple.com/ns/ical/}calendar-color' => $sColor,
				));
				return true;
			}
		}
		return false;
	}

	/**
	 * @param string $sCalendarId
	 * @param int $iVisible
	 */
	public function UpdateCalendarVisible($sCalendarId, $iVisible)
	{
		@setcookie($sCalendarId, $iVisible, time() + 86400);
	}

	/**
	 * @param CAccount $oAccount
	 * @param string $sCalendarId
	 */
	public function DeleteCalendar($oAccount, $sCalendarId)
	{
		$this->Init($oAccount);

		$oCalendars = new \Sabre\CalDAV\UserCalendars($this->Server->GetCaldavBackend(), $this->Principal);
		if ($oCalendars->childExists($sCalendarId))
		{
			$oCalendar = $oCalendars->getChild($sCalendarId);
			if ($oCalendar)
			{
				$oCalendar->delete();

				$this->DeleteReminderByCalendar($sCalendarId);

				return true;
			}
		}
		return false;
	}

	/**
	 * @param CAccount $oAccount
	 * @return bool
	 */
	public function ClearAllCalendars($oAccount)
	{
		$this->Init($oAccount);

		$oCalendars = new \Sabre\CalDAV\UserCalendars($this->Server->GetCaldavBackend(), $this->Principal);
		foreach ($oCalendars->getChildren() as $oCalendar)
		{
			if ($oCalendar instanceof \Sabre\CalDAV\Calendar)
			{
				$oCalendar->delete();
			}
		}
//		$this->Server->GetCacheBackend()->deleteRemindersCacheByUser($oAccount->Email);
		$this->Server->GetDelegatesBackend()->DeleteAllUsersShares($oAccount->Email);
	}

	/**
	 * @param CAccount $oAccount
	 * @param string $sCalendarId
	 *
	 * @return bool
	 */
	public function UnsubscribeCalendar($oAccount, $sCalendarId)
	{
		$this->Init($oAccount);

		$oCalendar = $this->GetCalendar($oAccount, $sCalendarId);

		if ($oCalendar)
		{
			if (count($oCalendar->Principals) > 0)
			{
				$this->Server->GetDelegatesBackend()->UnsubscribeCalendar($sCalendarId, $oAccount->Email);
			}
		}

		return true;
	}

	/**
	 * @param CAccount $oAccount
	 * @param string $sCalendarId
	 * @param string $sUserId
	 * @param int $iPerm
	 *
	 * @return bool
	 */
	public function UpdateCalendarShare($oAccount, $sCalendarId, $sUserId, $iPerms = ECalendarPermission::RemovePermission)
	{
		$this->Init($oAccount);

		$oCalendar = $this->GetCalendar($oAccount, $sCalendarId);

		if ($oCalendar)
		{
			if (count($oCalendar->Principals) > 0)
			{
				$this->Server->GetDelegatesBackend()->UpdateShare($sCalendarId, $oAccount->Email, $sUserId, $iPerms);
			}
		}

		return true;
	}

	/**
	 * @param CAccount $oAccount
	 * @param string $sCalendarId
	 * @param string $sUserId
	 * @param int $iPerm
	 *
	 * @return bool
	 */
	public function DeleteCalendarShares($oAccount, $sCalendarId)
	{
		$this->Init($oAccount);

		$oCalendar = $this->GetCalendar($oAccount, $sCalendarId);

		if ($oCalendar)
		{
			if (count($oCalendar->Principals) > 0)
			{
				$this->Server->GetDelegatesBackend()->DeleteShares($sCalendarId, $oAccount->Email);
			}
		}

		return true;
	}
	
	/**
	 * @param CAccount $oAccount
	 * @param string $sCalendarId
	 */
	public function PublicCalendar($oAccount, $sCalendarId)
	{
		return $this->UpdateCalendarShare($oAccount, $sCalendarId, $this->GetPublicUser(), ECalendarPermission::Read);
	}

	/**
	 * @param CAccount $oAccount
	 * @param string $sCalendarId
	 */
	public function UnPublicCalendar($oAccount, $sCalendarId)
	{
		return $this->UpdateCalendarShare($oAccount, $sCalendarId, $this->GetPublicUser());
	}

	/**
	 * @param CAccount $oAccount
	 * @param string $oCalendar
	 * @return array
	 */
	public function GetCalendarUsers($oAccount, $oCalendar)
	{
		$aResult = array();
		$this->Init($oAccount);

		if ($oCalendar != null)
		{
			if (count($oCalendar->Principals) > 0)
			{
				$sPrincipalUri = $oCalendar->GetMainPrincipalUrl();
				$sCalendarId = basename($oCalendar->Id);

				$oRes = $this->Server->GetDelegatesBackend()->getCalendarUsers($sPrincipalUri, $sCalendarId) ;

				foreach($oRes as $aRow)
				{
					$aResult[] = array(
						'name' => basename($aRow['uri']),
						'email' => basename($aRow['uri']),
						'access' => $aRow['mode']
					);
				}
			}
		}
		return $aResult;
	}

	/**
	 * @param CAccount $oAccount
	 * @param string $sCalendarId
	 * @return string | bool
	 */
	public function ExportCalendarToIcs($oAccount, $sCalendarId)
	{
		$this->Init($oAccount);

		$mResult = false;
		$oCalendar = $this->GetServerCalendar($sCalendarId);
		if ($oCalendar)
		{
			$aCollectedTimezones = array();

			$aTimezones = array();
			$aObjects = array();

			foreach ($oCalendar->getChildren() as $oChild)
			{
				$oNodeComp = \Sabre\VObject\Reader::read($oChild->get());
				foreach($oNodeComp->children() as $oNodeChild)
				{
					switch($oNodeChild->name)
					{
						case 'VEVENT' :
						case 'VTODO' :
						case 'VJOURNAL' :
							$aObjects[] = $oNodeChild;
							break;

						// VTIMEZONE is special, because we need to filter out the duplicates
						case 'VTIMEZONE' :
							// Naively just checking tzid.
							if (in_array((string)$oNodeChild->TZID, $aCollectedTimezones))
							{
								continue;
							}

							$aTimezones[] = $oNodeChild;
							$aCollectedTimezones[] = (string)$oNodeChild->TZID;
							break;

					}
				}
			}

			$oVCal = new \Sabre\VObject\Component\VCalendar();
			foreach($aTimezones as $oTimezone)
			{
				$oVCal->add($oTimezone);
			}
			foreach($aObjects as $oObject)
			{
				$oVCal->add($oObject);
			}

			$mResult = $oVCal->serialize();
		}

		return $mResult;
	}

	/**
	 * @param CAccount $oAccount
	 * @param string $oCalendar
	 * @param string $sEventId
	 */
	public function GetServerEvent($oAccount, $oCalendar, $sEventId)
	{
		$this->Init($oAccount);

		if ($oCalendar)
		{
			if ($oCalendar->childExists($sEventId . '.ics'))
			{
				$oChild = $oCalendar->getChild($sEventId . '.ics');
				if ($oChild instanceof \Sabre\CalDAV\CalendarObject)
				{
					return $oChild;
				}
			}
			else
			{
				foreach ($oCalendar->getChildren() as $oChild)
				{
					if ($oChild instanceof \Sabre\CalDAV\CalendarObject)
					{
						$oVCal = \Sabre\VObject\Reader::read($oChild->get());
						if ($oVCal && $oVCal->VEVENT)
						{
							foreach ($oVCal->VEVENT as $oVEvent)
							{
								foreach($oVEvent->select('UID') as $oUid)
								{
									if ((string)$oUid === $sEventId)
									{
										return $oChild;
									}
								}
							}
						}
					}
				}
			}
		}
		return false;
	}
	

	/**
	 * @param CAccount $oAccount
	 * @param object $oCalendar
	 * @param string $dStart
	 * @param string $dEnd
	 */
	public function GetEventsFromVCalendar($oAccount, $oCalendar, $oVCal, $dStart, $dEnd)
	{
		$oVCalOriginal = clone $oVCal;

		$oDTStart = \Sabre\VObject\DateTimeParser::parse($dStart);
		$oDTEnd = \Sabre\VObject\DateTimeParser::parse($dEnd);

		$oVCal->expand($oDTStart, $oDTEnd);
		
		$aEvents = CalendarParser::ParseEvent($oAccount, $oCalendar, $oVCal, $oVCalOriginal);
		
		return $aEvents;
	}
	
	/**
	 * @param CAccount $oAccount
	 * @param string $sCalendarId
	 * @param string $sEventId
	 * @param string $dStart
	 * @param string $dEnd
	 */
	public function GetExpandedEvent($oAccount, $sCalendarId, $sEventId, $dStart, $dEnd)
	{
		$this->Init($oAccount);

		$mResult = false;
		$oServerCalendar = $this->GetServerCalendar($sCalendarId);
		if ($oServerCalendar)
		{
			$oEvent = $this->GetServerEvent($oAccount, $oServerCalendar, $sEventId);
			if ($oEvent)
			{
				$oVCal = \Sabre\VObject\Reader::read($oEvent->get());

				$oCalendar = $this->GetCalendarObject($oServerCalendar);
				$mResult = $this->GetEventsFromVCalendar($oAccount, $oCalendar, $oVCal, $dStart, $dEnd);
			}
		}
		return $mResult;
	}

	/**
	 * @param CAccount $oAccount
	 * @param string $sCalendarId
	 * @param string $sEventId
	 */
	public function GetEvent($oAccount, $sCalendarId, $sEventId)
	{
		$this->Init($oAccount);

		$mResult = false;
		$oCalendar = $this->GetServerCalendar($sCalendarId);
		if ($oCalendar)
		{		
			$oEvent = $this->GetServerEvent($oAccount, $oCalendar, $sEventId);
			if ($oEvent)
			{
				$mResult = array(
					'url'  => $oEvent->getName(),
					'vcal' => \Sabre\VObject\Reader::read($oEvent->get())
				);
			}
		}
		return $mResult;
	}	
	
	/**
	 * @param CAccount $oAccount
	 * @param string $sCalendarId
	 * @param string $dStart
	 * @param string $dEnd
	 */
	public function GetEvents($oAccount, $sCalendarId, $dStart, $dEnd)
	{
		$this->Init($oAccount);

		$mResult = false;
		$oServerCalendar = $this->GetServerCalendar($sCalendarId);

		if ($oServerCalendar)
		{
			$oCalendar = $this->GetCalendarObject($oServerCalendar);
			$mResult = array();
			
			foreach ($oServerCalendar->getChildren() as $oChild)
			{
				if ($oChild instanceof \Sabre\CalDAV\CalendarObject)
				{
					$oVCal = \Sabre\VObject\Reader::read($oChild->get());
					
					$aEvents = $this->GetEventsFromVCalendar($oAccount, $oCalendar, $oVCal, $dStart, $dEnd);
					$mResult = array_merge($mResult, $aEvents);
				}
			}
		}

		return $mResult;
	}
	
	/**
	 * @param CAccount $oAccount
	 * @param string $sCalendarId
	 * @param string $sEventId
	 * @param \Sabre\VObject\Component\VCalendar $oVCal
	 */
	public function CreateEvent($oAccount, $sCalendarId, $sEventId, $oVCal)
	{
		$this->Init($oAccount);

		$oServerCalendar = $this->GetServerCalendar($sCalendarId);
		if ($oServerCalendar)
		{
			$oCalendar = $this->GetCalendarObject($oServerCalendar);
			if ($oCalendar->Access !== \ECalendarPermission::Read)
			{
				$sData = $oVCal->serialize();
				$oServerCalendar->createFile($sEventId.'.ics', $sData);

				$this->UpdateReminder($oCalendar->Owner, $oCalendar->RealUrl, $sEventId, $sData);

				return $sEventId;
			}
		}

		return null;
	}


	/**
	 * @param CAccount $oAccount
	 * @param string $sCalendarId
	 * @param string $sEventId
	 * @param string $sData
	 */
	public function UpdateEventData($oAccount, $sCalendarId, $sEventId, $sData)
	{
		$this->Init($oAccount);

		$oServerCalendar = $this->GetServerCalendar($sCalendarId);
		if ($oServerCalendar)
		{
			$oCalendar = $this->GetCalendarObject($oServerCalendar);
			if ($oCalendar->Access !== \ECalendarPermission::Read)
			{
				$oServerEvent = $this->GetServerEvent($oAccount, $oServerCalendar, $sEventId);
				if ($oServerEvent)
				{
					$oCalendarChild = $oServerCalendar->getChild($oServerEvent->getName());
					if ($oCalendarChild)
					{
						$oCalendarChild->put($sData);
						return true;
					}
				}
				else
				{
					$oServerCalendar->createFile($sEventId.'.ics', $sData);

					$this->UpdateReminder($oCalendar->Owner, $oCalendar->RealUrl, $sEventId, $sData);

					return true;
				}
			}
		}
		return false;
	}

	/**
	 * @param CAccount $oAccount
	 * @param string $sCalendarId
	 * @param string $sEventId
	 * @param array $oVCal
	 */
	public function UpdateEvent($oAccount, $sCalendarId, $sEventId, $oVCal)
	{
 		$this->Init($oAccount);

		$oServerCalendar = $this->GetServerCalendar($sCalendarId);
		if ($oServerCalendar)
		{
			$oCalendar = $this->GetCalendarObject($oServerCalendar);
			if ($oCalendar->Access !== \ECalendarPermission::Read)
			{
				$oCalendarChild = $oServerCalendar->getChild($sEventId . '.ics');
				$sData = $oVCal->serialize();
				$oCalendarChild->put($sData);

				$this->UpdateReminder($oCalendar->Owner, $oCalendar->RealUrl, $sEventId, $sData);
				return true;
			}
		}
		return false;
	}

	public function MoveEvent($oAccount, $sCalendarId, $sNewCalendarId, $sEventId, $sData)
	{
		$this->Init($oAccount);

		$oServerCalendar = $this->GetServerCalendar($sCalendarId);
		if ($oServerCalendar)
		{
			$oNewServerCalendar = $this->GetServerCalendar($sNewCalendarId);
			if ($oNewServerCalendar)
			{
				$oCalendar = $this->GetCalendarObject($oNewServerCalendar);
				if ($oCalendar->Access !== \ECalendarPermission::Read)
				{
					$oNewServerCalendar->createFile($sEventId . '.ics', $sData);
	
					$oCalendarChild = $oServerCalendar->getChild($sEventId . '.ics');
					$oCalendarChild->delete();

					$this->DeleteReminder($sEventId);
					$this->UpdateReminder($oCalendar->Owner, $oCalendar->RealUrl, $sEventId, $sData);
		
					return true;
				}
			}
		}
		return false;
	}

	/**
	 * @param CAccount $oAccount
	 * @param string $sCalendarId
	 * @param string $sEventId
	 */
	public function DeleteEvent($oAccount, $sCalendarId, $sEventId)
	{
		$this->Init($oAccount);

		$oServerCalendar = $this->GetServerCalendar($sCalendarId);
		if ($oServerCalendar)
		{
			$oCalendar = $this->GetCalendarObject($oServerCalendar);
			if ($oCalendar->Access !== \ECalendarPermission::Read)
			{
				$oChild = $oServerCalendar->getChild($sEventId.'.ics');
				$oChild->delete();

				$this->DeleteReminder($sEventId);

				return true;
			}
		}
		return false;
	}

	public function GetReminders($start, $end)
	{
		$bResult = false;
		$oPluginReminders = $this->Server->getPlugin('reminders');
		if (isset($oPluginReminders))
		{
			$bResult = $oPluginReminders->getReminders($start, $end);
		}
		
		return $bResult;
	}

	public function AddReminder($sEmail, $sCalendarUri, $sEventId, $time = null, $starttime = null)
	{
		$bResult = false;
		$oPluginReminders = $this->Server->getPlugin('reminders');
		if (isset($oPluginReminders))
		{
			$bResult = $oPluginReminders->addReminder($sEmail, $sCalendarUri, $sEventId, $time, $starttime);
		}
		
		return $bResult;
	}
	
	public function UpdateReminder($sEmail, $sCalendarUri, $sEventId, $sData)
	{
		$oPluginReminders = $this->Server->getPlugin('reminders');
		if (isset($oPluginReminders))
		{
			$oPluginReminders->updateReminder(trim($sCalendarUri, '/') . '/' . $sEventId . '.ics', $sData, $sEmail);
		}
	}

	public function DeleteReminder($sEventId)
	{
		$oPluginReminders = $this->Server->getPlugin('reminders');
		$oPluginReminders->deleteReminder($sEventId);
	}

	public function DeleteReminderByCalendar($sCalendarUri)
	{
		$oPluginReminders = $this->Server->getPlugin('reminders');
		$oPluginReminders->deleteReminderByCalendar($sCalendarUri);
	}
}
