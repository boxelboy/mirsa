<?php
/**
 * Job
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://webserver:8090/display/BMAN/Portal+Documentation
 */
namespace Mirsa\Bundle\MirsaBundle\Entity;

use Doctrine\ORM\Mapping as ORM,
    Symfony\Component\Validator\Constraints as Assert,
    JMS\Serializer\Annotation as Serializer;

/**
 * Job entity
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://webserver:8090/display/BMAN/Portal+Documentation
 *
 * @ORM\Entity()
 * @ORM\Table(name="Jobs")
 *
 * @Serializer\XmlRoot("job")
 * @Serializer\ExclusionPolicy("all")
 *
 */
class ActivityInspection
{
    /**
     * Job number
     *
     * @ORM\Id
     * @ORM\Column(name="Job_Number", type="integer")
     * @Serializer\Expose
     * @Serializer\XmlAttribute
     */
    protected $id;
    
    /**
     * @ORM\Column(name="Group_ID", type="string")
     */
    protected $groupId;

    /**
     * Planned start date
     *
     * @ORM\Column(name="Date_Start_Actual", type="date")
     * @Serializer\Expose
     * @Serializer\Type("DateTime<'Y-m-dO'>")* 
     */
    protected $plannedStartDate;

    /**
     * @ORM\Column(name="Date_Finish_Planned", type="date")
     * @Serializer\Expose
     * @Serializer\Type("DateTime<'Y-m-dO'>")
     */
    protected $plannedEndDate;

    /**
     * @ORM\Column(name="Time_Planned_Start_Hrs", type="integer")
     * @Serializer\Expose
     * @Serializer\Type("integer")
     */
    protected $plannedStartTimeHours;

    /**
     * @ORM\Column(name="Time_Planned_Start_Mins", type="integer")
     * @Serializer\Expose
     * @Serializer\Type("integer")
     */
    protected $plannedStartTimeMinutes;

    /**
     * @ORM\Column(name="Time_Planned_Finish_Hrs", type="integer")
     * @Serializer\Expose
     * @Serializer\Type("integer")
     */
    protected $plannedEndTimeHours;

    /**
     * @ORM\Column(name="Time_Planned_Finish_Mins", type="integer")
     * @Serializer\Expose
     * @Serializer\Type("integer")
     */
    protected $plannedEndTimeMinutes;

    /**
     * @ORM\OneToMany(targetEntity="Timesheet", mappedBy="job")
     */
    protected $timesheets;

    /**
     * @ORM\OneToMany(targetEntity="JobComment", mappedBy="job")
     */
    protected $comments;

    /**
     * @ORM\ManyToOne(targetEntity="Staff")
     * @ORM\JoinColumn(name="Job_ManagerID", referencedColumnName="Staff_ID")
     */
    protected $manager;

    /**
     * @ORM\OneToMany(targetEntity="BusinessMan\Bundle\JobBundle\Entity\Job", mappedBy="parent")
     */
    protected $children;

    /**
     * @ORM\ManyToOne(targetEntity="BusinessMan\Bundle\JobBundle\Entity\Job", inversedBy="children")
     * @ORM\JoinColumn(name="Job_No_Parent", referencedColumnName="Job_Number")
     */
    protected $parent;

    /**
     * @ORM\OneToOne(targetEntity="BusinessMan\Bundle\JobBundle\Entity\Job")
     * @ORM\JoinColumn(name="Job_No_Master", referencedColumnName="Job_Number")
     */
    protected $master;

    /**
     * @ORM\ManyToMany(targetEntity="Resource")
     * @ORM\JoinTable(name="Schedule",
     *      joinColumns={@ORM\JoinColumn(name="Job_Number", referencedColumnName="Job_Number")},
     *      inverseJoinColumns={@ORM\JoinColumn(name="Resource_ID", referencedColumnName="Resource_ID")}
     *  )
     */
    protected $resources;

    /**
     * Description of the job
     *
     * @ORM\Column(name="Job_Description", type="string")
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $description;

    /**
     * More details about the job
     *
     * @ORM\Column(name="Job_Detail", type="string")
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $detail;

    /**
     * @ORM\Column(name="Job_Notes", type="notes")
     */
    protected $notes;

    /**
     * @ORM\Column(name="Job_Priority", type="string")
     */
    protected $priority;

    /**
     * @ORM\Column(name="Job_Progress", type="string")
     */
    protected $progress;

