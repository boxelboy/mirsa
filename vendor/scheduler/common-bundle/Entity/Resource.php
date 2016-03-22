<?php
namespace Scheduler\Bundle\CommonBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Doctrine\Common\Collections\ArrayCollection;
use JMS\Serializer\Annotation as Serializer;

/**
 * Resource
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/scheduler/CommonBundle
 *
 * @ORM\Entity(repositoryClass="Scheduler\Bundle\CommonBundle\Repository\CommonRepository")
 * @ORM\Table(name="Scheduler_Resources")
 *
 * @Serializer\ExclusionPolicy("all")
 * @Serializer\XmlRoot("resource")
 */
class Resource
{
    /**
     * @var int
     *
     * @ORM\Id
     * @ORM\Column(name="Resource_ID", type="integer")
     * @ORM\GeneratedValue(strategy="CUSTOM")
     * @ORM\CustomIdGenerator(class="Synergize\Bundle\DbalBundle\Driver\IdentityGenerator")
     *
     * @Serializer\Expose
     * @Serializer\Type("integer")
     */
    protected $id;

    /**
     * @var string
     *
     * @ORM\Column(name="Resource_Description", type="string")
     *
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $description;

    /**
     * @var string
     *
     * @ORM\Column(name="Resource_Email", type="string")
     */
    protected $email;

    /**
     * @var string
     *
     * @ORM\Column(name="Resource_Type", type="string")
     *
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $type;

    /**
     * @var string
     *
     * @ORM\Column(name="Resource_Name", type="string")
     *
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $name;

    /**
     * @var string
     *
     * @ORM\Column(name="Resource_Status", type="string")
     *
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $status;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="Record_Modify", type="timestamp")
     */
    protected $lastModified;

    /**
     * @var ResourceCategory
     *
     * @ORM\ManyToOne(targetEntity="ResourceCategory", inversedBy="resources")
     * @ORM\JoinColumn(name="Resource_Category_ID", referencedColumnName="Resource_Category_ID")
     *
     * @Serializer\Expose
     * @Serializer\Type("Scheduler\Bundle\CommonBundle\Entity\ResourceCategory")
     */
    protected $category;

    /**
     * @var ArrayCollection|Schedule
     *
     * @ORM\OneToMany(targetEntity="Schedule", mappedBy="resource", cascade={"remove"})
     */
    protected $schedules;

    /**
     * @var ArrayCollection|ResourceGroupMembership
     *
     * @ORM\OneToMany(targetEntity="ResourceGroupMembership", mappedBy="resource", cascade={"remove"})
     */
    protected $memberships;

    /**
     * Constructor
     */
    public function __construct()
    {
        $this->memberships = new ArrayCollection();
        $this->schedules = new ArrayCollection();
    }

    /**
     * @return ResourceCategory
     */
    public function getCategory()
    {
        return $this->category;
    }

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
    public function getEmail()
    {
        return $this->email;
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
     * @return ArrayCollection|ResourceGroupMembership
     */
    public function getMemberships()
    {
        return $this->memberships;
    }

    /**
     * @return string
     */
    public function getName()
    {
        return $this->name;
    }

    /**
     * @return ArrayCollection|Schedule
     */
    public function getSchedules()
    {
        return $this->schedules;
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
    public function getType()
    {
        return $this->type;
    }

    /**
     * @param ResourceCategory $category
     */
    public function setCategory($category)
    {
        $this->category = $category;
    }

    /**
     * @param string $description
     */
    public function setDescription($description)
    {
        $this->description = $description;
    }

    /**
     * @param string $email
     */
    public function setEmail($email)
    {
        $this->email = $email;
    }

    /**
     * @param string $name
     */
    public function setName($name)
    {
        $this->name = $name;
    }

    /**
     * @param string $status
     */
    public function setStatus($status)
    {
        $this->status = $status;
    }

    /**
     * @param string $type
     */
    public function setType($type)
    {
        $this->type = $type;
    }
}
