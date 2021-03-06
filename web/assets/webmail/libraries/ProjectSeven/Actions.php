<?php

namespace ProjectSeven;

/**
 * @category ProjectSeven
 */
class Actions extends ActionsBase
{
	/**
	 * @var \CApiUsersManager
	 */
	protected $oApiUsers;

	/**
	 * @var \CApiTenantsManager
	 */
	protected $oApiTenants;

	/**
	 * @var \CApiWebmailManager
	 */
	protected $oApiWebMail;

	/**
	 * @var \CApiIntegratorManager
	 */
	protected $oApiIntegrator;

	/**
	 * @var \CApiMailManager
	 */
	protected $oApiMail;

	/**
	 * @var \CApiFilecacheManager
	 */
	protected $oApiFileCache;

	/**
	 * @var \CApiSieveManager
	 */
	protected $oApiSieve;

	/**
	 * @var \CApiFilestorageManager
	 */
	protected $oApiFilestorage;

	/**
	 * @var \CApiFetchersManager
	 */
	protected $oApiFetchers;

	/**
	 * @var \CApiCalendarManagerNew
	 */
	protected $oApiCalendar;

	/**
	 * @var \CApiCapabilityManager
	 */
	protected $oApiCapability;

	/**
	 * @var \CApiHelpdeskManager
	 */
	protected $oApiHelpdesk;

	/**
	 * @return void
	 */
	protected function __construct()
	{
		$this->oHttp = null;

		$this->oApiUsers = \CApi::Manager('users');
		$this->oApiTenants = \CApi::Manager('tenants');
		$this->oApiWebMail = \CApi::Manager('webmail');
		$this->oApiIntegrator = \CApi::Manager('integrator');
		$this->oApiMail = \CApi::Manager('mail');
		$this->oApiFileCache = \CApi::Manager('filecache');
		$this->oApiSieve = \CApi::Manager('sieve');
		$this->oApiFilestorage = \CApi::Manager('filestorage', 'sabredav');
		$this->oApiCalendar = \CApi::Manager('calendar', 'sabredav');
		$this->oApiCapability = \CApi::Manager('capability');

		$this->oApiFetchers = null;
		$this->oApiHelpdesk = null;
	}

	/**
	 * @return \ProjectSeven\Actions
	 */
	public static function NewInstance()
	{
		return new self();
	}

	/**
	 * @return \CApiFetchersManager
	 */
	public function ApiFetchers()
	{
		if (null === $this->oApiFetchers)
		{
			$this->oApiFetchers = \CApi::Manager('fetchers');
		}

		return $this->oApiFetchers;
	}

	/**
	 * @return \CApiFilecacheManager
	 */
	public function ApiFileCache()
	{
		return $this->oApiFileCache;
	}

	/**
	 * @return \CApiHelpdeskManager
	 */
	public function ApiHelpdesk()
	{
		if (null === $this->oApiHelpdesk)
		{
			$this->oApiHelpdesk = \CApi::Manager('helpdesk');
		}

		return $this->oApiHelpdesk;
	}

	/**
	 * @return \CApiSieveManager
	 */
	public function ApiSieve()
	{
		return $this->oApiSieve;
	}

	/**
	 * @param string $sToken
	 *
	 * @return bool
	 */
	public function ValidateCsrfToken($sToken)
	{
		return $this->oApiIntegrator->ValidateCsrfToken($sToken);
	}

	/**
	 * @param int $iAccountId
	 * @return CAccount | null
	 */
	public function GetAccount($iAccountId)
	{
		$oResult = null;
		$iUserId = $this->oApiIntegrator->GetLogginedUserId();
		if (0 < $iUserId)
		{
			$oAccount = $this->oApiUsers->GetAccountById($iAccountId);
			$oResult = $oAccount instanceof \CAccount && $oAccount->IdUser === $iUserId ? $oAccount : null;
		}

		return $oResult;
	}

	/**
	 * @return \CAccount | null
	 */
	public function GetDefaultAccount()
	{
		$oResult = null;
		$iUserId = $this->oApiIntegrator->GetLogginedUserId();
		if (0 < $iUserId)
		{
			$iAccountId = $this->oApiUsers->GetDefaultAccountId($iUserId);
			if (0 < $iAccountId)
			{
				$oAccount = $this->oApiUsers->GetAccountById($iAccountId);
				$oResult = $oAccount instanceof \CAccount ? $oAccount : null;
			}
		}

		return $oResult;
	}

	/**
	 * @return \CAccount|null
	 */
	public function GetCurrentAccount($bThrowAuthExceptionOnFalse = true)
	{
		return $this->getAccountFromParam($bThrowAuthExceptionOnFalse);
	}

	/**
	 * @param \CAccount $oAccount
	 *
	 * @return \CHelpdeskUser|null
	 */
	public function GetHelpdeskAccountFromMainAccount(&$oAccount)
	{
		$oResult = null;
		$oApiHelpdesk = $this->ApiHelpdesk();
		if ($oAccount && $oAccount->IsDefaultAccount && $oApiHelpdesk && $this->oApiCapability->IsHelpdeskSupported($oAccount))
		{
			if (0 < $oAccount->User->IdHelpdeskUser)
			{
				$oHelpdeskUser = $oApiHelpdesk->GetUserById($oAccount->IdTenant, $oAccount->User->IdHelpdeskUser);
				$oResult = $oHelpdeskUser instanceof \CHelpdeskUser ? $oHelpdeskUser : null;
			}

			if (!($oResult instanceof \CHelpdeskUser))
			{
				$oHelpdeskUser = $oApiHelpdesk->GetUserByEmail($oAccount->IdTenant, $oAccount->Email);
				$oResult = $oHelpdeskUser instanceof \CHelpdeskUser ? $oHelpdeskUser : null;

				if ($oResult instanceof \CHelpdeskUser)
				{
					$oAccount->User->IdHelpdeskUser = $oHelpdeskUser->IdHelpdeskUser;
					$this->oApiUsers->UpdateAccount($oAccount);
				}
			}

			if (!($oResult instanceof \CHelpdeskUser))
			{
				$oHelpdeskUser = new \CHelpdeskUser();
				$oHelpdeskUser->Email = $oAccount->Email;
				$oHelpdeskUser->Name = $oAccount->FriendlyName;
				$oHelpdeskUser->IdSystemUser = $oAccount->IdUser;
				$oHelpdeskUser->IdTenant = $oAccount->IdTenant;
				$oHelpdeskUser->Activated = true;
				$oHelpdeskUser->IsAgent = true;
				$oHelpdeskUser->Language = $oAccount->User->DefaultLanguage;
				$oHelpdeskUser->DateFormat = $oAccount->User->DefaultDateFormat;
				$oHelpdeskUser->TimeFormat = $oAccount->User->DefaultTimeFormat;

				$oHelpdeskUser->SetPassword($oAccount->IncomingMailPassword);

				if ($oApiHelpdesk->CreateUser($oHelpdeskUser))
				{
					$oAccount->User->IdHelpdeskUser = $oHelpdeskUser->IdHelpdeskUser;
					$this->oApiUsers->UpdateAccount($oAccount);

					$oResult = $oHelpdeskUser;
				}
			}
		}

		return $oResult;
	}

	/**
	 * @return \CHelpdeskUser|null
	 */
	public function GetHelpdeskAccount($iTenantID)
	{
		$oResult = null;
		if ($this->oApiCapability->IsHelpdeskSupported())
		{
			$iIdHelpdeskUser = $this->oApiIntegrator->GetLogginedHelpdeskUserId();
			if (0 < $iIdHelpdeskUser)
			{
				$oHelpdeskUser = $this->ApiHelpdesk()->GetUserById($iTenantID, $iIdHelpdeskUser);
				$oResult = $oHelpdeskUser instanceof \CHelpdeskUser ? $oHelpdeskUser : null;
			}
		}

		return $oResult;
	}

	/**
	 * @return \CAccount|null
	 */
	protected function getAccountFromParam($bThrowAuthExceptionOnFalse = true)
	{
		$sAccountID = (string) $this->getParamValue('AccountID', '');
		if (0 === strlen($sAccountID) || !is_numeric($sAccountID))
		{
			throw new \ProjectSeven\Exceptions\ClientException(\ProjectSeven\Notifications::InvalidInputParameter);
		}

		$oResult = $this->GetAccount((int) $sAccountID);

		if ($bThrowAuthExceptionOnFalse && !($oResult instanceof \CAccount))
		{
			throw new \ProjectSeven\Exceptions\ClientException(\ProjectSeven\Notifications::AuthError);
		}

		return $oResult;
	}

	/**
	 * @return \CAccount|null
	 */
	protected function getDefaultAccountFromParam($bThrowAuthExceptionOnFalse = true)
	{
		$oResult = $this->GetDefaultAccount();
		if ($bThrowAuthExceptionOnFalse && !($oResult instanceof \CAccount))
		{
			throw new \ProjectSeven\Exceptions\ClientException(\ProjectSeven\Notifications::AuthError);
		}

		return $oResult;
	}

	/**
	 * @return \CHelpdeskUser|null
	 */
	protected function getHelpdeskAccountFromParam($oAccount, $bThrowAuthExceptionOnFalse = true)
	{
		$oResult = null;
		$oAccount = null;

		if ('0' === (string) $this->getParamValue('IsExt', '1'))
		{
			$oAccount = $this->getDefaultAccountFromParam($bThrowAuthExceptionOnFalse);
			if ($oAccount && $this->oApiCapability->IsHelpdeskSupported($oAccount))
			{
				$oResult = $this->GetHelpdeskAccountFromMainAccount($oAccount);
			}
		}
		else
		{
			$mTenantID = $this->oApiIntegrator->GetTenantIdByHash($this->getParamValue('TenantHash', ''));
			if (is_int($mTenantID))
			{
				$oResult = $this->GetHelpdeskAccount($mTenantID);
			}
		}

		if (!$oResult && $bThrowAuthExceptionOnFalse)
		{
			throw new \ProjectSeven\Exceptions\ClientException(\ProjectSeven\Notifications::UnknownError);
		}

		return $oResult;
	}

	/**
	 * @return \CHelpdeskUser|null
	 */
	protected function getExtHelpdeskAccountFromParam($bThrowAuthExceptionOnFalse = true)
	{
		$oResult = $this->GetExtHelpdeskAccount();
		if (!$oResult)
		{
			$oResult = null;
			if ($bThrowAuthExceptionOnFalse)
			{
				throw new \ProjectSeven\Exceptions\ClientException(\ProjectSeven\Notifications::AuthError);
			}
		}

		return $oResult;
	}

	/**
	 * @return array
	 */
	public function AjaxNoop()
	{
		return $this->TrueResponse(null, 'Noop');
	}

	/**
	 * @return array
	 */
	public function AjaxPing()
	{
		return $this->DefaultResponse(null, 'Ping', 'Pong');
	}

	/**
	 * @return array
	 */
	public function AjaxIsAuth()
	{
		$mResult = false;
		$oAccount = $this->getAccountFromParam(false);
		if ($oAccount)
		{
			$sClientTimeZone = trim($this->getParamValue('ClientTimeZone', ''));
			if ('' !== $sClientTimeZone)
			{
				$oAccount->User->ClientTimeZone = $sClientTimeZone;
				$this->oApiUsers->UpdateAccount($oAccount);
			}

			$mResult = array();
			$mResult['Extensions'] = array();

			// extensions
			if ($oAccount->IsEnabledExtension(\CAccount::IgnoreSubscribeStatus) &&
				!$oAccount->IsEnabledExtension(\CAccount::DisableManageSubscribe))
			{
				$oAccount->EnableExtension(\CAccount::DisableManageSubscribe);
			}

			$aExtensions = $oAccount->GetExtensions();
			foreach ($aExtensions as $sExtensionName)
			{
				if ($oAccount->IsEnabledExtension($sExtensionName))
				{
					$mResult['Extensions'][] = $sExtensionName;
				}
			}
		}

		return $this->DefaultResponse(null, 'IsAuth', $mResult);
	}

	/**
	 * @param \CAccount $oAccount
	 * @param \CFetcher $oFetcher
	 * @param bool $bUpdate = false
	 */
	private function populateFetcherFromHttpPost($oAccount, &$oFetcher, $bUpdate = false)
	{
		if ($oFetcher)
		{
			$oFetcher->IdAccount = $oAccount->IdAccount;
			$oFetcher->IdUser = $oAccount->IdUser;
			$oFetcher->IdDomain = $oAccount->IdDomain;
			$oFetcher->IdTenant = $oAccount->IdTenant;

			if (!$bUpdate)
			{
				$oFetcher->IncomingMailServer = (string) $this->oHttp->GetPost('IncomingMailServer', $oFetcher->IncomingMailServer);
				$oFetcher->IncomingMailPort = (int) $this->oHttp->GetPost('IncomingMailPort', $oFetcher->IncomingMailPort);
				$oFetcher->IncomingMailLogin = (string) $this->oHttp->GetPost('IncomingMailLogin', $oFetcher->IncomingMailLogin);
				$oFetcher->IncomingMailSecurity = \MailSo\Net\Enumerations\ConnectionSecurityType::AUTO_DETECT;

				$oFetcher->IncomingMailSecurity = 995 ===$oFetcher->IncomingMailPort ?
					\MailSo\Net\Enumerations\ConnectionSecurityType::SSL : \MailSo\Net\Enumerations\ConnectionSecurityType::NONE;
			}

			$sIncomingMailPassword = (string) $this->oHttp->GetPost('IncomingMailPassword', $oFetcher->IncomingMailPassword);
			if ('******' !== $sIncomingMailPassword)
			{
				$oFetcher->IncomingMailPassword = $sIncomingMailPassword;
			}

			$oFetcher->Folder = (string) $this->oHttp->GetPost('Folder', $oFetcher->Folder);

			$oFetcher->IsEnabled = '1' === (string) $this->oHttp->GetPost('IsEnabled', $oFetcher->IsEnabled ? '1' : '0');

			$oFetcher->LeaveMessagesOnServer = '1' === (string) $this->oHttp->GetPost('LeaveMessagesOnServer', $oFetcher->LeaveMessagesOnServer ? '1' : '0');
			$oFetcher->Name = (string) $this->oHttp->GetPost('Name', $oFetcher->Name);
			$oFetcher->Email = (string) $this->oHttp->GetPost('Email', $oFetcher->Email);
			$oFetcher->Signature = (string) $this->oHttp->GetPost('Signature', $oFetcher->Signature);

			$oFetcher->IsOutgoingEnabled = '1' === (string) $this->oHttp->GetPost('IsOutgoingEnabled', $oFetcher->IsOutgoingEnabled ? '1' : '0');
			$oFetcher->OutgoingMailServer = (string) $this->oHttp->GetPost('OutgoingMailServer', $oFetcher->OutgoingMailServer);
			$oFetcher->OutgoingMailPort = (int) $this->oHttp->GetPost('OutgoingMailPort', $oFetcher->OutgoingMailPort);
			$oFetcher->OutgoingMailAuth = '1' === (string) $this->oHttp->GetPost('OutgoingMailAuth', $oFetcher->OutgoingMailAuth ? '1' : '0');
			$oFetcher->OutgoingMailSecurity = \MailSo\Net\Enumerations\ConnectionSecurityType::AUTO_DETECT;

			$oFetcher->OutgoingMailSecurity = 465 ===$oFetcher->OutgoingMailPort ?
				\MailSo\Net\Enumerations\ConnectionSecurityType::SSL :
					(587 === $oFetcher->OutgoingMailPort ?
						\MailSo\Net\Enumerations\ConnectionSecurityType::STARTTLS : \MailSo\Net\Enumerations\ConnectionSecurityType::NONE);
		}
	}

	/**
	 * @return array
	 */
	public function AjaxFetcherList()
	{
		$oAccount = $this->getAccountFromParam();
		return $this->DefaultResponse($oAccount, 'FetcherList', $this->ApiFetchers()->GetFetchers($oAccount));
	}

	/**
	 * @return array
	 */
	public function AjaxFetcherCreate()
	{
		$oAccount = $this->getAccountFromParam();
		$oFetcher = null;

		$this->ApiFetchers();

		$oFetcher = new \CFetcher($oAccount);
		$this->populateFetcherFromHttpPost($oAccount, $oFetcher);

		$bResult = $this->ApiFetchers()->CreateFetcher($oAccount, $oFetcher);
		if ($bResult)
		{
			return $this->TrueResponse($oAccount, __FUNCTION__);
		}

		$oExc = $this->ApiFetchers()->GetLastException();
		if ($oExc && $oExc instanceof \CApiBaseException)
		{
			switch ($oExc->getCode())
			{
				case \CApiErrorCodes::Fetcher_ConnectToMailServerFailed:
					throw new \ProjectSeven\Exceptions\ClientException(\ProjectSeven\Notifications::FetcherConnectError);
				case \CApiErrorCodes::Fetcher_AuthError:
					throw new \ProjectSeven\Exceptions\ClientException(\ProjectSeven\Notifications::FetcherAuthError);
			}

			return $this->ExceptionResponse($oAccount, __FUNCTION__, $oExc);
		}

		return $this->FalseResponse($oAccount, __FUNCTION__);

	}

	/**
	 * @return array
	 */
	public function AjaxFetcherUpdate()
	{
		$oAccount = $this->getAccountFromParam();
		$oFetcher = null;

		$this->ApiFetchers();

		$iFetcherID = (int) $this->getParamValue('FetcherID', 0);
		if (0 < $iFetcherID)
		{
			$aFetchers = $this->ApiFetchers()->GetFetchers($oAccount);
			if (is_array($aFetchers) && 0 < count($aFetchers))
			{
				foreach ($aFetchers as /* @var $oFetcherItem \CFetcher */ $oFetcherItem)
				{
					if ($oFetcherItem && $iFetcherID === $oFetcherItem->IdFetcher && $oAccount->IdUser === $oFetcherItem->IdUser)
					{
						$oFetcher = $oFetcherItem;
						break;
					}
				}
			}
		}

		if ($oFetcher && $iFetcherID === $oFetcher->IdFetcher)
		{
			$this->populateFetcherFromHttpPost($oAccount, $oFetcher, true);
		}

		$bResult = $oFetcher ? $this->ApiFetchers()->UpdateFetcher($oAccount, $oFetcher) : false;
		if ($bResult || !$oFetcher)
		{
			return $this->DefaultResponse($oAccount, __FUNCTION__, $bResult);
		}

		$oExc = $this->ApiFetchers()->GetLastException();
		if ($oExc && $oExc instanceof \CApiBaseException)
		{
			switch ($oExc->getCode())
			{
				case \CApiErrorCodes::Fetcher_ConnectToMailServerFailed:
					throw new \ProjectSeven\Exceptions\ClientException(\ProjectSeven\Notifications::FetcherConnectError);
				case \CApiErrorCodes::Fetcher_AuthError:
					throw new \ProjectSeven\Exceptions\ClientException(\ProjectSeven\Notifications::FetcherAuthError);
			}

			return $this->ExceptionResponse($oAccount, __FUNCTION__, $oExc);
		}

		return $this->FalseResponse($oAccount, __FUNCTION__);
	}

	/**
	 * @return array
	 */
	public function AjaxFetcherDelete()
	{
		$oAccount = $this->getAccountFromParam();

		$iFetcherID = (int) $this->getParamValue('FetcherID', 0);
		return $this->DefaultResponse($oAccount, 'FetcherDelete', $this->ApiFetchers()->DeleteFetcher($oAccount, $iFetcherID));
	}

	/**
	 * @return array
	 */
	public function AjaxFolderList()
	{
		$oAccount = $this->getAccountFromParam();
		return $this->DefaultResponse($oAccount, 'FolderList', $this->oApiMail->Folders($oAccount));
	}

	/**
	 * @return array
	 */
	public function AjaxSetupSystemFolders()
	{
		$oAccount = $this->getAccountFromParam();

		$sSent = (string) $this->getParamValue('Sent', '');
		$sDrafts = (string) $this->getParamValue('Drafts', '');
		$sTrash = (string) $this->getParamValue('Trash', '');
		$sSpam = (string) $this->getParamValue('Spam', '');

		$aData = array();
		if (0 < strlen(trim($sSent)))
		{
			$aData[$sSent] = \EFolderType::Sent;
		}
		if (0 < strlen(trim($sDrafts)))
		{
			$aData[$sDrafts] = \EFolderType::Drafts;
		}
		if (0 < strlen(trim($sTrash)))
		{
			$aData[$sTrash] = \EFolderType::Trash;
		}
		if (0 < strlen(trim($sSpam)))
		{
			$aData[$sSpam] = \EFolderType::Spam;
		}

		return $this->DefaultResponse($oAccount, 'SetupSystemFolders', $this->oApiMail->SetSystemFolderNames($oAccount, $aData));
	}

	/**
	 * @return array
	 */
	public function AjaxFolderCounts()
	{
		$aFolders = $this->getParamValue('Folders', '');
		if (!is_array($aFolders) || 0 === count($aFolders))
		{
			throw new \ProjectSeven\Exceptions\ClientException(\ProjectSeven\Notifications::InvalidInputParameter);
		}

		$aResult = array();
		$oAccount = $this->getAccountFromParam();

		try
		{
			$aResult = $this->oApiMail->FolderCountsFromArray($oAccount, $aFolders);
		}
		catch (\MailSo\Net\Exceptions\ConnectionException $oException)
		{
			throw $oException;
		}
		catch (\MailSo\Imap\Exceptions\LoginException $oException)
		{
			throw $oException;
		}
		catch (\Exception $oException)
		{
			\CApi::Log((string) $oException);
		}

		return $this->DefaultResponse($oAccount, 'FolderCounts', $aResult);
	}

	/**
	 * @return array
	 */
	public function AjaxFolderCreate()
	{
		$sFolderNameInUtf8 = trim((string) $this->getParamValue('FolderNameInUtf8', ''));
		$sDelimiter = trim((string) $this->getParamValue('Delimiter', ''));
		$sFolderParentFullNameRaw = (string) $this->getParamValue('FolderParentFullNameRaw', '');

		if (0 === strlen($sFolderNameInUtf8) || 1 !== strlen($sDelimiter))
		{
			throw new \ProjectSeven\Exceptions\ClientException(\ProjectSeven\Notifications::InvalidInputParameter);
		}

		$oAccount = $this->getAccountFromParam();

		$this->oApiMail->FolderCreate($oAccount, $sFolderNameInUtf8, $sDelimiter, $sFolderParentFullNameRaw);

		return $this->TrueResponse($oAccount, 'FolderCreate');
	}

	/**
	 * @return array
	 */
	public function AjaxFolderRename()
	{
		$sPrevFolderFullNameRaw = (string) $this->getParamValue('PrevFolderFullNameRaw', '');
		$sNewFolderNameInUtf8 = trim($this->getParamValue('NewFolderNameInUtf8', ''));

		if (0 === strlen($sPrevFolderFullNameRaw) || 0 === strlen($sNewFolderNameInUtf8))
		{
			throw new \ProjectSeven\Exceptions\ClientException(\ProjectSeven\Notifications::InvalidInputParameter);
		}

		$oAccount = $this->getAccountFromParam();

		$this->oApiMail->FolderRename($oAccount, $sPrevFolderFullNameRaw, $sNewFolderNameInUtf8);

		return $this->TrueResponse($oAccount, 'FolderRename');
	}

	/**
	 * @return array
	 */
	public function AjaxFolderDelete()
	{
		$sFolderFullNameRaw = (string) $this->getParamValue('Folder', '');

		if (0 === strlen(trim($sFolderFullNameRaw)))
		{
			throw new \ProjectSeven\Exceptions\ClientException(\ProjectSeven\Notifications::InvalidInputParameter);
		}

		$oAccount = $this->getAccountFromParam();

		$this->oApiMail->FolderDelete($oAccount, $sFolderFullNameRaw);

		return $this->TrueResponse($oAccount, 'FolderDelete');
	}

	/**
	 * @return array
	 */
	public function AjaxFolderSubscribe()
	{
		$sFolderFullNameRaw = (string) $this->getParamValue('Folder', '');
		$bSetAction = '1' === (string) $this->getParamValue('SetAction', '0');

		if (0 === strlen(trim($sFolderFullNameRaw)))
		{
			throw new \ProjectSeven\Exceptions\ClientException(\ProjectSeven\Notifications::InvalidInputParameter);
		}

		$oAccount = $this->getAccountFromParam();

		if (!$oAccount->IsEnabledExtension(\CAccount::DisableManageSubscribe))
		{
			$this->oApiMail->FolderSubscribe($oAccount, $sFolderFullNameRaw, $bSetAction);
			return $this->TrueResponse($oAccount, 'FolderSubscribe');
		}

		return $this->FalseResponse($oAccount, 'FolderSubscribe');
	}

