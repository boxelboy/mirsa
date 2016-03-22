<?php
namespace Scheduler\Bundle\CommonBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use JMS\Serializer\Annotation as Serializer;

/**
 * Schedule
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/scheduler/CommonBundle
 *
 * @ORM\Entity(repositoryClass="Scheduler\Bundle\CommonBundle\Repository\CommonRepository")
 * @ORM\Table(name="Schedule")
 */
class Schedule
{
    /**
     * @var int
     *
     * @ORM\Id
     * @ORM\Column(name="Schedule_ID", type="integer")
     * @ORM\GeneratedValue(strategy="CUSTOM")
     * @ORM\CustomIdGenerator(class="Synergize\Bundle\DbalBundle\Driver\IdentityGenerator")
     */
    protected $id;

    /**
     * @var ScheduleEvent
     *
     * @ORM\ManyToOne(targetEntity="ScheduleEvent")
     * @ORM\JoinColumn(name="Event_ID", referencedColumnName="Event_ID", nullable=true)
     */
    protected $event;

    /**
     * @var Resource
     *
     * @ORM\ManyToOne(targetEntity="Resource", inversedBy="schedules")
     * @ORM\JoinColumn(name="Resource_ID", referencedColumnName="Resource_ID")
     */
    protected $resource;

    /**
     * @var ScheduleDetail
     *
     * @ORM\ManyToOne(targetEntity="ScheduleDetail", inversedBy="schedules")
     * @ORM\JoinColumn(name="Schedule_Detail_ID", referencedColumnName="Record_ID")
     */
    protected $scheduleDetails;

    /**
     * @return ScheduleEvent
     */
    public function getEvent()
    {
        return $this->event;
    }

    /**
     * @return int
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * @return Resource
     */
    public function getResource()
    {
        return $this->resource;
    }

    /**
     * @return ScheduleDetail
     */
    public function getScheduleDetails()
    {
        return $this->scheduleDetails;
    }

    /**
     * @param ScheduleEvent $event
     */
    public function setEvent(ScheduleEvent $event)
    {
        $this->event = $event;
    }

    /**
     * @param Resource $resource
     */
    public function setResource(Resource $resource)
    {
        $this->resource = $resource;
    }

    /**
     * @param ScheduleDetail $scheduleDetails
     */
    public function setScheduleDetails(ScheduleDetail $scheduleDetails)
    {
        $this->scheduleDetails = $scheduleDetails;
    }
}
