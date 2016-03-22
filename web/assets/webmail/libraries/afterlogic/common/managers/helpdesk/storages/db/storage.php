<?php

/*
 * Copyright (C) 2002-2013 AfterLogic Corp. (www.afterlogic.com)
 * Distributed under the terms of the license described in LICENSE
 *
 */

/**
 * @package Helpdesk
 */
class CApiHelpdeskDbStorage extends CApiHelpdeskStorage
{
	/**
	 * @var CDbStorage $oConnection
	 */
	protected $oConnection;

	/**
	 * @var CApiHelpdeskCommandCreatorMySQL
	 */
	protected $oCommandCreator;

	/**
	 * @param CApiGlobalManager &$oManager
	 */
	public function __construct(CApiGlobalManager &$oManager)
	{
		parent::__construct('db', $oManager);

		$this->oConnection =& $oManager->GetConnection();
		$this->oCommandCreator =& $oManager->GetCommandCreator(
			$this, array(EDbType::MySQL => 'CApiHelpdeskCommandCreatorMySQL', EDbType::SQLite => 'CApiHelpdeskCommandCreatorSQLite')
		);
	}

	/**
	 * @param string $sSql
	 * @return CHelpdeskUser
	 */
	protected function getUserBySql($sSql)
	{
		$oUser = false;
		if ($this->oConnection->Execute($sSql))
		{
			$oUser = null;

			$oRow = $this->oConnection->GetNextRecord();
			if ($oRow)
			{
				$oUser = new CHelpdeskUser();
				$oUser->InitByDbRow($oRow);
			}
		}

		$this->throwDbExceptionIfExist();
		return $oUser;
	}

	/**
	 * @param CHelpdeskUser $oHelpdeskUser
	 * @return bool
	 */
	public function CreateUser(CHelpdeskUser &$oHelpdeskUser)
	{
		$bResult = false;
		if ($this->oConnection->Execute($this->oCommandCreator->CreateUser($oHelpdeskUser)))
		{
			$oHelpdeskUser->IdHelpdeskUser = $this->oConnection->GetLastInsertId();
			$bResult = true;
		}

		$this->throwDbExceptionIfExist();
		return $bResult;
	}

	/**
	 * @param int $iIdTenant
	 * @param int $iHelpdeskUserId
	 * @return CHelpdeskUser|false
	 */
	public function GetUserById($iIdTenant, $iHelpdeskUserId)
	{
		return $this->getUserBySql($this->oCommandCreator->GetUserById($iIdTenant, $iHelpdeskUserId));
	}

	/**
	 * @param int $iIdTenant
	 * @param string $sEmail
	 * @return CHelpdeskUser|null|false
	 */
	public function GetUserByEmail($iIdTenant, $sEmail)
	{
		return $this->getUserBySql($this->oCommandCreator->GetUserByEmail($iIdTenant, $sEmail));
	}

	/**
	 * @param int $iIdTenant
	 * @param string $sActivateHash
	 *
	 * @return CHelpdeskUser|false
	 */
	public function GetUserByActivateHash($iIdTenant, $sActivateHash)
	{
		return $this->getUserBySql($this->oCommandCreator->GetUserByActivateHash($iIdTenant, $sActivateHash));
	}

	/**
	 * @param int $iIdTenant
	 * @param array $aExcludeEmails = array()
	 *
	 * @return array
	 */
	public function GetAgentsEmailsForNotification($iIdTenant, $aExcludeEmails = array())
	{
		$aResult = false;
		if ($this->oConnection->Execute($this->oCommandCreator->GetAgentsEmailsForNotification($iIdTenant)))
		{
			while (false !== ($oRow = $this->oConnection->GetNextRecord()))
			{
				if ($oRow && !in_array(strtolower($oRow->email), $aExcludeEmails))
				{
					$aResult[] = $oRow->email;
				}
			}
		}
		$this->throwDbExceptionIfExist();
		return $aResult;
	}