	/**
	 * @return array
	 */
	public function AjaxFolderListOrderUpdate()
	{
		$aFolderList = $this->getParamValue('FolderList', null);
		if (!is_array($aFolderList))
		{
			throw new \ProjectSeven\Exceptions\ClientException(\ProjectSeven\Notifications::InvalidInputParameter);
		}

		$oAccount = $this->getAccountFromParam();
		if ($oAccount->IsEnabledExtension(\CAccount::DisableFoldersManualSort))
		{
			return $this->FalseResponse($oAccount, __FUNCTION__);
		}

		return $this->DefaultResponse($oAccount, 'FolderListOrderUpdate',
			$this->oApiMail->FoldersOrderUpdate($oAccount, $aFolderList));
	}

	/**
	 * @return array
	 */
	public function AjaxFolderClear()
	{
		$sFolderFullNameRaw = (string) $this->getParamValue('Folder', '');

		if (0 === strlen(trim($sFolderFullNameRaw)))
		{
			throw new \ProjectSeven\Exceptions\ClientException(\ProjectSeven\Notifications::InvalidInputParameter);
		}

		$oAccount = $this->getAccountFromParam();

		$this->oApiMail->FolderClear($oAccount, $sFolderFullNameRaw);

		return $this->TrueResponse($oAccount, 'FolderClear');
	}

	/**
	 * @return array
	 */
	public function AjaxMessageList()
	{
		$sFolderFullNameRaw = (string) $this->getParamValue('Folder', '');
		$sOffset = trim((string) $this->getParamValue('Offset', ''));
		$sLimit = trim((string) $this->getParamValue('Limit', ''));
		$sSearch = trim((string) $this->getParamValue('Search', ''));
		$bUseThreads = '1' === (string) $this->getParamValue('UseThreads', '0');

		$aFilters = array();
		$sFilters = strtolower(trim((string) $this->getParamValue('Filters', '')));
		if (0 < strlen($sFilters))
		{
			$aFilters = array_filter(explode(',', $sFilters), function ($sValue) {
				return '' !== trim($sValue);
			});
		}

		$iOffset = 0 < strlen($sOffset) && is_numeric($sOffset) ? (int) $sOffset : 0;
		$iLimit = 0 < strlen($sLimit) && is_numeric($sLimit) ? (int) $sLimit : 0;

		if (0 === strlen(trim($sFolderFullNameRaw)) || 0 > $iOffset || 0 >= $iLimit || 200 < $sLimit)
		{
			throw new \ProjectSeven\Exceptions\ClientException(\ProjectSeven\Notifications::InvalidInputParameter);
		}

		$oAccount = $this->getAccountFromParam();

		$oMessageList = $this->oApiMail->MessageList(
			$oAccount, $sFolderFullNameRaw, $iOffset, $iLimit, $sSearch, $bUseThreads, $aFilters);

		return $this->DefaultResponse($oAccount, 'MessageList', $oMessageList);
	}

	/**
	 * @return array
	 */
	public function AjaxMessageListByUids()
	{
		$sFolderFullNameRaw = (string) $this->getParamValue('Folder', '');
		$aUids = $this->getParamValue('Uids', array());

		if (0 === strlen(trim($sFolderFullNameRaw)) || !is_array($aUids))
		{
			throw new \ProjectSeven\Exceptions\ClientException(\ProjectSeven\Notifications::InvalidInputParameter);
		}

		$oAccount = $this->getAccountFromParam();

		$oMessageList = $this->oApiMail->MessageListByUids($oAccount, $sFolderFullNameRaw, $aUids);

		return $this->DefaultResponse($oAccount, 'MessageListByUids', $oMessageList);
	}

	/**
	 * @return array
	 */
	public function AjaxMessageMove()
	{
		$sFromFolderFullNameRaw = (string) $this->getParamValue('Folder', '');
		$sToFolderFullNameRaw = (string) $this->getParamValue('ToFolder', '');
		$aUids = \ProjectSeven\Base\Utils::ExplodeIntUids((string) $this->getParamValue('Uids', ''));

		if (0 === strlen(trim($sFromFolderFullNameRaw)) || 0 === strlen(trim($sToFolderFullNameRaw)) || !is_array($aUids) || 0 === count($aUids))
		{
			throw new \ProjectSeven\Exceptions\ClientException(\ProjectSeven\Notifications::InvalidInputParameter);
		}

		$oAccount = $this->getAccountFromParam();

		try
		{
			$this->oApiMail->MessageMove(
				$oAccount, $sFromFolderFullNameRaw, $sToFolderFullNameRaw, $aUids);
		}
		catch (\MailSo\Imap\Exceptions\NegativeResponseException $oException)
		{
			throw new \ProjectSeven\Exceptions\ClientException(\ProjectSeven\Notifications::CanNotMoveMessageQuota, $oException);
		}
		catch (\Exceptions $oException)
		{
			throw new \ProjectSeven\Exceptions\ClientException(\ProjectSeven\Notifications::CanNotMoveMessage, $oException);
		}

		return $this->TrueResponse($oAccount, 'MessageMove');
	}

	/**
	 * @return array
	 */
	public function AjaxMessageDelete()
	{
		$sFolderFullNameRaw = (string) $this->getParamValue('Folder', '');
		$aUids = \ProjectSeven\Base\Utils::ExplodeIntUids((string) $this->getParamValue('Uids', ''));

		if (0 === strlen(trim($sFolderFullNameRaw)) || !is_array($aUids) || 0 === count($aUids))
		{
			throw new \ProjectSeven\Exceptions\ClientException(\ProjectSeven\Notifications::InvalidInputParameter);
		}

		$oAccount = $this->getAccountFromParam();

		$this->oApiMail->MessageDelete($oAccount, $sFolderFullNameRaw, $aUids);

		return $this->TrueResponse($oAccount, 'MessageDelete');
	}

	/**
	 * @param \CAccount $oAccount
	 * @param \CFetcher $oFetcher = null
	 * @param bool $bWithDraftInfo = true
	 *
	 * @return \MailSo\Mime\Message
	 */
	private function buildMessage($oAccount, $oFetcher = null, $bWithDraftInfo = true)
	{
		$sTo = $this->getParamValue('To', '');
		$sCc = $this->getParamValue('Cc', '');
		$sBcc = $this->getParamValue('Bcc', '');
		$sSubject = $this->getParamValue('Subject', '');
		$bTextIsHtml = '1' === $this->getParamValue('IsHtml', '0');
		$sText = $this->getParamValue('Text', '');
		$aAttachments = $this->getParamValue('Attachments', null);

		$aDraftInfo = $this->getParamValue('DraftInfo', null);
		$sInReplyTo = $this->getParamValue('InReplyTo', '');
		$sReferences = $this->getParamValue('References', '');

		$sImportance = $this->getParamValue('Importance', ''); // 1 3 5
		$sSensivity = $this->getParamValue('Sensivity', ''); // 0 1 2 3 4
		$bReadingConfirmation = '1' === $this->getParamValue('ReadingConfirmation', '0');

		$oMessage = \MailSo\Mime\Message::NewInstance();
		$oMessage->RegenerateMessageId();

		$sXMailer = \CApi::GetConf('webmail.xmailer-value', '');
		if (0 < strlen($sXMailer))
		{
			$oMessage->SetXMailer($sXMailer);
		}

		$oFrom = $oFetcher
			? \MailSo\Mime\Email::NewInstance($oFetcher->Email, $oFetcher->Name)
			: \MailSo\Mime\Email::NewInstance($oAccount->Email, $oAccount->FriendlyName);

		$oMessage
			->SetFrom($oFrom)
			->SetSubject($sSubject)
		;

		$oToEmails = \MailSo\Mime\EmailCollection::NewInstance($sTo);
		if ($oToEmails && $oToEmails->Count())
		{
			$oMessage->SetTo($oToEmails);
		}

		$oCcEmails = \MailSo\Mime\EmailCollection::NewInstance($sCc);
		if ($oCcEmails && $oCcEmails->Count())
		{
			$oMessage->SetCc($oCcEmails);
		}

		$oBccEmails = \MailSo\Mime\EmailCollection::NewInstance($sBcc);
		if ($oBccEmails && $oBccEmails->Count())
		{
			$oMessage->SetBcc($oBccEmails);
		}

		if ($bWithDraftInfo && is_array($aDraftInfo) && !empty($aDraftInfo[0]) && !empty($aDraftInfo[1]) && !empty($aDraftInfo[2]))
		{
			$oMessage->SetDraftInfo($aDraftInfo[0], $aDraftInfo[1], $aDraftInfo[2]);
		}

		if (0 < strlen($sInReplyTo))
		{
			$oMessage->SetInReplyTo($sInReplyTo);
		}

		if (0 < strlen($sReferences))
		{
			$oMessage->SetReferences($sReferences);
		}

		if (0 < strlen($sImportance) && in_array((int) $sImportance, array(
			\MailSo\Mime\Enumerations\MessagePriority::HIGH,
			\MailSo\Mime\Enumerations\MessagePriority::NORMAL,
			\MailSo\Mime\Enumerations\MessagePriority::LOW
		)))
		{
			$oMessage->SetPriority((int) $sImportance);
		}

		if (0 < strlen($sSensivity) && in_array((int) $sSensivity, array(
			\MailSo\Mime\Enumerations\Sensitivity::NOTHING,
			\MailSo\Mime\Enumerations\Sensitivity::CONFIDENTIAL,
			\MailSo\Mime\Enumerations\Sensitivity::PRIVATE_,
			\MailSo\Mime\Enumerations\Sensitivity::PERSONAL,
		)))
		{
			$oMessage->SetSensitivity((int) $sSensivity);
		}

		if ($bReadingConfirmation)
		{
			$oMessage->SetReadConfirmation($oFetcher ? $oFetcher->Email : $oAccount->Email);
		}

		$aFoundCids = array();

		if ($bTextIsHtml)
		{
			$oMessage->AddText(\MailSo\Base\HtmlUtils::ConvertHtmlToPlain($sText), false);
		}

		$mFoundDataURL = array();
		$oMessage->AddText($bTextIsHtml ?
			\MailSo\Base\HtmlUtils::BuildHtml($sText, $aFoundCids, $mFoundDataURL) : $sText, $bTextIsHtml);

		if (is_array($aAttachments))
		{
			foreach ($aAttachments as $sTempName => $aData)
			{
				if (is_array($aData) && 4 === count($aData) && isset($aData[0], $aData[1], $aData[2], $aData[3]))
				{
					$sFileName = (string) $aData[0];
					$sCID = (string) $aData[1];
					$bIsInline = '1' === (string) $aData[2];
					$bIsLinked = '1' === (string) $aData[3];

					$rResource = $this->ApiFileCache()->GetFile($oAccount, $sTempName);
					if (is_resource($rResource))
					{
						$iFileSize = $this->ApiFileCache()->FileSize($oAccount, $sTempName);

						$sCID = trim(trim($sCID), '<>');
						$bIsFounded = 0 < strlen($sCID) ? in_array($sCID, $aFoundCids) : false;

						if (!$bIsLinked || $bIsFounded)
						{
							$oMessage->Attachments()->Add(
								\MailSo\Mime\Attachment::NewInstance($rResource, $sFileName, $iFileSize, $bIsInline,
									$bIsLinked, $bIsLinked ? '<'.$sCID.'>' : '')
							);
						}
					}
				}
			}
		}

		if ($mFoundDataURL && \is_array($mFoundDataURL) && 0 < \count($mFoundDataURL))
		{
			foreach ($mFoundDataURL as $sCidHash => $sDataUrlString)
			{
				$aMatch = array();
				$sCID = '<'.$sCidHash.'>';
				if (\preg_match('/^data:(image\/[a-zA-Z0-9]+);base64,(.+)$/i', $sDataUrlString, $aMatch) &&
					!empty($aMatch[1]) && !empty($aMatch[2]))
				{
					$sRaw = \MailSo\Base\Utils::Base64Decode($aMatch[2]);
					$iFileSize = \strlen($sRaw);
					if (0 < $iFileSize)
					{
						$sFileName = \preg_replace('/[^a-z0-9]+/i', '.', $aMatch[1]);
						$rResource = \MailSo\Base\ResourceRegistry::CreateMemoryResourceFromString($sRaw);

						$sRaw = '';
						unset($sRaw);
						unset($aMatch);

						$oMessage->Attachments()->Add(
							\MailSo\Mime\Attachment::NewInstance($rResource, $sFileName, $iFileSize, true, true, $sCID)
						);
					}
				}
			}
		}

		\CApi::Plugin()->RunHook('webmail.build-message', array(&$oMessage));

		return $oMessage;
	}

	/**
	 * @param \CAccount $oAccount
	 *
	 * @return \MailSo\Mime\Message
	 *
	 * @throws \MailSo\Base\Exceptions\InvalidArgumentException
	 */
	private function buildConfirmationMessage($oAccount)
	{
		$sConfirmation = $this->getParamValue('Confirmation', '');
		$sSubject = $this->getParamValue('Subject', '');
		$sText = $this->getParamValue('Text', '');

		if (0 === strlen($sConfirmation) || 0 === strlen($sSubject) || 0 === strlen($sText))
		{
			throw new \MailSo\Base\Exceptions\InvalidArgumentException();
		}

		$oMessage = \MailSo\Mime\Message::NewInstance();
		$oMessage->RegenerateMessageId();

		$sXMailer = \CApi::GetConf('webmail.xmailer-value', '');
		if (0 < strlen($sXMailer))
		{
			$oMessage->SetXMailer($sXMailer);
		}

		$oFrom = \MailSo\Mime\EmailCollection::Parse($sConfirmation);
		if (!$oFrom || 0 === $oFrom->Count())
		{
			throw new \MailSo\Base\Exceptions\InvalidArgumentException();
		}

		$sFrom = 0 < strlen($oAccount->FriendlyName) ? '"'.$oAccount->FriendlyName.'"' : '';
		if (0 < strlen($sFrom))
		{
			$sFrom .= ' <'.$oAccount->Email.'>';
		}
		else
		{
			$sFrom .= $oAccount->Email;
		}

		$oMessage
			->SetFrom(\MailSo\Mime\Email::NewInstance($sFrom))
			->SetTo($oFrom)
			->SetSubject($sSubject)
		;

		$oMessage->AddText($sText, false);

		return $oMessage;
	}

	/**
	 * @return array
	 */
	public function AjaxMessageSend()
	{
		$oAccount = $this->getAccountFromParam();

		$sSentFolder = $this->getParamValue('SentFolder', '');
		$sDraftFolder = $this->getParamValue('DraftFolder', '');
		$sDraftUid = $this->getParamValue('DraftUid', '');
		$aDraftInfo = $this->getParamValue('DraftInfo', null);

		$sFetcherID = $this->getParamValue('FetcherID', '');

		$oFetcher = null;
		if (!empty($sFetcherID) && is_numeric($sFetcherID) && 0 < (int) $sFetcherID)
		{
			$iFetcherID = (int) $sFetcherID;

			$oApiFetchers = $this->ApiFetchers();
			$aFetchers = $oApiFetchers->GetFetchers($oAccount);
			if (is_array($aFetchers) && 0 < count($aFetchers))
			{
				foreach ($aFetchers as /* @var $oFetcherItem \CFetcher */ $oFetcherItem)
				{
					if ($oFetcherItem && $iFetcherID === $oFetcherItem->IdFetcher && $oAccount->IdUser === $oFetcherItem->IdUser)
					{
						$oFetcher = $oFetcherItem;
						break;
					}
				}
			}
		}

		$oMessage = $this->buildMessage($oAccount, $oFetcher, false);
		if ($oMessage)
		{
			$bIsDemo = false;
			\CApi::Plugin()->RunHook('plugin-is-demo-account', array(&$oAccount, &$bIsDemo));
			if ($bIsDemo)
			{
				$oRcpt = $oMessage->GetRcpt();
				if ($oRcpt && 0 < $oRcpt->Count())
				{
					$bExternal = false;
					$oRcpt->ForeachList(function (/* @var $oItem \MailSo\Mime\Email */ $oItem) use (&$bExternal) {
						if (!$bExternal && $oItem && !in_array(strtolower($oItem->GetDomain()),
							array('afterlogic.com', 'quickme.net', 'dotterra.net')))
						{
							$bExternal = true;
						}
					});

					if ($bExternal)
					{
						throw new \ProjectSeven\Exceptions\ClientException(\ProjectSeven\Notifications::DemoAccount);
					}
				}
			}

			try
			{
				\CApi::Plugin()->RunHook('webmail.build-message-for-send', array(&$oMessage, $this->getParamValue('PostToBusinessman', 'false'), $this->getParamValue('Text', '')));

				$mResult = $this->oApiMail->MessageSend($oAccount, $oMessage, $oFetcher, $sSentFolder, $sDraftFolder, $sDraftUid);
			}
			catch (\CApiManagerException $oException)
			{
				$iCode = \ProjectSeven\Notifications::CanNotSendMessage;
				switch ($oException->getCode())
				{
					case \Errs::Mail_InvalidRecipients:
						$iCode = \ProjectSeven\Notifications::InvalidRecipients;
						break;
					case \Errs::Mail_CannotSendMessage:
						$iCode = \ProjectSeven\Notifications::CanNotSendMessage;
						break;
					case \Errs::Mail_CannotSaveMessageInSentItems:
						$iCode = \ProjectSeven\Notifications::CannotSaveMessageInSentItems;
						break;
				}

				throw new \ProjectSeven\Exceptions\ClientException($iCode, $oException);
			}

			if ($mResult)
			{
				$oApiContacts = $this->ApiContacts();
				if ($oApiContacts)
				{
					$aCollection = $oMessage->GetRcpt();

					$aEmails = array();
					$aCollection->ForeachList(function ($oEmail) use (&$aEmails) {
						$aEmails[strtolower($oEmail->GetEmail())] = trim($oEmail->GetDisplayName());
					});

					if (is_array($aEmails))
					{
						$oApiContacts->UpdateSuggestTable($oAccount->IdUser, $aEmails);
					}
				}
			}

			if (is_array($aDraftInfo) && 3 === count($aDraftInfo))
			{
				$sDraftInfoType = $aDraftInfo[0];
				$sDraftInfoUid = $aDraftInfo[1];
				$sDraftInfoFolder = $aDraftInfo[2];

				try
				{
					switch (strtolower($sDraftInfoType))
					{
						case 'reply':
						case 'reply-all':
							$this->oApiMail->MessageFlag($oAccount,
								$sDraftInfoFolder, array($sDraftInfoUid),
								\MailSo\Imap\Enumerations\MessageFlag::ANSWERED,
								\EMailMessageStoreAction::Add);
							break;
						case 'forward':
							$this->oApiMail->MessageFlag($oAccount,
								$sDraftInfoFolder, array($sDraftInfoUid),
								'$Forwarded',
								\EMailMessageStoreAction::Add);
							break;
					}
				}
				catch (\Exception $oException) {}
			}
		}

		return $this->DefaultResponse($oAccount, 'MessageSend', $mResult);
	}

	/**
	 * @return array
	 */
	public function AjaxMessageSendConfirmation()
	{
		$oAccount = $this->getAccountFromParam();

		$oMessage = $this->buildConfirmationMessage($oAccount);
		if ($oMessage)
		{
			try
			{
				$mResult = $this->oApiMail->MessageSend($oAccount, $oMessage);
			}
			catch (\CApiManagerException $oException)
			{
				$iCode = \ProjectSeven\Notifications::CanNotSendMessage;
				switch ($oException->getCode())
				{
					case \Errs::Mail_InvalidRecipients:
						$iCode = \ProjectSeven\Notifications::InvalidRecipients;
						break;
					case \Errs::Mail_CannotSendMessage:
						$iCode = \ProjectSeven\Notifications::CanNotSendMessage;
						break;
				}

				throw new \ProjectSeven\Exceptions\ClientException($iCode, $oException);
			}
		}

		return $this->DefaultResponse($oAccount, 'MessageSendConfirmation', $mResult);
	}

	/**
	 * @return array
	 */
	public function AjaxMessageUploadAttachments()
	{
		$oAccount = $this->getAccountFromParam();

		$mResult = false;
		$self = $this;

		try
		{
			$aAttachments = $this->getParamValue('Attachments', array());
			if (is_array($aAttachments) && 0 < count($aAttachments))
			{
				$mResult = array();
				foreach ($aAttachments as $sAttachment)
				{
					$aValues = \CApi::DecodeKeyValues($sAttachment);
					if (is_array($aValues))
					{
						$sFolder = isset($aValues['Folder']) ? $aValues['Folder'] : '';
						$iUid = (int) isset($aValues['Uid']) ? $aValues['Uid'] : 0;
						$sMimeIndex = (string) isset($aValues['MimeIndex']) ? $aValues['MimeIndex'] : '';

						$sTempName = md5($sAttachment);
						if (!$this->ApiFileCache()->FileExists($oAccount, $sTempName))
						{
							$this->oApiMail->MessageMimeStream($oAccount,
								function($rResource, $sContentType, $sFileName, $sMimeIndex = '') use ($oAccount, &$mResult, $sTempName, $sAttachment, $self) {
									if (is_resource($rResource))
									{
										$sContentType = (empty($sFileName)) ? 'text/plain' : \MailSo\Base\Utils::MimeContentType($sFileName);
										$sFileName = $self->clearFileName($sFileName, $sContentType, $sMimeIndex);

										if ($self->ApiFileCache()->PutFile($oAccount, $sTempName, $rResource))
										{
											$mResult[$sTempName] = $sAttachment;
										}
									}
								}, $sFolder, $iUid, $sMimeIndex);
						}
						else
						{
							$mResult[$sTempName] = $sAttachment;
						}
					}
				}
			}
		}
		catch (\Exception $oException)
		{
			throw new \ProjectSeven\Exceptions\ClientException(\ProjectSeven\Notifications::MailServerError, $oException);
		}

		return $this->DefaultResponse($oAccount, 'MessageUploadAttachments', $mResult);
	}

	/**
	 * @return array
	 */
	public function AjaxMessageSave()
	{
		$mResult = false;

		$oAccount = $this->getAccountFromParam();

		$sDraftFolder = $this->getParamValue('DraftFolder', '');
		$sDraftUid = $this->getParamValue('DraftUid', '');

		$sFetcherID = $this->getParamValue('FetcherID', '');

		if (0 === strlen($sDraftFolder))
		{
			throw new \ProjectSeven\Exceptions\ClientException(\ProjectSeven\Notifications::InvalidInputParameter);
		}

		$oFetcher = null;
		if (!empty($sFetcherID) && is_numeric($sFetcherID) && 0 < (int) $sFetcherID)
		{
			$iFetcherID = (int) $sFetcherID;

			$oApiFetchers = $this->ApiFetchers();
			$aFetchers = $oApiFetchers->GetFetchers($oAccount);
			if (is_array($aFetchers) && 0 < count($aFetchers))
			{
				foreach ($aFetchers as /* @var $oFetcherItem \CFetcher */ $oFetcherItem)
				{
					if ($oFetcherItem && $iFetcherID === $oFetcherItem->IdFetcher && $oAccount->IdUser === $oFetcherItem->IdUser)
					{
						$oFetcher = $oFetcherItem;
						break;
					}
				}
			}
		}

		$oMessage = $this->buildMessage($oAccount, $oFetcher);
		if ($oMessage)
		{
			try
			{
				\CApi::Plugin()->RunHook('webmail.build-message-for-save', array(&$oMessage));

				$mResult = $this->oApiMail->MessageSave($oAccount, $oMessage, $sDraftFolder, $sDraftUid);
			}
			catch (\CApiManagerException $oException)
			{
				$iCode = \ProjectSeven\Notifications::CanNotSaveMessage;
				throw new \ProjectSeven\Exceptions\ClientException($iCode, $oException);
			}
		}

		return $this->DefaultResponse($oAccount, 'MessageSave', $mResult);
	}

	/**
	 * @return array
	 */
	private function ajaxMessageSetFlag($sFlagName, $sFunctionName)
	{
		$sFolderFullNameRaw = (string) $this->getParamValue('Folder', '');
		$bSetAction = '1' === (string) $this->getParamValue('SetAction', '0');
		$aUids = \ProjectSeven\Base\Utils::ExplodeIntUids((string) $this->getParamValue('Uids', ''));

		if (0 === strlen(trim($sFolderFullNameRaw)) || !is_array($aUids) || 0 === count($aUids))
		{
			throw new \ProjectSeven\Exceptions\ClientException(\ProjectSeven\Notifications::InvalidInputParameter);
		}

		$oAccount = $this->getAccountFromParam();

		$this->oApiMail->MessageFlag($oAccount, $sFolderFullNameRaw, $aUids, $sFlagName,
			$bSetAction ? \EMailMessageStoreAction::Add : \EMailMessageStoreAction::Remove);

		return $this->TrueResponse($oAccount, $sFunctionName);
	}

