<?php

/*
 * Copyright (C) 2002-2013 AfterLogic Corp. (www.afterlogic.com)
 * Distributed under the terms of the license described in LICENSE
 *
 */

CApi::Inc('common.db.sql');

/**
 * @package Api
 * @subpackage Db
 */
class CDbSQLite extends CDbSql
{
    /*
     * @var	resource
     */
    protected $_rConectionHandle;

    /**
     * @var	resource
     */
    protected $_rResultId;

    /**
     * @var bool
     */
    protected $bUseExplain;

    /**
     * @var bool
     */
    protected $bUseExplainExtended;

    /**
     * @var mixed
     */
    protected $_lastInsertId;

    /**
     * @param string $sHost
     */
    public function __construct($sHost)
    {
        $this->sHost = trim($sHost);

        $this->_rConectionHandle = null;
        $this->_rResultId = null;

        $this->iExecuteCount = 0;
        $this->bUseExplain = CApi::GetConf('labs.db.use-explain', false);
        $this->bUseExplainExtended = CApi::GetConf('labs.db.use-explain-extended', false);
    }

    /**
     * @return bool
     */
    function IsConnected()
    {
        return is_resource($this->_rConectionHandle);
    }

    /**
     * @param string $sHost
     */
    public function ReInitIfNotConnected($sHost)
    {
        if (!$this->IsConnected())
        {
            $this->sHost = trim($sHost);
        }
    }

    /**
     * @param bool $bWithSelect = true
     * @return bool
     */
    public function Connect($bWithSelect = true, $bNewLink = false)
    {
        if (!class_exists('SQLite3')) {
            throw new CApiDbException('Can\'t load SQLite extension.', 0);
        }

        if (strlen($this->sHost) == 0) {
            throw new CApiDbException('Not enough details required to establish connection.', 0);
        }

        if (CApi::$bUseDbLog) {
            CApi::Log('DB(sqlite) : start connect to '.$this->sHost);
        }

        if ($this->_rConectionHandle) {
            $this->Disconnect();
        }

        $this->_rConectionHandle = new SQLite3(CApi::DataPath() . DIRECTORY_SEPARATOR . $this->sHost);

        if ($this->_rConectionHandle) {
            if (CApi::$bUseDbLog) {
                CApi::Log('DB : connected to '.$this->sHost);
            }

            register_shutdown_function(array(&$this, 'Disconnect'));
            return true;
        } else {
            CApi::Log('DB : connect to '.$this->sHost.' failed', ELogLevel::Error);
            $this->_setSqlError();
            return false;
        }
    }

    /**
     * @return bool
     */
    public function ConnectNoSelect()
    {
        return $this->Connect(false);
    }

    /**
     * @return bool
     */
    public function Select()
    {
        return true;
    }

    /**
     * @return bool
     */
    public function Disconnect()
    {
        if ($this->_rConectionHandle) {
            if (CApi::$bUseDbLog) {
                CApi::Log('DB : disconnect from '.$this->sHost);
            }

            $result = $this->_rConectionHandle->close();
            unset($this->_rConectionHandle);
            $this->_rConectionHandle = null;

            return $result;
        } else {
            return false;
        }
    }

    /**
     * @param string $sQuery
     * @param string $bIsSlaveExecute = false
     * @return bool
     */
    public function Execute($sQuery, $bIsSlaveExecute = false)
    {
        $this->Connect();

        $sExplainLog = '';
        $sQuery = trim($sQuery);

        if (($this->bUseExplain || $this->bUseExplainExtended) && 0 === strpos($sQuery, 'SELECT'))
        {
            $sExplainQuery = 'EXPLAIN ';
            $sExplainQuery .= ($this->bUseExplainExtended) ? 'extended '.$sQuery : $sQuery;

            $rExplainResult = $this->_rConectionHandle->query($sExplainQuery);
            while (false != ($mResult = $rExplainResult->fetchArray(SQLITE3_ASSOC)))
            {
                $sExplainLog .= API_CRLF.print_r($mResult, true);
            }
        }

        $this->iExecuteCount++;
        $this->log($sQuery, $bIsSlaveExecute);
        if (!empty($sExplainLog))
        {
            $this->log('EXPLAIN:'.API_CRLF.trim($sExplainLog), $bIsSlaveExecute);
        }

        $this->_rResultId = $this->_rConectionHandle->query($sQuery);

        if ($this->_rResultId === false)
        {
            $this->_setSqlError();
        }

        if ($this->_lastInsertId = $this->_rConectionHandle->lastInsertRowID()) {
            $this->Disconnect();
        }

        return ($this->_rResultId !== false);
    }

    /**
     * @param bool $bAutoFree = true
     * @return &object
     */
    public function GetNextRecord($bAutoFree = true)
    {
        if ($this->_rResultId)
        {
            $mResult = $this->_rResultId->fetchArray(SQLITE3_ASSOC);
            if (!$mResult && $bAutoFree)
            {
                $this->FreeResult();
            }

            return json_decode(json_encode($mResult), false);
        }
        else
        {
            $nNull = false;
            $this->_setSqlError();
            $this->Disconnect();
            return $nNull;
        }
    }

    /**
     * @param bool $bAutoFree = true
     * @return &array
     */
    public function &GetNextArrayRecord($bAutoFree = true)
    {
        if ($this->_rResultId)
        {
            $mResult = $this->_rResultId->fetchArray(SQLITE3_ASSOC);
            if (!$mResult && $bAutoFree)
            {
                $this->FreeResult();
            }
            return $mResult;
        }
        else
        {
            $nNull = false;
            $this->_setSqlError();
            return $nNull;
        }
    }

    /**
     * @return int
     */
    public function GetLastInsertId()
    {
        return $this->_lastInsertId;
    }

    /**
     * @return array
     */
    public function GetTableNames()
    {
        if (!$this->Execute('SELECT name FROM sqlite_master WHERE type = "table"'))
        {
            return false;
        }

        $aResult = array();
        while (false !== ($aValue = $this->GetNextArrayRecord()))
        {
            foreach ($aValue as $sValue)
            {
                $aResult[] = $sValue;
                break;
            }
        }

        return $aResult;
    }

    /**
     * @param string $sTableName
     * @return array
     */
    public function GetTableFields($sTableName)
    {
        if (!$this->Execute('PRAGMA table_info(`'.$sTableName.'`)'))
        {
            return false;
        }

        $aResult = array();
        while (false !== ($oValue = $this->GetNextRecord()))
        {
            if ($oValue && $oValue->name && 0 < strlen($oValue->name))
            {
                $aResult[] = $oValue->name;
            }
        }

        return $aResult;
    }

    /**
     * @param string $sTableName
     * @return array
     */
    public function GetTableIndexes($sTableName)
    {
        return false;
    }

    /**
     * @return bool
     */
    public function FreeResult()
    {
        $this->_rResultId = null;

        return true;
    }

    /**
     * @return int
     */
    public function ResultCount()
    {
        return $this->_rResultId->numRows();
    }

    /**
     * @return void
     */
    private function _setSqlError()
    {
        if ($this->IsConnected())
        {
            $this->ErrorCode = $this->_rConectionHandle->lastErrorCode();
            $this->ErrorDesc = $this->_rConectionHandle->lastErrorMsg();
        }
        else
        {
            $this->ErrorDesc = null;
            $this->ErrorCode = null;
        }

        if (0 < strlen($this->ErrorDesc))
        {
            $this->errorLog($this->ErrorDesc);
            throw new CApiDbException($this->ErrorDesc, $this->ErrorCode);
        }
    }
}