    /**
     * Status
     *
     * @ORM\Column(name="Job_Status", type="string")
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $status;

    /**
     * Date the job was created
     *
     * @ORM\Column(name="Creation_Date", type="date")
     * @Serializer\Expose
     * @Serializer\Type("DateTime")
     */
    protected $created;
    
    /**
     * @ORM\Column(name="Created_By_UCN", type="string")
     */
    protected $createdBy;    

    /**
     * Estimated time to complete the job (in hours)
     *
     * @ORM\Column(name="Estimate_Time_For_Job_Total", type="string")
     * @Serializer\Expose
     * @Serializer\Type("double")
     */
    protected $estimatedTimeTotal;

    /**
     * Time remaining of the estimate (in hours)
     *
     * @ORM\Column(name="Estimate_Time_For_Job_Total_Remaining", type="string")
     * @Serializer\Expose
     * @Serializer\Type("double")
     */
    protected $estimatedTimeTotalRemaining;

    /**
     * @ORM\ManyToOne(targetEntity="Client", inversedBy="jobs")
     * @ORM\JoinColumn(name="Account_No", referencedColumnName="Account_No")
     */
    protected $client;

    /**
     * @ORM\OneToOne(targetEntity="Project", inversedBy="jobs")
     * @ORM\JoinColumn(name="Project_ID", referencedColumnName="Project_ID")
     */
    protected $project;
    
    /**
     * @ORM\Column(name="Job_Type", type="string")
     * @Serializer\Type("string")
     * @Serializer\Expose
     */
    protected $type;
    
    /**
     * @ORM\Column(name="Site_Name", type="string")
     */
    protected $siteName;
    
    /**
     * @ORM\Column(name="Work_Location", type="string")
     */
    protected $workLocation;

    /**
     * @ORM\Column(name="Inspection_Authorization", type="string")
     */
    protected $inspectionAuthorization;

    /**
     * @ORM\Column(name="Problem_Description", type="string")
     */
    protected $problemDescription;
    
    /**
     * @ORM\Column(name="Inspection_Job_ID", type="string")
     */
    protected $inspectionId;    
    
    /**
     * @ORM\Column(name="Inspection_Job_Type", type="string")
     */
    protected $inspectionType;

    /**
     * @ORM\Column(name="Qty_To_Inspect", type="integer")
     */
    protected $qtyToInspect;

    /**
     * @ORM\Column(name="Total_Qty_Inspected", type="integer")
     * @Serializer\Expose
     */
    protected $qtyInspected;

    /**
     * @ORM\Column(name="Total_Quantity_Inspected", type="integer")
     */
    protected $totalQuantityInspected;
    
    /**
     * @ORM\Column(name="Total_Qty_Rejected", type="integer")
     * @Serializer\Expose
     */
    protected $qtyRejected;

    /**
     * @ORM\Column(name="Total_Quantity_Rejected", type="integer")
     */
    protected $totalQuantityRejected;
    
    /**
     * @ORM\Column(name="Total_Qty_Accepted", type="integer")
     */
    protected $qtyAccepted;
    
    /**
     * @ORM\OneToMany(targetEntity="WorkOrderInspectionLineItem", mappedBy="job")
     */
    protected $workOrders;

    /**
     * @ORM\Column(name="Stk_Code", type="string")
     * @Serializer\Expose
    */
    protected $sku;

    /**
     * @ORM\Column(name="Assembly_Status", type="string")
     * @Serializer\Expose
     */
    protected $assemblyStatus;

    /**
     * @ORM\Column(name="Assembly_Qty", type="integer")
     * @Serializer\Expose
     */
    protected $assemblyQty;    

    /**
     * @ORM\Column(name="Total_Assembly_Quantity", type="integer")
     * @Serializer\Expose
     */
    protected $totalAssemblyQty;        
    
    /**
     * @ORM\Column(name="Assembly_Qty_Completed", type="integer")
     * @Serializer\Expose
    */
    protected $assemblyQtyCompleted;

    /**
     * @ORM\Column(name="Total_Assembly_Completed", type="integer")
       * @Serializer\Expose
    */
    protected $totalAssemblyCompleted;
    
    /**
     * @ORM\Column(name="Assembly_Qty_Quarantined", type="integer")
      * @Serializer\Expose
    */
    protected $assemblyQtyQuarantined;             

    /**
     * @ORM\Column(name="Total_Assembly_Quarantined", type="integer")
       * @Serializer\Expose
    */
    protected $totalAssemblyQuarantined;             
    
    /**
     * @ORM\Column(name="Assembly_Pre_Built", type="integer")
     */
    protected $assemblyPreBuilt;              