	/**
	 * @return array
	 */
	public function AjaxMessageSetFlagged()
	{
		return $this->ajaxMessageSetFlag(\MailSo\Imap\Enumerations\MessageFlag::FLAGGED, 'MessageSetFlagged');
	}

	/**
	 * @return array
	 */
	public function AjaxMessageSetSeen()
	{
		return $this->ajaxMessageSetFlag(\MailSo\Imap\Enumerations\MessageFlag::SEEN, 'MessageSetSeen');
	}

	/**
	 * @return array
	 */
	public function AjaxMessageSetAllSeen()
	{
		$sFolderFullNameRaw = (string) $this->getParamValue('Folder', '');
		$bSetAction = '1' === (string) $this->getParamValue('SetAction', '0');

		if (0 === strlen(trim($sFolderFullNameRaw)))
		{
			throw new \ProjectSeven\Exceptions\ClientException(\ProjectSeven\Notifications::InvalidInputParameter);
		}

		$oAccount = $this->getAccountFromParam();

		$this->oApiMail->MessageFlag($oAccount, $sFolderFullNameRaw, array('1'),
			\MailSo\Imap\Enumerations\MessageFlag::SEEN,
			$bSetAction ? \EMailMessageStoreAction::Add : \EMailMessageStoreAction::Remove, true);

		return $this->TrueResponse($oAccount, 'MessageSetAllSeen');
	}

	/**
	 * @return array
	 */
	public function AjaxQuota()
	{
		$oAccount = $this->getAccountFromParam();

		return $this->DefaultResponse($oAccount, 'Quota', $this->oApiMail->Quota($oAccount));
	}

	/**
	 * @return array
	 */
	public function AjaxEmailSafety()
	{
		$sEmail = (string) $this->getParamValue('Email', '');
		if (0 === strlen(trim($sEmail)))
		{
			throw new \ProjectSeven\Exceptions\ClientException(\ProjectSeven\Notifications::InvalidInputParameter);
		}

		$oAccount = $this->getAccountFromParam();

		$this->oApiUsers->SetSafetySender($oAccount->IdUser, $sEmail);

		return $this->DefaultResponse($oAccount, 'EmailSafety', true);
	}

	/**
	 * @return array
	 */
	public function AjaxMessage()
	{
		$sFolderFullNameRaw = (string) $this->getParamValue('Folder', '');
		$sUid = trim((string) $this->getParamValue('Uid', ''));
		$sRfc822SubMimeIndex = trim((string) $this->getParamValue('Rfc822MimeIndex', ''));

		$iUid = 0 < strlen($sUid) && is_numeric($sUid) ? (int) $sUid : 0;

		if (0 === strlen(trim($sFolderFullNameRaw)) || 0 >= $iUid)
		{
			throw new \ProjectSeven\Exceptions\ClientException(\ProjectSeven\Notifications::InvalidInputParameter);
		}

		$oAccount = $this->getAccountFromParam();

		$bParseICal = $this->oApiCapability->IsCalendarAppointmentsSupported($oAccount);

		$oMessage = $this->oApiMail->Message($oAccount, $sFolderFullNameRaw, $iUid, $sRfc822SubMimeIndex, $bParseICal);
		if (!($oMessage instanceof \CApiMailMessage))
		{
			throw new \ProjectSeven\Exceptions\ClientException(\ProjectSeven\Notifications::CanNotGetMessage);
		}

		return $this->DefaultResponse($oAccount, 'Message', $oMessage);
	}

	/**
	 * @return array
	 */
	public function AjaxMessages()
	{
		$sFolderFullNameRaw = (string) $this->getParamValue('Folder', '');
		$aUids = $this->getParamValue('Uids', null);

		if (0 === strlen(trim($sFolderFullNameRaw)) || !is_array($aUids) || 0 === count($aUids))
		{
			throw new \ProjectSeven\Exceptions\ClientException(\ProjectSeven\Notifications::InvalidInputParameter);
		}

		$oAccount = $this->getAccountFromParam();

		$bParseICal = $this->oApiCapability->IsCalendarAppointmentsSupported($oAccount);

		$aList = array();
		foreach ($aUids as $iUid)
		{
			if (is_numeric($iUid))
			{
				$oMessage = $this->oApiMail->Message($oAccount, $sFolderFullNameRaw, (int) $iUid, '', $bParseICal);

				if ($oMessage instanceof \CApiMailMessage)
				{
					$aList[] = $oMessage;
				}

				unset($oMessage);
			}
		}

		return $this->DefaultResponse($oAccount, 'Messages', $aList);
	}

	/**
	 * @return array
	 */
	public function AjaxLoginLanguageUpdate()
	{
		$bResult = false;

		$sLanguage = (string) $this->getParamValue('Language', '');
		if (!empty($sLanguage))
		{
			$oApiIntegrator = \CApi::Manager('integrator');
			if ($oApiIntegrator)
			{
				$oApiIntegrator->SetLoginLanguage($sLanguage);
				$bResult = true;
			}
		}

		return $this->DefaultResponse(null, __FUNCTION__, $bResult);
	}

	/**
	 * @return array
	 */
	public function AjaxAccountSignature()
	{
		$oAccount = $this->getAccountFromParam();
		return $this->DefaultResponse($oAccount, __FUNCTION__, array(
			'Type' => $oAccount->SignatureType,
			'Options' => $oAccount->SignatureOptions,
			'Signature' => $oAccount->Signature
		));
	}

	/**
	 * @return array
	 */
	public function AjaxUpdateAccountSignature()
	{
		$oAccount = $this->getAccountFromParam();

		$oAccount->Signature = (string) $this->oHttp->GetPost('Signature', $oAccount->Signature);
		$oAccount->SignatureType = (string) $this->oHttp->GetPost('Type', $oAccount->SignatureType);
		$oAccount->SignatureOptions = (string) $this->oHttp->GetPost('Options', $oAccount->SignatureOptions);

		return $this->DefaultResponse($oAccount, __FUNCTION__, $this->oApiUsers->UpdateAccount($oAccount));
	}

	/**
	 * @return array
	 */
	public function AjaxAccountDelete()
	{
		$bResult = false;
		$oAccount = $this->getDefaultAccountFromParam();

		$iAccountIDToDelete = (int) $this->oHttp->GetPost('AccountIDToDelete', 0);
		if (0 < $iAccountIDToDelete)
		{
			$oAccountToDelete = null;
			if ($oAccount->IdAccount === $iAccountIDToDelete)
			{
				$oAccountToDelete = $oAccount;
			}
			else
			{
				$oAccountToDelete = $this->oApiUsers->GetAccountById($iAccountIDToDelete);
			}

			if ($oAccountToDelete instanceof \CAccount &&
				$oAccountToDelete->IdUser === $oAccount->IdUser &&
				!$oAccountToDelete->IsInternal &&
				((0 < $oAccount->IdDomain && $oAccount->Domain->AllowUsersChangeEmailSettings) || !$oAccount->IsDefaultAccount || 0 === $oAccount->IdDomain || -1 === $oAccount->IdDomain)
			)
			{
				$bResult = $this->oApiUsers->DeleteAccount($oAccountToDelete);
			}
		}

		return $this->DefaultResponse($oAccount, __FUNCTION__, $bResult);
	}

	/**
	 * @param bool $bIsUpdate
	 * @param \CAccount $oAccount
	 */
	private function populateAccountFromHttpPost($bIsUpdate, &$oAccount)
	{
		if ($bIsUpdate && $oAccount->IsDefaultAccount && !$oAccount->Domain->AllowUsersChangeEmailSettings)
		{
			$oAccount->FriendlyName = (string) $this->oHttp->GetPost('FriendlyName', $oAccount->FriendlyName);
		}
		else
		{
			$oAccount->FriendlyName = (string) $this->oHttp->GetPost('FriendlyName', $oAccount->FriendlyName);

			if (!$oAccount->IsInternal)
			{
				$oAccount->IncomingMailPort = (int) $this->oHttp->GetPost('IncomingMailPort');
				$oAccount->OutgoingMailPort = (int) $this->oHttp->GetPost('OutgoingMailPort');
				$oAccount->OutgoingMailAuth = ('2' === (string) $this->oHttp->GetPost('OutgoingMailAuth', '2'))
					? \ESMTPAuthType::AuthCurrentUser : \ESMTPAuthType::NoAuth;

				$oAccount->IncomingMailServer = (string) $this->oHttp->GetPost('IncomingMailServer', '');
				$oAccount->IncomingMailLogin = (string) $this->oHttp->GetPost('IncomingMailLogin', '');

				$oAccount->OutgoingMailServer = (string) $this->oHttp->GetPost('OutgoingMailServer', '');

				if (!$bIsUpdate)
				{
					$oAccount->IncomingMailProtocol = \EMailProtocol::IMAP4;

					$sIncomingMailPassword = (string) $this->oHttp->GetPost('IncomingMailPassword', '');
					if (API_DUMMY !== $sIncomingMailPassword)
					{
						$oAccount->IncomingMailPassword = $sIncomingMailPassword;
					}

					$oAccount->OutgoingMailLogin = (string) $this->oHttp->GetPost('OutgoingMailLogin', '');
					$sOutgoingMailPassword = (string) $this->oHttp->GetPost('OutgoingMailPassword', '');
					if (API_DUMMY !== $sOutgoingMailPassword)
					{
						$oAccount->OutgoingMailPassword = $sOutgoingMailPassword;
					}
				}
			}

			if (!$bIsUpdate)
			{
				$oAccount->Email = (string) $this->oHttp->GetPost('Email', '');
			}
		}
	}

	/**
	 * @return array
	 */
	public function AjaxUpdateAccountPassword()
	{
		$bResult = false;
		$oAccount = $this->getAccountFromParam();

		$sCurrentIncomingMailPassword = (string) $this->oHttp->GetPost('CurrentIncomingMailPassword', '');
		$sNewIncomingMailPassword = (string) $this->oHttp->GetPost('NewIncomingMailPassword', '');

		if ($oAccount->IsEnabledExtension(\CAccount::ChangePasswordExtension) &&
			0 < strlen($sNewIncomingMailPassword) &&
			$sCurrentIncomingMailPassword === $oAccount->IncomingMailPassword)
		{
			$oAccount->PreviousMailPassword = $oAccount->IncomingMailPassword;
			$oAccount->IncomingMailPassword = $sNewIncomingMailPassword;

			try
			{
				$bResult = $this->oApiUsers->UpdateAccount($oAccount);
			}
			catch (\Exception $oException)
			{
				if ($oException && $oException instanceof \CApiErrorCodes &&
					\CApiErrorCodes::UserManager_AccountOldPasswordNotCorrect === $oException->getCode())
				{
					throw new \ProjectSeven\Exceptions\ClientException(\ProjectSeven\Notifications::AccountOldPasswordNotCorrect, $oException);
				}

				throw new \ProjectSeven\Exceptions\ClientException(\ProjectSeven\Notifications::CanNotChangePassword, $oException);
			}
		}

		return $this->DefaultResponse($oAccount, __FUNCTION__, $bResult);
	}

	/**
	 * @return array
	 */
	public function AjaxAccountCreate()
	{
		$bResult = false;
		$oNewAccount = null;
		$oAccount = $this->getDefaultAccountFromParam();

		$oApiDomains = \CApi::Manager('domains');
		$oDomain = $oApiDomains->GetDefaultDomain();
		if ($oDomain)
		{
			$oNewAccount = new \CAccount($oDomain);
			$oNewAccount->IdUser = $oAccount->IdUser;
			$oNewAccount->IsDefaultAccount = false;

			$this->populateAccountFromHttpPost(false, $oNewAccount);

			// TODO
			$oNewAccount->IncomingMailUseSSL = in_array($oNewAccount->IncomingMailPort, array(993, 995));
			$oNewAccount->OutgoingMailUseSSL = in_array($oNewAccount->OutgoingMailPort, array(465));

			if ($this->oApiUsers->CreateAccount($oNewAccount))
			{
				$bResult = true;
			}
			else
			{
				$iClientErrorCode = \ProjectSeven\Notifications::CanNotCreateAccount;
				$oException = $this->oApiUsers->GetLastException();
				if ($oException)
				{
					switch ($oException->getCode())
					{
						case \Errs::WebMailManager_AccountDisabled:
						case \Errs::UserManager_AccountAuthenticationFailed:
						case \Errs::WebMailManager_AccountAuthentication:
						case \Errs::WebMailManager_NewUserRegistrationDisabled:
						case \Errs::WebMailManager_AccountWebmailDisabled:
							$iClientErrorCode = \ProjectSeven\Notifications::AuthError;
							break;
						case \Errs::UserManager_AccountConnectToMailServerFailed:
						case \Errs::WebMailManager_AccountConnectToMailServerFailed:
							$iClientErrorCode = \ProjectSeven\Notifications::MailServerError;
							break;
						case \Errs::UserManager_LicenseKeyInvalid:
						case \Errs::UserManager_AccountCreateUserLimitReached:
						case \Errs::UserManager_LicenseKeyIsOutdated:
							$iClientErrorCode = \ProjectSeven\Notifications::LicenseProblem;
							break;
						case \Errs::Db_ExceptionError:
							$iClientErrorCode = \ProjectSeven\Notifications::DataBaseError;
							break;
					}
				}

				return $this->FalseResponse($oAccount, __FUNCTION__, $iClientErrorCode);
			}
		}

		return $this->DefaultResponse($oAccount, __FUNCTION__,
			$bResult && $oNewAccount ? $oNewAccount->IdAccount : false);
	}

	/**
	 * @return array
	 */
	public function AjaxAccountSettings()
	{
		$oAccount = $this->getAccountFromParam();
		$aResult = array();

		$aResult['IsLinked'] = 0 < $oAccount->IdDomain;
		$aResult['IsInternal'] = (bool) $oAccount->IsInternal;
		$aResult['IsDefault'] = (bool) $oAccount->IsDefaultAccount;

		$aResult['FriendlyName'] = $oAccount->FriendlyName;
		$aResult['Email'] = $oAccount->Email;

		$aResult['IncomingMailServer'] = $oAccount->IncomingMailServer;
		$aResult['IncomingMailPort'] = $oAccount->IncomingMailPort;
		$aResult['IncomingMailLogin'] = $oAccount->IncomingMailLogin;

		$aResult['OutgoingMailServer'] = $oAccount->OutgoingMailServer;
		$aResult['OutgoingMailPort'] = $oAccount->OutgoingMailPort;
		$aResult['OutgoingMailLogin'] = $oAccount->OutgoingMailLogin;
		$aResult['OutgoingMailAuth'] = $oAccount->OutgoingMailAuth;

		$aResult['Extensions'] = array();

		// extensions
		if ($oAccount->IsEnabledExtension(\CAccount::IgnoreSubscribeStatus) &&
			!$oAccount->IsEnabledExtension(\CAccount::DisableManageSubscribe))
		{
			$oAccount->EnableExtension(\CAccount::DisableManageSubscribe);
		}

		$aExtensions = $oAccount->GetExtensions();
		foreach ($aExtensions as $sExtensionName)
		{
			if ($oAccount->IsEnabledExtension($sExtensionName))
			{
				$aResult['Extensions'][] = $sExtensionName;
			}
		}

		return $this->DefaultResponse($oAccount, __FUNCTION__, $aResult);
	}

	/**
	 * @return array
	 */
	public function AjaxAppData()
	{
		$oApiIntegratorManager = \CApi::Manager('integrator');
		return $this->DefaultResponse(null, __FUNCTION__, $oApiIntegratorManager ? $oApiIntegratorManager->AppData() : false);
	}

	/**
	 * @return array
	 */
	public function AjaxSyncSettings()
	{
		$oAccount = $this->getDefaultAccountFromParam();
		$aResult = array(
			'Mobile' => $this->mobileSyncSettings($oAccount),
			'Outlook' => $this->outlookSyncSettings($oAccount)
		);

		return $this->DefaultResponse($oAccount, 'SyncSettings', $aResult);
	}

	/**
	 * @return array
	 */
	public function AjaxUpdateAccountSettings()
	{
		$oAccount = $this->getAccountFromParam();

		$this->populateAccountFromHttpPost(true, $oAccount);

		return $this->DefaultResponse($oAccount, 'UpdateAccountSettings', $this->oApiUsers->UpdateAccount($oAccount));
	}

	/**
	 * @return array
	 */
	public function AjaxUpdateUserSettings()
	{
		$oAccount = $this->getAccountFromParam();

		$iMailsPerPage = (int) $this->oHttp->GetPost('MailsPerPage', $oAccount->User->MailsPerPage);
		if ($iMailsPerPage < 1)
		{
			$iMailsPerPage = 1;
		}

		$iContactsPerPage = (int) $this->oHttp->GetPost('ContactsPerPage', $oAccount->User->ContactsPerPage);
		if ($iContactsPerPage < 1)
		{
			$iContactsPerPage = 1;
		}

		$iAutoCheckMailInterval = (int) $this->oHttp->GetPost('AutoCheckMailInterval', $oAccount->User->AutoCheckMailInterval);
		if (!in_array($iAutoCheckMailInterval, array(0, 1, 3, 5, 10, 15, 20, 30)))
		{
			$iAutoCheckMailInterval = 0;
		}

		$iLayout = (int) $this->oHttp->GetPost('Layout', $oAccount->User->Layout);
		$iDefaultEditor = (int) $this->oHttp->GetPost('DefaultEditor', $oAccount->User->DefaultEditor);
		$bUseThreads = '1' === (string) $this->oHttp->GetPost('UseThreads', $oAccount->User->UseThreads ? '1' : '0');

		$sTheme = (string) $this->oHttp->GetPost('DefaultTheme', $oAccount->User->DefaultSkin);
//		$sTheme = $this->validateTheme($sTheme);

		$sLang = (string) $this->oHttp->GetPost('DefaultLanguage', $oAccount->User->DefaultLanguage);
//		$sLang = $this->validateLang($sLang);

		$sDateFormat = (string) $this->oHttp->GetPost('DefaultDateFormat', $oAccount->User->DefaultDateFormat);
		$iTimeFormat = (int) $this->oHttp->GetPost('DefaultTimeFormat', $oAccount->User->DefaultTimeFormat);

		$oAccount->User->MailsPerPage = $iMailsPerPage;
		$oAccount->User->ContactsPerPage = $iContactsPerPage;
		$oAccount->User->Layout = $iLayout;
		$oAccount->User->DefaultSkin = $sTheme;
		$oAccount->User->DefaultEditor = $iDefaultEditor;
		$oAccount->User->DefaultLanguage = $sLang;
		$oAccount->User->DefaultDateFormat = $sDateFormat;
		$oAccount->User->DefaultTimeFormat = $iTimeFormat;
		$oAccount->User->AutoCheckMailInterval = $iAutoCheckMailInterval;
		$oAccount->User->UseThreads = $bUseThreads;

		// calendar
		$oCalUser = $this->oApiUsers->GetOrCreateCalUserByUserId($oAccount->IdUser);
		if ($oCalUser)
		{
			$oCalUser->ShowWeekEnds = (bool) $this->oHttp->GetPost('ShowWeekEnds', $oCalUser->ShowWeekEnds);
			$oCalUser->ShowWorkDay = (bool) $this->oHttp->GetPost('ShowWorkDay', $oCalUser->ShowWorkDay);
			$oCalUser->WorkDayStarts = (int) $this->oHttp->GetPost('WorkDayStarts', $oCalUser->WorkDayStarts);
			$oCalUser->WorkDayEnds = (int) $this->oHttp->GetPost('WorkDayEnds', $oCalUser->WorkDayEnds);
			$oCalUser->WeekStartsOn = (int) $this->oHttp->GetPost('WeekStartsOn', $oCalUser->WeekStartsOn);
			$oCalUser->DefaultTab = (int) $this->oHttp->GetPost('DefaultTab', $oCalUser->DefaultTab);
		}

		return $this->DefaultResponse($oAccount, 'UpdateUserSettings', $this->oApiUsers->UpdateAccount($oAccount) &&
			$oCalUser && $this->oApiUsers->UpdateCalUser($oCalUser));
	}

	/**
	 * @return array
	 */
	public function AjaxUpdateHelpdeskUserSettings()
	{
		$oAccount = $this->getAccountFromParam();

		$oAccount->User->AllowHelpdeskNotifications =  (bool) $this->oHttp->GetPost('AllowHelpdeskNotifications', $oAccount->User->AllowHelpdeskNotifications);

		return $this->DefaultResponse($oAccount, __FUNCTION__, $this->oApiUsers->UpdateAccount($oAccount));
	}

	/**
	 * @return array
	 */
	public function AjaxLogin()
	{
		$sEmail = trim((string) $this->getParamValue('Email', ''));
		$sIncLogin = (string) $this->getParamValue('IncLogin', '');
		$sIncPassword = (string) $this->getParamValue('IncPassword', '');
		$sLanguage = (string) $this->getParamValue('Language', '');

		$bSignMe = '1' === (string) $this->getParamValue('SignMe', '0');

		$oSettings =& \CApi::GetSettings();
		$iLimitCaptcha = (int) \CApi::GetConf('captcha.limit-count', 0);

		$bCaptchaLimit = false;
		if ($oSettings && $oSettings->GetConf('WebMail/UseReCaptcha'))
		{
			if (0 < $iLimitCaptcha)
			{
				$bCaptchaLimit = true;
				$iLimitCaptcha -= \CApi::CatchaLocalLimit();
			}

			if (1 === $iLimitCaptcha)
			{
				$GLOBALS['P7_CAPTCHA_ATTRIBUTE_ON_ERROR'] = true;
			}
			else if (0 >= $iLimitCaptcha)
			{
				include_once PSEVEN_APP_ROOT_PATH.'libraries/recaptcha/recaptchalib.php';

				$oResp = \recaptcha_check_answer(
					\CApi::GetConf('captcha.recaptcha-private-key', ''),
					isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : '',
					(string) $this->getParamValue('ReCaptchaChallengeField', ''),
					(string) $this->getParamValue('ReCaptchaResponseField', '')
				);

				if (!$oResp || !$oResp->is_valid)
				{
					$GLOBALS['P7_CAPTCHA_ATTRIBUTE_ON_ERROR'] = true;
					throw new \ProjectSeven\Exceptions\ClientException(\ProjectSeven\Notifications::CaptchaError);
				}
			}
		}

		$sAtDomain = trim($oSettings->GetConf('WebMail/LoginAtDomainValue'));
		if (\ELoginFormType::Login === (int) $oSettings->GetConf('WebMail/LoginFormType') && 0 < strlen($sAtDomain))
		{
			$sEmail = \api_Utils::GetAccountNameFromEmail($sIncLogin).'@'.$sAtDomain;
			$sIncLogin = $sEmail;
		}

		if (0 === strlen($sIncPassword) || 0 === strlen($sEmail.$sIncLogin))
		{
			if ($bCaptchaLimit)
			{
				\CApi::CatchaLocalLimit(true);
			}

			throw new \ProjectSeven\Exceptions\ClientException(\ProjectSeven\Notifications::InvalidInputParameter);
		}

		try
		{
			if (0 === strlen($sLanguage))
			{
				$sLanguage = $this->oApiIntegrator->GetLoginLanguage();
			}

			$oAccount = $this->oApiIntegrator->LoginToAccount(
				$sEmail, $sIncPassword, $sIncLogin, $sLanguage
			);
		}
		catch (\Exception $oException)
		{
			$iErrorCode = \ProjectSeven\Notifications::UnknownError;
			if ($oException instanceof \CApiManagerException)
			{
				switch ($oException->getCode())
				{
					case \Errs::WebMailManager_AccountDisabled:
					case \Errs::WebMailManager_AccountWebmailDisabled:
						$iErrorCode = \ProjectSeven\Notifications::AuthError;
						break;
					case \Errs::UserManager_AccountAuthenticationFailed:
					case \Errs::WebMailManager_AccountAuthentication:
					case \Errs::WebMailManager_NewUserRegistrationDisabled:
					case \Errs::WebMailManager_AccountCreateOnLogin:
					case \Errs::Mail_AccountAuthentication:
					case \Errs::Mail_AccountLoginFailed:
						$iErrorCode = \ProjectSeven\Notifications::AuthError;
						break;
					case \Errs::UserManager_AccountConnectToMailServerFailed:
					case \Errs::WebMailManager_AccountConnectToMailServerFailed:
					case \Errs::Mail_AccountConnectToMailServerFailed:
						$iErrorCode = \ProjectSeven\Notifications::MailServerError;
						break;
					case \Errs::UserManager_LicenseKeyInvalid:
					case \Errs::UserManager_AccountCreateUserLimitReached:
					case \Errs::UserManager_LicenseKeyIsOutdated:
					case \Errs::TenantsManager_AccountCreateUserLimitReached:
						$iErrorCode = \ProjectSeven\Notifications::LicenseProblem;
						break;
					case \Errs::Db_ExceptionError:
						$iErrorCode = \ProjectSeven\Notifications::DataBaseError;
						break;
				}
			}

			if ($bCaptchaLimit)
			{
				\CApi::CatchaLocalLimit(true);
			}

			throw new \ProjectSeven\Exceptions\ClientException($iErrorCode);
		}

		if ($oAccount instanceof \CAccount)
		{
			if ($bCaptchaLimit)
			{
				\CApi::CatchaLocalLimit(false, true);
			}

			$this->oApiIntegrator->SetAccountAsLoggedIn($oAccount, $bSignMe);
			return $this->TrueResponse($oAccount, __FUNCTION__);
		}

		if ($bCaptchaLimit)
		{
			\CApi::CatchaLocalLimit(true);
		}

		throw new \ProjectSeven\Exceptions\ClientException(\ProjectSeven\Notifications::AuthError);
	}

