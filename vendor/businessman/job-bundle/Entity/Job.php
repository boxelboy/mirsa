<?php
namespace BusinessMan\Bundle\JobBundle\Entity;

use Computech\Bundle\CommonBundle\Type\NotesEntry;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use JMS\Serializer\Annotation as Serializer;

/**
 * Job
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/businessmanportal/JobBundle
 *
 * @ORM\Entity()
 * @ORM\Table(name="Jobs")
 *
 * @Serializer\ExclusionPolicy("all")
 * @Serializer\XmlRoot("job")
 */
class Job
{
    /**
     * @var int
     *
     * @ORM\Id
     * @ORM\Column(name="Job_Number", type="integer")
     * @ORM\GeneratedValue(strategy="CUSTOM")
     * @ORM\CustomIdGenerator(class="Synergize\Bundle\DbalBundle\Driver\IdentityGenerator")
     *
     * @Serializer\Expose
     * @Serializer\Type("integer")
     */
    protected $id;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="Date_Start_Planned", type="date")
     * @Serializer\Expose
     */
    protected $plannedStartDate;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="Date_Finish_Planned", type="date")
     * @Serializer\Expose
     */
    protected $plannedEndDate;

    /**
     * @var int
     *
     * @ORM\Column(name="Time_Planned_Start_Hrs", type="integer")
     */
    protected $plannedStartTimeHours;

    /**
     * @var int
     *
     * @ORM\Column(name="Time_Planned_Start_Mins", type="integer")
     */
    protected $plannedStartTimeMinutes;

    /**
     * @var int
     *
     * @ORM\Column(name="Time_Planned_Finish_Hrs", type="integer")
     */
    protected $plannedEndTimeHours;

    /**
     * @var int
     *
     * @ORM\Column(name="Time_Planned_Finish_Mins", type="integer")
     */
    protected $plannedEndTimeMinutes;

    /**
     * @var string
     *
     * @ORM\Column(name="Job_Description", type="string")
     *
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $description;

    /**
     * @var string
     *
     * @ORM\Column(name="Job_Detail", type="string")
     */
    protected $detail;

    /**
     * @var array|\Computech\Bundle\CommonBundle\Type\NotesEntry
     *
     * @ORM\Column(name="Job_Notes", type="notes")
     */
    protected $notes;

    /**
     * @var string
     *
     * @ORM\Column(name="Job_Priority", type="string")
     */
    protected $priority;

    /**
     * @var string
     *
     * @ORM\Column(name="Job_Progress", type="string")
     */
    protected $progress;

    /**
     * @var string
     *
     * @ORM\Column(name="Job_Status", type="string")
     *
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $status;

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
     * @var string
     *
     * @ORM\Column(name="Job_Type", type="string")
     */
    protected $type;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="Mod_Timestamp", type="timestamp")
     *
     * @Serializer\Expose
     * @Serializer\Type("DateTime<'Y-m-d H:i:s'>")
     */
    protected $lastModified;

    /**
     * @var \BusinessMan\Bundle\ClientBundle\Entity\Client
     *
     * @ORM\ManyToOne(targetEntity="Mirsa\Bundle\MirsaBundle\Entity\Client", inversedBy="jobs")
     * @ORM\JoinColumn(name="Account_No", referencedColumnName="Account_No")
     *
     * @Serializer\Expose
     * @Serializer\Type("BusinessMan\Bundle\ClientBundle\Entity\Client")
     */
    protected $client;

    /**
     * @var \BusinessMan\Bundle\StaffBundle\Entity\Staff
     *
     * @ORM\ManyToOne(targetEntity="BusinessMan\Bundle\StaffBundle\Entity\Staff")
     * @ORM\JoinColumn(name="Job_ManagerID", referencedColumnName="Staff_ID")
     */
    protected $manager;

    /**
     * @var Job
     *
     * @ORM\ManyToOne(targetEntity="Job", inversedBy="children")
     * @ORM\JoinColumn(name="Job_No_Parent", referencedColumnName="Job_Number", nullable=true)
     */
    protected $parent;

    /**
     * @var Job
     *
     * @ORM\OneToOne(targetEntity="Job")
     * @ORM\JoinColumn(name="Job_No_Master", referencedColumnName="Job_Number", nullable=true)
     */
    protected $master;

    /**
     * @var ArrayCollection|Job
     *
     * @ORM\OneToMany(targetEntity="Job", mappedBy="parent", cascade={"remove"})
     */
    protected $children;

    /**
     * @var ArrayCollection|Timesheet
     *
     * @ORM\OneToMany(targetEntity="Timesheet", mappedBy="job", cascade={"remove"})
     */
    protected $timesheets;

    /**
     * @var ArrayCollection|Assignment
     *
     * @ORM\OneToMany(targetEntity="Assignment", mappedBy="job", cascade={"remove"})
     */
    protected $assignments;

    /**
     * @ORM\OneToOne(targetEntity="Mirsa\Bundle\MirsaBundle\Entity\Project", inversedBy="jobs")
     * @ORM\JoinColumn(name="Project_ID", referencedColumnName="Project_ID")
     */
    protected $project;

    /**
     * @ORM\OneToMany(targetEntity="Mirsa\Bundle\MirsaBundle\Entity\JobComment", mappedBy="job")
     */
    protected $comments;

    public function __construct()
    {
        $this->created = new \DateTime();

        $this->children = new ArrayCollection();
        $this->timesheets = new ArrayCollection();
        $this->assignments = new ArrayCollection();
    }

    /**
     * @return string
     */
    public function getDisplayName()
    {
        return sprintf('[%s] %s', $this->getId(), $this->getDescription());
    }

    /**
     * @return \BusinessMan\Bundle\JobBundle\Entity\Assignment|\Doctrine\Common\Collections\ArrayCollection
     */
    public function getAssignments()
    {
        return $this->assignments;
    }

    /**
     * @return \BusinessMan\Bundle\JobBundle\Entity\Job|\Doctrine\Common\Collections\ArrayCollection
     */
    public function getChildren()
    {
        return $this->children;
    }

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
    public function getCreated()
    {
        return $this->created;
    }

    /**
     * @return string
     */
    public function getDescription()
    {
        return $this->description;
    }

    /**
     * @return string
     */
    public function getDetail()
    {
        return $this->detail;
    }

    /**
     * @return int
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
     * @return \BusinessMan\Bundle\StaffBundle\Entity\Staff
     */
    public function getManager()
    {
        return $this->manager;
    }

    /**
     * @return \BusinessMan\Bundle\JobBundle\Entity\Job
     */
    public function getMaster()
    {
        return $this->master;
    }

    /**
     * @return array|\Computech\Bundle\CommonBundle\Type\NotesEntry
     */
    public function getNotes()
    {
        return $this->notes;
    }

    /**
     * @return \BusinessMan\Bundle\JobBundle\Entity\Job
     */
    public function getParent()
    {
        return $this->parent;
    }

    /**
     * @return \DateTime
     */
    public function getPlannedEndDate()
    {
        return $this->plannedEndDate;
    }

    /**
     * @return int
     */
    public function getPlannedEndTimeHours()
    {
        return $this->plannedEndTimeHours;
    }

    /**
     * @return int
     */
    public function getPlannedEndTimeMinutes()
    {
        return $this->plannedEndTimeMinutes;
    }

    /**
     * @return \DateTime
     */
    public function getPlannedStartDate()
    {
        return $this->plannedStartDate;
    }

    /**
     * @return int
     */
    public function getPlannedStartTimeHours()
    {
        return $this->plannedStartTimeHours;
    }

    /**
     * @return int
     */
    public function getPlannedStartTimeMinutes()
    {
        return $this->plannedStartTimeMinutes;
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
     * @return string
     */
    public function getStatus()
    {
        return $this->status;
    }

    /**
     * @return \BusinessMan\Bundle\JobBundle\Entity\Timesheet|\Doctrine\Common\Collections\ArrayCollection
     */
    public function getTimesheets()
    {
        return $this->timesheets;
    }

    /**
     * @return string
     */
    public function getType()
    {
        return $this->type;
    }

    public function getProject()
    {
        return $this->project;
    }

    /**
     * @param NotesEntry $notes
     */
    public function addNotes(NotesEntry $notes)
    {
        $this->notes[] = $notes;
    }

    /**
     * @param string $assemblyQuantity
     */
    public function setAssemblyQuantity($assemblyQuantity)
    {
        $this->assemblyQuantity = $assemblyQuantity;
    }

    /**
     * @param string $assemblyQuantityCompleted
     */
    public function setAssemblyQuantityCompleted($assemblyQuantityCompleted)
    {
        $this->assemblyQuantityCompleted = $assemblyQuantityCompleted;
    }

    /**
     * @param string $assemblyStatus
     */
    public function setAssemblyStatus($assemblyStatus)
    {
        $this->assemblyStatus = $assemblyStatus;
    }

    /**
     * @param \BusinessMan\Bundle\ClientBundle\Entity\Client $client
     */
    public function setClient($client)
    {
        $this->client = $client;
    }

    /**
     * @param string $description
     */
    public function setDescription($description)
    {
        $this->description = $description;
    }

    /**
     * @param string $detail
     */
    public function setDetail($detail)
    {
        $this->detail = $detail;
    }

    /**
     * @param string $inspectionAuthorization
     */
    public function setInspectionAuthorization($inspectionAuthorization)
    {
        $this->inspectionAuthorization = $inspectionAuthorization;
    }

    /**
     * @param string $inspectionType
     */
    public function setInspectionType($inspectionType)
    {
        $this->inspectionType = $inspectionType;
    }

    /**
     * @param \BusinessMan\Bundle\StaffBundle\Entity\Staff $manager
     */
    public function setManager($manager)
    {
        $this->manager = $manager;
    }

    /**
     * @param \BusinessMan\Bundle\JobBundle\Entity\Job $master
     */
    public function setMaster($master)
    {
        $this->master = $master;
    }

    /**
     * @param \BusinessMan\Bundle\JobBundle\Entity\Job $parent
     */
    public function setParent($parent)
    {
        $this->parent = $parent;
    }

    /**
     * @param \DateTime $plannedEndDate
     */
    public function setPlannedEndDate($plannedEndDate)
    {
        $this->plannedEndDate = $plannedEndDate;
    }

    /**
     * @param int $plannedEndTimeHours
     */
    public function setPlannedEndTimeHours($plannedEndTimeHours)
    {
        $this->plannedEndTimeHours = $plannedEndTimeHours;
    }

    /**
     * @param int $plannedEndTimeMinutes
     */
    public function setPlannedEndTimeMinutes($plannedEndTimeMinutes)
    {
        $this->plannedEndTimeMinutes = $plannedEndTimeMinutes;
    }

    /**
     * @param \DateTime $plannedStartDate
     */
    public function setPlannedStartDate($plannedStartDate)
    {
        $this->plannedStartDate = $plannedStartDate;
    }

    /**
     * @param int $plannedStartTimeHours
     */
    public function setPlannedStartTimeHours($plannedStartTimeHours)
    {
        $this->plannedStartTimeHours = $plannedStartTimeHours;
    }

    /**
     * @param int $plannedStartTimeMinutes
     */
    public function setPlannedStartTimeMinutes($plannedStartTimeMinutes)
    {
        $this->plannedStartTimeMinutes = $plannedStartTimeMinutes;
    }

    /**
     * @param string $priority
     */
    public function setPriority($priority)
    {
        $this->priority = $priority;
    }

    /**
     * @param string $problemDescription
     */
    public function setProblemDescription($problemDescription)
    {
        $this->problemDescription = $problemDescription;
    }

    /**
     * @param string $progress
     */
    public function setProgress($progress)
    {
        $this->progress = $progress;
    }

    /**
     * @param int $quantityAccepted
     */
    public function setQuantityAccepted($quantityAccepted)
    {
        $this->quantityAccepted = $quantityAccepted;
    }

    /**
     * @param int $quantityInspected
     */
    public function setQuantityInspected($quantityInspected)
    {
        $this->quantityInspected = $quantityInspected;
    }

    /**
     * @param int $quantityRejected
     */
    public function setQuantityRejected($quantityRejected)
    {
        $this->quantityRejected = $quantityRejected;
    }

    /**
     * @param int $quantityToInspect
     */
    public function setQuantityToInspect($quantityToInspect)
    {
        $this->quantityToInspect = $quantityToInspect;
    }

    /**
     * @param string $siteName
     */
    public function setSiteName($siteName)
    {
        $this->siteName = $siteName;
    }

    /**
     * @param string $sku
     */
    public function setSku($sku)
    {
        $this->sku = $sku;
    }

    /**
     * @param string $status
     */
    public function setStatus($status)
    {
        $this->status = $status;
    }

    /**
     * @param int $totalJobCosts
     */
    public function setTotalJobCosts($totalJobCosts)
    {
        $this->totalJobCosts = $totalJobCosts;
    }

    /**
     * @param int $totalTimesheetNormalHours
     */
    public function setTotalTimesheetNormalHours($totalTimesheetNormalHours)
    {
        $this->totalTimesheetNormalHours = $totalTimesheetNormalHours;
    }

    /**
     * @param int $totalTimesheetOvertimeHours
     */
    public function setTotalTimesheetOvertimeHours($totalTimesheetOvertimeHours)
    {
        $this->totalTimesheetOvertimeHours = $totalTimesheetOvertimeHours;
    }

    /**
     * @param string $type
     */
    public function setType($type)
    {
        $this->type = $type;
    }

    /**
     * @param string $workLocation
     */
    public function setWorkLocation($workLocation)
    {
        $this->workLocation = $workLocation;
    }
}
