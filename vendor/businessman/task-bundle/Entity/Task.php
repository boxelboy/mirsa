<?php
namespace BusinessMan\Bundle\TaskBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use JMS\Serializer\Annotation as Serializer;

/**
 * Task
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/businessmanportal/TaskBundle
 *
 * @ORM\Entity()
 * @ORM\Table(name="Scheduler_Tasks")
 *
 * @Serializer\ExclusionPolicy("all")
 * @Serializer\XmlRoot("task")
 */
class Task
{
    /**
     * @var integer
     *
     * @ORM\Id
     * @ORM\Column(name="Task_ID", type="integer")
     * @ORM\GeneratedValue(strategy="CUSTOM")
     * @ORM\CustomIdGenerator(class="Synergize\Bundle\DbalBundle\Driver\IdentityGenerator")
     *
     * @Serializer\Expose
     * @Serializer\Type("integer")
     */
    protected $id;

    /**
     * @var string
     *
     * @ORM\Column(name="Subject", type="string")
     *
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $subject;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="Start_Date", type="date")
     *
     * @Serializer\Expose
     * @Serializer\Type("DateTime<'Y-m-d'>")
     */
    protected $startDate;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="Start_Time", type="time")
     *
     * @Serializer\Expose
     * @Serializer\Type("DateTime<'H:i:s'>")
     */
    protected $startTime;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="Due_Date", type="date")
     *
     * @Serializer\Expose
     * @Serializer\Type("DateTime<'Y-m-d'>")
     */
    protected $dueDate;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="Due_Time", type="time")
     *
     * @Serializer\Expose
     * @Serializer\Type("DateTime<'H:i:s'>")
     */
    protected $dueTime;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="Reminder_TS", type="timestamp")
     *
     * @Serializer\Expose
     * @Serializer\Type("DateTime<'Y-m-d H:i:s'>")
     */
    protected $reminder;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="Last_Update_Timestamp", type="datetime")
     */
    protected $lastModified;

    /**
     * @var boolean
     *
     * @ORM\Column(name="Reminder_Set", type="boolean")
     *
     * @Serializer\Expose
     * @Serializer\Type("boolean")
     */
    protected $reminderSet;

    /**
     * @var string
     *
     * @ORM\Column(name="Status", type="string")
     *
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $status;

    /**
     * @var string
     *
     * @ORM\Column(name="Priority", type="string")
     */
    protected $priority;

    /**
     * @var string
     *
     * @ORM\Column(name="Progress", type="string")
     */
    protected $progress;

    /**
     * @var array|\Computech\Bundle\CommonBundle\Type\NotesEntry
     *
     * @ORM\Column(name="Notes", type="notes")
     */
    protected $notes;

    /**
     * @var \Scheduler\Bundle\CommonBundle\Entity\Resource
     *
     * @ORM\ManyToOne(targetEntity="Scheduler\Bundle\CommonBundle\Entity\Resource")
     * @ORM\JoinColumn(name="Resource_ID", referencedColumnName="Resource_ID")
     */
    protected $resource;

    /**
     * @var \BusinessMan\Bundle\JobBundle\Entity\Job
     *
     * @ORM\ManyToOne(targetEntity="BusinessMan\Bundle\JobBundle\Entity\Job")
     * @ORM\JoinColumn(name="Job_No", referencedColumnName="Job_Number")
     */
    protected $job;

    /**
     * @var \BusinessMan\Bundle\ClientBundle\Entity\Client
     *
     * @ORM\ManyToOne(targetEntity="BusinessMan\Bundle\ClientBundle\Entity\Client")
     * @ORM\JoinColumn(name="Client_ID", referencedColumnName="Account_No")
     */
    protected $client;

    /**
     * @return \BusinessMan\Bundle\ClientBundle\Entity\Client
     */
    public function getClient()
    {
        return $this->client;
    }

    /**
     * @return \DateTime
     */
    public function getDueDate()
    {
        return $this->dueDate;
    }

    /**
     * @return \DateTime
     */
    public function getDueTime()
    {
        return $this->dueTime;
    }

    /**
     * @return int
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
     * @return \DateTime
     */
    public function getLastModified()
    {
        return $this->lastModified;
    }

    /**
     * @return array|\Computech\Bundle\CommonBundle\Type\NotesEntry
     */
    public function getNotes()
    {
        return $this->notes;
    }

    /**
     * @return string
     */
    public function getPriority()
    {
        return $this->priority;
    }

    /**
     * @return string
     */
    public function getProgress()
    {
        return $this->progress;
    }

    /**
     * @return \DateTime
     */
    public function getReminder()
    {
        return $this->reminder;
    }

    /**
     * @return boolean
     */
    public function getReminderSet()
    {
        return $this->reminderSet;
    }

    /**
     * @return \Scheduler\Bundle\CommonBundle\Entity\Resource
     */
    public function getResource()
    {
        return $this->resource;
    }

    /**
     * @return \DateTime
     */
    public function getStartDate()
    {
        return $this->startDate;
    }

    /**
     * @return \DateTime
     */
    public function getStartTime()
    {
        return $this->startTime;
    }

    /**
     * @return string
     */
    public function getStatus()
    {
        return $this->status;
    }

    /**
     * @return string
     */
    public function getSubject()
    {
        return $this->subject;
    }

    /**
     * @param \DateTime $dueDate
     */
    public function setDueDate($dueDate)
    {
        $this->dueDate = $dueDate;
    }

    /**
     * @param \DateTime $dueTime
     */
    public function setDueTime($dueTime)
    {
        $this->dueTime = $dueTime;
    }

    /**
     * @param \BusinessMan\Bundle\JobBundle\Entity\Job $job
     */
    public function setJob($job)
    {
        $this->job = $job;
    }

    /**
     * @param string $priority
     */
    public function setPriority($priority)
    {
        $this->priority = $priority;
    }

    /**
     * @param string $progress
     */
    public function setProgress($progress)
    {
        $this->progress = $progress;
    }

    /**
     * @param \DateTime $reminder
     */
    public function setReminder($reminder)
    {
        $this->reminder = $reminder;
    }

    /**
     * @param boolean $reminderSet
     */
    public function setReminderSet($reminderSet)
    {
        $this->reminderSet = $reminderSet;
    }

    /**
     * @param \Scheduler\Bundle\CommonBundle\Entity\Resource $resource
     */
    public function setResource($resource)
    {
        $this->resource = $resource;
    }

    /**
     * @param \DateTime $startDate
     */
    public function setStartDate($startDate)
    {
        $this->startDate = $startDate;
    }

    /**
     * @param \DateTime $startTime
     */
    public function setStartTime($startTime)
    {
        $this->startTime = $startTime;
    }

    /**
     * @param string $status
     */
    public function setStatus($status)
    {
        $this->status = $status;
    }

    /**
     * @param string $subject
     */
    public function setSubject($subject)
    {
        $this->subject = $subject;
    }
}
