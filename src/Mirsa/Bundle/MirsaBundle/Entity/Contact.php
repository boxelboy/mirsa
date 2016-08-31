<?php

namespace Mirsa\Bundle\MirsaBundle\Entity;

use Doctrine\ORM\Mapping as ORM,
    JMS\Serializer\Annotation as Serializer;

/**
 * Contact
 *
 * @ORM\Table(name="Client_Contacts")
 * @ORM\Entity()
 *
 * @Serializer\XmlRoot("contact")
 * @Serializer\ExclusionPolicy("all")
 *
 */
class Contact
{
    /**
     * @ORM\Column(name="Record_ID", type="string")
     * @ORM\Id
     * @Serializer\Expose
     * @Serializer\XmlAttribute
     */
    protected $id;

    /**
     * @ORM\Column(name="Photo", type="container")
     */
    protected $photo;

    /**
     * @ORM\Column(name="Email", type="string")
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $email;

    /**
     * @ORM\Column(name="Name_First", type="string")
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $forename;

    /**
     * @ORM\Column(name="Name_Last", type="string")
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $surname;

    /**
     * @ORM\Column(name="Telephone", type="string")
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $telephone;

    /**
     * @ORM\Column(name="`Telephone Ext`", type="string")
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $extension;

    /**
     * @ORM\Column(name="`Telephone Fax`", type="string")
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $fax;

    /**
     * @ORM\Column(name="`Telephone Mobile`", type="string")
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $mobile;

    /**
     * @ORM\Column(name="`Telephone Other`", type="string")
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $other;

    /**
     * @ORM\Column(name="Telephone_Skype", type="string")
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $skype;

    /**
     * @var Client
     * 
     * @ORM\ManyToOne(targetEntity="Client", inversedBy="contacts")
     * @ORM\JoinColumn(name="Account_Number", referencedColumnName="Account_No")
     */
    protected $client;

    /**
     * @ORM\OneToMany(targetEntity="User", mappedBy="contact")
     */
    protected $users;
    
    /**
     * @var \DateTime
     *
     * @ORM\Column(name="Mod_Timestamp", type="timestamp")
     *
     * @Serializer\Expose
     * @Serializer\Type("DateTime<'Y-m-d H:i:s'>")
     */
    protected $lastModified;    


    /**
     * @return string
     */
    public function getDisplayName()
    {
        $displayName = '';

        if ($this->getSurname()) {
            $displayName .= $this->getSurname();

            if ($this->getForename()) {
                $displayName .= ', ';
            }
        }

        if ($this->getForename()) {
            $displayName .= $this->getForename();
        }

        if (!$displayName) {
            $displayName = 'Unknown contact';
        }

        return $displayName;
    }    
    
    /**
     * Get id
     *
     * @return integer
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * Set photo
     *
     * @param string $photo
     * @return Contact
     */
    public function setPhoto($photo)
    {
        $this->photo = $photo;

        return $this;
    }

    /**
     * Get photo
     *
     * @return string
     */
    public function getPhoto()
    {
        return $this->photo;
    }

    /**
     * Set email
     *
     * @param string $email
     * @return Contact
     */
    public function setEmail($email)
    {
        $this->email = $email;

        return $this;
    }

    /**
     * Get email
     *
     * @return string
     */
    public function getEmail()
    {
        return $this->email;
    }

    /**
     * Set forename
     *
     * @param string $forename
     * @return Contact
     */
    public function setForename($forename)
    {
        $this->forename = $forename;

        return $this;
    }

    /**
     * Get forename
     *
     * @return string
     */
    public function getForename()
    {
        return $this->forename;
    }

    /**
     * Set surname
     *
     * @param string $surname
     * @return Contact
     */
    public function setSurname($surname)
    {
        $this->surname = $surname;

        return $this;
    }

    /**
     * Get surname
     *
     * @return string
     */
    public function getSurname()
    {
        return $this->surname;
    }

    /**
     * Set telephone
     *
     * @param string $telephone
     * @return Contact
     */
    public function setTelephone($telephone)
    {
        $this->telephone = $telephone;

        return $this;
    }

    /**
     * Get telephone
     *
     * @return string
     */
    public function getTelephone()
    {
        return $this->telephone;
    }

    /**
     * Set extension
     *
     * @param string $extension
     * @return Contact
     */
    public function setExtension($extension)
    {
        $this->extension = $extension;

        return $this;
    }

    /**
     * Get extension
     *
     * @return string
     */
    public function getExtension()
    {
        return $this->extension;
    }

    /**
     * Set fax
     *
     * @param string $fax
     * @return Contact
     */
    public function setFax($fax)
    {
        $this->fax = $fax;

        return $this;
    }

    /**
     * Get fax
     *
     * @return string
     */
    public function getFax()
    {
        return $this->fax;
    }

    /**
     * Set mobile
     *
     * @param string $mobile
     * @return Contact
     */
    public function setMobile($mobile)
    {
        $this->mobile = $mobile;

        return $this;
    }

    /**
     * Get mobile
     *
     * @return string
     */
    public function getMobile()
    {
        return $this->mobile;
    }

    /**
     * Set other
     *
     * @param string $other
     * @return Contact
     */
    public function setOther($other)
    {
        $this->other = $other;

        return $this;
    }

    /**
     * Get other
     *
     * @return string
     */
    public function getOther()
    {
        return $this->other;
    }

    /**
     * Set skype
     *
     * @param string $skype
     * @return Contact
     */
    public function setSkype($skype)
    {
        $this->skype = $skype;

        return $this;
    }

    /**
     * Get skype
     *
     * @return string
     */
    public function getSkype()
    {
        return $this->skype;
    }

    public function getClient()
    {
        return $this->client;
    }

    public function getUsers()
    {
        return $this->users;
    }

    public function getUser()
    {
        $users = $this->getUsers();

        if (count($users) > 0) {
            return $users->last();
        }

        return null;
    }
    
    function getLastModified() {
        return $this->lastModified;
    }

    function setLastModified(\DateTime $lastModified) {
        $this->lastModified = $lastModified;
    }

}
