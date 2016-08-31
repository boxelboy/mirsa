<?php
/**
 * Pick Note 
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
 * Pick Note
 *
 * @author David Hatch <david@computech-it.co.uk>
 * @link   http://webserver:8090/display/BMAN/Portal+Documentation
 *
 * @ORM\Entity
 * @ORM\Table(name="Pick_Note")
 *
 * @Serializer\XmlRoot("picknote")
 * @Serializer\ExclusionPolicy("all")
 */
class PickNote
{
    /**
     * @ORM\Id
     * @ORM\Column(name="Pick_Note_ID", type="string")
     * @Serializer\Expose
     * @Serializer\XmlAttribute
     */
    protected $id;

    /**
     * @var SalesOrder
     * @ORM\ManyToOne(targetEntity="SalesOrder", inversedBy="pickNotes")
     * @ORM\JoinColumn(name="Sales_Order_No", referencedColumnName="Order_Number")
     */
    protected $salesOrder;
    
    /**
     * @ORM\Column(name="Pick_Note_PDF", type="container")
     * @Serializer\Expose* 
     */
    protected $pdf;

    /**
     * @ORM\Column(name="Job_Number", type="integer")
     */
    protected $jobNumber;
    
    /**
     * @ORM\Column(name="Description", type="string")
     * @Serializer\Expose* 
     */
    protected $description;    

    function getId() {
        return $this->id;
    }

    function getSalesOrder() {
        return $this->salesOrder;
    }

    function getPdf() {
        return $this->pdf;
    }

    function getJobNumber() {
        return $this->jobNumber;
    }
    
    function getDescription() {
        return $this->description;
    }
}