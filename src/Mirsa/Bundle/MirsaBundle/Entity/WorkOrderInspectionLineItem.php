<?php

namespace Mirsa\Bundle\MirsaBundle\Entity;

use Doctrine\ORM\Mapping as ORM,
    Symfony\Component\Validator\Constraints as Assert,
    JMS\Serializer\Annotation as Serializer;

/**
 * Job Inspection LineItem
 *
 * @author cps
 * @link   http://webserver:8090/display/BMAN/Portal+Documentation
 *
 * @ORM\Entity
 * @ORM\Table(name="Job_Inspection_Lineitem_Fm_Jobs")
 *
 * @Serializer\XmlRoot("WorkOrderInspectionLineItem")
 * @Serializer\ExclusionPolicy("all")
 */
class WorkOrderInspectionLineItem
{
    /**
     * @ORM\Id
     * @ORM\Column(name="`__kp_Job_Inspection_ID", type="integer")
     * @Serializer\Expose
     * @Serializer\XmlAttribute
     */
    protected $id;
    
    /**
     * @ORM\Column(name="`_kf_internal_Stock_Code", type="string")
     * @Serializer\Expose
     */
    protected $sku;

    /**
     * @var Job
     *
     * @ORM\ManyToOne(targetEntity="WorkOrder")
     * @ORM\JoinColumn(name="`_kf_Job_No", referencedColumnName="Job_Number")
     */
    protected $workOrder;
    
    /**
     * @ORM\Column(name="Inspected_Date", type="date")
     * @Serializer\Expose
     * @Serializer\Type("DateTime<'m/d/Y'>")
     */
    protected $dateInspected;
    
    /**
     * @ORM\Column(name="Batch_Number", type="string")
     * @Serializer\Expose
     */
    protected $batchNo;
    
    /**
     * @ORM\Column(name="Serial_Number", type="string")
     * @Serializer\Expose
     */
    protected $serialNo;

    /**
     * @ORM\Column(name="Manufacturing_Date", type="date")
     * @Serializer\Expose
     * @Serializer\Type("DateTime<'m/d/Y'>")
     */
    protected $manufacturedDate;
    
    /**
     * @ORM\Column(name="Qty_Inspected", type="integer")
     * @Serializer\Expose
     */
    protected $qtyInspected;

    /**
     * @ORM\Column(name="Qty_Rejected", type="integer")
     * @Serializer\Expose
     */
    protected $qtyRejected;
    /**
     * @ORM\Column(name="Qty_Reworked", type="integer")
     * @Serializer\Expose
     */
    protected $qtyReworked;
    /**
     * @ORM\Column(name="Qty_Accepted", type="integer")
     * @Serializer\Expose
     */
    protected $qtyAccepted;    

    /**
     * @ORM\Column(name="cDescription", type="string")
     * @Serializer\Expose
     */
    protected $description;

    /**
     * @ORM\Column(name="Custom_Label1", type="string")
     * @Serializer\Expose
     */
    protected $customLabel1;

    /**
     * @ORM\Column(name="Custom_Field1", type="string")
     * @Serializer\Expose
     */
    protected $customField1;

    /**
     * @ORM\Column(name="Custom_Label2", type="string")
     * @Serializer\Expose
     */
    protected $customLabel2;

    /**
     * @ORM\Column(name="Custom_Field2", type="string")
     * @Serializer\Expose
     */
    protected $customField2;
    
    /**
     * @ORM\Column(name="Custom_Label3", type="string")
     * @Serializer\Expose
     */
    protected $customLabel3;

    /**
     * @ORM\Column(name="Custom_Field3", type="string")
     * @Serializer\Expose
     */
    protected $customField3;

    /**
     * @ORM\Column(name="Custom_Label4", type="string")
     * @Serializer\Expose
     */
    protected $customLabel4;

    /**
     * @ORM\Column(name="Custom_Field4", type="string")
     * @Serializer\Expose
     */
    protected $customField4;
    
