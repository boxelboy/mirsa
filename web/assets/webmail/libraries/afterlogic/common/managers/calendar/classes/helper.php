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
class CCalendarHelper
{

	public static function GetReminderOffset($sValue)
	{
        $sValue = str_replace('-', '', $sValue);
		$oInterval = new DateInterval($sValue);

		return ($oInterval->s)+($oInterval->i*60)+($oInterval->h*60*60)+
				($oInterval->d*60*60*24)+($oInterval->m*60*60*24*30)+
					($oInterval->y*60*60*24*365);
	}

	public static function GetActualReminderTime($oEvent, $oNowDT, $oStartDT)
	{
		$aReminders = CalendarParser::ParseAlarms($oEvent);

		$iNowTS = $oNowDT->getTimestamp();

		$iStartEventTS = $oStartDT->getTimestamp();

		$aRemindersTime = array();
		foreach ($aReminders as $iReminder)
		{
			$aRemindersTime[] = $iStartEventTS - $iReminder * 60;
		}
		sort($aRemindersTime);
		foreach ($aRemindersTime as $iReminder)
		{
			if ($iReminder > $iNowTS)
			{
				return $iReminder;
			}
		}
		return false;
	}

	public static function getNextRepeat(DateTime $sDtStart, $oVCal, $sUid = null)
	{
		$oRecur = new \Sabre\VObject\RecurrenceIterator($oVCal, $sUid);
		$oRecur->fastForward($sDtStart);
		return $oRecur->currentDate;
	}

	/**
	 * @param int $iData
	 * @param int $iMin
	 * @param int $iMax
	 * @return bool
	 */
	public static function validate($iData, $iMin, $iMax)
	{
		if (null === $iData) return false;
		$iData = round($iData);
		return (isset($iMin) && isset($iMax)) ? ($iMin <= $iData && $iData <= $iMax) : ($iData > 0);
	}

	public static function PrepareDateTime($mDateTime, $sTimeZone, $bAllday = false, $bEndTime = false)
	{
		$oDateTime = $mDateTime;
		if (is_numeric($mDateTime) && strlen($mDateTime) !== 8)
		{
			$oDateTime = new \DateTime();
			$oDateTime->setTimestamp($mDateTime);
		}	
		else
		{
			$oDateTime = \Sabre\VObject\DateTimeParser::parse($mDateTime);
		}
		if ($bAllday)
		{
			$oDateTime->setTimezone(new DateTimeZone($sTimeZone));
			if ($bEndTime)
			{
				$oDateTime->add(new DateInterval('P1D'));
			}
		}

		return $oDateTime;
	}

	public static function GetDateTime($dt, $sTimeZone = 'UTC')
	{
		$result = null;
		if ($dt)
		{
			$result = $dt->getDateTime();
		}
		if (isset($result))
		{
			$result->setTimezone(new DateTimeZone($sTimeZone));
		}
		return $result;
	}

	public static function GetStrDate($dt, $sTimeZone, $format = 'Y-m-d H:i:s')
	{
		$result = null;
		$oDateTime = self::GetDateTime($dt, $sTimeZone);
		if ($oDateTime)
		{
			$result = $oDateTime->format($format);
		}
		return $result;
	}

	public static function DateTimeToStr($dt, $format = 'Y-m-d H:i:s')
	{
		return $dt->format($format);
	}

	public static function isRecurrenceExists($oVEvent, $sRecurrenceId)
	{
		$mResult = false;
		foreach($oVEvent as $mKey => $oEvent)
		{
			if (isset($oEvent->{'RECURRENCE-ID'}))
			{
				$recurrenceId = (string) $oEvent->{'RECURRENCE-ID'};

				if ($recurrenceId === $sRecurrenceId)
				{
					$mResult = $mKey;
					break;
				}
			}
		}

		return $mResult;
	}

    /**
	 * @param string $sOffset
	 * @return string
	 */
	public static function GetOffsetInMinutes($sOffset)
	{
 		$aIntervals = array(5,10,15,30,60,120,180,240,300,360,420,480,540,600,660,720,1080,1440,2880,4320,5760,10080,20160);
		$iMinutes = 0;
		try
		{
			$oInterval = new DateInterval(ltrim($sOffset, '-'));
			$iMinutes = $oInterval->i + $oInterval->h*60 + $oInterval->d*24*60;
		}
		catch (Exception $ex)
		{
			$iMinutes = 15;
		}
		if (!in_array($iMinutes, $aIntervals))
		{
			$iMinutes = 15;
		}

		return $iMinutes;
	}

    /**
	 * @param string $sOffset
	 * @return string
	 */
	public static function GetOffsetInStr($iMinutes)
	{
		return '-PT' . $iMinutes . 'M';
	}

