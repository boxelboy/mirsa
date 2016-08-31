<?php
/**
 * Appointments
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
 * Appointment Line Item entity
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://webserver:8090/display/BMAN/Portal+Documentation
 *
 * @ORM\Entity()
 * @ORM\Table(name="Appointment_LineItems")
 *
 * @Serializer\XmlRoot("appointmentLineItem")
 * @Serializer\ExclusionPolicy("all")
 */
class AppointmentLineItem
{
    /**
     * @ORM\Id
     * @ORM\Column(name="__pk_AppointmentLI_ID", type="integer")
     * @Serializer\Expose
     * @Serializer\XmlAttribute
     */
    protected $id;
    
    /**
     * @var Appointment
     * @ORM\ManyToOne(targetEntity="Appointment", inversedBy="lineItems")
     * @ORM\JoinColumn(name="_fk_AppointmentID", referencedColumnName="__pk_AppointmentID")
     */
    protected $appointment;

    /**
     * @ORM\Column(name="Internal_Stk_Code", type="string")
     * @Serializer\Expose
     */
    protected $sku;
    
    /**
     * @ORM\Column(name="Stock_Description_Final", type="string")
     * @Serializer\Expose
     */
    protected $description;
    
    /**
     * @ORM\Column(name="Batch_Lot_No", type="string")
     * @Serializer\Expose
     */
    protected $batchNumber;

    /**
     * @ORM\Column(name="Qty_Received", type="integer")
     * @Serializer\Expose
     */
    protected $qtyReceived;    
    
    /**
     * @ORM\Column(name="Qty_Processed", type="integer")
     * @Serializer\Expose
     */
    protected $qtyProcessed;    
    
    /**
     * @ORM\Column(name="Qty_Scheduled", type="integer")
     * @Serializer\Expose
     */
    protected $qtyScheduled;    

    /**
     * @ORM\Column(name="Qty_Remaining", type="integer")
     * @Serializer\Expose
     */
    protected $qtyRemaining;
    
    /**
     * @ORM\Column(name="Trading_Company_Name", type="string")
     * @Serializer\Expose
     */
    protected $tradingCompanyName;
    
    function getId() {
        return $this->id;
    }

    function getAppointment() {
        return $this->appointment;
    }

    function getSku() {
        return $this->sku;
    }

    function getDescription() {
        return $this->description;
    }

    function getBatchNumber() {
        return $this->batchNumber;
    }

    function getQtyReceived() {
        return $this->qtyReceived;
    }

    function getQtyProcessed() {
        return $this->qtyProcessed;
    }

    function getQtyScheduled() {
        return $this->qtyScheduled;
    }

    function getQtyRemaining() {
        return $this->qtyRemaining;
    }
    
    function getTradingCompanyName() {
        return $this->tradingCompanyName;
    }

}
