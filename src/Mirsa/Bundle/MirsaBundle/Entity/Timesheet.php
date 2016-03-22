<?php

namespace Mirsa\Bundle\MirsaBundle\Entity;

use Doctrine\ORM\Mapping as ORM,
    Symfony\Component\Validator\Constraints as Assert,
    JMS\Serializer\Annotation as Serializer;

/**
 * Timesheet entity
 *
 * @author cps
 * @link   http://webserver:8090/display/BMAN/Portal+Documentation
 *
 * @ORM\Entity()
 * @ORM\Table(name="Staff_Timesheet")
 *
 * @Serializer\XmlRoot("timesheet")
 * @Serializer\ExclusionPolicy("all")
 */
class Timesheet
{
    /**
     * @ORM\Id
     * @ORM\Column(name="Record_ID", type="string")
     * @Serializer\Expose
     * @Serializer\XmlAttribute
     */
    protected $id;

    /**
     * @ORM\ManyToOne(targetEntity="WorkOrder", inversedBy="timesheets")
     * @ORM\JoinColumn(name="Job_Number", referencedColumnName="Job_Number")
     */
    protected $workOrder;

    /**
     * @ORM\ManyToOne(targetEntity="SupportCall", inversedBy="items")
     * @ORM\JoinColumn(name="Support_Call_ID", referencedColumnName="Key_Primary")
     */
    protected $supportCall;

    /**
     * @ORM\ManyToOne(targetEntity="Staff")
     * @ORM\JoinColumn(name="Authorised_By", referencedColumnName="Staff_ID")
     */
    protected $authoriser;

    /**
     * @ORM\ManyToOne(targetEntity="Staff", inversedBy="timesheets")
     * @ORM\JoinColumn(name="Key_Staff_ID", referencedColumnName="Staff_ID")
     * @Serializer\Expose
     */
    protected $staff;

    /**
     * @ORM\ManyToOne(targetEntity="Staff")
     * @ORM\JoinColumn(name="Created_By_Staff_ID", referencedColumnName="Staff_ID")
     */
    protected $creator;

    /**
     * @ORM\Column(name="TimeValue", type="string")
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $timeValue;

    /**
     * @ORM\Column(name="Category", type="string")
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $category;

    /**
     * @ORM\Column(name="Authorised", type="string")
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $authorised;

    /**
     * @ORM\Column(name="Authorised_Date", type="date")
     * @Serializer\Expose
     * @Serializer\Type("DateTime<'Y-m-dO'>")
     */
    protected $authorisedDate;

    /**
     * @ORM\Column(name="Notes", type="string")
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $notes;

    /**
     * @ORM\Column(name="Timesheet_Type", type="string")
     */
    protected $type;

    /**
     * @ORM\Column(name="Timing_Subject", type="string")
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $subject;

    /**
     * @ORM\Column(name="Timing_Subject_Sub_Heading", type="string")
     */
    protected $subHeading;

    /**
     * @ORM\Column(name="Record_Type", type="string")
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $recordType;

    /**
     * @ORM\Column(name="Date_From", type="date")
     * @Assert\Date(message="Please enter a valid date in the format dd/mm/yyyy")
     * @Serializer\Expose
     * @Serializer\Type("DateTime<'m-d-Y'>")
     */
    protected $dateFrom;

    /**
     * @ORM\Column(name="Time_From", type="string")
     * @Serializer\Expose
     */
    protected $timeFrom;

    /**
     * @ORM\Column(name="Date_To", type="date")
     * @Assert\Date(message="Please enter a valid date in the format dd/mm/yyyy")
     * @Serializer\Expose
     * @Serializer\Type("DateTime<'m-d-Y'>")
     */
    protected $dateTo;

    /**
     * @ORM\Column(name="TS_Start", type="timestamp")
     * @Serializer\Expose
     * @Serializer\Type("DateTime<'Y-m-dO'>")
     */
    protected $dateStart;    
    
    /**
     * @ORM\Column(name="Time_To", type="string")
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $timeTo;

    /**
     * @ORM\Column(name="Working_Hours_Total", type="decimal")
     * @Serializer\Expose
     */
    protected $totalHours;
    
    /**
     * @ORM\Column(name="Working_Hours_By_Staff_Settings", type="decimal")
     * @Serializer\Expose
     */
    protected $normalHours;
    
    /**
     * @ORM\Column(name="Total_Hours_Overtime", type="decimal")
     * @Serializer\Expose
     */
    protected $overtimeHours;    
    
    /**
     * @ORM\Column(name="StaffName", type="string")
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $staffFullname;        
    
    public function __construct()
    {
        $this->dateFrom = new \DateTime('now');
    }

    public function getId()
    {
        return $this->id;
    }

    public function getTimeValue()
    {
        return $this->timeValue;
    }

    public function setTimeValue($timeValue)
    {
        $this->timeValue = $timeValue;
        return $this;
    }

    public function setCategory($category)
    {
        $this->category = $category;
        return $this;
    }

    public function getworkOrder()
    {
        return $this->workOrder;
    }

    public function setJob($workOrder)
    {
        $this->workOrder = $workOrder;
        return $this;
    }

    public function getSupportCall()
    {
        return $this->supportCall;
    }

    public function setSupportCall($supportCall)
    {
        $this->supportCall = $supportCall;
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

    public function getAuthoriser()
    {
        return $this->authoriser;
    }

    public function getCreator()
    {
        return $this->creator;
    }

    public function setCreator($creator)
    {
        $this->creator = $creator;
        return $this;
    }

    public function getAuthorised()
    {
        return $this->authorised;
    }

    public function getAuthorisedDate()
    {
        return $this->authorisedDate;
    }

    public function getCategory()
    {
        return $this->category;
    }

    public function getNotes()
    {
        return $this->notes;
    }

    public function setNotes($notes)
    {
        $this->notes = $notes;
        return $this;
    }

    public function getType()
    {
        return $this->type;
    }

    public function getSubject()
    {
        return $this->subject;
    }

    public function getSubHeading()
    {
        return $this->subHeading;
    }

    public function getRecordType()
    {
        return $this->recordType;
    }

    public function getDateFrom()
    {
        return $this->dateFrom;
    }

    public function setDateFrom($dateFrom)
    {
        $this->dateFrom = $dateFrom;
        return $this;
    }

    public function getTimeFrom()
    {
        return $this->timeFrom;
    }

    public function setTimeFrom($timeFrom)
    {
        $this->timeFrom = $timeFrom;
        return $this;
    }

    public function getTimeTo()
    {
        return $this->timeTo;
    }

    public function setTimeTo($timeTo)
    {
        $this->timeTo = $timeTo;
        return $this;
    }
    
    public function getTotalHours()
    {
        return $this->totalHours;
    }

    public function getNormalHours()
    {
        return $this->normalHours;
    }
    
    public function getOvertimeHours()
    {
        return $this->overtimeHours;
    }
    
    public function getDateTo()
    {
        return $this->dateTo;
    }    

    public function getStaffFullname()
    {
        return $this->staffFullname;
    }    

    function getDateStart() {
        return $this->dateStart;
    }


}