	/**
	 * @return array
	 */
	public function AjaxFilesUpload()
	{
		$oAccount = $this->getAccountFromParam();

		$mResult = false;
		if ($this->oApiCapability->IsFilesSupported($oAccount))
		{
			$aFiles = $this->getParamValue('Hashes', null);
			if (is_array($aFiles) && 0 < count($aFiles))
			{
				$mResult = array();
				foreach ($aFiles as $sHash)
				{
					$aData = \CApi::DecodeKeyValues($sHash);
					if (\is_array($aData) && 0 < \count($aData))
					{
						$rFile = $this->oApiFilestorage->GetFile($oAccount, $aData['Type'], $aData['Path'], $aData['Name']);
						$sTempName = md5('Files/Tmp/'.$aData['Type'].$aData['Path'].$aData['Name'].microtime(true).rand(1000, 9999));

						if (is_resource($rFile) && $this->ApiFileCache()->PutFile($oAccount, $sTempName, $rFile))
						{
							$aItem = array(
								'Name' => $aData['Name'],
								'TempName' => $sTempName,
								'Size' => (int) $aData['Size'],
								'Hash' => $sHash,
								'MimeType' => ''
							);

							$aItem['MimeType'] = \MailSo\Base\Utils::MimeContentType($aItem['Name']);
							$aItem['NewHash'] = \CApi::EncodeKeyValues(array(
								'TempFile' => true,
								'AccountID' => $oAccount->IdAccount,
								'Name' => $aItem['Name'],
								'TempName' => $sTempName
							));

							$mResult[] = $aItem;

							if (is_resource($rFile))
							{
								@fclose($rFile);
							}
						}
					}
				}
			}
			else
			{
				throw new \ProjectSeven\Exceptions\ClientException(\ProjectSeven\Notifications::InvalidInputParameter);
			}
		}
		else
		{
			throw new \ProjectSeven\Exceptions\ClientException(\ProjectSeven\Notifications::FilesNotAllowed);
		}

		return $this->DefaultResponse($oAccount, __FUNCTION__, $mResult);
	}

	/**
	 * @return array
	 */
	public function AjaxGetTwilioToken()
	{
		$oAccount = $this->getAccountFromParam();
		$oTenant = $this->oApiTenants->GetTenantById($oAccount->IdTenant);

		$mToken = false;
		if ( $this->oApiCapability->IsVoiceSupported($oAccount) &&
			file_exists(PSEVEN_APP_ROOT_PATH.'libraries/Services/Twilio.php') )
		{
			try
			{
				include PSEVEN_APP_ROOT_PATH.'libraries/Services/Twilio.php';

				if ($oTenant)
				{
					// put your Twilio API credentials here
					$sAccountSid = $oTenant->TwilioAccountSID;
					$sAuthToken = $oTenant->TwilioAuthToken;

					// put your Twilio Application Sid here
					$sAppSid = $oTenant->TwilioAppSID;
				}
				else
				{
					$oSettings =& \CApi::GetSettings();
					// put your Twilio API credentials here
					$sAccountSid = $oSettings->GetConf('Twilio/AccountSID');
					$sAuthToken = $oSettings->GetConf('Twilio/AuthToken');

					// put your Twilio Application Sid here
					$sAppSid = $oSettings->GetConf('Twilio/AppSID');
				}

				$oCapability = new \Services_Twilio_Capability($sAccountSid, $sAuthToken);
				$oCapability->allowClientOutgoing($sAppSid);
				\CApi::Log('twilio_debug');
				\CApi::Log($sAccountSid);
				\CApi::Log($sAuthToken);
				\CApi::Log($sAppSid);
				\CApi::Log('TwilioAftId_'.$oAccount->User->SipImpi);
				$oCapability->allowClientIncoming('TwilioAftId_'.$oAccount->User->SipImpi);
//				$oCapability->allowClientIncoming('TwilioAftId_'.$oAccount->IdTenant.'_'.$oAccount->User->SipImpi);

				$mToken = $oCapability->generateToken();
			}
			catch (\Exception $oE)
			{
				\CApi::LogException($oE);
			}
		}
		else
		{
			throw new \ProjectSeven\Exceptions\ClientException(\ProjectSeven\Notifications::VoiceNotAllowed);
		}

		return $this->DefaultResponse($oAccount, __FUNCTION__, $mToken);
	}

	/**
	 * @return array
	 */
	public function AjaxContactVCardUpload()
	{
		$oAccount = $this->getAccountFromParam();

		$mResult = false;
		if ($this->oApiCapability->IsContactsSupported($oAccount))
		{
			$bGlobal = '1' === (string) $this->getParamValue('Global', '0');
			$sContactId = (string) $this->getParamValue('ContactId', '');

			if ($bGlobal)
			{
				if (!$this->oApiCapability->IsGlobalContactsSupported($oAccount, true))
				{
					throw new \ProjectSeven\Exceptions\ClientException(\ProjectSeven\Notifications::ContactsNotAllowed);
				}
			}
			else
			{
				if (!$this->oApiCapability->IsPersonalContactsSupported($oAccount))
				{
					throw new \ProjectSeven\Exceptions\ClientException(\ProjectSeven\Notifications::ContactsNotAllowed);
				}
			}

			$oApiContacts = $this->ApiContacts();
			$oApiGContacts = $this->ApiGContacts();

			$oContact = $bGlobal ?
				$oApiGContacts->GetContactById($oAccount, $sContactId) :
				$oApiContacts->GetContactById($oAccount->IdUser, $sContactId);

			if ($oContact)
			{
				$sTempName = md5('VCARD/'.$oAccount->IdUser.'/'.$oContact->IdContact.'/'.($bGlobal ? '1' : '0').'/');

				$oVCard = new \Sabre\VObject\Component\VCard();
				\CApiContactsVCardHelper::UpdateVCardFromContact($oContact, $oVCard);
				$sData = $oVCard->serialize();

				if ($this->ApiFileCache()->Put($oAccount, $sTempName, $sData))
				{
					$mResult = array(
						'Name' => 'contact-'.$oContact->IdContact.'.vcf',
						'TempName' => $sTempName,
						'MimeType' => 'text/vcard',
						'Size' => strlen($sData),
						'Hash' => ''
					);

					$mResult['MimeType'] = \MailSo\Base\Utils::MimeContentType($mResult['Name']);
					$mResult['Hash'] = \CApi::EncodeKeyValues(array(
						'TempFile' => true,
						'AccountID' => $oAccount->IdAccount,
						'Name' => $mResult['Name'],
						'TempName' => $sTempName
					));

					return $this->DefaultResponse($oAccount, __FUNCTION__, $mResult);
				}
			}

			throw new \ProjectSeven\Exceptions\ClientException(\ProjectSeven\Notifications::CanNotGetContact);
		}
		else
		{
			throw new \ProjectSeven\Exceptions\ClientException(\ProjectSeven\Notifications::ContactsNotAllowed);
		}

		return $this->DefaultResponse($oAccount, __FUNCTION__, $mResult);
	}

	/**
	 * @return array
	 */
	public function AjaxContact()
	{
		$oContact = false;
		$oAccount = $this->getAccountFromParam();

		if ($this->oApiCapability->IsPersonalContactsSupported($oAccount))
		{
			$oApiContacts = $this->ApiContacts();

			$sContactId = (string) $this->getParamValue('ContactId', '');

			$oContact = $oApiContacts->GetContactById($oAccount->IdUser, $sContactId);
		}
		else
		{
			throw new \ProjectSeven\Exceptions\ClientException(\ProjectSeven\Notifications::ContactsNotAllowed);
		}

		return $this->DefaultResponse($oAccount, __FUNCTION__, $oContact);
	}

	/**
	 * @return array
	 */
	public function AjaxContactByEmail()
	{
		$oContact = false;
		$oAccount = $this->getAccountFromParam();

		$sEmail = (string) $this->getParamValue('Email', '');

		if ($this->oApiCapability->IsPersonalContactsSupported($oAccount))
		{
			$oApiContacts = $this->ApiContacts();
			if ($oApiContacts)
			{
				$oContact = $oApiContacts->GetContactByEmail($oAccount->IdUser, $sEmail);
			}
		}

		if (!$oContact && $this->oApiCapability->IsGlobalContactsSupported($oAccount, true))
		{
			$oApiGContacts = $this->ApiGContacts();
			if ($oApiGContacts)
			{
				$oContact = $oApiGContacts->GetContactByEmail($oAccount, $sEmail);
			}
		}

		return $this->DefaultResponse($oAccount, __FUNCTION__, $oContact);
	}

	/**
	 * @return array
	 */
	public function AjaxAddContactsToGroup()
	{
		$oAccount = $this->getAccountFromParam();

		if ($this->oApiCapability->IsPersonalContactsSupported($oAccount))
		{
			$bGlobal = '1' === (string) $this->getParamValue('Global', '0');
			$sGroupId = (string) $this->getParamValue('GroupId', '');

			$aContactsId = explode(',', $this->getParamValue('ContactsId', ''));
			$aContactsId = array_map('trim', $aContactsId);

			if ($bGlobal && !$this->oApiCapability->IsGlobalContactsSupported($oAccount, true))
			{
				throw new \ProjectSeven\Exceptions\ClientException(\ProjectSeven\Notifications::ContactsNotAllowed);
			}
			else
			{
				$oApiContacts = $this->ApiContacts();

				$oGroup = $oApiContacts->GetGroupById($oAccount->IdUser, $sGroupId);
				if ($oGroup)
				{
					if ($bGlobal)
					{
						return $this->DefaultResponse($oAccount, __FUNCTION__,
							$oApiContacts->AddGlobalContactsToGroup($oAccount, $oGroup, $aContactsId));
					}
					else
					{
						return $this->DefaultResponse($oAccount, __FUNCTION__,
							$oApiContacts->AddContactsToGroup($oGroup, $aContactsId));
					}
				}
			}

			return $this->DefaultResponse($oAccount, __FUNCTION__, false);
		}
		else
		{
			throw new \ProjectSeven\Exceptions\ClientException(\ProjectSeven\Notifications::ContactsNotAllowed);
		}

		return $this->DefaultResponse($oAccount, __FUNCTION__, false);
	}

	/**
	 * @return array
	 */
	public function AjaxRemoveContactsFromGroup()
	{
		$oAccount = $this->getAccountFromParam();

		if ($this->oApiCapability->IsPersonalContactsSupported($oAccount) ||
			$this->oApiCapability->IsGlobalContactsSupported($oAccount, true))
		{
			$oApiContacts = $this->ApiContacts();

			$sGroupId = (string) $this->getParamValue('GroupId', '');

			$aContactsId = explode(',', $this->getParamValue('ContactsId', ''));
			$aContactsId = array_map('trim', $aContactsId);

			$oGroup = $oApiContacts->GetGroupById($oAccount->IdUser, $sGroupId);
			if ($oGroup)
			{
				return $this->DefaultResponse($oAccount, __FUNCTION__,
					$oApiContacts->RemoveContactsFromGroup($oGroup, $aContactsId));
			}

			return $this->DefaultResponse($oAccount, __FUNCTION__, false);
		}
		else
		{
			throw new \ProjectSeven\Exceptions\ClientException(\ProjectSeven\Notifications::ContactsNotAllowed);
		}

		return $this->DefaultResponse($oAccount, __FUNCTION__, false);
	}

	/**
	 * @return array
	 */
	public function AjaxDoServerInitializations()
	{
		$oAccount = $this->getAccountFromParam();

		$bResult = false;

		$oApiIntegrator = \CApi::Manager('integrator');

		if ($oAccount && $oApiIntegrator)
		{
			$oApiIntegrator->ResetCookies();
		}

		$oApiHelpdesk = \CApi::Manager('helpdesk');

		if ($this->oApiCapability->IsGlobalContactsSupported($oAccount, true))
		{
			$oApiContacts = $this->ApiContacts();
			if ($oApiContacts && method_exists($oApiContacts, 'SynchronizeExternalContacts'))
			{
				$bResult = $oApiContacts->SynchronizeExternalContacts($oAccount);
			}
		}

		$oCacher = \CApi::Cacher();

		$bDoGC = false;
		$bDoHepdeskClear = false;
		if ($oCacher && $oCacher->IsInited())
		{
			$iTime = $oCacher->GetTimer('Cache/ClearFileCache');
			if (0 === $iTime || $iTime + 60 * 60 * 24 < time())
			{
				if ($oCacher->SetTimer('Cache/ClearFileCache'))
				{
					$bDoGC = true;
				}
			}

			if ($oApiHelpdesk)
			{
				$iTime = $oCacher->GetTimer('Cache/ClearHelpdeskUsers');
				if (0 === $iTime || $iTime + 60 * 60 * 24 < time())
				{
					if ($oCacher->SetTimer('Cache/ClearHelpdeskUsers'))
					{
						$bDoHepdeskClear = true;
					}
				}
			}
		}

		if ($bDoGC)
		{
			\CApi::Log('GC: FileCache / Start');
			$this->oApiFileCache->GC();
			$oCacher->GC();
			\CApi::Log('GC: FileCache / End');
		}

		if ($bDoHepdeskClear && $oApiHelpdesk)
		{
			\CApi::Log('GC: Clear Unregistred Users');
			$oApiHelpdesk->ClearUnregistredUsers();
		}

		return $this->DefaultResponse($oAccount, __FUNCTION__, $bResult);
	}

	/**
	 * @return array
	 */
	public function AjaxProcessAppointment()
	{
		$oAccount = $this->getAccountFromParam();

		$mResult = false;

		$sCalendarId = (string) $this->getParamValue('CalendarId', '');
		$sTempFile = (string) $this->getParamValue('File', '');
		$sAction = (string) $this->getParamValue('AppointmentAction', '');

		if (empty($sTempFile) || empty($sAction) || empty($sCalendarId))
		{
			throw new \ProjectSeven\Exceptions\ClientException(\ProjectSeven\Notifications::InvalidInputParameter);
		}

		if ($this->oApiCapability->IsCalendarAppointmentsSupported($oAccount))
		{
			$oApiFileCache = /* @var $oApiFileCache CApiFilecacheManager */ \CApi::Manager('filecache');
			$sData = $oApiFileCache->Get($oAccount, $sTempFile);
			if (!empty($sData))
			{
				$oCalendarApi = \CApi::Manager('calendar');
				if ($oCalendarApi)
				{
					$mProcessResult = $oCalendarApi->ProcessICS($oAccount, $sAction, $sCalendarId, $sData);
					if ($mProcessResult)
					{
						$mResult = array(
							'Uid' => $mProcessResult
						);
					}
				}
			}
		}

		return $this->DefaultResponse($oAccount, __FUNCTION__, $mResult);
	}

	/**
	 * @return array
	 */
	public function AjaxSaveIcs()
	{
		$oAccount = $this->getAccountFromParam();

		$mResult = false;

		if (!$this->oApiCapability->IsCalendarSupported($oAccount))
		{
			throw new \ProjectSeven\Exceptions\ClientException(\ProjectSeven\Notifications::CalendarsNotAllowed);
		}

		$sCalendarId = (string) $this->getParamValue('CalendarId', '');
		$sTempFile = (string) $this->getParamValue('File', '');

		if (empty($sCalendarId) || empty($sTempFile))
		{
			throw new \ProjectSeven\Exceptions\ClientException(\ProjectSeven\Notifications::InvalidInputParameter);
		}

		$oApiFileCache = /* @var $oApiFileCache CApiFilecacheManager */ \CApi::Manager('filecache');
		$sData = $oApiFileCache->Get($oAccount, $sTempFile);
		if (!empty($sData))
		{
			$oCalendarApi = \CApi::Manager('calendar');
			if ($oCalendarApi)
			{
				$mCreateEventResult = $oCalendarApi->CreateEventData($oAccount, $sCalendarId, null, $sData);
				if ($mCreateEventResult)
				{
					$mResult = array(
						'Uid' => (string) $mCreateEventResult
					);
				}
			}
		}

		return $this->DefaultResponse($oAccount, __FUNCTION__, $mResult);
	}

	/**
	 * @return array
	 */
	public function AjaxSaveVcf()
	{
		$oAccount = $this->getAccountFromParam();

		$mResult = false;

		if (!$this->oApiCapability->IsPersonalContactsSupported($oAccount))
		{
			throw new \ProjectSeven\Exceptions\ClientException(\ProjectSeven\Notifications::ContactsNotAllowed);
		}

		$sTempFile = (string) $this->getParamValue('File', '');
		if (empty($sTempFile))
		{
			throw new \ProjectSeven\Exceptions\ClientException(\ProjectSeven\Notifications::InvalidInputParameter);
		}

		$oApiFileCache = /* @var $oApiFileCache CApiFilecacheManager */ \CApi::Manager('filecache');
		$sData = $oApiFileCache->Get($oAccount, $sTempFile);
		if (!empty($sData))
		{
			$oContactsApi = $this->ApiContacts();
			if ($oContactsApi)
			{
				$oContact = new \CContact();
				$oContact->InitFromVCardStr($oAccount->IdUser, $sData);

				if ($oContactsApi->CreateContact($oContact))
				{
					$mResult = array(
						'Uid' => $oContact->IdContact
					);
				}
			}
		}

		return $this->DefaultResponse($oAccount, __FUNCTION__, $mResult);
	}

	/**
	 * @return array
	 */
	public function AjaxGlobalContact()
	{
		$oContact = false;
		$oAccount = $this->getAccountFromParam();

		if ($this->oApiCapability->IsGlobalContactsSupported($oAccount, true))
		{
			$oApiGContacts = $this->ApiGContacts();

			$sContactId = (string) $this->getParamValue('ContactId', '');

			$oContact = $oApiGContacts->GetContactById($oAccount, $sContactId);
		}
		else
		{
			throw new \ProjectSeven\Exceptions\ClientException(\ProjectSeven\Notifications::ContactsNotAllowed);
		}

		return $this->DefaultResponse($oAccount, __FUNCTION__, $oContact);
	}

	/**
	 * @return array
	 */
	public function AjaxGroup()
	{
		$oGroup = false;
		$oAccount = $this->getAccountFromParam();

		if ($this->oApiCapability->IsPersonalContactsSupported($oAccount))
		{
			$oApiContacts = $this->ApiContacts();

			$sGroupId = (string) $this->getParamValue('GroupId', '');

			$oGroup = $oApiContacts->GetGroupById($oAccount->IdUser, $sGroupId);
		}
		else
		{
			throw new \ProjectSeven\Exceptions\ClientException(\ProjectSeven\Notifications::ContactsNotAllowed);
		}

		return $this->DefaultResponse($oAccount, __FUNCTION__, $oGroup);
	}

	/**
	 * @return array
	 */
	public function AjaxGroupFullList()
	{
		$oAccount = $this->getAccountFromParam();

		$aList = false;
		if ($this->oApiCapability->IsPersonalContactsSupported($oAccount))
		{
			$oApiContacts = $this->ApiContacts();

			$aList = $oApiContacts->GetGroupItems($oAccount->IdUser,
				\EContactSortField::Name, \ESortOrder::ASC, 0, 999);
		}
		else
		{
			throw new \ProjectSeven\Exceptions\ClientException(\ProjectSeven\Notifications::ContactsNotAllowed);
		}

		return $this->DefaultResponse($oAccount, __FUNCTION__, $aList);
	}

	private function populateSortParams(&$iSortField, &$iSortOrder)
	{
		$sSortField = (string) $this->getParamValue('SortField', 'Email');
		$iSortOrder = '1' === (string) $this->getParamValue('SortOrder', '0') ?
			\ESortOrder::ASC : \ESortOrder::DESC;

		switch (strtolower($sSortField))
		{
			case 'email':
				$iSortField = \EContactSortField::EMail;
				break;
			case 'name':
				$iSortField = \EContactSortField::Name;
				break;
			case 'frequency':
				$iSortField = \EContactSortField::Frequency;
				break;
		}
	}

	/**
	 * @return array
	 */
	public function AjaxContactSuggestions()
	{
		$oAccount = $this->getAccountFromParam();
		$oApiContacts = $this->ApiContacts();

		$sSearch = (string) $this->getParamValue('Search', '');
		$bGlobalOnly = '1' === (string) $this->getParamValue('GlobalOnly', '0');

		$aList = array();

		if ($this->oApiCapability->IsContactsSupported($oAccount))
		{
			$aContacts = $oApiContacts ?
				$oApiContacts->GetSuggestItems($oAccount, $sSearch, \CApi::GetConf('webmail.suggest-contacts-limit', 20), $bGlobalOnly) : null;

			if (is_array($aContacts))
			{
				$aList = $aContacts;
			}
		}

		$aCounts = array(0, 0);

		\CApi::Plugin()->RunHook('webmail.change-suggest-list', array($oAccount, $sSearch, &$aList, &$aCounts));

		return $this->DefaultResponse($oAccount, __FUNCTION__, array(
			'Search' => $sSearch,
			'List' => $aList
		));
	}

	/**
	 * @return array
	 */
	public function AjaxContactList()
	{
		$oAccount = $this->getAccountFromParam();
		$oApiContacts = $this->ApiContacts();

		$iOffset = (int) $this->getParamValue('Offset', 0);
		$iLimit = (int) $this->getParamValue('Limit', 20);
		$sGroupId = (string) $this->getParamValue('GroupId', '');
		$sSearch = (string) $this->getParamValue('Search', '');
		$sFirstCharacter = (string) $this->getParamValue('FirstCharacter', '');

		$iSortField = \EContactSortField::Name;
		$iSortOrder = \ESortOrder::ASC;

		$this->populateSortParams($iSortField, $iSortOrder);

		$iCount = 0;
		if ($this->oApiCapability->IsPersonalContactsSupported($oAccount))
		{
			if ('' === $sGroupId)
			{
				$iCount = $oApiContacts->GetContactItemsCount($oAccount->IdUser, $sSearch, $sFirstCharacter);
			}
			else
			{
				$iCount = $oApiContacts->GetContactItemsCount($oAccount->IdUser, $sSearch, $sFirstCharacter, $sGroupId);
			}

			$aList = array();
			if (0 < $iCount)
			{
				$aContacts = $oApiContacts->GetContactItems(
					$oAccount->IdUser, $iSortField, $iSortOrder, $iOffset,
					$iLimit, $sSearch, $sFirstCharacter, $sGroupId);

				if (is_array($aContacts))
				{
					$aList = $aContacts;
				}
			}
		}
		else
		{
			throw new \ProjectSeven\Exceptions\ClientException(\ProjectSeven\Notifications::ContactsNotAllowed);
		}

		return $this->DefaultResponse($oAccount, __FUNCTION__, array(
			'ContactCount' => $iCount,
			'GroupId' => $sGroupId,
			'Search' => $sSearch,
			'FirstCharacter' => $sFirstCharacter,
			'List' => $aList
		));
	}

