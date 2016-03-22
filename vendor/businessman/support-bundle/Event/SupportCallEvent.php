<?php
namespace BusinessMan\Bundle\SupportBundle\Event;

use BusinessMan\Bundle\BusinessManBundle\Entity\User;
use BusinessMan\Bundle\SupportBundle\Entity\SupportCallMessage;
use Symfony\Component\EventDispatcher\Event;

/**
 * Abstract class for support call events
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/businessmanportal/CommonBundle
 */
abstract class SupportCallEvent extends Event
{
    /**
     * @var \BusinessMan\Bundle\SupportBundle\Entity\SupportCallMessage
     */
    protected $SupportCallMessage;

    /**
     * @var \BusinessMan\Bundle\BusinessManBundle\Entity\User
     */
    protected $user;

    public function __construct(SupportCallMessage $SupportCallMessage, User $user)
    {
        $this->SupportCallMessage = $SupportCallMessage;
        $this->user = $user;
    }

    /**
     * @return \BusinessMan\Bundle\SupportBundle\Entity\SupportCallMessage
     */
    public function getSupportCallMessage()
    {
        return $this->SupportCallMessage;
    }

    /**
     * @return \BusinessMan\Bundle\BusinessManBundle\Entity\User
     */
    public function getUser()
    {
        return $this->user;
    }
}
