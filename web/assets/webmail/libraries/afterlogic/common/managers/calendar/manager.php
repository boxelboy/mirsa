<?php

/*
 * Copyright (C) 2002-2013 AfterLogic Corp. (www.afterlogic.com)
 * Distributed under the terms of the license described in LICENSE
 *
 */

/**
 * @package Calendar
 */
class CApiCalendarManager extends AApiManagerWithStorage
{
	/*
	 * @type $ApiUsersManager CApiUsersManager
	 */
	protected $ApiUsersManager;

	/*
	 * @type CApiCapabilityManager
	 */
	protected $oApiCapabilityManager;

	/**
	 * @param CApiGlobalManager &$oManager
	 */
	public function __construct(CApiGlobalManager &$oManager, $sForcedStorage = '')
	{
		parent::__construct('calendar', $oManager, $sForcedStorage);

		$this->inc('classes.helper');
		$this->inc('classes.calendar');
		$this->inc('classes.event');
		$this->inc('classes.parser');

		$this->ApiUsersManager = CApi::Manager('users');
		$this->oApiCapabilityManager = CApi::Manager('capability');
		$this->oApiDavManager = CApi::Manager('dav');
	}

	public function GetCalendarAccess($oAccount, $sCalendarId)
	{
		$oResult = null;
		try
		{
			$oResult = $this->oStorage->GetCalendarAccess($oAccount, $sCalendarId);
		}
		catch (Exception $oException)
		{
			$oResult = false;
			$this->setLastException($oException);
		}
		return $oResult;
	}

	public function GetPublicUser()
	{
		$oResult = null;
		try
		{
			$oResult = $this->oStorage->GetPublicUser();
		}
		catch (Exception $oException)
		{
			$oResult = false;
			$this->setLastException($oException);
		}
		return $oResult;
	}

	public function GetPublicAccount()
	{
		$oAccount = new CAccount(new CDomain());
		$oAccount->Email = $this->GetPublicUser();
		return $oAccount;
	}

	// Calendars
	/**
	 * @param CAccount $oAccount
	 * @param string $sCalendarId
	 */
	public function GetCalendar($oAccount, $sCalendarId)
	{
		$oCalendar = false;
		try
		{
			$oCalendar = $this->oStorage->GetCalendar($oAccount, $sCalendarId);
			if ($oCalendar)
			{
				$oCalendar = $this->PopulateCalendarShares($oAccount, $oCalendar);
			}
		}
		catch (Exception $oException)
		{
			$oCalendar = false;
			$this->setLastException($oException);
		}
		return $oCalendar;
	}

	/**
	 * @param CAccount $oAccount
	 * @param CCalendar $oCalendar
	 */
	public function PopulateCalendarShares($oAccount, $oCalendar)
	{
		if (!$oCalendar->Shared)
		{
			$oCalendar->PubHash = $this->GetPublicCalendarHash($oAccount, $oCalendar->Id);
			$aUsers = $this->GetCalendarUsers($oAccount, $oCalendar);

			$aShares = array();
			if ($aUsers && is_array($aUsers))
			{
				foreach ($aUsers as $aUser)
				{
					if ($aUser['email'] === $this->GetPublicUser())
					{
						$oCalendar->IsPublic = true;
					}
					else
					{
						$aShares[] = $aUser;
					}
				}
			}
			$oCalendar->Shares = $aShares;
		}
		else
		{
			$oCalendar->IsDefault = false;
		}
		
		return $oCalendar;
	}
	
	/**
	 * @param CAccount $oAccount
	 * @param CCalendar $oCalendar
	 */
	public function GetCalendarAsArray($oAccount, $oCalendar)
	{
		return array(
			'Id' => $oCalendar->Id,
			'Url' => $oCalendar->Url,
			'ExportHash' => CApi::EncodeKeyValues(array('CalendarId' => $oCalendar->Id)),
			'Color' => $oCalendar->Color,
			'Description' => $oCalendar->Description,
			'Name' => $oCalendar->DisplayName,
			'Owner' => $oCalendar->Owner,
			'IsDefault' => $oCalendar->IsDefault,
			'PrincipalId' => $oCalendar->GetMainPrincipalUrl(),
			'ServerUrl' => $this->oApiDavManager && $oAccount ? $this->oApiDavManager->GetServerUrl($oAccount) : '',
			'PrincipalUrl' => $this->oApiDavManager && $oAccount ? $this->oApiDavManager->GetPrincipalUrl($oAccount) : '',
			'Shared' => $oCalendar->Shared,
			'Access' => $oCalendar->Access,
			'IsPublic' => $oCalendar->IsPublic,
			'PubHash' => $oCalendar->PubHash,
			'Shares' => $oCalendar->Shares
		);
	}	
	
	/**
	 * @param string $sCalendarId
	 */
	public function GetPublicCalendar($sCalendarId)
	{
		return $this->GetCalendar($this->GetPublicAccount(), $sCalendarId);
	}

	/**
	 * @param string $sHash
	 */
	public function GetPublicCalendarByHash($sHash)
	{
		$oResult = null;
		$aValues = \CApi::DecodeKeyValues($sHash);
		if (isset($aValues['Id']))
		{
			$oResult = $this->GetPublicCalendar($aValues['Id']);
		}
		
		return $oResult;
	}