	/**
	 * @return array
	 */
	public function AjaxGlobalContactList()
	{
		$oAccount = $this->getAccountFromParam();
		$oApiGContacts = $this->ApiGContacts();

		$iOffset = (int) $this->getParamValue('Offset', 0);
		$iLimit = (int) $this->getParamValue('Limit', 20);
		$sSearch = (string) $this->getParamValue('Search', '');

		$iSortField = \EContactSortField::EMail;
		$iSortOrder = \ESortOrder::ASC;

		$this->populateSortParams($iSortField, $iSortOrder);

		$iCount = 0;
		$aList = array();

		if ($this->oApiCapability->IsGlobalContactsSupported($oAccount, true))
		{
			$iCount = $oApiGContacts->GetContactItemsCount($oAccount, $sSearch);

			if (0 < $iCount)
			{
				$aContacts = $oApiGContacts->GetContactItems(
					$oAccount, $iSortField, $iSortOrder, $iOffset,
					$iLimit, $sSearch);

				if (is_array($aContacts))
				{
					$aList = $aContacts;
				}
			}
		}
		else
		{
			throw new \ProjectSeven\Exceptions\ClientException(\ProjectSeven\Notifications::ContactsNotAllowed);
		}

		return $this->DefaultResponse($oAccount, __FUNCTION__, array(
			'ContactCount' => $iCount,
			'Search' => $sSearch,
			'List' => $aList
		));
	}

	/**
	 * @return array
	 */
	public function AjaxGetAutoresponder()
	{
		$mResult = false;
		$oAccount = $this->getAccountFromParam();

		if ($oAccount && $oAccount->IsEnabledExtension(\CAccount::AutoresponderExtension))
		{
			$aAutoResponderValue = $this->ApiSieve()->GetAutoresponder($oAccount);
			if (isset($aAutoResponderValue['subject'], $aAutoResponderValue['body'], $aAutoResponderValue['enabled']))
			{
				$mResult = array(
					'Enable' => (bool) $aAutoResponderValue['enabled'],
					'Subject' => (string) $aAutoResponderValue['subject'],
					'Message' => (string) $aAutoResponderValue['body']
				);
			}
		}

		return $this->DefaultResponse($oAccount, 'GetAutoresponder', $mResult);
	}

	/**
	 * @return array
	 */
	public function AjaxUpdateAutoresponder()
	{
		$bIsDemo = false;
		$mResult = false;
		$oAccount = $this->getAccountFromParam();
		if ($oAccount && $oAccount->IsEnabledExtension(\CAccount::AutoresponderExtension))
		{
			\CApi::Plugin()->RunHook('plugin-is-demo-account', array(&$oAccount, &$bIsDemo));
			if (!$bIsDemo)
			{
				$bIsEnabled = '1' === $this->getParamValue('Enable', '0');
				$sSubject = (string) $this->getParamValue('Subject', '');
				$sMessage = (string) $this->getParamValue('Message', '');

				$mResult = $this->ApiSieve()->SetAutoresponder($oAccount, $sSubject, $sMessage, $bIsEnabled);
			}
			else
			{
				throw new \ProjectSeven\Exceptions\ClientException(\ProjectSeven\Notifications::DemoAccount);
			}
		}

		return $this->DefaultResponse($oAccount, 'UpdateAutoresponder', $mResult);
	}

	/**
	 * @return array
	 */
	public function AjaxGetForward()
	{
		$mResult = false;
		$oAccount = $this->getAccountFromParam();

		if ($oAccount && $oAccount->IsEnabledExtension(\CAccount::ForwardExtension))
		{
			$aForwardValue = /* @var $aForwardValue array */  $this->ApiSieve()->GetForward($oAccount);
			if (isset($aForwardValue['email'], $aForwardValue['enabled']))
			{
				$mResult = array(
					'Enable' => (bool) $aForwardValue['enabled'],
					'Email' => (string) $aForwardValue['email']
				);
			}
		}

		return $this->DefaultResponse($oAccount, 'GetForward', $mResult);
	}

	/**
	 * @return array
	 */
	public function AjaxUpdateForward()
	{
		$mResult = false;
		$bIsDemo = false;
		$oAccount = $this->getAccountFromParam();

		if ($oAccount && $oAccount->IsEnabledExtension(\CAccount::ForwardExtension))
		{
			\CApi::Plugin()->RunHook('plugin-is-demo-account', array(&$oAccount, &$bIsDemo));
			if (!$bIsDemo)
			{
				$bIsEnabled = '1' === $this->getParamValue('Enable', '0');
				$sForwardEmail = (string) $this->getParamValue('Email', '');

				$mResult = $this->ApiSieve()->SetForward($oAccount, $sForwardEmail, $bIsEnabled);
			}
			else
			{
				throw new \ProjectSeven\Exceptions\ClientException(\ProjectSeven\Notifications::DemoAccount);
			}
		}

		return $this->DefaultResponse($oAccount, 'UpdateForward', $mResult);
	}

	/**
	 * @return array
	 */
	public function AjaxGetSieveFilters()
	{
		$mResult = false;
		$oAccount = $this->getAccountFromParam();

		if ($oAccount && $oAccount->IsEnabledExtension(\CAccount::SieveFiltersExtension))
		{
			$mResult = $this->ApiSieve()->GetSieveFilters($oAccount);
		}

		return $this->DefaultResponse($oAccount, 'GetSieveFilters', $mResult);
	}

	/**
	 * @return array
	 */
	public function AjaxUpdateSieveFilters()
	{
		$mResult = false;
		$oAccount = $this->getAccountFromParam();

		if ($oAccount && $oAccount->IsEnabledExtension(\CAccount::SieveFiltersExtension))
		{
			$aFilters = $this->getParamValue('Filters', array());
			$aFilters = is_array($aFilters) ? $aFilters : array();

			$mResult = array();
			foreach ($aFilters as $aItem)
			{
				$oFilter = new \CFilter($oAccount);
				$oFilter->Enable = '1' === (string) (isset($aItem['Enable']) ? $aItem['Enable'] : '1');
				$oFilter->Field = (int) (isset($aItem['Field']) ? $aItem['Field'] : \EFilterFiels::From);
				$oFilter->Filter = (string) (isset($aItem['Filter']) ? $aItem['Filter'] : '');
				$oFilter->Condition = (int) (isset($aItem['Condition']) ? $aItem['Condition'] : \EFilterCondition::ContainSubstring);
				$oFilter->Action = (int) (isset($aItem['Action']) ? $aItem['Action'] : \EFilterAction::DoNothing);
				$oFilter->FolderFullName = (string) (isset($aItem['FolderFullName']) ? $aItem['FolderFullName'] : '');

				$mResult[] = $oFilter;
			}

			$mResult = $this->ApiSieve()->UpdateSieveFilters($oAccount, $mResult);
		}

		return $this->DefaultResponse($oAccount, 'UpdateSieveFilters', $mResult);
	}

	/**
	 * @param string $sParamName
	 * @param mixed $oObject
	 *
	 * @return void
	 */
	private function paramToObject($sParamName, &$oObject, $sType = 'string')
	{
		switch ($sType)
		{
			default:
			case 'string':
				$oObject->{$sParamName} = (string) $this->getParamValue($sParamName, $oObject->{$sParamName});
				break;
			case 'int':
				$oObject->{$sParamName} = (int) $this->getParamValue($sParamName, $oObject->{$sParamName});
				break;
			case 'bool':
				$oObject->{$sParamName} = '1' === (string) $this->getParamValue($sParamName, $oObject->{$sParamName} ? '1' : '0');
				break;
		}
	}

	/**
	 * @param mixed $oObject
	 * @param array $aParamsNames
	 */
	private function paramsStrToObjectHelper(&$oObject, $aParamsNames)
	{
		foreach ($aParamsNames as $sName)
		{
			$this->paramToObject($sName, $oObject);
		}
	}

	/**
	 * @param \CContact $oContact
	 * @param bool $bItsMe = false
	 */
	private function populateContactObject(&$oContact, $bItsMe = false)
	{
		$iPrimaryEmail = $oContact->PrimaryEmail;
		switch (strtolower($this->getParamValue('PrimaryEmail', '')))
		{
			case 'home':
			case 'personal':
				$iPrimaryEmail = \EPrimaryEmailType::Home;
				break;
			case 'business':
				$iPrimaryEmail = \EPrimaryEmailType::Business;
				break;
			case 'other':
				$iPrimaryEmail = \EPrimaryEmailType::Other;
				break;
		}

		$oContact->PrimaryEmail = $iPrimaryEmail;

		$this->paramToObject('UseFriendlyName', $oContact, 'bool');

		$this->paramsStrToObjectHelper($oContact, array(
			'Title', 'FullName', 'FirstName', 'LastName', 'NickName', 'Skype', 'Facebook',

			'HomeEmail', 'HomeStreet', 'HomeCity', 'HomeState', 'HomeZip',
			'HomeCountry', 'HomeFax', 'HomePhone', 'HomeMobile', 'HomeWeb',

			'BusinessCompany', 'BusinessJobTitle', 'BusinessDepartment',
			'BusinessOffice', 'BusinessStreet', 'BusinessCity', 'BusinessState',  'BusinessZip',
			'BusinessCountry', 'BusinessFax','BusinessPhone', 'BusinessMobile',  'BusinessWeb',

			'OtherEmail', 'Notes', 'ETag'
		));

		if (!$bItsMe)
		{
			$this->paramToObject('BusinessEmail', $oContact);
		}

		$this->paramToObject('BirthdayDay', $oContact, 'int');
		$this->paramToObject('BirthdayMonth', $oContact, 'int');
		$this->paramToObject('BirthdayYear', $oContact, 'int');

		$aGroupsIds = $this->getParamValue('GroupsIds');
		$oContact->GroupsIds = is_array($aGroupsIds) ? array_unique($aGroupsIds) : array();
	}

	/**
	 * @param \CGroup $oGroup
	 */
	private function populateGroupObject(&$oGroup)
	{
		$this->paramsStrToObjectHelper($oGroup, array(
			'Name'
		));
	}

	/**
	 * @return array
	 */
	public function AjaxContactCreate()
	{
		$oAccount = $this->getAccountFromParam();

		if ($this->oApiCapability->IsPersonalContactsSupported($oAccount))
		{
			$oApiContacts = $this->ApiContacts();

			$oContact = new \CContact();
			$oContact->IdUser = $oAccount->IdUser;

			$this->populateContactObject($oContact);

			$oApiContacts->CreateContact($oContact);
			return $this->DefaultResponse($oAccount, __FUNCTION__, $oContact ? array(
				'IdContact' => $oContact->IdContact
			) : false);
		}
		else
		{
			throw new \ProjectSeven\Exceptions\ClientException(\ProjectSeven\Notifications::ContactsNotAllowed);
		}

		return $this->FalseResponse($oAccount, __FUNCTION__);
	}

	/**
	 * @return array
	 */
	public function AjaxGroupCreate()
	{
		$oAccount = $this->getAccountFromParam();

		if ($this->oApiCapability->IsPersonalContactsSupported($oAccount))
		{
			$oApiContacts = $this->ApiContacts();

			$oGroup = new \CGroup();
			$oGroup->IdUser = $oAccount->IdUser;

			$this->populateGroupObject($oGroup);

			$oApiContacts->CreateGroup($oGroup);
			return $this->DefaultResponse($oAccount, __FUNCTION__, $oGroup ? array(
				'IdGroup' => $oGroup->IdGroup
			) : false);
		}
		else
		{
			throw new \ProjectSeven\Exceptions\ClientException(\ProjectSeven\Notifications::ContactsNotAllowed);
		}

		return $this->FalseResponse($oAccount, __FUNCTION__);
	}

	/**
	 * @return array
	 */
	public function AjaxContactDelete()
	{
		$oAccount = $this->getAccountFromParam();

		if ($this->oApiCapability->IsPersonalContactsSupported($oAccount))
		{
			$oApiContacts = $this->ApiContacts();

			$aContactsId = explode(',', $this->getParamValue('ContactsId', ''));
			$aContactsId = array_map('trim', $aContactsId);

			return $this->DefaultResponse($oAccount, __FUNCTION__,
				$oApiContacts->DeleteContacts($oAccount->IdUser, $aContactsId));
		}
		else
		{
			throw new \ProjectSeven\Exceptions\ClientException(\ProjectSeven\Notifications::ContactsNotAllowed);
		}

		return $this->FalseResponse($oAccount, __FUNCTION__);
	}

	/**
	 * @return array
	 */
	public function AjaxGroupDelete()
	{
		$oAccount = $this->getAccountFromParam();

		if ($this->oApiCapability->IsPersonalContactsSupported($oAccount))
		{
			$oApiContacts = $this->ApiContacts();

			$sGroupId = $this->getParamValue('GroupId', '');

			return $this->DefaultResponse($oAccount, __FUNCTION__,
				$oApiContacts->DeleteGroup($oAccount->IdUser, $sGroupId));
		}
		else
		{
			throw new \ProjectSeven\Exceptions\ClientException(\ProjectSeven\Notifications::ContactsNotAllowed);
		}

		return $this->FalseResponse($oAccount, __FUNCTION__);
	}

	/**
	 * @return array
	 */
	public function AjaxContactUpdate()
	{
		$oAccount = $this->getAccountFromParam();

		$bGlobal = '1' === $this->getParamValue('Global', '0');
		$sContactId = $this->getParamValue('ContactId', '');

		if ($bGlobal && $this->oApiCapability->IsGlobalContactsSupported($oAccount, true))
		{
			$oApiContacts = $this->ApiGContacts();
		}
		else if (!$bGlobal && $this->oApiCapability->IsPersonalContactsSupported($oAccount))
		{
			$oApiContacts = $this->ApiContacts();
		}

		if ($oApiContacts)
		{
			$oContact = $oApiContacts->GetContactById($bGlobal ? $oAccount : $oAccount->IdUser, $sContactId);
			if ($oContact)
			{
				$this->populateContactObject($oContact, $oContact->ItsMe);

				if ($oApiContacts->UpdateContact($oContact))
				{
					return $this->TrueResponse($oAccount, __FUNCTION__);
				}
				else
				{
					switch ($oApiContacts->GetLastErrorCode())
					{
						case \Errs::Sabre_PreconditionFailed:
							throw new \ProjectSeven\Exceptions\ClientException(
								\ProjectSeven\Notifications::ContactDataHasBeenModifiedByAnotherApplication);
					}
				}
			}
		}
		else
		{
			throw new \ProjectSeven\Exceptions\ClientException(\ProjectSeven\Notifications::ContactsNotAllowed);
		}

		return $this->FalseResponse($oAccount, __FUNCTION__);
	}

	/**
	 * @return array
	 */
	public function AjaxGroupUpdate()
	{
		$oAccount = $this->getAccountFromParam();
		$oApiContacts = $this->ApiContacts();

		$sGroupId = $this->getParamValue('GroupId', '');

		if ($this->oApiCapability->IsPersonalContactsSupported($oAccount))
		{
			$oGroup = $oApiContacts->GetGroupById($oAccount->IdUser, $sGroupId);
			if ($oGroup)
			{
				$this->populateGroupObject($oGroup);

				if ($oApiContacts->UpdateGroup($oGroup))
				{
					return $this->TrueResponse($oAccount, __FUNCTION__);
				}
				else
				{
					switch ($oApiContacts->GetLastErrorCode())
					{
						case \Errs::Sabre_PreconditionFailed:
							throw new \ProjectSeven\Exceptions\ClientException(
								\ProjectSeven\Notifications::ContactDataHasBeenModifiedByAnotherApplication);
					}
				}
			}
		}
		else
		{
			throw new \ProjectSeven\Exceptions\ClientException(
				\ProjectSeven\Notifications::ContactsNotAllowed);
		}

		return $this->FalseResponse($oAccount, __FUNCTION__);
	}

	public function AjaxFiles()
	{
		$oAccount = $this->getDefaultAccountFromParam();
		if (!$this->oApiCapability->IsFilesSupported($oAccount))
		{
			throw new \ProjectSeven\Exceptions\ClientException(\ProjectSeven\Notifications::FilesNotAllowed);
		}

		$sPath = $this->getParamValue('Path');
		$iType = (int) $this->getParamValue('Type');
		$sPattern = $this->getParamValue('Pattern');

		$oResult = array();
		$oResult['Items'] = $this->oApiFilestorage->GetFiles($oAccount, $iType, $sPath, $sPattern);
		$oResult['Quota'] = $this->oApiFilestorage->GetQuota($oAccount);

		return $this->DefaultResponse($oAccount, __FUNCTION__, $oResult);
	}

	public function AjaxFilesQuota()
	{
		$oAccount = $this->getDefaultAccountFromParam();
		if (!$this->oApiCapability->IsFilesSupported($oAccount))
		{
			throw new \ProjectSeven\Exceptions\ClientException(\ProjectSeven\Notifications::FilesNotAllowed);
		}

		$oResult = array(
			'Quota' => $this->oApiFilestorage->GetQuota($oAccount)
		);

		return $this->DefaultResponse($oAccount, __FUNCTION__, $oResult);
	}

	public function AjaxFilesFolderCreate()
	{
		$oAccount = $this->getDefaultAccountFromParam();
		if (!$this->oApiCapability->IsFilesSupported($oAccount))
		{
			throw new \ProjectSeven\Exceptions\ClientException(\ProjectSeven\Notifications::FilesNotAllowed);
		}

		$iType = (int) $this->getParamValue('Type');
		$sPath = $this->getParamValue('Path');
		$sFolderName = $this->getParamValue('FolderName');
		$oResult = null;

		$oResult = $this->oApiFilestorage->CreateFolder($oAccount, $iType, $sPath, $sFolderName);

		return $this->DefaultResponse($oAccount, __FUNCTION__, $oResult);
	}

	public function AjaxFilesDelete()
	{
		$oAccount = $this->getDefaultAccountFromParam();
		if (!$this->oApiCapability->IsFilesSupported($oAccount))
		{
			throw new \ProjectSeven\Exceptions\ClientException(\ProjectSeven\Notifications::FilesNotAllowed);
		}

		$iType = (int) $this->getParamValue('Type');
		$aItems = @json_decode($this->getParamValue('Items'), true);
		$oResult = false;

		foreach ($aItems as $oItem)
		{
			$oResult = $this->oApiFilestorage->Delete($oAccount, $iType, $oItem['Path'], $oItem['Name']);
		}

		return $this->DefaultResponse($oAccount, __FUNCTION__, $oResult);
	}

	public function AjaxFilesRename()
	{
		$oAccount = $this->getDefaultAccountFromParam();
		if (!$this->oApiCapability->IsFilesSupported($oAccount))
		{
			throw new \ProjectSeven\Exceptions\ClientException(\ProjectSeven\Notifications::FilesNotAllowed);
		}

		$iType = (int) $this->getParamValue('Type');
		$sPath = $this->getParamValue('Path');
		$sName = $this->getParamValue('Name');
		$sNewName = $this->getParamValue('NewName');
		$oResult = null;

		$sNewName = $this->oApiFilestorage->GetNonExistingFileName($oAccount, $iType, $sPath, $sNewName);
		$oResult = $this->oApiFilestorage->Rename($oAccount, $iType, $sPath, $sName, $sNewName);

		return $this->DefaultResponse($oAccount, __FUNCTION__, $oResult);
	}

	public function AjaxFilesCopy()
	{
		$oAccount = $this->getDefaultAccountFromParam();
		if (!$this->oApiCapability->IsFilesSupported($oAccount))
		{
			throw new \ProjectSeven\Exceptions\ClientException(\ProjectSeven\Notifications::FilesNotAllowed);
		}

		$iFromType = (int) $this->getParamValue('FromType');
		$iToType = (int) $this->getParamValue('ToType');
		$sFromPath = $this->getParamValue('FromPath');
		$sToPath = $this->getParamValue('ToPath');
		$aItems = @json_decode($this->getParamValue('Files'), true);
		$oResult = null;

		foreach ($aItems as $aItem)
		{
			$sNewName = $this->oApiFilestorage->GetNonExistingFileName($oAccount, $iToType, $sToPath, $aItem['Name']);
			$oResult = $this->oApiFilestorage->Copy($oAccount, $iFromType, $iToType, $sFromPath, $sToPath, $aItem['Name'], $sNewName);
		}
		return $this->DefaultResponse($oAccount, __FUNCTION__, $oResult);
	}

	public function AjaxFilesMove()
	{
		$oAccount = $this->getDefaultAccountFromParam();
		if (!$this->oApiCapability->IsFilesSupported($oAccount))
		{
			throw new \ProjectSeven\Exceptions\ClientException(\ProjectSeven\Notifications::FilesNotAllowed);
		}

		$iFromType = (int) $this->getParamValue('FromType');
		$iToType = (int) $this->getParamValue('ToType');
		$sFromPath = $this->getParamValue('FromPath');
		$sToPath = $this->getParamValue('ToPath');
		$aItems = @json_decode($this->getParamValue('Files'), true);
		$oResult = null;

		foreach ($aItems as $aItem)
		{
			$sNewName = $this->oApiFilestorage->GetNonExistingFileName($oAccount, $iToType, $sToPath, $aItem['Name']);
			$oResult = $this->oApiFilestorage->Move($oAccount, $iFromType, $iToType, $sFromPath, $sToPath, $aItem['Name'], $sNewName);
		}
		return $this->DefaultResponse($oAccount, __FUNCTION__, $oResult);
	}

	public function AjaxFilesMin()
	{
		$oAccount = $this->getDefaultAccountFromParam();
		if (!$this->oApiCapability->IsFilesSupported($oAccount))
		{
			throw new \ProjectSeven\Exceptions\ClientException(\ProjectSeven\Notifications::FilesNotAllowed);
		}

		$iType = (int) $this->getParamValue('Type');
		$sPath = $this->getParamValue('Path');
		$sName = $this->getParamValue('Name');
		$sSize = $this->getParamValue('Size');

		$sID = implode('|', array($oAccount->IdAccount,	$iType, $sPath, $sName));

		$mResult = false;

		$oMin = \CApi::Manager('min');

		$mMin = $oMin->GetMinByID($sID);
		if (!empty($mMin['__hash__']))
		{
			$mResult = $mMin['__hash__'];
		}
		else
		{
			$mResult = $oMin->CreateMin($sID, array(
					'Account' => $oAccount->IdAccount,
					'Type' => $iType,
					'Path' => $sPath,
					'Name' => $sName,
					'Size' => $sSize
				)
			);
		}

		return $this->DefaultResponse($oAccount, __FUNCTION__, $mResult);
	}

	public function AjaxFilesMinDelete()
	{
		$mResult = false;
		$oAccount = $this->getDefaultAccountFromParam();
		if (!$this->oApiCapability->IsFilesSupported($oAccount))
		{
			throw new \ProjectSeven\Exceptions\ClientException(\ProjectSeven\Notifications::FilesNotAllowed);
		}

		$iType = (int) $this->getParamValue('Type');
		$sPath = $this->getParamValue('Path');
		$sName = $this->getParamValue('Name');

		$sID = implode('|', array($oAccount->IdAccount,	$iType, $sPath, $sName));

		$oMin = \CApi::Manager('min');

		$mResult = $oMin->DeleteMinByID($sID);

		return $this->DefaultResponse($oAccount, __FUNCTION__, $mResult);
	}

	/**
	 * @return array
	 */
	public function AjaxCalendarList()
	{
		$mResult = false;
		$bIsPublic = (bool) $this->getParamValue('IsPublic');
		$sPublicCalendarId = $this->getParamValue('PublicCalendarId');
		$oAccount = null;

		if ($bIsPublic)
		{
			$oCalendar = $this->oApiCalendar->GetPublicCalendar($sPublicCalendarId);
			$mResult = array();
			if ($oCalendar)
			{
				$aCalendar = $this->oApiCalendar->GetCalendarAsArray($oAccount, $oCalendar);
				$mResult = array($aCalendar);
			}
		}
		else
		{
			$oAccount = $this->getDefaultAccountFromParam();
			if (!$this->oApiCapability->IsCalendarSupported($oAccount))
			{
				throw new \ProjectSeven\Exceptions\ClientException(\ProjectSeven\Notifications::CalendarsNotAllowed);
			}
			$mResult = $this->oApiCalendar->GetCalendars($oAccount);
		}

		return $this->DefaultResponse($oAccount, __FUNCTION__, $mResult);

	}

	/**
	 * @return array
	 */
	public function AjaxCalendarCreate()
	{
		$mResult = false;
		$oAccount = $this->getDefaultAccountFromParam();
		if (!$this->oApiCapability->IsCalendarSupported($oAccount))
		{
			throw new \ProjectSeven\Exceptions\ClientException(\ProjectSeven\Notifications::CalendarsNotAllowed);
		}

		$sName = $this->getParamValue('Name');
		$sDescription = $this->getParamValue('Description');
		$sColor = $this->getParamValue('Color');

		$mResult = $this->oApiCalendar->CreateCalendar($oAccount, $sName, $sDescription, 0, $sColor);

		return $this->DefaultResponse($oAccount, __FUNCTION__, $mResult);
	}

