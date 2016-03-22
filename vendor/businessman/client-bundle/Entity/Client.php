<?php
namespace BusinessMan\Bundle\ClientBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use JMS\Serializer\Annotation as Serializer;
use Doctrine\Common\Collections\ArrayCollection;

/**
 * Client
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/businessmanportal/ClientBundle
 *
 * @ORM\Entity()
 * @ORM\Table(name="Clients")
 *
 * @Serializer\ExclusionPolicy("all")
 * @Serializer\XmlRoot("client")
 */
class Client
{
    /**
     * @var string
     *
     * @ORM\Column(name="Account_No", type="string")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="CUSTOM")
     * @ORM\CustomIdGenerator(class="Synergize\Bundle\DbalBundle\Driver\IdentityGenerator")
     *
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $id;

    /**
     * @var string
     *
     * @ORM\Column(name="Company_Name", type="string")
     *
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $name;

    /**
     * @var string
     *
     * @ORM\Column(name="Account_Status", type="string")
     *
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $status;

    /**
     * @var string
     *
     * @ORM\Column(name="Notes", type="notes")
     */
    protected $notes;

    /**
     * @var string
     *
     * @ORM\Column(name="Client_Individual_or_Company", type="string")
     *
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $classification;

    /**
     * @var string
     *
     * @ORM\Column(name="Company_Type", type="string")
     */
    protected $type;

    /**
     * @var string
     *
     * @ORM\Column(name="Phone", type="string")
     */
    protected $phone;

    /**
     * @var string
     *
     * @ORM\Column(name="Phone_Skype", type="string")
     */
    protected $skype;

    /**
     * @var string
     *
     * @ORM\Column(name="Email", type="string")
     */
    protected $email;

    /**
     * @var string
     *
     * @ORM\Column(name="Address_Main_Name", type="string")
     */
    protected $mainAddressName;

    /**
     * @var string
     *
     * @ORM\Column(name="Address_Main_Street", type="string")
     */
    protected $mainAddressStreet;

    /**
     * @var string
     *
     * @ORM\Column(name="Address_Main_Post_Town", type="string")
     */
    protected $mainAddressTown;

    /**
     * @var string
     *
     * @ORM\Column(name="Address_Main_County", type="string")
     */
    protected $mainAddressCounty;

    /**
     * @var string
     *
     * @ORM\Column(name="Address_Main_State", type="string")
     */
    protected $mainAddressState;

    /**
     * @var string
     *
     * @ORM\Column(name="Address_Main_Post_Code", type="string")
     */
    protected $mainAddressPostcode;

    /**
     * @var string
     *
     * @ORM\Column(name="Address_Main_Country", type="string")
     */
    protected $mainAddressCountry;

    /**
     * @var string
     *
     * @ORM\Column(name="IA_Street_Address", type="string")
     */
    protected $invoiceAddressStreet;

    /**
     * @var string
     *
     * @ORM\Column(name="IA_City", type="string")
     */
    protected $invoiceAddressTown;

    /**
     * @var string
     *
     * @ORM\Column(name="IA_County", type="string")
     */
    protected $invoiceAddressCounty;

    /**
     * @var string
     *
     * @ORM\Column(name="IA_State", type="string")
     */
    protected $invoiceAddressState;

    /**
     * @var string
     *
     * @ORM\Column(name="IA_Post_Code", type="string")
     */
    protected $invoiceAddressPostcode;

    /**
     * @var string
     *
     * @ORM\Column(name="IA_Country", type="string")
     */
    protected $invoiceAddressCountry;

    /**
     * @var string
     *
     * @ORM\Column(name="WebSite", type="string")
     */
    protected $website;

    /**
     * @ORM\Column(name="Mod_Timestamp", type="timestamp")
     */
    protected $lastModified;

    /**
     * @var ClientContact
     *
     * @ORM\ManyToOne(targetEntity="ClientContact")
     * @ORM\JoinColumn(name="Default_Client_Contact_ID", referencedColumnName="Record_ID")
     */
    protected $defaultContact;

    /**
     * @var \BusinessMan\Bundle\StaffBundle\Entity\Staff
     *
     * @ORM\ManyToOne(targetEntity="BusinessMan\Bundle\StaffBundle\Entity\Staff")
     * @ORM\JoinColumn(name="Account_Manager_ID", referencedColumnName="Staff_ID")
     */
    protected $manager;

    /**
     * @var ArrayCollection|ClientContact
     *
     * @ORM\OneToMany(targetEntity="ClientContact", mappedBy="client", cascade={"remove"})
     * @ORM\OrderBy({"surname" = "ASC", "forename" = "ASC"})
     */
    protected $contacts;

    public function __construct()
    {
        $this->contacts = new ArrayCollection();
    }

    /**
     * @return string
     */
    public function getClassification()
    {
        return $this->classification;
    }

    /**
     * @return \BusinessMan\Bundle\ClientBundle\Entity\ClientContact|\Doctrine\Common\Collections\ArrayCollection
     */
    public function getContacts()
    {
        return $this->contacts;
    }

