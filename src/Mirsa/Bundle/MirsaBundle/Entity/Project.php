<?php

namespace Mirsa\Bundle\MirsaBundle\Entity;

use Doctrine\ORM\Mapping as ORM,
    Symfony\Component\Validator\Constraints as Assert,
    JMS\Serializer\Annotation as Serializer,
    FSC\HateoasBundle\Annotation as RestHateoas;

/**
 * Project entity
 *
 * @author cps
 * @link   http://webserver:8090/display/BMAN/Portal+Documentation
 *
 * @ORM\Entity
 * @ORM\Table(name="Project")
 *
 * @Serializer\XmlRoot("project")
 * @Serializer\ExclusionPolicy("all")
 */
class Project
{
    /**
     * @var int
     *
     * @ORM\Id
     * @ORM\Column(name="Project_ID", type="integer")
     * @Serializer\Expose
     * @Serializer\XmlAttribute
     */
    protected $id;

    /**
     * @var string
     *
     * @ORM\Column(name="Name", type="string")
     * @Serializer\Expose
     */
    protected $name;

    /**
     * @var string
     *
     * @ORM\Column(name="Description", type="string")
     * @Serializer\Expose
     */
    protected $description;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="Creation_Timestamp", type="timestamp")
     */
    protected $created;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="Mod_Timestamp", type="timestamp")
     */
    protected $modified;

    /**
     * @var Client
     *
     * @ORM\ManyToOne(targetEntity="Client", inversedBy="projects")
     * @ORM\JoinColumn(name="Account_Number", referencedColumnName="Account_No")
     */
    protected $client;

    /**
     * @var array
     *
     * @ORM\OneToMany(targetEntity="BusinessMan\Bundle\JobBundle\Entity\Job", mappedBy="project")
     */
    protected $jobs;

    public function getId()
    {
        return $this->id;
    }

    public function getName()
    {
        return $this->name;
    }

    public function setName($name)
    {
        $this->name = $name;
        return $this;
    }

    public function getDescription()
    {
        return $this->description;
    }

    public function setDescription($description)
    {
        $this->description = $description;
        return $this;
    }

    public function getCreated()
    {
        return $this->created;
    }

    public function getModified()
    {
        return $this->modified;
    }

    public function getClient()
    {
        return $this->client;
    }

    public function setClient(Client $client)
    {
        $this->client = $client;
        return $this;
    }

    public function getJobs()
    {
        return $this->jobs;
    }
}
