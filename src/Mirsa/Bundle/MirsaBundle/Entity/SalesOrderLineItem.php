<?php

namespace Mirsa\Bundle\MirsaBundle\Entity;

use Doctrine\ORM\Mapping as ORM,
    Symfony\Component\Validator\Constraints as Assert,
    JMS\Serializer\Annotation as Serializer,
    FSC\HateoasBundle\Annotation as RestHateoas;

/**
 * SalesOrderLineItem entity
 *
 * @author cps
 * @link   http://webserver:8090/display/BMAN/Portal+Documentation
 *
 * @ORM\Entity()
 * @ORM\Table(name="Sale_Order_LineItems")
 *
 * @Serializer\XmlRoot("salesorderlineitem")
 * @Serializer\ExclusionPolicy("all")
 */
class SalesOrderLineItem
{
    /**
     * @ORM\Id
     * @ORM\Column(name="Key_Primary", type="string")
     * @Serializer\Expose
     * @Serializer\XmlAttribute
     */
    protected $id;

    /**
     * @var \DateTime
     * @ORM\Column(name="Creation_TimeStamp", type="timestamp")
     */
    protected $created;

    /**
     * @var int
     * @ORM\Column(name="Cost_Price", type="integer")
     */
    protected $costPrice;

    /**
     * @var string
     * @ORM\Column(name="Created_By", type="string")
     */
    protected $createdBy;

    /**
     * @var string
     * @ORM\Column(name="Description", type="string")
     * 
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $description;

    /**
     * @var decimal
     * @ORM\Column(name="Discount_Total", type="decimal")
     */
    protected $discountTotal;

    /**
     * @var string
     * @ORM\Column(name="Discount_Type", type="string")
     */
    protected $discountType;

    /**
     * @var decimal
     * @ORM\Column(name="Line_Total", type="decimal")
     */
    protected $lineTotal;

    /**
     * @var int
     * @ORM\Column(name="Qty", type="integer")
     *
     * @Serializer\Expose
     * @Serializer\Type("integer")
     */
    protected $quantity;

    /**
     * @var int
     * @ORM\Column(name="Qty_Allocated", type="integer")
     */
    protected $quantityAllocated;

    /**
     * @var int
     * @ORM\Column(name="Qty_Available_True", type="integer")
     */
    protected $quantityAvailable;

    /**
     * @var int
     * @ORM\Column(name="Qty_Reserved", type="integer")
     */
    protected $quantityReserved;

    /**
     * @var string
     * @ORM\Column(name="Tax_Code", type="string")
     */
    protected $taxCode;

    /**
     * @var decimal
     * @ORM\Column(name="Tax_Percent", type="decimal")
     */
    protected $taxPercent;

    /**
     * @var string
     * @ORM\Column(name="Stk_Code", type="string")
     * 
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $stockCode;

    /**
     * @var SalesOrder
     * @ORM\ManyToOne(targetEntity="SalesOrder")
     * @ORM\JoinColumn(name="Order_Number", referencedColumnName="Order_Number")
     */
    protected $order;
    
    /**
     * @var string
     * @ORM\Column(name="Customer", type="string")
     * 
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $customer;
    
    /**
     * @var string
     * @ORM\Column(name="Order_Date", type="date")
     *
     * @Serializer\Expose
     * @Serializer\Type("DateTime<'m-d-Y H:i:s'>")
     */
    protected $orderDate;
    
     /**
     * @var string
     * @ORM\Column(name="Order_Number", type="string")
     * 
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $orderNumber;

    /**
     * @var string
     * @ORM\Column(name="Order_Type", type="string")
     * 
     * @Serializer\Expose
     * @Serializer\Type("string")
     * 
     */
    protected $orderType;
    
    /**
     * @var \BusinessMan\Bundle\ClientBundle\Entity\Client
     * 
     * @ORM\ManyToOne(targetEntity="BusinessMan\Bundle\ClientBundle\Entity\Client")
     * @ORM\JoinColumn(name="Account_No", referencedColumnName="Account_No")
     */
    protected $client;

