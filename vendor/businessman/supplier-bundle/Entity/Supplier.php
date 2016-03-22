<?php
namespace BusinessMan\Bundle\SupplierBundle\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use JMS\Serializer\Annotation as Serializer;

/**
 * Supplier
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/businessmanportal/SupplierBundle
 *
 * @ORM\Entity()
 * @ORM\Table(name="Suppliers")
 *
 * @Serializer\ExclusionPolicy("all")
 * @Serializer\XmlRoot("supplier")
 */
class Supplier
{
    /**
     * @var string
     *
     * @ORM\Column(name="Supplier_ID", type="string")
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
     * @ORM\Column(name="Supplier_Company", type="string")
     *
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $name;

    /**
     * @var string
     *
     * @ORM\Column(name="Supplier_Status", type="string")
     *
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $status;

    /**
     * @var string
     *
     * @ORM\Column(name="Type", type="string")
     *
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $type;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="Supplier_Expiry_Date", type="date")
     *
     * @Serializer\Expose
     * @Serializer\Type("DateTime<'Y-m-d'>")
     */
    protected $expiryDate;

    /**
     * @var string
     *
     * @ORM\Column(name="Main_Switchboard", type="string")
     *
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $phone;

    /**
     * @var string
     *
     * @ORM\Column(name="Fax", type="string")
     *
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $fax;

    /**
     * @var string
     *
     * @ORM\Column(name="WebSite", type="string")
     *
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $website;

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
     * @var \DateTime
     *
     * @ORM\Column(name="Mod_Timestamp", type="timestamp")
     */
    protected $lastModified;

    /**
     * @var ArrayCollection|SupplierContact
     *
     * @ORM\OneToMany(targetEntity="SupplierContact", mappedBy="supplier", cascade={"remove"})
     * @ORM\OrderBy({"forename" = "ASC", "surname" = "ASC"})
     */
    protected $contacts;

    public function __construct()
    {
        $this->contacts = new ArrayCollection();
    }

    /**
     * @return \BusinessMan\Bundle\SupplierBundle\Entity\SupplierContact|\Doctrine\Common\Collections\ArrayCollection
     */
    public function getContacts()
    {
        return $this->contacts;
    }

    /**
     * @return string
     */
    public function getEmail()
    {
        return $this->email;
    }

    /**
     * @return \DateTime
     */
    public function getExpiryDate()
    {
        return $this->expiryDate;
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
    public function getName()
    {
        return $this->name;
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
     * @param string $email
     */
    public function setEmail($email)
    {
        $this->email = $email;
    }

    /**
     * @param \DateTime $expiryDate
     */
    public function setExpiryDate($expiryDate)
    {
        $this->expiryDate = $expiryDate;
    }

    /**
     * @param string $fax
     */
    public function setFax($fax)
    {
        $this->fax = $fax;
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
}