    /**
     * @return \BusinessMan\Bundle\ClientBundle\Entity\ClientContact
     */
    public function getDefaultContact()
    {
        return $this->defaultContact;
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
    public function getId()
    {
        return $this->id;
    }

    /**
     * @return mixed
     */
    public function getLastModified()
    {
        return $this->lastModified;
    }

    /**
     * @return string
     */
    public function getMainAddressCountry()
    {
        return $this->mainAddressCountry;
    }

    /**
     * @return string
     */
    public function getMainAddressCounty()
    {
        return $this->mainAddressCounty;
    }

    /**
     * @return string
     */
    public function getMainAddressName()
    {
        return $this->mainAddressName;
    }

    /**
     * @return string
     */
    public function getMainAddressPostcode()
    {
        return $this->mainAddressPostcode;
    }

    /**
     * @return string
     */
    public function getMainAddressState()
    {
        return $this->mainAddressState;
    }

    /**
     * @return string
     */
    public function getMainAddressStreet()
    {
        return $this->mainAddressStreet;
    }

    /**
     * @return string
     */
    public function getMainAddressTown()
    {
        return $this->mainAddressTown;
    }

    /**
     * @return string
     */
    public function getInvoiceAddressCountry()
    {
        return $this->invoiceAddressCountry;
    }

    /**
     * @return string
     */
    public function getInvoiceAddressCounty()
    {
        return $this->invoiceAddressCounty;
    }

    /**
     * @return string
     */
    public function getInvoiceAddressPostcode()
    {
        return $this->invoiceAddressPostcode;
    }

    /**
     * @return string
     */
    public function getInvoiceAddressState()
    {
        return $this->invoiceAddressState;
    }

    /**
     * @return string
     */
    public function getInvoiceAddressStreet()
    {
        return $this->invoiceAddressStreet;
    }

    /**
     * @return string
     */
    public function getInvoiceAddressTown()
    {
        return $this->invoiceAddressTown;
    }

    /**
     * @return \BusinessMan\Bundle\StaffBundle\Entity\Staff
     */
    public function getManager()
    {
        return $this->manager;
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
    public function getNotes()
    {
        return $this->notes;
    }

    /**
     * @return string
     */
    public function getPhone()
    {
        return $this->phone;
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
    public function getStatus()
    {
        return $this->status;
    }

    /**
     * @return string
     */
    public function getType()
    {
        return $this->type;
    }

    /**
     * @return string
     */
    public function getWebsite()
    {
        return $this->website;
    }

    /**
     * @param string $classification
     */
    public function setClassification($classification)
    {
        $this->classification = $classification;
    }

    /**
     * @param string $email
     */
    public function setEmail($email)
    {
        $this->email = $email;
    }

    /**
     * @param string $mainAddressCountry
     */
    public function setMainAddressCountry($mainAddressCountry)
    {
        $this->mainAddressCountry = $mainAddressCountry;
    }

    /**
     * @param string $mainAddressCounty
     */
    public function setMainAddressCounty($mainAddressCounty)
    {
        $this->mainAddressCounty = $mainAddressCounty;
    }

    /**
     * @param string $mainAddressName
     */
    public function setMainAddressName($mainAddressName)
    {
        $this->mainAddressName = $mainAddressName;
    }

    /**
     * @param string $mainAddressPostcode
     */
    public function setMainAddressPostcode($mainAddressPostcode)
    {
        $this->mainAddressPostcode = $mainAddressPostcode;
    }

    /**
     * @param string $mainAddressState
     */
    public function setMainAddressState($mainAddressState)
    {
        $this->mainAddressState = $mainAddressState;
    }

    /**
     * @param string $mainAddressStreet
     */
    public function setMainAddressStreet($mainAddressStreet)
    {
        $this->mainAddressStreet = $mainAddressStreet;
    }

    /**
     * @param string $mainAddressTown
     */
    public function setMainAddressTown($mainAddressTown)
    {
        $this->mainAddressTown = $mainAddressTown;
    }

    /**
     * @param \BusinessMan\Bundle\StaffBundle\Entity\Staff $manager
     */
    public function setManager($manager)
    {
        $this->manager = $manager;
    }

    /**
     * @param string $name
     */
    public function setName($name)
    {
        $this->name = $name;
    }

    /**
     * @param string $phone
     */
    public function setPhone($phone)
    {
        $this->phone = $phone;
    }

    /**
     * @param string $skype
     */
    public function setSkype($skype)
    {
        $this->skype = $skype;
    }

    /**
     * @param string $status
     */
    public function setStatus($status)
    {
        $this->status = $status;
    }

    /**
     * @param string $type
     */
    public function setType($type)
    {
        $this->type = $type;
    }

    /**
     * @param string $website
     */
    public function setWebsite($website)
    {
        $this->website = $website;
    }

    /**
     * @param \BusinessMan\Bundle\ClientBundle\Entity\ClientContact $defaultContact
     */
    public function setDefaultContact($defaultContact)
    {
        $this->defaultContact = $defaultContact;
    }
}
