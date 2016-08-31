<?php
namespace Mirsa\Bundle\MirsaBundle\Entity;

use Doctrine\ORM\Mapping as ORM,
    JMS\Serializer\Annotation as Serializer;

/**
 * EmailAccount
 *
 * @ORM\Table(name="ApiData_EmailAccounts")
 * @ORM\Entity()
 *
 * @Serializer\XmlRoot("emailaccount")
 * @Serializer\ExclusionPolicy("all")
 */
class EmailAccount
{
    /**
     * @ORM\Column(name="Account_ID", type="integer")
     * @ORM\Id
     * @Serializer\Expose
     * @Serializer\XmlAttribute
     */
    protected $id;

    /**
     * @ORM\ManyToOne(targetEntity="Staff", inversedBy="emailAccounts")
     * @ORM\JoinColumn(name="Staff_ID", referencedColumnName="Staff_ID")
     */
    protected $staff;

    /**
     * @ORM\Column(name="Email_Address", type="string")
     */
    protected $emailAddress;

    /**
     * @ORM\Column(name="Default_Account", type="string")
     */
    protected $default;

    /**
     * @ORM\Column(name="Account_Name", type="string")
     */
    protected $name;

    /**
     * @ORM\Column(name="POP_Server", type="string")
     */
    protected $incomingServer;

    /**
     * @ORM\Column(name="POP_Port", type="string")
     */
    protected $incomingPort;

    /**
     * @ORM\Column(name="POP_SSL", type="string")
     */
    protected $incomingSSL;

    /**
     * @ORM\Column(name="POP_User_Name", type="string")
     */
    protected $incomingUsername;

    /**
     * @ORM\Column(name="POP_Password", type="string")
     */
    protected $incomingPassword;

    /**
     * @ORM\Column(name="SMTP_Server", type="string")
     */
    protected $smtpServer;

    /**
     * @ORM\Column(name="SMTP_Port", type="string")
     */
    protected $smtpPort;

    /**
     * @ORM\Column(name="SMTP_SSL", type="string")
     */
    protected $smtpSSL;

    /**
     * @ORM\Column(name="SMTP_User_Name", type="string")
     */
    protected $smtpUsername;

    /**
     * @ORM\Column(name="SMTP_Password", type="string")
     */
    protected $smtpPassword;

    /**
     * @ORM\Column(name="Global_Account", type="yesno")
     */
    protected $global;

    /**
     * getId
     *
     * @return string
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * getStaff
     *
     * @return string
     */
    public function getStaff()
    {
        return $this->staff;
    }

    /**
     * getEmailAddress
     *
     * @return string
     */
    public function getEmailAddress()
    {
        return $this->emailAddress;
    }

    /**
     * getDefault
     *
     * @return string
     */
    public function getDefault()
    {
        return $this->default;
    }

    /**
     * getName
     *
     * @return string
     */
    public function getName()
    {
        return $this->name;
    }

    /**
     * getIncomingServer
     *
     * @return string
     */
    public function getIncomingServer()
    {
        return $this->incomingServer;
    }

    /**
     * getIncomingPort
     *
     * @return string
     */
    public function getIncomingPort()
    {
        return $this->incomingPort;
    }

    /**
     * getIncomingSSL
     *
     * @return string
     */
    public function getIncomingSSL()
    {
        return $this->incomingSSL;
    }

    /**
     * getIncomingUsername
     *
     * @return string
     */
    public function getIncomingUsername()
    {
        return $this->incomingUsername;
    }

    /**
     * getIncomingPassword
     *
     * @return string
     */
    public function getIncomingPassword()
    {
        return $this->incomingPassword;
    }

    /**
     * getSmtpServer
     *
     * @return string
     */
    public function getSmtpServer()
    {
        return $this->smtpServer;
    }

    /**
     * getSmtpPort
     *
     * @return string
     */
    public function getSmtpPort()
    {
        return $this->smtpPort;
    }

    /**
     * getSmtpSSL
     *
     * @return string
     */
    public function getSmtpSSL()
    {
        return $this->smtpSSL;
    }

    /**
     * getSmtpUsername
     *
     * @return string
     */
    public function getSmtpUsername()
    {
        return $this->smtpUsername;
    }

    /**
     * getSmtpPassword
     *
     * @return string
     */
    public function getSmtpPassword()
    {
        return $this->smtpPassword;
    }

    public function isGlobal()
    {
        return $this->global;
    }

    public function setGlobal($global)
    {
        $this->global = $global;
        return $this;
    }
}
