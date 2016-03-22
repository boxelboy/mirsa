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
class CalendarParser
{
	public static function ParseEvent($oAccount, $oCalendar, $oVCal, $oVCalOriginal = null)
	{
		$ApiCapabilityManager = CApi::Manager('capability');
		$ApiUsersManager = CApi::Manager('users');

		$aResult = array();
		$aRules = array();
		$aExcludedRecurrenceIds = array();
		
		if (isset($oVCalOriginal))
		{
			$aRules = CalendarParser::GetRRules($oAccount, $oVCalOriginal);
			$aExcludedRecurrenceIds = CalendarParser::GetExcludedRecurrenceIds($oVCalOriginal);
		}

		if (isset($oVCal, $oVCal->VEVENT))
		{
			foreach ($oVCal->VEVENT as $oVEvent)
			{
				$sOwnerEmail = $oCalendar->Owner;
				$aEvent = array();
				if (isset($oVEvent, $oVEvent->UID))
				{
					$bIsAppointment = false;
					$aEvent['attendees'] = array();
					if ($ApiCapabilityManager->IsCalendarAppointmentsSupported($oAccount) && isset($oVEvent->ATTENDEE))
					{
						$aEvent['attendees'] = self::ParseAttendees($oVEvent);

						if (isset($oVEvent->ORGANIZER))
						{
							$sOwnerEmail = str_replace('mailto:', '', strtolower((string)$oVEvent->ORGANIZER));
						}
						$bIsAppointment = ($sOwnerEmail !== $oAccount->Email);
					}
					
					$sOwnerName = '';
					$oOwner = $ApiUsersManager->GetAccountOnLogin($sOwnerEmail);
					if ($oOwner)
					{
						$sOwnerName = $oOwner->FriendlyName;
					}
					
					$aEvent['appointment'] = $bIsAppointment;
					$aEvent['appointmentAccess'] = 0;
					
					$aEvent['alarms'] = self::ParseAlarms($oVEvent);
					$sTimeZone = $oAccount->GetDefaultStrTimeZone();

					$bAllDay = (isset($oVEvent->DTSTART) && !$oVEvent->DTSTART->hasTime());
					
					if ($bAllDay)
					{
						$sTimeZone = 'UTC';
					}

					$sStart = CCalendarHelper::GetStrDate($oVEvent->DTSTART, $sTimeZone);
					$sEnd = CCalendarHelper::GetStrDate($oVEvent->DTEND, $sTimeZone);

					if ($bAllDay)
					{
						$oDTEnd = CCalendarHelper::GetDateTime($oVEvent->DTEND, $sTimeZone);
						$oDTEnd->sub(new DateInterval('P1D'));
						$sEnd = CCalendarHelper::DateTimeToStr($oDTEnd);
					}

					$aEvent['calendarId'] = $oCalendar->Id;
					$aEvent['uid'] = (string)$oVEvent->UID;
					$aEvent['subject'] = $oVEvent->SUMMARY ? (string)$oVEvent->SUMMARY : '';
					$aDescription = $oVEvent->DESCRIPTION ? \Sabre\VObject\Parser\MimeDir::unescapeValue((string)$oVEvent->DESCRIPTION) : array('');
					$aEvent['description'] = $aDescription[0];
					$aEvent['location'] = $oVEvent->LOCATION ? (string)$oVEvent->LOCATION : '';
					$aEvent['start'] = /*$oDTStart->getTimestamp()*/$sStart;
					$aEvent['end'] = /*($oDTEnd) ? $oDTEnd->getTimestamp() : null*/$sEnd;
					$aEvent['allDay'] = $bAllDay;
					$aEvent['owner'] = $sOwnerEmail;
					$aEvent['ownerName'] = $sOwnerName;
					$aEvent['modified'] = false;
					if ($oVEvent->{'RECURRENCE-ID'})
					{
						$aEvent['recurrenceId'] = (string)$oVEvent->{'RECURRENCE-ID'};
					}
					else
					{
						$aEvent['recurrenceId'] = (string)$oVEvent->DTSTART;
					}
					$aEvent['id'] = $aEvent['uid'] . '-' . $aEvent['recurrenceId'];
					
					if (isset($aEvent['uid'], $aRules[$aEvent['uid']]))
					{
						$aEvent['rrule'] = $aRules[$aEvent['uid']]->toArray();
					}
					if (in_array($aEvent['id'], $aExcludedRecurrenceIds))
					{
						$aEvent['excluded'] = true;
					}
				}
				
				$aResult[] = $aEvent;
			}
		}

		return $aResult;
	}
	
	public static function ParseAlarms($oVEvent)
	{
		$aResult = array();
		
		if ($oVEvent->VALARM)
		{
			foreach($oVEvent->VALARM as $oVAlarm)
			{
				if (isset($oVAlarm->TRIGGER))
				{
					$aResult[] = CCalendarHelper::GetOffsetInMinutes((string)$oVAlarm->TRIGGER);
				}
			}
			rsort($aResult);
		}	
		
		return $aResult;
	}

