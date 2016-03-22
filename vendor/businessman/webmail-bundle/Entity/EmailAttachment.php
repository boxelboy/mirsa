<?php
namespace BusinessMan\Bundle\WebmailBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use JMS\Serializer\Annotation as Serializer;

/**
 * EmailAttachment
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/businessmanportal/WebmailBundle
 *
 * @ORM\Entity()
 * @ORM\Table(name="Email_Attachments")
 */
class EmailAttachment
{
    /**
     * @var int
     *
     * @ORM\Column(name="RecordID", type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="CUSTOM")
     * @ORM\CustomIdGenerator(class="Synergize\Bundle\DbalBundle\Driver\IdentityGenerator")
     */
    protected $id;

    /**
     * @var \Synergize\Bundle\DbalBundle\Type\ContainerField
     *
     * @ORM\Column(name="Attachment_Object", type="container")
     */
    protected $attachment;

    /**
     * @var string
     *
     * @ORM\Column(name="Name", type="string")
     */
    protected $filename;

    /**
     * @var int
     *
     * @ORM\Column(name="Size", type="integer")
     */
    protected $sizeInBytes;

    /**
     * @var EmailMessage
     *
     * @ORM\ManyToOne(targetEntity="EmailMessage")
     * @ORM\JoinColumn(name="Message_ID", referencedColumnName="Record_ID")
     */
    protected $emailMessage;

    /**
     * @return \Synergize\Bundle\DbalBundle\Type\ContainerField
     */
    public function getAttachment()
    {
        return $this->attachment;
    }

    /**
     * @return \BusinessMan\Bundle\WebmailBundle\Entity\EmailMessage
     */
    public function getEmailMessage()
    {
        return $this->emailMessage;
    }

    /**
     * @return string
     */
    public function getFilename()
    {
        return $this->filename;
    }

    /**
     * @return int
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * @return int
     */
    public function getSizeInBytes()
    {
        return $this->sizeInBytes;
    }

    /**
     * @param \Synergize\Bundle\DbalBundle\Type\ContainerField $attachment
     */
    public function setAttachment($attachment)
    {
        $this->attachment = $attachment;
    }

    /**
     * @param \BusinessMan\Bundle\WebmailBundle\Entity\EmailMessage $emailMessage
     */
    public function setEmailMessage($emailMessage)
    {
        $this->emailMessage = $emailMessage;
    }

    /**
     * @param string $filename
     */
    public function setFilename($filename)
    {
        $this->filename = $filename;
    }

    /**
     * @param int $sizeInBytes
     */
    public function setSizeInBytes($sizeInBytes)
    {
        $this->sizeInBytes = $sizeInBytes;
    }
}