    /**
     * @ORM\Column(name="PPMLevel", type="integer")
    */
    protected $ppmLevel;              
    
    /**
     * @ORM\Column(name="Summary_Total_PPMLevel", type="integer")
    */
    protected $totalPPMLevel;              

    /**
     * @ORM\Column(name="PPMEfficiency", type="decimal")
     */
    protected $ppmEfficiency;             

    /**
     * @ORM\Column(name="Summary_Total_PPMEfficiency", type="decimal")
    */
    protected $totalPPMEfficiency;       
    
    /**
     * @ORM\Column(name="Job_Progress_Percent", type="integer")
     */
    protected $jobProgressPercent;    
    
    /**
     * @ORM\Column(name="Order_Number_Int", type="string")
      * @Serializer\Expose
     */
    protected $salesOrderNumber;
    
    /**
     * @ORM\OneToMany(targetEntity="StockQuantityHistory", mappedBy="job")
     */
    protected $stkQtyHistories;

    /**
     * @ORM\ManyToOne(targetEntity="Stock")
     * @ORM\JoinColumn(name="Stk_ID", referencedColumnName="Record_ID")
     */
    protected $stockDetails;    
    
    /**
     * @ORM\Column(name="Grand_Total_Jobs_Costs", type="integer")
     * @Serializer\Expose
     */
    protected $totalJobCosts;
    
    /**
     * @ORM\Column(name="Total_Timesheet_Normal_Hours", type="decimal")
     * @Serializer\Expose
     */
    protected $totalTimesheetNormalHours;
    
    /**
     * @ORM\Column(name="Total_TimeSheet_Overtime_Hours", type="decimal")
     * @Serializer\Expose
     */
    protected $totalTimesheetOvertimeHours;
    
    /**
     * @ORM\Column(name="Key_Trading_Company_Name", type="string")
     * @Serializer\Expose
    */
    protected $tradingCompany;

    /**
     * @ORM\Column(name="Job_Schedule_Req", type="string")
     * @Serializer\Expose
     */
    protected $scheduleRequired;

    
    /**
     * @ORM\Column(name="Customer_Name", type="string")
     * @Serializer\Expose
    */
    protected $customerName;    
    
    /**
     * Total Quantity Rejected Field 1
     *
     * @ORM\Column(name="Total_Qty_Rejected_Field1", type="integer")
     * @Serializer\Expose
     * @Serializer\Type("integer")
     */
    protected $customField1;    
    
    /**
     * Total Quantity Rejected Field 2
     *
     * @ORM\Column(name="Total_Qty_Rejected_Field2", type="integer")
     * @Serializer\Expose
     * @Serializer\Type("integer")
     */
    protected $customField2;    
    
    /**
     * Total Quantity Rejected Field 3
     *
     * @ORM\Column(name="Total_Qty_Rejected_Field3", type="integer")
     * @Serializer\Expose
     * @Serializer\Type("integer")
     */
    protected $customField3;    
    
    /**
     * Total Quantity Rejected Field 4
     *
     * @ORM\Column(name="Total_Qty_Rejected_Field4", type="integer")
     * @Serializer\Expose
     * @Serializer\Type("integer")
     */
    protected $customField4;    
    
    /**
     * Total Quantity Rejected Field 5
     *
     * @ORM\Column(name="Total_Qty_Rejected_Field5", type="integer")
     * @Serializer\Expose
     * @Serializer\Type("integer")
     */
    protected $customField5;    
    
    /**
     * Total Quantity Rejected Field 6
     *
     * @ORM\Column(name="Total_Qty_Rejected_Field6", type="integer")
     * @Serializer\Expose
     * @Serializer\Type("integer")
     */
    protected $customField6;    
    
    /**
     * Total Quantity Rejected Field 7
     *
     * @ORM\Column(name="Total_Qty_Rejected_Field7", type="integer")
     * @Serializer\Expose
     * @Serializer\Type("integer")
     */
    protected $customField7;        

    /**
     * Total Quantity Rejected Field 8
     *
     * @ORM\Column(name="Total_Qty_Rejected_Field8", type="integer")
     * @Serializer\Expose
     * @Serializer\Type("integer")
     */
    protected $customField8;        

    /**
     * Total Quantity Rejected Field 9
     *
     * @ORM\Column(name="Total_Qty_Rejected_Field9", type="integer")
     * @Serializer\Expose
     * @Serializer\Type("integer")
     */
    protected $customField9;        