	/**
	 * @return array
	 */
	public function AjaxCalendarUpdate()
	{
		$mResult = false;
		$oAccount = $this->getDefaultAccountFromParam();
		if (!$this->oApiCapability->IsCalendarSupported($oAccount))
		{
			throw new \ProjectSeven\Exceptions\ClientException(\ProjectSeven\Notifications::CalendarsNotAllowed);
		}

		$sName = $this->getParamValue('Name');
		$sDescription = $this->getParamValue('Description');
		$sColor = $this->getParamValue('Color');
		$sId = $this->getParamValue('Id');

		$mResult = $this->oApiCalendar->UpdateCalendar($oAccount, $sId, $sName, $sDescription, 0, $sColor);

		return $this->DefaultResponse($oAccount, __FUNCTION__, $mResult);
	}

	/**
	 * @return array
	 */
	public function AjaxCalendarUpdateColor()
	{
		$mResult = false;
		$oAccount = $this->getDefaultAccountFromParam();
		if (!$this->oApiCapability->IsCalendarSupported($oAccount))
		{
			throw new \ProjectSeven\Exceptions\ClientException(\ProjectSeven\Notifications::CalendarsNotAllowed);
		}

		$sColor = $this->getParamValue('Color');
		$sId = $this->getParamValue('Id');

		$mResult = $this->oApiCalendar->UpdateCalendarColor($oAccount, $sId, $sColor);

		return $this->DefaultResponse($oAccount, __FUNCTION__, $mResult);
	}

	/**
	 * @return array
	 */
	public function AjaxCalendarDelete()
	{
		$mResult = false;
		$oAccount = $this->getDefaultAccountFromParam();

		$sCalendarId = $this->getParamValue('Id');

		if (!is_numeric($sCalendarId))
		{
			$mResult = $this->oApiCalendar->DeleteCalendar($oAccount, $sCalendarId);
		}
		else
		{
			$mResult = $this->oApiCalendar->UnsubscribeCalendar($oAccount, $sCalendarId);
		}

		return $this->DefaultResponse($oAccount, __FUNCTION__, $mResult);
	}

	/**
	 * @return array
	 */
	public function AjaxCalendarShareUpdate()
	{
		$mResult = false;
		$oAccount = $this->getDefaultAccountFromParam();
		$sCalendarId = $this->getParamValue('Id');
		$bIsPublic = (bool) $this->getParamValue('IsPublic');
		$aShares = @json_decode($this->getParamValue('Shares'), true);

		if (!$this->oApiCapability->IsCalendarSupported($oAccount))
		{
			throw new \ProjectSeven\Exceptions\ClientException(\ProjectSeven\Notifications::CalendarsNotAllowed);
		}

		$this->oApiCalendar->UpdateCalendarShares($oAccount, $sCalendarId, $aShares);
		if ($bIsPublic)
		{
			$this->oApiCalendar->PublicCalendar($oAccount, $sCalendarId);
		}
		else
		{
			$this->oApiCalendar->UnPublicCalendar($oAccount, $sCalendarId);
		}

		$mResult = true;
		return $this->DefaultResponse($oAccount, __FUNCTION__, $mResult);
	}

	/**
	 * @return array
	 */
	public function AjaxCalendarPublicUpdate()
	{
		$mResult = false;
		$oAccount = $this->getDefaultAccountFromParam();
		$sCalendarId = $this->getParamValue('Id');
		$bIsPublic = (bool) $this->getParamValue('IsPublic');

		if (!$this->oApiCapability->IsCalendarSupported($oAccount))
		{
			throw new \ProjectSeven\Exceptions\ClientException(\ProjectSeven\Notifications::CalendarsNotAllowed);
		}

		if ($bIsPublic)
		{
			$this->oApiCalendar->PublicCalendar($oAccount, $sCalendarId);
		}
		else
		{
			$this->oApiCalendar->UnPublicCalendar($oAccount, $sCalendarId);
		}
		$mResult = true;
		return $this->DefaultResponse($oAccount, __FUNCTION__, $mResult);
	}

	/**
	 * @return array
	 */
	public function AjaxEventList()
	{
		$mResult = false;
		$oAccount = null;
		$aCalendarIds = @json_decode($this->getParamValue('CalendarIds'), true);
		$iStart = $this->getParamValue('Start');
		$iEnd = $this->getParamValue('End');
		$bIsPublic = (bool) $this->getParamValue('IsPublic');

		if ($bIsPublic)
		{
			$mResult = $this->oApiCalendar->GetPublicEvents($aCalendarIds, $iStart, $iEnd);
		}
		else
		{
			$oAccount = $this->getDefaultAccountFromParam();
			if (!$this->oApiCapability->IsCalendarSupported($oAccount))
			{
				throw new \ProjectSeven\Exceptions\ClientException(\ProjectSeven\Notifications::CalendarsNotAllowed);
			}
			$mResult = $this->oApiCalendar->GetEvents($oAccount, $aCalendarIds, $iStart, $iEnd);
		}

		return $this->DefaultResponse($oAccount, __FUNCTION__, $mResult);
	}

	/**
	 * @return array
	 */
	public function AjaxEventBase()
	{
		$mResult = false;
		$oAccount = $this->getDefaultAccountFromParam();
		if (!$this->oApiCapability->IsCalendarSupported($oAccount))
		{
			throw new \ProjectSeven\Exceptions\ClientException(\ProjectSeven\Notifications::CalendarsNotAllowed);
		}

		$sCalendarId = $this->getParamValue('calendarId');
		$sEventId = $this->getParamValue('uid');

		$mResult = $this->oApiCalendar->GetBaseEvent($oAccount, $sCalendarId, $sEventId);

		return $this->DefaultResponse($oAccount, __FUNCTION__, $mResult);
	}

	/**
	 * @return array
	 */
	public function AjaxEventCreate()
	{
		$mResult = false;
		$oAccount = $this->getDefaultAccountFromParam();
		if (!$this->oApiCapability->IsCalendarSupported($oAccount))
		{
			throw new \ProjectSeven\Exceptions\ClientException(\ProjectSeven\Notifications::CalendarsNotAllowed);
		}

		$oEvent = new \CEvent();

		$oEvent->IdCalendar = $this->getParamValue('newCalendarId');
		$oEvent->Name = $this->getParamValue('subject');
		$oEvent->Description = $this->getParamValue('description');
		$oEvent->Location = $this->getParamValue('location');
		$oEvent->Start = $this->getParamValue('startTimestamp');
		$oEvent->End = $this->getParamValue('endTimestamp');
		$oEvent->AllDay = (bool) $this->getParamValue('allDay');
		$oEvent->Alarms = @json_decode($this->getParamValue('alarms'), true);
		$oEvent->Attendees = @json_decode($this->getParamValue('attendees'), true);

		$aRRule = @json_decode($this->getParamValue('rrule'), true);
		if ($aRRule)
		{
			$oRRule = new \CRRule($oAccount);
			$oRRule->Populate($aRRule);
			$oEvent->RRule = $oRRule;
		}

		$mResult = $this->oApiCalendar->CreateEvent($oAccount, $oEvent);
		if ($mResult)
		{
			$iStart = $this->getParamValue('selectStart');
			$iEnd = $this->getParamValue('selectEnd');

			$mResult = $this->oApiCalendar->GetExpandedEvent($oAccount, $oEvent->IdCalendar, $mResult, $iStart, $iEnd);
		}

		return $this->DefaultResponse($oAccount, __FUNCTION__, $mResult);
	}

	/**
	 * @return array
	 */
	public function AjaxEventUpdate()
	{
		$mResult = false;
		$oAccount = $this->getDefaultAccountFromParam();
		if (!$this->oApiCapability->IsCalendarSupported($oAccount))
		{
			throw new \ProjectSeven\Exceptions\ClientException(\ProjectSeven\Notifications::CalendarsNotAllowed);
		}

		$sNewCalendarId = $this->getParamValue('newCalendarId');
		$oEvent = new \CEvent();

		$oEvent->IdCalendar = $this->getParamValue('calendarId');
		$oEvent->Id = $this->getParamValue('uid');
		$oEvent->Name = $this->getParamValue('subject');
		$oEvent->Description = $this->getParamValue('description');
		$oEvent->Location = $this->getParamValue('location');
		$oEvent->Start = $this->getParamValue('startTimestamp');
		$oEvent->End = $this->getParamValue('endTimestamp');
		$oEvent->AllDay = (bool) $this->getParamValue('allDay');
		$oEvent->Alarms = @json_decode($this->getParamValue('alarms'), true);
		$oEvent->Attendees = @json_decode($this->getParamValue('attendees'), true);

		$aRRule = @json_decode($this->getParamValue('rrule'), true);
		if ($aRRule)
		{
			$oRRule = new \CRRule($oAccount);
			$oRRule->Populate($aRRule);
			$oEvent->RRule = $oRRule;
		}

		$iAllEvents = (int) $this->getParamValue('allEvents');
		$sRecurrenceId = $this->getParamValue('recurrenceId');

		if ($iAllEvents && $iAllEvents === 1)
		{
			$mResult = $this->oApiCalendar->UpdateExclusion($oAccount, $oEvent, $sRecurrenceId);
		}
		else
		{
			$mResult = $this->oApiCalendar->UpdateEvent($oAccount, $oEvent);
			if ($mResult && $sNewCalendarId !== $oEvent->IdCalendar)
			{
				$mResult = $this->oApiCalendar->MoveEvent($oAccount, $oEvent->IdCalendar, $sNewCalendarId, $oEvent->Id);
				$oEvent->IdCalendar = $sNewCalendarId;
			}
		}
		if ($mResult)
		{
			$iStart = $this->getParamValue('selectStart');
			$iEnd = $this->getParamValue('selectEnd');

			$mResult = $this->oApiCalendar->GetExpandedEvent($oAccount, $oEvent->IdCalendar, $oEvent->Id, $iStart, $iEnd);
		}

		return $this->DefaultResponse($oAccount, __FUNCTION__, $mResult);
	}

	/**
	 * @return array
	 */
	public function AjaxEventUpdateAppointment()
	{
		$mResult = false;
		$oAccount = $this->getDefaultAccountFromParam();
		if (!$this->oApiCapability->IsCalendarSupported($oAccount))
		{
			throw new \ProjectSeven\Exceptions\ClientException(\ProjectSeven\Notifications::CalendarsNotAllowed);
		}

		$sCalendarId = $this->getParamValue('calendarId');
		$sEventId = $this->getParamValue('uid');
		$iAction = (int)$this->getParamValue('actionAppointment');

		$sAction = '';
		if ($iAction === \EAttendeeStatus::Accepted)
		{
			$sAction = 'ACCEPTED';
		}
		else if ($iAction === \EAttendeeStatus::Declined)
		{
			$sAction = 'DECLINED';
		}
		else if ($iAction === \EAttendeeStatus::Tentative)
		{
			$sAction = 'TENTATIVE';
		}

		$mResult = $this->oApiCalendar->UpdateAppointment($oAccount, $sCalendarId, $sEventId, $sAction);

		return $this->DefaultResponse($oAccount, __FUNCTION__, $mResult);
	}

	/**
	 * @return array
	 */
	public function AjaxEventDelete()
	{
		$mResult = false;
		$oAccount = $this->getDefaultAccountFromParam();

		$sCalendarId = $this->getParamValue('calendarId');
		$sId = $this->getParamValue('uid');

		$iAllEvents = (int) $this->getParamValue('allEvents');

		if ($iAllEvents && $iAllEvents === 1)
		{
			$oEvent = new \CEvent();
			$oEvent->IdCalendar = $sCalendarId;
			$oEvent->Id = $sId;

			$sRecurrenceId = $this->getParamValue('recurrenceId');

			$mResult = $this->oApiCalendar->UpdateExclusion($oAccount, $oEvent, $sRecurrenceId, true);
		}
		else
		{
			$mResult = $this->oApiCalendar->DeleteEvent($oAccount, $sCalendarId, $sId);
		}

		return $this->DefaultResponse($oAccount, __FUNCTION__, $mResult);
	}

	/**
	 * @return array
	 */
	public function AjaxLogout()
	{
		$oAccount = $this->getAccountFromParam(false);

		if ($oAccount && $oAccount->User && 0 < $oAccount->User->IdHelpdeskUser &&
			$this->oApiCapability->IsHelpdeskSupported($oAccount))
		{
			$this->oApiIntegrator->LogoutHelpdeskUser();
		}

		$sLastErrorCode = $this->getParamValue('LastErrorCode');
		if (0 < strlen($sLastErrorCode) && $this->oApiIntegrator && 0 < (int) $sLastErrorCode)
		{
			$this->oApiIntegrator->SetLastErrorCode((int) $sLastErrorCode);
		}

		return $this->DefaultResponse($oAccount, 'Logout', $this->oApiIntegrator->LogoutAccount());
	}

	/**
	 * @param string $iError
	 *
	 * @return string
	 */
	public function convertUploadErrorToString($iError)
	{
		$sError = 'unknown';
		switch ($iError)
		{
			case UPLOAD_ERR_INI_SIZE:
			case UPLOAD_ERR_FORM_SIZE:
				$sError = 'size';
				break;
		}

		return $sError;
	}

	/**
	 * @return bool
	 */
	private function rawFiles($bDownload = true)
	{
		$sRawKey = (string) $this->getParamValue('RawKey', '');
		$aValues = \CApi::DecodeKeyValues($sRawKey);

		$oAccount = $this->getDefaultAccountFromParam();

		if ($this->oApiCapability->IsFilesSupported($oAccount))
		{
			$mResult = $this->oApiFilestorage->GetFile($oAccount, $aValues['Type'], $aValues['Path'], $aValues['Name']);
			if (false !== $mResult)
			{
				if (is_resource($mResult))
				{
					$sFileName = $aValues['Name'];
					$iSize = (int) $aValues['Size'];
					$sContentType = (empty($sFileName)) ? 'text/plain' : \MailSo\Base\Utils::MimeContentType($sFileName);
					$sFileName = $this->clearFileName($sFileName, $sContentType);
					$this->RawOutputHeaders($bDownload, $sContentType, $sFileName, $iSize);

					\MailSo\Base\Utils::FpassthruWithTimeLimitReset($mResult);
					@fclose($mResult);
				}
				return true;
			}
		}

		return false;
	}

	/**
	 * @return array
	 */
	public function RawFilesDownload()
	{
		return $this->rawFiles(true);
	}

	/**
	 * @return array
	 */
	public function RawFilesView()
	{
		return $this->rawFiles(false);
	}

	/**
	 * @return array
	 */
	public function RawFilesPub()
	{
		return $this->rawFiles(true);
	}

	/**
	 * @return array
	 */
	public function WindowPublicCalendar()
	{
		$sRawKey = (string) $this->getParamValue('RawKey', '');
		$aValues = \CApi::DecodeKeyValues($sRawKey);
		print_r($aValues);

		$sUrlRewriteBase = (string) \CApi::GetConf('labs.server-url-rewrite-base', '');
		if (!empty($sUrlRewriteBase))
		{
			$sUrlRewriteBase = '<base href="'.$sUrlRewriteBase.'" />';
		}
		return array(
			'Template' => 'templates/CalendarPub.html',
			'{{BaseUrl}}' => $sUrlRewriteBase
		);
	}

	/**
	 * @return array
	 */
	public function MinInfo()
	{
		$mData = $this->getParamValue('Result', false);

		var_dump($mData);
		return true;
	}

	/**
	 * @return array
	 */
	public function MinShare()
	{
		$mData = $this->getParamValue('Result', false);

		if ($mData && isset($mData['__hash__'], $mData['Name'], $mData['Size']))
		{
			$bUseUrlRewrite = (bool) \CApi::GetConf('labs.server-use-url-rewrite', false);
			$sUrl = '?/Min/Download/';
			if ($bUseUrlRewrite)
			{
				$sUrl = '/download/';
			}

			$sUrlRewriteBase = (string) \CApi::GetConf('labs.server-url-rewrite-base', '');
			if (!empty($sUrlRewriteBase))
			{
				$sUrlRewriteBase = '<base href="'.$sUrlRewriteBase.'" />';
			}

			return array(
				'Template' => 'templates/FilesPub.html',
				'{{Url}}' => $sUrl.$mData['__hash__'],
				'{{FileName}}' => $mData['Name'],
				'{{FileSize}}' => \api_Utils::GetFriendlySize($mData['Size']),
				'{{FileType}}' => \api_Utils::GetFileExtension($mData['Name']),
				'{{BaseUrl}}' => $sUrlRewriteBase
			);
		}
		return false;
	}

	public function MinDownload()
	{
		$mData = $this->getParamValue('Result', false);

		if (isset($mData['AccountType']) && 'wm' !== $mData['AccountType'])
		{
			return true;
		}

		$oAccount = $this->oApiUsers->GetAccountById((int) $mData['Account']);

		$mResult = false;
		if ($oAccount && $this->oApiCapability->IsFilesSupported($oAccount))
		{
			$mResult = $this->oApiFilestorage->GetSharedFile($oAccount, $mData['Type'], $mData['Path'], $mData['Name']);
		}

		if (false !== $mResult)
		{
			if (is_resource($mResult))
			{
				$sFileName = $mData['Name'];
				$sContentType = (empty($sFileName)) ? 'text/plain' : \MailSo\Base\Utils::MimeContentType($sFileName);
				$sFileName = $this->clearFileName($sFileName, $sContentType);
				$this->RawOutputHeaders(true, $sContentType, $sFileName);

				\MailSo\Base\Utils::FpassthruWithTimeLimitReset($mResult);
				@fclose($mResult);
			}
		}

		return true;
	}

	/**
	 * @return array
	 */
	public function RawContacts()
	{
		$oAccount = $this->getDefaultAccountFromParam();
		if ($this->oApiCapability->IsContactsSupported($oAccount))
		{
			$oApiContactsManager = $this->ApiContacts();
			if ($oApiContactsManager)
			{
				$sOutput = $oApiContactsManager->Export($oAccount->IdUser, 'csv');
				if (false !== $sOutput)
				{
					header('Pragma: public');
					header('Content-Type: text/csv');
					header('Content-Disposition: attachment; filename="export.csv";');
					header('Content-Transfer-Encoding: binary');

					echo $sOutput;
					return true;
				}
			}
		}

		return false;
	}

	/**
	 * @todo
	 * @return array
	 */
	public function RawCalendars()
	{
		$oAccount = $this->getDefaultAccountFromParam();
		if ($this->oApiCapability->IsCalendarSupported($oAccount))
		{
			$sRawKey = (string) $this->getParamValue('RawKey', '');
			$aValues = \CApi::DecodeKeyValues($sRawKey);

			if (isset($aValues['CalendarId']))
			{
				$sCalendarId = $aValues['CalendarId'];

				$oApiCalendarManager = /* @var $oApiCalendarManager CApiCalendarManager */ \CApi::Manager('calendar');
				$sOutput = $oApiCalendarManager->ExportCalendarToIcs($oAccount, $sCalendarId);
				if (false !== $sOutput)
				{
					header('Pragma: public');
					header('Content-Type: text/calendar');
					header('Content-Disposition: attachment; filename="'.$sCalendarId.'.ics";');
					header('Content-Transfer-Encoding: binary');

					echo $sOutput;
					return true;
				}
			}
		}

		return false;
	}

	/**
	 * @return array
	 */
	public function UploadContacts()
	{
		$oAccount = $this->getDefaultAccountFromParam();

		if (!$this->oApiCapability->IsPersonalContactsSupported($oAccount))
		{
			throw new \ProjectSeven\Exceptions\ClientException(\ProjectSeven\Notifications::ContactsNotAllowed);
		}

		$aFileData = $this->getParamValue('FileData', null);

		$sError = '';
		$aResponse = array(
			'ImportedCount' => 0,
			'ParsedCount' => 0
		);

		if (is_array($aFileData))
		{
			$sSavedName = 'import-post-'.md5($aFileData['name'].$aFileData['tmp_name']);
			if ($this->ApiFileCache()->MoveUploadedFile($oAccount, $sSavedName, $aFileData['tmp_name']))
			{
				$oApiContactsManager = $this->ApiContacts();
				if ($oApiContactsManager)
				{
					$iParsedCount = 0;

					$iImportedCount = $oApiContactsManager->ImportEx(
						$oAccount->IdUser,
						'csv',
						$this->ApiFileCache()->GenerateFullFilePath($oAccount, $sSavedName),
						$iParsedCount
					);
				}

				if (false !== $iImportedCount && -1 !== $iImportedCount)
				{
					$aResponse['ImportedCount'] = $iImportedCount;
					$aResponse['ParsedCount'] = $iParsedCount;
				}
				else
				{
					$sError = 'unknown';
				}

				$this->ApiFileCache()->Clear($oAccount, $sSavedName);
			}
			else
			{
				$sError = 'unknown';
			}
		}
		else
		{
			$sError = 'unknown';
		}

		if (0 < strlen($sError))
		{
			$aResponse['Error'] = $sError;
		}

		return $this->DefaultResponse($oAccount, 'UploadContacts', $aResponse);
	}

	/**
	 * @return array
	 */
	public function UploadAttachment()
	{
		$oAccount = $this->getAccountFromParam();

		$oSettings =& \CApi::GetSettings();
		$aFileData = $this->getParamValue('FileData', null);

		$iSizeLimit = !!$oSettings->GetConf('WebMail/EnableAttachmentSizeLimit', false) ?
			(int) $oSettings->GetConf('WebMail/AttachmentSizeLimit', 0) : 0;

		$sError = '';
		$aResponse = array();

		if ($oAccount)
		{
			if (is_array($aFileData))
			{
				if (0 < $iSizeLimit && $iSizeLimit < (int) $aFileData['size'])
				{
					$sError = 'size';
				}
				else
				{
					$sSavedName = 'upload-post-'.md5($aFileData['name'].$aFileData['tmp_name']);
					if ($this->ApiFileCache()->MoveUploadedFile($oAccount, $sSavedName, $aFileData['tmp_name']))
					{
						$sUploadName = $aFileData['name'];
						$iSize = $aFileData['size'];
						$sMimeType = \MailSo\Base\Utils::MimeContentType($sUploadName);

						$aResponse['Attachment'] = array(
							'Name' => $sUploadName,
							'TempName' => $sSavedName,
							'MimeType' => $sMimeType,
							'Size' =>  (int) $iSize,
							'Hash' => \CApi::EncodeKeyValues(array(
								'TempFile' => true,
								'AccountID' => $oAccount->IdAccount,
								'Name' => $sUploadName,
								'TempName' => $sSavedName
							))
						);
					}
					else
					{
						$sError = 'unknown';
					}
				}
			}
			else
			{
				$sError = 'unknown';
			}
		}
		else
		{
			$sError = 'auth';
		}

		if (0 < strlen($sError))
		{
			$aResponse['Error'] = $sError;
		}

		return $this->DefaultResponse($oAccount, 'UploadAttachment', $aResponse);
	}

	/**
	 * @return array
	 */
	public function UploadFile()
	{
		$oAccount = $this->getDefaultAccountFromParam();
		if (!$this->oApiCapability->IsFilesSupported($oAccount))
		{
			throw new \ProjectSeven\Exceptions\ClientException(\ProjectSeven\Notifications::FilesNotAllowed);
		}

		$aFileData = $this->getParamValue('FileData', null);
		$sAdditionalData = $this->getParamValue('AdditionalData', '{}');
		$aAdditionalData = @json_decode($sAdditionalData, true);

		$sError = '';
		$aResponse = array();

		if ($oAccount)
		{
			if (is_array($aFileData))
			{
				$sUploadName = $aFileData['name'];
				$iSize = (int) $aFileData['size'];
				$iType = isset($aAdditionalData['Type']) ? (int) $aAdditionalData['Type'] : \EFileStorageType::Private_;
				$sPath = isset($aAdditionalData['Path']) ? $aAdditionalData['Path'] : '';
				$sMimeType = \MailSo\Base\Utils::MimeContentType($sUploadName);

				$sSavedName = 'upload-post-'.md5($aFileData['name'].$aFileData['tmp_name']);
				if ($this->ApiFileCache()->MoveUploadedFile($oAccount, $sSavedName, $aFileData['tmp_name']))
				{
					$rData = $this->ApiFileCache()->GetFile($oAccount, $sSavedName);

					$sUploadName = $this->oApiFilestorage->GetNonExistingFileName($oAccount, $iType, $sPath, $sUploadName);
					$this->oApiFilestorage->CreateFile($oAccount, $iType, $sPath, $sUploadName, $rData);

					$aResponse['File'] = array(
						'Name' => $sUploadName,
						'TempName' => $sSavedName,
						'MimeType' => $sMimeType,
						'Size' =>  (int) $iSize,
						'Hash' => \CApi::EncodeKeyValues(array(
							'TempFile' => true,
							'AccountID' => $oAccount->IdAccount,
							'Name' => $sUploadName,
							'TempName' => $sSavedName
						))
					);
				}
			}
		}
		else
		{
			$sError = 'auth';
		}

		if (0 < strlen($sError))
		{
			$aResponse['Error'] = $sError;
		}

		return $this->DefaultResponse($oAccount, 'UploadFile', $aResponse);
	}

