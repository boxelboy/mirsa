<?php
namespace Scheduler\Bundle\CommonBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use JMS\Serializer\Annotation as Serializer;

/**
 * ResourceGroupMembership
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/scheduler/CommonBundle
 *
 * @ORM\Entity(repositoryClass="Scheduler\Bundle\CommonBundle\Repository\CommonRepository")
 * @ORM\Table(name="Scheduler_Groups_Resources")
 */
class ResourceGroupMembership
{
    /**
     * @var int
     *
     * @ORM\Id
     * @ORM\Column(name="Record_ID", type="integer")
     * @ORM\GeneratedValue(strategy="CUSTOM")
     * @ORM\CustomIdGenerator(class="Synergize\Bundle\DbalBundle\Driver\IdentityGenerator")
     */
    protected $id;

    /**
     * @var ResourceGroup
     *
     * @ORM\ManyToOne(targetEntity="ResourceGroup", inversedBy="memberships")
     * @ORM\JoinColumn(name="Groups_Group_ID", referencedColumnName="Groups_Group_ID")
     */
    protected $group;

    /**
     * @var Resource
     *
     * @ORM\ManyToOne(targetEntity="Resource", inversedBy="memberships")
     * @ORM\JoinColumn(name="Resource_ID", referencedColumnName="Resource_ID")
     */
    protected $resource;

    /**
     * @return int
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * @return ResourceGroup
     */
    public function getGroup()
    {
        return $this->group;
    }

    /**
     * @return Resource
     */
    public function getResource()
    {
        return $this->resource;
    }

    /**
     * @param ResourceGroup $group
     */
    public function setGroup($group)
    {
        $this->group = $group;
    }

    /**
     * @param Resource $resource
     */
    public function setResource($resource)
    {
        $this->resource = $resource;
    }
}
