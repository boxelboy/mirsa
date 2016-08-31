<?php
/**
 * Resource
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://webserver:8090/display/BMAN/Portal+Documentation
 */
namespace Mirsa\Bundle\MirsaBundle\Entity;

use Doctrine\ORM\Mapping as ORM,
    Symfony\Component\Validator\Constraints as Assert,
    JMS\Serializer\Annotation as Serializer;

/**
 * Resource entity
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://webserver:8090/display/BMAN/Portal+Documentation
 *
 * @ORM\Entity()
 * @ORM\Table(name="Scheduler_Resources")
 *
 * @Serializer\XmlRoot("resource")
 * @Serializer\ExclusionPolicy("all")
 */
class Resource
{
    /**
     * @ORM\Id
     * @ORM\Column(name="Resource_ID", type="integer")
     * @Serializer\Expose
     * @Serializer\XmlAttribute
     */
    protected $id;

    /**
     * @ORM\Column(name="Resource_Category_ID", type="string")
     */
    protected $categoryId;

    /**
     * @ORM\Column(name="Resource_Description", type="string")
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $description;

    /**
     * @ORM\Column(name="Resource_Email", type="string")
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $email;

    /**
     * @ORM\Column(name="Resource_Type", type="string")
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $type;

    /**
     * @ORM\Column(name="Resource_Name", type="string")
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $name;

    /**
     * @ORM\Column(name="Resource_Status", type="string")
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $status;

    /**
     * @ORM\ManyToOne(targetEntity="ResourceCategory", inversedBy="resources")
     * @ORM\JoinColumn(name="Resource_Category_ID", referencedColumnName="Resource_Category_ID")
     */
    protected $category;

    /**
     * @ORM\ManyToOne(targetEntity="Staff")
     * @ORM\JoinColumn(name="Staff_ID", referencedColumnName="Staff_ID")
     */
    protected $staff;

    /**
     * @ORM\ManyToMany(targetEntity="BusinessMan\Bundle\JobBundle\Entity\Job")
     * @ORM\JoinTable(name="ApiData_Schedule",
     *      joinColumns={@ORM\JoinColumn(name="Resource_ID", referencedColumnName="Resource_ID")},
     *      inverseJoinColumns={@ORM\JoinColumn(name="Group_ID", referencedColumnName="Group_ID")}
     *  )
     */
    //protected $jobs;                      - removed by cps

    /**
     * @ORM\OneToMany(targetEntity="Schedule", mappedBy="resource")
     */
    protected $schedules;

    public function __toString()
    {
        return $this->getName() ?: $this->getId();
    }

    public function getId()
    {
        return $this->id;
    }

    public function getCategoryId()
    {
        return $this->categoryId;
    }

    public function getCategory()
    {
        return $this->category;
    }

    /*public function getJobs()
    {
        return $this->jobs;
    }

    public function setJobs(array $jobs)
    {
        $this->jobs = $jobs;
        return $this;
    }*/

    public function getType()
    {
        return $this->type;
    }

    public function getStatus()
    {
        return $this->status;
    }

    public function getSchedules()
    {
        return $this->schedules;
    }

    public function getName()
    {
        return $this->name;
    }

    public function getStaff()
    {
        return $this->staff;
    }
}