	/**
	 * @param CHelpdeskUser $oHelpdeskUser
	 * @return bool
	 */
	public function UserExists(CHelpdeskUser $oHelpdeskUser)
	{
		$bResult = false;
		if ($this->oConnection->Execute($this->oCommandCreator->UserExists($oHelpdeskUser)))
		{
			$oRow = $this->oConnection->GetNextRecord();
			if ($oRow && 0 < (int) $oRow->item_count)
			{
				$bResult = true;
			}
		}
		$this->throwDbExceptionIfExist();
		return $bResult;
	}

	/**
	 * @param CHelpdeskUser $oHelpdeskUser
	 * @param array $aIdList
	 *
	 * @return array|bool
	 */
	public function UserInformation(CHelpdeskUser $oHelpdeskUser, $aIdList)
	{
		$mResult = false;
		if ($this->oConnection->Execute($this->oCommandCreator->UserInformation($oHelpdeskUser, $aIdList)))
		{
			$mResult = array();
			while (false !== ($oRow = $this->oConnection->GetNextRecord()))
			{
				if ($oRow && 0 < (int) $oRow->id_helpdesk_user)
				{
					$mResult[(int) $oRow->id_helpdesk_user] = array($oRow->email, $oRow->name, '1' === (string) $oRow->is_agent);
				}
			}
		}

		$this->throwDbExceptionIfExist();
		return $mResult;
	}

	/**
	 * @param CHelpdeskUser $oHelpdeskUser
	 * @return bool
	 */
	public function UpdateUser(CHelpdeskUser $oHelpdeskUser)
	{
		$bResult = $this->oConnection->Execute($this->oCommandCreator->UpdateUser($oHelpdeskUser));
		$this->throwDbExceptionIfExist();
		return $bResult;
	}

	/**
	 * @param int $iIdTenant
	 * @param int $iIdHelpdeskUser
	 * @return bool
	 */
	public function SetUserAsBlocked($iIdTenant, $iIdHelpdeskUser)
	{
		$bResult = $this->oConnection->Execute($this->oCommandCreator->SetUserAsBlocked($iIdTenant, $iIdHelpdeskUser));
		$this->throwDbExceptionIfExist();
		return $bResult;
	}

	/**
	 * @param CHelpdeskUser $oHelpdeskUser
	 * @return bool
	 */
	public function DeleteUser(CHelpdeskUser $oHelpdeskUser)
	{
		$bResult = $this->oConnection->Execute($this->oCommandCreator->DeleteUser($oHelpdeskUser));
		$this->throwDbExceptionIfExist();
		return $bResult;
	}

	/**
	 * @param CHelpdeskUser $oHelpdeskUser
	 * @param CHelpdeskThread $oThread
	 * @param array $aPostIds
	 * @return bool
	 */
	public function DeletePosts(CHelpdeskUser $oHelpdeskUser, $oThread, $aPostIds)
	{
		$bResult = $this->oConnection->Execute($this->oCommandCreator->DeletePosts($oHelpdeskUser, $oThread, $aPostIds));
		$this->throwDbExceptionIfExist();
		return $bResult;
	}

	/**
	 * @return bool
	 */
	public function ClearUnregistredUsers()
	{
		$bResult = $this->oConnection->Execute($this->oCommandCreator->ClearUnregistredUsers());
		$this->throwDbExceptionIfExist();
		return $bResult;
	}

	/**
	 * @param CHelpdeskUser $oHelpdeskUser
	 * @param CHelpdeskThread $oHelpdeskThread
	 * @param CHelpdeskPost $oHelpdeskPost
	 * @param array $aAttachments
	 *
	 * @return bool
	 */
	public function AddAttachments(CHelpdeskUser $oHelpdeskUser, CHelpdeskThread $oHelpdeskThread, CHelpdeskPost $oHelpdeskPost, $aAttachments)
	{
		foreach ($aAttachments as &$oItem)
		{
			$oItem->IdHelpdeskThread = $oHelpdeskThread->IdHelpdeskThread;
			$oItem->IdHelpdeskPost = $oHelpdeskPost->IdHelpdeskPost;
			$oItem->IdOwner = $oHelpdeskUser->IdHelpdeskUser;
		}

		$bResult = $this->oConnection->Execute($this->oCommandCreator->AddAttachments($aAttachments));
		
		$this->throwDbExceptionIfExist();
		return $bResult;
	}

