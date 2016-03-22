<?php
namespace BusinessMan\Bundle\SupportBundle\Event;

/**
 * Event fired when a support ticket is replied to
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/businessmanportal/CommonBundle
 */
class ReplyEvent extends SupportCallEvent
{
    const EVENT = 'support.reply';
}
