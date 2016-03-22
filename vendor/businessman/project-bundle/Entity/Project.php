<?php
namespace BusinessMan\Bundle\ProjectBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use JMS\Serializer\Annotation as Serializer;

/**
 * Project
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/businessmanportal/ProjectBundle
 *
 * @ORM\Entity
 * @ORM\Table(name="Projects")
 *
 * @Serializer\ExclusionPolicy("all")
 * @Serializer\XmlRoot("project")
 */
class Project
{
    /**
     * @var string
     *
     * @ORM\Id
     * @ORM\Column(name="Project_ID", type="string")
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
     * @ORM\Column(name="Project_Description", type="string")
     *
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $description;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="Creation_Timestamp", type="datetime")
     *
     * @Serializer\Expose
     * @Serializer\Type("DateTime<'Y-m-d H:i:s'>")
     */
    protected $created;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="Mod_Timestamp", type="datetime")
     *
     * @Serializer\Expose
     * @Serializer\Type("DateTime<'Y-m-d H:i:s'>")
     */
    protected $lastModified;

    /**
     * @var string
     *
     * @ORM\Column(name="Project_Status", type="string")
     *
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $status;

    /**
     * @var string
     *
     * @ORM\Column(name="Project_Type", type="string")
     *
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $type;

    /**
     * @var string
     *
     * @ORM\Column(name="Project_Sub_Type", type="string")
     *
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $subtype;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="EST", type="date")
     */
    protected $estimatedStartDate;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="EFT", type="date")
     */
    protected $estimatedFinishDate;

    /**
     * @var \BusinessMan\Bundle\ClientBundle\Entity\Client
     *
     * @ORM\ManyToOne(targetEntity="BusinessMan\Bundle\ClientBundle\Entity\Client")
     * @ORM\JoinColumn(name="Client_Account_Number", referencedColumnName="Account_No")
     */
    protected $client;

    public function __construct()
    {
        $this->created = new \DateTime();
    }

    /**
     * @return \BusinessMan\Bundle\ClientBundle\Entity\Client
     */
    public function getClient()
    {
        return $this->client;
    }

    /**
     * @return \DateTime
     */
    public function getCreated()
    {
        return $this->created;
    }

    /**
     * @return string
     */
    public function getDescription()
    {
        return $this->description;
    }

    /**
     * @return \DateTime
     */
    public function getEstimatedFinishDate()
    {
        return $this->estimatedFinishDate;
    }

    /**
     * @return \DateTime
     */
    public function getEstimatedStartDate()
    {
        return $this->estimatedStartDate;
    }

    /**
     * @return string
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
     * @return string
     */
    public function getStatus()
    {
        return $this->status;
    }

    /**
     * @return string
     */
    public function getSubtype()
    {
        return $this->subtype;
    }

    /**
     * @return string
     */
    public function getType()
    {
        return $this->type;
    }

    /**
     * @param \BusinessMan\Bundle\ClientBundle\Entity\Client $client
     */
    public function setClient($client)
    {
        $this->client = $client;
    }

    /**
     * @param string $description
     */
    public function setDescription($description)
    {
        $this->description = $description;
    }

    /**
     * @param \DateTime $estimatedFinishDate
     */
    public function setEstimatedFinishDate($estimatedFinishDate)
    {
        $this->estimatedFinishDate = $estimatedFinishDate;
    }

    /**
     * @param \DateTime $estimatedStartDate
     */
    public function setEstimatedStartDate($estimatedStartDate)
    {
        $this->estimatedStartDate = $estimatedStartDate;
    }

    /**
     * @param string $status
     */
    public function setStatus($status)
    {
        $this->status = $status;
    }

    /**
     * @param string $subtype
     */
    public function setSubtype($subtype)
    {
        $this->subtype = $subtype;
    }

    /**
     * @param string $type
     */
    public function setType($type)
    {
        $this->type = $type;
    }
}
