<?php
/**
 * Appointments
 *
 * @author cps
 * @link 
 */
namespace Mirsa\Bundle\MirsaBundle\Entity;

use Doctrine\ORM\Mapping as ORM,
    Symfony\Component\Validator\Constraints as Assert,
    JMS\Serializer\Annotation as Serializer,
    FSC\HateoasBundle\Annotation as RestHateoas;

/**
 * Appointment entity
 *
 * @author cps
 * @link   http://webserver:8090/display/BMAN/Portal+Documentation
 *
 * @ORM\Entity()
 * @ORM\Table(name="Appointment")
 *
 * @Serializer\XmlRoot("appointment")
 * @Serializer\ExclusionPolicy("all")
 */
class Appointment
{
    /**
     * @ORM\Id
     * @ORM\Column(name="`__pk_AppointmentID`", type="integer")
     * @Serializer\Expose
     * @Serializer\XmlAttribute
     */
    protected $id;

    /**
     * @var string
     * @ORM\Column(name="Appointment_No", type="string")
     * @Serializer\Expose* 
     */
    protected $appointmentNumber;
    
    /**
     * @ORM\Column(name="Appointment_PDF", type="container")
     * @Serializer\Expose* 
     */
    protected $pdf;    
    
    /**
     * @var string
     * @ORM\Column(name="Appointment_Status", type="string")
     * @Serializer\Expose
     */
    protected $status;

    /**
     * @var string
     * @ORM\Column(name="Reference", type="string")
     * @Serializer\Expose
     */
    protected $reference;

    /**
     * @var \Date
     * @ORM\Column(name="Date_Created", type="date")
     * @Serializer\Expose
     * @Serializer\Type("DateTime<'m-d-Y'>")
     */
    protected $dateCreated;

    /**
     * @var \Date
     * @ORM\Column(name="Date_Received", type="date")
     * @Serializer\Expose
     * @Serializer\Type("DateTime<'m-d-Y'>")
     */
    protected $dateReceived;

    /**
     * @var \Date
     * @ORM\Column(name="Date_Scheduled", type="date")
     * @Serializer\Expose
     * @Serializer\Type("DateTime<'m-d-Y'>")
     */
    protected $dateScheduled;    
    
    /**
     * @var \Mirsa\Bundle\MirsaBundle\Entity\Client
     * 
     * @ORM\ManyToOne(targetEntity="Mirsa\Bundle\MirsaBundle\Entity\Client")
     * @ORM\JoinColumn(name="Customer_Account_No", referencedColumnName="Account_No")
     */
    protected $client;
    
    /**
     * @var array
     * @ORM\OneToMany(targetEntity="AppointmentLineItem", mappedBy="appointment")
     */
    protected $lineItems;
    
    /**
     * @var string
     * @ORM\Column(name="Process_No", type="string")
     */
    protected $processNumber;
    
    /**
     * @var integer
     * @ORM\Column(name="Total_Boxes", type="integer")
     */
    protected $totalBoxes;
    
    /**
     * @var integer
     * @ORM\Column(name="Total_Pallets", type="integer")
     */
    protected $totalPallets;
    
    /**
     * @var integer
     * @ORM\Column(name="Total_Weight", type="integer")
     */
    protected $totalWeight;
    
    /**
     * @var string
     * @ORM\Column(name="Instructions", type="string")
     */
    protected $instructions;    

    /**
     * @var string
     * @ORM\Column(name="Trading_Company_Name", type="string")
     * @Serializer\Expose
     */
    protected $tradingCompanyName;        
    
    function getId() {
        return $this->id;
    }

    function getAppointmentNumber() {
        return $this->appointmentNumber;
    }

    function getPdf() {
        return $this->pdf;
    }

    function getStatus() {
        return $this->status;
    }

    function getReference() {
        return $this->reference;
    }

    function getDateCreated() {
        return $this->dateCreated;
    }

    function getDateReceived() {
        return $this->dateReceived;
    }

    function getDateScheduled() {
        return $this->dateScheduled;
    }

    function getClient() {
        return $this->client;
    }
    
    function getLineItems() {
        return $this->lineItems;
    }

    function getProcessNumber() {
        return $this->processNumber;
    }

    function getTotalBoxes() {
        return $this->totalBoxes;
    }

    function getTotalPallets() {
        return $this->totalPallets;
    }

    function getTotalWeight() {
        return $this->totalWeight;
    }

    function getInstructions() {
        return $this->instructions;
    }

    function getTradingCompanyName() {
        return $this->tradingCompanyName;
    }

}
