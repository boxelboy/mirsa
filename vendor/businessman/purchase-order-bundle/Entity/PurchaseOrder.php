<?php
namespace BusinessMan\Bundle\PurchaseOrderBundle\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use JMS\Serializer\Annotation as Serializer;

/**
 * PurchaseOrder
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/businessmanportal/PurchaseOrderBundle
 *
 * @ORM\Entity()
 * @ORM\Table(name="Purchase_Order")
 *
 * @Serializer\ExclusionPolicy("all")
 * @Serializer\XmlRoot("order")
 */
class PurchaseOrder
{
    /**
     * @var int
     *
     * @ORM\Column(name="PO_No", type="string")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="CUSTOM")
     * @ORM\CustomIdGenerator(class="Synergize\Bundle\DbalBundle\Driver\IdentityGenerator")
     *
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $id;

    /**
     * @var string
     *
     * @ORM\Column(name="PO_Description", type="string")
     *
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $description;

    /**
     * @var string
     *
     * @ORM\Column(name="PO_Status", type="string")
     *
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $status;

    /**
     * @var string
     *
     * @ORM\Column(name="Type", type="string")
     *
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $type;

    /**
     * @var string
     *
     * @ORM\Column(name="PO_Progress", type="string")
     *
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $progress;

    /**
     * @var double
     *
     * @ORM\Column(name="PO_Net_Total", type="decimal")
     *
     * @Serializer\Expose
     * @Serializer\Type("double")
     */
    protected $netTotal;

    /**
     * @var double
     *
     * @ORM\Column(name="Tax_Total", type="decimal")
     *
     * @Serializer\Expose
     * @Serializer\Type("double")
     */
    protected $taxTotal;

    /**
     * @var double
     *
     * @ORM\Column(name="PO_Gross_Total", type="decimal")
     *
     * @Serializer\Expose
     * @Serializer\Type("double")
     */
    protected $grossTotal;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="ModTimeStamp", type="timestamp")
     *
     * @Serializer\Expose
     * @Serializer\Type("DateTime<'Y-m-d H:i:s'>")
     */
    protected $lastModified;

    /**
     * @var \BusinessMan\Bundle\SupplierBundle\Entity\Supplier
     *
     * @ORM\ManyToOne(targetEntity="BusinessMan\Bundle\SupplierBundle\Entity\Supplier")
     * @ORM\JoinColumn(name="Supplier_ID", referencedColumnName="Supplier_ID")
     */
    protected $supplier;

    /**
     * @var ArrayCollection|PurchaseOrderLineItem
     *
     * @ORM\OneToMany(targetEntity="PurchaseOrderLineItem", mappedBy="order", cascade={"remove"})
     */
    protected $lineItems;

    public function __construct()
    {
        $this->lineItems = new ArrayCollection();
    }

    /**
     * @return string
     */
    public function getDescription()
    {
        return $this->description;
    }

    /**
     * @return float
     */
    public function getGrossTotal()
    {
        return $this->grossTotal;
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
     * @return \BusinessMan\Bundle\PurchaseOrderBundle\Entity\PurchaseOrderLineItem|\Doctrine\Common\Collections\ArrayCollection
     */
    public function getLineItems()
    {
        return $this->lineItems;
    }

    /**
     * @return float
     */
    public function getNetTotal()
    {
        return $this->netTotal;
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
     * @return \BusinessMan\Bundle\SupplierBundle\Entity\Supplier
     */
    public function getSupplier()
    {
        return $this->supplier;
    }

    /**
     * @return float
     */
    public function getTaxTotal()
    {
        return $this->taxTotal;
    }

    /**
     * @return string
     */
    public function getType()
    {
        return $this->type;
    }

    /**
     * @param string $description
     */
    public function setDescription($description)
    {
        $this->description = $description;
    }

    /**
     * @param float $grossTotal
     */
    public function setGrossTotal($grossTotal)
    {
        $this->grossTotal = $grossTotal;
    }

    /**
     * @param float $netTotal
     */
    public function setNetTotal($netTotal)
    {
        $this->netTotal = $netTotal;
    }

    /**
     * @param string $progress
     */
    public function setProgress($progress)
    {
        $this->progress = $progress;
    }

    /**
     * @param string $status
     */
    public function setStatus($status)
    {
        $this->status = $status;
    }

    /**
     * @param \BusinessMan\Bundle\SupplierBundle\Entity\Supplier $supplier
     */
    public function setSupplier($supplier)
    {
        $this->supplier = $supplier;
    }

    /**
     * @param float $taxTotal
     */
    public function setTaxTotal($taxTotal)
    {
        $this->taxTotal = $taxTotal;
    }

    /**
     * @param string $type
     */
    public function setType($type)
    {
        $this->type = $type;
    }
}
