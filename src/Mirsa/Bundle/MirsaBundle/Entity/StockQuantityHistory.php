<?php
/**
 * StockQuantityHistory
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
 * @ORM\Table(name="Stock_Quantity_History")
 *
 * @Serializer\XmlRoot("stockquantityhistory")
 * @Serializer\ExclusionPolicy("all")
 */
class StockQuantityHistory
{
    /**
     * @ORM\Id
     * @ORM\Column(name="__kp_Stock_Quantity_History_ID", type="integer")
     * @Serializer\Expose
     * @Serializer\XmlAttribute
     */
    protected $id;

    /**
     * @var Job
     *
     * @ORM\ManyToOne(targetEntity="WorkOrder",inversedBy="stkQtyHistories")
     * @ORM\JoinColumn(name="_kf_Job_No", referencedColumnName="Job_Number")
     */
    protected $workOrder;
    
    /**
     * @ORM\Column(name="Quantity", type="string")
     * @Serializer\Expose
     */
    protected $quantity;
    
    /**
     * @ORM\Column(name="_kf_Serial_No", type="string")
     * @Serializer\Expose
     */
    protected $serialNo;

    /**
     * @ORM\Column(name="_kf_Batch_No", type="string")
     * @Serializer\Expose
     */
    protected $batchNo;

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
     * @ORM\Column(name="Trading_Company_Name", type="string")
     * @Serializer\Expose
     */
    protected $companyName;

    /**
     * @ORM\Column(name="Warehouse_Name", type="string")
     * @Serializer\Expose
     */
    protected $warehouseName;

    /**
     * @ORM\Column(name="Aisle_Name", type="string")
     * @Serializer\Expose
     */
    protected $aisleName;
    
    /**
     * @ORM\Column(name="Bay_Name", type="string")
     * @Serializer\Expose
     */
    protected $bayName;

    /**
     * @ORM\Column(name="Cost", type="integer")
     * @Serializer\Expose
     */
    protected $cost;    
    

    public function getId()
    {
        return $this->id;
    }

    public function getJob()
    {
        return $this->job;
    }

    public function getQuantity()
    {
        return $this->quantity;
    }
    
    public function getSerialNo()
    {
        return $this->serialNo;
    }

    public function getBatchNo()
    {
        return $this->batchNo;
    }

    public function getSku()
    {
        return $this->sku;
    }

    public function getDescription()
    {
        return $this->description;
    }

    public function getCompanyName()
    {
        return $this->companyName;
    }

    public function getWarehouseName()
    {
        return $this->warehouseName;
    }
    
    public function getAisleName()
    {
        return $this->aisleName;
    }

    public function getBayName()
    {
        return $this->bayName;
    }    

    public function getCost()
    {
        return $this->cost;
    }    
}