	/**
	 * @param string $sCalendarId
	 */
	public function GetPublicCalendarHash($oAccount, $sCalendarId)
	{
		$oResult = null;
		try
		{
			$oResult = $this->oStorage->GetPublicCalendarHash($oAccount, $sCalendarId);
		}
		catch (Exception $oException)
		{
			$oResult = false;
			$this->setLastException($oException);
		}
		return $oResult;
	}

	/**
	 * @param CAccount $oAccount
	 */
	public function GetUserCalendars($oAccount)
	{
		return $this->oStorage->GetCalendars($oAccount);
	}

	/**
	 * @param CAccount $oAccount
	 */
	public function GetSharedCalendars($oAccount)
	{
		return $this->oStorage->GetCalendarsShared($oAccount);
	}

	public function ___qSortCallback ($a, $b)
	{
		return ($a['is_default'] === '1' ? -1 : 1);
	}

	/**
	 * @param CAccount $oAccount
	 */
	public function GetCalendars($oAccount)
	{
		$oResult = null;
		try
		{
			$oResult = array();
			
			$oCalendars = $this->oStorage->GetCalendars($oAccount);
			if ($this->oApiCapabilityManager->IsCalendarSharingSupported($oAccount))
			{
				$oCalendars = array_merge(
					$oCalendars, 
					$this->oStorage->GetCalendarsShared($oAccount)
				);
			}
			
			foreach ($oCalendars as $oCalendar)
			{
				$oCalendar = $this->PopulateCalendarShares($oAccount, $oCalendar);
				$oResult[] = $this->GetCalendarAsArray($oAccount, $oCalendar);
			}
			
//			uasort($oResult['user'], array(&$this, '___qSortCallback'));

		}
		catch (Exception $oException)
		{
			$oResult = false;
			$this->setLastException($oException);
		}
		
		return $oResult;
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
		$oResult = null;
		try
		{
			$oResult = $this->oStorage->CreateCalendar($oAccount, $sName, $sDescription, $iOrder, $sColor);
		}
		catch (Exception $oException)
		{
			$oResult = false;
			$this->setLastException($oException);
		}
		return $oResult;
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
		$oResult = null;
		try
		{
			$oResult = $this->oStorage->UpdateCalendar($oAccount, $sCalendarId, $sName, $sDescription, $iOrder, $sColor);
		}
		catch (Exception $oException)
		{
			$oResult = false;
			$this->setLastException($oException);
		}
		return $oResult;
	}

	/**
	 * @param string $sCalendarId
	 * @param int $iVisible
	 */
	public function UpdateCalendarVisible($sCalendarId, $iVisible)
	{
		$oResult = null;
		try
		{
			$this->oStorage->UpdateCalendarVisible($sCalendarId, $iVisible);
			$oResult = true;
		}
		catch (Exception $oException)
		{
			$oResult = false;
			$this->setLastException($oException);
		}
		return $oResult;
	}

	/**
	 * @param CAccount $oAccount
	 * @param string $sCalendarId
	 * @param string $sColor
	 */
	public function UpdateCalendarColor($oAccount, $sCalendarId, $sColor)
	{
		$oResult = null;
		try
		{
			$oResult = $this->oStorage->UpdateCalendarColor($oAccount, $sCalendarId, $sColor);
		}
		catch (Exception $oException)
		{
			$oResult = false;
			$this->setLastException($oException);
		}
		return $oResult;
	}

	/**
	 * @param CAccount $oAccount
	 * @param string $sCalendarId
	 */
	public function DeleteCalendar($oAccount, $sCalendarId)
	{
		$oResult = null;
		try
		{
			if (\afterlogic\DAV\Constants::CALENDAR_DEFAULT_NAME !== basename($sCalendarId))
			{
				$oResult = $this->oStorage->DeleteCalendar($oAccount, $sCalendarId);
			}
			else
			{
				$oResult = false;
			}
		}
		catch (Exception $oException)
		{
			$oResult = false;
			$this->setLastException($oException);
		}
		return $oResult;
	}

	/**
	 * @param CAccount $oAccount
	 * @param string $sCalendarId
	 */
	public function UnsubscribeCalendar($oAccount, $sCalendarId)
	{
		$oResult = null;
		if ($this->oApiCapabilityManager->IsCalendarSharingSupported($oAccount))
		{
			try
			{
				$oResult = $this->oStorage->UnsubscribeCalendar($oAccount, $sCalendarId);
			}
			catch (Exception $oException)
			{
				$oResult = false;
				$this->setLastException($oException);
			}
		}
		return $oResult;
	}

	/**
	 * @param CAccount $oAccount
	 * @param string $sCalendarId
	 * @param string $sUserId
	 * @param int $iPermission
	 */
	public function UpdateCalendarShare($oAccount, $sCalendarId, $sUserId, $iPermission)
	{
		$oResult = null;
		if ($this->oApiCapabilityManager->IsCalendarSharingSupported($oAccount))
		{
			try
			{
				$oResult = $this->oStorage->UpdateCalendarShare($oAccount, $sCalendarId, $sUserId, $iPermission);
			}
			catch (Exception $oException)
			{
				$oResult = false;
				$this->setLastException($oException);
			}
		}
		return $oResult;
	}
	
