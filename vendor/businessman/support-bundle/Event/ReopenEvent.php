<?php
namespace BusinessMan\Bundle\SupportBundle\Event;

/**
 * Event fired when a support ticket is reopened
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/businessmanportal/CommonBundle
 */
class ReopenEvent extends SupportCallEvent
{
    const EVENT = 'support.reopen';
}
