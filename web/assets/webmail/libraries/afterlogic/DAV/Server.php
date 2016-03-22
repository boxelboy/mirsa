<?php

/*
 * Copyright (C) 2002-2013 AfterLogic Corp. (www.afterlogic.com)
 * Distributed under the terms of the license described in LICENSE
 *
 */

namespace afterlogic\DAV;

class_exists('CApi') || die();

class Server extends \Sabre\DAV\Server
{
	/**
	 * @var \CApiCapabilityManager
	 */
	private $oApiCapaManager;
	
	public $oAccount = null;

	protected $aBackends = array();

	protected function GetBackend($sName)
	{
		$Result = null;
		if (isset($this->aBackends[$sName]))
		{
			$Result = $this->aBackends[$sName];
		}
		return $Result;
	}

	public function GetAuthBackend()
	{
		return $this->GetBackend('auth');
	}

	public function GetPrincipalBackend()
	{
		return $this->GetBackend('principal');
	}

	public function GetCaldavBackend()
	{
		return $this->GetBackend('caldav');
	}

	public function GetCarddavBackend()
	{
		return $this->GetBackend('carddav');
	}

	public function GetLockBackend()
	{
		return $this->GetBackend('lock');
	}

	public function GetRemindersBackend()
	{
		return $this->GetBackend('reminders');
	}

	public function GetDelegatesBackend()
	{
		return $this->GetBackend('delegates');
	}

	public function __construct($baseUri = '/')
	{
		$this->debugExceptions = false;

		$this->setBaseUri($baseUri);
		date_default_timezone_set('GMT');

		/* Get WebMail Settings */
		$oSettings =& \CApi::GetSettings();

		$sDbPrefix = $oSettings->GetConf('Common/DBPrefix');

        $this->aBackends = array(
            'auth'      => Auth\Backend\Factory::getBackend($sDbPrefix)
        );

        $this->oApiCapaManager = \CApi::Manager('capability');

        /* Authentication Plugin */
        $authPlugin = new Auth\Plugin($this->GetAuthBackend(), 'SabreDAV');
        $this->addPlugin($authPlugin);

        /* Logs Plugin */
        $this->addPlugin(new Logs\Plugin());

        /* DAV ACL Plugin */
        $aclPlugin = new \Sabre\DAVACL\Plugin();
        $mAdminPrincipal = \CApi::GetConf('labs.dav.admin-principal', false);
        $aclPlugin->hideNodesFromListings = true;
        if ($mAdminPrincipal !== false)
        {
            $aclPlugin->adminPrincipals = array($mAdminPrincipal);
        }
        $this->addPlugin($aclPlugin);

        /* Files folder */
        if ($this->oApiCapaManager->IsFilesSupported())
        {
            /* Public files folder */
            $publicDir = \CApi::DataPath() . Constants::FILESTORAGE_PATH_ROOT;
            if (!file_exists($publicDir)) mkdir($publicDir);

            $publicDir .= Constants::FILESTORAGE_PATH_CORPORATE;
            if (!file_exists($publicDir))	mkdir($publicDir);

            $privateDir = \CApi::DataPath() . Constants::FILESTORAGE_PATH_ROOT .
                    Constants::FILESTORAGE_PATH_PRIVATE;
            if (!file_exists($privateDir)) mkdir($privateDir);

            array_push($aTree, new \Sabre\DAV\SimpleCollection('files', array(
                        new FS\RootPrivate($authPlugin, $privateDir),
                        new FS\RootPublic($authPlugin, $publicDir)
                    )
                )
            );

            $this->addPlugin(new FS\Plugin());

            // Automatically guess (some) contenttypes, based on extesion
            $this->addPlugin(new \Sabre\DAV\Browser\GuessContentType());
        }

        /* Reminders Plugin */
        $this->addPlugin(new Reminders\Plugin($this->GetRemindersBackend()));

        /* Contacts Plugin */
        $this->addPlugin(new Contacts\Plugin());

        if ($this->oApiCapaManager->IsMobileSyncSupported())
        {
            /* CalDAV Plugin */
            $this->addPlugin(new \Sabre\CalDAV\Plugin());

            /* CardDAV Plugin */
            $this->addPlugin(new \Sabre\CardDAV\Plugin());

            /* ICS Export Plugin */
            $this->addPlugin(new \Sabre\CalDAV\ICSExportPlugin());

            /* VCF Export Plugin */
            $this->addPlugin(new \Sabre\CardDAV\VCFExportPlugin());
        }

        /* HTML Frontend Plugin */
        if (\CApi::GetConf('labs.dav.use-browser-plugin', false) !== false)
        {
            $this->addPlugin(new \Sabre\DAV\Browser\Plugin(true, false));
        }

        $this->subscribeEvent('beforeGetProperties', array($this, 'beforeGetProperties'), 90);
    }
	
	public function getAccount()
	{
		if (null === $this->oAccount)
		{
			$authPlugin = $this->getPlugin('auth');
			if (isset($authPlugin))
			{
				$sUser = $authPlugin->getCurrentUser();

				if (!empty($sUser))
				{
					$apiUsersManager = \CApi::Manager('users');
					$this->oAccount = $apiUsersManager->GetAccountOnLogin($sUser);
				}
			}
		}
		return $this->oAccount;
	}	

	/**
	 * @param string $path
	 * @param \Sabre\DAV\INode $node
	 * @param array $requestedProperties
	 * @param array $returnedProperties
	 * @return void
	 */
	public function beforeGetProperties($path, \Sabre\DAV\INode $node, &$requestedProperties, &$returnedProperties)
	{
		$oAccount = $this->getAccount();
		if (isset($oAccount)/* && $node->getName() === 'root'*/)
		{
			$carddavPlugin = $this->getPlugin('Sabre\CardDAV\Plugin');
			if (null !== $oAccount && isset($carddavPlugin) &&
				$this->oApiCapaManager->IsGlobalContactsSupported($oAccount, false))
			{
				$carddavPlugin->directories = array('gab');
			}
		}
	}
}