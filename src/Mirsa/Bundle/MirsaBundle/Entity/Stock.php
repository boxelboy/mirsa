<?php
/**
 * Stock
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://webserver:8090/display/BMAN/Portal+Documentation
 * Added stockQantities as a link to the StockQuantity
 */
namespace Mirsa\Bundle\MirsaBundle\Entity;

use Doctrine\ORM\Mapping as ORM,
    Symfony\Component\Validator\Constraints as Assert,
    JMS\Serializer\Annotation as Serializer;

/**
 * Stock entity
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://webserver:8090/display/BMAN/Portal+Documentation
 *
 * @ORM\Entity
 * @ORM\Table(name="Stock")
 *
 * @Serializer\XmlRoot("stock")
 * @Serializer\ExclusionPolicy("all")
 */
class Stock
{
    /**
     * @ORM\Id
     * @ORM\Column(name="Record_ID", type="string")
     * @Serializer\Expose
     * @Serializer\XmlAttribute
     */
    protected $id;

    /**
     * @ORM\Column(name="Internal_Stk_Code", type="string")
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $sku;

    /**
     * @ORM\Column(name="Available_Stock", type="integer")
     * @Serializer\Expose
     */
    protected $availableStock;

    /**
     * @ORM\Column(name="Description", type="string")
     * @Serializer\Expose
     */
    protected $description;

    /**
     * @ORM\Column(name="Description_Full", type="string")
     * @Serializer\Expose
     */
    protected $descriptionFull;

    /**
     * @ORM\Column(name="Image_Label", type="string")
     * @Serializer\Expose
     */
    protected $imageLabel;

    /**
     * @ORM\Column(name="Barcode", type="string")
     * @Serializer\Expose
     */
    protected $barcode;

    /**
     * @ORM\Column(name="Notes", type="notes")
     */
    protected $notes;

    /**
     * @ORM\Column(name="Image", type="container")
     */
    protected $image;

    /**
     * @ORM\Column(name="thumbnail80x80", type="container")
     */
    protected $thumbnail80;

    /**
     * @ORM\Column(name="thumbnail128x128", type="container")
     */
    protected $thumbnail128;

    /**
     * @ORM\Column(name="thumbnail256x256", type="container")
     */
    protected $thumbnail256;

    /**
     * @ORM\Column(name="thumbnail512x512", type="container")
     */
    protected $thumbnail512;

    /**
     * @ORM\Column(name="Cost", type="string")
     * @Serializer\Expose
     * @Serializer\Type("double");
     */
    protected $cost;

    /**
     * @ORM\Column(name="Creation_Timestamp", type="timestamp")
     */
    protected $created;

    /**
     * @ORM\Column(name="Mod_Timestamp", type="timestamp")
     */
    protected $modified;

    /**
     * @ORM\ManyToOne(targetEntity="StockCategory")
     * @ORM\JoinColumn(name="Category_ID", referencedColumnName="Category_ID")
     */
    protected $category;

    /**
     * @ORM\ManyToOne(targetEntity="Client", inversedBy="stock")
     * @ORM\JoinColumn(name="Customer_Account_No", referencedColumnName="Account_No")
     */
    protected $client;
    
     /**
     * @ORM\OneToMany(targetEntity="StockQuantity", mappedBy="stock")
     */
    protected $stockQuantities;

    /**
     * @ORM\Column(name="Actual_Stock_Level", type="integer")
     * @Serializer\Expose
     */
    protected $actualStock;

    /**
     * @ORM\Column(name="Allocated", type="integer")
     * @Serializer\Expose
     */
    protected $allocatedStock;

    /**
     * @ORM\Column(name="Reserved", type="integer")
     * @Serializer\Expose
     */
    protected $reservedStock;
    
    /**
     * @ORM\Column(name="Min_Stock_Level", type="integer")
     * @Serializer\Expose
     */
    protected $minStock;
    
    /**
     * @ORM\Column(name="Total_On_Backorder", type="integer")
     * @Serializer\Expose
     */
    protected $backorderStock;
    
    /**
     * @ORM\Column(name="Total_On_Order", type="integer")
     * @Serializer\Expose
     */
    protected $onOrderStock;
    
    /**
     * @ORM\Column(name="Min_Order_Qty", type="integer")
     * @Serializer\Expose
     */
    protected $minOrderQuantityStock;
    
    /**
     * @ORM\Column(name="Min_Order_Qty_Required", type="integer")
     * @Serializer\Expose
     */
    protected $minOrderRequiredStock;

