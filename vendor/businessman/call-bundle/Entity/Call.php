<?php
namespace BusinessMan\Bundle\CallBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use JMS\Serializer\Annotation as Serializer;

/**
 * Call
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/businessmanportal/CallBundle
 *
 * @ORM\Entity()
 * @ORM\Table(name="Next_Contact_Record")
 *
 * @Serializer\ExclusionPolicy("all")
 * @Serializer\XmlRoot("call")
 */
class Call
{
    /**
     * @var string
     *
     * @ORM\Column(name="RecordID", type="string")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="CUSTOM")
     * @ORM\CustomIdGenerator(class="Synergize\Bundle\DbalBundle\Driver\IdentityGenerator")
     *
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $id;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="TimeStamp_Mod", type="timestamp")
     */
    protected $lastModified;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="Contact_Date", type="date")
     *
     * @Serializer\Expose
     * @Serializer\Type("DateTime<'Y-m-d'>")
     */
    protected $contactDate;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="Contact_Time_Calc", type="time")
     *
     * @Serializer\Expose
     * @Serializer\Type("DateTime<'H:i:s'>")
     */
    protected $contactTime;

    /**
     * @var boolean
     *
     * @ORM\Column(name="Call_Completed", type="yesno")
     *
     * @Serializer\Expose
     * @Serializer\Type("boolean")
     */
    protected $completed;

    /**
     * @var string
     *
     * @ORM\Column(name="Subject", type="string")
     */
    protected $subject;

    /**
     * @var string
     *
     * @ORM\Column(name="Return_Call_Notes", type="string")
     */
    protected $notes;

    /**
     * @var \BusinessMan\Bundle\ClientBundle\Entity\Client
     *
     * @ORM\ManyToOne(targetEntity="BusinessMan\Bundle\ClientBundle\Entity\Client")
     * @ORM\JoinColumn(name="CompanyID", referencedColumnName="Account_No")
     *
     * @Serializer\Expose
     * @Serializer\Type("BusinessMan\Bundle\ClientBundle\Entity\Client")
     */
    protected $client;

    /**
     * @var \BusinessMan\Bundle\ClientBundle\Entity\ClientContact
     *
     * @ORM\ManyToOne(targetEntity="BusinessMan\Bundle\ClientBundle\Entity\ClientContact")
     * @ORM\JoinColumn(name="ContactID", referencedColumnName="Record_ID")
     *
     * @Serializer\Expose
     * @Serializer\Type("BusinessMan\Bundle\ClientBundle\Entity\ClientContact")
     */
    protected $contact;

    /**
     * @var \BusinessMan\Bundle\StaffBundle\Entity\Staff
     *
     * @ORM\ManyToOne(targetEntity="BusinessMan\Bundle\StaffBundle\Entity\Staff")
     * @ORM\JoinColumn(name="Allocated_To_StaffID", referencedColumnName="Staff_ID")
     *
     * @Serializer\Expose
     * @Serializer\Type("BusinessMan\Bundle\StaffBundle\Entity\Staff")
     */
    protected $allocatedTo;

    /**
     * @return \BusinessMan\Bundle\StaffBundle\Entity\Staff
     */
    public function getAllocatedTo()
    {
        return $this->allocatedTo;
    }

    /**
     * @return \BusinessMan\Bundle\ClientBundle\Entity\Client
     */
    public function getClient()
    {
        return $this->client;
    }

    /**
     * @return boolean
     */
    public function getCompleted()
    {
        return $this->completed;
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
    public function getContactDate()
    {
        return $this->contactDate;
    }

    /**
     * @return \DateTime
     */
    public function getContactTime()
    {
        return $this->contactTime;
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
    public function getNotes()
    {
        return $this->notes;
    }

    /**
     * @return string
     */
    public function getSubject()
    {
        return $this->subject;
    }

    /**
     * @param \BusinessMan\Bundle\StaffBundle\Entity\Staff $allocatedTo
     */
    public function setAllocatedTo($allocatedTo)
    {
        $this->allocatedTo = $allocatedTo;
    }

    /**
     * @param \BusinessMan\Bundle\ClientBundle\Entity\Client $client
     */
    public function setClient($client)
    {
        $this->client = $client;
    }

    /**
     * @param boolean $completed
     */
    public function setCompleted($completed)
    {
        $this->completed = $completed;
    }

    /**
     * @param \BusinessMan\Bundle\ClientBundle\Entity\ClientContact $contact
     */
    public function setContact($contact)
    {
        $this->contact = $contact;
    }

    /**
     * @param \DateTime $contactDate
     */
    public function setContactDate($contactDate)
    {
        $this->contactDate = $contactDate;
    }

    /**
     * @param \DateTime $contactTime
     */
    public function setContactTime($contactTime)
    {
        $this->contactTime = $contactTime;
    }

    /**
     * @param string $notes
     */
    public function setNotes($notes)
    {
        $this->notes = $notes;
    }

    /**
     * @param string $subject
     */
    public function setSubject($subject)
    {
        $this->subject = $subject;
    }
}