	/**
	 * @param CHelpdeskUser $oHelpdeskUser
	 * @param array $aThreadIds
	 *
	 * @return bool
	 */
	public function VerifyThreadIdsBelongToUser(CHelpdeskUser $oHelpdeskUser, $aThreadIds)
	{
		$mResult = false;
		if ($this->oConnection->Execute($this->oCommandCreator->VerifyThreadIdsBelongToUser($oHelpdeskUser, $aThreadIds)))
		{
			while (false !== ($oRow = $this->oConnection->GetNextRecord()))
			{
				if ((int) $oHelpdeskUser->IdHelpdeskUser !== (int) $oRow->id_owner)
				{
					$mResult = false;
					break;
				}
				else
				{
					$mResult = true;
				}
			}
		}

		$this->throwDbExceptionIfExist();
		return $mResult;
	}

	/**
	 * @param CHelpdeskUser $oHelpdeskUser
	 * @param array $aPostIds
	 *
	 * @return bool
	 */
	public function VerifyPostIdsBelongToUser(CHelpdeskUser $oHelpdeskUser, $aPostIds)
	{
		$mResult = false;
		if ($this->oConnection->Execute($this->oCommandCreator->VerifyPostIdsBelongToUser($oHelpdeskUser, $aPostIds)))
		{
			while (false !== ($oRow = $this->oConnection->GetNextRecord()))
			{
				if ((int) $oHelpdeskUser->IdHelpdeskUser !== (int) $oRow->id_owner)
				{
					$mResult = false;
					break;
				}
				else
				{
					$mResult = true;
				}
			}
		}

		$this->throwDbExceptionIfExist();
		return $mResult;
	}

	/**
	 * @param CHelpdeskUser $oHelpdeskUser
	 * @param array $aThreadIds
	 * @param bool $bSetArchive = true
	 *
	 * @return bool
	 */
	public function ArchiveThreads(CHelpdeskUser $oHelpdeskUser, $aThreadIds, $bSetArchive = true)
	{
		$bResult = $this->oConnection->Execute($this->oCommandCreator->ArchiveThreads($oHelpdeskUser, $aThreadIds, $bSetArchive));
		$this->throwDbExceptionIfExist();
		return $bResult;
	}


	/**
	 * @param CHelpdeskUser $oHelpdeskUser
	 * @param int $iIdThread
	 * @return CHelpdeskThread|false
	 */
	public function GetThreadById($oHelpdeskUser, $iIdThread)
	{
		$oThread = false;
		if ($this->oConnection->Execute($this->oCommandCreator->GetThreadById($oHelpdeskUser, $iIdThread)))
		{
			$oThread = null;

			$oRow = $this->oConnection->GetNextRecord();
			if ($oRow)
			{
				$oThread = new CHelpdeskThread();
				$oThread->InitByDbRow($oRow);
			}
		}

		$this->throwDbExceptionIfExist();
		return $oThread;
	}
	
	/**
	 * @param int $iTenantID
	 * @param string $sHash
	 *
	 * @return int
	 */
	public function GetThreadIdByHash($iTenantID, $sHash)
	{
		$iThreadID = 0;
		if ($this->oConnection->Execute($this->oCommandCreator->GetThreadIdByHash($iTenantID, $sHash)))
		{
			$oRow = $this->oConnection->GetNextRecord();
			if ($oRow)
			{
				$iThreadID = (int) $oRow->id_helpdesk_thread;
			}
		}

		$this->throwDbExceptionIfExist();
		return $iThreadID;
	}

