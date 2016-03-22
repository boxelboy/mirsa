<?php
namespace Scheduler\Bundle\CommonBundle\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use JMS\Serializer\Annotation as Serializer;

/**
 * ResourceCategory
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/scheduler/CommonBundle
 *
 * @ORM\Entity(repositoryClass="Scheduler\Bundle\CommonBundle\Repository\CommonRepository")
 * @ORM\Table(name="Scheduler_Resource_Categories")
 *
 * @Serializer\ExclusionPolicy("all")
 * @Serializer\XmlRoot("category")
 */
class ResourceCategory
{
    /**
     * @var int
     *
     * @ORM\Id
     * @ORM\Column(name="Resource_Category_ID", type="integer")
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
     * @ORM\Column(name="Resource_Category", type="string")
     *
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $name;

    /**
     * @var boolean
     *
     * @ORM\Column(name="Record_Modify", type="timestamp")
     */
    protected $lastModified;

    /**
     * @var ArrayCollection|Resource
     *
     * @ORM\OneToMany(targetEntity="Resource", mappedBy="category", cascade={"remove"})
     * @ORM\OrderBy({"name" = "ASC"})
     */
    protected $resources;

    /**
     * @var ArrayCollection|ScheduleEvent
     *
     * @ORM\OneToMany(targetEntity="ScheduleEvent", mappedBy="category", cascade={"remove"})
     * @ORM\OrderBy({"type" = "ASC"})
     */
    protected $events;

    /**
     * @var ArrayCollection|ResourceSkill
     *
     * @ORM\OneToMany(targetEntity="ResourceSkill", mappedBy="category")
     */
    protected $skills;

    /**
     * Constructor
     */
    function __construct()
    {
        $this->resources = new ArrayCollection();
        $this->events = new ArrayCollection();
        $this->skills = new ArrayCollection();
    }

    /**
     * @return ArrayCollection|ScheduleEvent
     */
    public function getEvents()
    {
        return $this->events;
    }

    /**
     * @return int
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * @return boolean
     */
    public function getLastModified()
    {
        return $this->lastModified;
    }

    /**
     * @return string
     */
    public function getName()
    {
        return $this->name;
    }

    /**
     * @return ArrayCollection|Resource
     */
    public function getResources()
    {
        return $this->resources;
    }

    /**
     * @return ResourceSkill
     */
    public function getSkills()
    {
        return $this->skills;
    }

    /**
     * @param string $name
     */
    public function setName($name)
    {
        $this->name = $name;
    }
}