	/**
	 * @param CAccount $oAccount
	 * @param string $sCalendarId
	 * @param array $aShares
	 */
	public function UpdateCalendarShares($oAccount, $sCalendarId, $aShares)
	{
		$oResult = null;
		if ($this->oApiCapabilityManager->IsCalendarSharingSupported($oAccount))
		{
			try
			{
				$this->oStorage->DeleteCalendarShares($oAccount, $sCalendarId);
				foreach($aShares as $aShare)
				{
					$oResult = $this->oStorage->UpdateCalendarShare($oAccount, $sCalendarId, $aShare['email'], $aShare['access']);
				}
			}
			catch (Exception $oException)
			{
				$oResult = false;
				$this->setLastException($oException);
			}
		}
		return $oResult;
	}

	/**
	 * @param CAccount $oAccount
	 * @param string $sCalendarId
	 */
	public function PublicCalendar($oAccount, $sCalendarId)
	{
		$oResult = null;
		try
		{
			$oResult = $this->oStorage->PublicCalendar($oAccount, $sCalendarId);
		}
		catch (Exception $oException)
		{
			$oResult = false;
			$this->setLastException($oException);
		}
		return $oResult;
	}

	/**
	 * @param CAccount $oAccount
	 * @param string $sCalendarId
	 */
	public function UnPublicCalendar($oAccount, $sCalendarId)
	{
		$oResult = null;
		try
		{
			$oResult = $this->oStorage->UnPublicCalendar($oAccount, $sCalendarId);
		}
		catch (Exception $oException)
		{
			$oResult = false;
			$this->setLastException($oException);
		}
		return $oResult;
	}

	/**
	 * @param CAccount $oAccount
	 * @param string $sCalendarId
	 * @param string $sUserId
	 */
	public function DeleteCalendarShare($oAccount, $sCalendarId, $sUserId)
	{
		$oResult = null;
		try
		{
			$oResult = $this->UpdateCalendarShare($oAccount, $sCalendarId, $sUserId);
		}
		catch (Exception $oException)
		{
			$oResult = false;
			$this->setLastException($oException);
		}
		return $oResult;
	}

	/**
	 * @param CAccount $oAccount
	 * @param FileInfo $oCalendar
	 */
	public function GetCalendarUsers($oAccount, $oCalendar)
	{
		$oResult = null;
		if ($this->oApiCapabilityManager->IsCalendarSharingSupported($oAccount))
		{
			try
			{
				$oResult = $this->oStorage->GetCalendarUsers($oAccount, $oCalendar);
			}
			catch (Exception $oException)
			{
				$oResult = false;
				$this->setLastException($oException);
			}
		}
		return $oResult;
	}

	/**
	 * @param CAccount $oAccount
	 * @param string $sCalendarId
	 * @return string
	 */
	public function ExportCalendarToIcs($oAccount, $sCalendarId)
	{
		$mResult = null;
		try
		{
			$mResult = $this->oStorage->ExportCalendarToIcs($oAccount, $sCalendarId);
		}
		catch (Exception $oException)
		{
			$mResult = false;
			$this->setLastException($oException);
		}
		return $mResult;
	}


	// Events

	/**
	 * @param CAccount $oAccount
	 * @param array | string $mCalendarId
	 * @param string $dStart
	 * @param string $dFinish
	 */
	public function GetEvents($oAccount, $mCalendarId, $dStart = null, $dFinish = null)
	{
		$aResult = array();
		try
		{
			if ($dStart != null) $dStart = date('Ymd\T000000\Z', $dStart  + 86400);
			if ($dFinish != null) $dFinish = date('Ymd\T235959\Z', $dFinish);

			if (!is_array($mCalendarId))
			{
				$mCalendarId = array($mCalendarId);
			}
			foreach ($mCalendarId as $sCalendarId) 
			{
				$aEvents = $this->oStorage->GetEvents($oAccount, $sCalendarId, $dStart, $dFinish);
				if ($aEvents && is_array($aEvents))
				{
					$aResult = array_merge($aResult, $aEvents);
				}
			}
		}
		catch (Exception $oException)
		{
			$aResult = false;
			$this->setLastException($oException);
		}
		return $aResult;
	}

	/**
	 * @param string $sCalendarId
	 * @param string $dStart
	 * @param string $dFinish
	 */
	public function GetPublicEvents($sCalendarId, $dStart = null, $dFinish = null)
	{
		return $this->GetEvents($this->GetPublicAccount(), $sCalendarId, $dStart, $dFinish);
	}

	/**
	 * @param CAccount $oAccount
	 * @param string $sCalendarId
	 * @param string $sEventId
	 */
	public function GetEvent($oAccount, $sCalendarId, $sEventId)
	{
		$mResult = null;
		try
		{
			$mResult = array();
			$aData = $this->oStorage->GetEvent($oAccount, $sCalendarId, $sEventId);
			if ($aData !== false)
			{
				if (isset($aData['vcal']))
				{
					$oVCal = $aData['vcal'];
					$oCalendar = $this->oStorage->GetCalendar($oAccount, $sCalendarId);
					$mResult = CalendarParser::ParseEvent($oAccount, $oCalendar, $oVCal);
					$mResult['vcal'] = $oVCal;
				}
			}
		}
		catch (Exception $oException)
		{
			$mResult = false;
			$this->setLastException($oException);
		}
		return $mResult;
	}
	
