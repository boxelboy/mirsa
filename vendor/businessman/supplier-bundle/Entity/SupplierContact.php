<?php
namespace BusinessMan\Bundle\SupplierBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use JMS\Serializer\Annotation as Serializer;

/**
 * SupplierContact
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/businessmanportal/SupplierBundle
 *
 * @ORM\Entity()
 * @ORM\Table(name="Supplier_Contacts")
 *
 * @Serializer\ExclusionPolicy("all")
 * @Serializer\XmlRoot("contact")
 */
class SupplierContact
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
     * @ORM\Column(name="`Name First`", type="string")
     *
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $forename;

    /**
     * @var string
     *
     * @ORM\Column(name="`Name Last`", type="string")
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
     * @var \Synergize\Bundle\DbalBundle\Type\ContainerField
     *
     * @ORM\Column(name="Photo", type="container")
     */
    protected $photo;

    /**
     * @var string
     *
     * @ORM\Column(name="`Telephone Fax`", type="string")
     */
    protected $fax;

    /**
     * @var string
     *
     * @ORM\Column(name="`Telephone Mobile`", type="string")
     *
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $mobile;

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
     * @var Supplier
     *
     * @ORM\ManyToOne(targetEntity="Supplier", inversedBy="contacts")
     * @ORM\JoinColumn(name="SupplierID", referencedColumnName="Supplier_ID")
     */
    protected $supplier;

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
     * @return \Synergize\Bundle\DbalBundle\Type\ContainerField
     */
    public function getPhoto()
    {
        return $this->photo;
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
     * @param string $email
     */
    public function setEmail($email)
    {
        $this->email = $email;
    }

    /**
     * @param string $extension
     */
    public function setExtension($extension)
    {
        $this->extension = $extension;
    }

    /**
     * @param string $fax
     */
    public function setFax($fax)
    {
        $this->fax = $fax;
    }

    /**
     * @param string $forename
     */
    public function setForename($forename)
    {
        $this->forename = $forename;
    }

    /**
     * @param \DateTime $lastModified
     */
    public function setLastModified($lastModified)
    {
        $this->lastModified = $lastModified;
    }

    /**
     * @param string $mobile
     */
    public function setMobile($mobile)
    {
        $this->mobile = $mobile;
    }

    /**
     * @param \BusinessMan\Bundle\SupplierBundle\Entity\Supplier $supplier
     */
    public function setSupplier($supplier)
    {
        $this->supplier = $supplier;
    }

    /**
     * @param string $surname
     */
    public function setSurname($surname)
    {
        $this->surname = $surname;
    }

    /**
     * @param string $telephone
     */
    public function setTelephone($telephone)
    {
        $this->telephone = $telephone;
    }
}
