<?php
/**
 * Notification
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://webserver:8090/display/BMAN/Portal+Documentation
 */
namespace Mirsa\Bundle\MirsaBundle\Entity;

use Doctrine\ORM\Mapping as ORM,
    BusinessMan\BaseBundle\Notification\NotificationInterface;

/**
 * Notification entity
 *
 * Wraps a serialized object that extends NotificationInterface
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://webserver:8090/display/BMAN/Portal+Documentation
 *
 * @ORM\Entity
 * @ORM\Table(name="Web_Notifications")
 */
class Notification
{
    /**
     * @var int
     *
     * @ORM\Id
     * @ORM\Column(name="Notification_ID", type="integer")
     */
    protected $id;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="Creation_Timestamp", type="timestamp")
     */
    protected $created;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="View_Timestamp", type="timestamp")
     */
    protected $viewed;

    /**
     * @var string
     *
     * @ORM\Column(name="Serialized_Notification", type="string")
     */
    protected $serializedNotification;

    /**
     * @var User
     *
     * @ORM\ManyToOne(targetEntity="User", inversedBy="notifications")
     * @ORM\JoinColumn(name="Notification_User_ID", referencedColumnName="User_ID")
     */
    protected $user;

    public function getId()
    {
        return $this->id;
    }

    public function getCreated()
    {
        return $this->created;
    }

    public function getViewed()
    {
        return $this->viewed;
    }

    public function setViewed(\DateTime $viewed)
    {
        $this->viewed = $viewed;
        return $this;
    }

    public function getUser()
    {
        return $this->user;
    }

    public function setUser(User $user)
    {
        $this->user = $user;
        return $this;
    }

    public function getNotification()
    {
        return unserialize(base64_decode($this->serializedNotification));
    }

    public function setNotification(NotificationInterface $notification)
    {
        $this->serializedNotification = base64_encode(serialize($notification));
        return $this;
    }
}
