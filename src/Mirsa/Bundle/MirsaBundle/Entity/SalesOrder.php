<?php
/**
 * SalesOrder
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
 * SalesOrder entity
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://webserver:8090/display/BMAN/Portal+Documentation
 *
 * @ORM\Entity()
 * @ORM\Table(name="Sales_Order")
 *
 * @Serializer\XmlRoot("salesorder")
 * @Serializer\ExclusionPolicy("all")
 */
class SalesOrder
{
    /**
     * @ORM\Id
     * @ORM\Column(name="Order_Number", type="string")
     * @Serializer\Expose
     * @Serializer\XmlAttribute
     */
    protected $id;

    /**
     * @var \DateTime
     * @ORM\Column(name="Creation_Date", type="date")
     * @Serializer\Expose
     * @Serializer\Type("DateTime<'m-d-Y'>")* 
     
     */
    protected $created;
    
    /**
     * @var string
     * @Serializer\Expose
     * @ORM\Column(name="Order_Status", type="string")
     */
    protected $status;

    /**
     * @var string
     * @ORM\Column(name="Customer_Order_Number", type="string")
     */
    protected $customerOrderNumber;

    /**
     * @var string
     * @Serializer\Expose
     * @ORM\Column(name="Description", type="string")
     */
    protected $description;

    /**
     * @var decimal
     * @Serializer\Expose
     * @ORM\Column(name="Net_Total_Actual_Sale_Value", type="decimal")
     */
    protected $total;

    /**
     * @var int
     * @ORM\Column(name="Line_Item_Count", type="integer")
     */
    protected $lineItemCount;

    /**
     * @var int
     * @ORM\Column(name="Line_Item_Total", type="integer")
     */
    protected $lineItemTotalQuantity;

    /**
     * @var bool
     * @Serializer\Expose
     * @ORM\Column(name="Delivery_Note_Required", type="yesno")
     */
    protected $deliveryNoteRequired;

    /**
     * @var \DateTime
     * @ORM\Column(name="Delivery_Req_By", type="date")
     */
    protected $deliveryRequiredBy;

    /**
     * @var string
     * @ORM\Column(name="Delivery_Status_Physical", type="string")
     */
    protected $deliveryStatus;

    /**
     * @var string
     * @ORM\Column(name="Delivery_Type", type="string")
     */
    protected $deliveryType;

    /**
     * @var string
     * @ORM\Column(name="Order_Taken_By", type="string")
     */
    protected $takenBy;

    /**
     * 
     * @var \BusinessMan\Bundle\StaffBundle\Entity\Staff
     * 
     * @ORM\ManyToOne(targetEntity="BusinessMan\Bundle\StaffBundle\Entity\Staff")
     * @ORM\JoinColumn(name="Staff_ID", referencedColumnName="Staff_ID")
     */
    protected $staff;

    /**
     * @var Contact
     * 
     * @ORM\ManyToOne(targetEntity="Contact")
     * @ORM\JoinColumn(name="Client_ContactID", referencedColumnName="Record_ID")
     */
    protected $contact;

    /**
     * @var \BusinessMan\Bundle\ClientBundle\Entity\Client
     * @ORM\ManyToOne(targetEntity="BusinessMan\Bundle\ClientBundle\Entity\Client")
     * @ORM\JoinColumn(name="Customer_Account_No", referencedColumnName="Account_No")
     */
    protected $client;

    /**
     * @var array
     * @ORM\OneToMany(targetEntity="SalesOrderLineItem", mappedBy="order")
     */
    protected $lineItems;
    
    /**
     * @var array
     * @Serializer\Expose
     * @ORM\OneToMany(targetEntity="DeliveryNote", mappedBy="salesOrder")
     */
    protected $deliveryNotes;
    
    /**
     * @var array
     * @Serializer\Expose
     * @ORM\OneToMany(targetEntity="PickNote", mappedBy="salesOrder")
     */
    protected $pickNotes;

    /**
     * @var array
     * @ORM\Column(name="Contact", type="string")
     */
    protected $fullContactName;    

    /**
     * @var array
     * @Serializer\Expose
     * @ORM\Column(name="Order_Type", type="string")
     */
    protected $orderType;    

    /**
     * @var array
     * @ORM\Column(name="Invoice_Only_Flag", type="string")
     */
    protected $invoiceOnlyFlag;
    
    /**
     * @var string
     * @Serializer\Expose
     * @ORM\Column(name="Address_Delivery_Company", type="string")
     */
    protected $deliveryCompany;
    
    /**
     * @return \String
     */
    public function getFullContactName()
    {
        return $this->fullContactName;
    }    
    
    /**
     * 
     * @param \Mirsa\Bundle\MirsaBundle\Entity\SalesOrder $salesorder
     */
    public function setSalesOrder($salesorder)
    {
        $this->SalesOrder = $salesorder;
    }

    /**
     * @param \Mirsa\Bundle\MirsaBundle\Entity\SalesOrder
     */
    public function getSalesOrder()
    {
        return $this->SalesOrder;
    }