	/**
	 * @return array
	 */
//	public function Upload111()
//	{
//		$oAccount = $this->getAccountFromParam();
//		$oSettings =& \CApi::GetSettings();
//
//		$sInputName = 'jua-uploader';
//		$aResponse = array();
//
//		$sError = '';
//		$iSizeLimit = !!$oSettings->GetConf('WebMail/EnableAttachmentSizeLimit', false) ?
//			((int) $oSettings->GetConf('WebMail/AttachmentSizeLimit', 0)) * 1024 * 1024 : 0;
//
//		if ($oAccount)
//		{
//			$iError = UPLOAD_ERR_OK;
//			$_FILES = isset($_FILES) ? $_FILES : null;
//			if (isset($_FILES, $_FILES[$sInputName], $_FILES[$sInputName]['name'], $_FILES[$sInputName]['tmp_name'], $_FILES[$sInputName]['size'], $_FILES[$sInputName]['type']))
//			{
//				$iError = (isset($_FILES[$sInputName]['error'])) ? (int) $_FILES[$sInputName]['error'] : UPLOAD_ERR_OK;
//				if (UPLOAD_ERR_OK === $iError)
//				{
//					if (0 < $iSizeLimit && $iSizeLimit < (int) $_FILES[$sInputName]['size'])
//					{
//						$sError = 'size';
//					}
//					else
//					{
//						$sSavedName = 'upload-post-'.md5($_FILES[$sInputName]['name'].$_FILES[$sInputName]['tmp_name']);
//						if ($this->ApiFileCache()->MoveUploadedFile($oAccount, $sSavedName, $_FILES[$sInputName]['tmp_name']))
//						{
//							$sUploadName = $_FILES[$sInputName]['name'];
//							$iSize = $_FILES[$sInputName]['size'];
//							$sMimeType = \MailSo\Base\Utils::MimeContentType($sUploadName);
//
//							$aResponse['Attachment'] = array(
//								'Name' => $sUploadName,
//								'TempName' => $sSavedName,
//								'MimeType' => $sMimeType,
//								'Size' =>  (int) $iSize,
//								'Hash' => \CApi::EncodeKeyValues(array(
//									'TempFile' => true,
//									'AccountID' => $oAccount->IdAccount,
//									'Name' => $sUploadName,
//									'TempName' => $sSavedName
//								))
//							);
//						}
//						else
//						{
//							$sError = 'unknown';
//						}
//					}
//				}
//				else
//				{
//					$sError = $this->convertUploadErrorToString($iError);
//				}
//			}
//			else if (!isset($_FILES) || !is_array($_FILES) || 0 === count($_FILES))
//			{
//				$sError = 'size';
//			}
//			else
//			{
//				$sError = 'unknown';
//			}
//		}
//
//		if (0 < strlen($sError))
//		{
//			$aResponse['Error'] = $sError;
//		}
//
//		return $this->DefaultResponse($oAccount, 'Upload', $aResponse);
//	}

	/**
	 * @param bool $bDownload
	 * @param string $sContentType
	 * @param string $sFileName
	 *
	 * @return bool
	 */
	public function RawOutputHeaders($bDownload, $sContentType, $sFileName, $iSize = -1)
	{
		if ($bDownload)
		{
			header('Content-Type: '.$sContentType, true);
		}
		else
		{
			$aParts = explode('/', $sContentType, 2);
			if (in_array(strtolower($aParts[0]), array('image', 'video', 'audio')) ||
				in_array(strtolower($sContentType), array('application/pdf', 'application/x-pdf')))
			{
				header('Content-Type: '.$sContentType, true);
			}
			else
			{
				header('Content-Type: text/plain', true);
			}
		}
		$sSize = '';
		if ($iSize > -1)
		{
			header('Content-Length: '.$iSize);
			$sSize = ' size="'.$iSize.'";';
		}

		header('Content-Disposition: '.($bDownload ? 'attachment' : 'inline' ).'; filename="'.$sFileName.'";'.$sSize.' charset=utf-8', true);
		header('Accept-Ranges: none', true);
		header('Content-Transfer-Encoding: binary');
	}

	/**
	 * @return bool
	 */
	private function raw($bDownload = true)
	{
		$sRawKey = (string) $this->getParamValue('RawKey', '');
		$aValues = \CApi::DecodeKeyValues($sRawKey);

		if (!is_array($aValues) || 0 === count($aValues))
		{
			return false;
		}

		$sFolder = '';
		$iUid = 0;
		$sMimeIndex = '';

		$oAccount = null;
		$oHelpdeskUser = null;
		$oHelpdeskUserFromAttachment = null;

		if (isset($aValues['HelpdeskUserID'], $aValues['HelpdeskTenantID']))
		{
			$oAccount = null;
			$oHelpdeskUser = $this->getHelpdeskAccountFromParam($oAccount);

			if ($oHelpdeskUser && $oHelpdeskUser->IdTenant === $aValues['HelpdeskTenantID'])
			{
				$oApiHelpdesk = $this->ApiHelpdesk();
				if ($oApiHelpdesk)
				{
					if ($oHelpdeskUser->IdHelpdeskUser === $aValues['HelpdeskUserID'])
					{
						$oHelpdeskUserFromAttachment = $oHelpdeskUser;
					}
					else if ($oHelpdeskUser->IsAgent)
					{
						$oHelpdeskUserFromAttachment = $oApiHelpdesk->GetUserById($aValues['HelpdeskTenantID'], $aValues['HelpdeskUserID']);
					}
				}
			}
		}
		else if (isset($aValues['AccountID']))
		{
			$oAccount = $this->getAccountFromParam();
			if (!$oAccount || $aValues['AccountID'] !== $oAccount->IdAccount)
			{
				return false;
			}
		}

		if ($oHelpdeskUserFromAttachment && isset($aValues['FilestorageFile'], $aValues['StorageType'], $aValues['Path'], $aValues['Name']))
		{
			if (!$bDownload)
			{
				$this->verifyCacheByKey($sRawKey);
			}

			$bResult = false;
			$mResult = $this->oApiFilestorage->GetFile($oHelpdeskUserFromAttachment, $aValues['StorageType'], $aValues['Path'], $aValues['Name']);
			if (is_resource($mResult))
			{
				if (!$bDownload)
				{
					$this->cacheByKey($sRawKey);
				}

				$bResult = true;
				$sFileName = $aValues['Name'];
				$sContentType = (empty($sFileName)) ? 'text/plain' : \MailSo\Base\Utils::MimeContentType($sFileName);
				$sFileName = $this->clearFileName($sFileName, $sContentType);
				$this->RawOutputHeaders($bDownload, $sContentType, $sFileName);

				\MailSo\Base\Utils::FpassthruWithTimeLimitReset($mResult);
			}

			return $bResult;
		}
		else if (isset($aValues['TempFile'], $aValues['TempName'], $aValues['Name']) && ($oHelpdeskUserFromAttachment || $oAccount))
		{
			if (!$bDownload)
			{
				$this->verifyCacheByKey($sRawKey);
			}

			$bResult = false;
			$mResult = $this->ApiFileCache()->GetFile($oHelpdeskUserFromAttachment ? $oHelpdeskUserFromAttachment : $oAccount, $aValues['TempName']);
			if (is_resource($mResult))
			{
				if (!$bDownload)
				{
					$this->cacheByKey($sRawKey);
				}

				$bResult = true;
				$sFileName = $aValues['Name'];
				$sContentType = (empty($sFileName)) ? 'text/plain' : \MailSo\Base\Utils::MimeContentType($sFileName);
				$sFileName = $this->clearFileName($sFileName, $sContentType);
				$this->RawOutputHeaders($bDownload, $sContentType, $sFileName);

				\MailSo\Base\Utils::FpassthruWithTimeLimitReset($mResult);
			}

			return $bResult;
		}
		else
		{
			$sFolder = isset($aValues['Folder']) ? $aValues['Folder'] : '';
			$iUid = (int) (isset($aValues['Uid']) ? $aValues['Uid'] : 0);
			$sMimeIndex = (string) (isset($aValues['MimeIndex']) ? $aValues['MimeIndex'] : '');
		}

		if (!$bDownload && 0 < strlen($sFolder) && 0 < $iUid)
		{
			$this->verifyCacheByKey($sRawKey);
		}

		$sContentTypeIn = (string) (isset($aValues['MimeType']) ? $aValues['MimeType'] : '');
		$sFileNameIn = (string) (isset($aValues['FileName']) ? $aValues['FileName'] : '');

		$self = $this;
		return $this->oApiMail->MessageMimeStream($oAccount,
			function($rResource, $sContentType, $sFileName, $sMimeIndex = '') use ($self, $sRawKey, $bDownload, $sContentTypeIn, $sFileNameIn) {
				if (is_resource($rResource))
				{
					$sContentTypeOut = $sContentTypeIn;
					if (empty($sContentTypeOut))
					{
						$sContentTypeOut = $sContentType;
						if (empty($sContentTypeOut))
						{
							$sContentTypeOut = (empty($sFileName)) ? 'text/plain' : \MailSo\Base\Utils::MimeContentType($sFileName);
						}
					}

					$sFileNameOut = $sFileNameIn;
					if (empty($sFileNameOut))
					{
						$sFileNameOut = $sFileName;
					}

					$sFileNameOut = $self->clearFileName($sFileNameOut, $sContentType, $sMimeIndex);

					$self->RawOutputHeaders($bDownload, $sContentTypeOut, $sFileNameOut);

					if (!$bDownload)
					{
						$self->cacheByKey($sRawKey);
					}

					\MailSo\Base\Utils::FpassthruWithTimeLimitReset($rResource);
				}
			}, $sFolder, $iUid, $sMimeIndex);
	}

	/**
	 * @return bool
	 */
	public function RawView()
	{
		return $this->raw(false);
	}

	/**
	 * @return bool
	 */
	public function RawDownload()
	{
		return $this->raw(true);
	}

	/**
	 * @return bool
	 */
	public function RawThumbnail()
	{
		$sRawKey = (string) $this->getParamValue('RawKey', '');
		$aValues = \CApi::DecodeKeyValues($sRawKey);

		if (!is_array($aValues) || 0 === count($aValues))
		{
			return false;
		}

		if (0 < strlen($sRawKey))
		{
			$this->verifyCacheByKey($sRawKey);
		}

		$sFolder = '';
		$iUid = 0;
		$sMimeIndex = '';

		$oAccount = null;
		if (isset($aValues['AccountID']))
		{
			$oAccount = $this->getAccountFromParam();
			if (!$oAccount || $aValues['AccountID'] !== $oAccount->IdAccount)
			{
				return false;
			}
		}

		$sFolder = (string) (isset($aValues['Folder']) ? $aValues['Folder'] : '');
		$iUid = (int) (isset($aValues['Uid']) ? $aValues['Uid'] : 0);
		$sMimeIndex = (string) (isset($aValues['MimeIndex']) ? $aValues['MimeIndex'] : '');

		$sContentTypeIn = (string) (isset($aValues['MimeType']) ? $aValues['MimeType'] : '');
		$sFileNameIn = (string) (isset($aValues['FileName']) ? $aValues['FileName'] : '');

		$self = $this;
		$bResult = $this->oApiMail->MessageMimeStream($oAccount,
			function($rResource, $sContentType, $sFileName, $sMimeIndex = '') use ($self, $oAccount, $sRawKey, $sContentTypeIn, $sFileNameIn) {
				if (is_resource($rResource))
				{
					$sContentTypeOut = $sContentTypeIn;
					if (empty($sContentTypeOut))
					{
						$sContentTypeOut = $sContentType;
						if (empty($sContentTypeOut))
						{
							$sContentTypeOut = (empty($sFileName)) ? 'text/plain' : \MailSo\Base\Utils::MimeContentType($sFileName);
						}
					}

					$sFileNameOut = $sFileNameIn;
					if (empty($sFileNameOut))
					{
						$sFileNameOut = $sFileName;
					}

					$sFileNameOut = $self->clearFileName($sFileNameOut, $sContentType, $sMimeIndex);
					$sMd5Hash = md5(rand(1000, 9999));

					$self->cacheByKey($sRawKey);

					$self->ApiFileCache()->PutFile($oAccount, 'Raw/Thumbnail/'.$sMd5Hash, $rResource, '_'.$sFileNameOut);

					$oThumb = new \PHPThumb\GD(
						$self->ApiFileCache()->GenerateFullFilePath($oAccount, 'Raw/Thumbnail/'.$sMd5Hash, '_'.$sFileNameOut)
					);

//					$oThumb->resize(300, 80)->show();
					$oThumb->adaptiveResize(300, 80)->show();

					$self->ApiFileCache()->Clear($oAccount, 'Raw/Thumbnail/'.$sMd5Hash, $rResource, '_'.$sFileNameOut);
				}
			}, $sFolder, $iUid, $sMimeIndex);

		return $bResult;
	}

	/**
	 * @param string $sFileName
	 * @param string $sContentType
	 * @param string $sMimeIndex = ''
	 *
	 * @return string
	 */
	public function clearFileName($sFileName, $sContentType, $sMimeIndex = '')
	{
		$sFileName = 0 === strlen($sFileName) ? preg_replace('/[^a-zA-Z0-9]/', '.', (empty($sMimeIndex) ? '' : $sMimeIndex.'.').$sContentType) : $sFileName;
		$sClearedFileName = preg_replace('/[\s]+/', ' ', preg_replace('/[\.]+/', '.', $sFileName));
		$sExt = \MailSo\Base\Utils::GetFileExtension($sClearedFileName);

		$iSize = 50;
		if ($iSize < strlen($sClearedFileName) - strlen($sExt))
		{
			$sClearedFileName = substr($sClearedFileName, 0, $iSize).(empty($sExt) ? '' : '.'.$sExt);
		}

		return \MailSo\Base\Utils::ClearFileName(\MailSo\Base\Utils::Utf8Clear($sClearedFileName));
	}

	/**
	 * @param string $sKey
	 *
	 * @return void
	 */
	public function cacheByKey($sKey)
	{
		if (!empty($sKey))
		{
			$iUtcTimeStamp = time();
			$iExpireTime = 3600 * 24 * 5;

			header('Cache-Control: private', true);
			header('Pragma: private', true);
			header('Etag: '.md5('Etag:'.md5($sKey)), true);
			header('Last-Modified: '.gmdate('D, d M Y H:i:s', $iUtcTimeStamp - $iExpireTime).' UTC', true);
			header('Expires: '.gmdate('D, j M Y H:i:s', $iUtcTimeStamp + $iExpireTime).' UTC', true);
		}
	}

	/**
	 * @param string $sKey
	 *
	 * @return void
	 */
	public function verifyCacheByKey($sKey)
	{
		if (!empty($sKey))
		{
			$sIfModifiedSince = $this->oHttp->GetHeader('If-Modified-Since', '');
			if (!empty($sIfModifiedSince))
			{
				$this->oHttp->StatusHeader(304);
				$this->cacheByKey($sKey);
				exit();
			}
		}
	}

	/**
	 * @param CAccount $oAccount
	 *
	 * @return array|null
	 */
	private function mobileSyncSettings($oAccount)
	{
		$mResult = null;
		$oApiDavManager = \CApi::Manager('dav');

		if ($oAccount && $oApiDavManager)
		{
			$oApiCapabilityManager = \CApi::Manager('capability');
			/* @var $oApiCapabilityManager \CApiCapabilityManager */

			$oApiCalendarManager = \CApi::Manager('calendar');

			$bEnableMobileSync = $oApiCapabilityManager->IsMobileSyncSupported($oAccount);

			$mResult = array();

			$mResult['EnableDav'] = $bEnableMobileSync;

			$sDavLogin = $oApiDavManager->GetLogin($oAccount);
			$sDavServer = $oApiDavManager->GetServerUrl();

			$mResult['Dav'] = null;
			$mResult['ActiveSync'] = null;
			$mResult['DavError'] = '';

			$oException = $oApiDavManager->GetLastException();
			if (!$oException)
			{
				if ($bEnableMobileSync)
				{
					$mResult['Dav'] = array();
					$mResult['Dav']['Login'] = $sDavLogin;
					$mResult['Dav']['Server'] = $sDavServer;
					$mResult['Dav']['PrincipalUrl'] = '';

					$sPrincipalUrl = $oApiDavManager->GetPrincipalUrl($oAccount);
					if ($sPrincipalUrl)
					{
						$mResult['Dav']['PrincipalUrl'] = $sPrincipalUrl;
					}

					$mResult['Dav']['Calendars'] = array();

					$aCalendars = $oApiCalendarManager ? $oApiCalendarManager->GetCalendars($oAccount) : null;

//					if (isset($aCalendars['user']) && is_array($aCalendars['user']))
//					{
//						foreach($aCalendars['user'] as $aCalendar)
//						{
//							if (isset($aCalendar['name']) && isset($aCalendar['url']))
//							{
//								$mResult['Dav']['Calendars'][] = array(
//									'Name' => $aCalendar['name'],
//									'Url' => $sDavServer.$aCalendar['url']
//								);
//							}
//						}
//					}

					if (is_array($aCalendars) && 0 < count($aCalendars))
					{
						foreach($aCalendars as $aCalendar)
						{
							if (isset($aCalendar['Name']) && isset($aCalendar['Url']))
							{
								$mResult['Dav']['Calendars'][] = array(
									'Name' => $aCalendar['Name'],
									'Url' => $sDavServer.$aCalendar['Url']
								);
							}
						}
					}

					$mResult['Dav']['PersonalContactsUrl'] = $sDavServer.'/addressbooks/'.$sDavLogin.'/Default';
					$mResult['Dav']['CollectedAddressesUrl'] = $sDavServer.'/addressbooks/'.$sDavLogin.'/Collected';
					$mResult['Dav']['GlobalAddressBookUrl'] = $sDavServer.'/gab';
				}
			}
			else
			{
				$mResult['DavError'] = $oException->getMessage();
			}
		}

		return $mResult;
	}

	/**
	 * @param CAccount $oAccount
	 *
	 * @return array|null
	 */
	private function outlookSyncSettings($oAccount)
	{
		$mResult = null;
		if ($oAccount && $this->oApiCapability->IsOutlookSyncSupported($oAccount))
		{
			/* @var $oApiDavManager \CApiDavManager */
			$oApiDavManager = \CApi::Manager('dav');

			$sLogin = $oApiDavManager->GetLogin($oAccount);
			$sServerUrl = $oApiDavManager->GetServerUrl();

			$mResult = array();
			$mResult['Login'] = '';
			$mResult['Server'] = '';
			$mResult['DavError'] = '';

			$oException = $oApiDavManager->GetLastException();
			if (!$oException)
			{
				$mResult['Login'] = $sLogin;
				$mResult['Server'] = $sServerUrl;
			}
			else
			{
				$mResult['DavError'] = $oException->getMessage();
			}
		}

		return $mResult;
	}

	/**
	 * @return array
	 */
	public function AjaxHelpdeskThreadsList()
	{
		$oAccount = null;
		$oUser = $this->getHelpdeskAccountFromParam($oAccount);

		$iFilter = (int) $this->getParamValue('Filter', \EHelpdeskThreadFilterType::All);
		$sSearch = (string) $this->getParamValue('Search', '');
		$iOffset = (int) $this->getParamValue('Offset', 0);
		$iLimit = (int) $this->getParamValue('Limit', 10);

		$bIsAgent = $oUser->IsAgent;

		if (0 > $iOffset || 1 > $iLimit)
		{
			throw new \ProjectSeven\Exceptions\ClientException(\ProjectSeven\Notifications::InvalidInputParameter);
		}

		$aList = array();
		$iCount = $this->ApiHelpdesk()->GetThreadsCount($oUser, $iFilter, $sSearch);
		if ($iCount)
		{
			$aList = $this->ApiHelpdesk()->GetThreads($oUser, $iOffset, $iLimit, $iFilter, $sSearch);
		}

		$aOwnerIdList = array();
		if (is_array($aList) && 0 < count($aList))
		{
			foreach ($aList as &$oItem)
			{
				$aOwnerIdList[$oItem->IdOwner] = (int) $oItem->IdOwner;
			}
		}

		if (0 < count($aOwnerIdList))
		{
			$aOwnerIdList = array_values($aOwnerIdList);
			$aUserInfo = $this->ApiHelpdesk()->UserInformation($oUser, $aOwnerIdList);

			if (is_array($aUserInfo) && 0 < count($aUserInfo))
			{
				foreach ($aList as &$oItem)
				{
					if ($oItem && isset($aUserInfo[$oItem->IdOwner]) && is_array($aUserInfo[$oItem->IdOwner]))
					{
						$sEmail = isset($aUserInfo[$oItem->IdOwner][0]) ? $aUserInfo[$oItem->IdOwner][0] : '';
						$sName = isset($aUserInfo[$oItem->IdOwner][1]) ? $aUserInfo[$oItem->IdOwner][1] : '';

						if (!$bIsAgent && 0 < strlen($sName))
						{
							$sEmail = '';
						}

						$oItem->Owner = array($sEmail, $sName);
					}
				}
			}
		}

		return $this->DefaultResponse($oAccount, __FUNCTION__, array(
			'Search' => $sSearch,
			'Filter' => $iFilter,
			'List' => $aList,
			'Offset' => $iOffset,
			'Limit' => $iLimit,
			'ItemsCount' =>  $iCount
		));
	}

	/**
	 * @return array
	 */
	public function AjaxHelpdeskThreadPosts()
	{
		$oAccount = null;
		$oUser = $this->getHelpdeskAccountFromParam($oAccount);

		$bIsAgent = $oUser->IsAgent;

		$iThreadId = (int) $this->getParamValue('ThreadId', 0);
		$iStartFromId = (int) $this->getParamValue('StartFromId', 0);
		$iLimit = (int) $this->getParamValue('Limit', 10);

		if (1 > $iThreadId || 0 > $iStartFromId || 1 > $iLimit)
		{
			throw new \ProjectSeven\Exceptions\ClientException(\ProjectSeven\Notifications::InvalidInputParameter);
		}

		$oThread = $this->ApiHelpdesk()->GetThreadById($oUser, $iThreadId);
		if (!$oThread)
		{
			throw new \ProjectSeven\Exceptions\ClientException(\ProjectSeven\Notifications::InvalidInputParameter);
		}

		$aList = $this->ApiHelpdesk()->GetPosts($oUser, $oThread, $iStartFromId, $iLimit);

		$aIdList = array();
		if (is_array($aList) && 0 < count($aList))
		{
			foreach ($aList as &$oItem)
			{
				if ($oItem)
				{
					$aIdList[$oItem->IdOwner] = (int) $oItem->IdOwner;
				}
			}
		}

		$aIdList[$oThread->IdOwner] = (int) $oThread->IdOwner;

		if (0 < count($aIdList))
		{
			$aIdList = array_values($aIdList);
			$aUserInfo = $this->ApiHelpdesk()->UserInformation($oUser, $aIdList);

			if (is_array($aUserInfo) && 0 < count($aUserInfo))
			{
				foreach ($aList as &$oItem)
				{
					if ($oItem && isset($aUserInfo[$oItem->IdOwner]) && is_array($aUserInfo[$oItem->IdOwner]))
					{
						$oItem->Owner = array(
							isset($aUserInfo[$oItem->IdOwner][0]) ? $aUserInfo[$oItem->IdOwner][0] : '',
							isset($aUserInfo[$oItem->IdOwner][1]) ? $aUserInfo[$oItem->IdOwner][1] : ''
						);

						$oItem->IsThreadOwner = $oThread->IdOwner === $oItem->IdOwner;
					}

					if ($oItem)
					{
						$oItem->ItsMe = $oUser->IdHelpdeskUser === $oItem->IdOwner;
					}
				}

				if (isset($aUserInfo[$oThread->IdOwner]) && is_array($aUserInfo[$oThread->IdOwner]))
				{
					$sEmail = isset($aUserInfo[$oThread->IdOwner][0]) ? $aUserInfo[$oThread->IdOwner][0] : '';
					$sName = isset($aUserInfo[$oThread->IdOwner][1]) ? $aUserInfo[$oThread->IdOwner][1] : '';

					if (!$bIsAgent && 0 < strlen($sName))
					{
						$sEmail = '';
					}

					$oThread->Owner = array($sEmail, $sName);
				}
			}
		}

		if ($oThread->HasAttachments)
		{
			$aAttachments = $this->ApiHelpdesk()->GetAttachments($oUser, $oThread);
			if (is_array($aAttachments))
			{
				foreach ($aList as &$oItem)
				{
					if (isset($aAttachments[$oItem->IdHelpdeskPost]) && is_array($aAttachments[$oItem->IdHelpdeskPost]) &&
						0 < count($aAttachments[$oItem->IdHelpdeskPost]))
					{
						$oItem->Attachments = $aAttachments[$oItem->IdHelpdeskPost];
					}
				}
			}
		}

		return $this->DefaultResponse($oAccount, __FUNCTION__, array(
			'ThreadId' => $oThread->IdHelpdeskThread,
			'StartFromId' => $iStartFromId,
			'Limit' => $iLimit,
			'ItemsCount' => $oThread->PostCount > count($aList) ? $oThread->PostCount : count($aList),
			'List' => $aList
		));
	}

