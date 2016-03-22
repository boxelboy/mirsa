<?php
namespace BusinessMan\Bundle\SupportBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use JMS\Serializer\Annotation as Serializer;

/**
 * SupportCallMessage
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/businessmanportal/SupportBundle
 *
 * @ORM\Table(name="Support_Calls_Line_Items")
 * @ORM\Entity()
 *
 * @Serializer\ExclusionPolicy("all")
 * @Serializer\XmlRoot("item")
 */
class SupportCallMessage
{
    /**
     * @var string
     *
     * @ORM\Column(name="Key_Primary", type="string")
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
     * @ORM\Column(name="Created_By", type="string")
     */
    protected $createdBy;

    /**
     * @var string
     *
     * @ORM\Column(name="Description", type="string")
     */
    protected $description;

    /**
     * @var string
     *
     * @ORM\Column(name="IP_Address", type="string")
     *
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $ipAddress;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="Creation_Timestamp", type="timestamp")
     *
     * @Serializer\Expose
     * @Serializer\Type("DateTime<'Y-m-d H:i:s'>")
     */
    protected $created;

    /**
     * @var boolean
     *
     * @ORM\Column(name="Flag_Internal", type="boolean")
     *
     * @Serializer\Expose
     * @Serializer\Type("boolean")
     */
    protected $internal;

    /**
     * @var boolean
     *
     * @ORM\Column(name="Flag_Email_Support", type="boolean")
     */
    protected $emailSupport;

    /**
     * @var boolean
     *
     * @ORM\Column(name="Flag_Email_Client", type="boolean")
     */
    protected $emailClient;

    /**
     * @var SupportCall
     *
     * @ORM\ManyToOne(targetEntity="SupportCall", inversedBy="messages")
     * @ORM\JoinColumn(name="Support_Call_ID", referencedColumnName="Key_Primary")
     */
    protected $supportCall;

    /**
     * @var \BusinessMan\Bundle\StaffBundle\Entity\Staff
     *
     * @ORM\ManyToOne(targetEntity="BusinessMan\Bundle\StaffBundle\Entity\Staff")
     * @ORM\JoinColumn(name="Staff_ID", referencedColumnName="Staff_ID")
     */
    protected $staff;

    /**
     * @var \BusinessMan\Bundle\ClientBundle\Entity\ClientContact
     *
     * @ORM\ManyToOne(targetEntity="BusinessMan\Bundle\ClientBundle\Entity\ClientContact")
     * @ORM\JoinColumn(name="Client_Contact_ID", referencedColumnName="Record_ID")
     */
    protected $contact;

    function __construct()
    {
        $this->created = new \DateTime();
    }

    /**
     * @return \BusinessMan\Bundle\ClientBundle\Entity\ClientContact
     */
    public function getContact()
    {
        return $this->contact;
    }

    /**
     * @return \DateTime
     */
    public function getCreated()
    {
        return $this->created;
    }

    /**
     * @return string
     */
    public function getCreatedBy()
    {
        return $this->createdBy;
    }

    /**
     * @return string
     */
    public function getDescription()
    {
        return $this->description;
    }

    /**
     * @return boolean
     */
    public function getEmailClient()
    {
        return $this->emailClient;
    }

    /**
     * @return boolean
     */
    public function getEmailSupport()
    {
        return $this->emailSupport;
    }

    /**
     * @return string
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * @return boolean
     */
    public function getInternal()
    {
        return $this->internal;
    }

    /**
     * @return string
     */
    public function getIpAddress()
    {
        return $this->ipAddress;
    }

    /**
     * @return \BusinessMan\Bundle\StaffBundle\Entity\Staff
     */
    public function getStaff()
    {
        return $this->staff;
    }

    /**
     * @return \BusinessMan\Bundle\SupportBundle\Entity\SupportCall
     */
    public function getSupportCall()
    {
        return $this->supportCall;
    }

    /**
     * @param \BusinessMan\Bundle\ClientBundle\Entity\ClientContact $contact
     */
    public function setContact($contact)
    {
        $this->contact = $contact;
    }

    /**
     * @param string $createdBy
     */
    public function setCreatedBy($createdBy)
    {
        $this->createdBy = $createdBy;
    }

    /**
     * @param string $description
     */
    public function setDescription($description)
    {
        $this->description = $description;
    }

    /**
     * @param boolean $emailClient
     */
    public function setEmailClient($emailClient)
    {
        $this->emailClient = $emailClient;
    }

    /**
     * @param boolean $emailSupport
     */
    public function setEmailSupport($emailSupport)
    {
        $this->emailSupport = $emailSupport;
    }

    /**
     * @param boolean $internal
     */
    public function setInternal($internal)
    {
        $this->internal = $internal;
    }

    /**
     * @param string $ipAddress
     */
    public function setIpAddress($ipAddress)
    {
        $this->ipAddress = $ipAddress;
    }

    /**
     * @param \BusinessMan\Bundle\StaffBundle\Entity\Staff $staff
     */
    public function setStaff($staff)
    {
        $this->staff = $staff;
    }

    /**
     * @param \BusinessMan\Bundle\SupportBundle\Entity\SupportCall $supportCall
     */
    public function setSupportCall($supportCall)
    {
        $this->supportCall = $supportCall;
    }
}