	/**
	 * @param CAccount $oAccount
	 * @param string $sCalendarId
	 * @param string $sEventId
	 */
	public function GetBaseEvent($oAccount, $sCalendarId, $sEventId)
	{
		$mResult = null;
		try
		{
			$mResult = array();
			$aData = $this->oStorage->GetEvent($oAccount, $sCalendarId, $sEventId);
			if ($aData !== false)
			{
				if (isset($aData['vcal']))
				{
					$oVCal = $aData['vcal'];
					$oVCalOriginal = clone $oVCal;
					$oCalendar = $this->oStorage->GetCalendar($oAccount, $sCalendarId);
					$oVEvent = $oVCal->getBaseComponents('VEVENT');
					if (isset($oVEvent[0]))
					{
						unset($oVCal->VEVENT);
						$oVCal->VEVENT = $oVEvent[0];
					}
					$oEvent = CalendarParser::ParseEvent($oAccount, $oCalendar, $oVCal, $oVCalOriginal);
					if (isset($oEvent[0]))
					{
						$mResult = $oEvent[0];
					}
				}
			}
		}
		catch (Exception $oException)
		{
			$mResult = false;
			$this->setLastException($oException);
		}
		return $mResult;
	}

	/**
	 * @param CAccount $oAccount
	 * @param string $sCalendarId
	 * @param string $sEventId
	 * @param string $dStart
	 * @param string $dEnd
	 */
	public function GetExpandedEvent($oAccount, $sCalendarId, $sEventId, $dStart = null, $dEnd = null)
	{
		$mResult = null;
		
		if ($dStart != null) $dStart = date('Ymd\T000000\Z', $dStart  + 86400);
		if ($dEnd != null) $dEnd = date('Ymd\T235959\Z', $dEnd);
		
		try
		{
			$mResult = $this->oStorage->GetExpandedEvent($oAccount, $sCalendarId, $sEventId, $dStart, $dEnd);
		}
		catch (Exception $oException)
		{
			$mResult = false;
			$this->setLastException($oException);
		}
		return $mResult;
	}	

	/**
	 * @param CAccount $oAccount
	 * @param string $sCalendarId
	 * @param string $sEventId
	 * @param array $sData
	 */
	public function CreateEventData($oAccount, $sCalendarId, $sEventId, $sData)
	{
		$oResult = null;
		$aEvents = array();
		try
		{
			$vCal = \Sabre\VObject\Reader::read($sData);
			if ($vCal && $vCal->VEVENT)
			{
				if (!empty($sEventId))
				{
					$oResult = $this->oStorage->CreateEvent($oAccount, $sCalendarId, $sEventId, $vCal);
				}
				else
				{
					foreach ($vCal->VEVENT as $vEvent)
					{
						$sUid = (string)$vEvent->UID;
						if (!isset($aEvents[$sUid]))
						{
							$aEvents[$sUid] = new \Sabre\VObject\Component\VCalendar();
						}
						$aEvents[$sUid]->add($vEvent);
					}

					foreach ($aEvents as $sUid => $vCalNew)
					{
						$this->oStorage->CreateEvent($oAccount, $sCalendarId, $sUid, $vCalNew);
					}
				}
			}
		}
		catch (Exception $oException)
		{
			$oResult = false;
			$this->setLastException($oException);
		}
		return $oResult;
	}
	
	/**
	 * @param CAccount $oAccount
	 * @param CEvent $oEvent
	 */
	public function CreateEvent($oAccount, $oEvent)
	{
		$oResult = null;
		try
		{
			$oEvent->Id = \Sabre\DAV\UUIDUtil::getUUID();

			$oVCal = new \Sabre\VObject\Component\VCalendar();
			$oVCal->add('VEVENT', array(
				'SEQUENCE' => 1,
				'TRANSP' => 'OPAQUE',
				'DTSTAMP' => new \DateTime('now')
			));

			$this->oStorage->Init($oAccount);

			CCalendarHelper::PopulateVCalendar($oAccount, $oEvent, $oVCal->VEVENT);
			
			$oResult = $this->oStorage->CreateEvent($oAccount, $oEvent->IdCalendar, $oEvent->Id, $oVCal);
		}
		catch (Exception $oException)
		{
			$oResult = false;
			$this->setLastException($oException);
		}
		return $oResult;
	}

