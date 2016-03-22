<?php
namespace BusinessMan\Bundle\SupportBundle\Event;

/**
 * Event fired when a support ticket is assigned
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/businessmanportal/CommonBundle
 */
class AssignEvent extends SupportCallEvent
{
    const EVENT = 'support.assign';
}
