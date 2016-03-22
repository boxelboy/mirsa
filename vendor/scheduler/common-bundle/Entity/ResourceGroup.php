<?php
namespace Scheduler\Bundle\CommonBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Doctrine\Common\Collections\ArrayCollection;
use JMS\Serializer\Annotation as Serializer;

/**
 * ResourceCategory
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/scheduler/CommonBundle
 *
 * @ORM\Entity(repositoryClass="Scheduler\Bundle\CommonBundle\Repository\CommonRepository")
 * @ORM\Table(name="Scheduler_Groups")
 *
 * @Serializer\ExclusionPolicy("all")
 * @Serializer\XmlRoot("group")
 */
class ResourceGroup
{
    /**
     * @var int
     *
     * @ORM\Id
     * @ORM\Column(name="Groups_Group_ID", type="integer")
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
     * @ORM\Column(name="Groups_Name", type="string")
     *
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $name;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="Modified_TS", type="timestamp")
     */
    protected $lastModified;

    /**
     * @var ArrayCollection|ResourceGroupMembership
     *
     * @ORM\OneToMany(targetEntity="ResourceGroupMembership", mappedBy="group", cascade={"remove"})
     */
    protected $memberships;

    public function __construct()
    {
        $this->memberships = new ArrayCollection();
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
     * @param string $name
     */
    public function setName($name)
    {
        $this->name = $name;
    }
}