    /**
     * @ORM\Column(name="Assembly_PreBuilt", type="string")
     * @Serializer\Expose
     */
    protected $assemblyPreBuilt;

    /**
     * @ORM\Column(name="Bay_Unavailable_Qty", type="integer")
     * @Serializer\Expose
     */
    protected $bayUnavailableQty;
    
    /**
     * @ORM\Column(name="Total_InTransit", type="integer")
     * @Serializer\Expose
     */
    protected $totalInTransit;
    
    /**
     * @ORM\Column(name="Category", type="string")
     * @Serializer\Expose
     * @Serializer\Type("string")* 
     */
    protected $categoryDescription;

    /**
     * @ORM\Column(name="Total_Goods_In", type="integer")
     * @Serializer\Expose
     */
    protected $totalGoodsIn;        

    /**
     * @ORM\Column(name="Total_WIP", type="integer")
     * @Serializer\Expose
     */
    protected $totalWIP;    
    
    /**
     * @ORM\Column(name="Total_Finished_Goods", type="integer")
     * @Serializer\Expose
     */
    protected $totalFinishedGoods;    
    
    /**
     * @ORM\Column(name="Manage_This_Item", type="string")
     * @Serializer\Expose
     */
    protected $managedStock;       
    

    //protected $appointmentLineItems;      - removed by cps - if needed dont forget the mapping (see line below)
    //* @ORM\OneToMany(targetEntity="AppointmentLineItem", mappedBy="stock")

    
    public function getId()
    {
        return $this->id;
    }

    public function getSku()
    {
        return $this->sku;
    }

    public function getAvailableStock()
    {
        return $this->availableStock;
    }

    public function getDescription()
    {
        return $this->description;
    }

    public function getDescriptionFull()
    {
        return $this->descriptionFull;
    }

    public function getImageLabel()
    {
        return $this->imageLabel;
    }

    public function getBarcode()
    {
        return $this->barcode;
    }

    public function getNotes()
    {
        return $this->notes;
    }

    public function getImage()
    {
        return $this->image;
    }

    public function getThumbnail80()
    {
        return $this->thumbnail80;
    }

    public function getThumbnail128()
    {
        return $this->thumbnail128;
    }

    public function getThumbnail256()
    {
        return $this->thumbnail256;
    }

    public function getThumbnail512()
    {
        return $this->thumbnail512;
    }

    public function getCost()
    {
        return $this->cost;
    }

    public function getCreated()
    {
        return $this->created;
    }

    public function getModified()
    {
        return $this->modified;
    }

    public function getCategory()
    {
        return $this->category;
    }

    public function getClient()
    {
        return $this->client;
    }
    
    public function getStockQuantities()
    {
        return $this->stockQuantities;
    }
    
    public function getQuarantined()
    {
        foreach ($this->getStockQuantities() as $stockQuantity) {
            if ($stockQuantity->getQuarantine()) {
                return $stockQuantity->getQuarantine();
            }
        }
        
        return '';
    }

    public function getActualStock()
    {
        return $this->actualStock;
    }    

    public function getAllocatedStock()
    {
        return $this->allocatedStock;
    }    
    
    public function getReservedStock()
    {
        return $this->reservedStock;
    }
    
    public function getMinStock()
    {
        return $this->minStock;
    }
    
    public function getBackorderStock()
    {
        return $this->backorderStock;
    }    

    public function getOnOrderStock()
    {
        return $this->onOrderStock;
    }    

    public function getMinOrderQuantityStock()
    {
        return $this->minOrderQuantityStock;
    }    
    
    public function getMinOrderRequiredStock()
    {
        return $this->minOrderRequiredStock;
    }
    
    public function getAssemblyPreBuilt()
    {
        return $this->assemblyPreBuilt;
    }

    public function getBayUnavailableQty()
    {
        return $this->bayUnavailableQty;
    }

    public function getTotalInTransit()
    {
        return $this->totalInTransit;
    }

    public function getCategoryDescription()
    {
        return $this->categoryDescription;
    }
    
    public function getTotalGoodsIn() {
        return $this->totalGoodsIn;
    }

    public function getTotalWIP() {
        return $this->totalWIP;
    }

    public function getTotalFinishedGoods() {
        return $this->totalFinishedGoods;
    }
    
    function getManagedStock() {
        return $this->managedStock;
    }
    /*function getAppointmentLineItems() {
        return $this->appointmentLineItems;
    }*/


}