    /**
     * @ORM\Column(name="Custom_Label5", type="string")
     * @Serializer\Expose
     */
    protected $customLabel5;

    /**
     * @ORM\Column(name="Custom_Field5", type="string")
     * @Serializer\Expose
     */
    protected $customField5;

    /**
     * @ORM\Column(name="Custom_Label6", type="string")
     * @Serializer\Expose
     */
    protected $customLabel6;

    /**
     * @ORM\Column(name="Custom_Field6", type="string")
     * @Serializer\Expose
     */
    protected $customField6;
    
    /**
     * @ORM\Column(name="Custom_Label7", type="string")
     * @Serializer\Expose
     */
    protected $customLabel7;

    /**
     * @ORM\Column(name="Custom_Field7", type="string")
     * @Serializer\Expose
     */
    protected $customField7;

    /**
     * @ORM\Column(name="Custom_Label8", type="string")
     * @Serializer\Expose
     */
    protected $customLabel8;

    /**
     * @ORM\Column(name="Custom_Field8", type="string")
     * @Serializer\Expose
     */
    protected $customField8;
    
    /**
     * @ORM\Column(name="Custom_Label9", type="string")
     * @Serializer\Expose
     */
    protected $customLabel9;

    /**
     * @ORM\Column(name="Custom_Field9", type="string")
     * @Serializer\Expose
     */
    protected $customField9;

    /**
     * @ORM\Column(name="Custom_Label10", type="string")
     * @Serializer\Expose
     */
    protected $customLabel10;

    /**
     * @ORM\Column(name="Custom_Field10", type="string")
     * @Serializer\Expose
     */
    protected $customField10;  

    public function getId()
    {
        return $this->id;
    }
    
    public function getSku()
    {
        return $this->sku;
    }    

    public function getJob()
    {
        return $this->job;
    }

    public function getDateInspected()
    {
        return $this->dateInspected;
    }

    public function getBatchNo()
    {
        return $this->batchNo;
    }

    public function getSerialNo()
    {
        return $this->serialNo;
    }

    public function getManufacturedDate()
    {
        return $this->manufacturedDate;
    }

    public function getQtyInspected()
    {
        return $this->qtyInspected;
    }

    public function getQtyRejected()
    {
        return $this->qtyRejected;
    }
    
    public function getQtyReworked()
    {
        return $this->qtyReworked;
    }

    public function getQtyAccepted()
    {
        return $this->qtyAccepted;
    }    

    public function getDescription()
    {
        return $this->description;
    }    
    
    function getCustomLabel1() {
        return $this->customLabel1;
    }

    function getCustomField1() {
        return intVal($this->customField1);
    }

    function getCustomLabel2() {
        return $this->customLabel2;
    }

    function getCustomField2() {
        return intVal($this->customField2);
    }

    function getCustomLabel3() {
        return $this->customLabel3;
    }

    function getCustomField3() {
        return intVal($this->customField3);
    }

    function getCustomLabel4() {
        return $this->customLabel4;
    }

    function getCustomField4() {
        return intVal($this->customField4);
    }

    function getCustomLabel5() {
        return $this->customLabel5;
    }

    function getCustomField5() {
        return intVal($this->customField5);
    }

    function getCustomLabel6() {
        return $this->customLabel6;
    }

    function getCustomField6() {
        return intVal($this->customField6);
    }

    function getCustomLabel7() {
        return $this->customLabel7;
    }

    function getCustomField7() {
        return intVal($this->customField7);
    }

    function getCustomLabel8() {
        return $this->customLabel8;
    }

    function getCustomField8() {
        return intVal($this->customField8);
    }

    function getCustomLabel9() {
        return $this->customLabel9;
    }

    function getCustomField9() {
        return intVal($this->customField9);
    }

    function getCustomLabel10() {
        return $this->customLabel10;
    }

    function getCustomField10() {
        return intVal($this->customField10);
    }

    
}