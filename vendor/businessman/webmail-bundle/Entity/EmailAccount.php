<?php
namespace BusinessMan\Bundle\WebmailBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use JMS\Serializer\Annotation as Serializer;

/**
 * EmailAccount
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/businessmanportal/WebmailBundle
 *
 * @ORM\Entity()
 * @ORM\Table(name="Email_Accounts")
 */
class EmailAccount
{
    /**
     * @var int
     *
     * @ORM\Column(name="Account_ID", type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="CUSTOM")
     * @ORM\CustomIdGenerator(class="Synergize\Bundle\DbalBundle\Driver\IdentityGenerator")
     */
    protected $id;

    /**
     * @var string
     *
     * @ORM\Column(name="Email_Address", type="string")
     */
    protected $emailAddress;

    /**
     * @var boolean
     *
     * @ORM\Column(name="Default_Account", type="onoff")
     */
    protected $default;

    /**
     * @var string
     *
     * @ORM\Column(name="Account_Name", type="string")
     */
    protected $name;

    /**
     * @var string
     *
     * @ORM\Column(name="POP_Server", type="string")
     */
    protected $incomingServer;

    /**
     * @var string
     *
     * @ORM\Column(name="POP_Port", type="string")
     */
    protected $incomingPort;

    /**
     * @var boolean
     *
     * @ORM\Column(name="POP_SSL", type="onoff")
     */
    protected $incomingSSL;

    /**
     * @var string
     *
     * @ORM\Column(name="POP_User_Name", type="string")
     */
    protected $incomingUsername;

    /**
     * @var string
     *
     * @ORM\Column(name="POP_Password", type="string")
     */
    protected $incomingPassword;

    /**
     * @var string
     *
     * @ORM\Column(name="SMTP_Server", type="string")
     */
    protected $smtpServer;

    /**
     * @var string
     *
     * @ORM\Column(name="SMTP_Port", type="string")
     */
    protected $smtpPort;

    /**
     * @var boolean
     *
     * @ORM\Column(name="SMTP_SSL", type="onoff")
     */
    protected $smtpSSL;

    /**
     * @var string
     *
     * @ORM\Column(name="SMTP_User_Name", type="string")
     */
    protected $smtpUsername;

    /**
     * @var string
     *
     * @ORM\Column(name="SMTP_Password", type="string")
     */
    protected $smtpPassword;

    /**
     * @var boolean
     *
     * @ORM\Column(name="Global_Account", type="yesno")
     */
    protected $global;

    /**
     * @var boolean
     *
     * @ORM\Column(name="Modified_TS", type="timestamp")
     */
    protected $lastModified;

    /**
     * @var \BusinessMan\Bundle\StaffBundle\Entity\Staff
     *
     * @ORM\ManyToOne(targetEntity="BusinessMan\Bundle\StaffBundle\Entity\Staff")
     * @ORM\JoinColumn(name="Staff_ID", referencedColumnName="Staff_ID")
     */
    protected $staff;

    /**
     * @return boolean
     */
    public function getDefault()
    {
        return $this->default;
    }

    /**
     * @return string
     */
    public function getEmailAddress()
    {
        return $this->emailAddress;
    }

    /**
     * @return boolean
     */
    public function getGlobal()
    {
        return $this->global;
    }

    /**
     * @return int
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * @return string
     */
    public function getIncomingPassword()
    {
        return $this->incomingPassword;
    }

    /**
     * @return string
     */
    public function getIncomingPort()
    {
        return $this->incomingPort;
    }

    /**
     * @return boolean
     */
    public function getIncomingSSL()
    {
        return $this->incomingSSL;
    }

    /**
     * @return string
     */
    public function getIncomingServer()
    {
        return $this->incomingServer;
    }

    /**
     * @return string
     */
    public function getIncomingUsername()
    {
        return $this->incomingUsername;
    }

    /**
     * @return boolean
     */
    public function getLastModified()
    {
        return $this->lastModified;
    }

    /**
     * @return string
     */
    public function getName()
    {
        return $this->name;
    }

    /**
     * @return string
     */
    public function getSmtpPassword()
    {
        return $this->smtpPassword;
    }

    /**
     * @return string
     */
    public function getSmtpPort()
    {
        return $this->smtpPort;
    }

    /**
     * @return boolean
     */
    public function getSmtpSSL()
    {
        return $this->smtpSSL;
    }

    /**
     * @return string
     */
    public function getSmtpServer()
    {
        return $this->smtpServer;
    }

    /**
     * @return string
     */
    public function getSmtpUsername()
    {
        return $this->smtpUsername;
    }

    /**
     * @return \BusinessMan\Bundle\StaffBundle\Entity\Staff
     */
    public function getStaff()
    {
        return $this->staff;
    }

    /**
     * @param boolean $default
     */
    public function setDefault($default)
    {
        $this->default = $default;
    }

    /**
     * @param string $emailAddress
     */
    public function setEmailAddress($emailAddress)
    {
        $this->emailAddress = $emailAddress;
    }

    /**
     * @param boolean $global
     */
    public function setGlobal($global)
    {
        $this->global = $global;
    }

    /**
     * @param string $incomingPassword
     */
    public function setIncomingPassword($incomingPassword)
    {
        $this->incomingPassword = $incomingPassword;
    }

    /**
     * @param string $incomingPort
     */
    public function setIncomingPort($incomingPort)
    {
        $this->incomingPort = $incomingPort;
    }

    /**
     * @param boolean $incomingSSL
     */
    public function setIncomingSSL($incomingSSL)
    {
        $this->incomingSSL = $incomingSSL;
    }

    /**
     * @param string $incomingServer
     */
    public function setIncomingServer($incomingServer)
    {
        $this->incomingServer = $incomingServer;
    }

    /**
     * @param string $incomingUsername
     */
    public function setIncomingUsername($incomingUsername)
    {
        $this->incomingUsername = $incomingUsername;
    }

    /**
     * @param string $name
     */
    public function setName($name)
    {
        $this->name = $name;
    }

    /**
     * @param string $smtpPassword
     */
    public function setSmtpPassword($smtpPassword)
    {
        $this->smtpPassword = $smtpPassword;
    }

    /**
     * @param string $smtpPort
     */
    public function setSmtpPort($smtpPort)
    {
        $this->smtpPort = $smtpPort;
    }

    /**
     * @param boolean $smtpSSL
     */
    public function setSmtpSSL($smtpSSL)
    {
        $this->smtpSSL = $smtpSSL;
    }

    /**
     * @param string $smtpServer
     */
    public function setSmtpServer($smtpServer)
    {
        $this->smtpServer = $smtpServer;
    }

    /**
     * @param string $smtpUsername
     */
    public function setSmtpUsername($smtpUsername)
    {
        $this->smtpUsername = $smtpUsername;
    }

    /**
     * @param \BusinessMan\Bundle\StaffBundle\Entity\Staff $staff
     */
    public function setStaff($staff)
    {
        $this->staff = $staff;
    }
}
