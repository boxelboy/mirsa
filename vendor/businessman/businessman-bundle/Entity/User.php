<?php
namespace BusinessMan\Bundle\BusinessManBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use JMS\Serializer\Annotation as Serializer;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Security\Core\User\EquatableInterface;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Security\Core\User\AdvancedUserInterface;

/**
 * User entity
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/businessmanportal/BusinessManBundle
 *
 * @ORM\Entity()
 * @ORM\Table(name="Web_Users")
 */
class User implements AdvancedUserInterface, EquatableInterface
{
    /**
     * @var int
     *
     * @ORM\Id
     * @ORM\Column(name="User_ID", type="integer")
     * @ORM\GeneratedValue(strategy="CUSTOM")
     * @ORM\CustomIdGenerator(class="Synergize\Bundle\DbalBundle\Driver\IdentityGenerator")
     */
    protected $id;

    /**
     * @var string
     *
     * @ORM\Column(name="Web_Username", type="string")
     *
     * @Assert\NotBlank()
     */
    protected $username;

    /**
     * @var string
     *
     * @ORM\Column(name="Web_Password", type="string")
     *
     * @Assert\NotBlank()
     */
    protected $password;

    /**
     * @var boolean
     *
     * @ORM\Column(name="Lock_User", type="yesno")
     */
    protected $locked;

    /**
     * @var string
     *
     * @ORM\Column(name="Dashboard_JSON", type="string")
     */
    protected $dashboardJSON;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="Last_Login", type="datetime")
     */
    protected $lastLogin;

    /**
     * @var string
     *
     * @ORM\Column(name="Token", type="string")
     */
    protected $token;

    /**
     * @var \BusinessMan\Bundle\StaffBundle\Entity\Staff
     *
     * @ORM\OneToOne(targetEntity="BusinessMan\Bundle\StaffBundle\Entity\Staff")
     * @ORM\JoinColumn(name="Staff_ID", referencedColumnName="Staff_ID")
     */
    protected $staff;

    /**
     * @var \BusinessMan\Bundle\ClientBundle\Entity\ClientContact
     *
     * @ORM\ManyToOne(targetEntity="BusinessMan\Bundle\ClientBundle\Entity\ClientContact", inversedBy="users")
     * @ORM\JoinColumn(name="Client_Contact_ID", referencedColumnName="Record_ID")
     */
    protected $clientContact;

    /**
     * @var \BusinessMan\Bundle\SupplierBundle\Entity\Supplier
     *
     * @ORM\ManyToOne(targetEntity="BusinessMan\Bundle\SupplierBundle\Entity\Supplier")
     * @ORM\JoinColumn(name="Supplier_ID", referencedColumnName="Supplier_ID")
     */
    protected $supplier;

    /**
     * @return \BusinessMan\Bundle\ClientBundle\Entity\ClientContact
     */
    public function getClientContact()
    {
        return $this->clientContact;
    }

    /**
     * @return string
     */
    public function getDashboardJSON()
    {
        return $this->dashboardJSON;
    }

    /**
     * @return int
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * @return \DateTime
     */
    public function getLastLogin()
    {
        return $this->lastLogin;
    }

    /**
     * @return boolean
     */
    public function getLocked()
    {
        return $this->locked;
    }

    /**
     * @return string
     */
    public function getPassword()
    {
        return $this->password;
    }

    /**
     * @return \BusinessMan\Bundle\StaffBundle\Entity\Staff
     */
    public function getStaff()
    {
        return $this->staff;
    }

    /**
     * @return \BusinessMan\Bundle\SupplierBundle\Entity\Supplier
     */
    public function getSupplier()
    {
        return $this->supplier;
    }

    /**
     * @return string
     */
    public function getToken()
    {
        return $this->token;
    }

    /**
     * @return string
     */
    public function getUsername()
    {
        return $this->username;
    }

    /**
     * @param string $dashboardJSON
     */
    public function setDashboardJSON($dashboardJSON)
    {
        $this->dashboardJSON = $dashboardJSON;
    }

    /**
     * @param \BusinessMan\Bundle\ClientBundle\Entity\ClientContact $clientContact
     */
    public function setClientContact($clientContact)
    {
        $this->clientContact = $clientContact;
    }

    /**
     * @param \DateTime $lastLogin
     */
    public function setLastLogin($lastLogin)
    {
        $this->lastLogin = $lastLogin;
    }

    /**
     * @param boolean $locked
     */
    public function setLocked($locked)
    {
        $this->locked = $locked;
    }

    /**
     * @param string $password
     */
    public function setPassword($password)
    {
        $this->password = $password;
    }

    /**
     * @param \BusinessMan\Bundle\StaffBundle\Entity\Staff $staff
     */
    public function setStaff($staff)
    {
        $this->staff = $staff;
    }

    /**
     * @param \BusinessMan\Bundle\SupplierBundle\Entity\Supplier $supplier
     */
    public function setSupplier($supplier)
    {
        $this->supplier = $supplier;
    }

    /**
     * @param string $token
     */
    public function setToken($token)
    {
        $this->token = $token;
    }

    /**
     * @param string $username
     */
    public function setUsername($username)
    {
        $this->username = $username;
    }

    /**
     * {@inheritDoc}
     */
    public function getRoles()
    {
        $roles = array('ROLE_USER');

        if ($this->getStaff()) {
            $roles[] = 'ROLE_STAFF';

            if ($this->getStaff()->getManagedStaff()->count()) {
                $roles[] = 'ROLE_STAFF_MANAGER';
            }
        }

        if ($this->getClientContact()) {
            $roles[] = 'ROLE_CLIENT_CONTACT';
        }

        if ($this->getSupplier()) {
            $roles[] = 'ROLE_SUPPLIER';
        }

        return $roles;
    }

    /**
     * {@inheritDoc}
     */
    public function getSalt()
    {
        return '';
    }

    /**
     * {@inheritDoc}
     */
    public function isAccountNonExpired()
    {
        return true;
    }

    /**
     * {@inheritDoc}
     */
    public function isAccountNonLocked()
    {
        return !$this->locked;
    }

    /**
     * {@inheritDoc}
     */
    public function isCredentialsNonExpired()
    {
        return true;
    }

    /**
     * {@inheritDoc}
     */
    public function isEnabled()
    {
        return true;
    }

    /**
     * {@inheritDoc}
     */
    public function eraseCredentials()
    {
    }

    /**
     * {@inheritDoc}
     */
    public function isEqualTo(UserInterface $user)
    {
        if (!$user instanceof User) {
            return false;
        }

        return $this->getId() === $user->getId();
    }
}