	public static function GetBaseVEventIndex($oVEvents)
	{
		$iIndex = -1;
		foreach($oVEvents as $oVEvent)
		{
			$iIndex++;
			if (empty($oVEvent->{'RECURRENCE-ID'})) break;
		}
		return ($iIndex >= 0) ? $iIndex : false;
	}

	/**
	 * @param CAccount $oAccount
	 * @param string $sTo
	 * @param string $sSubject
	 * @param string $sBody
	 * @param string $sMethod = null
	 * @param bool $bAllDay = false
	 * @return WebMailMessage
	 */
	public static function BuildAppointmentMessage($oAccount, $sTo, $sSubject, $sBody, $sMethod = null, $bAllDay = false)
	{
		$oMessage = null;
		if ($oAccount && !empty($sTo) && !empty($sBody))
		{
			$oMessage = \MailSo\Mime\Message::NewInstance();
			$oMessage->RegenerateMessageId();
			$oMessage->DoesNotCreateEmptyTextPart();

			$sXMailer = \CApi::GetConf('webmail.xmailer-value', '');
			if (0 < strlen($sXMailer))
			{
				$oMessage->SetXMailer($sXMailer);
			}

			$oMessage
				->SetFrom(\MailSo\Mime\Email::NewInstance($oAccount->Email))
				->SetSubject($sSubject)
			;

			$oToEmails = \MailSo\Mime\EmailCollection::NewInstance($sTo);
			if ($oToEmails && $oToEmails->Count())
			{
				$oMessage->SetTo($oToEmails);
			}
			
			if ($sMethod)
			{
				$oMessage->SetCustomHeader('Method', $sMethod);
			}

			$oMessage->Attachments()->Add(
				\MailSo\Mime\Attachment::NewInstance(
					\MailSo\Base\ResourceRegistry::CreateMemoryResourceFromString($sBody), 'invite.ics', strlen($sBody),
						false, false, '', null === $sMethod ? array() : array('method' => $sMethod))
			);
		}

		return $oMessage;
	}

	/**
	 * @param \CAccount $oAccount
	 * @param string $sTo
	 * @param string $sSubject
	 * @param string $sBody
	 * @param string $sMethod
	 * @param bool $bAllDay
	 * @return WebMailMessage
	 */
	public static function SendAppointmentMessage($oAccount, $sTo, $sSubject, $sBody, $sMethod, $bAllDay = false)
	{
		$oMessage = self::BuildAppointmentMessage($oAccount, $sTo, $sSubject, $sBody, $sMethod, $bAllDay);

		CApi::Plugin()->RunHook('webmail-change-appointment-message-before-send',
			array(&$oMessage, &$oAccount));

		if ($oMessage)
		{
			try
			{
				$oApiMail = CApi::Manager('mail');
				CApi::Log('IcsProcessAppointmentSendOriginalMailMessage');
				return $oApiMail ? $oApiMail->MessageSend($oAccount, $oMessage) : false;
			}
			catch (\CApiManagerException $oException)
			{
				$iCode = \ProjectSeven\Notifications::CanNotSendMessage;
				switch ($oException->getCode())
				{
					case Errs::Mail_InvalidRecipients:
						$iCode = \ProjectSeven\Notifications::InvalidRecipients;
						break;
				}

				throw new \ProjectSeven\Exceptions\ClientException($iCode, $oException);
			}
		}

		return false;
	}

