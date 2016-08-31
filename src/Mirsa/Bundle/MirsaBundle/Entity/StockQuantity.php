<?php
/**
 * StockQuantity
 *
 * @author David Hatch <david@computech-it.co.uk>
 * @link   http://webserver:8090/display/BMAN/Portal+Documentation
 */
namespace Mirsa\Bundle\MirsaBundle\Entity;

use Doctrine\ORM\Mapping as ORM,
    Symfony\Component\Validator\Constraints as Assert,
    JMS\Serializer\Annotation as Serializer,
    FSC\HateoasBundle\Annotation as RestHateoas;

/**
 * Stock Quantity
 *
 * @author David Hatch <david@computech-it.co.uk>
 * @link   http://webserver:8090/display/BMAN/Portal+Documentation
 *
 * @ORM\Entity
 * @ORM\Table(name="Stock_Quantity")
 *
 * @Serializer\XmlRoot("stockquantity")
 * @Serializer\ExclusionPolicy("all")
 */
class StockQuantity
{
    /**
     * @ORM\Id
     * @ORM\Column(name="`__kp_Stock_Quantity_ID`", type="integer")
     * @Serializer\Expose
     * @Serializer\XmlAttribute
     */
    protected $id;

    /**
     * @ORM\Column(name="Stock_Record_ID", type="integer")
     * @Serializer\Expose
     */
    protected $stockRecordId;
    
    /**
     * @ORM\Column(name="Internal_Stock_Code", type="string")
     * @Serializer\Expose
     */
    protected $sku;

    /**
     * @ORM\Column(name="Stock_Description", type="string")
     * @Serializer\Expose
     */
    protected $description;
    
    /**
     * @ORM\Column(name="`_kf_Warehouse_ID`", type="integer")
     * @Serializer\Expose
     */
    protected $warehouseId;

    /**
     * @ORM\Column(name="Warehouse_Name", type="string")
     * @Serializer\Expose
     */
    protected $warehouseName;

    /**
     * @ORM\Column(name="Bay_Name", type="string")
     * @Serializer\Expose
     */
    protected $bayName;

    /**
     * @ORM\Column(name="`_kf_Batch_No`", type="string")
     * @Serializer\Expose
     */
    protected $batchNumber;

    /**
     * @ORM\Column(name="Aisle_Name", type="string")
     * @Serializer\Expose
     */
    protected $aisleName;

    /**
     * @ORM\Column(name="Quantity", type="integer")
     * @Serializer\Expose
     */
    protected $quantity;

    /**
     * @ORM\ManyToOne(targetEntity="Stock", inversedBy="stockQuantities")
     * @ORM\JoinColumn(name="Stock_Record_ID", referencedColumnName="Record_ID")
     */
    protected $stock;
    
    /**
     * @ORM\Column(name="Bay_Deaf_Dest", type="string")
     * @Serializer\Expose
     */
    protected $quarantine;

    /**
     * @ORM\Column(name="sSumOfQuantities", type="integer")
     */
    protected $sumOfQuantities;
    
    /**
     * @ORM\ManyToOne(targetEntity="Client")
     * @ORM\JoinColumn(name="`_kf_Customer_Account_No`", referencedColumnName="Account_No")
     */
    protected $client;    

    public function getId()
    {
        return $this->id;
    }

    public function getStockRecordId()
    {
        return $this->stockRecordId;
    }

    public function getSku()
    {
        return $this->sku;
    }
    
    public function getWarehouseId()
    {
        return $this->warehouseId;
    }

    public function getWarehouseName()
    {
        return $this->warehouseName;
    }

    public function getBayName()
    {
        return $this->bayName;
    }

    public function getBatchNumber()
    {
        return $this->batchNumber;
    }

    public function getAisleName()
    {
        return $this->aisleName;
    }

    public function getQuantity()
    {
        return $this->quantity;
    }
    
    public function getStock()
    {
        return $this->stock;
    }

    public function getQuarantine()
    {
        return $this->quarantine;
    }    

    public function getSumOfQuantities()
    {
        return $this->sumOfQuantities;
    }    
    
    function getDescription() {
        return $this->description;
    }

    function getClient() {
        return $this->client;
    }

}