    /**
     * Total Quantity Rejected Field 10
     *
     * @ORM\Column(name="Total_Qty_Rejected_Field10", type="integer")
     * @Serializer\Expose
     * @Serializer\Type("integer")
     */
    protected $customField10;            
    
    /**
     * @ORM\Column(name="Job_BOM_PDF", type="container")
     */
    protected $pdf;    

    public function getPdf()
    {
        return $this->pdf;
    }    
 
    public function getId()
    {
        return $this->id;
    }

    public function getGroupId()
    {
        return $this->groupId;
    }

    public function setGroupId($groupId)
    {
        $this->groupId = $groupId;
        return $this;
    }

    public function getPlannedStartDate()
    {
        return $this->plannedStartDate;
    }

    public function setPlannedStartDate($plannedStartDate)
    {
        $this->plannedStartDate = $plannedStartDate;
        return $this;
    }

    public function getPlannedEndDate()
    {
        return $this->plannedEndDate;
    }

    public function setPlannedEndDate($plannedEndDate)
    {
        $this->plannedEndDate = $plannedEndDate;
        return $this;
    }

    public function getPlannedStartTimeHours()
    {
        return $this->plannedStartTimeHours;
    }

    public function setPlannedStartTimeHours($plannedStartTimeHours)
    {
        $this->plannedStartTimeHours = $plannedStartTimeHours;
        return $this;
    }

    public function getPlannedStartTimeMinutes()
    {
        return $this->plannedStartTimeMinutes;
    }

    public function setPlannedStartTimeMinutes($plannedStartTimeMinutes)
    {
        $this->plannedStartTimeMinutes = $plannedStartTimeMinutes;
        return $this;
    }

    public function getPlannedEndTimeHours()
    {
        return $this->plannedEndTimeHours;
    }

    public function setPlannedEndTimeHours($plannedEndTimeHours)
    {
        $this->plannedEndTimeHours = $plannedEndTimeHours;
        return $this;
    }

    public function getPlannedEndTimeMinutes()
    {
        return $this->plannedEndTimeMinutes;
    }

    public function setPlannedEndTimeMinutes($plannedEndTimeMinutes)
    {
        $this->plannedEndTimeMinutes = $plannedEndTimeMinutes;
        return $this;
    }

    public function getManager()
    {
        return $this->manager;
    }

    public function setManager($manager)
    {
        $this->manager = $manager;
        return $this;
    }

    public function getChildren()
    {
        return $this->children;
    }

    public function setChildren(array $children)
    {
        $this->children = $children;
        return $this;
    }

    public function getTimesheets()
    {
        return $this->timesheets;
    }

    public function setTimesheets(array $timesheets)
    {
        $this->timesheets = $timesheets;
        return $this;
    }

    public function getComments()
    {
        return $this->comments;
    }

    public function setComments(array $comments)
    {
        $this->comments = $comments;
        return $this;
    }

    public function getParent()
    {
        return $this->parent;
    }

    public function setParent($parent)
    {
        $this->parent = $parent;
        return $this;
    }

    public function getMaster()
    {
        return $this->master;
    }

    public function setMaster($master)
    {
        $this->master = $master;
        return $this;
    }

    public function getDescription()
    {
        return $this->description;
    }

    public function setDescription($description)
    {
        $this->description = $description;
        return $this;
    }

    public function getDetail()
    {
        return $this->detail;
    }

    public function setDetail($detail)
    {
        $this->detail = $detail;
        return $this;
    }

    public function getNotes()
    {
        return $this->notes;
    }

    public function setNotes($notes)
    {
        $this->notes = $notes;
        return $notes;
    }

    public function getEstimatedTimeTotal()
    {
        return $this->estimatedTimeTotal;
    }

    public function getEstimatedTimeTotalRemaining()
    {
        return $this->estimatedTimeTotalRemaining;
    }

    public function getPercentageTimeUsed()
    {
        return 100 - (($this->estimatedTimeTotalRemaining / $this->estimatedTimeTotal) * 100);
    }

    public function getParsedNotes()
    {
        return is_array($this->notes) ? $this->notes : false;
    }

    public function getPriority()
    {
        return $this->priority;
    }

    public function setPriority($priority)
    {
        $this->priority = $priority;
        return $this;
    }

    public function getProgress()
    {
        return $this->progress;
    }

    public function setProgress($progress)
    {
        $this->progress = $progress;
        return $this;
    }

    public function getStatus()
    {
        return $this->status;
    }

    public function setStatus($status)
    {
        $this->status = $status;
        return $this;
    }

    public function getClient()
    {
        return $this->client;
    }

