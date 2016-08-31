<?php
/**
 * ResourceCategory
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://webserver:8090/display/BMAN/Portal+Documentation
 */
namespace Mirsa\Bundle\MirsaBundle\Entity;

use Doctrine\ORM\Mapping as ORM,
    Symfony\Component\Validator\Constraints as Assert,
    JMS\Serializer\Annotation as Serializer;

/**
 * ResourceCategory entity
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://webserver:8090/display/BMAN/Portal+Documentation
 *
 * @ORM\Entity()
 * @ORM\Table(name="Scheduler_Resource_Categories")
 *
 * @Serializer\XmlRoot("resourcecategory")
 * @Serializer\ExclusionPolicy("all")
 *
 */
class ResourceCategory
{
    /**
     * @ORM\Id
     * @ORM\Column(name="Resource_Category_ID", type="integer")
     * @Serializer\Expose
     * @Serializer\XmlAttribute
     */
    protected $id;

    /**
     * @ORM\Column(name="Resource_Category", type="string")
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $name;

    /**
     * @ORM\OneToMany(targetEntity="Resource", mappedBy="category")
     * @ORM\OrderBy({"name" = "ascend"})
     */
    protected $resources;

    public function getId()
    {
        return $this->id;
    }

    /**
     * Set name
     *
     * @param string $name
     *
     * @return null
     */
    public function setName($name)
    {
        $this->name = $value;
    }

    /**
     * Get name
     *
     * @return string
     */
    public function getName()
    {
        return $this->name;
    }

    public function getResources()
    {
        return $this->resources;
    }
}
