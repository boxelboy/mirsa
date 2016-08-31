<?php
/**
 * Schedule
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://webserver:8090/display/BMAN/Portal+Documentation
 */
namespace Mirsa\Bundle\MirsaBundle\Entity;

use Doctrine\ORM\Mapping as ORM,
    Symfony\Component\Validator\Constraints as Assert,
    JMS\Serializer\Annotation as Serializer;

/**
 * Shedule entity
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://webserver:8090/display/BMAN/Portal+Documentation
 *
 * @ORM\Entity()
 * @ORM\Table(name="Schedule")
 *
 * @Serializer\XmlRoot("schedule")
 * @Serializer\ExclusionPolicy("all")
 */
class Schedule
{
    /**
     * @ORM\Id
     * @ORM\Column(name="Schedule_ID", type="integer")
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
     * @ORM\ManyToOne(targetEntity="ScheduleEvent")
     * @ORM\JoinColumn(name="Event_ID", referencedColumnName="Event_ID")
     */
    protected $event;

    /**
     * @ORM\ManyToOne(targetEntity="Resource", inversedBy="schedules")
     * @ORM\JoinColumn(name="Resource_ID", referencedColumnName="Resource_ID")
     */
    protected $resource;

    /**
     * @ORM\ManyToOne(targetEntity="ScheduleDetail", inversedBy="schedules")
     * @ORM\JoinColumn(name="Group_ID", referencedColumnName="Group_ID")
     */
    protected $scheduleDetails;

    /**
     * @ORM\ManyToOne(targetEntity="BusinessMan\Bundle\JobBundle\Entity\Job")
     * @ORM\JoinColumn(name="Job_Number", referencedColumnName="Job_Number")
     */
    protected $job;

    /**
     * Get id
     *
     * @return int
     */
    public function getId()
    {
        return $this->id;
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

    public function getGroupId()
    {
        return $this->groupId;
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

    public function setGroupId($groupId)
    {
        $this->groupId = $groupId;
        return $this;
    }

    public function getScheduleDetails()
    {
        return $this->scheduleDetails;
    }

    public function setScheduleDetails($scheduleDetails)
    {
        $this->scheduleDetails = $scheduleDetails;
        return $this;
    }

    public function getResource()
    {
        return $this->resource;
    }

    public function setResource($resource)
    {
        $this->resource = $resource;
        return $this;
    }
}