	/**
	 * @param CAccount $oAccount
	 * @param CEvent $oEvent
	 */
	public function UpdateEvent($oAccount, $oEvent)
	{
		$oResult = null;
		try
		{
			$aData = $this->oStorage->GetEvent($oAccount, $oEvent->IdCalendar, $oEvent->Id);
			if ($aData !== false)
			{
				$oVCal = $aData['vcal'];

				if ($oVCal)
				{
					$iIndex = CCalendarHelper::GetBaseVEventIndex($oVCal->VEVENT);
					if ($iIndex !== false)
					{
						CCalendarHelper::PopulateVCalendar($oAccount, $oEvent, $oVCal->VEVENT[$iIndex]);
					}
					$oVCalCopy = clone $oVCal;
					if (!isset($oEvent->RRule))
					{
						unset($oVCalCopy->VEVENT);
						foreach ($oVCal->VEVENT as $oVEvent)
						{
							if (!isset($oVEvent->{'RECURRENCE-ID'}))
							{
								$oVCalCopy->add($oVEvent);
							}
						}
					}
					$oResult = $this->oStorage->UpdateEvent($oAccount, $oEvent->IdCalendar, $oEvent->Id, $oVCalCopy);
				}
			}
		}
		catch (Exception $oException)
		{
			$oResult = false;
			$this->setLastException($oException);
		}
		return $oResult;
	}

	public function MoveEvent($oAccount, $sCalendarId, $sNewCalendarId, $sEventId)
	{
		$oResult = null;
		try
		{
			$aData = $this->oStorage->GetEvent($oAccount, $sCalendarId, $sEventId);
			if ($aData !== false)
			{
				$oResult = $this->oStorage->MoveEvent($oAccount, $sCalendarId, $sNewCalendarId, $sEventId, $aData['vcal']->serialize());
				return true;
			}
			return false;
		}
		catch (Exception $oException)
		{
			$oResult = false;
			$this->setLastException($oException);
		}
		return $oResult;
	}

	/**
	 * @param CAccount $oAccount
	 * @param string $sCalendarId
	 * @param string $sEventId
	 */
	public function DeleteEvent($oAccount, $sCalendarId, $sEventId)
	{
		$oResult = null;
		try
		{
			$aData = $this->oStorage->GetEvent($oAccount, $sCalendarId, $sEventId);
			if ($aData !== false)
			{
				$oVCal = $aData['vcal'];

				if ($oVCal)
				{
					$iIndex = CCalendarHelper::GetBaseVEventIndex($oVCal->VEVENT);
					if ($iIndex !== false)
					{
						$oVEvent = $oVCal->VEVENT[$iIndex];

						$sOrganizer = (isset($oVEvent->ORGANIZER)) ? 
								str_replace('mailto:', '', strtolower((string)$oVEvent->ORGANIZER)) : null;

						if (isset($sOrganizer))
						{
							if ($sOrganizer === $oAccount->Email)
							{
								if (isset($oVEvent->ATTENDEE))
								{
									foreach($oVEvent->ATTENDEE as $oAttendee)
									{
										$sEmail = str_replace('mailto:', '', strtolower((string)$oAttendee));
										
										$oVCal->METHOD = 'CANCEL';
										$sSubject = (string)$oVEvent->SUMMARY . ': Canceled';

										CCalendarHelper::SendAppointmentMessage($oAccount, $sEmail, $sSubject, $oVCal->serialize(), 'REQUEST');
										unset($oVCal->METHOD);
									}
								}
							}
/*
							else
							{
								$oVEvent->{'LAST-MODIFIED'} = gmdate("Ymd\THis\Z");
								unset($oVEvent->ATTENDEE);
								$oVEvent->add('ATTENDEE', 'mailto:'.$oAccount->Email, array(
									'CN' => $oAccount->FriendlyName,
									'PARTSTAT' => 'DECLINED',
									'RESPONDED-AT' => gmdate("Ymd\THis\Z")
								));

								$oVCal->METHOD = 'REPLY';
								$sSubject = (string)$oVEvent->SUMMARY . ': Declined';

								CCalendarHelper::SendAppointmentMessage($oAccount, $sOrganizer, $sSubject, $oVCal->serialize(), (string)$oVCal->METHOD);
								
								unset($oVCal->METHOD);
							}
*/
						}
					}
				}
				$oResult = $this->oStorage->DeleteEvent($oAccount, $sCalendarId, $sEventId);
			}
		}
		catch (Exception $oException)
		{
			$oResult = false;
			$this->setLastException($oException);
		}
		return $oResult;
	}

