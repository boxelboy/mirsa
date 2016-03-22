<?php
namespace Scheduler\Bundle\CommonBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use JMS\Serializer\Annotation as Serializer;

/**
 * ResourceSkill
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/scheduler/CommonBundle
 *
 * @ORM\Table(name="Resource_Skill_Types")
 * @ORM\Entity(repositoryClass="Scheduler\Bundle\CommonBundle\Repository\CommonRepository")
 *
 * @Serializer\ExclusionPolicy("all")
 * @Serializer\XmlRoot("skill")
 */
class ResourceSkill
{
    /**
     * @var int
     *
     * @ORM\Id
     * @ORM\Column(name="RoleID", type="integer")
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
     * @ORM\Column(name="External_Role_Descriptor", type="string")
     *
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $description;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="Mod_Timestamp", type="timestamp")
     */
    protected $lastModified;

    /**
     * @var ResourceCategory
     *
     * @ORM\ManyToOne(targetEntity="ResourceCategory", inversedBy="skills")
     * @ORM\JoinColumn(name="Role_CategoryID", referencedColumnName="Resource_Category_ID")
     */
    protected $category;

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
     * @return int
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
}