	/**
	 * @param \CAccount $oAccount
	 * @param \CEvent $oEvent
	 * @param \Sabre\VObject\Component\VEvent $oVEvent
	 */
	public static function PopulateVCalendar($oAccount, $oEvent, &$oVEvent)
	{
		unset($oVEvent->{'LAST-MODIFIED'});
		$oVEvent->add('LAST-MODIFIED',  new \DateTime('now'));

		$oVCal =& $oVEvent->parent;

		$oVEvent->UID = $oEvent->Id;

		if (!empty($oEvent->Start) && !empty($oEvent->End))
		{
			$oDTStart = self::PrepareDateTime(
				$oEvent->Start,
				$oAccount->GetDefaultStrTimeZone(),
				$oEvent->AllDay
			);
			$oDTEnd = self::PrepareDateTime(
				$oEvent->End,
				$oAccount->GetDefaultStrTimeZone(),
				$oEvent->AllDay,
				true
			);
			$aDateTimeValue = ($oEvent->AllDay) ? array('VALUE' => 'DATE') : array();
			$sDateTimeFormat = ($oEvent->AllDay) ? 'Ymd' : 'Ymd\\THis\\Z';

			if (isset($oDTStart))
			{
				unset($oVEvent->DTSTART);
				$oVEvent->add('DTSTART', $oDTStart->format($sDateTimeFormat), $aDateTimeValue);
			}
			if (isset($oDTEnd))
			{
				unset($oVEvent->DTEND);
				$oVEvent->add('DTEND', $oDTEnd->format($sDateTimeFormat), $aDateTimeValue);
			}
		}

		if (isset($oEvent->Name))
		{
			$oVEvent->SUMMARY = $oEvent->Name;
		}
		if (isset($oEvent->Description))
		{
			$oVEvent->DESCRIPTION = $oEvent->Description;
		}
		if (isset($oEvent->Location))
		{
			$oVEvent->LOCATION = $oEvent->Location;
		}

		unset($oVEvent->RRULE);
		if (isset($oEvent->RRule))
		{
			$sRRULE = '';
			if (isset($oVEvent->RRULE) && null === $oEvent->RRule)
			{
				$oRRule = CalendarParser::ParseRRule($oAccount, $oVCal, (string)$oVEvent->UID);
				if ($oRRule && $oRRule instanceof \CRRule)
				{
					$sRRULE = (string) $oRRule;
				}
			}
			else
			{
				$sRRULE = (string)$oEvent->RRule;
			}
			if (trim($sRRULE) !== '')
			{
				$oVEvent->add('RRULE', $sRRULE);
			}
		}

		unset($oVEvent->VALARM);
		if (isset($oEvent->Alarms))
		{
			foreach ($oEvent->Alarms as $sOffset)
			{
				$oVEvent->add('VALARM', array(
					'TRIGGER' => self::GetOffsetInStr($sOffset),
					'DESCRIPTION' => 'Alarm',
					'ACTION' => 'DISPLAY'
				));
			}
		}

		$ApiCapabilityManager = CApi::Manager('capability');
		if ($ApiCapabilityManager->IsCalendarAppointmentsSupported($oAccount))
		{
			$aAttendees = array();
			$aAttendeeEmails = array();
			$aObjAttendees = array();
			if (isset($oVEvent->ATTENDEE))
			{
				$aAttendeeEmails = array_map(function ($aItem) {
					return $aItem['email'];
				}, $oEvent->Attendees);
				
				$aObjAttendees = $oVEvent->ATTENDEE;
				unset($oVEvent->ATTENDEE);
				foreach($aObjAttendees as $oAttendee)
				{
					$sAttendee = str_replace('mailto:', '', strtolower((string)$oAttendee));
					if (in_array($sAttendee, $aAttendeeEmails))
					{
						$oVEvent->add($oAttendee);
						$aAttendees[] = $sAttendee;
					}
					else
					{
						$oPartstat = $oAttendee->offsetGet('PARTSTAT');
						if (!isset($oPartstat) || (isset($oPartstat) && (string)$oPartstat != 'DECLINED'))
						{
							$oVCal->METHOD = 'CANCEL';
							$sSubject = (string)$oVEvent->SUMMARY . ': Canceled';
							self::SendAppointmentMessage($oAccount, $sAttendee, $sSubject, $oVCal->serialize(), (string)$oVCal->METHOD);
							unset($oVCal->METHOD);
						}
					}
				}
			}
			
			if (count($oEvent->Attendees) > 0)
			{
				$oVEvent->ORGANIZER = 'mailto:' . $oAccount->Email;
				foreach($oEvent->Attendees as $oAttendee)
				{
					if (!in_array($oAttendee['email'], $aAttendees))
					{
						$oVEvent->add('ATTENDEE', 'mailto:' . $oAttendee['email'], array('CN'=>$oAttendee['name']));
					}
				}
			}
			else 
			{
				unset($oVEvent->ORGANIZER);
			}

			if (isset($oVEvent->ATTENDEE))
			{
				foreach($oVEvent->ATTENDEE as $oAttendee)
				{
					$sAttendee = str_replace('mailto:', '', strtolower((string)$oAttendee));
					if (!isset($oAttendee['PARTSTAT']) || (isset($oAttendee['PARTSTAT']) && (string)$oAttendee['PARTSTAT'] !== 'DECLINED'))
					{
						$oAttendee['PARTSTAT'] = 'NEEDS-ACTION';
						$oAttendee['RSVP'] = 'TRUE';

						$oVCal->METHOD = 'REQUEST';
						self::SendAppointmentMessage($oAccount, $sAttendee, (string)$oVEvent->SUMMARY, $oVCal->serialize(), (string)$oVCal->METHOD);
						unset($oVCal->METHOD);
					}
				}
			}
		}
	}

}