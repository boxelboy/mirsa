<?php
/**
 * Staff
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://webserver:8090/display/BMAN/Portal+Documentation
 */
namespace Mirsa\Bundle\MirsaBundle\Entity;

use Doctrine\ORM\Mapping as ORM,
    JMS\Serializer\Annotation as Serializer,
    Symfony\Component\Validator\Constraints as Assert;

/**
 * Staff entity
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://webserver:8090/display/BMAN/Portal+Documentation
 *
 * @ORM\Entity()
 * @ORM\Table(name="Staff")
 * @Serializer\XmlRoot("staff")
 * @Serializer\ExclusionPolicy("all")
 *
 */
class Staff
{
    /**
     * @ORM\Id
     * @ORM\Column(name="Staff_ID", type="string")
     * @Serializer\Expose
     * @Serializer\XmlAttribute
     */
    protected $id;

    /**
     * @ORM\Column(name="Scheduler_Resource_ID", type="string")
     */
    protected $resourceId;

    /**
     * @ORM\Column(name="Name_First", type="string")
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $forename;

    /**
     * @ORM\Column(name="Name_Last", type="string")
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $surname;

    /**
     * @ORM\Column(name="Personal_Photo", type="container")
     */
    protected $photo;

    /**
     * @ORM\Column(name="Name_Middle", type="string")
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $otherNames;

    /**
     * @ORM\Column(name="Email", type="string")
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $email;

    /**
     * @ORM\ManyToOne(targetEntity="Resource")
     * @ORM\JoinColumn(name="Scheduler_Resource_ID", referencedColumnName="Resource_ID")
     */
    protected $resource;

    /**
     * @ORM\OneToMany(targetEntity="EmailAccount", mappedBy="staff")
     */
    protected $emailAccounts;

    /**
     * @ORM\OneToMany(targetEntity="SupportCall", mappedBy="assignedTo")
     */
    protected $supportCalls;

    /**
     * @ORM\OneToMany(targetEntity="Timesheet", mappedBy="staff")
     */
    protected $timesheets;

    public function __toString()
    {
        return $this->getId();
    }

    public function getId()
    {
        return $this->id;
    }

    public function getResourceId()
    {
        return $this->resourceId;
    }

    public function setForename($forename)
    {
        $this->forename = $forename;
    }

    public function getForename()
    {
        return $this->forename;
    }

    public function setSurname($surname)
    {
        $this->surname = $surname;
    }

    public function getSurname()
    {
        return $this->surname;
    }

    public function getFullName()
    {
        return $this->getForename() . ' ' . $this->getSurname();
    }

    public function getPhoto()
    {
        return $this->photo;
    }

    public function setOtherNames($otherNames)
    {
        $this->otherNames = $otherNames;
    }

    public function getOtherNames()
    {
        return $this->otherNames;
    }

    public function setEmail($email)
    {
        $this->email = $email;
    }

    public function getEmail()
    {
        return $this->email;
    }

    public function getResource()
    {
        return $this->resource;
    }

    public function getEmailAccounts()
    {
        return $this->emailAccounts;
    }

    public function getSupportCalls()
    {
        return $this->supportCalls;
    }

    public function getTimesheets()
    {
        return $this->timesheets;
    }
}