	/**
	 * @param CHelpdeskUser $oHelpdeskUser
	 * @param CHelpdeskThread $oHelpdeskThread
	 * @return bool
	 */
	public function CreateThread(CHelpdeskUser $oHelpdeskUser, CHelpdeskThread &$oHelpdeskThread)
	{
		$bResult = false;
		if ($this->oConnection->Execute($this->oCommandCreator->CreateThread($oHelpdeskUser, $oHelpdeskThread)))
		{
			$oHelpdeskThread->IdHelpdeskThread = $this->oConnection->GetLastInsertId();
			$bResult = true;
		}

		$this->throwDbExceptionIfExist();
		return $bResult;
	}

	/**
	 * @param CHelpdeskUser $oHelpdeskUser
	 * @param CHelpdeskUser $oHelpdeskUser
	 * @return bool
	 */
	public function UpdateThread(CHelpdeskUser $oHelpdeskUser, CHelpdeskThread $oHelpdeskThread)
	{
		$bResult = $this->oConnection->Execute($this->oCommandCreator->UpdateThread($oHelpdeskUser, $oHelpdeskThread));
		$this->throwDbExceptionIfExist();
		return $bResult;
	}
	
	/**
	 * @param CHelpdeskUser $oHelpdeskUser
	 * @param int $iFilter = EHelpdeskThreadFilterType::All
	 * @param string $sSearch = ''
	 * @param int $iSearchOwner = 0
	 *
	 * @return int
	 */
	public function GetThreadsCount(CHelpdeskUser $oHelpdeskUser, $iFilter = EHelpdeskThreadFilterType::All, $sSearch = '', $iSearchOwner = 0)
	{
		$iResult = 0;
		if ($this->oConnection->Execute($this->oCommandCreator->GetThreadsCount($oHelpdeskUser, $iFilter, $sSearch, $iSearchOwner)))
		{
			$oRow = $this->oConnection->GetNextRecord();
			if ($oRow)
			{
				$iResult = (int) $oRow->item_count;
			}
		}

		$this->throwDbExceptionIfExist();
		return $iResult;
	}

	/**
	 * @param CHelpdeskUser $oHelpdeskUser
	 * @param int $iOffset = 0
	 * @param int $iLimit = 20
	 * @param int $iFilter = EHelpdeskThreadFilterType::All
	 * @param string $sSearch = ''
	 * @param int $iSearchOwner = 0
	 *
	 * @return array|bool
	 */
	public function GetThreads(CHelpdeskUser $oHelpdeskUser, $iOffset = 0, $iLimit = 20, $iFilter = EHelpdeskThreadFilterType::All, $sSearch = '', $iSearchOwner = 0)
	{
		$mResult = false;
		if ($this->oConnection->Execute($this->oCommandCreator->GetThreads($oHelpdeskUser, $iOffset, $iLimit, $iFilter, $sSearch, $iSearchOwner)))
		{
			$oRow = null;
			$mResult = array();

			while (false !== ($oRow = $this->oConnection->GetNextRecord()))
			{
				$oHelpdeskThread = new CHelpdeskThread();
				$oHelpdeskThread->InitByDbRow($oRow);
				$oHelpdeskThread->ItsMe = $oHelpdeskThread->IdOwner === $oHelpdeskUser->IdHelpdeskUser;

				$mResult[] = $oHelpdeskThread;
			}
		}

		$this->throwDbExceptionIfExist();
		return $mResult;
	}

	/**
	 * @param CHelpdeskUser $oHelpdeskUser
	 * @param CHelpdeskPost $oThread
	 *
	 * @return int
	 */
	public function GetPostsCount(CHelpdeskUser $oHelpdeskUser, $oThread)
	{
		$iResult = 0;
		if ($this->oConnection->Execute($this->oCommandCreator->GetPostsCount($oHelpdeskUser, $oThread)))
		{
			$oRow = $this->oConnection->GetNextRecord();
			if ($oRow)
			{
				$iResult = (int) $oRow->item_count;
			}
		}

		$this->throwDbExceptionIfExist();
		return $iResult;
	}

