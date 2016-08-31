<?php

namespace Mirsa\Bundle\MirsaBundle\Entity;

use Doctrine\ORM\Mapping as ORM,
    JMS\Serializer\Annotation as Serializer;

/**
 * Client
 *
 * @ORM\Table(name="Clients")
 * @ORM\Entity()
 *
 * @Serializer\XmlRoot("client")
 * @Serializer\ExclusionPolicy("all")
 *
 */
class Client
{
    /**
     * Client ID
     *
     * @ORM\Column(name="Account_No", type="string")
     * @ORM\Id
     * @Serializer\Expose
     * @Serializer\XmlAttribute
     */
    protected $id;

    /**
     * Name of the client
     *
     * @ORM\Column(name="Company_Name", type="string")
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $name;

    /**
     * Individual or company
     *
     * @ORM\Column(name="`Client Individual_or_Company`", type="string")
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $classification;

    /**
     * Type of company
     *
     * @ORM\Column(name="Company_Type", type="string")
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $type;

    /**
     * Primary phone number
     *
     * @ORM\Column(name="Phone", type="string")
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $phone;

    /**
     * Skype username
     *
     * @ORM\Column(name="Phone_Skype", type="string")
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $skype;

    /**
     * Primary email address
     *
     * @ORM\Column(name="Email", type="string")
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $email;

    /**
     * Primary address: Name
     *
     * @ORM\Column(name="Address_Main_Name", type="string")
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $mainAddressName;

    /**
     * Primary address: Street
     *
     * @ORM\Column(name="Address_Main_Street", type="string")
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $mainAddressStreet;

    /**
     * Primary address: Town
     *
     * @ORM\Column(name="Address_Main_Post_Town", type="string")
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $mainAddressTown;

    /**
     * Primary address: County
     *
     * @ORM\Column(name="Address_Main_County", type="string")
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $mainAddressCounty;

    /**
     * Primary address: State
     *
     * @ORM\Column(name="Address_Main_State", type="string")
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $mainAddressState;

    /**
     * Primary address: Postcode
     *
     * @ORM\Column(name="Address_Main_Post_Code", type="string")
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $mainAddressPostcode;

    /**
     * Primary address: Country
     *
     * @ORM\Column(name="Address_Main_Country", type="string")
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $mainAddressCountry;

    /**
     * Website URL
     *
     * @ORM\Column(name="WebSite", type="string")
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $website;

    /**
     * @ORM\ManyToOne(targetEntity="Contact")
     * @ORM\JoinColumn(name="Default_Client_Contact_ID", referencedColumnName="Record_ID")
     */
    protected $defaultContact;

    /**
     * @ORM\ManyToOne(targetEntity="Staff")
     * @ORM\JoinColumn(name="Account_Manager_ID", referencedColumnName="Staff_ID")
     */
    protected $manager;

    /**
     * @ORM\OneToMany(targetEntity="BusinessMan\Bundle\JobBundle\Entity\Job", mappedBy="client")
     */
    protected $jobs;

    /**
     * @ORM\OneToMany(targetEntity="Project", mappedBy="client")
     */
    protected $projects;

    /**
     * @ORM\OneToMany(targetEntity="Contract", mappedBy="client")
     */
    protected $contracts;

    /**
     * @ORM\OneToMany(targetEntity="SupportCall", mappedBy="client")
     */
    protected $supportCalls;

    /**
     * @ORM\OneToMany(targetEntity="Stock", mappedBy="client")
     */
    protected $stock;

    /**
     * @ORM\OneToMany(targetEntity="WorkOrder", mappedBy="client")
     */
    protected $workOrder;
    
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
     * @var ArrayCollection|Contact
     *
     * @ORM\OneToMany(targetEntity="Contact", mappedBy="client", cascade={"remove"})
     * @ORM\OrderBy({"surname" = "ASC", "forename" = "ASC"})
     */
    protected $contacts;

    public function __construct()
    {
        $this->contacts = new ArrayCollection();
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
     * Set name
     *
     * @param string $forename
     * @return Client
     */
    public function setName($name)
    {
        $this->name = $name;

        return $this;
    }

    /**
     * Get name
     *
     * @return string
     */
    public function getName()
    {
        return $this->name;
    }

    public function getDisplayName()
    {
        return $this->name ?: sprintf('%s', $this->getId());
    }

    public function getClassification()
    {
        return $this->classification;
    }

    public function getType()
    {
        return $this->type;
    }

    public function getPhone()
    {
        return $this->phone;
    }

    public function getSkype()
    {
        return $this->skype;
    }

    public function getEmail()
    {
        return $this->email;
    }

    public function getMainAddressName()
    {
        return $this->mainAddressName;
    }

    public function getMainAddressStreet()
    {
        return $this->mainAddressStreet;
    }

    public function getMainAddressTown()
    {
        return $this->mainAddressTown;
    }

    public function getMainAddressCounty()
    {
        return $this->mainAddressCounty;
    }

    public function getMainAddressState()
    {
        return $this->mainAddressState;
    }

    public function getMainAddressPostcode()
    {
        return $this->mainAddressPostcode;
    }

    public function getMainAddressCountry()
    {
        return $this->mainAddressCountry;
    }

    public function getWebsite()
    {
        return $this->website;
    }

    public function getManager()
    {
        return $this->manager;
    }

    public function getDefaultContact()
    {
        return $this->defaultContact;
    }

    public function getJobs()
    {
        return $this->jobs;
    }

    public function setJobs(array $jobs)
    {
        $this->jobs = $jobs;
        return $this;
    }

    public function getProjects()
    {
        return $this->projects;
    }

    public function getContracts()
    {
        return $this->contracts;
    }

    /**
     * @return \Mirsa\Bundle\MirsaBundle\Entity\Contact|\Doctrine\Common\Collections\ArrayCollection
     */
    public function getContacts()
    {
        return $this->contacts;
    }

    public function getStock()
    {
        return $this->stock;
    }
    
    function getLastModified() {
        return $this->lastModified;
    }


}
