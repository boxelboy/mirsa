<?php

/*
 * Copyright (C) 2002-2013 AfterLogic Corp. (www.afterlogic.com)
 * Distributed under the terms of the license described in LICENSE
 *
 */

CApi::Inc('common.db.helper');

/**
 * @package Api
 * @subpackage Db
 */
class CMySqlHelper implements IDbHelper
{
	/**
	 * @param string $sValue
	 * @param bool $bWithOutQuote = false
	 * @param bool $bSearch = false
	 * @return string
	 */
	public function EscapeString($sValue, $bWithOutQuote = false, $bSearch = false)
	{
		$sResult = '';
		if ($bWithOutQuote)
		{
			$sResult = addslashes($sValue);
		}
		else
		{
			$sResult = 0 === strlen($sValue) ? '\'\'' : '\''.addslashes($sValue).'\'';
		}

		if ($bSearch)
		{
			$sResult = str_replace(array("%", "_"), array("\\%", "\\_"), $sResult);
		}

		return $sResult;
	}

	/**
	 * @param string $sValue
	 * @return string
	 */
	public function EscapeColumn($sValue)
	{
		return 0 === strlen($sValue) ? $sValue : '`'.$sValue.'`';
	}

	/**
	 * @param int $iTimeStamp
	 * @param bool $bAsInsert = false
	 * @return string
	 */
	public function TimeStampToDateFormat($iTimeStamp, $bAsInsert = false)
	{
		$sResult = (string) gmdate('Y-m-d H:i:s', $iTimeStamp);
		return ($bAsInsert) ? $this->UpdateDateFormat($sResult) : $sResult;
	}

	/**
	 * @param string $sFieldName
	 * @return string
	 */
	public function GetDateFormat($sFieldName)
	{
		return 'DATE_FORMAT('.$sFieldName.', "%Y-%m-%d %T")';
	}

	/**
	 * @param string $sFieldName
	 * @return string
	 */
	public function UpdateDateFormat($sFieldName)
	{
		return $this->EscapeString($sFieldName);
	}

	/**
	 * @return string
	 */
	public function CreateTableLastLine()
	{
		return '/*!40101 DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci */';
	}

    /**
     * @return string
     */
    public function GetAutoIncrementDefinition()
    {
        return 'auto_increment';
    }

    /**
     * @return string
     */
    public function GetUnsignedDefinition()
    {
        return 'UNSIGNED';
    }

    /**
     * @return bool
     */
    public function DeclareKeys()
    {
        return true;
    }
}