	/**
	 * @param CAccount $oAccount
	 * @param CEvent $oEvent
	 * @param string $sRecurrenceId
	 * @param bool $bDelete
	 */
	public function UpdateExclusion($oAccount, $oEvent, $sRecurrenceId, $bDelete = false)
	{
		$oResult = null;
		try
		{
			$aData = $this->oStorage->GetEvent($oAccount, $oEvent->IdCalendar, $oEvent->Id);
			if ($aData !== false)
			{
				$oVCal = $aData['vcal'];
				$iIndex = CCalendarHelper::GetBaseVEventIndex($oVCal->VEVENT);
				if ($iIndex !== false)
				{
					unset($oVCal->VEVENT[$iIndex]->{'LAST-MODIFIED'});
					$oVCal->VEVENT[$iIndex]->add('LAST-MODIFIED', new \DateTime('now'));

					$oDTExdate = CCalendarHelper::PrepareDateTime($sRecurrenceId, $oAccount->GetDefaultStrTimeZone());

					$mIndex = CCalendarHelper::isRecurrenceExists($oVCal->VEVENT, $sRecurrenceId);
					if ($bDelete)
					{
						$oVCal->VEVENT[$iIndex]->add('EXDATE', $oDTExdate);

						if (false !== $mIndex)
						{
							$aVEvents = $oVCal->VEVENT;
							unset($oVCal->VEVENT);

							foreach($aVEvents as $oVEvent)
							{
								if ($oVEvent->{'RECURRENCE-ID'})
								{
									$iRecurrenceId = CCalendarHelper::GetStrDate($oVEvent->{'RECURRENCE-ID'},
											$oAccount->GetDefaultStrTimeZone(), 'Ymd');
									if ($iRecurrenceId == (int) $sRecurrenceId)
									{
										continue;
									}
								}
								$oVCal->add($oVEvent);
							}
						}
					}
					else
					{
						$oVEventRecur = null;
						if ($mIndex === false)
						{
							$oVEventRecur = $oVCal->add('VEVENT', array(
								'SEQUENCE' => 1,
								'TRANSP' => 'OPAQUE',
								'RECURRENCE-ID' => $oDTExdate
							));
						}
						else if (isset($oVCal->VEVENT[$mIndex]))
						{
							$oVEventRecur = $oVCal->VEVENT[$mIndex];
						}
						if ($oVEventRecur)
						{
							$oEvent->RRule = null;
							CCalendarHelper::PopulateVCalendar($oAccount, $oEvent, $oVEventRecur);
						}
					}

					return $this->oStorage->UpdateEvent($oAccount, $oEvent->IdCalendar, $oEvent->Id, $oVCal);

				}
			}
			return false;
		}
		catch (Exception $oException)
		{
			$oResult = false;
			$this->setLastException($oException);
		}
		return $oResult;
	}

	/**
	 * @param CAccount $oAccount
	 * @param string $sCalendarId
	 * @param string $sEventId
	 * @param string $iRecurrenceId
	 */
	public function DeleteExclusion($oAccount, $sCalendarId, $sEventId, $iRecurrenceId)
	{
		$oResult = null;
		try
		{
			$aData = $this->oStorage->GetEvent($oAccount, $sCalendarId, $sEventId);
			if ($aData !== false)
			{
				$oVCal = $aData['vcal'];

				$aVEvents = $oVCal->VEVENT;
				unset($oVCal->VEVENT);

				foreach($aVEvents as $oVEvent)
				{
					if (isset($oVEvent->{'RECURRENCE-ID'}))
					{
						$iServerRecurrenceId = CCalendarHelper::GetStrDate($oVEvent->{'RECURRENCE-ID'},
								$oAccount->GetDefaultStrTimeZone(), 'Ymd');
						if ($iRecurrenceId == $iServerRecurrenceId)
						{
							continue;
						}
					}
					$oVCal->add($oVEvent);
				}
				return $this->oStorage->UpdateEvent($oAccount, $sCalendarId, $sEventId, $oVCal);
			}
			return false;
		}
		catch (Exception $oException)
		{
			$oResult = false;
			$this->setLastException($oException);
		}
		return $oResult;
	}

	public function GetReminders($start = null, $end = null)
	{
		$oResult = null;
		try
		{
			$oResult = $this->oStorage->GetReminders($start, $end);
		}
		catch (Exception $oException)
		{
			$oResult = false;
			$this->setLastException($oException);
		}
		return $oResult;
	}

	public function DeleteReminder($eventId)
	{
		$oResult = null;
		try
		{
			$oResult = $this->oStorage->DeleteReminder($eventId);
		}
		catch (Exception $oException)
		{
			$oResult = false;
			$this->setLastException($oException);
		}
		return $oResult;
	}

	public function DeleteReminderByCalendar($calendarUri)
	{
		$oResult = null;
		try
		{
			$oResult = $this->oStorage->DeleteReminderByCalendar($calendarUri);
		}
		catch (Exception $oException)
		{
			$oResult = false;
			$this->setLastException($oException);
		}
		return $oResult;
	}

	public function UpdateReminder($sEmail, $sCalendarUri, $sEventId, $sData)
	{
		$oResult = null;
		try
		{
			$oResult = $this->oStorage->UpdateReminder($sEmail, $sCalendarUri, $sEventId, $sData);
		}
		catch (Exception $oException)
		{
			$oResult = false;
			$this->setLastException($oException);
		}
		return $oResult;
	}
	
