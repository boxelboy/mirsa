<?php
/**
 * Audit
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://webserver:8090/display/BMAN/Portal+Documentation
 */
namespace Mirsa\Bundle\MirsaBundle\Entity;

use Doctrine\ORM\Mapping as ORM,
    JMS\Serializer\Annotation as Serializer,
    Symfony\Component\Validator\Constraints as Assert,
    FSC\HateoasBundle\Annotation as RestHateoas;

/**
 * Audit entity
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://webserver:8090/display/BMAN/Portal+Documentation
 *
 * @ORM\Entity()
 * @ORM\Table(name="Audit")
 * @Serializer\XmlRoot("audit")
 * @Serializer\ExclusionPolicy("all")
 *
 * )
 */
class Audit
{
    /**
     * @ORM\Id
     * @ORM\Column(name="Key_Primary", type="string")
     * @Serializer\Expose
     * @Serializer\XmlAttribute
     */
    protected $id;

    /**
     * @ORM\Column(name="Key_Secondary", type="string")
     */
    protected $id2;

    /**
     * @ORM\Column(name="Date_Time_Stamp", type="timestamp")
     * @Serializer\Expose
     * @Serializer\Type("DateTime<'m/d/Y'>")
     */
    protected $created;

    /**
     * @ORM\Column(name="Client_Supplier_Ex_All", type="string")
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $subject;

    /**
     * @ORM\Column(name="By_Whom_Ex_All", type="string")
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $createdBy;

    /**
     * @ORM\Column(name="Event_Type_Ex_All", type="string")
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $eventType;

    /**
     * @ORM\Column(name="Description", type="string")
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $description;
        /**
     * @ORM\Column(name="Foreign_Table_Record_ID", type="string")
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $tableRecordID;
    
    /**
     * @ORM\Column(name="Foreign_Table", type="string")
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $auditedTable;

    /**
     * @ORM\Column(name="Trading_Company_Name", type="string")
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $tradingCompany;    

    public function getId() {
        return $this->id;
    }

    public function getId2() {
        return $this->id2;
    }

    public function getCreated() {
        return $this->created;
    }

    public function getSubject() {
        return $this->subject;
    }

    public function getCreatedBy() {
        return $this->createdBy;
    }

    public function getEventType() {
        return $this->eventType;
    }

    public function getDescription() {
        return $this->description;
    }

    public function getTableRecordID() {
        return $this->tableRecordID;
    }

    public function getAuditedTable() {
        return $this->auditedTable;
    }

    function getTradingCompany() {
        return $this->tradingCompany;
    }
    
}
