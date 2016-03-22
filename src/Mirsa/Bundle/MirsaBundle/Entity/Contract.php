<?php
namespace Mirsa\Bundle\MirsaBundle\Entity;

use Doctrine\ORM\Mapping as ORM,
    JMS\Serializer\Annotation as Serializer;

/**
 * Contract
 *
 * @ORM\Table(name="ApiData_Contracts")
 * @ORM\Entity()
 *
 * @Serializer\XmlRoot("contract")
 * @Serializer\ExclusionPolicy("all")
 *
 */
class Contract
{
    /**
     * @ORM\Column(name="Contract_No", type="integer")
     * @ORM\Id
     * @Serializer\Expose
     * @Serializer\XmlAttribute
     */
    protected $id;

    /**
     * @ORM\Column(name="Contract_Start_Date", type="date")
     * @Serializer\Expose
     * @Serializer\Type("DateTime<'Y-m-dO'>")
     */
    protected $startDate;

    /**
     * @ORM\Column(name="Contract_Expiry_Date", type="date")
     * @Serializer\Expose
     * @Serializer\Type("DateTime<'Y-m-dO'>")
     */
    protected $expiryDate;

    /**
     * @ORM\Column(name="Site_Title", type="string")
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $siteTitle;

    /**
     * @ORM\OneToMany(targetEntity="Asset", mappedBy="contract")
     */
    protected $assets;

    /**
     * @ORM\ManyToOne(targetEntity="Client", inversedBy="contracts")
     * @ORM\JoinColumn(name="Account_No", referencedColumnName="Account_No")
     */
    protected $client;

    /**
     * @ORM\OneToMany(targetEntity="SupportCall", mappedBy="contract")
     */
    protected $supportCalls;

    /**
     * Get id
     *
     * @return integer
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * Set name
     *
     * @param string $forename
     * @return Client
     */
    public function setName($name)
    {
        $this->name = $name;

        return $this;
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

    public function getManager()
    {
        return $this->manager;
    }

    public function getClient()
    {
        return $this->client;
    }

    public function getAssets()
    {
        return $this->assets;
    }

    public function getSiteTitle()
    {
        return $this->siteTitle;
    }

    public function getStartDate()
    {
        return $this->startDate;
    }

    public function getExpiryDate()
    {
        return $this->expiryDate;
    }
}
