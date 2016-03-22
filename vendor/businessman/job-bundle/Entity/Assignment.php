<?php
namespace BusinessMan\Bundle\JobBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use JMS\Serializer\Annotation as Serializer;

/**
 * Assignment
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/businessman/JobBundle
 *
 * @ORM\Entity
 * @ORM\Table(name="Schedule")
 */
class Assignment
{
    /**
     * @var int
     *
     * @ORM\Id
     * @ORM\Column(name="Schedule_ID", type="integer")
     * @ORM\GeneratedValue(strategy="CUSTOM")
     * @ORM\CustomIdGenerator(class="Synergize\Bundle\DbalBundle\Driver\IdentityGenerator")
     */
    protected $id;

    /**
     * @var \Scheduler\Bundle\CommonBundle\Entity\Resource
     *
     * @ORM\ManyToOne(targetEntity="Scheduler\Bundle\CommonBundle\Entity\Resource", inversedBy="assignments")
     * @ORM\JoinColumn(name="Resource_ID", referencedColumnName="Resource_ID")
     */
    protected $resource;

    /**
     * @var Job
     *
     * @ORM\ManyToOne(targetEntity="Job", inversedBy="assignments")
     * @ORM\JoinColumn(name="Job_Number", referencedColumnName="Job_Number")
     */
    protected $job;

    /**
     * @return int
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * @return \BusinessMan\Bundle\JobBundle\Entity\Job
     */
    public function getJob()
    {
        return $this->job;
    }

    /**
     * @return \Scheduler\Bundle\CommonBundle\Entity\Resource
     */
    public function getResource()
    {
        return $this->resource;
    }

    /**
     * @param \BusinessMan\Bundle\JobBundle\Entity\Job $job
     */
    public function setJob($job)
    {
        $this->job = $job;
    }

    /**
     * @param \Scheduler\Bundle\CommonBundle\Entity\Resource $resource
     */
    public function setResource($resource)
    {
        $this->resource = $resource;
    }
}
