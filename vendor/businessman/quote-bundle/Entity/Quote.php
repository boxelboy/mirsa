<?php
namespace BusinessMan\Bundle\QuoteBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use JMS\Serializer\Annotation as Serializer;

/**
 * Quote
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/businessmanportal/QuoteBundle
 *
 * @ORM\Entity()
 * @ORM\Table(name="Quote")
 *
 * @Serializer\ExclusionPolicy("all")
 * @Serializer\XmlRoot("job")
 */
class Quote
{
    /**
     * @var string
     *
     * @ORM\Column(name="Quote_Number", type="string")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="CUSTOM")
     * @ORM\CustomIdGenerator(class="Synergize\Bundle\DbalBundle\Driver\IdentityGenerator")
     *
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $id;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="Followup_Date", type="date")
     *
     * @Serializer\Expose
     * @Serializer\Type("DateTime<'Y-m-d'>")
     */
    protected $followUp;

    /**
     * @var string
     *
     * @ORM\Column(name="Quote_Status", type="string")
     *
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $status;

    /**
     * @var double
     *
     * @ORM\Column(name="Incomplete_Net_Total", type="decimal")
     *
     * @Serializer\Expose
     * @Serializer\Type("double")
     */
    protected $netTotal;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="ModTimestamp", type="timestamp")
     */
    protected $lastModified;

    /**
     * @var \BusinessMan\Bundle\ClientBundle\Entity\Client
     *
     * @ORM\ManyToOne(targetEntity="BusinessMan\Bundle\ClientBundle\Entity\Client")
     * @ORM\JoinColumn(name="Customer_Account_No", referencedColumnName="Account_No")
     *
     * @Serializer\Expose
     * @Serializer\Type("BusinessMan\Bundle\ClientBundle\Entity\Client")
     */
    protected $client;

    /**
     * @var \BusinessMan\Bundle\StaffBundle\Entity\Staff
     *
     * @ORM\ManyToOne(targetEntity="BusinessMan\Bundle\StaffBundle\Entity\Staff")
     * @ORM\JoinColumn(name="Staff_ID", referencedColumnName="Staff_ID")
     */
    protected $creator;

    /**
     * @var \BusinessMan\Bundle\StaffBundle\Entity\Staff
     *
     * @ORM\ManyToOne(targetEntity="BusinessMan\Bundle\StaffBundle\Entity\Staff")
     * @ORM\JoinColumn(name="Follow_Up_By_ID", referencedColumnName="Staff_ID")
     */
    protected $followUpBy;

    /**
     * @return \BusinessMan\Bundle\ClientBundle\Entity\Client
     */
    public function getClient()
    {
        return $this->client;
    }

    /**
     * @return \BusinessMan\Bundle\StaffBundle\Entity\Staff
     */
    public function getCreator()
    {
        return $this->creator;
    }

    /**
     * @return \DateTime
     */
    public function getFollowUp()
    {
        return $this->followUp;
    }

    /**
     * @return \BusinessMan\Bundle\StaffBundle\Entity\Staff
     */
    public function getFollowUpBy()
    {
        return $this->followUpBy;
    }

    /**
     * @return string
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
     * @return float
     */
    public function getNetTotal()
    {
        return $this->netTotal;
    }

    /**
     * @return string
     */
    public function getStatus()
    {
        return $this->status;
    }

    /**
     * @param \BusinessMan\Bundle\StaffBundle\Entity\Staff $creator
     */
    public function setCreator($creator)
    {
        $this->creator = $creator;
    }

    /**
     * @param \DateTime $followUp
     */
    public function setFollowUp($followUp)
    {
        $this->followUp = $followUp;
    }

    /**
     * @param \BusinessMan\Bundle\StaffBundle\Entity\Staff $followUpBy
     */
    public function setFollowUpBy($followUpBy)
    {
        $this->followUpBy = $followUpBy;
    }

    /**
     * @param float $netTotal
     */
    public function setNetTotal($netTotal)
    {
        $this->netTotal = $netTotal;
    }

    /**
     * @param string $status
     */
    public function setStatus($status)
    {
        $this->status = $status;
    }

    /**
     * @param \BusinessMan\Bundle\ClientBundle\Entity\Client $client
     */
    public function setClient($client)
    {
        $this->client = $client;
    }
}
