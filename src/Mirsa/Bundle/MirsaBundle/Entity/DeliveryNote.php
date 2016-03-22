<?php

namespace Mirsa\Bundle\MirsaBundle\Entity;

use Doctrine\ORM\Mapping as ORM,
    Symfony\Component\Validator\Constraints as Assert,
    JMS\Serializer\Annotation as Serializer,
    FSC\HateoasBundle\Annotation as RestHateoas;

/**
 * Delivery Note
 *
 * @author cps
 * @link   http://webserver:8090/display/BMAN/Portal+Documentation
 *
 * @ORM\Entity
 * @ORM\Table(name="Delivery_Note")
 *
 * @Serializer\XmlRoot("deliverynote")
 * @Serializer\ExclusionPolicy("all")
 */
class DeliveryNote
{
    /**
     * @ORM\Id
     * @ORM\Column(name="Delivery_Note_No", type="string")
     * @Serializer\Expose
     * @Serializer\XmlAttribute
     */
    protected $id;

   /**
     * @var SalesOrder
     * @ORM\ManyToOne(targetEntity="SalesOrder")
     * @ORM\JoinColumn(name="Order_Number", referencedColumnName="Order_Number")
     */
    protected $salesOrder;
    
    /**
     * @var \Synergize\Bundle\DbalBundle\Type\ContainerField
     * 
     * @ORM\Column(name="Portal_Container", type="container")
     * @Serializer\Expose
     */
    protected $pdf;
    
   /**
     * @ORM\Column(name="Delivery_Method", type="string")
     * @Serializer\Expose
     */
    protected $deliveryMethod;
    
    /**
     * @ORM\Column(name="Printed_By", type="string")
     * @Serializer\Expose
     */
    protected $printedBy;

    /**
     * Printed Time
     *
     * @ORM\Column(name="Printed_Timestamp", type="timestamp")
     * @Serializer\Expose
     * @Serializer\Type("DateTime<'Y-m-dO'>")
     */
    protected $printedOn;    

    public function getId()
    {
        return $this->id;
    }

    public function getSalesOrder()
    {
        return $this->salesOrder;
    }
    
    /*
     * @param \Synergize\Bundle\DbalBundle\Type\ContainerField $pdf    
     */
    public function getPdf()
    {
        return $this->pdf;
    }
    
    public function getDeliveryMethod()
    {
        return $this->deliveryMethod;
    }
    
    public function getPrintedBy()
    {
        return $this->printedBy;
    }

    public function getPrintedOn()
    {
        return $this->printedOn;
    }
}