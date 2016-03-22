<?php
namespace BusinessMan\Bundle\WebmailBundle\Webmail;

use BusinessMan\Bundle\BusinessManBundle\Entity\User;
use BusinessMan\Bundle\WebmailBundle\Entity\EmailAccount;
use BusinessMan\Bundle\WebmailBundle\Webmail\Exception\WebmailException;
use Doctrine\Common\Persistence\ManagerRegistry;

/**
 * WebmailBridge
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/businessmanportal/WebmailBundle
 */
class WebmailBridge
{
    /**
     * @var array
     */
    private $managers;

    /**
     * @var \Doctrine\Common\Persistence\ManagerRegistry
     */
    private $doctrine;

    public function __construct(ManagerRegistry $doctrine, $webmailPath)
    {
        $this->managers = array();
        $this->doctrine = $doctrine;

        // Include the webmail libraries
        if (!(class_exists('\CApi') && \CApi::IsValid())) {
            include_once $webmailPath . '/libraries/afterlogic/api.php';
        }

        if (!(class_exists('CApi') && \CApi::IsValid())) {
            throw new WebmailException('Unable to open webmail API');
        }
    }

    /**
     * Get an instance of an AfterLogic API manager
     *
     * @param string $name Manager to retrieve
     *
     * @return mixed
     */
    public function manager($name)
    {
        if (!isset($this->managers[$name])) {
            $this->managers[$name] = \CApi::Manager($name);
        }

        return $this->managers[$name];
    }

    public function logout()
    {
        $this->manager('integrator')->LogoutAccount();
    }

    public function login(User $loggedInUser)
    {
        // Retrieve the user's email accounts
        $accounts = $this->doctrine->getRepository('BusinessManWebmailBundle:EmailAccount')->createQueryBuilder('e')
            ->orWhere('e.staff = :staff')
            ->orWhere('e.global = :global')
            ->setParameter('staff', $loggedInUser->getStaff())
            ->setParameter('global', true, 'yesno')
            ->orderBy('e.default', 'DESC')
            ->getQuery()
            ->execute();

        // Webmail requires at least one account to be set up
        if (empty($accounts)) {
            throw new WebmailException('No accounts have been configured for this user');
        }

        // Create the webmail user if not yet done
        $user = $this->manager('users')->GetUserById($loggedInUser->getId());

        if (is_null($user) || $user === false) {
            $user = $this->createUserInstance($loggedInUser);
            $this->manager('users')->CreateUser($user);
        }

        // Create the mailboxes
        $validAccounts = array();

        foreach ($accounts as $account) {
            $exists = false;

            foreach ($this->getAccountsForUser($loggedInUser->getId()) as $webmailAccount) {
                if ($webmailAccount->Email == $account->getEmailAddress()) {
                    $exists = true;
                    break;
                }
            }

            if ($exists) {
                $webmailAccount = $this->updateAccountInstance($webmailAccount, $account);

                if (!$this->manager('users')->UpdateAccount($webmailAccount)) {
                    continue;
                }
            } else {
                $webmailAccount = $this->createAccountInstance($account);
                $webmailAccount->IdUser = $user->IdUser;
                $webmailAccount->User = $user;

                if (!$this->manager('users')->CreateAccount($webmailAccount, true)) {
                    continue;
                }
            }

            $validAccounts[] = $webmailAccount;

            if ($account->getDefault() == 'On') {
                $defaultAccount = $webmailAccount;
            }
        }

        if (empty($validAccounts) && !isset($defaultAccount)) {
            throw new WebmailException('Unable to successfully create any mailboxes', 0, $this->manager('users')->GetLastException());
        }

        // If no accounts set as default, use the first one
        if (!isset($defaultAccount)) {
            $defaultAccount = array_shift($validAccounts);
        }

        // Remove any deleted mailboxes
        foreach ($this->getAccountsForUser($loggedInUser->getId()) as $webmailAccount) {
            $exists = false;

            foreach ($accounts as $account) {
                if ($webmailAccount->Email == $account->getEmailAddress()) {
                    $exists = true;
                    break;
                }
            }

            if (!$exists) {
                $this->manager('users')->DeleteAccount($webmailAccount);
            }
        }

        // Login to the default account
        $this->manager('integrator')->SetAccountAsLoggedIn($defaultAccount, true);
    }

    public function isLoggedIn()
    {
        return $this->getLoggedInUserId() !== 0;
    }

    protected function getLoggedInUserId()
    {
        return $this->manager('integrator')->GetLogginedUserId();
    }

    public function getAccountsForUser($userId)
    {
        $accountDetails = $this->manager('users')->GetUserAccountListInformation($userId);
        $accounts = array();

        foreach ($accountDetails as $id => $details) {
            $accounts[] = $this->manager('users')->GetAccountById($id);
        }

        return $accounts;
    }

    public function getInboxCounts()
    {
        $accounts = array();

        foreach ($this->getAccountsForUser($this->getLoggedInUserId()) as $account) {
            try {
                $data = $this->manager('mail')->FolderCounts($account, 'INBOX');

                $accounts[] = array(
                    'id' => $account->IdAccount,
                    'mailbox' => $account->Email,
                    'total' => $data[0],
                    'unread' => $data[1]
                );
            } catch (\Exception $e) {
                throw new WebmailException('Unable to fetch inbox counts');
            }
        }

        return $accounts;
    }

    private function createUserInstance(User $loggedInUser)
    {
        $user = new \CUser(new \CDomain());
        $user->IdUser = $loggedInUser->getId();

        return $user;
    }

    private function createAccountInstance(EmailAccount $account)
    {
        return $this->updateAccountInstance(\CAccount::NewInstance(new \CDomain()), $account);
    }

    private function updateAccountInstance($webmailAccount, EmailAccount $account)
    {
        $webmailAccount->Email = $account->getEmailAddress();
        $webmailAccount->IsDefaultAccount = ($account->getDefault() == 'On');
        $webmailAccount->FriendlyName = $account->getName();

        $webmailAccount->IncomingMailLogin = $account->getIncomingUsername();
        $webmailAccount->IncomingMailPassword = $account->getIncomingPassword();
        $webmailAccount->IncomingMailProtocol = in_array($account->getIncomingPort(), array('110', '995')) ? \EMailProtocol::POP3 : \EMailProtocol::IMAP4;
        $webmailAccount->IncomingMailServer = $account->getIncomingServer();
        $webmailAccount->IncomingMailPort = $account->getIncomingPort();
        $webmailAccount->IncomingMailUseSSL = ($account->getIncomingSSL() == 'On');

        $webmailAccount->OutgoingMailServer = $account->getSmtpServer();
        $webmailAccount->OutgoingMailPort = $account->getSmtpPort();
        $webmailAccount->OutgoingMailAuth = ($account->getSmtpUsername() != '');
        $webmailAccount->OutgoingMailLogin = $account->getSmtpUsername();
        $webmailAccount->OutgoingMailPassword = $account->getSmtpPassword();
        $webmailAccount->OutgoingMailUseSSL = ($account->getSmtpSSL() == 'On');

        return $webmailAccount;
    }
}