	/**
	 * @param CHelpdeskUser $oHelpdeskUser
	 * @param array $aThreadIds
	 *
	 * @return array|bool
	 */
	public function GetThreadsLastPostIds(CHelpdeskUser $oHelpdeskUser, $aThreadIds)
	{
		$mResult = false;
		if ($this->oConnection->Execute($this->oCommandCreator->GetThreadsLastPostIds($oHelpdeskUser, $aThreadIds)))
		{
			$oRow = null;
			$mResult = array();

			while (false !== ($oRow = $this->oConnection->GetNextRecord()))
			{
				$mResult[(int) $oRow->id_helpdesk_thread] = (int) $oRow->last_post_id;
			}
		}

		$this->throwDbExceptionIfExist();
		return $mResult;
	}

	/**
	 * @param CHelpdeskUser $oHelpdeskUser
	 * @param int $iPostId
	 *
	 * @return array|bool
	 */
	public function GetAttachments(CHelpdeskUser $oHelpdeskUser, CHelpdeskThread $oHelpdeskThread)
	{
		$mResult = false;
		if ($this->oConnection->Execute($this->oCommandCreator->GetAttachments($oHelpdeskUser, $oHelpdeskThread)))
		{
			$oRow = null;
			$mResult = array();

			while (false !== ($oRow = $this->oConnection->GetNextRecord()))
			{
				$oHelpdeskPost = new CHelpdeskAttachment();
				$oHelpdeskPost->InitByDbRow($oRow);

				if (!isset($mResult[$oHelpdeskPost->IdHelpdeskPost]))
				{
					$mResult[$oHelpdeskPost->IdHelpdeskPost] = array();
				}

				$mResult[$oHelpdeskPost->IdHelpdeskPost][] = $oHelpdeskPost;
			}
		}

		$this->throwDbExceptionIfExist();
		return $mResult;
	}
	
	/**
	 * @param CHelpdeskUser $oHelpdeskUser
	 * @param CHelpdeskThread $oThread
	 * @param int $iStartFromId = 0
	 * @param int $iLimit = 20
	 *
	 * @return array|bool
	 */
	public function GetPosts(CHelpdeskUser $oHelpdeskUser, $oThread, $iStartFromId = 0, $iLimit = 20)
	{
		$mResult = false;
		if ($this->oConnection->Execute($this->oCommandCreator->GetPosts($oHelpdeskUser, $oThread, $iStartFromId, $iLimit)))
		{
			$oRow = null;
			$mResult = array();

			while (false !== ($oRow = $this->oConnection->GetNextRecord()))
			{
				$oHelpdeskPost = new CHelpdeskPost();
				$oHelpdeskPost->InitByDbRow($oRow);

				$mResult[] = $oHelpdeskPost;
			}
		}

		$this->throwDbExceptionIfExist();
		return $mResult;
	}

	/**
	 * @param CHelpdeskUser $oHelpdeskUser
	 * @param CHelpdeskPost $oPost
	 *
	 * @return bool
	 */
	public function CreatePost(CHelpdeskUser $oHelpdeskUser, CHelpdeskPost &$oPost)
	{
		$bResult = false;
		if ($this->oConnection->Execute($this->oCommandCreator->CreatePost($oHelpdeskUser, $oPost)))
		{
			$oPost->IdHelpdeskPost = $this->oConnection->GetLastInsertId();
			$bResult = true;
		}

		$this->throwDbExceptionIfExist();
		return $bResult;
	}

	/**
	 * @param CHelpdeskUser $oHelpdeskUser
	 * @param CHelpdeskThread $oHelpdeskThread
	 *
	 * @return bool
	 */
	public function SetThreadSeen(CHelpdeskUser $oHelpdeskUser, $oHelpdeskThread)
	{
		$this->oConnection->Execute($this->oCommandCreator->ClearThreadSeen($oHelpdeskUser, $oHelpdeskThread));
		$bResult = $this->oConnection->Execute($this->oCommandCreator->SetThreadSeen($oHelpdeskUser, $oHelpdeskThread));
		$this->throwDbExceptionIfExist();
		return $bResult;
	}
}
