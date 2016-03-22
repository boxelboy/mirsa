<?php
namespace BusinessMan\Bundle\PurchaseOrderBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use JMS\Serializer\Annotation as Serializer;

/**
 * PurchaseOrder
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/businessmanportal/PurchaseOrderBundle
 *
 * @ORM\Entity()
 * @ORM\Table(name="Purchase_Order_Line_Items")
 *
 * @Serializer\ExclusionPolicy("all")
 * @Serializer\XmlRoot("item")
 */
class PurchaseOrderLineItem
{
    /**
     * @var string
     *
     * @ORM\Column(name="Key_Primary", type="string")
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
     * @ORM\Column(name="Stock_Code", type="string")
     *
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $sku;

    /**
     * @var integer
     *
     * @ORM\Column(name="Qty", type="integer")
     *
     * @Serializer\Expose
     * @Serializer\Type("integer")
     */
    protected $quantity;

    /**
     * @var string
     *
     * @ORM\Column(name="Description", type="string")
     *
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $description;

    /**
     * @var double
     *
     * @ORM\Column(name="Line_Total", type="decimal")
     *
     * @Serializer\Expose
     * @Serializer\Type("double")
     */
    protected $total;

    /**
     * @var PurchaseOrder
     *
     * @ORM\ManyToOne(targetEntity="PurchaseOrder", inversedBy="lineItems")
     * @ORM\JoinColumn(name="PO_Number", referencedColumnName="PO_No")
     */
    protected $order;

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
    public function getId()
    {
        return $this->id;
    }

    /**
     * @return \BusinessMan\Bundle\PurchaseOrderBundle\Entity\PurchaseOrder
     */
    public function getOrder()
    {
        return $this->order;
    }

    /**
     * @return int
     */
    public function getQuantity()
    {
        return $this->quantity;
    }

    /**
     * @return string
     */
    public function getSku()
    {
        return $this->sku;
    }

    /**
     * @return float
     */
    public function getTotal()
    {
        return $this->total;
    }

    /**
     * @param string $description
     */
    public function setDescription($description)
    {
        $this->description = $description;
    }

    /**
     * @param \BusinessMan\Bundle\PurchaseOrderBundle\Entity\PurchaseOrder $order
     */
    public function setOrder($order)
    {
        $this->order = $order;
    }

    /**
     * @param int $quantity
     */
    public function setQuantity($quantity)
    {
        $this->quantity = $quantity;
    }

    /**
     * @param string $sku
     */
    public function setSku($sku)
    {
        $this->sku = $sku;
    }

    /**
     * @param float $total
     */
    public function setTotal($total)
    {
        $this->total = $total;
    }
}