	/**
	 * @param CAccount $oAccount
	 * @param string $sData
	 * @param string $mFromEmail
	 *
	 * @return bool
	 */
	public function PreprocessICS($oAccount, $sData, $mFromEmail)
	{
		$iAccountId = $this->ApiUsersManager->GetDefaultAccountId($oAccount->IdUser);

		/* @var $oAccount CAccount */
		$oAccount = $iAccountId === $oAccount->IdAccount ? $oAccount : $this->ApiUsersManager->GetAccountById($iAccountId);

		$mResult = null;
		try
		{
			$mResult = false;
			$oVCal = \Sabre\VObject\Reader::read($sData);
			if ($oVCal)
			{
				$oMethod = null;
				$sMethod = 'SAVE';
				if (isset($oVCal->METHOD))
				{
					$oMethod = $oVCal->METHOD;
					$sMethod = (string)$oVCal->METHOD;
					if ($sMethod !== 'REQUEST' && $sMethod !== 'REPLY' && $sMethod !== 'CANCEL')
					{
						return false;
					}
				}

				$oVEvent = null;
				$aVEvents = $oVCal->getBaseComponents('VEVENT');
				if (isset($aVEvents) && count($aVEvents) > 0)
				{
					$oVEvent = $aVEvents[0];
				}
				else
				{
					$aVEvents = $oVCal->VEVENT;
					if ($aVEvents && count($aVEvents) > 0)
					{
						$oVEvent = $aVEvents[0];
					}
				}
				
				if (isset($oVEvent))
				{
					$sEventId = (string)$oVEvent->UID;
					$sCalId = '';

					$aCals = $this->oStorage->GetCalendars($oAccount);
					$aServerData = false;
					$mResult = array();

					$mResult['Calendars'] = array();
					if (is_array($aCals))
					{
						foreach ($aCals as $sKey => $oCal)
						{
							$mResult['Calendars'][$sKey] = $oCal->DisplayName;
							$aServerData = $this->oStorage->GetEvent($oAccount, $oCal->Id, $sEventId);
							if ($aServerData !== false)
							{
								$aServerData['url'] = $oCal->Id;
								break;
							}
						}
					}

					$oVCalResult = $oVCal;
					$oVEventResult = $oVEvent;

					if ($aServerData !== false)
					{
						$sCalId = $aServerData['url'];
						$oVCalServer = $aServerData['vcal'];
						if (isset($oMethod))
						{
							$oVCalServer->METHOD = $oMethod;
						}
//						$aServerVEvents = $oVCalServer->getBaseComponents('VEVENT');
						$aServerVEvents = $oVCalServer->VEVENT;
						if (count($aServerVEvents) > 0)
						{
							$oVEventServer = $aServerVEvents[0];

							if (isset($oVEvent->{'LAST-MODIFIED'}) && isset($oVEventServer->{'LAST-MODIFIED'}))
							{
								$eventLastModified = $oVEvent->{'LAST-MODIFIED'}->getDateTime();
								$srvEventLastModified = $oVEventServer->{'LAST-MODIFIED'}->getDateTime();
								if ($srvEventLastModified >= $eventLastModified)
								{
									$oVCalResult = $oVCalServer;
									$oVEventResult = $oVEventServer;
								}
								else
								{
									if (isset($sMethod))
									{
										if ($sMethod == 'REPLY')
										{
											$oVCalResult = $oVCalServer;
											$oVEventResult = $oVEventServer;
											if (isset($oVEvent->ATTENDEE))
											{
												$oAttendee = $oVEvent->ATTENDEE[0];
												$sEmail = str_replace('mailto:', '', strtolower((string)$oAttendee));
												if (isset($oVEventResult->ATTENDEE))
												{
													foreach ($oVEventResult->ATTENDEE as $oAttendeeResult)
													{
														$sEmailResult = str_replace('mailto:', '', strtolower((string)$oAttendeeResult));
														if ($sEmailResult === $sEmail)
														{
															$PARTSTAT = $oAttendee->offsetGet('PARTSTAT');
															if (isset($PARTSTAT))
															{
																$oAttendeeResult->offsetSet('PARTSTAT', (string)$PARTSTAT);
															}
															break;
														}
													}
												}
											}
											unset($oVCalResult->METHOD);
											$oVEventResult->{'LAST-MODIFIED'} = gmdate("Ymd\THis\Z");
											$this->oStorage->UpdateEventData($oAccount, $sCalId, $sEventId, $oVCalResult->serialize());
											$oVCalResult->METHOD = $sMethod;
										}
										else if ($sMethod == 'CANCEL')
										{
											$this->DeleteEvent($oAccount, $sCalId, $sEventId);
										}
									}
								}
							}
						}
					}
					$mResult['UID'] = $sEventId;
					$mResult['Body'] = $oVCalResult->serialize();
					$mResult['Action'] = $sMethod;

					$mResult['Location'] = isset($oVEventResult->LOCATION) ?
							(string)$oVEventResult->LOCATION : '';
					$mResult['Description'] = isset($oVEventResult->DESCRIPTION) ?
							(string)$oVEventResult->DESCRIPTION : '';
					$sTimeFormat = (isset($oVEventResult->DTSTART) && !$oVEventResult->DTSTART->hasTime()) ? 'D, M d' : 'D, M d, Y, H:i';
					$mResult['When'] = CCalendarHelper::GetStrDate($oVEventResult->DTSTART,
							$oAccount->GetDefaultStrTimeZone(), $sTimeFormat);
					$mResult['CalendarId'] = $sCalId;

					if (isset($oVEventResult->ATTENDEE))
					{
						foreach($oVEventResult->ATTENDEE as $oAttendee)
						{
							$sEmail = str_replace('mailto:', '', strtolower((string)$oAttendee));
							$sAccountEmail = $oAccount->Email;
							if ($sMethod === 'REPLY')
							{
								$sAccountEmail = $mFromEmail;
							}
							if ($sAccountEmail === $sEmail)
							{
								$PARTSTAT = $oAttendee->offsetGet('PARTSTAT');
								if (isset($PARTSTAT))
								{
									$mResult['Action'] = $sMethod.'-'.(string)$PARTSTAT;
								}
							}
						}
					}
				}
			}

		}
		catch (Exception $oException)
		{
			$mResult = false;
			$this->setLastException($oException);
		}

		return $mResult;
	}