	/**
	 * @return array
	 */
	public function AjaxHelpdeskGetThreadByHash()
	{
		$oAccount = null;
		$oThread = false;
		$oUser = $this->getHelpdeskAccountFromParam($oAccount);

		$bIsAgent = $oUser->IsAgent;

		$sThreadHash = (string) $this->getParamValue('ThreadHash', '');
		if (empty($sThreadHash))
		{
			throw new \ProjectSeven\Exceptions\ClientException(\ProjectSeven\Notifications::InvalidInputParameter);
		}

		$oApiHelpdesk = \CApi::Manager('helpdesk');
		if ($oApiHelpdesk)
		{
			$mHelpdeskIdTenant = $oApiHelpdesk->GetThreadIdByHash($oUser->IdTenant, $sThreadHash);
			if (!is_int($mHelpdeskIdTenant) || 1 > $mHelpdeskIdTenant)
			{
				throw new \ProjectSeven\Exceptions\ClientException(\ProjectSeven\Notifications::InvalidInputParameter);
			}

			$oThread = $this->ApiHelpdesk()->GetThreadById($oUser, $mHelpdeskIdTenant);
			if (!$oThread)
			{
				throw new \ProjectSeven\Exceptions\ClientException(\ProjectSeven\Notifications::InvalidInputParameter);
			}

			$aUserInfo = $this->ApiHelpdesk()->UserInformation($oUser, array($oThread->IdOwner));
			if (is_array($aUserInfo) && 0 < count($aUserInfo))
			{
				if (isset($aUserInfo[$oThread->IdOwner]) && is_array($aUserInfo[$oThread->IdOwner]))
				{
					$sEmail = isset($aUserInfo[$oThread->IdOwner][0]) ? $aUserInfo[$oThread->IdOwner][0] : '';
					$sName = isset($aUserInfo[$oThread->IdOwner][1]) ? $aUserInfo[$oThread->IdOwner][1] : '';

					if (!$bIsAgent && 0 < strlen($sName))
					{
						$sEmail = '';
					}

					$oThread->Owner = array($sEmail, $sName);
				}
			}
		}

		return $this->DefaultResponse($oAccount, __FUNCTION__, $oThread);
	}

	/**
	 * @return array
	 */
	public function AjaxHelpdeskPostDelete()
	{
		$oAccount = null;
		$oUser = $this->getHelpdeskAccountFromParam($oAccount);

		if (!$oUser)
		{
			throw new \ProjectSeven\Exceptions\ClientException(\ProjectSeven\Notifications::AccessDenied);
		}

		$iThreadId = (int) $this->getParamValue('ThreadId', 0);
		$iPostId = (int) $this->getParamValue('PostId', 0);

		if (0 >= $iThreadId || 0 >= $iPostId)
		{
			throw new \ProjectSeven\Exceptions\ClientException(\ProjectSeven\Notifications::InvalidInputParameter);
		}

		$oThread = $this->ApiHelpdesk()->GetThreadById($oUser, $iThreadId);
		if (!$oThread)
		{
			throw new \ProjectSeven\Exceptions\ClientException(\ProjectSeven\Notifications::InvalidInputParameter);
		}

		if (!$this->ApiHelpdesk()->VerifyPostIdsBelongToUser($oUser, array($iPostId)))
		{
			throw new \ProjectSeven\Exceptions\ClientException(\ProjectSeven\Notifications::AccessDenied);
		}

		return $this->DefaultResponse($oAccount, __FUNCTION__,
			$this->ApiHelpdesk()->DeletePosts($oUser, $oThread, array($iPostId)));
	}

	/**
	 * @return array
	 */
	public function AjaxHelpdeskThreadDelete()
	{
		$oAccount = null;
		$oUser = $this->getHelpdeskAccountFromParam($oAccount);

		if (!$oUser)
		{
			throw new \ProjectSeven\Exceptions\ClientException(\ProjectSeven\Notifications::AccessDenied);
		}

		$iThreadId = (int) $this->getParamValue('ThreadId', '');

		if (0 < $iThreadId && !$oUser->IsAgent && !$this->ApiHelpdesk()->VerifyThreadIdsBelongToUser($oUser, array($iThreadId)))
		{
			throw new \ProjectSeven\Exceptions\ClientException(\ProjectSeven\Notifications::AccessDenied);
		}

		$bResult = false;
		if (0 < $iThreadId)
		{
			$bResult = $this->ApiHelpdesk()->ArchiveThreads($oUser, array($iThreadId));
		}

		return $this->DefaultResponse($oAccount, __FUNCTION__, $bResult);
	}

	/**
	 * @return array
	 */
	public function AjaxHelpdeskThreadChangeState()
	{
		$oAccount = null;
		$oUser = $this->getHelpdeskAccountFromParam($oAccount);

		$iThreadId = (int) $this->getParamValue('ThreadId', 0);
		$iThreadType = (int) $this->getParamValue('Type', \EHelpdeskThreadType::None);

		if (1 > $iThreadId || !in_array($iThreadType, array(
			\EHelpdeskThreadType::Pending,
			\EHelpdeskThreadType::Waiting,
			\EHelpdeskThreadType::Answered,
			\EHelpdeskThreadType::Resolved,
			\EHelpdeskThreadType::Deferred
		)))
		{
			throw new \ProjectSeven\Exceptions\ClientException(\ProjectSeven\Notifications::InvalidInputParameter);
		}

		if (!$oUser || ($iThreadType !== \EHelpdeskThreadType::Resolved && !$oUser->IsAgent))
		{
			throw new \ProjectSeven\Exceptions\ClientException(\ProjectSeven\Notifications::AccessDenied);
		}

		$bResult = false;
		$oThread = $this->ApiHelpdesk()->GetThreadById($oUser, $iThreadId);
		if ($oThread)
		{
			$oThread->Type = $iThreadType;
			$bResult = $this->ApiHelpdesk()->UpdateThread($oUser, $oThread);
		}

		return $this->DefaultResponse($oAccount, __FUNCTION__, $bResult);
	}

	/**
	 * @return array
	 */
	public function AjaxHelpdeskIsAgent()
	{
		$oAccount = null;
		$oUser = $this->getHelpdeskAccountFromParam($oAccount);

		return $this->DefaultResponse($oAccount, __FUNCTION__, $oUser && $oUser->IsAgent);
	}

	/**
	 * @return array
	 */
	public function AjaxHelpdeskUpdateSettings()
	{
		$oAccount = null;
		$oUser = $this->getHelpdeskAccountFromParam($oAccount);

		$sName = (string) $this->oHttp->GetPost('Name', $oUser->Name);
		$sLanguage = (string) $this->oHttp->GetPost('Language', $oUser->Language);
//		$sLanguage = $this->validateLang($sLanguage);

		$sDateFormat = (string) $this->oHttp->GetPost('DateFormat', $oUser->DateFormat);
		$iTimeFormat = (int) $this->oHttp->GetPost('TimeFormat', $oUser->TimeFormat);

		$oUser->Name = trim($sName);
		$oUser->Language = trim($sLanguage);
		$oUser->DateFormat = $sDateFormat;
		$oUser->TimeFormat = $iTimeFormat;

		return $this->DefaultResponse($oAccount, __FUNCTION__,
			$this->ApiHelpdesk()->UpdateUser($oUser));
	}

	/**
	 * @return array
	 */
	public function AjaxHelpdeskUpdateUserPassword()
	{
		$oAccount = null;
		$oUser = $this->getHelpdeskAccountFromParam($oAccount);

		$sCurrentPassword = (string) $this->oHttp->GetPost('CurrentPassword', '');
		$sNewPassword = (string) $this->oHttp->GetPost('NewPassword', '');

		$bResult = false;
		if ($oUser && $oUser->ValidatePassword($sCurrentPassword) && 0 < strlen($sNewPassword))
		{
			$oUser->SetPassword($sNewPassword);
			if (!$this->ApiHelpdesk()->UpdateUser($oUser))
			{
				throw new \ProjectSeven\Exceptions\ClientException(\ProjectSeven\Notifications::CanNotChangePassword);
			}
		}

		return $this->DefaultResponse($oAccount, __FUNCTION__, $bResult);
	}

	public function AjaxHelpdeskPostCreate()
	{
		$oAccount = null;
		$oUser = $this->getHelpdeskAccountFromParam($oAccount);
		/* @var $oAccount CAccount */

		$iThreadId = (int) $this->getParamValue('ThreadId', 0);
		$sSubject = trim((string) $this->getParamValue('Subject', ''));
		$sText = trim((string) $this->getParamValue('Text', ''));
		$bIsInternal = '1' === (string) $this->getParamValue('IsInternal', '0');
		$mAttachments = $this->getParamValue('Attachments', null);

		if (0 === strlen($sText) || (0 === $iThreadId && 0 === strlen($sSubject)))
		{
			throw new \ProjectSeven\Exceptions\ClientException(\ProjectSeven\Notifications::InvalidInputParameter);
		}

		$mResult = false;
		$bIsNew = false;

		$oThread = null;
		if (0 === $iThreadId)
		{
			$bIsNew = true;

			$oThread = new \CHelpdeskThread();
			$oThread->IdTenant = $oUser->IdTenant;
			$oThread->IdOwner = $oUser->IdHelpdeskUser;
			$oThread->Type = \EHelpdeskThreadType::Pending;
			$oThread->Subject = $sSubject;

			if (!$this->ApiHelpdesk()->CreateThread($oUser, $oThread))
			{
				$oThread = null;
			}
		}
		else
		{
			$oThread = $this->ApiHelpdesk()->GetThreadById($oUser, $iThreadId);
		}

		if ($oThread && 0 < $oThread->IdHelpdeskThread)
		{
			$oPost = new \CHelpdeskPost();
			$oPost->IdTenant = $oUser->IdTenant;
			$oPost->IdOwner = $oUser->IdHelpdeskUser;
			$oPost->IdHelpdeskThread = $oThread->IdHelpdeskThread;
			$oPost->Type = $bIsInternal ? \EHelpdeskPostType::Internal : \EHelpdeskPostType::Normal;
			$oPost->SystemType = \EHelpdeskPostSystemType::None;
			$oPost->Text = $sText;

			$aResultAttachment = array();
			if (is_array($mAttachments) && 0 < count($mAttachments))
			{
				foreach ($mAttachments as $sTempName => $sHash)
				{
					$aDecodeData = \CApi::DecodeKeyValues($sHash);
					if (!isset($aDecodeData['HelpdeskUserID']))
					{
						continue;
					}

					$rData = $this->ApiFileCache()->GetFile($oUser, $sTempName);
					if ($rData)
					{
						$iFileSize = $this->ApiFileCache()->FileSize($oUser, $sTempName);

						$sThreadID = (string) $oThread->IdHelpdeskThread;
						$sThreadID = str_pad($sThreadID, 2, '0', STR_PAD_LEFT);
						$sThreadIDSubFolder = substr($sThreadID, 0, 2);

						$sThreadFolderName = API_HELPDESK_PUBLIC_NAME.'/'.$sThreadIDSubFolder.'/'.$sThreadID;

						$this->oApiFilestorage->CreateFolder($oUser, \EFileStorageType::Corporate, '',
							$sThreadFolderName);

						$sUploadName = $this->oApiFilestorage->GetNonExistingFileName($oUser,
							\EFileStorageType::Corporate, $sThreadFolderName,
								isset($aDecodeData['Name']) ? $aDecodeData['Name'] : $sTempName
							);

						$this->oApiFilestorage->CreateFile($oUser,
							\EFileStorageType::Corporate, $sThreadFolderName, $sUploadName, $rData);

						$oAttachment = new \CHelpdeskAttachment();
						$oAttachment->IdHelpdeskThread = $oThread->IdHelpdeskThread;
						$oAttachment->IdHelpdeskPost = $oPost->IdHelpdeskPost;
						$oAttachment->IdOwner = $oUser->IdHelpdeskUser;
						$oAttachment->IdTenant = $oUser->IdTenant;

						$oAttachment->FileName = $sUploadName;
						$oAttachment->SizeInBytes = $iFileSize;
						$oAttachment->Hash = \CApi::EncodeKeyValues(array(
							'FilestorageFile' => true,
							'HelpdeskTenantID' => $oUser->IdTenant,
							'HelpdeskUserID' => $oUser->IdHelpdeskUser,
							'StorageType' => \EFileStorageType::Corporate,
							'Name' => $sUploadName,
							'Path' => $sThreadFolderName
						));

						$aResultAttachment[] = $oAttachment;
					}
				}

				if (is_array($aResultAttachment) && 0 < count($aResultAttachment))
				{
					$oPost->Attachments = $aResultAttachment;
				}
			}

			$mResult = $this->ApiHelpdesk()->CreatePost($oUser, $oThread, $oPost, $bIsNew);
			if ($mResult)
			{
				$mResult = $oThread->IdHelpdeskThread;
			}
		}

		return $this->DefaultResponse($oAccount, __FUNCTION__, $mResult);
	}

	public function AjaxHelpdeskThreadSeen()
	{
		$oAccount = null;
		$oUser = $this->getHelpdeskAccountFromParam($oAccount);

		$iThreadId = (int) $this->getParamValue('ThreadId', 0);

		if (0 === $iThreadId)
		{
			throw new \ProjectSeven\Exceptions\ClientException(\ProjectSeven\Notifications::InvalidInputParameter);
		}

		$oThread = $this->ApiHelpdesk()->GetThreadById($oUser, $iThreadId);
		if (!$oThread)
		{
			throw new \ProjectSeven\Exceptions\ClientException(\ProjectSeven\Notifications::AccessDenied);
		}

		return $this->DefaultResponse($oAccount, __FUNCTION__, $this->ApiHelpdesk()->SetThreadSeen($oUser, $oThread));
	}

	public function AjaxHelpdeskLogin()
	{
		$sTenantHash = trim($this->getParamValue('TenantHash', ''));
		if ($this->oApiCapability->IsHelpdeskSupported())
		{
			$sEmail = trim($this->getParamValue('Email', ''));
			$sPassword = trim($this->getParamValue('Password', ''));
			$bSignMe = '1' === (string) $this->getParamValue('SignMe', '0');

			if (0 === strlen($sEmail) || 0 === strlen($sPassword))
			{
				throw new \ProjectSeven\Exceptions\ClientException(\ProjectSeven\Notifications::InvalidInputParameter);
			}

			$mIdTenant = $this->oApiIntegrator->GetTenantIdByHash($sTenantHash);
			if (!is_int($mIdTenant))
			{
				throw new \ProjectSeven\Exceptions\ClientException(\ProjectSeven\Notifications::InvalidInputParameter);
			}

			try
			{
				$oHelpdeskUser = $this->oApiIntegrator->LoginToHelpdeskAccount($mIdTenant, $sEmail, $sPassword);
				if ($oHelpdeskUser && !$oHelpdeskUser->Blocked)
				{
					$this->oApiIntegrator->SetHelpdeskUserAsLoggedIn($oHelpdeskUser, $bSignMe);
					return $this->TrueResponse(null, __FUNCTION__);
				}
			}
			catch (\Exception $oException)
			{
				$iErrorCode = \ProjectSeven\Notifications::UnknownError;
				if ($oException instanceof \CApiManagerException)
				{
					switch ($oException->getCode())
					{
						case \Errs::HelpdeskManager_AccountSystemAuthentication:
							$iErrorCode = \ProjectSeven\Notifications::HelpdeskSystemUserExists;
							break;
						case \Errs::HelpdeskManager_AccountAuthentication:
							$iErrorCode = \ProjectSeven\Notifications::AuthError;
							break;
						case \Errs::HelpdeskManager_UnactivatedUser:
							$iErrorCode = \ProjectSeven\Notifications::HelpdeskUnactivatedUser;
							break;
						case \Errs::Db_ExceptionError:
							$iErrorCode = \ProjectSeven\Notifications::DataBaseError;
							break;
					}
				}

				throw new \ProjectSeven\Exceptions\ClientException($iErrorCode);
			}
		}

		return $this->FalseResponse(null, __FUNCTION__);
	}

	public function AjaxHelpdeskLogout()
	{
		if ($this->oApiCapability->IsHelpdeskSupported())
		{
			$this->oApiIntegrator->LogoutHelpdeskUser();
		}

		return $this->TrueResponse(null, __FUNCTION__);
	}

	public function AjaxHelpdeskRegister()
	{
		$sTenantHash = trim($this->getParamValue('TenantHash', ''));
		if ($this->oApiCapability->IsHelpdeskSupported())
		{
			$sEmail = trim($this->getParamValue('Email', ''));
			$sName = trim($this->getParamValue('Name', ''));
			$sPassword = trim($this->getParamValue('Password', ''));

			if (0 === strlen($sEmail) || 0 === strlen($sPassword))
			{
				throw new \ProjectSeven\Exceptions\ClientException(\ProjectSeven\Notifications::InvalidInputParameter);
			}

			$mIdTenant = $this->oApiIntegrator->GetTenantIdByHash($sTenantHash);
			if (!is_int($mIdTenant))
			{
				throw new \ProjectSeven\Exceptions\ClientException(\ProjectSeven\Notifications::InvalidInputParameter);
			}

			$bResult = false;
			try
			{
				$bResult = $this->oApiIntegrator->RegisterHelpdeskAccount($mIdTenant, $sEmail, $sName, $sPassword);
			}
			catch (\Exception $oException)
			{
				$iErrorCode = \ProjectSeven\Notifications::UnknownError;
				if ($oException instanceof \CApiManagerException)
				{
					switch ($oException->getCode())
					{
						case \Errs::HelpdeskManager_UserAlreadyExists:
							$iErrorCode = \ProjectSeven\Notifications::HelpdeskUserAlreadyExists;
							break;
						case \Errs::HelpdeskManager_UserCreateFailed:
							$iErrorCode = \ProjectSeven\Notifications::CanNotCreateHelpdeskUser;
							break;
						case \Errs::Db_ExceptionError:
							$iErrorCode = \ProjectSeven\Notifications::DataBaseError;
							break;
					}
				}

				throw new \ProjectSeven\Exceptions\ClientException($iErrorCode);
			}

			return $this->DefaultResponse(null, __FUNCTION__, $bResult);
		}

		return $this->FalseResponse(null, __FUNCTION__);
	}

	public function AjaxHelpdeskForgot()
	{
		$sTenantHash = trim($this->getParamValue('TenantHash', ''));
		if ($this->oApiCapability->IsHelpdeskSupported())
		{
			$sEmail = trim($this->getParamValue('Email', ''));

			if (0 === strlen($sEmail))
			{
				throw new \ProjectSeven\Exceptions\ClientException(\ProjectSeven\Notifications::InvalidInputParameter);
			}

			$mIdTenant = $this->oApiIntegrator->GetTenantIdByHash($sTenantHash);
			if (!is_int($mIdTenant))
			{
				throw new \ProjectSeven\Exceptions\ClientException(\ProjectSeven\Notifications::InvalidInputParameter);
			}

			$oHelpdesk = $this->ApiHelpdesk();
			if ($oHelpdesk)
			{
				$oUser = $oHelpdesk->GetUserByEmail($mIdTenant, $sEmail);
				if (!($oUser instanceof \CHelpdeskUser))
				{
					throw new \ProjectSeven\Exceptions\ClientException(\ProjectSeven\Notifications::HelpdeskUnknownUser);
				}

				return $this->DefaultResponse(null, __FUNCTION__, $oHelpdesk->ForgotUser($oUser));
			}
		}

		return $this->FalseResponse(null, __FUNCTION__);
	}

	public function AjaxHelpdeskForgotChangePassword()
	{
		$sTenantHash = trim($this->getParamValue('TenantHash', ''));
		if ($this->oApiCapability->IsHelpdeskSupported())
		{
			$sActivateHash = \trim($this->getParamValue('ActivateHash', ''));
			$sNewPassword = \trim($this->getParamValue('NewPassword', ''));

			if (0 === strlen($sNewPassword) || 0 === strlen($sActivateHash))
			{
				throw new \ProjectSeven\Exceptions\ClientException(\ProjectSeven\Notifications::InvalidInputParameter);
			}

			$mIdTenant = $this->oApiIntegrator->GetTenantIdByHash($sTenantHash);
			if (!is_int($mIdTenant))
			{
				throw new \ProjectSeven\Exceptions\ClientException(\ProjectSeven\Notifications::InvalidInputParameter);
			}

			$oHelpdesk = $this->ApiHelpdesk();
			if ($oHelpdesk)
			{
				$oUser = $oHelpdesk->GetUserByActivateHash($mIdTenant, $sActivateHash);
				if (!($oUser instanceof \CHelpdeskUser))
				{
					throw new \ProjectSeven\Exceptions\ClientException(\ProjectSeven\Notifications::HelpdeskUnknownUser);
				}

				$oUser->Activated = true;
				$oUser->SetPassword($sNewPassword);
				$oUser->RegenerateActivateHash();

				return $this->DefaultResponse(null, __FUNCTION__, $oHelpdesk->UpdateUser($oUser));
			}
		}

		return $this->FalseResponse(null, __FUNCTION__);
	}

	/**
	 * @return array
	 */
	public function UploadHelpdeskFile()
	{
		$oAccount = null;
		$oUser = $this->getHelpdeskAccountFromParam($oAccount);

		if (!$this->oApiCapability->IsHelpdeskSupported() || !$this->oApiCapability->IsFilesSupported())
		{
			throw new \ProjectSeven\Exceptions\ClientException(\ProjectSeven\Notifications::AccessDenied);
		}

		$aFileData = $this->getParamValue('FileData', null);

		$iSizeLimit = 0;

		$sError = '';
		$aResponse = array();

		if ($oUser)
		{
			if (is_array($aFileData))
			{
				if (0 < $iSizeLimit && $iSizeLimit < (int) $aFileData['size'])
				{
					$sError = 'size';
				}
				else
				{
					$sSavedName = 'upload-post-'.md5($aFileData['name'].$aFileData['tmp_name']);
					if ($this->ApiFileCache()->MoveUploadedFile($oUser, $sSavedName, $aFileData['tmp_name']))
					{
						$sUploadName = $aFileData['name'];
						$iSize = $aFileData['size'];
						$sMimeType = \MailSo\Base\Utils::MimeContentType($sUploadName);

						$aResponse['HelpdeskFile'] = array(
							'Name' => $sUploadName,
							'TempName' => $sSavedName,
							'MimeType' => $sMimeType,
							'Size' =>  (int) $iSize,
							'Hash' => \CApi::EncodeKeyValues(array(
								'TempFile' => true,
								'HelpdeskTenantID' => $oUser->IdTenant,
								'HelpdeskUserID' => $oUser->IdHelpdeskUser,
								'Name' => $sUploadName,
								'TempName' => $sSavedName
							))
						);
					}
					else
					{
						$sError = 'unknown';
					}
				}
			}
			else
			{
				$sError = 'unknown';
			}
		}
		else
		{
			$sError = 'auth';
		}

		if (0 < strlen($sError))
		{
			$aResponse['Error'] = $sError;
		}

		return $this->DefaultResponse($oAccount, 'HelpdeskFile', $aResponse);
	}
}
