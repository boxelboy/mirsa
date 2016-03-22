<?php
namespace BusinessMan\Bundle\StaffBundle\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use JMS\Serializer\Annotation as Serializer;

/**
 * Staff
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/businessmanportal/StaffBundle
 *
 * @ORM\Entity()
 * @ORM\Table(name="Staff")
 *
 * @Serializer\ExclusionPolicy("all")
 * @Serializer\XmlRoot("staff")
 */
class Staff
{
    /**
     * @var string
     *
     * @ORM\Id
     * @ORM\Column(name="Staff_ID", type="string")
     * @ORM\GeneratedValue(strategy="CUSTOM")
     * @ORM\CustomIdGenerator(class="Synergize\Bundle\DbalBundle\Driver\IdentityGenerator")
     *
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $id;

    /**
     * @var string
     *
     * @ORM\Column(name="Name_First", type="string")
     *
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $forename;

    /**
     * @var string
     *
     * @ORM\Column(name="Name_Last", type="string")
     *
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $surname;

    /**
     * @var \Synergize\Bundle\DbalBundle\Type\ContainerField
     *
     * @ORM\Column(name="Personal_Photo", type="container")
     */
    protected $photo;

    /**
     * @var string
     *
     * @ORM\Column(name="Name_Middle", type="string")
     */
    protected $otherNames;

    /**
     * @var string
     *
     * @ORM\Column(name="Email", type="string")
     */
    protected $email;

    /**
     * @var \Scheduler\Bundle\CommonBundle\Entity\Resource
     *
     * @ORM\ManyToOne(targetEntity="Scheduler\Bundle\CommonBundle\Entity\Resource")
     * @ORM\JoinColumn(name="Scheduler_Resource_ID", referencedColumnName="Resource_ID")
     */
    protected $resource;

    /**
     * @var Staff
     *
     * @ORM\ManyToOne(targetEntity="Staff", inversedBy="managedStaff")
     * @ORM\JoinColumn(name="Managed_By_ID", referencedColumnName="Staff_ID")
     */
    protected $manager;

    /**
     * @var ArrayCollection|Absence
     *
     * @ORM\OneToMany(targetEntity="Absence", mappedBy="staff")
     */
    protected $absences;

    /**
     * @var ArrayCollection|Staff
     *
     * @ORM\OneToMany(targetEntity="Staff", mappedBy="manager")
     */
    protected $managedStaff;

    function __construct()
    {
        $this->absences = new ArrayCollection();
        $this->managedStaff = new ArrayCollection();
    }

    /**
     * @return \BusinessMan\Bundle\StaffBundle\Entity\Absence|\Doctrine\Common\Collections\ArrayCollection
     */
    public function getAbsences()
    {
        return $this->absences;
    }

    /**
     * @return string
     */
    public function getDisplayName()
    {
        return $this->getForename() . ' ' . $this->getSurname();
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
    public function getForename()
    {
        return $this->forename;
    }

    /**
     * @return string
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * @return \BusinessMan\Bundle\StaffBundle\Entity\Staff|\Doctrine\Common\Collections\ArrayCollection
     */
    public function getManagedStaff()
    {
        return $this->managedStaff;
    }

    /**
     * @return \BusinessMan\Bundle\StaffBundle\Entity\Staff
     */
    public function getManager()
    {
        return $this->manager;
    }

    /**
     * @return string
     */
    public function getOtherNames()
    {
        return $this->otherNames;
    }

    /**
     * @return \Synergize\Bundle\DbalBundle\Type\ContainerField
     */
    public function getPhoto()
    {
        return $this->photo;
    }

    /**
     * @return \Scheduler\Bundle\CommonBundle\Entity\Resource
     */
    public function getResource()
    {
        return $this->resource;
    }

    /**
     * @return string
     */
    public function getSurname()
    {
        return $this->surname;
    }

    /**
     * @param string $email
     */
    public function setEmail($email)
    {
        $this->email = $email;
    }

    /**
     * @param string $forename
     */
    public function setForename($forename)
    {
        $this->forename = $forename;
    }

    /**
     * @param \BusinessMan\Bundle\StaffBundle\Entity\Staff $manager
     */
    public function setManager($manager)
    {
        $this->manager = $manager;
    }

    /**
     * @param string $otherNames
     */
    public function setOtherNames($otherNames)
    {
        $this->otherNames = $otherNames;
    }

    /**
     * @param \Synergize\Bundle\DbalBundle\Type\ContainerField $photo
     */
    public function setPhoto($photo)
    {
        $this->photo = $photo;
    }

    /**
     * @param \Scheduler\Bundle\CommonBundle\Entity\Resource $resource
     */
    public function setResource($resource)
    {
        $this->resource = $resource;
    }

    /**
     * @param string $surname
     */
    public function setSurname($surname)
    {
        $this->surname = $surname;
    }
}