    /**
     * @param Contact $contact
     */
    public function setContact($contact)
    {
        $this->contact = $contact;
    }

    /**
     * @return Contact
     */
    public function getContact()
    {
        return $this->contact;
    }

    /**
     * @param mixed $created
     */
    public function setCreated($created)
    {
        $this->created = $created;
    }

    /**
     * @return mixed
     */
    public function getCreated()
    {
        return $this->created;
    }

    /**
     * @param mixed $customerOrderNumber
     */
    public function setCustomerOrderNumber($customerOrderNumber)
    {
        $this->customerOrderNumber = $customerOrderNumber;
    }

    /**
     * @return mixed
     */
    public function getCustomerOrderNumber()
    {
        return $this->customerOrderNumber;
    }

    /**
     * @param boolean $deliveryNoteRequired
     */
    public function setDeliveryNoteRequired($deliveryNoteRequired)
    {
        $this->deliveryNoteRequired = $deliveryNoteRequired;
    }

    /**
     * @return boolean
     */
    public function getDeliveryNoteRequired()
    {
        return $this->deliveryNoteRequired;
    }

    /**
     * @param \DateTime $deliveryRequiredBy
     */
    public function setDeliveryRequiredBy($deliveryRequiredBy)
    {
        $this->deliveryRequiredBy = $deliveryRequiredBy;
    }

    /**
     * @return \DateTime
     */
    public function getDeliveryRequiredBy()
    {
        return $this->deliveryRequiredBy;
    }

    /**
     * @param string $deliveryStatus
     */
    public function setDeliveryStatus($deliveryStatus)
    {
        $this->deliveryStatus = $deliveryStatus;
    }

    /**
     * @return string
     */
    public function getDeliveryStatus()
    {
        return $this->deliveryStatus;
    }

    /**
     * @param string $deliveryType
     */
    public function setDeliveryType($deliveryType)
    {
        $this->deliveryType = $deliveryType;
    }

    /**
     * @return string
     */
    public function getDeliveryType()
    {
        return $this->deliveryType;
    }

    /**
     * @param string $description
     */
    public function setDescription($description)
    {
        $this->description = $description;
    }

    /**
     * @return string
     */
    public function getDescription()
    {
        return $this->description;
    }

    /**
     * @param mixed $id
     */
    public function setId($id)
    {
        $this->id = $id;
    }

    /**
     * @return mixed
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * @param int $lineItemCount
     */
    public function setLineItemCount($lineItemCount)
    {
        $this->lineItemCount = $lineItemCount;
    }

    /**
     * @return int
     */
    public function getLineItemCount()
    {
        return $this->lineItemCount;
    }

    /**
     * @param int $lineItemTotalQuantity
     */
    public function setLineItemTotalQuantity($lineItemTotalQuantity)
    {
        $this->lineItemTotalQuantity = $lineItemTotalQuantity;
    }

    /**
     * @return int
     */
    public function getLineItemTotalQuantity()
    {
        return $this->lineItemTotalQuantity;
    }

    /**
     * @param string $takenBy
     */
    public function setTakenBy($takenBy)
    {
        $this->takenBy = $takenBy;
    }

    /**
     * @return string
     */
    public function getTakenBy()
    {
        return $this->takenBy;
    }

    /**
     * @param \BusinessMan\StaffBundle\Entity\Staff $staff
     */
    public function setStaff($staff)
    {
        $this->staff = $staff;
    }

    /**
     * @return \BusinessMan\BaseBundle\Entity\Staff
     */
    public function getStaff()
    {
        return $this->staff;
    }

    /**
     * @param mixed $status
     */
    public function setStatus($status)
    {
        $this->status = $status;
    }

    /**
     * @return mixed
     */
    public function getStatus()
    {
        return $this->status;
    }

    /**
     * @param float $total
     */
    public function setTotal($total)
    {
        $this->total = $total;
    }

    /**
     * @return float
     */
    public function getTotal()
    {
        return $this->total;
    }

    /**
     * @return array
     */
    public function getLineItems()
    {
        return $this->lineItems;
    }
    
    public function getDeliveryNotes()
    {
        return $this->deliveryNotes;
    }

    public function getPdfDeliveryNote()
    {
        foreach ($this->getDeliveryNotes() as $deliveryNote) {
            if ($deliveryNote->getPdf()) {
                return $deliveryNote->getPdf();
            }
        }
        return false;
    }

    public function getPickNotes()
    {
        return $this->pickNotes;
    }    
    
    public function getPdfPickNote()
    {
        foreach ($this->getPickNotes() as $pickNote) {
            if ($pickNote->getPdf()) {
                return $pickNote->getPdf();
            }
        }
        return false;
    }    
    
    public function getOrderType()
    {
        return $this->orderType;
    }

    public function getDeliveryCompany()
    {
        return $this->deliveryCompany;
    }
    
    function getInvoiceOnlyFlag() {
        return $this->invoiceOnlyFlag;
    }

}
