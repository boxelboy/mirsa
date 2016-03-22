<?php
namespace BusinessMan\Bundle\ClientBundle\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use JMS\Serializer\Annotation as Serializer;

/**
 * ClientContact
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/businessmanportal/ClientBundle
 *
 * @ORM\Entity()
 * @ORM\Table(name="Client_Contacts")
 *
 * @Serializer\ExclusionPolicy("all")
 * @Serializer\XmlRoot("client")
 */
class ClientContact
{
    /**
     * @var string
     *
     * @ORM\Column(name="Record_ID", type="string")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="CUSTOM")
     * @ORM\CustomIdGenerator(class="Synergize\Bundle\DbalBundle\Driver\IdentityGenerator")
     *
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $id;

    /**
     * @var \Synergize\Bundle\DbalBundle\Type\ContainerField
     *
     * @ORM\Column(name="Photo", type="container")
     */
    protected $photo;

    /**
     * @var string
     *
     * @ORM\Column(name="Email", type="string")
     *
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $email;

    /**
     * @var string
     *
     * @ORM\Column(name="Name_First", type="string")
     *
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $forename;

    /**
     * @var string
     *
     * @ORM\Column(name="Name_Last", type="string")
     *
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $surname;

    /**
     * @var string
     *
     * @ORM\Column(name="Telephone", type="string")
     *
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $telephone;

    /**
     * @var string
     *
     * @ORM\Column(name="`Telephone Ext`", type="string")
     */
    protected $extension;

    /**
     * @var string
     *
     * @ORM\Column(name="`Telephone Fax`", type="string")
     */
    protected $fax;

    /**
     * @var string
     *
     * @ORM\Column(name="Telephone_Mobile", type="string")
     *
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $mobile;

    /**
     * @var string
     *
     * @ORM\Column(name="`Telephone Other`", type="string")
     */
    protected $other;

    /**
     * @var string
     *
     * @ORM\Column(name="Telephone_Skype", type="string")
     */
    protected $skype;

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
     * @var Client
     *
     * @ORM\ManyToOne(targetEntity="Client", inversedBy="contacts")
     * @ORM\JoinColumn(name="Account_Number", referencedColumnName="Account_No")
     */
    protected $client;

    /**
     * @var ArrayCollection|\BusinessMan\Bundle\BusinessManBundle\Entity\User
     *
     * @ORM\OneToMany(targetEntity="BusinessMan\Bundle\BusinessManBundle\Entity\User", mappedBy="clientContact", cascade={"remove"})
     */
    protected $users;

    public function __construct()
    {
        $this->users = new ArrayCollection();
    }

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
     * @return \BusinessMan\Bundle\ClientBundle\Entity\Client
     */
    public function getClient()
    {
        return $this->client;
    }

    /**
     * @return string
     */
    public function getEmail()
    {
        return $this->email;
    }

    /**
     * @return string
     */
    public function getExtension()
    {
        return $this->extension;
    }

    /**
     * @return string
     */
    public function getFax()
    {
        return $this->fax;
    }

    /**
     * @return string
     */
    public function getForename()
    {
        return $this->forename;
    }

    /**
     * @return string
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * @return \DateTime
     */
    public function getLastModified()
    {
        return $this->lastModified;
    }

    /**
     * @return string
     */
    public function getMobile()
    {
        return $this->mobile;
    }

    /**
     * @return string
     */
    public function getOther()
    {
        return $this->other;
    }

    /**
     * @return \Synergize\Bundle\DbalBundle\Type\ContainerField
     */
    public function getPhoto()
    {
        return $this->photo;
    }

    /**
     * @return string
     */
    public function getSkype()
    {
        return $this->skype;
    }

    /**
     * @return string
     */
    public function getSurname()
    {
        return $this->surname;
    }

    /**
     * @return string
     */
    public function getTelephone()
    {
        return $this->telephone;
    }

    /**
     * @return \BusinessMan\Bundle\BusinessManBundle\Entity\User|\Doctrine\Common\Collections\ArrayCollection
     */
    public function getUsers()
    {
        return $this->users;
    }
}