	/**
	 * @param CAccount $oAccount
	 * @param string $sAction
	 * @param string $sCalendarId
	 * @param string $sData
	 */
	public function ProcessICS($oAccount, $sAction, $sCalendarId, $sData)
	{
		$iAccountId = $this->ApiUsersManager->GetDefaultAccountId($oAccount->IdUser);

		/* @var $oAccount CAccount */
		$oAccount = $this->ApiUsersManager->GetAccountById($iAccountId);

		$bResult = null;
		$sEventId = null;
		try
		{
			$bResult = false;
			$sTo = $sSubject = $sBody = $sSummary = '';

			$oVCal = \Sabre\VObject\Reader::read($sData);
			if ($oVCal)
			{
				$sMethod = $sMethodOriginal = (string)$oVCal->METHOD;
				$aVEvents = $oVCal->getBaseComponents('VEVENT');

				if (isset($aVEvents) && count($aVEvents) > 0)
				{
					$oVEvent = $aVEvents[0];
					$sEventId = (string)$oVEvent->UID;
					$bAllDay = (isset($oVEvent->DTSTART) && !$oVEvent->DTSTART->hasTime());

					if (isset($oVEvent->SUMMARY))
					{
						$sSummary = (string)$oVEvent->SUMMARY;
					}
					if (isset($oVEvent->ORGANIZER))
					{
						$sTo = str_replace('mailto:', '', strtolower((string)$oVEvent->ORGANIZER));
					}
					if (strtoupper($sMethod) === 'REQUEST')
					{
						$sMethod = 'REPLY';
						$sSubject = $sSummary;

						unset($oVEvent->ATTENDEE);
						$sPartstat = '';
						switch (strtoupper($sAction))
						{
							case 'ACCEPTED':
								$sPartstat = 'ACCEPTED';
								$sSubject .= ': Accepted';
								break;
							case 'DECLINED':
								$sPartstat = 'DECLINED';
								$sSubject .= ': Declined';
								break;
							case 'TENTATIVE':
								$sPartstat = 'TENTATIVE';
								$sSubject .= ': Tentative';
								break;
						}
						$oVEvent->add('ATTENDEE', 'mailto:'.$oAccount->Email, array(
							'CN' => $oAccount->FriendlyName,
							'PARTSTAT' => $sPartstat,
							'RESPONDED-AT' => gmdate("Ymd\THis\Z")
						));
					}

					$oVCal->METHOD = $sMethod;
					$oVEvent->{'LAST-MODIFIED'} = gmdate("Ymd\THis\Z");

					$sBody = $oVCal->serialize();

					if ($sCalendarId !== false)
					{
						unset($oVCal->METHOD);
						if (strtoupper($sAction) == 'DECLINED' || strtoupper($sMethod) == 'CANCEL')
						{
							$this->DeleteEvent($oAccount, $sCalendarId, $sEventId);
						}
						else
						{
							$this->oStorage->UpdateEventData($oAccount, $sCalendarId, $sEventId, $oVCal->serialize());
						}
					}

					if (strtoupper($sMethodOriginal) == 'REQUEST' && (strtoupper($sAction) !== 'DECLINED'))
					{
						if (!empty($sTo) && !empty($sBody))
						{
							$bResult = CCalendarHelper::SendAppointmentMessage($oAccount, $sTo, $sSubject, $sBody, $sMethod, $bAllDay);
						}
					}
					else
					{
						$bResult = true;
					}
				}
			}

			if (!$bResult)
			{
				CApi::Log('IcsProcessAppointment FALSE result!', ELogLevel::Error);
				CApi::Log('Email: '.$oAccount->Email.', Action: '. $sAction.', Data:', ELogLevel::Error);
				CApi::Log($sData, ELogLevel::Error);
			}
			else
			{
				$bResult = $sEventId;
			}

			return $bResult;
		}
		catch (Exception $oException)
		{
			$bResult = false;
			$this->setLastException($oException);
		}
		return $bResult;
	}

	public function UpdateAppointment($oAccount, $sCalendarId, $sEventId, $sAction)
	{
		$oResult = null;
		try
		{
			$aData = $this->oStorage->GetEvent($oAccount, $sCalendarId, $sEventId);
			if ($aData !== false)
			{
				$oVCal = $aData['vcal'];
				$oVCal->METHOD = 'REQUEST';
				return $this->ProcessICS($oAccount, $sAction, $sCalendarId, $oVCal->serialize());
			}
		}
		catch (Exception $oException)
		{
			$oResult = false;
			$this->setLastException($oException);
		}
		return $oResult;
	}

	/**
	 * @param CAccount $oAccount
	 * @return bool
	 */
	public function ClearAllCalendars($oAccount)
	{
		$bResult = false;
		try
		{
			$bResult = $this->oStorage->ClearAllCalendars($oAccount);
		}
		catch (CApiBaseException $oException)
		{
			$bResult = false;
			$this->setLastException($oException);
		}
		return $bResult;
	}
}
