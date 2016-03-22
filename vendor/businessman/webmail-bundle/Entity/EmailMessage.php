<?php
namespace BusinessMan\Bundle\WebmailBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use JMS\Serializer\Annotation as Serializer;

/**
 * EmailMessage
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/businessmanportal/WebmailBundle
 *
 * @ORM\Entity()
 * @ORM\Table(name="Email_Messages")
 */
class EmailMessage
{
    /**
     * @var int
     *
     * @ORM\Column(name="Record_ID", type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="CUSTOM")
     * @ORM\CustomIdGenerator(class="Synergize\Bundle\DbalBundle\Driver\IdentityGenerator")
     */
    protected $id;

    /**
     * @var string
     *
     * @ORM\Column(name="Bcc", type="string")
     */
    protected $bcc;

    /**
     * @var string
     *
     * @ORM\Column(name="Body_HTML", type="string")
     */
    protected $messageBody;

    /**
     * @var string
     *
     * @ORM\Column(name="Cc", type="string")
     */
    protected $cc;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="Created_TS", type="timestamp")
     */
    protected $created;

    /**
     * @var boolean
     *
     * @ORM\Column(name="Inbound_Mail", type="boolean")
     */
    protected $inbound;

    /**
     * @var string
     *
     * @ORM\Column(name="`From`", type="string")
     */
    protected $fromEmail;

    /**
     * @var string
     *
     * @ORM\Column(name="From_Contact_Short", type="string")
     */
    protected $fromName;

    /**
     * @var string
     *
     * @ORM\Column(name="`To`", type="string")
     */
    protected $to;

    /**
     * @var string
     *
     * @ORM\Column(name="Subject", type="string")
     */
    protected $subject;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="TS_Received", type="timestamp")
     */
    protected $received;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="Date_V", type="date")
     */
    protected $receivedDate;

    /**
     * @var string
     *
     * @ORM\Column(name="To_Short_String", type="string")
     */
    protected $toNames;

    /**
     * @var string
     *
     * @ORM\Column(name="All_Recipients", type="string")
     */
    protected $toEmails;

    /**
     * @var boolean
     *
     * @ORM\Column(name="Sent_Or_Received", type="boolean")
     */
    protected $sentOrReceived;

    /**
     * @var string
     *
     * @ORM\Column(name="Message_ID", type="string")
     */
    protected $messageId;

    /**
     * @var \BusinessMan\Bundle\StaffBundle\Entity\Staff
     *
     * @ORM\ManyToOne(targetEntity="BusinessMan\Bundle\StaffBundle\Entity\Staff")
     * @ORM\JoinColumn(name="Staff_ID", referencedColumnName="Staff_ID", nullable=true)
     */
    protected $staff;

    /**
     * @var \BusinessMan\Bundle\ClientBundle\Entity\Client
     *
     * @ORM\ManyToOne(targetEntity="BusinessMan\Bundle\ClientBundle\Entity\Client")
     * @ORM\JoinColumn(name="Client_ID", referencedColumnName="Account_No", nullable=true)
     */
    protected $client;

    /**
     * @var \BusinessMan\Bundle\ClientBundle\Entity\ClientContact
     *
     * @ORM\ManyToOne(targetEntity="BusinessMan\Bundle\ClientBundle\Entity\ClientContact")
     * @ORM\JoinColumn(name="Client_Contact_ID", referencedColumnName="Record_ID", nullable=true)
     */
    protected $clientContact;

    function __construct()
    {
        $this->created = new \DateTime();
    }

    /**
     * @return string
     */
    public function getBcc()
    {
        return $this->bcc;
    }

    /**
     * @return string
     */
    public function getCc()
    {
        return $this->cc;
    }

    /**
     * @return \BusinessMan\Bundle\ClientBundle\Entity\Client
     */
    public function getClient()
    {
        return $this->client;
    }

    /**
     * @return \BusinessMan\Bundle\ClientBundle\Entity\ClientContact
     */
    public function getClientContact()
    {
        return $this->clientContact;
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
    public function getFromEmail()
    {
        return $this->fromEmail;
    }

    /**
     * @return string
     */
    public function getFromName()
    {
        return $this->fromName;
    }

    /**
     * @return int
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * @return boolean
     */
    public function getInbound()
    {
        return $this->inbound;
    }

    /**
     * @return string
     */
    public function getMessageBody()
    {
        return $this->messageBody;
    }

    /**
     * @return string
     */
    public function getMessageId()
    {
        return $this->messageId;
    }

    /**
     * @return \DateTime
     */
    public function getReceived()
    {
        return $this->received;
    }

    /**
     * @return \DateTime
     */
    public function getReceivedDate()
    {
        return $this->receivedDate;
    }

    /**
     * @return boolean
     */
    public function getSentOrReceived()
    {
        return $this->sentOrReceived;
    }

    /**
     * @return \BusinessMan\Bundle\StaffBundle\Entity\Staff
     */
    public function getStaff()
    {
        return $this->staff;
    }

    /**
     * @return string
     */
    public function getSubject()
    {
        return $this->subject;
    }

    /**
     * @return string
     */
    public function getTo()
    {
        return $this->to;
    }

    /**
     * @return string
     */
    public function getToEmails()
    {
        return $this->toEmails;
    }

    /**
     * @return string
     */
    public function getToNames()
    {
        return $this->toNames;
    }

    /**
     * @param string $bcc
     */
    public function setBcc($bcc)
    {
        $this->bcc = $bcc;
    }

    /**
     * @param string $cc
     */
    public function setCc($cc)
    {
        $this->cc = $cc;
    }

    /**
     * @param \BusinessMan\Bundle\ClientBundle\Entity\Client $client
     */
    public function setClient($client)
    {
        $this->client = $client;
    }

    /**
     * @param \BusinessMan\Bundle\ClientBundle\Entity\ClientContact $clientContact
     */
    public function setClientContact($clientContact)
    {
        $this->clientContact = $clientContact;
    }

    /**
     * @param \DateTime $created
     */
    public function setCreated($created)
    {
        $this->created = $created;
    }

    /**
     * @param string $fromEmail
     */
    public function setFromEmail($fromEmail)
    {
        $this->fromEmail = $fromEmail;
    }

    /**
     * @param string $fromName
     */
    public function setFromName($fromName)
    {
        $this->fromName = $fromName;
    }

    /**
     * @param boolean $inbound
     */
    public function setInbound($inbound)
    {
        $this->inbound = $inbound;
    }

    /**
     * @param string $messageBody
     */
    public function setMessageBody($messageBody)
    {
        $this->messageBody = $messageBody;
    }

    /**
     * @param string $messageId
     */
    public function setMessageId($messageId)
    {
        $this->messageId = $messageId;
    }

    /**
     * @param \DateTime $received
     */
    public function setReceived($received)
    {
        $this->received = $received;
    }

    /**
     * @param \DateTime $receivedDate
     */
    public function setReceivedDate($receivedDate)
    {
        $this->receivedDate = $receivedDate;
    }

    /**
     * @param boolean $sentOrReceived
     */
    public function setSentOrReceived($sentOrReceived)
    {
        $this->sentOrReceived = $sentOrReceived;
    }

    /**
     * @param \BusinessMan\Bundle\StaffBundle\Entity\Staff $staff
     */
    public function setStaff($staff)
    {
        $this->staff = $staff;
    }

    /**
     * @param string $subject
     */
    public function setSubject($subject)
    {
        $this->subject = $subject;
    }

    /**
     * @param string $to
     */
    public function setTo($to)
    {
        $this->to = $to;
    }

    /**
     * @param string $toEmails
     */
    public function setToEmails($toEmails)
    {
        $this->toEmails = $toEmails;
    }

    /**
     * @param string $toNames
     */
    public function setToNames($toNames)
    {
        $this->toNames = $toNames;
    }
}
