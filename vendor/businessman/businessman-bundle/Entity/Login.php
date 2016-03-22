<?php
namespace BusinessMan\Bundle\BusinessManBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * Login
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/businessmanportal/BusinessManBundle
 *
 * @ORM\Table(name="Web_Logins")
 * @ORM\Entity()
 */
class Login
{
    /**
     * @var string
     *
     * @ORM\Column(name="_internal_Record_ID", type="string")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="CUSTOM")
     * @ORM\CustomIdGenerator(class="Synergize\Bundle\DbalBundle\Driver\IdentityGenerator")
     */
    protected $id;

    /**
     * @var string
     *
     * @ORM\Column(name="Logged_In_Browser", type="string")
     */
    protected $browser;

    /**
     * @var string
     *
     * @ORM\Column(name="Logged_In_IP", type="string")
     */
    protected $ipAddress;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="Logged_In_TS", type="timestamp")
     */
    protected $loginDate;

    /**
     * @var User
     *
     * @ORM\ManyToOne(targetEntity="User")
     * @ORM\JoinColumn(name="User_ID", referencedColumnName="User_ID")
     */
    protected $user;

    /**
     * @return string
     */
    public function getBrowser()
    {
        return $this->browser;
    }

    /**
     * @return string
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * @return string
     */
    public function getIpAddress()
    {
        return $this->ipAddress;
    }

    /**
     * @return \DateTime
     */
    public function getLoginDate()
    {
        return $this->loginDate;
    }

    /**
     * @return \BusinessMan\Bundle\BusinessManBundle\Entity\User
     */
    public function getUser()
    {
        return $this->user;
    }

    /**
     * @param string $browser
     */
    public function setBrowser($browser)
    {
        $this->browser = $browser;
    }

    /**
     * @param string $id
     */
    public function setId($id)
    {
        $this->id = $id;
    }

    /**
     * @param string $ipAddress
     */
    public function setIpAddress($ipAddress)
    {
        $this->ipAddress = $ipAddress;
    }

    /**
     * @param \DateTime $loginDate
     */
    public function setLoginDate($loginDate)
    {
        $this->loginDate = $loginDate;
    }

    /**
     * @param \BusinessMan\Bundle\BusinessManBundle\Entity\User $user
     */
    public function setUser($user)
    {
        $this->user = $user;
    }
}
