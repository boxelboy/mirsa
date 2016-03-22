<?php
namespace Scheduler\Bundle\CommonBundle\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use JMS\Serializer\Annotation as Serializer;

/**
 * ScheduleDetail
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/scheduler/CommonBundle
 *
 * @ORM\Entity(repositoryClass="Scheduler\Bundle\CommonBundle\Repository\ScheduleDetailRepository")
 * @ORM\Table(name="Schedule_Details")
 */
class ScheduleDetail
{
    /**
     * @var int
     *
     * @ORM\Id
     * @ORM\Column(name="Record_ID", type="integer")
     * @ORM\GeneratedValue(strategy="CUSTOM")
     * @ORM\CustomIdGenerator(class="Synergize\Bundle\DbalBundle\Driver\IdentityGenerator")
     */
    protected $id;

    /**
     * @var string
     *
     * @ORM\Column(name="Group_ID", type="string")
     */
    protected $groupId;

    /**
     * @var string
     *
     * @ORM\Column(name="Importance", type="string")
     */
    protected $importance;

    /**
     * @var string
     *
     * @ORM\Column(name="Internal_Notes", type="string")
     */
    protected $internalNotes;

    /**
     * @var string
     *
     * @ORM\Column(name="Notes", type="string")
     */
    protected $notes;

    /**
     * @var boolean
     *
     * @ORM\Column(name="Scheduled", type="boolean")
     */
    protected $scheduled;

    /**
     * @var boolean
     *
     * @ORM\Column(name="All_Day", type="yesno")
     */
    protected $allDay;

    /**
     * @var boolean
     *
     * @ORM\Column(name="Locked", type="boolean")
     */
    protected $locked;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="Created_Date", type="date")
     */
    protected $creationDate;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="Created_Time", type="time")
     */
    protected $creationTime;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="Start_Date", type="date")
     */
    protected $startDate;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="Start_Time", type="time")
     */
    protected $startTime;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="Finish_Date", type="date")
     */
    protected $endDate;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="Finish_Time", type="time")
     */
    protected $endTime;

    /**
     * @var string
     *
     * @ORM\Column(name="Booked_For", type="string")
     */
    protected $bookedFor;

    /**
     * @var string
     *
     * @ORM\Column(name="Location", type="string")
     */
    protected $location;

    /**
     * @var string
     *
     * @ORM\Column(name="Location_Latitude", type="string")
     */
    protected $locationLatitude;

    /**
     * @var string
     *
     * @ORM\Column(name="Location_Longitude", type="string")
     */
    protected $locationLongitude;

    /**
     * @var string
     *
     * @ORM\Column(name="Private", type="string")
     */
    protected $private;

    /**
     * @var ArrayCollection|Schedule
     *
     * @ORM\OneToMany(targetEntity="Schedule", mappedBy="scheduleDetails", cascade={"remove"})
     */
    protected $schedules;

    public function __construct()
    {
        $this->schedules = new ArrayCollection();
        $this->setCreationDate(new \DateTime());
        $this->setCreationTime(new \DateTime());
        $this->setGroupId('D' . rand(100000000, 10000000000));
        $this->setScheduled(true);
    }

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
    }

    public function getJob()
    {
        return $this->job;
    }

    public function setJob($job)
    {
        $this->job = $job;
    }

    public function getJobId()
    {
        return $this->jobId;
    }

    public function setJobId($jobId)
    {
        $this->jobId = $jobId;
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

    public function isAllDay()
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

    public function getCreationDate()
    {
        return $this->creationDate;
    }

    public function getCreationTime()
    {
        return $this->creationTime;
    }

    /**
     * @param mixed $creationDate
     */
    public function setCreationDate($creationDate)
    {
        $this->creationDate = $creationDate;
    }

    /**
     * @param mixed $creationTime
     */
    public function setCreationTime($creationTime)
    {
        $this->creationTime = $creationTime;
    }

    /**
     * @param mixed $importance
     */
    public function setImportance($importance)
    {
        $this->importance = $importance;
    }

    /**
     * @param mixed $internalNotes
     */
    public function setInternalNotes($internalNotes)
    {
        $this->internalNotes = $internalNotes;
    }

    /**
     * @param mixed $notes
     */
    public function setNotes($notes)
    {
        $this->notes = $notes;
    }

    /**
     * @return \DateTime
     */
    public function getStartDate()
    {
        return $this->startDate;
    }

    public function setStartDate($startDate)
    {
        $this->startDate = $startDate;

        return $this;
    }

    /**
     * @return \DateTime
     */
    public function getStartTime()
    {
        return $this->startTime;
    }

    public function setStartTime($startTime)
    {
        $this->startTime = $startTime;

        return $this;
    }

    /**
     * @return \DateTime
     */
    public function getEndDate()
    {
        return $this->endDate;
    }

    public function setEndDate($endDate)
    {
        $this->endDate = $endDate;

        return $this;
    }

    /**
     * @return \DateTime
     */
    public function getEnd()
    {
        $end = $this->getEndDate();

        if ($this->isAllDay()) {
            $end->modify('+1 day');
            $end->setTime(0, 0, 0);
        } else {
            $end->setTime(
                $this->getEndTime()->format('H'),
                $this->getEndTime()->format('i'),
                $this->getEndTime()->format('s')
            );
        }

        return $end;
    }

    /**
     * @return \DateTime
     */
    public function getStart()
    {
        $start = $this->getStartDate();

        if ($this->isAllDay()) {
            $start->setTime(0, 0, 0);
        } else {
            $start->setTime(
                $this->getStartTime()->format('H'),
                $this->getStartTime()->format('i'),
                $this->getStartTime()->format('s')
            );
        }

        return $start;
    }

    /**
     * @return \DateTime
     */
    public function getEndTime()
    {
        return $this->endTime;
    }

    public function setEndTime($endTime)
    {
        $this->endTime = $endTime;

        return $this;
    }

    public function getDuration()
    {
        return $this->getEnd()->diff($this->getStart());
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
    }

    public function getLocationLatitude()
    {
        return $this->locationLatitude;
    }

    public function setLocationLatitude($locationLatitude)
    {
        $this->locationLatitude = $locationLatitude;
    }

    public function getLocationLongitude()
    {
        return $this->locationLongitude;
    }

    public function setLocationLongitude($locationLongitude)
    {
        $this->locationLongitude = $locationLongitude;
    }

    /**
     * @param mixed $scheduled
     */
    public function setScheduled($scheduled)
    {
        $this->scheduled = $scheduled;
    }

    /**
     * @param mixed $locked
     */
    public function setLocked($locked)
    {
        $this->locked = $locked;
    }

    /**
     * @return mixed
     */
    public function getLocked()
    {
        return $this->locked;
    }

    /**
     * @param mixed $private
     */
    public function setPrivate($private)
    {
        $this->private = $private;
    }

    /**
     * @return mixed
     */
    public function getPrivate()
    {
        return $this->private;
    }

    /**
     * @return ArrayCollection|Schedule
     */
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