    /**
     * @return \BusinessMan\BaseBundle\Entity\Client
     */
    public function getClient()
    {
        return $this->client;
    }
    
    /**
     * @param int $costPrice
     */
    public function setCostPrice($costPrice)
    {
        $this->costPrice = $costPrice;
    }

    /**
     * @return int
     */
    public function getCostPrice()
    {
        return $this->costPrice;
    }

    /**
     * @param \DateTime $created
     */
    public function setCreated($created)
    {
        $this->created = $created;
    }

    /**
     * @return \DateTime
     */
    public function getCreated()
    {
        return $this->created;
    }

    /**
     * @param string $createdBy
     */
    public function setCreatedBy($createdBy)
    {
        $this->createdBy = $createdBy;
    }

    /**
     * @return string
     */
    public function getCreatedBy()
    {
        return $this->createdBy;
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
     * @param float $discountTotal
     */
    public function setDiscountTotal($discountTotal)
    {
        $this->discountTotal = $discountTotal;
    }

    /**
     * @return float
     */
    public function getDiscountTotal()
    {
        return $this->discountTotal;
    }

    /**
     * @param string $discountType
     */
    public function setDiscountType($discountType)
    {
        $this->discountType = $discountType;
    }

    /**
     * @return string
     */
    public function getDiscountType()
    {
        return $this->discountType;
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
     * @param float $lineTotal
     */
    public function setLineTotal($lineTotal)
    {
        $this->lineTotal = $lineTotal;
    }

    /**
     * @return float
     */
    public function getLineTotal()
    {
        return $this->lineTotal;
    }

    /**
     * @param \BusinessMan\BaseBundle\Entity\SalesOrder $order
     */
    public function setOrder($order)
    {
        $this->order = $order;
    }

    /**
     * @return \BusinessMan\BaseBundle\Entity\SalesOrder
     */
    public function getOrder()
    {
        return $this->order;
    }

    /**
     * @param int $quantity
     */
    public function setQuantity($quantity)
    {
        $this->quantity = $quantity;
    }

    /**
     * @return int
     */
    public function getQuantity()
    {
        return $this->quantity;
    }

    /**
     * @param int $quantityAllocated
     */
    public function setQuantityAllocated($quantityAllocated)
    {
        $this->quantityAllocated = $quantityAllocated;
    }

    /**
     * @return int
     */
    public function getQuantityAllocated()
    {
        return $this->quantityAllocated;
    }

    /**
     * @param int $quantityAvailable
     */
    public function setQuantityAvailable($quantityAvailable)
    {
        $this->quantityAvailable = $quantityAvailable;
    }

    /**
     * @return int
     */
    public function getQuantityAvailable()
    {
        return $this->quantityAvailable;
    }

    /**
     * @param int $quantityReserved
     */
    public function setQuantityReserved($quantityReserved)
    {
        $this->quantityReserved = $quantityReserved;
    }

    /**
     * @return int
     */
    public function getQuantityReserved()
    {
        return $this->quantityReserved;
    }

    /**
     * @param string $stockCode
     */
    public function setStockCode($stockCode)
    {
        $this->stockCode = $stockCode;
    }

    /**
     * @return string
     */
    public function getStockCode()
    {
        return $this->stockCode;
    }

    /**
     * @param string $taxCode
     */
    public function setTaxCode($taxCode)
    {
        $this->taxCode = $taxCode;
    }

    /**
     * @return string
     */
    public function getTaxCode()
    {
        return $this->taxCode;
    }

    /**
     * @param float $taxPercent
     */
    public function setTaxPercent($taxPercent)
    {
        $this->taxPercent = $taxPercent;
    }

    /**
     * @return float
     */
    public function getTaxPercent()
    {
        return $this->taxPercent;
    }
    
    public function getCustomer() {
        return $this->customer;
    }

    public function getOrderDate() {
        return $this->orderDate;
    }
    
    public function getOrderNumber() {
        return $this->orderNumber;
    }
    
    public function getOrderType() {
        return $this->orderType;
    }    
}