	public static function ParseAttendees($oVEvent)
	{
		$aResult = array();
		
		if (isset($oVEvent->ATTENDEE))
		{
			foreach($oVEvent->ATTENDEE as $oAttendee)
			{
				$iStatus = \EAttendeeStatus::Unknown;
				if (isset($oAttendee['PARTSTAT']))
				{
					switch (strtoupper((string)$oAttendee['PARTSTAT']))
					{
						case 'ACCEPTED':
							$iStatus = \EAttendeeStatus::Accepted;
							break;
						case 'DECLINED':
							$iStatus = \EAttendeeStatus::Declined;
							break;
						case 'TENTATIVE':
							$iStatus = \EAttendeeStatus::Tentative;;
							break;
					}
				}

				$sEmail = str_replace('mailto:', '', strtolower($oAttendee->getValue()));
				if (isset($oAttendee['EMAIL']))
				{
					$sEmail = (string)$oAttendee['EMAIL'];
				}
				$sName = isset($oAttendee['CN']) ? (string)$oAttendee['CN'] : '';

				$aResult[] = array(
					'access' => 0,
					'email' => $sEmail,
					'name' => $sName,
					'status' => $iStatus
				);
			}
		}
		return $aResult;
	}
	
	public static function ParseRRule($oAccount, $oVCal, $sUid)
	{
		$oResult = null;

		$aPeriods = array(
			EPeriod::Secondly,
			EPeriod::Minutely,
			EPeriod::Hourly,
			EPeriod::Daily,
			EPeriod::Weekly,
			EPeriod::Monthly,
			EPeriod::Yearly
		);
		
		$oRecurrence = new \Sabre\VObject\RecurrenceIterator($oVCal, $sUid);

		if (isset($oRecurrence))
		{
			$oResult = new \CRRule($oAccount);
			
			if (isset($oRecurrence->frequency))
			{
				$bIsPosiblePeriod = array_search($oRecurrence->frequency, $aPeriods);
				if ($bIsPosiblePeriod !== false)
				{
					$oResult->Period = $bIsPosiblePeriod - 2;
				}
			}
			if (isset($oRecurrence->bySetPos))
			{
				$oResult->WeekNum = $oRecurrence->bySetPos;
			}
			if (isset($oRecurrence->interval))
			{
				$oResult->Interval = $oRecurrence->interval;
			}
			if (isset($oRecurrence->count))
			{
				$oResult->Count = $oRecurrence->count;
			}
			if (isset($oRecurrence->until))
			{
				$oResult->Until = $oRecurrence->until->format('U');
			}
			if (isset($oResult->Count))
			{
				$oResult->End = 1;
			}
			if (isset($oResult->Until))
			{
				$oResult->End = 2;
			}
			if (isset($oRecurrence->byDay))
			{
				foreach ($oRecurrence->byDay as $sDay)
				{
					if (strlen($sDay) > 2)
					{
						$iNum = (int)substr($sDay, 0, -2);

						if ($iNum === 1) $oResult->WeekNum = 0;
						if ($iNum === 2) $oResult->WeekNum = 1;
						if ($iNum === 3) $oResult->WeekNum = 2;
						if ($iNum === 4) $oResult->WeekNum = 3;
						if ($iNum === -1) $oResult->WeekNum = 4;
					}

					if (strpos($sDay, 'SU') !== false) $oResult->ByDays[] = 'SU';
					if (strpos($sDay, 'MO') !== false) $oResult->ByDays[] = 'MO';
					if (strpos($sDay, 'TU') !== false) $oResult->ByDays[] = 'TU';
					if (strpos($sDay, 'WE') !== false) $oResult->ByDays[] = 'WE';
					if (strpos($sDay, 'TH') !== false) $oResult->ByDays[] = 'TH';
					if (strpos($sDay, 'FR') !== false) $oResult->ByDays[] = 'FR';
					if (strpos($sDay, 'SA') !== false) $oResult->ByDays[] = 'SA';
				}
			}
		}
		return $oResult;
	}	
	
	public static function GetRRules($oAccount, $oVCal)
	{
		$aResult = array();
		
		foreach($oVCal->getBaseComponents('VEVENT') as $oVEvent)
		{
			if (isset($oVEvent->RRULE))
			{
				$oRRule = CalendarParser::ParseRRule($oAccount, $oVCal, (string)$oVEvent->UID);
				if ($oRRule)
				{
					$sTimeZone = $oAccount->GetDefaultStrTimeZone();
					$oDTStart = CCalendarHelper::GetDateTime($oVEvent->DTSTART, $sTimeZone);
					$oDTEnd = CCalendarHelper::GetDateTime($oVEvent->DTEND, $sTimeZone);

					$bAllDay = (isset($oVEvent->DTSTART) && !$oVEvent->DTSTART->hasTime());
					if ($bAllDay && isset($oDTEnd))
					{
						$oDTEnd->sub(new DateInterval('P1D'));
					}
					$oRRule->StartBase = $oDTStart->getTimestamp();
					if (isset($oDTEnd))
					{
						$oRRule->EndBase = $oDTEnd->getTimestamp();
					}
					
					$aResult[(string)$oVEvent->UID] = $oRRule;
				}
			}
		}
		
		return $aResult;
	}	
	
	public static function GetExcludedRecurrenceIds($oVCal)
	{
        $aRecurrences = array();
        foreach($oVCal->children as $component) {

            if (!$component instanceof \Sabre\VObject\Component)
                continue;

            if (isset($component->{'RECURRENCE-ID'}))
			{
                $aRecurrences[] = (string)$component->UID . '-' . (string)$component->{'RECURRENCE-ID'};
			}
        }

        return $aRecurrences;
	}
}