    public function setClient($client)
    {
        $this->client = $client;
        return $this;
    }

    public function getCreated()
    {
        return $this->created;
    }

    public function getResources()
    {
        return $this->resources;
    }

    public function getProject()
    {
        return $this->project;
    }

    public function __equals($object)
    {
        if (!$object instanceof Job) {
            return false;
        }

        if ($this->id != $object->getId()) {
            return false;
        }

        return true;
    }

    public function getType()
    {
        return $this->type;
    }
    
    public function getSiteName()
    {
        return $this->siteName;
    }    

    public function getWorkLocation()
    {
        return $this->workLocation;
    }    
        
    public function getInspectionAuthorization()
    {
        return $this->inspectionAuthorization;
    }    
    
    public function getProblemDescription()
    {
        return $this->problemDescription;
    }    
    
    public function getOtherRequirements()
    {
        return $this->otherRequirements;
    }    
    
    public function getInspectionType()
    {
        return $this->inspectionType;
    }    

    public function getQtyToInspect()
    {
        return $this->qtyToInspect;
    }    
    
    public function getQtyInspected()
    {
        return $this->qtyInspected;
    }    
    
    public function getQtyRejected()
    {
        return $this->qtyRejected;
    }    
    
    public function getQtyAccepted()
    {
        return $this->qtyAccepted;
    }        
    
    public function getWorkOrders()
    {
        return $this->workOrderss;
    }
    
    public function getSku()
    {
        return $this->sku;
    }    
    
    public function getAssemblyStatus()
    {
        return $this->assemblyStatus;
    }    
    
    public function getAssemblyQty()
    {
        return $this->assemblyQty;
    }

    public function getAssemblyQtyCompleted()
    {
        return $this->assemblyQtyCompleted;
    }

    public function getStkQtyHistories()
    {
        return $this->stkQtyHistories;
        
    }

    public function getStockDetails()
    {
        return $this->stockDetails;
    }
    
    public function getTotalJobCosts()
    {
        return $this->totalJobCosts;
    }

    public function getTotalTimesheetNormalHours()
    {
        return $this->totalTimesheetNormalHours;
    }
    
    public function getTotalTimesheetOvertimeHours()
    {
        return $this->totalTimesheetOvertimeHours;
    }

    public function getTradingCompany()
    {
        return $this->tradingCompany;
    }
    
    function getCustomerName() {
        return $this->customerName;
    }

    function setCustomerName($customerName) {
        $this->customerName = $customerName;
    }
 
    function getInspectionId() {
        return $this->inspectionId;
    }

    function getCustomField1() {
        return $this->customField1;
    }
    function getCustomField2() {
        return $this->customField2;
    }

    function getCustomField3() {
        return $this->customField3;
    }

    function getCustomField4() {
        return $this->customField4;
    }

    function getCustomField5() {
        return $this->customField5;
    }

    function getCustomField6() {
        return $this->customField6;
    }

    function getCustomField7() {
        return $this->customField7;
    }

    function getCustomField8() {
        return $this->customField8;
    }

    function getCustomField9() {
        return $this->customField9;
    }

    function getCustomField10() {
        return $this->customField10;
    }

    function getAssemblyQuantity() {
        return $this->assemblyQuantity;
    }

    function getAssemblyPreBuilt() {
        return $this->assemblyPreBuilt;
    }

    function getAssemblyQtyQuarantined() {
        return $this->assemblyQtyQuarantined;
    }

    function getCreatedBy() {
        return $this->createdBy;
    }
    
    function getPpmLevel() {
        return $this->ppmLevel;
    }
    function getJobProgressPercent() {
        return $this->jobProgressPercent;
    }

    function getSalesOrderNumber() {
        return $this->salesOrderNumber;
    }

    function getScheduleRequired() {
        return $this->scheduleRequired;
    }

    function getTotalAssemblyQty() {
        return $this->totalAssemblyQty;
    }

    function getTotalAssemblyCompleted() {
        return $this->totalAssemblyCompleted;
    }

    function getTotalAssemblyQuarantined() {
        return $this->totalAssemblyQuarantined;
    }

    function getPpmEfficiency() {
        return $this->ppmEfficiency * 100;
    }

    function getTotalQuantityInspected() {
        return $this->totalQuantityInspected;
    }

    function getTotalQuantityRejected() {
        return $this->totalQuantityRejected;
    }
    
    function getTotalPPMLevel() {
        return $this->totalPPMLevel;
    }

    function getTotalPPMEfficiency() {
        return $this->totalPPMEfficiency * 100;
    }
  
}