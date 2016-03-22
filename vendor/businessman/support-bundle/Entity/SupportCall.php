<?php
namespace BusinessMan\Bundle\SupportBundle\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use JMS\Serializer\Annotation as Serializer;

/**
 * SupportCall
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/businessmanportal/SupportBundle
 *
 * @ORM\Table(name="Support_Calls")
 * @ORM\Entity()
 *
 * @Serializer\ExclusionPolicy("all")
 * @Serializer\XmlRoot("ticket")
 */
class SupportCall
{
    /**
     * @var string
     *
     * @ORM\Column(name="Key_Primary", type="string")
     * @ORM\Id
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
     * @ORM\Column(name="Call_Description", type="string")
     *
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $description;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="Job_Count_Mod", type="timestamp")
     */
    protected $lastModified;

    /**
     * @var string
     *
     * @ORM\Column(name="Call_Status", type="string")
     *
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $status;

    /**
     * @var string
     *
     * @ORM\Column(name="Call_To_Action", type="string")
     *
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $toAction;

    /**
     * @var string
     *
     * @ORM\Column(name="Call_Type", type="string")
     */
    protected $type;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="Creation_Timestamp", type="timestamp")
     *
     * @Serializer\Expose
     * @Serializer\Type("DateTime<'Y-m-d H:i:s'>")
     */
    protected $created;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="Closing_Timestamp", type="timestamp")
     *
     * @Serializer\Expose
     * @Serializer\Type("DateTime<'Y-m-d H:i:s'>")
     */
    protected $closed;

    /**
     * @var \BusinessMan\Bundle\ClientBundle\Entity\Client
     *
     * @ORM\ManyToOne(targetEntity="BusinessMan\Bundle\ClientBundle\Entity\Client")
     * @ORM\JoinColumn(name="Customer_Account_Number", referencedColumnName="Account_No")
     *
     * @Serializer\Expose
     * @Serializer\Type("BusinessMan\Bundle\ClientBundle\Entity\Client")
     */
    protected $client;

    /**
     * @var \BusinessMan\Bundle\StaffBundle\Entity\Staff
     *
     * @ORM\ManyToOne(targetEntity="BusinessMan\Bundle\StaffBundle\Entity\Staff")
     * @ORM\JoinColumn(name="Allocated_Staff_ID", referencedColumnName="Staff_ID")
     *
     * @Serializer\Expose
     * @Serializer\Type("BusinessMan\Bundle\StaffBundle\Entity\Staff")
     */
    protected $assignedTo;

    /**
     * @var ArrayCollection|SupportCallMessage
     *
     * @ORM\OneToMany(targetEntity="SupportCallMessage", mappedBy="supportCall")
     * @ORM\OrderBy({"created" = "ASC"})
     *
     * @Serializer\Expose
     * @Serializer\Type("BusinessMan\Bundle\SupportBundle\Entity\SupportCallMessage")
     */
    protected $messages;

    function __construct()
    {
        $this->created = new \DateTime();
        $this->messages = new ArrayCollection();
    }

    public function getDisplayName()
    {
        return sprintf('[%s] %s',
            $this->getId(),
            substr($this->getDescription(), 0, 50)
        );
    }

    /**
     * @return array|string
     */
    public function getUpdateEmails()
    {
        $emails = array();

        // Default client contact
        if ($this->getClient()
            && $this->getClient()->getDefaultContact()
            && $this->getClient()->getDefaultContact()->getEmail()
        ) {
            $emails[] = $this->getClient()->getDefaultContact()->getEmail();
        }

        // Email addresses from items
        if (is_array($this->getMessages())) {
            foreach ($this->getMessages() as $message) {
                if ($message->getContact() && $message->getContact()->getEmail()) {
                    if (!in_array($message->getContact()->getEmail(), $emails)) {
                        $emails[] = $message->getContact()->getEmail();
                    }
                }

                if (filter_var($message->getCreatedBy(), FILTER_VALIDATE_EMAIL) &&
                    !in_array($message->getCreatedBy(), $emails)
                ) {
                    $emails[] = $message->getCreatedBy();
                }
            }
        }

        return $emails;
    }

    /**
     * @return \BusinessMan\Bundle\StaffBundle\Entity\Staff
     */
    public function getAssignedTo()
    {
        return $this->assignedTo;
    }

    /**
     * @return \BusinessMan\Bundle\ClientBundle\Entity\Client
     */
    public function getClient()
    {
        return $this->client;
    }

    /**
     * @return \DateTime
     */
    public function getClosed()
    {
        return $this->closed;
    }

    /**
     * @return \DateTime
     */
    public function getCreated()
    {
        return $this->created;
    }

    /**
     * @return string
     */
    public function getDescription()
    {
        return $this->description;
    }

    /**
     * @return string
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * @return \BusinessMan\Bundle\SupportBundle\Entity\SupportCallMessage|\Doctrine\Common\Collections\ArrayCollection
     */
    public function getMessages()
    {
        return $this->messages;
    }

    /**
     * @return \DateTime
     */
    public function getLastModified()
    {
        return $this->lastModified;
    }

    /**
     * @return string
     */
    public function getStatus()
    {
        return $this->status;
    }

    /**
     * @return string
     */
    public function getToAction()
    {
        return $this->toAction;
    }

    /**
     * @return string
     */
    public function getType()
    {
        return $this->type;
    }

    /**
     * @param \BusinessMan\Bundle\StaffBundle\Entity\Staff $assignedTo
     */
    public function setAssignedTo($assignedTo)
    {
        $this->assignedTo = $assignedTo;
    }

    /**
     * @param \BusinessMan\Bundle\ClientBundle\Entity\Client $client
     */
    public function setClient($client)
    {
        $this->client = $client;
    }

    /**
     * @param \DateTime $closed
     */
    public function setClosed($closed)
    {
        $this->closed = $closed;
    }

    /**
     * @param string $description
     */
    public function setDescription($description)
    {
        $this->description = $description;
    }

    /**
     * @param string $status
     */
    public function setStatus($status)
    {
        $this->status = $status;
    }

    /**
     * @param string $toAction
     */
    public function setToAction($toAction)
    {
        $this->toAction = $toAction;
    }

    /**
     * @param string $type
     */
    public function setType($type)
    {
        $this->type = $type;
    }
}
