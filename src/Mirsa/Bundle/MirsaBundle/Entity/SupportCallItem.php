<?php
namespace Mirsa\Bundle\MirsaBundle\Entity;

use Doctrine\ORM\Mapping as ORM,
    JMS\Serializer\Annotation as Serializer;

/**
 * SupportCallItem
 *
 * @ORM\Table(name="Support_Call_Item")
 * @ORM\Entity()
 *
 * @Serializer\XmlRoot("supportcallitem")
 * @Serializer\ExclusionPolicy("all")
 */
class SupportCallItem
{
    /**
     * @ORM\Column(name="Key_Primary", type="string")
     * @ORM\Id
     * @Serializer\Expose
     * @Serializer\XmlAttribute
     */
    protected $id;

    /**
     * @ORM\Column(name="Created_By", type="string")
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $createdBy;

    /**
     * @ORM\Column(name="Description", type="string")
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $description;

    /**
     * @ORM\Column(name="IP_Address", type="string")
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $ipAddress;

    /**
     * @ORM\Column(name="Creation_Timestamp", type="timestamp")
     * @Serializer\Expose
     * @Serializer\Type("DateTime")
     */
    protected $created;

    /**
     * @ORM\Column(name="Flag_Internal", type="boolean")
     * @Serializer\Expose
     * @Serializer\Type("boolean")
     */
    protected $internal;

    /**
     * @ORM\ManyToOne(targetEntity="SupportCall", inversedBy="items")
     * @ORM\JoinColumn(name="Support_Call_ID", referencedColumnName="Key_Primary")
     */
    protected $supportCall;

    /**
     * @ORM\ManyToOne(targetEntity="Staff")
     * @ORM\JoinColumn(name="Staff_ID", referencedColumnName="Staff_ID")
     */
    protected $staff;

    /**
     * @ORM\ManyToOne(targetEntity="Contact")
     * @ORM\JoinColumn(name="Client_Contact_ID", referencedColumnName="Record_ID")
     */
    protected $contact;

    public function getId()
    {
        return $this->id;
    }

    public function getCreatedBy()
    {
        return $this->createdBy;
    }

    public function setCreatedBy($createdBy)
    {
        $this->createdBy = $createdBy;
        return $this;
    }

    public function getDescription()
    {
        return $this->description;
    }

    public function setDescription($description)
    {
        $this->description = $description;
        return $this;
    }

    public function getIpAddress()
    {
        return $this->ipAddress;
    }

    public function setIpAddress($ipAddress)
    {
        $this->ipAddress = $ipAddress;
        return $this;
    }

    public function getCreated()
    {
        return $this->created;
    }

    public function isInternal()
    {
        return $this->internal;
    }

    public function setInternal($internal)
    {
        $this->internal = $internal;
        return $this;
    }

    public function getSupportCall()
    {
        return $this->supportCall;
    }

    public function setSupportCall($supportCall)
    {
        $this->supportCall = $supportCall;
        return $this;
    }

    public function getStaff()
    {
        return $this->staff;
    }

    public function setStaff($staff)
    {
        $this->staff = $staff;
        return $this;
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

    public function isFromStaff()
    {
        return !is_null($this->getStaff());
    }

    public function isFromClient()
    {
        return is_null($this->getStaff());
    }
}
