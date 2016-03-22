<?php
namespace Mirsa\Bundle\MirsaBundle\Entity;

use Doctrine\ORM\Mapping as ORM,
    JMS\Serializer\Annotation as Serializer,
    FSC\HateoasBundle\Annotation as RestHateoas;

/**
 * SupportCall
 *
 * @ORM\Table(name="Support_Call")
 * @ORM\Entity()
 *
 * @Serializer\XmlRoot("supportcall")
 * @Serializer\ExclusionPolicy("all")
 */
class SupportCall
{
    /**
     * @ORM\Column(name="Key_Primary", type="string")
     * @ORM\Id
     * @Serializer\Expose
     * @Serializer\XmlAttribute
     */
    protected $id;

    /**
     * @ORM\Column(name="Call_Description", type="string")
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $description;

    /**
     * @ORM\Column(name="Call_Status", type="string")
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $status;

    /**
     * @ORM\Column(name="Call_To_Action", type="string")
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $toAction;

    /**
     * @ORM\Column(name="Call_Type", type="string")
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $type;

    /**
     * @ORM\Column(name="Creation_Timestamp", type="timestamp")
     * @Serializer\Expose
     * @Serializer\Type("DateTime")
     */
    protected $created;

    /**
     * @ORM\Column(name="Closing_Timestamp", type="timestamp")
     * @Serializer\Expose
     * @Serializer\Type("DateTime")
     */
    protected $closed;

    /**
     * @ORM\ManyToOne(targetEntity="Asset", inversedBy="supportCalls")
     * @ORM\JoinColumn(name="Asset_ID", referencedColumnName="Asset_ID")
     */
    protected $asset;

    /**
     * @ORM\ManyToOne(targetEntity="Contract", inversedBy="supportCalls")
     * @ORM\JoinColumn(name="Contract_No", referencedColumnName="Contract_No")
     */
    protected $contract;

    /**
     * @ORM\ManyToOne(targetEntity="Client", inversedBy="supportCalls")
     * @ORM\JoinColumn(name="Customer_Account_Number", referencedColumnName="Account_No")
     */
    protected $client;

    /**
     * @ORM\ManyToOne(targetEntity="Staff", inversedBy="supportCalls")
     * @ORM\JoinColumn(name="Allocated_Staff_ID", referencedColumnName="Staff_ID")
     */
    protected $assignedTo;

    /**
     * @ORM\OneToMany(targetEntity="SupportCallItem", mappedBy="supportCall")
     */
    protected $items;

    public function getId()
    {
        return $this->id;
    }

    public function getDescription()
    {
        return $this->description;
    }

    public function setDescription($description)
    {
        $this->description = $description;
    }

    public function getStatus()
    {
        return $this->status;
    }

    public function setStatus($status)
    {
        $this->status = $status;
        return $this;
    }

    public function getToAction()
    {
        return $this->toAction;
    }

    public function setToAction($toAction)
    {
        $this->toAction = $toAction;
        return $this;
    }

    public function getType()
    {
        return $this->type;
    }

    public function getCreated()
    {
        return $this->created;
    }

    public function getClosed()
    {
        return $this->closed;
    }

    public function setClosed($closed)
    {
        $this->closed = $closed;
        return $this;
    }

    public function getAsset()
    {
        return $this->asset;
    }

    public function getClient()
    {
        return $this->client;
    }

    public function setClient($client)
    {
        $this->client = $client;
        return $this;
    }

    public function getContract()
    {
        return $this->contract;
    }

    public function getAssignedTo()
    {
        return $this->assignedTo;
    }

    public function setAssignedTo($assignedTo)
    {
        $this->assignedTo = $assignedTo;
    }

    public function getItems()
    {
        return $this->items;
    }

    public function setItems(array $items)
    {
        $this->items = $items;
        return $this;
    }

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
        if (is_array($this->getItems())) {
            foreach ($this->getItems() as $item) {
                if ($item->getContact() && $item->getContact()->getEmail()) {
                    if (!in_array($item->getContact()->getEmail(), $emails)) {
                        $emails[] = $item->getContact()->getEmail();
                    }
                }

                if (filter_var($item->getCreatedBy(), FILTER_VALIDATE_EMAIL) && !in_array($item->getCreatedBy(), $emails)) {
                    $emails[] = $item->getCreatedBy();
                }
            }
        }

        return $emails;
    }
}
