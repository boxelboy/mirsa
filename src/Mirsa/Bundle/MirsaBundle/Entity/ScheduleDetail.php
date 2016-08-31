<?php
/**
 * ResourceCategory
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://webserver:8090/display/BMAN/Portal+Documentation
 */
namespace Mirsa\Bundle\MirsaBundle\Entity;

use Doctrine\ORM\Mapping as ORM,
    Symfony\Component\Validator\Constraints as Assert,
    JMS\Serializer\Annotation as Serializer,
    FSC\HateoasBundle\Annotation as RestHateoas;

/**
 * SheduleDetail entity
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://webserver:8090/display/BMAN/Portal+Documentation
 *
 * @ORM\Entity()
 * @ORM\Table(name="Schedule_Details")
 *
 * @Serializer\XmlRoot("scheduledetail")
 * @Serializer\ExclusionPolicy("all")
 */
class ScheduleDetail
{
    /**
     * @ORM\Id
     * @ORM\Column(name="Record_ID", type="integer")
     * @Serializer\Expose
     * @Serializer\XmlAttribute
     */
    protected $id;
    
    /**
     * @ORM\Column(name="Group_ID", type="string")
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $groupId;

    /**
     * @ORM\Column(name="Job_Number", type="string")
     */
    protected $jobId;

    /**
     * @ORM\Column(name="Importance", type="string")
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $importance;

    /**
     * @ORM\Column(name="Internal_Notes", type="string")
     */
    protected $internalNotes;

    /**
     * @ORM\Column(name="Notes", type="string")
     */
    protected $notes;

    /**
     * @ORM\Column(name="Scheduled", type="boolean")
     * @Serializer\Expose
     * @Serializer\Type("boolean")
     */
    protected $scheduled;

    /**
     * @ORM\Column(name="All_Day", type="string")
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $allDay;

    /**
     * @ORM\Column(name="Locked", type="boolean")
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $locked;

    /**
     * @ORM\Column(name="Status_RGB", type="string")
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $statusColour;

    /**
     * @ORM\Column(name="Created_Date", type="date")
     * @Serializer\Expose
     * @Serializer\Type("DateTime<'Y-m-dO'>")
     */
    protected $creationDate;

    /**
     * @ORM\Column(name="Created_Time", type="time")
     * @Serializer\Expose
     * @Serializer\Type("DateTime<'H:i:sO'>")
     */
    protected $creationTime;

    /**
     * @ORM\Column(name="Start_Date", type="date")
     * @Serializer\Expose
     * @Serializer\Type("DateTime<'Y-m-dO'>")
     */
    protected $startDate;

    /**
     * @ORM\Column(name="Start_Time", type="time")
     * @Serializer\Expose
     * @Serializer\Type("DateTime<'H:i:sO'>")
     */
    protected $startTime;

    /**
     * @ORM\Column(name="Finish_Date", type="date")
     * @Serializer\Expose
     * @Serializer\Type("DateTime<'Y-m-dO'>")
     */
    protected $endDate;

    /**
     * @ORM\Column(name="Finish_Time", type="time")
     * @Serializer\Expose
     * @Serializer\Type("DateTime<'H:i:sO'>")
     */
    protected $endTime;

    /**
     * @ORM\Column(name="Booked_For", type="string")
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $bookedFor;

    /**
     * @ORM\Column(name="Location", type="string")
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $location;

    /**
     * @ORM\Column(name="Location_Latitude", type="string")
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $locationLatitude;

    /**
     * @ORM\Column(name="Location_Longitude", type="string")
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $locationLongitude;

    /**
     * @ORM\ManyToOne(targetEntity="ScheduleEvent")
     * @ORM\JoinColumn(name="Event_ID", referencedColumnName="Event_ID")
     */
    protected $event;

    /**
     * @ORM\ManyToOne(targetEntity="Staff")
     * @ORM\JoinColumn(name="Staff_ID", referencedColumnName="Staff_ID")
     */
    protected $staff;

    /**
     * @ORM\ManyToOne(targetEntity="Job")
     * @ORM\JoinColumn(name="Job_Number", referencedColumnName="Job_Number")
     */
    protected $job;

    /**
     * @ORM\OneToMany(targetEntity="Schedule", mappedBy="scheduleDetails")
     */
    protected $schedules;

    /**
     * Get id
     *
     * @return int
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * Get group id
     *
     * @return int
     */
    public function getGroupId()
    {
        return $this->groupId;
    }

    public function setGroupId($groupId)
    {
        $this->groupId = $groupId;
        return $this;
    }

    public function getJob()
    {
        return $this->job;
    }

    public function setJob($job)
    {
        $this->job = $job;
        return $this;
    }

    public function getJobId()
    {
        return $this->jobId;
    }

    public function setJobId($jobId)
    {
        $this->jobId = $jobId;
        return $this;
    }

    public function getImportance()
    {
        return $this->importance;
    }

    public function getInternalNotes()
    {
        return $this->internalNotes;
    }

    public function getNotes()
    {
        return $this->notes;
    }

    public function isScheduled()
    {
        return $this->scheduled;
    }

    public function getAllDay()
    {
        return $this->allDay;
    }

    public function setAllDay($allDay)
    {
        $this->allDay = $allDay;
    }

    public function isLocked()
    {
        return $this->locked;
    }

    public function getStatusColour()
    {
        return $this->statusColour;
    }

    public function getCreationDate()
    {
        return $this->creationDate;
    }

    public function getCreationTime()
    {
        return $this->creationTime;
    }

    public function getStartDate()
    {
        return $this->startDate;
    }

    public function setStartDate($startDate)
    {
        $this->startDate = $startDate;
        return $this;
    }

    public function getStartTime()
    {
        return $this->startTime;
    }

    public function setStartTime($startTime)
    {
        $this->startTime = $startTime;
        return $this;
    }

    public function getEndDate()
    {
        return $this->endDate;
    }

    public function setEndDate($endDate)
    {
        $this->endDate = $endDate;
        return $this;
    }

    public function getEndTime()
    {
        return $this->endTime;
    }

    public function setEndTime($endTime)
    {
        $this->endTime = $endTime;
        return $this;
    }

    public function getBookedFor()
    {
        return $this->bookedFor;
    }

    public function setBookedFor($bookedFor)
    {
        $this->bookedFor = $bookedFor;
        return $this;
    }

    public function getLocation()
    {
        return $this->location;
    }

    public function setLocation($location)
    {
        $this->location= $location;
        return $this;
    }

    public function getLocationLatitude()
    {
        return $this->locationLatitude;
    }

    public function setLocationLatitude($locationLatitude)
    {
        $this->locationLatitude = $locationLatitude;
        return $this;
    }

    public function getLocationLongitude()
    {
        return $this->locationLongitude;
    }

    public function setLocationLongitude($locationLongitude)
    {
        $this->locationLongitude = $locationLongitude;
        return $this;
    }

    public function getEvent()
    {
        return $this->event;
    }

    public function setEvent($event)
    {
        $this->event = $event;
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

    public function getSchedules()
    {
        return $this->schedules;
    }

    public function getResources()
    {
        $resources = array();
        $schedules = $this->getSchedules();

        foreach ($schedules as $schedule) {
            if (!in_array($schedule->getResource(), $resources)) {
                $resources[] = $schedule->getResource();
            }
        }

        return $resources;
    }    
}
