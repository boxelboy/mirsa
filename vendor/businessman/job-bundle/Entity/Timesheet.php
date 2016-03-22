<?php
namespace BusinessMan\Bundle\JobBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use JMS\Serializer\Annotation as Serializer;

/**
 * Timesheet entity
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/businessmanportal/JobBundle
 *
 * @ORM\Entity
 * @ORM\Table(name="Staff_Timesheet")
 *
 * @Serializer\ExclusionPolicy("all")
 * @Serializer\XmlRoot("timesheet")
 */
class Timesheet
{
    /**
     * @var string
     *
     * @ORM\Id
     * @ORM\Column(name="Record_ID", type="string")
     * @ORM\GeneratedValue(strategy="CUSTOM")
     * @ORM\CustomIdGenerator(class="Synergize\Bundle\DbalBundle\Driver\IdentityGenerator")
     *
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $id;

    /**
     * @var double
     *
     * @ORM\Column(name="TimeValue", type="float", nullable=false)
     *
     * @Serializer\Expose
     * @Serializer\Type("double")
     */
    protected $timeValue;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="Date_Modified", type="timestamp")
     *
     * @Serializer\Expose
     * @Serializer\Type("DateTime<'Y-m-d H:i:s'>")
     */
    protected $lastModified;

    /**
     * @var string
     *
     * @ORM\Column(name="Notes", type="string")
     *
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $notes;

    /**
     * @var string
     *
     * @ORM\Column(name="Timing_Subject", type="string")
     */
    protected $subject;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="Date_From", type="date")
     *
     * @Serializer\Expose
     * @Serializer\Type("DateTime<'Y-m-d'>")
     */
    protected $dateFrom;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="Time_From", type="time")
     *
     * @Serializer\Expose
     * @Serializer\Type("DateTime<'H:i:s'>")
     */
    protected $timeFrom;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="Time_To", type="time")
     *
     * @Serializer\Expose
     * @Serializer\Type("DateTime<'H:i:s'>")
     */
    protected $timeTo;

    /**
     * @var Job
     *
     * @ORM\ManyToOne(targetEntity="Job", inversedBy="timesheets")
     * @ORM\JoinColumn(name="Job_Number", referencedColumnName="Job_Number", nullable=true)
     */
    protected $job;

    /**
     * @var \BusinessMan\Bundle\SupportBundle\Entity\SupportCall
     *
     * @ORM\ManyToOne(targetEntity="BusinessMan\Bundle\SupportBundle\Entity\SupportCall")
     * @ORM\JoinColumn(name="Support_Call_ID", referencedColumnName="Key_Primary", nullable=true)
     */
    protected $supportCall;

    /**
     * @var \BusinessMan\Bundle\StaffBundle\Entity\Staff
     *
     * @ORM\ManyToOne(targetEntity="BusinessMan\Bundle\StaffBundle\Entity\Staff")
     * @ORM\JoinColumn(name="Key_Staff_ID", referencedColumnName="Staff_ID")
     *
     * @Serializer\Expose
     * @Serializer\Type("BusinessMan\Bundle\StaffBundle\Entity\Staff")
     */
    protected $staff;

    /**
     * @var \BusinessMan\Bundle\StaffBundle\Entity\Staff
     *
     * @ORM\ManyToOne(targetEntity="BusinessMan\Bundle\StaffBundle\Entity\Staff")
     * @ORM\JoinColumn(name="Created_By_Staff_ID", referencedColumnName="Staff_ID")
     */
    protected $creator;

    public function __construct()
    {
        $this->dateFrom = new \DateTime('now');
    }

    /**
     * @return \BusinessMan\Bundle\StaffBundle\Entity\Staff
     */
    public function getCreator()
    {
        return $this->creator;
    }

    /**
     * @return \DateTime
     */
    public function getDateFrom()
    {
        return $this->dateFrom;
    }

    /**
     * @return string
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * @return \BusinessMan\Bundle\JobBundle\Entity\Job
     */
    public function getJob()
    {
        return $this->job;
    }

    /**
     * @return \BusinessMan\Bundle\SupportBundle\Entity\SupportCall
     */
    public function getSupportCall()
    {
        return $this->supportCall;
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
     * @return \BusinessMan\Bundle\StaffBundle\Entity\Staff
     */
    public function getStaff()
    {
        return $this->staff;
    }

    /**
     * @return string
     */
    public function getSubject()
    {
        return $this->subject;
    }

    /**
     * @return \DateTime
     */
    public function getTimeFrom()
    {
        return $this->timeFrom;
    }

    /**
     * @return \DateTime
     */
    public function getTimeTo()
    {
        return $this->timeTo;
    }

    /**
     * @return float
     */
    public function getTimeValue()
    {
        return $this->timeValue;
    }

    /**
     * @param \BusinessMan\Bundle\StaffBundle\Entity\Staff $creator
     */
    public function setCreator($creator)
    {
        $this->creator = $creator;
    }

    /**
     * @param \DateTime $dateFrom
     */
    public function setDateFrom($dateFrom)
    {
        $this->dateFrom = $dateFrom;
    }

    /**
     * @param \BusinessMan\Bundle\JobBundle\Entity\Job $job
     */
    public function setJob($job)
    {
        $this->job = $job;
    }

    /**
     * @param \BusinessMan\Bundle\SupportBundle\Entity\SupportCall $supportCall
     */
    public function setSupportCall($supportCall)
    {
        $this->supportCall = $supportCall;
    }

    /**
     * @param string $notes
     */
    public function setNotes($notes)
    {
        $this->notes = $notes;
    }

    /**
     * @param \BusinessMan\Bundle\StaffBundle\Entity\Staff $staff
     */
    public function setStaff($staff)
    {
        $this->staff = $staff;
    }

    /**
     * @param string $subject
     */
    public function setSubject($subject)
    {
        $this->subject = $subject;
    }

    /**
     * @param \DateTime $timeFrom
     */
    public function setTimeFrom($timeFrom)
    {
        $this->timeFrom = $timeFrom;
    }

    /**
     * @param \DateTime $timeTo
     */
    public function setTimeTo($timeTo)
    {
        $this->timeTo = $timeTo;
    }

    /**
     * @param float $timeValue
     */
    public function setTimeValue($timeValue)
    {
        $this->timeValue = $timeValue;
    }
}
