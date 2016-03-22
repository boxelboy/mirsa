<?php

namespace Mirsa\Bundle\MirsaBundle\Entity;

use Doctrine\ORM\Mapping as ORM,
    Symfony\Component\Validator\Constraints as Assert,
    JMS\Serializer\Annotation as Serializer;

/**
 * Task entity
 *
 * @author cps
 * @link   http://webserver:8090/display/BMAN/Portal+Documentation
 *
 * @ORM\Entity()
 * @ORM\Table(name="SCHEDULER_TASKS")
 *
 * @Serializer\XmlRoot("task")
 * @Serializer\ExclusionPolicy("all")
 */
class Task
{
    /**
     * @ORM\Id
     * @ORM\Column(name="Task_ID", type="string")
     * @Serializer\Expose
     * @Serializer\XmlAttribute
     */
    protected $id;

    /**
     * @ORM\Column(name="Subject", type="string")
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $subject;

    /**
     * @ORM\Column(name="Start_Time", type="time")
     * @Serializer\Expose
     * @Serializer\Type("DateTime<'H:i:sO'>")
     */
    protected $startTime;

    /**
     * @ORM\Column(name="Start_Date", type="date")
     * @Serializer\Expose
     * @Serializer\Type("DateTime<'Y-m-dO'>")
     */
    protected $startDate;

    /**
     * @ORM\Column(name="Due_Date", type="date")
     * @Serializer\Expose
     * @Serializer\Type("DateTime<'Y-m-dO'>")
     */
    protected $dueDate;

    /**
     * @ORM\Column(name="Due_Time", type="time")
     * @Serializer\Expose
     * @Serializer\Type("DateTime<'H:i:sO'>")
     */
    protected $dueTime;

    /**
     * @ORM\Column(name="Reminder_TS", type="timestamp")
     * @Serializer\Expose
     * @Serializer\Type("DateTime")
     */
    protected $reminderDate;

    /**
     * @ORM\Column(name="Reminder_Set", type="boolean")
     * @Serializer\Expose
     * @Serializer\Type("boolean")
     */
    protected $reminderSet;

    /**
     * @ORM\Column(name="Status", type="string")
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $status;

    /**
     * @ORM\Column(name="Priority", type="string")
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $priority;

    /**
     * @ORM\Column(name="Progress", type="string")
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $progress;

    /**
     * @ORM\Column(name="Notes", type="notes")
     */
    protected $notes;

    /**
     * @ORM\ManyToOne(targetEntity="Resource")
     * @ORM\JoinColumn(name="Resource_ID", referencedColumnName="Resource_ID")
     * @Serializer\Expose    
     */
    protected $resource;

    /**
     * @ORM\ManyToOne(targetEntity="SupportCall")
     * @ORM\JoinColumn(name="Support_Call_ID", referencedColumnName="Key_Primary")
     */
    protected $supportCall;

    /**
     * @ORM\ManyToOne(targetEntity="BusinessMan\Bundle\JobBundle\Entity\Job")
     * @ORM\JoinColumn(name="Job_No", referencedColumnName="Job_Number")
     */
    protected $job;

    /**
     * getId
     *
     * @return string
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * getSubject
     *
     * @return string
     */
    public function getSubject()
    {
        return $this->subject;
    }

    /**
     * setSubject
     *
     * @param string $subject New value
     *
     * @return Task $this
     */
    public function setSubject($subject)
    {
        $this->subject = $subject;
        return $this;
    }

    /**
     * getStartTime
     *
     * @return DateTime
     */
    public function getStartTime()
    {
        return $this->startTime;
    }

    /**
     * setStartTime
     *
     * @param DateTime $startTime New value
     *
     * @return Task $this
     */
    public function setStartTime($startTime)
    {
        $this->startTime = $startTime;
        return $this;
    }

    /**
     * getStartDate
     *
     * @return DateTime
     */
    public function getStartDate()
    {
        return $this->startDate;
    }

    /**
     * setStartDate
     *
     * @param DateTime $startDate New value
     *
     * @return Task $this
     */
    public function setStartDate($startDate)
    {
        $this->startDate = $startDate;
        return $this;
    }

    /**
     * getDueDate
     *
     * @return DateTime
     */
    public function getDueDate()
    {
        return $this->dueDate;
    }

    /**
     * setDueDate
     *
     * @param DateTime $dueDate New value
     *
     * @return Task $this
     */
    public function setDueDate($dueDate)
    {
        $this->dueDate = $dueDate;
        return $this;
    }

    /**
     * getDueTime
     *
     * @return DateTime
     */
    public function getDueTime()
    {
        return $this->dueTime;
    }

    /**
     * setDueTime
     *
     * @param DateTime $dueTime New value
     *
     * @return Task $this
     */
    public function setDueTime($dueTime)
    {
        $this->dueTime = $dueTime;
        return $this;
    }

    /**
     * isReminderSet
     *
     * @return boolean
     */
    public function isReminderSet()
    {
        return $this->reminderSet;
    }

    /**
     * setReminderSet
     *
     * @param boolean $reminderSet New value
     *
     * @return Task $this
     */
    public function setReminderSet($reminderSet)
    {
        $this->reminderSet = $reminderSet;
        return $this;
    }

    /**
     * getReminderDate
     *
     * @return DateTime
     */
    public function getReminderDate()
    {
        return $this->reminderDate;
    }

    /**
     * setReminderDate
     *
     * @param DateTime $reminderDate New value
     *
     * @return Task $this
     */
    public function setReminderDate($reminderDate)
    {
        $this->reminderDate = $reminderDate;
        return $this;
    }

    /**
     * getStatus
     *
     * @return string
     */
    public function getStatus()
    {
        return $this->status;
    }

    /**
     * setStatus
     *
     * @param string $status New value
     *
     * @return Task $this
     */
    public function setStatus($status)
    {
        $this->status = $status;
        return $this;
    }

    /**
     * getPriority
     *
     * @return string
     */
    public function getPriority()
    {
        return $this->priority;
    }

    /**
     * setPriority
     *
     * @param string $priorty New value
     *
     * @return Task $this
     */
    public function setPriority($priority)
    {
        $this->priority = $priority;
        return $this;
    }

    /**
     * getProgress
     *
     * @return string
     */
    public function getProgress()
    {
        return $this->progress;
    }

    /**
     * setProgress
     *
     * @param string $progress New value
     *
     * @return Task $this
     */
    public function setProgress($progress)
    {
        $this->progress = $progress;
        return $this;
    }

    /**
     * getNotes
     *
     * @return string
     */
    public function getNotes()
    {
        return $this->notes;
    }

    /**
     * setNotes
     *
     * @param array $notes New value
     *
     * @return Task $this
     */
    public function setNotes(array $notes)
    {
        $this->notes = $notes;
        return $this;
    }

    /**
     * getResource
     *
     * @return Resource
     */
    public function getResource()
    {
        return $this->resource;
    }

    /**
     * setResource
     *
     * @param Resource $resource New value
     *
     * @return Task $this
     */
    public function setResource(Resource $resource)
    {
        $this->resource = $resource;
        return $this;
    }

    /**
     * getSupportCall
     *
     * @return SupportCall
     */
    public function getSupportCall()
    {
        return $this->supportCall;
    }

    /**
     * getJob
     *
     * @return Job
     */
    public function getJob()
    {
        return $this->job;
    }
}