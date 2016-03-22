<?php
namespace Mirsa\Bundle\MirsaBundle\Entity;

use Doctrine\ORM\Mapping as ORM,
    Symfony\Component\Validator\Constraints as Assert,
    JMS\Serializer\Annotation as Serializer,
    FSC\HateoasBundle\Annotation as RestHateoas,
    Symfony\Component\Security\Core\User\EquatableInterface,
    Symfony\Component\Security\Core\User\UserInterface,
    Symfony\Component\Security\Core\User\AdvancedUserInterface;

/**
 * User entity
 *
 * @author cps
 * @link   http://webserver:8090/display/BMAN/Portal+Documentation
 *
 * @ORM\Entity()
 * @ORM\Table(name="Web_Users")
 *
 * @Serializer\XmlRoot("user")
 * @Serializer\ExclusionPolicy("all")
 */
class User implements AdvancedUserInterface, EquatableInterface
{
    const TYPE_TOKEN = 0;
    const TYPE_STAFF = 1;
    const TYPE_CLIENT_CONTACT = 2;
    const TYPE_PROSPECT = 3;

    /**
     * @ORM\Id
     * @ORM\Column(name="User_ID", type="integer")
     * @Serializer\Expose
     * @Serializer\XmlAttribute
     */
    protected $id;

    /**
     * @ORM\Column(name="Web_Username", type="string")
     * @Assert\NotBlank()
     * @Serializer\Expose
     */
    protected $username;

    /**
     * @ORM\Column(name="Web_Password", type="string")
     * @Assert\NotBlank()
     */
    protected $password;

    /**
     * @ORM\Column(name="Lock_User", type="yesno")
     * @Serializer\Expose
     * @Serializer\Type("boolean")
     */
    protected $locked;

    /**
     * @ORM\Column(name="Dashboard_JSON", type="string")
     */
    protected $dashboardJSON;

    /**
     * @ORM\Column(name="Last_Login", type="timestamp")
     */
    protected $lastLogin;

    /**
     * @ORM\Column(name="Token", type="string")
     */
    protected $token;

    /**
     * @ORM\OneToOne(targetEntity="Staff")
     * @ORM\JoinColumn(name="Staff_ID", referencedColumnName="Staff_ID")
     */
    protected $staff;

    /**
     * @ORM\ManyToOne(targetEntity="Contact", inversedBy="users")
     * @ORM\JoinColumn(name="Client_Contact_ID", referencedColumnName="Record_ID")
     */
    protected $contact;

    /**
     * @ORM\ManyToOne(targetEntity="Prospect")
     * @ORM\JoinColumn(name="Prospect_ID", referencedColumnName="Account_No")
     */
    protected $prospect;

    /**
     * @ORM\OneToMany(targetEntity="Notification", mappedBy="user")
     */
    protected $notifications;

    /**
     * @ORM\OneToMany(targetEntity="JobCommentView", mappedBy="user")
     */
    protected $jobCommentViews;
    
    /**
     * @ORM\Column(name="Inventory_View", type="string")
     */
    protected $inventoryView;        

    public function getId()
    {
        return $this->id;
    }

    /**
     * Set username
     *
     * @param string $value
     *
     * @return null
     */
    public function setUsername($value)
    {
        $this->username = $value;
    }

    /**
     * Get username
     *
     * @return string
     */
    public function getUsername()
    {
        return $this->username;
    }

    /**
     * Set password
     *
     * @param string $value
     *
     * @return null
     */
    public function setPassword($value)
    {
        $this->password = $value;
    }

    /**
     * isLocked
     *
     * @return boolean
     */
    public function isLocked()
    {
        return $this->locked;
    }

    /**
     * setLocked
     *
     * @param boolean $value New value
     *
     * @return User $this
     */
    public function setLocked($value)
    {
        $this->locked = $value;
        return $this;
    }

    /**
     * Get password
     *
     * @return string
     */
    public function getPassword()
    {
        return $this->password;
    }

    /**
     * getDashboardJSON
     *
     * @return string
     */
    public function getDashboardJSON()
    {
        return $this->dashboardJSON;
    }

    /**
     * setDashboardJSON
     *
     * @param string $dashboardJSON New value
     *
     * @return User $this
     */
    public function setDashboardJSON($dashboardJSON)
    {
        $this->dashboardJSON = $dashboardJSON;
        return $this;
    }

    public function getLastLogin()
    {
        return $this->lastLogin;
    }

    public function setLastLogin($lastLogin)
    {
        $this->lastLogin = $lastLogin;
        return $this;
    }

    public function getToken()
    {
        return $this->token;
    }

    public function setToken($token)
    {
        $this->token = $token;
        return $this;
    }

    public function getPicture()
    {
        return $this->picture;
    }

    public function setStaff(Staff $staff)
    {
        $this->staff = $staff;
    }

    public function getStaff()
    {
        return $this->staff;
    }

    public function getContact()
    {
        return $this->contact;
    }

    public function setContact($contact)
    {
        $this->contact = $contact;
        return $this;
    }

    public function getProspect()
    {
        return $this->prospect;
    }

    public function setProspect($prospect)
    {
        $this->prospect = $prospect;
        return $this;
    }

    public function getJobCommentViews()
    {
        return $this->jobCommentViews;
    }

    public function getNotifications()
    {
        return $this->notifications;
    }

    public function getType()
    {
        if ($this->getStaff()) {
            return self::TYPE_STAFF;
        } else if ($this->getContact()) {
            return self::TYPE_CLIENT_CONTACT;
        } else if ($this->getProspect()) {
            return self::TYPE_PROSPECT;
        }

        throw new \Exception('Unknown user type');
    }

    public function getImage()
    {
        if ($this->getType() == self::TYPE_STAFF) {
            return $this->getStaff()->getPhoto();
        }

        return null;
    }

    public function getRoles()
    {
        $roles = array('ROLE_USER');

        if ($this->getType() == self::TYPE_STAFF) {
            $roles[] = 'ROLE_STAFF';
        }

        if ($this->getType() == self::TYPE_CLIENT_CONTACT) {
            $roles[] = 'ROLE_CLIENT_CONTACT';
        }

        if ($this->getType() == self::TYPE_PROSPECT) {
            $roles[] = 'ROLE_PROSPECT';
        }

        return $roles;
    }

    public function isStaff()
    {
        return $this->getType() === self::TYPE_STAFF;
    }

    public function isClientContact()
    {
        return $this->getType() === self::TYPE_CLIENT_CONTACT;
    }

    public function isProspect()
    {
        return $this->getType() === self::TYPE_PROSPECTs;
    }

    public function getSalt()
    {
        return '';
    }

    public function isAccountNonExpired()
    {
        return true;
    }

    public function isAccountNonLocked()
    {
        return !$this->locked;
    }

    public function isCredentialsNonExpired()
    {
        return true;
    }

    public function isEnabled()
    {
        return true;
    }

    public function eraseCredentials()
    {
    }

    public function isEqualTo(UserInterface $user)
    {
        if (!$user instanceof User) {
            return false;
        }

        if ($this->username !== $user->getUsername()) {
            return false;
        }

        return true;
    }
    
    public function getInventoryView()
    {
        return $this->inventoryView;
    }    
    
    public function setInventoryView($value)
    {
        $this->inventoryView = $value;
        return $this;
    }    
}
